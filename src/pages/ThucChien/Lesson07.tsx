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

const UTILS = `// src/utils/AppError.ts — custom error class
export class AppError extends Error {
  constructor(
    public override message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true  // operational errors: 4xx
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// src/utils/asyncHandler.ts — wrap async route handlers
import { RequestHandler, Request, Response, NextFunction } from 'express';

export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
// Promise.resolve: handle cả sync throws và async rejects
// .catch(next): pass error tới Express error middleware

// src/utils/response.ts — chuẩn hóa response format
import { Response } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  data?:   T;
  message?: string;
  error?:  string;
  meta?:   Record<string, unknown>;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: Record<string, unknown>
): void => {
  res.status(statusCode).json({
    success: true,
    data,
    ...(meta && { meta }),
  } satisfies ApiResponse<T>);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500
): void => {
  res.status(statusCode).json({
    success: false,
    error: message,
  } satisfies ApiResponse<never>);
};`;

const ERROR_MIDDLEWARE = `// src/middleware/errorHandler.ts — 4-parameter error middleware
import { ErrorRequestHandler } from 'express';
import { ZodError }            from 'zod';
import { AppError }            from '../utils/AppError';

interface ErrorResponse {
  success: false;
  error:   string;
  errors?: string[];  // validation errors từ zod
  stack?:  string;    // chỉ hiển thị ở development
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // --- Zod validation error ---
  if (err instanceof ZodError) {
    const messages = err.errors.map(e => \`\${e.path.join('.')}: \${e.message}\`);
    const response: ErrorResponse = { success: false, error: 'Dữ liệu không hợp lệ', errors: messages };
    return res.status(400).json(response);
  }

  // --- Mongoose duplicate key (E11000) ---
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      error: \`\${field} đã tồn tại\`,
    });
  }

  // --- Mongoose validation error ---
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors as Record<string, { message: string }>)
      .map(e => e.message);
    return res.status(400).json({ success: false, error: messages.join(', ') });
  }

  // --- Mongoose CastError (invalid ObjectId) ---
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, error: 'ID không hợp lệ' });
  }

  // --- Custom AppError ---
  if (err instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      error:   err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    };
    return res.status(err.statusCode).json(response);
  }

  // --- Unknown error ---
  console.error('UNHANDLED ERROR:', err);
  const response: ErrorResponse = {
    success: false,
    error:   process.env.NODE_ENV === 'production' ? 'Đã có lỗi xảy ra' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  };
  return res.status(500).json(response);
};`;

const APP_SETUP = `// src/app.ts — Express setup với đầy đủ middleware stack
import express, { Express, Request, Response } from 'express';
import helmet        from 'helmet';
import cors          from 'cors';
import rateLimit     from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser  from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler';
import { authRouter }   from './routes/auth.routes';
import { postRouter }   from './routes/post.routes';
import { adminRouter }  from './routes/admin.routes';
import config           from './config/env';

const app: Express = express();

// --- Security middleware (order matters!) ---
app.use(helmet());   // set security headers
app.use(cors({
  origin:      config.clientUrl,
  credentials: true,  // allow cookies
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 phút
  max:      100,              // 100 requests/window
  standardHeaders: true,
  legacyHeaders: false,
}));

// --- Parsing ---
app.use(express.json({ limit: '10kb' }));      // body size limit
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(mongoSanitize());  // prevent NoSQL injection

// --- Routes ---
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api/auth',  authRouter);
app.use('/api/posts', postRouter);
app.use('/api/admin', adminRouter);

// --- 404 handler ---
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Route không tồn tại' });
});

// --- Error handler (phải ở cuối cùng!) ---
app.use(errorHandler);

export default app;

// src/index.ts — server start
import mongoose from 'mongoose';
import app      from './app';

async function main() {
  await mongoose.connect(config.mongoUri);
  console.log('MongoDB connected');

  app.listen(config.port, () => {
    console.log(\`Server running on port \${config.port} [\${config.nodeEnv}]\`);
  });
}

main().catch(console.error);`;

export default function Lesson07({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-07-07"
      num="07"
      title="Error Handling & Response Format Nhất Quán"
      desc="asyncHandler + AppError + errorHandler middleware + ApiResponse<T> — pattern xuyên suốt"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Một API production cần <strong>response format nhất quán</strong>: client không bao giờ nhận
        HTML error page hay raw error objects. Ba thành phần cốt lõi: <code>asyncHandler</code> —
        wrap mọi async handler, pass errors tới Express error middleware. <code>AppError</code> —
        custom error class với statusCode. <code>errorHandler</code> — 4-param Express middleware,
        phân loại và format mọi loại lỗi. Kết hợp với <code>ApiResponse&lt;T&gt;</code> generic
        interface đảm bảo mọi response đều có <code>success: boolean</code>.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Route handler: asyncHandler(async (req, res, next) => { ... throw new AppError(...) })',
            'asyncHandler: Promise.resolve(fn()).catch(next) → pass error tới Express',
            'Error middleware (4 params): (err, req, res, next) — Express nhận dạng bởi 4 params',
            'errorHandler: phân loại ZodError, E11000, CastError, AppError, unknown',
            'Mọi error response: { success: false, error: string, errors?: string[] }',
            'Mọi success response: sendSuccess(res, data) → { success: true, data: T }',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: 'AppError + asyncHandler + response .ts', code: UTILS },
            { label: 'Error Middleware .ts', code: ERROR_MIDDLEWARE },
            { label: 'app.ts + index.ts', code: APP_SETUP },
          ]}
        />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable
          rows={[
            {
              line: '1',
              explanation:
                'asyncHandler wrap fn rồi .catch(next): khi fn() throw (hoặc Promise reject), error được pass tới Express error middleware qua next(err). Không cần try/catch trong mọi route handler — asyncHandler lo hết. Giảm boilerplate đáng kể.',
            },
            {
              line: '2',
              explanation:
                'errorHandler phải là hàm 4 params để Express nhận dạng là error middleware. Nếu viết 3 params, Express không gọi nó cho errors. Tên params không quan trọng nhưng phải đúng số lượng: (err, req, res, next).',
            },
            {
              line: '3',
              explanation:
                'err.code === 11000: Mongoose duplicate key error không phải AppError — là DB-level error. Phải handle riêng. keyValue chứa field + value bị duplicate. format: { keyValue: { email: "test@test.com" } }.',
            },
            {
              line: '4',
              explanation:
                'satisfies ApiResponse<T>: TypeScript check object literal khớp với interface nhưng không widen type. Khác với "as ApiResponse<T>" (cast, bỏ qua errors). satisfies = type check + preserve literal types.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          <code>app.use(errorHandler)</code> phải ở sau tất cả routes — Express chạy middleware theo
          thứ tự. Nếu đặt trước routes, errorHandler không bắt được errors từ các routes đó. Thứ tự
          đúng: security middleware → parse → routes → 404 handler → error handler.
        </Callout>
        <Callout type="note">
          <strong>Production error leaking</strong>: Luôn check{' '}
          <code>NODE_ENV === 'production'</code> trước khi trả <code>stack</code> trong response.
          Stack trace lộ file paths, line numbers — thông tin nhạy cảm cho attacker. Ở production:
          trả message chung "Đã có lỗi xảy ra" cho unknown errors, log chi tiết lên server
          (Winston/Pino).
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Implement AppError, asyncHandler, errorHandler, sendSuccess/sendError. Test: tạo route throw new AppError("Test error", 422) → verify response { success: false, error: "Test error" } với status 422.',
            },
            {
              level: 'medium',
              text: 'Thêm request logging middleware: log method, url, statusCode, response time (ms) sau khi response. Dùng res.on("finish") event. Format: [GET] /api/posts 200 45ms. Test với các endpoints khác nhau.',
            },
            {
              level: 'hard',
              text: 'Integrate Winston logger: thay console.error bằng logger.error trong errorHandler. Log errors với context: { error: err.message, stack, url, method, userId: req.user?._id }. Tạo 2 transports: file (errors.log) và console (development only).',
            },
          ]}
          hint="ZodError phải catch trước AppError vì ZodError extends Error (không phải AppError). Thứ tự if-else trong errorHandler quan trọng: instanceof ZodError → Mongoose errors (code 11000, name) → instanceof AppError → unknown."
        />
      </Sec>
    </LessonCard>
  );
}
