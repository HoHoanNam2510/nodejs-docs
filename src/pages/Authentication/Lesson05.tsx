import LessonCard from '../../components/LessonCard';
import CodeTabs from '../../components/CodeTabs';
import LineTable from '../../components/LineTable';
import ExerciseSection from '../../components/ExerciseSection';
import Callout from '../../components/Callout';
import { Sec, Flow } from './_helpers';

interface Props {
  isDone: boolean;
  onToggleDone: () => void;
}

const BASIC = `import { z } from 'zod';
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { User } from '../models/User';
import { signAccessToken, signRefreshToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1, 'Mật khẩu không được để trống'),
});

type LoginInput = z.infer<typeof LoginSchema>;

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: LoginInput = LoginSchema.parse(req.body);

  // 1. Tìm user theo email — phải lấy kèm password (mặc định hidden)
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) throw new AppError('Email hoặc mật khẩu không đúng', 401);
  // ⚠️ Không nói "Email không tồn tại" — tránh user enumeration

  // 2. Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError('Email hoặc mật khẩu không đúng', 401);
  // Cùng message khi email sai và password sai — security best practice

  // 3. Tạo token pair
  const payload = { userId: user._id.toString(), role: user.role };
  const accessToken  = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // 4. Response
  res.json({
    success: true,
    data: {
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    },
  });
});`;

const REAL = `// src/controllers/auth.controller.ts — login với cookie + brute force protection

import rateLimit from 'express-rate-limit';
import { Router } from 'express';

// --- Rate limiter riêng cho auth endpoints ---
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max:      10,              // 10 requests per IP
  message:  { success: false, error: 'Quá nhiều lần thử. Thử lại sau 15 phút.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// --- Login với httpOnly cookie ---
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password }: LoginInput = LoginSchema.parse(req.body);

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) throw new AppError('Email hoặc mật khẩu không đúng', 401);

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError('Email hoặc mật khẩu không đúng', 401);

  const payload      = { userId: user._id.toString(), role: user.role };
  const accessToken  = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Lưu refresh token trong httpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   7 * 24 * 60 * 60 * 1000, // 7 ngày (ms)
    path:     '/auth/refresh',          // chỉ gửi đến /auth/refresh
  });

  // Access token trả trong response body (SPA lưu trong memory)
  res.json({
    success: true,
    data: {
      user:        { _id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken, // ngắn hạn — client lưu trong memory (biến JS)
    },
  });
});

// --- Route ---
authRouter.post('/login', authLimiter, validateBody(LoginSchema), login);`;

const MISTAKE = `// ❌ Sai lầm 1: Khác biệt error message giữa email sai và password sai
if (!user) throw new AppError('Email không tồn tại', 401); // tiết lộ user existence!
if (!isMatch) throw new AppError('Mật khẩu sai', 401);
// Attacker biết email nào đã đăng ký → brute force password

// ✅ Cùng 1 message cho cả 2 trường hợp
if (!user || !isMatch) throw new AppError('Email hoặc mật khẩu không đúng', 401);

// ❌ Sai lầm 2: Timing attack — check user trước, check password sau
if (!user) return res.status(401)...;
// Attacker đo thời gian response: email sai phản hồi nhanh hơn (bỏ qua bcrypt.compare)
// → biết email có tồn tại hay không dù error message giống nhau

// ✅ Luôn chạy bcrypt.compare dù user null
const dummyHash = '$2b$10$dummyhashtopreventtimingattacksxxxxxxxxxxxx';
const hash = user ? user.password : dummyHash;
const isMatch = await bcrypt.compare(password, hash);
if (!user || !isMatch) throw new AppError('Email hoặc mật khẩu không đúng', 401);

// ❌ Sai lầm 3: Không dùng .select('+password') khi schema set select: false
// src/models/User.ts
const userSchema = new Schema<IUser>({
  password: { type: String, select: false }, // ẩn password mặc định
});

// Controller:
const user = await User.findOne({ email }); // password = undefined!
await user.comparePassword(password); // TypeError: this.password is undefined

// ✅ Thêm .select('+password') khi cần
const user = await User.findOne({ email }).select('+password');`;

export default function Lesson05({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-06-05"
      num="05"
      title="Đăng nhập — Login Flow"
      desc="LoginSchema, findOne + comparePassword, timing attack prevention, httpOnly cookie vs body"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Login flow đơn giản hơn register nhưng có nhiều security pitfalls. 2 điểm quan trọng nhất:
        (1) <strong>user enumeration</strong> — đừng khác biệt error message giữa "email không tồn
        tại" và "password sai" vì attacker có thể dùng để discover valid emails; (2){' '}
        <strong>timing attack</strong> — thời gian xử lý request phải đồng đều dù email có tồn tại
        hay không (bcrypt.compare() phải luôn chạy). Ngoài ra, cần quyết định lưu token ở đâu:
        httpOnly cookie (an toàn hơn, chống XSS) vs localStorage (dễ implement hơn, nhưng XSS dễ
        đánh cắp).
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'POST /auth/login — body: { email, password }',
            'LoginSchema.parse(req.body) — validate input',
            'User.findOne({ email }).select("+password") — lấy user kèm password hash',
            'user.comparePassword(password) — bcrypt.compare() — async, ~100ms',
            'Nếu user null HOẶC isMatch false → throw AppError("Email hoặc mật khẩu không đúng", 401)',
            'Tạo accessToken + refreshToken → trả response (refresh token vào httpOnly cookie)',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: 'Cơ bản .ts', code: BASIC },
            { label: 'Thực tế .ts', code: REAL },
            { label: 'Sai lầm .ts', code: MISTAKE },
          ]}
        />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable
          rows={[
            {
              line: '1',
              explanation:
                'User.findOne({ email }).select("+password"): nếu User schema định nghĩa password với select: false (mặc định ẩn), phải explicit .select("+password") khi cần. Làm password ẩn mặc định → không vô tình trả trong response.',
            },
            {
              line: '2',
              explanation:
                '"Email hoặc mật khẩu không đúng" — cùng message cho cả hai case. Không nói "Email không tồn tại" hay "Mật khẩu sai". Ngăn user enumeration attack: attacker gửi 1000 emails → không thể biết cái nào hợp lệ.',
            },
            {
              line: '3',
              explanation:
                'res.cookie("refreshToken", token, { httpOnly: true }): browser tự gửi cookie kèm mọi request đến path tương ứng. JavaScript không đọc được httpOnly cookie → chống XSS. sameSite: strict → chống CSRF.',
            },
            {
              line: '4',
              explanation:
                'authLimiter: rate limit 10 requests/15 phút per IP. Ngăn brute force password. Mount riêng trên auth routes — không ảnh hưởng các route khác. express-rate-limit v7 có built-in TypeScript types.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          <strong>Timing attack</strong>: nếu <code>User.findOne()</code> không tìm thấy user và bạn
          trả lỗi ngay mà không chạy <code>bcrypt.compare()</code>, response nhanh hơn ~100ms so với
          khi email đúng. Attacker đo thời gian → biết email tồn tại. Fix: luôn chạy{' '}
          <code>bcrypt.compare()</code> dù user không tồn tại (compare với dummy hash).
        </Callout>
        <Callout type="note">
          Nên lưu refresh token ở đâu? <strong>httpOnly cookie</strong>: browser tự manage, không bị
          XSS đọc. Nhược điểm: CORS cần <code>credentials: 'include'</code>, cần cấu hình sameSite
          cẩn thận. <strong>Response body</strong>: client tự lưu (memory hoặc localStorage), dễ
          implement nhưng cần cẩn thận XSS với localStorage.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Implement POST /auth/login: validate với zod → findOne + select("+password") → comparePassword → signToken → response. Test với Postman: đúng credentials → 200 + token; sai password → 401; email không tồn tại → 401 (cùng message).',
            },
            {
              level: 'medium',
              text: 'Thêm rate limiting 5 attempts/15 phút cho /auth/login. Dùng express-rate-limit. Test: gửi 6 requests liên tiếp → lần 6 nhận 429 Too Many Requests với message phù hợp.',
            },
            {
              level: 'hard',
              text: 'Implement secure login: refresh token trong httpOnly cookie (path: /auth/refresh), access token trong response body. Implement POST /auth/refresh: đọc cookie → verify → issue new access token. Implement POST /auth/logout: clear cookie. Test full cycle với Postman collection.',
            },
          ]}
          hint="User schema với select: false trên password field: password: { type: String, required: true, select: false }. Sau đó mọi User.find() không trả password, phải explicit .select('+password') khi cần compare."
        />
      </Sec>
    </LessonCard>
  );
}
