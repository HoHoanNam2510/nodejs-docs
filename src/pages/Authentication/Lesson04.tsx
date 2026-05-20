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

// --- 1. Định nghĩa schema validation với zod ---
const RegisterSchema = z.object({
  name:     z.string().min(2, 'Tên tối thiểu 2 ký tự').max(50),
  email:    z.string().email('Email không hợp lệ'),
  password: z
    .string()
    .min(8, 'Mật khẩu tối thiểu 8 ký tự')
    .regex(/[A-Z]/, 'Cần ít nhất 1 chữ hoa')
    .regex(/[0-9]/, 'Cần ít nhất 1 chữ số'),
});

// --- 2. Type tự generate từ schema (không cần viết tay) ---
type RegisterInput = z.infer<typeof RegisterSchema>;
// { name: string; email: string; password: string } — fully typed!

// --- 3. Controller ---
export const register = asyncHandler(async (req: Request, res: Response) => {
  // Parse và validate — throw ZodError nếu sai
  const body: RegisterInput = RegisterSchema.parse(req.body);
  // body.name, body.email, body.password đều typed string

  // Check email đã tồn tại chưa
  const exists = await User.findOne({ email: body.email });
  if (exists) throw new AppError('Email đã được sử dụng', 409);

  // Tạo user — pre-save hook tự hash password
  const user = await User.create({
    name:     body.name,
    email:    body.email,
    password: body.password, // plaintext — hook sẽ hash
  });

  // Tạo tokens
  const payload = { userId: user._id.toString(), role: user.role };
  const accessToken  = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Trả response — không trả password
  res.status(201).json({
    success: true,
    data: {
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    },
  });
});`;

const REAL = `// src/routes/auth.routes.ts — full register flow với validation middleware

import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../middleware/validate';
import { register } from '../controllers/auth.controller';

export const authRouter = Router();

// --- Validation middleware dùng chung ---
// src/middleware/validate.ts
import { RequestHandler } from 'express';
import { ZodSchema } from 'zod';

export const validateBody =
  (schema: ZodSchema): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      // ZodError.flatten() trả structured errors
      const errors = result.error.flatten().fieldErrors;
      return res.status(400).json({ success: false, errors });
    }
    // Gán parsed data đã validated vào req.body
    req.body = result.data;
    next();
  };

// --- Routes ---
authRouter.post('/register', validateBody(RegisterSchema), register);
authRouter.post('/login',    validateBody(LoginSchema),    login);

// --- Error response từ zod sẽ trông như này ---
// {
//   "success": false,
//   "errors": {
//     "email": ["Email không hợp lệ"],
//     "password": ["Mật khẩu tối thiểu 8 ký tự", "Cần ít nhất 1 chữ số"]
//   }
// }`;

const MISTAKE = `// ❌ Sai lầm 1: Dùng req.body trực tiếp không validate
export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body; // req.body là any — không typed!
  await User.create({ name, email, password }); // nguy hiểm nếu body thiếu field
};

// ✅ Parse với zod trước — throw nếu invalid
const body: RegisterInput = RegisterSchema.parse(req.body);
await User.create({ name: body.name, email: body.email, password: body.password });

// ❌ Sai lầm 2: Trả password trong response
res.json({ user }); // user.password là hashed string — vẫn không nên trả!

// ✅ Explicitly chọn fields muốn trả
const { password: _pw, ...userWithoutPassword } = user.toObject();
res.json({ user: userWithoutPassword });

// Hoặc dùng Mongoose select:
const user = await User.findById(id).select('-password');

// ❌ Sai lầm 3: Không check email trùng — để DB throw error
await User.create({ email }); // MongoDB unique constraint throw MongoServerError
// Error message thô, không user-friendly

// ✅ Check trước để trả message rõ ràng
const exists = await User.findOne({ email: body.email.toLowerCase() });
if (exists) throw new AppError('Email đã được sử dụng', 409);

// ❌ Sai lầm 4: Quên z.infer — viết type tay dẫn đến drift
interface RegisterInput { // viết tay
  name: string;
  email: string;
  password: string;
}
// Sau này thêm field vào schema nhưng quên update interface → drift

// ✅ z.infer tự sync với schema — thêm field vào schema → type tự update
type RegisterInput = z.infer<typeof RegisterSchema>;`;

export default function Lesson04({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-06-04"
      num="04"
      title="Đăng ký với zod + TypeScript"
      desc="RegisterSchema, z.infer auto-generate type, validateBody middleware, không trả password"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Đăng ký (register) là endpoint đầu tiên trong auth flow. Cần validate input nghiêm ngặt
        trước khi chạm đến DB. <code>zod</code> giải quyết 2 vấn đề cùng lúc: validate runtime{' '}
        <em>và</em> generate TypeScript type qua <code>z.infer</code>. Không cần viết interface tay
        — schema là single source of truth. Pattern <code>validateBody(schema)</code> middleware
        tách validation logic ra khỏi controller — controller chỉ lo business logic.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'POST /auth/register — body: { name, email, password }',
            'validateBody(RegisterSchema) middleware: parse req.body — throw 400 nếu invalid',
            'Controller nhận req.body đã validated (typed RegisterInput)',
            'findOne({ email }) — kiểm tra email trùng → throw 409 nếu exists',
            'User.create({ ...body }) — pre-save hook tự hash password',
            'signAccessToken + signRefreshToken → response với tokens và user (không có password field)',
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
                'z.string().min(8).regex(...): zod chain validators. Mỗi .regex() thêm 1 rule. Nếu fail → error message tương ứng. z.string().email() tự validate format email (check @ và domain).',
            },
            {
              line: '2',
              explanation:
                'type RegisterInput = z.infer<typeof RegisterSchema>: TypeScript conditional type extract TypeScript type từ zod schema. Kết quả: { name: string; email: string; password: string }. Thêm field vào schema → type tự cập nhật.',
            },
            {
              line: '3',
              explanation:
                'RegisterSchema.parse(req.body): throw ZodError nếu validation fail. asyncHandler catch và pass error về error middleware. safeParse() là alternative — trả { success, data, error } thay vì throw.',
            },
            {
              line: '4',
              explanation:
                'validateBody middleware: schema.safeParse() → nếu fail trả 400 với structured errors. Nếu success: req.body = result.data (parsed data đã coerce types). Controller có thể tin req.body là valid.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Không bao giờ trả <code>password</code> field trong response — kể cả hashed. Dùng{' '}
          <code>.select('-password')</code> khi query hoặc destructure loại bỏ trước khi trả. Hashed
          password vẫn là sensitive data — cho biết thuật toán hash, có thể dùng trong offline
          brute-force.
        </Callout>
        <Callout type="note">
          <code>RegisterSchema.parse()</code> vs <code>safeParse()</code>: <code>parse()</code>{' '}
          throw ZodError nếu invalid — dùng với asyncHandler để error bubble lên error middleware.{' '}
          <code>safeParse()</code> không throw — trả <code>{'{ success, data, error }'}</code> —
          dùng khi muốn handle error tại chỗ (như trong validateBody middleware).
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Viết RegisterSchema với zod: name (2-50 chars), email (valid email), password (min 8, có uppercase và số). Dùng z.infer để lấy type. Test safeParse với các invalid inputs khác nhau.',
            },
            {
              level: 'medium',
              text: 'Implement validateBody middleware generic: nhận ZodSchema, return RequestHandler. Nếu validation fail → trả { success: false, errors: fieldErrors }. Mount vào POST /auth/register. Test với Postman/Thunder Client.',
            },
            {
              level: 'hard',
              text: 'Thêm confirmPassword vào RegisterSchema: z.string() + .superRefine() để check confirmPassword === password. Nếu không khớp → custom error trên field "confirmPassword". Implement endpoint hoàn chỉnh: validate → check email trùng → create user → trả tokens.',
            },
          ]}
          hint="z.object().superRefine((data, ctx) => { if (data.password !== data.confirmPassword) { ctx.addIssue({ code: 'custom', path: ['confirmPassword'], message: 'Mật khẩu xác nhận không khớp' }); } }) — superRefine cho phép access toàn bộ object để cross-field validation."
        />
      </Sec>
    </LessonCard>
  );
}
