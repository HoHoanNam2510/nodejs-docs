import LessonCard from '../../components/LessonCard';
import CodeTabs from '../../components/CodeTabs';
import LineTable from '../../components/LineTable';
import ExerciseSection from '../../components/ExerciseSection';
import Callout from '../../components/Callout';
import { Sec, Flow } from './_helpers';

const CLASS_CODE = `// Custom Error class với TypeScript
export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'AppError';
    // Fix instanceof khi extend built-in class
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// Subclasses cho từng loại lỗi
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(resource + ' không tìm thấy', 404, 'NOT_FOUND');
  }
}
export class ValidationError extends AppError {
  constructor(msg: string) { super(msg, 400, 'VALIDATION_ERROR'); }
}
export class UnauthorizedError extends AppError {
  constructor() { super('Chưa đăng nhập', 401, 'UNAUTHORIZED'); }
}`;

const HANDLE_CODE = `// instanceof — TypeScript thu hẹp type tự động
async function getUser(id: string): Promise<IUser> {
  try {
    const user = await User.findById(id);
    if (!user) throw new NotFoundError('User');
    return user;
  } catch (error: unknown) {
    if (error instanceof NotFoundError) {
      throw error; // re-throw để Express error handler xử lý
    }
    if (error instanceof Error) {
      throw new AppError('DB error: ' + error.message, 500);
    }
    throw new AppError('Unknown error', 500);
  }
}

// Express global error handler (4 tham số)
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
  }
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});`;

interface Props {
  isDone: boolean;
  onToggleDone: () => void;
}

export default function Lesson14({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-01-14"
      num="14"
      title="Error handling — typed errors và custom Error class"
      desc="try/catch/finally, instanceof, AppError, Error hierarchy"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        <p>
          TypeScript xử lý errors tốt hơn JS: <code className="ic">error: unknown</code> buộc bạn
          check type trước khi dùng. Custom Error class cho phép phân biệt loại lỗi bằng{' '}
          <code className="ic">instanceof</code> và thêm thông tin (
          <code className="ic">statusCode</code>, <code className="ic">code</code>). Đây là nền tảng
          cho error handling trong Express.
        </p>
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Định nghĩa AppError extends Error với statusCode và optional code',
            'Tạo subclasses: NotFoundError(404), ValidationError(400), UnauthorizedError(401)',
            'Throw error phù hợp trong business logic: throw new NotFoundError("User")',
            'Express error handler (4 params): bắt error, instanceof check, trả đúng status',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: 'AppError class', code: CLASS_CODE },
            { label: 'Error handling', code: HANDLE_CODE },
          ]}
        />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable
          rows={[
            {
              line: '3-7',
              explanation:
                'public readonly trong constructor — shorthand khai báo field + gán cùng lúc',
            },
            { line: '9', explanation: 'this.name = "AppError" — giúp log dễ đọc hơn "Error: ..."' },
            {
              line: '11',
              explanation:
                'Object.setPrototypeOf — fix lỗi instanceof không hoạt động khi extend built-in Error',
            },
            {
              line: '13-15',
              explanation:
                'Subclass NotFoundError — super() gọi AppError constructor với 404 và code cố định',
            },
            {
              line: '19 (handle)',
              explanation:
                '4-param error handler — Express nhận ra đây là error handler nhờ có đúng 4 params',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          <strong>instanceof fails khi extend built-ins:</strong> Trong một số môi trường,{' '}
          <code className="ic">error instanceof AppError</code> có thể trả false. Fix bằng cách thêm{' '}
          <code className="ic">Object.setPrototypeOf(this, new.target.prototype)</code> trong
          constructor.
        </Callout>
        <Callout type="note">
          <strong>Không lộ stack trace ở production:</strong>{' '}
          <code className="ic">error.stack</code> chứa đường dẫn file server — không bao giờ gửi cho
          client. Check <code className="ic">process.env.NODE_ENV === 'production'</code> để quyết
          định có log hay không.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Viết AppError class với message và statusCode. Thêm NotFoundError và ValidationError subclasses. Test instanceof với try/catch.',
            },
            {
              level: 'medium',
              text: 'Viết Express error handler middleware nhận AppError và generic Error. AppError → đúng statusCode, generic Error → 500.',
            },
            {
              level: 'hard',
              text: 'Viết asyncHandler wrapper: const asyncHandler = (fn: RequestHandler): RequestHandler => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next). Apply cho tất cả routes.',
            },
          ]}
          hint="asyncHandler wrap async function, nếu throw sẽ tự gọi next(error) → đến Express error handler. Cần import RequestHandler từ express."
        />
      </Sec>
    </LessonCard>
  );
}
