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

const AUTH_CONTROLLER = `// src/controllers/auth.controller.ts
import { Request, Response }   from 'express';
import { z }                   from 'zod';
import { asyncHandler }        from '../utils/asyncHandler';
import { AppError }            from '../utils/AppError';
import { sendSuccess }         from '../utils/response';
import { User }                from '../models/User';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';

// --- Zod schemas ---
const RegisterSchema = z.object({
  name:     z.string().min(2).max(50),
  email:    z.string().email(),
  password: z.string().min(8),
});

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge:   7 * 24 * 60 * 60 * 1000,
  path:     '/api/auth/refresh',
};

// --- Register ---
export const register = asyncHandler(async (req: Request, res: Response) => {
  const body = RegisterSchema.parse(req.body);      // zod validate + parse
  const exists = await User.findOne({ email: body.email });
  if (exists) throw new AppError('Email đã được sử dụng', 409);

  const user   = await User.create(body);
  const tokens = generateTokenPair(user._id.toString(), user.role);

  res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTS);
  sendSuccess(res, {
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken: tokens.accessToken,
  }, 201);
});

// --- Login ---
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = LoginSchema.parse(req.body);
  const user = await User.findByEmail(email); // static method, includes password
  if (!user || !(await user.comparePassword(password)))
    throw new AppError('Email hoặc mật khẩu không đúng', 401);

  const tokens = generateTokenPair(user._id.toString(), user.role);
  res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTS);
  sendSuccess(res, {
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    accessToken: tokens.accessToken,
  });
});

// --- Refresh ---
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const rt = req.cookies?.refreshToken as string | undefined;
  if (!rt) throw new AppError('Không có refresh token', 401);
  const { userId } = verifyRefreshToken(rt);
  const user = await User.findById(userId);
  if (!user) throw new AppError('User không tồn tại', 401);
  const tokens = generateTokenPair(user._id.toString(), user.role);
  res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTS);
  sendSuccess(res, { accessToken: tokens.accessToken });
});

// --- Logout ---
export const logout = (_req: Request, res: Response) => {
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
  sendSuccess(res, null, 200);
};

// --- Get me ---
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, req.user);  // req.user injected bởi authenticate middleware
});`;

const AUTH_ROUTES = `// src/routes/auth.routes.ts
import { Router }        from 'express';
import { authenticate }  from '../middleware/authenticate';
import { register, login, refresh, logout, getMe } from '../controllers/auth.controller';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login',    login);
authRouter.post('/refresh',  refresh);
authRouter.post('/logout',   logout);
authRouter.get ('/me',       authenticate, getMe);`;

const MIDDLEWARE = `// src/middleware/authenticate.ts
import { RequestHandler }        from 'express';
import { asyncHandler }          from '../utils/asyncHandler';
import { verifyAccessToken }     from '../utils/jwt';
import { User }                  from '../models/User';
import { AppError }              from '../utils/AppError';

export const authenticate: RequestHandler = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    throw new AppError('Cần Bearer token trong Authorization header', 401);

  const token = authHeader.split(' ')[1];
  const { userId } = verifyAccessToken(token);  // throw nếu expired/invalid

  const user = await User.findById(userId).select('-password');
  if (!user)    throw new AppError('User không tồn tại', 401);
  if (!user.isActive) throw new AppError('Tài khoản đã bị vô hiệu hóa', 403);

  req.user = user;  // TypeScript OK — express.d.ts đã extend Request
  next();
});

// src/middleware/requireRole.ts
import { RequestHandler } from 'express';
import { AppError }       from '../utils/AppError';

type UserRole = 'user' | 'admin';

export const requireRole =
  (...roles: UserRole[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) throw new AppError('Chưa xác thực', 401);
    if (!roles.includes(req.user.role as UserRole))
      throw new AppError(\`Cần quyền: \${roles.join(' hoặc ')}\`, 403);
    next();
  };

// src/types/express.d.ts — extend Express Request
import { IUser } from './index';
import { Document } from 'mongoose';

declare global {
  namespace Express {
    interface Request {
      user?: IUser & Document;
    }
  }
}`;

export default function Lesson03({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-07-03"
      num="03"
      title="Auth Module"
      desc="Register, login, refresh, logout controllers + authenticate + requireRole middleware"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Auth module là foundation của toàn bộ API — mọi protected route đều phụ thuộc vào nó. Cấu
        trúc gồm 3 lớp: <strong>controllers</strong> (request/response logic),{' '}
        <strong>middleware</strong> (authenticate inject req.user, requireRole check quyền), và{' '}
        <strong>utils</strong> (JWT sign/verify, token pair generation). TypeScript giúp đảm bảo
        req.user luôn được type đúng ở mọi protected route.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'POST /auth/register: zod parse → check email trùng → User.create() → generateTokenPair',
            'Refresh token lưu trong httpOnly cookie (path: /auth/refresh), access token trả response',
            'POST /auth/login: zod parse → User.findByEmail() → comparePassword → tokens',
            'GET /auth/me: authenticate middleware → verify token → User.findById → req.user → trả user',
            'POST /auth/refresh: lấy cookie → verifyRefreshToken → tìm user → cấp token pair mới',
            'authenticate middleware: extract Bearer token → verify → findById → inject req.user → next()',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: 'Auth Controller .ts', code: AUTH_CONTROLLER },
            { label: 'Auth Routes .ts', code: AUTH_ROUTES },
            { label: 'Middleware .ts', code: MIDDLEWARE },
          ]}
        />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable
          rows={[
            {
              line: '1',
              explanation:
                'RegisterSchema.parse(req.body): zod parse throw ZodError nếu validation fail. asyncHandler catch ZodError → next(err) → error middleware format lỗi. Không cần try/catch trong controller — asyncHandler xử lý tất cả.',
            },
            {
              line: '2',
              explanation:
                'User.findByEmail(email): static method đã khai báo trong UserModel interface. TypeScript biết method này tồn tại và return type là Promise<(IUser & Document) | null>. Select("+password") bật lại field bị hidden.',
            },
            {
              line: '3',
              explanation:
                'COOKIE_OPTS.path: "/api/auth/refresh" — cookie chỉ được gửi lên endpoint /refresh, không gửi lên mọi request. Giảm exposure của refresh token. Nếu bỏ path, browser gửi kèm mọi request → không cần thiết.',
            },
            {
              line: '4',
              explanation:
                'req.user = user: hoạt động vì express.d.ts đã extend Express.Request với user?: IUser & Document. TypeScript không báo lỗi. Các route sau authenticate có thể dùng req.user! (non-null assertion) vì middleware đã đảm bảo.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Không dùng <code>app.use(cookieParser())</code> trước auth routes →{' '}
          <code>req.cookies</code> luôn là <code>undefined</code>. Refresh token trong cookie sẽ
          không đọc được. Thêm <code>import cookieParser from 'cookie-parser'</code> vào{' '}
          <code>app.ts</code> trước khi mount routes.
        </Callout>
        <Callout type="note">
          <strong>Timing attack</strong>: Luôn dùng <code>bcrypt.compare()</code> dù user không tồn
          tại. Đừng return sớm với "user not found" — attacker có thể đo thời gian response để biết
          email có tồn tại không. Thay vào đó: nếu user null, compare với dummy hash rồi throw cùng
          error message chung.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Implement đầy đủ auth module: register, login, refresh, logout, getMe. Test bằng Thunder Client hoặc Bruno: register → copy accessToken → GET /auth/me với Bearer header → nhận user info.',
            },
            {
              level: 'medium',
              text: 'Thêm rate limiting riêng cho auth routes: max 5 requests/15 phút cho POST /login. Dùng express-rate-limit với keyGenerator theo IP + email body. Test: gọi /login sai password 6 lần → nhận 429 Too Many Requests.',
            },
            {
              level: 'hard',
              text: 'Implement token rotation: lưu refresh token hash trong DB (RefreshToken collection). Khi POST /refresh thành công → xóa token cũ + tạo mới. Nếu dùng refresh token đã bị revoke → ban toàn bộ sessions của user (detect replay attack).',
            },
          ]}
          hint="authenticate middleware nên select('-password') để đảm bảo password không bao giờ lọt vào req.user. Nhưng User.findByEmail() cần select('+password') vì login phải compare password. Hai query khác nhau, purpose khác nhau."
        />
      </Sec>
    </LessonCard>
  );
}
