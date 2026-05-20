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

const BASIC = `// src/models/User.ts — schema validation options
const userSchema = new Schema<IUser>({
  name: {
    type:     String,
    required: [true, 'Name là bắt buộc'],    // custom error message
    trim:     true,                           // tự xóa whitespace đầu/cuối
    minlength: [2, 'Name tối thiểu 2 ký tự'],
    maxlength: [100, 'Name tối đa 100 ký tự'],
  },
  email: {
    type:     String,
    required: [true, 'Email là bắt buộc'],
    unique:   true,   // tạo unique index — không phải validation, là index!
    lowercase: true,  // tự chuyển về lowercase trước khi save
    match:    [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email không hợp lệ'],
  },
  age: {
    type: Number,
    min:  [0, 'Tuổi không được âm'],
    max:  [150, 'Tuổi không hợp lệ'],
  },
  role: {
    type:    String,
    enum:    {
      values:  ['user', 'admin'],
      message: '{VALUE} không phải role hợp lệ',
    },
    default: 'user',
  },
}, { timestamps: true });`;

const REAL = `// Custom validator + async validator
import { Schema, model } from 'mongoose';
import { User } from './User'; // để check email unique bằng tay (nếu cần)

const userSchema = new Schema<IUser>({
  username: {
    type:      String,
    required:  true,
    unique:    true,
    lowercase: true,
    trim:      true,
    validate: {
      validator: (v: string) => /^[a-z0-9_]{3,20}$/.test(v),
      message:   'Username chỉ gồm chữ thường, số, underscore, 3-20 ký tự',
    },
  },
  password: {
    type:      String,
    required:  true,
    minlength: 8,
    select:    false, // không include password trong query result mặc định
  },
  bio: {
    type:      String,
    maxlength: 500,
    default:   '',
  },
  avatar: {
    type:    String,
    default: 'https://example.com/default-avatar.png',
  },
}, { timestamps: true });

// Virtual field — không lưu vào DB, tính toán khi query
userSchema.virtual('initials').get(function (this: IUser) {
  return this.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
});`;

const MISTAKE = `// ❌ Sai lầm 1: unique: true không phải validation!
// unique chỉ tạo index — khi insert duplicate, MongoDB throw error code 11000
// KHÔNG phải Mongoose ValidationError

// Nếu muốn xử lý giống validation error, phải catch riêng:
try {
  await User.create({ email: 'exists@mail.com' });
} catch (err: any) {
  if (err.code === 11000) {
    // duplicate key error — xử lý như validation
    res.status(409).json({ error: 'Email đã tồn tại' });
    return;
  }
  throw err;
}

// ❌ Sai lầm 2: enum trong TypeScript nhưng không khai báo trong schema
interface IUser {
  role: 'user' | 'admin' | 'moderator'; // thêm 'moderator'
}
// Schema không có 'moderator' trong enum
role: { type: String, enum: ['user', 'admin'] }
// → TypeScript OK (interface match), nhưng Mongoose validation fail khi save 'moderator'

// ✅ Đúng: giữ enum nhất quán giữa interface và schema
type UserRole = 'user' | 'admin' | 'moderator';
// Dùng UserRole type trong cả interface và schema

// ❌ Sai lầm 3: Quên select: false cho password
// → password field trả về trong mọi query kể cả GET /users
const user = await User.findById(id); // user.password lộ!

// ✅ Đúng: password: { type: String, select: false }
// Khi cần password: User.findById(id).select('+password')`;

export default function Lesson04({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-04-04"
      num="04"
      title="Schema validation với TypeScript — required, enum, custom validators"
      desc="required, unique, enum, min/max, match, custom validator, select: false"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Mongoose Schema validation chạy <strong>trước khi</strong> data được lưu xuống MongoDB. Nếu
        validation fail, Mongoose throw <code>ValidationError</code> — không cần round-trip đến
        database. Có 3 loại constraint: (1) built-in validators (required, min, max, enum, match),
        (2) custom validator function, (3) virtual fields (tính toán, không lưu DB). TypeScript giúp
        đảm bảo interface và schema enum nhất quán — nhưng phải maintain cả hai cùng nhau.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'User.create(data) hoặc user.save() → Mongoose chạy validation trước',
            'required: true → kiểm tra field có tồn tại và không phải null/undefined',
            'enum → kiểm tra value nằm trong danh sách cho phép',
            'min/max, minlength/maxlength → kiểm tra range',
            'custom validator → chạy function, trả false hoặc throw → ValidationError',
            'Nếu tất cả pass → gửi query đến MongoDB',
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
                "required: [true, 'message'] — tuple: phần tử 1 là flag, phần tử 2 là error message. Nếu chỉ viết required: true, error message mặc định là 'Path `name` is required.'",
            },
            {
              line: '2',
              explanation:
                'unique: true — tạo unique index trong MongoDB, KHÔNG phải Mongoose validator. Duplicate key ném lỗi code 11000, không phải ValidationError. Phải xử lý riêng trong try/catch.',
            },
            {
              line: '3',
              explanation:
                "enum: { values: [...], message: '...' } — object form cho phép custom message. Dùng {VALUE} trong message để interpolate giá trị bị reject.",
            },
            {
              line: '4',
              explanation:
                "select: false — field này không được include trong query result mặc định. Để lấy: User.findById(id).select('+password'). Quan trọng cho password, token fields.",
            },
            {
              line: '5',
              explanation:
                'validate: { validator, message } — custom validator. validator là function nhận value, return boolean. message là string hoặc function nhận { value } trả string.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          <code>unique: true</code> trong Mongoose schema chỉ tạo MongoDB index — không phải
          validator. Nếu insert 2 documents có cùng email, Mongoose{' '}
          <strong>không throw ValidationError</strong> mà throw error với{' '}
          <code>code === 11000</code>. Phải catch riêng trong error handler.
        </Callout>
        <Callout type="note">
          Không cần validate dữ liệu cả ở Mongoose schema <em>lẫn</em> Zod schema. Thường dùng Zod
          để validate request body (ở layer controller/middleware), Mongoose schema để enforce
          DB-level constraints. Zod fail nhanh hơn vì không cần kết nối DB.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Thêm validation vào Post model: title (required, minlength 3, maxlength 200), slug (required, unique, match regex chỉ có chữ thường và dấu gạch ngang), views (min 0).',
            },
            {
              level: 'medium',
              text: 'Tạo Comment model với custom validator: content không được chứa URL (regex để detect http:// hoặc https://). Test bằng cách thử tạo comment có URL.',
            },
            {
              level: 'hard',
              text: 'Implement password field với select: false. Thêm async custom validator để check password không trùng với username. Viết TypeScript type cho ValidationError để xử lý trong error middleware.',
            },
          ]}
          hint="Để check password không trùng username trong async validator: validator: async function(this: IUser, password: string) { return password !== this.username; }. Dùng this để access fields khác trong document."
        />
      </Sec>
    </LessonCard>
  );
}
