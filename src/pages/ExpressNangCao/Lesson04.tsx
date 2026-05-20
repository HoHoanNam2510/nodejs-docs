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

// 1. Định nghĩa schema với validation rules
const CreateUserSchema = z.object({
  name:  z.string().min(2, 'Tên ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  age:   z.number().min(0).max(150).optional(),
});

// 2. Tự động generate TypeScript type từ schema!
type CreateUserInput = z.infer<typeof CreateUserSchema>;
// Tương đương: { name: string; email: string; age?: number }

// 3. Parse và validate
const result = CreateUserSchema.safeParse(req.body);

if (!result.success) {
  // result.error.errors là mảng ZodError với path + message
  return res.status(400).json({
    error: result.error.errors.map(e => ({
      field:   e.path.join('.'),
      message: e.message,
    })),
  });
}

const { name, email, age } = result.data; // type-safe!`;

const REAL = `import { z } from 'zod';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AppError } from './error.middleware';

// ── Schemas ───────────────────────────────────────────────────────────────────

export const RegisterSchema = z.object({
  name:     z.string().min(2).max(50).trim(),
  email:    z.string().email().toLowerCase(),
  password: z.string().min(8, 'Mật khẩu ít nhất 8 ký tự')
              .regex(/[A-Z]/, 'Cần ít nhất 1 chữ hoa')
              .regex(/[0-9]/, 'Cần ít nhất 1 số'),
  role:     z.enum(['user', 'admin']).default('user'),
});

export const UpdateUserSchema = RegisterSchema.partial().omit({ role: true });
// Partial: tất cả fields optional
// Omit: xóa role — user không được tự đổi role!

// ── Infer types từ schemas ────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof RegisterSchema>;
// { name: string; email: string; password: string; role: "user" | "admin" }

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;
// { name?: string; email?: string; password?: string }

// ── validate middleware factory ───────────────────────────────────────────────

export const validate =
  (schema: z.ZodSchema): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map(e => ({
        field:   e.path.join('.'),
        message: e.message,
      }));
      throw new AppError(JSON.stringify(errors), 400);
    }
    req.body = result.data; // replace với parsed + coerced data
    next();
  };

// ── Dùng trong route ──────────────────────────────────────────────────────────

// router.post('/register', validate(RegisterSchema), registerController);`;

const MISTAKE = `// ❌ Sai lầm 1: Dùng interface TypeScript thay Zod để validate runtime
interface CreateUserBody { name: string; email: string; }

app.post('/users', (req: Request<{}, {}, CreateUserBody>, res) => {
  const { name } = req.body;
  // TypeScript chỉ check lúc compile — ở runtime, name có thể là số, null, bất cứ thứ gì
  // Client gửi { name: 123 } → TypeScript không báo lỗi!
  db.save({ name }); // name là number, không phải string
});

// ✅ Đúng: Zod validate cả compile time VÀ runtime
const Schema = z.object({ name: z.string().min(1) });
const result = Schema.safeParse(req.body);
if (!result.success) return res.status(400).json({ error: result.error.errors });
const { name } = result.data; // string, guaranteed ở runtime

// ❌ Sai lầm 2: Dùng parse() thay safeParse() — throw ZodError uncaught
const data = Schema.parse(req.body); // nếu lỗi → throw ZodError → crash nếu không wrap try/catch

// ✅ Đúng: safeParse() trả { success, data | error } — không throw
const result2 = Schema.safeParse(req.body);
if (!result2.success) { /* handle */ }`;

export default function Lesson04({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-03-04"
      num="04"
      title="Input validation với Zod — schema-first, type inference"
      desc="z.object(), z.infer<>, safeParse(), validate middleware"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        TypeScript interface chỉ kiểm tra lúc compile — không bảo vệ gì ở runtime. <code>zod</code>{' '}
        là thư viện validation TypeScript-first: bạn định nghĩa schema một lần, zod tự động{' '}
        <strong>generate TypeScript type</strong> (<code>z.infer&lt;&gt;</code>) VÀ thực hiện
        validation ở runtime. Không cần viết interface riêng và schema riêng cho cùng một shape —
        chỉ cần một schema, zod lo phần còn lại.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Định nghĩa z.object() schema với validation rules cho từng field',
            'z.infer<typeof Schema> — TypeScript tự extract type từ schema (không viết interface riêng)',
            'safeParse(req.body) — validate data, trả { success: true, data } hoặc { success: false, error }',
            'Nếu lỗi: map error.errors thành readable messages, trả 400 với danh sách lỗi',
            'Nếu thành công: result.data đã được coerced (trim, toLowerCase...) và type-safe',
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
                "z.string().min(2, '...') — chain validation methods. min(2) check độ dài, message tùy chỉnh hiện trong error. Không cần if/else thủ công.",
            },
            {
              line: '2',
              explanation:
                'type CreateUserInput = z.infer<typeof CreateUserSchema> — \"infer\" có nghĩa là \"lấy type từ\". TypeScript đọc schema và tự tạo type tương ứng. Thay đổi schema → type tự cập nhật.',
            },
            {
              line: '3',
              explanation:
                'safeParse() vs parse() — safeParse trả result object, không throw. parse() throw ZodError nếu invalid. Dùng safeParse trong API routes để xử lý lỗi gracefully.',
            },
            {
              line: '4',
              explanation:
                'RegisterSchema.partial() — tạo schema mới với tất cả fields optional. Dùng cho PATCH endpoint. .omit({ role: true }) xóa field role — user không được tự đổi role.',
            },
            {
              line: '5',
              explanation:
                'req.body = result.data — thay req.body bằng data đã parse. Zod đã coerce (trim string, toLowerCase...) nên data sạch hơn raw req.body. Các middleware sau nhận data đã sanitized.',
            },
            {
              line: '6',
              explanation:
                "router.post('/register', validate(RegisterSchema), registerController) — middleware pattern: validate chạy trước controller. Nếu validate fail → 400 response, controller không bao giờ được gọi.",
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          TypeScript interface <strong>không phải</strong> runtime validation. Interface{' '}
          <code>{'{ name: string }'}</code> chỉ có nghĩa với TypeScript compiler — JavaScript
          runtime không biết interface tồn tại. Client có thể gửi bất kỳ thứ gì và{' '}
          <code>req.body</code> vẫn nhận. Luôn cần Zod (hoặc tương đương) để validate thực sự.
        </Callout>
        <Callout type="note">
          Zod có nhiều built-ins hữu ích: <code>z.string().url()</code>,{' '}
          <code>z.string().uuid()</code>, <code>z.number().positive()</code>,{' '}
          <code>z.array(z.string()).min(1)</code>, <code>z.enum(['a', 'b'])</code>. Đọc docs zod một
          lần để biết những gì có sẵn — tránh viết validation thủ công.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Viết CreateTodoSchema với title (string, min 1, max 100), priority (enum low/medium/high, default medium). Infer type. Test safeParse với data hợp lệ và không hợp lệ.',
            },
            {
              level: 'medium',
              text: 'Viết validate middleware factory (như code REAL). Dùng nó cho POST /todos route. Test với Postman gửi body thiếu title — kiểm tra response 400 với error message rõ ràng.',
            },
            {
              level: 'hard',
              text: 'Viết LoginSchema với email (string.email) và password (string). Viết thêm PaginationSchema với page (number, min 1, default 1), limit (number, min 1, max 100, default 10). Dùng PaginationSchema validate req.query (cần z.coerce.number() vì query params là string).',
            },
          ]}
          hint="req.query params đều là string — dùng z.coerce.number() thay z.number() để tự convert. z.object({ page: z.coerce.number().min(1).default(1) }) sẽ convert '1' thành 1 tự động."
        />
      </Sec>
    </LessonCard>
  );
}
