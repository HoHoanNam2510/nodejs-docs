import LessonCard from '../../components/LessonCard';
import CodeTabs from '../../components/CodeTabs';
import LineTable from '../../components/LineTable';
import ExerciseSection from '../../components/ExerciseSection';
import Callout from '../../components/Callout';
import { Sec, Flow } from './_helpers';

interface Props { isDone: boolean; onToggleDone: () => void; }

const BASIC = `import { ErrorRequestHandler } from 'express';

// Custom error class
class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// Error handler middleware — PHẢI có đúng 4 tham số
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error:   err.message,
    });
  }
  // Lỗi không xác định
  res.status(500).json({
    success: false,
    error:   'Internal Server Error',
  });
};

// Đặt sau tất cả routes!
app.use(errorHandler);`;

const REAL = `// src/errors/AppError.ts
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
export class NotFoundError     extends AppError {
  constructor(resource = 'Resource') {
    super(resource + ' không tìm thấy', 404, 'NOT_FOUND');
  }
}
export class ValidationError   extends AppError {
  constructor(msg: string) { super(msg, 400, 'VALIDATION_ERROR'); }
}
export class UnauthorizedError extends AppError {
  constructor() { super('Chưa đăng nhập', 401, 'UNAUTHORIZED'); }
}
export class ForbiddenError    extends AppError {
  constructor() { super('Không có quyền', 403, 'FORBIDDEN'); }
}

// src/middleware/asyncHandler.ts
import { RequestHandler } from 'express';
export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// src/middleware/errorHandler.ts
import { ErrorRequestHandler } from 'express';
import { AppError } from '../errors/AppError';

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Log lỗi (production: dùng winston/pino thay console)
  console.error('[Error]', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success:   false,
      error:     err.message,
      code:      err.code,
    });
  }
  if (err instanceof SyntaxError) {
    return res.status(400).json({
      success: false,
      error:   'Invalid JSON body',
    });
  }
  res.status(500).json({
    success: false,
    error:   process.env.NODE_ENV === 'production'
               ? 'Internal Server Error'
               : err.message,
  });
};

// Usage trong route:
app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError('User');
  res.json({ success: true, data: user });
}));`;

const MISTAKE = `// ❌ Sai lầm 1: Chỉ 3 tham số — Express KHÔNG nhận là error handler!
app.use((err: Error, res: Response) => {
  // Đây là regular middleware với 2 params, không phải error handler
  // Express sẽ bỏ qua hoàn toàn khi có lỗi
  res.status(500).json({ error: err.message });
});

// ❌ Sai lầm 2: Async function không wrap asyncHandler
app.get('/users/:id', async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id); // throws nếu DB error
  res.json(user);
  // Promise rejection không được Express bắt tự động (Express 4)
  // Kết quả: UnhandledPromiseRejectionWarning, server có thể crash
});

// ✅ Đúng: 4 tham số + asyncHandler wrap
const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  res.status(err instanceof AppError ? err.statusCode : 500)
     .json({ error: err.message });
};

app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError('User'); // next(err) tự động qua asyncHandler
  res.json({ data: user });
}));`;

const JSOTS = `// ❌ JavaScript
app.use((err, req, res, next) => {
  // err là any — không biết statusCode có tồn tại không
  res.status(err.statusCode || 500).json({ error: err.message });
  // Nếu err không có statusCode → undefined → NaN → 500 (may mắn)
  // Nếu err không có message → undefined → "undefined" string được gửi đi
});

// ✅ TypeScript
import { ErrorRequestHandler } from 'express';
import { AppError } from './errors/AppError';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    // err.statusCode: number ✓, err.message: string ✓ — guaranteed
    return res.status(err.statusCode).json({ error: err.message });
  }
  if (err instanceof Error) {
    // err.message: string ✓
    return res.status(500).json({ error: err.message });
  }
  // err: unknown — fallback an toàn
  res.status(500).json({ error: 'Unknown error' });
};`;

export default function Lesson09({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-02-09"
      num="09"
      title="Error handling middleware — ErrorRequestHandler, 4 tham số"
      desc="ErrorRequestHandler, AppError class, next(error), global handler"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Express phân biệt error handler với regular middleware bằng số tham số — error handler
        phải có đúng <strong>4 tham số</strong>: <code>(err, req, res, next)</code>. TypeScript
        cung cấp type <code>ErrorRequestHandler</code> đảm bảo signature đúng. Pattern chuẩn:
        tạo <code>AppError</code> class extends <code>Error</code> với <code>statusCode</code>,
        dùng <code>asyncHandler</code> wrapper để bắt async errors, đặt error handler cuối cùng
        sau tất cả routes.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow steps={[
          'Tạo AppError class extends Error với statusCode',
          'Trong route handler: throw new AppError(message, statusCode) hoặc next(new AppError(...))',
          'Express nhận diện error handler bằng đúng 4 tham số: (err, req, res, next)',
          'Khai báo type ErrorRequestHandler từ express',
          'Đặt error handler sau tất cả routes — cuối cùng trong app.ts',
        ]} />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs tabs={[
          { label: 'Cơ bản .ts', code: BASIC },
          { label: 'Thực tế .ts', code: REAL },
          { label: 'Sai lầm .ts', code: MISTAKE },
          { label: 'So sánh JS→TS', code: JSOTS },
        ]} />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable rows={[
          { line: '1',  explanation: 'ErrorRequestHandler — type cho error middleware. Signature: (err: any, req: Request, res: Response, next: NextFunction) => void. 4 params bắt buộc.' },
          { line: '2',  explanation: 'next(err) vs throw — trong async function, cả hai đều hoạt động khi dùng asyncHandler. Trong sync code, dùng next(err) để chuyển lỗi đến error handler.' },
          { line: '3',  explanation: 'asyncHandler HOF — Higher Order Function nhận async RequestHandler, wrap trong Promise.resolve().catch(next). Mọi rejected promise tự động gọi next(err).' },
          { line: '4',  explanation: 'instanceof AppError — type narrowing. Sau kiểm tra này, TypeScript biết err có statusCode và code properties. Không cần cast thủ công.' },
          { line: '5',  explanation: 'process.env.NODE_ENV === "production" — ẩn stack trace và internal error messages khi production. Tránh lộ thông tin nhạy cảm cho client.' },
        ]} />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Express 4 không tự bắt async errors — phải dùng <code>asyncHandler</code> wrapper hoặc
          explicit <code>try/catch</code> + <code>next(error)</code>. Express 5 (beta) tự bắt
          nhưng chưa stable. Quên wrap → <code>UnhandledPromiseRejectionWarning</code>, server
          có thể crash.
        </Callout>
        <Callout type="note">
          Error handler PHẢI đứng sau tất cả <code>app.use()</code> và routes. Express xử lý
          middleware theo thứ tự — error handler ở sai vị trí sẽ không bao giờ được gọi, lỗi
          sẽ rơi vào Express default handler (trả HTML thay vì JSON).
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Viết AppError, NotFoundError, ValidationError. Test trong route: throw NotFoundError → error handler trả 404 JSON.',
            },
            {
              level: 'medium',
              text: 'Viết asyncHandler wrapper. Áp dụng cho tất cả async route handlers trong app.',
            },
            {
              level: 'hard',
              text: 'Viết error handler phân biệt: AppError (custom status), mongoose.Error.ValidationError (400), MongoServerError code 11000 (409 duplicate), khác (500). Không lộ stack trace ở production.',
            },
          ]}
          hint="Mongoose validation error có class mongoose.Error.ValidationError. MongoDB duplicate key error có code === 11000 và class MongoServerError. Cần import từ mongoose và mongodb."
        />
      </Sec>
    </LessonCard>
  );
}
