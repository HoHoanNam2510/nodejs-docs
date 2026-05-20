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

const BASIC = `// User.create() — tạo document mới
import { User, IUser } from '../models/User';

// create() nhận object match IUser (trừ timestamps và _id tự gen)
const user = await User.create({
  name:  'Nguyễn An',
  email: 'an@mail.com',
  role:  'user',
});

// user là Document<IUser> — có _id, createdAt, updatedAt
console.log(user._id);        // Types.ObjectId — không phải string!
console.log(user.name);       // string — typed
console.log(user.createdAt);  // Date — typed
console.log(user._id.toString()); // convert sang string khi cần

// Tạo nhiều documents cùng lúc
const [u1, u2] = await User.create([
  { name: 'Bình', email: 'binh@mail.com' },
  { name: 'Châu', email: 'chau@mail.com' },
]);`;

const REAL = `// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { User } from '../models/User';
import { AppError } from '../utils/errors';
import { asyncHandler } from '../utils/asyncHandler';
import { z } from 'zod';

const CreateUserSchema = z.object({
  name:     z.string().min(2).max(100),
  email:    z.string().email(),
  password: z.string().min(8),
  role:     z.enum(['user', 'admin']).optional().default('user'),
});

type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  // Validate request body
  const body = CreateUserSchema.parse(req.body) satisfies CreateUserInput;

  // Hash password trước khi lưu
  const bcrypt  = await import('bcryptjs');
  const hashed  = await bcrypt.hash(body.password, 10);

  // Create document
  const user = await User.create({
    ...body,
    password: hashed,
  });

  // Response không lộ password
  const { password: _, ...safeUser } = user.toObject();
  res.status(201).json({ success: true, data: safeUser });
});`;

const MISTAKE = `// ❌ Sai lầm 1: Dùng new User() + save() không có error handling đúng
const user = new User({ name: 'An' });  // chưa lưu
// nếu validate fail → save() throw ValidationError
await user.save();

// ✅ Đơn giản hơn: User.create() — gộp new + save + error
await User.create({ name: 'An', email: 'an@mail.com' });

// ❌ Sai lầm 2: Coi _id là string — sai type!
const user = await User.create({ name: 'An', email: 'a@b.com' });
const id: string = user._id; // TypeScript Error: Type ObjectId is not assignable to type string

// ✅ Đúng
const id: string = user._id.toString();
// Hoặc dùng toHexString():
const hex = user._id.toHexString();

// ❌ Sai lầm 3: Return full user object với password!
const user = await User.create({ name, email, password: hashedPw });
res.status(201).json({ data: user }); // user.password lộ trong response!

// ✅ Đúng: destructure để bỏ sensitive fields
const { password, ...safeUser } = user.toObject();
res.status(201).json({ data: safeUser });`;

export default function Lesson06({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-04-06"
      num="06"
      title="Create — tạo document với typed result"
      desc="User.create(), new + save(), _id là ObjectId không phải string, không lộ sensitive fields"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Mongoose có 2 cách tạo document: <code>User.create(obj)</code> (shortcut — tạo và lưu ngay)
        và <code>new User(obj); user.save()</code> (tách biệt — hữu ích khi cần xử lý trước khi
        save). <code>create()</code> trả về document đã lưu — typed là{' '}
        <code>{'Document<IUser>'}</code>. Điểm quan trọng: <code>_id</code> có type{' '}
        <code>Types.ObjectId</code>, không phải <code>string</code>. Phải <code>toString()</code>{' '}
        khi cần so sánh hoặc gửi qua JSON.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Validate request body bằng Zod schema (layer controller)',
            'Hash password hoặc xử lý data trước khi lưu',
            'User.create({...data}) → Mongoose chạy schema validation → lưu xuống MongoDB',
            'create() trả Document<IUser> với _id (ObjectId), timestamps tự điền',
            'Destructure để bỏ sensitive fields (password) trước khi response',
            'res.status(201).json() — 201 Created cho POST tạo resource mới',
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
                'User.create({...}) — nhận plain object, không cần match IUser hoàn toàn vì timestamps và _id tự generated. TypeScript type của result là Document<unknown, {}, IUser> & IUser — có đủ methods như .save(), .toObject().',
            },
            {
              line: '2',
              explanation:
                'user._id — type là Types.ObjectId, không phải string. ObjectId là 12-byte identifier. Khi gửi qua JSON, tự convert thành hex string. Khi so sánh: user._id.equals(otherId) hoặc user._id.toString() === strId.',
            },
            {
              line: '3',
              explanation:
                'user.toObject() — convert Mongoose Document sang plain JavaScript object. Cần thiết khi destructure hoặc spread vì Document có getters/setters ẩn. Sau toObject(), object là pure data.',
            },
            {
              line: '4',
              explanation:
                'const { password: _, ...safeUser } — destructuring với rename: lấy password vào _ (convention cho unused variable), phần còn lại vào safeUser. safeUser là Omit<IUser, "password">.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Luôn dùng <code>user.toObject()</code> trước khi destructure hoặc spread Mongoose
          document. Document có hidden getters — destructuring trực tiếp có thể bỏ sót fields hoặc
          include Mongoose internals (<code>__v</code>, <code>$__</code>...).
        </Callout>
        <Callout type="note">
          <code>User.create([obj1, obj2])</code> (truyền array) tạo nhiều documents trong 1 query.
          Nếu 1 document fail validation, toàn bộ batch sẽ fail (không có partial success mặc định —
          cần transaction nếu muốn atomic).
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Viết POST /posts route: validate body bằng Zod (title, content, tags), tạo Post document, response với status 201 và post data (không gồm __v field).',
            },
            {
              level: 'medium',
              text: 'Implement POST /register: validate với Zod, check email chưa tồn tại (findOne trước), hash password, create user, response với safeUser (không có password). Handle duplicate email với error 409.',
            },
            {
              level: 'hard',
              text: 'Viết bulk create endpoint POST /users/bulk nhận array of users. Dùng User.create([...]) với insertMany option. Implement transaction để đảm bảo nếu 1 fail thì tất cả rollback. Return typed result: { created: number, failed: { index: number, error: string }[] }.',
            },
          ]}
          hint="Kiểm tra email đã tồn tại: const exists = await User.findOne({ email }); if (exists) throw new AppError('Email đã tồn tại', 409). Làm trước create() để tránh duplicate key error khó đọc hơn."
        />
      </Sec>
    </LessonCard>
  );
}
