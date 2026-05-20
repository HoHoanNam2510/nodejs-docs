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

const BASIC = `import { Request, Response, NextFunction, RequestHandler, ErrorRequestHandler } from 'express';

// ── AppError class ────────────────────────────────────────────────────────────
export class AppError extends Error {
  constructor(
    public message:    string,
    public statusCode: number = 500,
    public code?:      string
  ) {
    super(message);
    this.name = 'AppError';
    // Fix prototype chain cho class extends Error
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ── asyncHandler wrapper ──────────────────────────────────────────────────────
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

// ── Global error middleware ───────────────────────────────────────────────────
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error:   err.message,
      code:    err.code,
    });
    return;
  }
  // Fallback — unknown errors
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
             ? 'Internal Server Error'
             : (err as Error).message,
  });
};`;

const REAL = `import { RequestHandler, ErrorRequestHandler } from 'express';

// ── AppError hierarchy ────────────────────────────────────────────────────────

export class AppError extends Error {
  constructor(
    public message:    string,
    public statusCode: number = 500,
    public code?:      string
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(\`\${resource} không tìm thấy\`, 404, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Chưa đăng nhập') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Không có quyền') {
    super(message, 403, 'FORBIDDEN');
  }
}

// ── asyncHandler — loại bỏ try/catch boilerplate ──────────────────────────────
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// ── Error middleware ──────────────────────────────────────────────────────────
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // AppError: lỗi business logic có thể biết trước
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error:   err.message,
      code:    err.code,
    });
    return;
  }

  // Zod ValidationError
  if (err.name === 'ZodError') {
    res.status(400).json({ success: false, error: 'Validation failed', details: err.errors });
    return;
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    res.status(400).json({ success: false, error: err.message });
    return;
  }

  // MongoDB duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    res.status(409).json({ success: false, error: \`\${field} đã tồn tại\`, code: 'DUPLICATE_KEY' });
    return;
  }

  // Unknown — log và trả generic message
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : (err as Error).message,
  });
};

// ── Dùng trong routes ─────────────────────────────────────────────────────────
// Thay vì:
// app.get('/users/:id', async (req, res, next) => {
//   try { ... } catch(err) { next(err); }
// });
//
// Viết gọn:
// app.get('/users/:id', asyncHandler(async (req, res) => { ... }));`;

const MISTAKE = `// ❌ Sai lầm 1: Error handler chỉ có 3 tham số — Express không nhận là error handler!
app.use((err, req, res) => {                    // 3 params
  res.status(500).json({ error: err.message }); // KHÔNG BAO GIỜ được gọi
});

// ✅ Đúng: phải có đúng 4 tham số (err, req, res, next)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({ error: err.message });
});

// ❌ Sai lầm 2: Object.setPrototypeOf thiếu → instanceof check fail
class MyError extends Error {
  constructor(public code: number) { super('error'); }
  // Thiếu: Object.setPrototypeOf(this, new.target.prototype)
}
const e = new MyError(404);
e instanceof MyError; // false! (ở một số JS environments)

// ✅ Đúng
class MyError extends Error {
  constructor(public code: number) {
    super('error');
    Object.setPrototypeOf(this, new.target.prototype); // bắt buộc!
  }
}

// ❌ Sai lầm 3: Không dùng asyncHandler — unhandled promise rejection
app.get('/users', async (req, res) => {
  const users = await User.find(); // nếu MongoDB down → reject
  // Không có try/catch → express không bắt được → server crash
  res.json(users);
});

// ✅ Đúng: asyncHandler bắt tất cả
app.get('/users', asyncHandler(async (req, res) => {
  const users = await User.find(); // nếu lỗi → asyncHandler.catch(next) → errorHandler
  res.json(users);
}));`;

export default function Lesson08({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-03-08"
      num="08"
      title="Custom AppError class và asyncHandler wrapper"
      desc="Error hierarchy với TypeScript, asyncHandler loại bỏ try/catch, global error middleware"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        <code>AppError</code> là custom Error class có thêm <code>statusCode</code> và{' '}
        <code>code</code> — giúp error handler biết trả HTTP status nào. Thay vì rải{' '}
        <code>try/catch</code> khắp mọi async route, <code>asyncHandler</code> là higher-order
        function bọc handler và tự forward mọi rejected Promise đến Express error middleware qua{' '}
        <code>next(err)</code>. Kết hợp hai thứ này, mọi lỗi đều đi qua một điểm tập trung.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Route handler: throw new AppError("User not found", 404) hoặc Promise reject',
            'asyncHandler catch: .catch(next) — forward error đến Express error pipeline',
            'Express nhận err → bỏ qua tất cả regular middleware → tìm error handler (4 params)',
            'errorHandler kiểm tra err instanceof AppError → res.status(err.statusCode).json()',
            'Nếu không phải AppError → log + trả 500 (production: không lộ stack trace)',
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
                'Object.setPrototypeOf(this, new.target.prototype) — sửa prototype chain bị phá vỡ khi extend built-in Error trong TypeScript target ES5. Không có dòng này, instanceof check có thể fail.',
            },
            {
              line: '2',
              explanation:
                'asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(...)).catch(next) — curried function. Nhận handler, trả handler mới bọc Promise và catch lỗi forward qua next.',
            },
            {
              line: '3',
              explanation:
                'Promise.resolve(fn(req, res, next)) — wrap cả sync và async handler. Nếu fn là sync và throw, Promise.resolve vẫn bắt được.',
            },
            {
              line: '4',
              explanation:
                'ErrorRequestHandler — Express type cho error handler. Có 4 tham số: (err, req, res, next). Thiếu 1 tham số → Express không nhận là error handler.',
            },
            {
              line: '5',
              explanation:
                'err.code === 11000 — MongoDB duplicate key error code. Kiểm tra trước generic catch để trả message thân thiện thay vì "Internal Server Error".',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Error handler phải có <strong>đúng 4 tham số</strong>: <code>(err, req, res, next)</code>.
          Nếu chỉ có 3 tham số, Express coi nó là regular middleware, không phải error handler — lỗi
          sẽ không được xử lý. TypeScript type <code>ErrorRequestHandler</code> đảm bảo điều này.
        </Callout>
        <Callout type="note">
          Error hierarchy giúp route code sạch hơn: <code>throw new NotFoundError('User')</code>{' '}
          thay vì <code>{'res.status(404).json({ error: "User not found" })'}</code>. Tất cả HTTP
          status mapping tập trung trong errorHandler — sửa format response một chỗ, áp dụng toàn bộ
          API.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Tạo AppError, NotFoundError, ValidationError. Viết asyncHandler. Refactor tất cả routes Todo API dùng asyncHandler thay try/catch.',
            },
            {
              level: 'medium',
              text: 'Thêm ConflictError (409), UnauthorizedError (401), ForbiddenError (403). Viết errorHandler xử lý cả Mongoose ValidationError và duplicate key error (code 11000).',
            },
            {
              level: 'hard',
              text: 'Tạo typed error response: interface ErrorResponse { success: false; error: string; code?: string; details?: unknown }. Đảm bảo tất cả error paths trong errorHandler đều conform với type này. Viết test kiểm tra error format nhất quán.',
            },
          ]}
          hint="instanceof check hoạt động theo thứ tự — check specific errors trước (NotFoundError), generic sau (AppError). Vì NotFoundError extends AppError, nếu check AppError trước thì sẽ không bao giờ đến check NotFoundError."
        />
      </Sec>
    </LessonCard>
  );
}
