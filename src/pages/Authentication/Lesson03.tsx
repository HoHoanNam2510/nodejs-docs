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

const BASIC = `import jwt, { Secret, SignOptions, JwtPayload as JwtBasePayload } from 'jsonwebtoken';

// --- Định nghĩa shape của JWT payload ---
interface JwtPayload {
  userId: string;
  role:   'user' | 'admin';
  iat?:   number; // issued at — tự thêm bởi jwt.sign()
  exp?:   number; // expiration — tự tính từ expiresIn
}

const JWT_SECRET = process.env.JWT_SECRET as Secret;

// --- Tạo token ---
export const signToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' } as SignOptions);

// --- Verify token ---
export const verifyToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
  return decoded;
};

// Dùng:
const token = signToken({ userId: user._id.toString(), role: user.role });
// 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI2NjAi...'

const payload = verifyToken(token);
// { userId: '660', role: 'user', iat: 1710000000, exp: 1710000900 }`;

const REAL = `// src/utils/jwt.ts — full implementation

import jwt, { Secret, SignOptions, JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AppError } from './AppError';

export interface JwtPayload {
  userId: string;
  role:   'user' | 'admin';
  iat?:   number;
  exp?:   number;
}

const SECRET = process.env.JWT_SECRET as Secret;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as Secret;

// --- Sign access token (15 phút) ---
export const signAccessToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string =>
  jwt.sign(payload, SECRET, { expiresIn: '15m' } as SignOptions);

// --- Sign refresh token (7 ngày) ---
export const signRefreshToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' } as SignOptions);

// --- Verify access token với error handling ---
export const verifyAccessToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, SECRET) as JwtPayload;
  } catch (err) {
    // Phân biệt 2 loại error để trả message phù hợp
    if (err instanceof TokenExpiredError) {
      throw new AppError('Token đã hết hạn', 401);
    }
    if (err instanceof JsonWebTokenError) {
      throw new AppError('Token không hợp lệ', 401);
    }
    throw err;
  }
};

// --- Verify refresh token ---
export const verifyRefreshToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
  } catch {
    throw new AppError('Refresh token không hợp lệ hoặc đã hết hạn', 401);
  }
};

// --- Decode không verify (đọc payload của expired token) ---
export const decodeToken = (token: string): JwtPayload | null =>
  jwt.decode(token) as JwtPayload | null;`;

const MISTAKE = `// ❌ Sai lầm 1: Không type JwtPayload — dùng 'any' hoặc cast sai
const decoded: any = jwt.verify(token, secret);
const userId = decoded.userId; // any — không có type safety

// ✅ Define interface và cast đúng
interface JwtPayload { userId: string; role: 'user' | 'admin' }
const decoded = jwt.verify(token, secret) as JwtPayload;
const userId: string = decoded.userId; // typed!

// ❌ Sai lầm 2: Không handle TokenExpiredError riêng
try {
  const payload = jwt.verify(token, secret);
} catch (err) {
  res.status(401).json({ error: 'Token lỗi' }); // message không rõ
}

// ✅ Phân biệt expired vs invalid để client xử lý đúng
} catch (err) {
  if (err instanceof TokenExpiredError) {
    // Client nên dùng refresh token để lấy access token mới
    return res.status(401).json({ error: 'TOKEN_EXPIRED' });
  }
  return res.status(401).json({ error: 'TOKEN_INVALID' });
}

// ❌ Sai lầm 3: Dùng cùng 1 secret cho access và refresh token
const ACCESS_SECRET  = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.JWT_SECRET!; // dùng chung — nguy hiểm!
// Nếu attacker có refresh token → có thể dùng như access token

// ✅ Dùng 2 secrets riêng biệt
const ACCESS_SECRET  = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

// ❌ Sai lầm 4: Lưu sensitive data trong payload
jwt.sign({ userId, password: hashedPassword }, secret); // không cần thiết, tăng token size

// ✅ Chỉ lưu minimum info cần thiết để identify user
jwt.sign({ userId: user._id.toString(), role: user.role }, secret);`;

export default function Lesson03({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-06-03"
      num="03"
      title="JWT với typed payload"
      desc="JwtPayload interface, signToken/verifyToken typed, TokenExpiredError vs JsonWebTokenError"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        JWT (JSON Web Token) là chuẩn mở (RFC 7519) để truyền thông tin an toàn giữa client và
        server. Gồm 3 phần: <code>header.payload.signature</code>. Header chứa algorithm (HS256),
        payload chứa claims (userId, role, exp...), signature là HMAC của header + payload với
        secret key. Verify: server re-compute signature và so sánh — nếu khớp → token hợp lệ và
        không bị tamper. TypeScript giúp type-safe payload — biết chính xác payload chứa gì.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'jwt.sign({ userId, role }, SECRET, { expiresIn: "15m" }) → tạo JWT string',
            'JWT được gửi về client (header Authorization: Bearer <token> hoặc httpOnly cookie)',
            'Client gửi request tiếp theo kèm JWT',
            'Server: extract token → jwt.verify(token, SECRET) → trả payload hoặc throw error',
            'TokenExpiredError: token hết hạn → client dùng refresh token',
            'JsonWebTokenError: token giả mạo hoặc sai format → từ chối ngay',
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
                'interface JwtPayload: định nghĩa shape của token payload. iat (issued at) và exp (expiration) là optional — jwt.sign() tự thêm khi gọi. Dùng Omit<JwtPayload, "iat" | "exp"> trong signToken để không bắt caller truyền 2 field này.',
            },
            {
              line: '2',
              explanation:
                'process.env.JWT_SECRET as Secret: Secret type từ jsonwebtoken = string | Buffer. Cast cần thiết vì process.env trả string | undefined. Tốt hơn: validate env vars khi app start và throw nếu thiếu.',
            },
            {
              line: '3',
              explanation:
                'jwt.verify(token, SECRET) as JwtPayload: verify() trả JwtPayload | string — cần cast. Verify thực hiện 2 việc: (1) check signature hợp lệ, (2) check exp chưa quá hạn. Nếu 1 trong 2 fail → throw error.',
            },
            {
              line: '4',
              explanation:
                'TokenExpiredError vs JsonWebTokenError: 2 subclass khác nhau của jwt errors. Phân biệt để trả error code phù hợp — client biết khi nào cần refresh vs khi nào cần login lại.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          JWT payload không được encrypt — chỉ được encode (base64). Bất kỳ ai có token đều decode
          được payload bằng <code>jwt.decode()</code> (không cần secret). Không bao giờ lưu
          sensitive info (password, credit card...) trong payload. Chỉ lưu userId, role.
        </Callout>
        <Callout type="note">
          <code>expiresIn</code> có thể là string ("15m", "7d", "1h") hoặc số giây (900). JWT lưu{' '}
          <code>exp</code> là Unix timestamp — thời điểm expire. Kiểm tra token còn hạn:{' '}
          <code>payload.exp! {'>'} Date.now() / 1000</code>. Không cần gọi verify nếu chỉ cần đọc
          payload (dùng jwt.decode()).
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Viết signToken và verifyToken với JwtPayload interface. Test bằng cách sign token rồi verify. Dùng jwt.io để decode và xem payload trong browser. Confirm exp field là Unix timestamp.',
            },
            {
              level: 'medium',
              text: 'Implement verifyAccessToken với try/catch phân biệt TokenExpiredError vs JsonWebTokenError. Return { valid: true, payload } hoặc { valid: false, reason: "EXPIRED" | "INVALID" }. Test cả 3 cases: valid, expired (sign với expiresIn: "1ms"), invalid (tampered token).',
            },
            {
              level: 'hard',
              text: 'Implement token rotation: mỗi lần verify refresh token thành công → tạo refresh token mới + blacklist token cũ trong Redis (set với TTL = thời gian còn lại của token). Mục tiêu: refresh token chỉ dùng được 1 lần (rotating refresh token pattern).',
            },
          ]}
          hint="jwt.decode(token) không verify signature — chỉ decode base64 payload. Dùng để đọc exp của expired token (verify() throw trước khi trả payload). Sau khi decode, có thể tính thời gian còn lại: payload.exp * 1000 - Date.now()."
        />
      </Sec>
    </LessonCard>
  );
}
