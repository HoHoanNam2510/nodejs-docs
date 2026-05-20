import CodeBlock from '../../components/CodeBlock';
import Callout from '../../components/Callout';

const AUTH_TYPES = `// src/types/auth.ts — tất cả auth-related types

interface JwtPayload {
  userId: string;
  role:   'user' | 'admin';
  iat?:   number;
  exp?:   number;
}

interface TokenPair {
  accessToken:  string;
  refreshToken: string;
}

// src/types/express.d.ts — extend Request
import { IUser } from '../models/User';
declare global {
  namespace Express {
    interface Request { user?: IUser }
  }
}`;

const AUTH_UTILS = `// src/utils/jwt.ts
import jwt, { Secret, SignOptions, TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';
import { AppError } from './AppError';

interface JwtPayload { userId: string; role: 'user' | 'admin'; iat?: number; exp?: number }

const ACCESS_SECRET  = process.env.JWT_SECRET as Secret;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as Secret;

export const signAccessToken  = (p: Omit<JwtPayload, 'iat' | 'exp'>) =>
  jwt.sign(p, ACCESS_SECRET,  { expiresIn: '15m' } as SignOptions);

export const signRefreshToken = (p: Omit<JwtPayload, 'iat' | 'exp'>) =>
  jwt.sign(p, REFRESH_SECRET, { expiresIn: '7d'  } as SignOptions);

export const verifyAccessToken = (token: string): JwtPayload => {
  try { return jwt.verify(token, ACCESS_SECRET) as JwtPayload; }
  catch (e) {
    if (e instanceof TokenExpiredError) throw new AppError('Token hết hạn', 401);
    if (e instanceof JsonWebTokenError) throw new AppError('Token không hợp lệ', 401);
    throw e;
  }
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  try { return jwt.verify(token, REFRESH_SECRET) as JwtPayload; }
  catch   { throw new AppError('Refresh token không hợp lệ', 401); }
};

export const generateTokenPair = (userId: string, role: 'user' | 'admin'): TokenPair => ({
  accessToken:  signAccessToken({ userId, role }),
  refreshToken: signRefreshToken({ userId, role }),
});`;

const MIDDLEWARE_CODE = `// src/middleware/authenticate.ts
import { RequestHandler } from 'express';
import { asyncHandler }    from '../utils/asyncHandler';
import { verifyAccessToken } from '../utils/jwt';
import { User }            from '../models/User';
import { AppError }        from '../utils/AppError';

export const authenticate: RequestHandler = asyncHandler(async (req, _res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new AppError('Cần Bearer token', 401);
  const { userId } = verifyAccessToken(token);
  const user = await User.findById(userId).select('-password');
  if (!user) throw new AppError('User không tồn tại', 401);
  req.user = user;
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
      throw new AppError('Không có quyền', 403);
    next();
  };`;

const CONTROLLER_CODE = `// src/controllers/auth.controller.ts — đầy đủ register, login, refresh, logout

import { z }           from 'zod';
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { User }         from '../models/User';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt';
import { AppError }     from '../utils/AppError';

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
  path:     '/auth/refresh',
};

// --- Register ---
export const register = asyncHandler(async (req: Request, res: Response) => {
  const body = RegisterSchema.parse(req.body);
  if (await User.findOne({ email: body.email }))
    throw new AppError('Email đã tồn tại', 409);
  const user   = await User.create(body);
  const tokens = generateTokenPair(user._id.toString(), user.role);
  res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTS);
  res.status(201).json({
    success: true,
    data: { user: { _id: user._id, name: user.name, email: user.email, role: user.role },
            accessToken: tokens.accessToken },
  });
});

// --- Login ---
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = LoginSchema.parse(req.body);
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await user.comparePassword(password)))
    throw new AppError('Email hoặc mật khẩu không đúng', 401);
  const tokens = generateTokenPair(user._id.toString(), user.role);
  res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTS);
  res.json({
    success: true,
    data: { user: { _id: user._id, name: user.name, email: user.email, role: user.role },
            accessToken: tokens.accessToken },
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
  res.json({ success: true, data: { accessToken: tokens.accessToken } });
});

// --- Logout ---
export const logout = (_req: Request, res: Response) => {
  res.clearCookie('refreshToken', { path: '/auth/refresh' });
  res.json({ success: true, message: 'Đăng xuất thành công' });
};`;

const ROUTES_CODE = `// src/routes/auth.routes.ts
import { Router }    from 'express';
import { authenticate } from '../middleware/authenticate';
import { register, login, refresh, logout, getMe } from '../controllers/auth.controller';

export const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login',    login);
authRouter.post('/refresh',  refresh);
authRouter.post('/logout',   logout);
authRouter.get ('/me',       authenticate, getMe); // protected

// src/app.ts — security stack đầy đủ
import helmet        from 'helmet';
import cors          from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit     from 'express-rate-limit';

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use('/auth', authRouter);`;

export default function ProjectSection() {
  return (
    <div style={{ marginTop: '3rem' }}>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text3)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '1rem',
          paddingBottom: 8,
          borderBottom: '1px solid var(--border)',
        }}
      >
        Project cuối module
      </div>

      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              background: '#f8717115',
              color: '#f87171',
              border: '1px solid #f8717130',
              borderRadius: 4,
              padding: '2px 8px',
            }}
          >
            HIGH
          </div>
          <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Auth Layer hoàn chỉnh cho Blog API</h3>
        </div>

        <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.6, marginBottom: '1rem' }}>
          Xây dựng auth layer đầy đủ tích hợp vào Blog API từ Module 04: register, login, refresh
          token, logout, protect routes với typed middleware, RBAC, và security stack.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginBottom: '1.5rem',
          }}
        >
          {[
            {
              label: 'POST /auth/register',
              desc: 'zod validate → check email trùng → create user → token pair',
            },
            {
              label: 'POST /auth/login',
              desc: 'validate → findOne + select("+password") → comparePassword → tokens',
            },
            {
              label: 'POST /auth/refresh',
              desc: 'verify refresh token cookie → issue new access token',
            },
            { label: 'POST /auth/logout', desc: 'clear refresh token cookie' },
            {
              label: 'GET  /auth/me',
              desc: 'authenticate middleware → trả req.user (không có password)',
            },
            {
              label: 'Admin routes',
              desc: 'authenticate + requireRole("admin") → protected endpoints',
            },
          ].map(item => (
            <div
              key={item.label}
              style={{
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '0.75rem 1rem',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--accent)',
                  marginBottom: 4,
                }}
              >
                {item.label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>

        {[
          { title: 'Types & JWT utils', code: AUTH_TYPES + '\n\n' + AUTH_UTILS },
          { title: 'Middleware (authenticate + requireRole)', code: MIDDLEWARE_CODE },
          { title: 'Controllers (register, login, refresh, logout)', code: CONTROLLER_CODE },
          { title: 'Routes & App setup', code: ROUTES_CODE },
        ].map(({ title, code }) => (
          <div key={title} style={{ marginBottom: '1.25rem' }}>
            <div
              style={{
                fontSize: 11,
                color: 'var(--text3)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '0.5rem',
              }}
            >
              {title}
            </div>
            <CodeBlock code={code} />
          </div>
        ))}

        <Callout type="note">
          <strong>TypeScript checklist:</strong> JwtPayload interface typed với iat/exp optional.
          generateTokenPair trả TokenPair interface. authenticate middleware inject req.user: IUser
          (Declaration Merging). requireRole nhận UserRole literal union — compile error nếu truyền
          role không hợp lệ. Tất cả req.body đều qua zod parse. Không có <code>any</code> type
          untyped trong production code.
        </Callout>

        <div style={{ marginTop: '1rem' }}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text3)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.5rem',
            }}
          >
            Mở rộng (tự làm thêm)
          </div>
          <ul
            style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.8, paddingLeft: '1.2rem' }}
          >
            <li>Lưu refresh token trong DB (RefreshToken model) để có thể revoke</li>
            <li>Token rotation: mỗi refresh xóa token cũ, cấp token mới</li>
            <li>Forgot password: gửi email với reset token (nodemailer + crypto.randomBytes)</li>
            <li>Google OAuth với passport.js — social login cho Blog API</li>
            <li>Rate limit riêng cho auth: 5 login attempts/15 phút per IP</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
