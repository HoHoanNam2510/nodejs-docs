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

const BASIC = `// src/models/User.ts
import { Schema, model } from 'mongoose';

// Bước 1 — Interface: định nghĩa shape của document
export interface IUser {
  name:      string;
  email:     string;
  age?:      number;           // optional field
  role:      'user' | 'admin'; // literal union type
  createdAt: Date;             // timestamps tự thêm
  updatedAt: Date;
}

// Bước 2 — Schema: khai báo structure cho Mongoose, generic với IUser
const userSchema = new Schema<IUser>(
  {
    name:  { type: String, required: true },
    email: { type: String, required: true, unique: true },
    age:   { type: Number },
    role:  { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true } // tự tạo createdAt và updatedAt
);

// Bước 3 — Model: factory function, generic với IUser
export const User = model<IUser>('User', userSchema);
// 'User' là tên collection sẽ là 'users' (Mongoose tự pluralize + lowercase)`;

const REAL = `// src/models/Post.ts — ví dụ thực tế với reference
import { Schema, model, Types } from 'mongoose';

export interface IPost {
  title:     string;
  content:   string;
  slug:      string;
  author:    Types.ObjectId;   // reference đến User collection
  tags:      string[];
  published: boolean;
  views:     number;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    title:     { type: String, required: true, trim: true },
    content:   { type: String, required: true },
    slug:      { type: String, required: true, unique: true, lowercase: true },
    author:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags:      [{ type: String, lowercase: true, trim: true }],
    published: { type: Boolean, default: false },
    views:     { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Post = model<IPost>('Post', postSchema);`;

const JSTS = `// JavaScript (không có interface, schema không có type safety)
const userSchema = new mongoose.Schema({
  name:  { type: String, required: true },
  email: String,
  role:  { type: String, enum: ['user', 'admin'] },
});
const User = mongoose.model('User', userSchema);

// Không có type checking:
const user = await User.findById(id);
user.nonExistentField; // không báo lỗi — runtime crash

// TypeScript (có interface + generics)
interface IUser {
  name:  string;
  email: string;
  role:  'user' | 'admin';
}
const userSchema = new Schema<IUser>({ /* ... */ });
const User = model<IUser>('User', userSchema);

// Type checking hoạt động:
const user = await User.findById(id); // IUser | null
if (user) {
  user.nonExistentField; // TS Error: Property 'nonExistentField' does not exist
  user.name;             // string — safe!
}`;

export default function Lesson03({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-04-03"
      num="03"
      title="Schema với TypeScript Interface — 3 bước cốt lõi"
      desc="Interface → Schema<IUser> → model<IUser>() — pattern chuẩn cho mọi Mongoose model"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Pattern chuẩn khi dùng Mongoose với TypeScript gồm 3 bước bất biến: (1){' '}
        <strong>Interface</strong> định nghĩa shape của document — đây là TypeScript type, không
        liên quan đến Mongoose; (2) <strong>Schema</strong> với generic{' '}
        <code>{'Schema<IUser>'}</code> — Mongoose sẽ validate khai báo schema khớp với interface;
        (3) <strong>Model</strong> với generic <code>{'model<IUser>()'}</code> — mọi query từ{' '}
        <code>User.find()</code> sẽ trả về <code>{'IUser[]'}</code> typed.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Định nghĩa IUser interface: tất cả fields mà document sẽ có, gồm timestamps',
            'Khai báo new Schema<IUser>({...}) — generic parameter liên kết schema với interface',
            'Gọi model<IUser>("User", userSchema) — tên collection là "users" (tự pluralize)',
            'Export const User — đây là Model object dùng để query: User.find(), User.create()',
            'Mọi query result đã có type: findById → IUser | null, find → IUser[]',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: 'Cơ bản .ts', code: BASIC },
            { label: 'Thực tế .ts', code: REAL },
            { label: 'So sánh JS→TS', code: JSTS },
          ]}
        />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable
          rows={[
            {
              line: '1',
              explanation:
                "import { Schema, model } from 'mongoose' — named imports. Schema là class để khai báo document structure. model() là factory function tạo Model.",
            },
            {
              line: '2',
              explanation:
                'export interface IUser — export để dùng ở nơi khác (controllers, services). Prefix I là convention (optional — nhóm này dùng nhất quán). Phải include createdAt/updatedAt nếu dùng { timestamps: true }.',
            },
            {
              line: '3',
              explanation:
                "role: 'user' | 'admin' — literal union type trong TypeScript. Tương ứng enum: ['user', 'admin'] trong Mongoose schema. TypeScript báo lỗi nếu gán giá trị khác.",
            },
            {
              line: '4',
              explanation:
                'new Schema<IUser>({...}) — generic parameter IUser cho Mongoose biết shape. Mongoose v6+ validate schema declaration phải match interface. Nếu khai báo sai type, TypeScript báo lỗi compile time.',
            },
            {
              line: '5',
              explanation:
                '{ timestamps: true } — option tự tạo createdAt và updatedAt. Phải khai báo 2 fields này trong IUser interface, nếu không TypeScript báo missing properties.',
            },
            {
              line: '6',
              explanation:
                "model<IUser>('User', userSchema) — tên 'User' → collection 'users'. Generic IUser → User.findById() trả IUser | null, User.find() trả IUser[].",
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Nếu interface có <code>createdAt: Date</code> và <code>updatedAt: Date</code> nhưng schema
          không có <code>{'{ timestamps: true }'}</code> (hoặc ngược lại), TypeScript sẽ không báo
          lỗi nhưng data sẽ không có timestamps. Luôn đảm bảo interface và schema options nhất quán.
        </Callout>
        <Callout type="note">
          <code>Types.ObjectId</code> là type cho <code>_id</code> và reference fields. Khi query
          trả về document, <code>_id</code> có type <code>Types.ObjectId</code>, không phải{' '}
          <code>string</code>. Để so sánh: <code>user._id.toString() === req.params.id</code>.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Tạo IPost interface và Post model: title (string, required), content (string), author (Types.ObjectId, ref User), tags (string[]), published (boolean, default false), timestamps.',
            },
            {
              level: 'medium',
              text: 'Tạo IComment interface và Comment model với: content (string), post (ref Post), author (ref User), likes (number, default 0), timestamps. Đảm bảo tất cả refs đúng type Types.ObjectId.',
            },
            {
              level: 'hard',
              text: "Tạo IProduct interface với nested object: price: { amount: number; currency: 'VND' | 'USD' }. Tạo schema với nested schema object. Thêm custom validator: price.amount phải > 0. Test bằng cách create product với price âm.",
            },
          ]}
          hint="Nested object trong Mongoose schema: price: { amount: { type: Number, required: true }, currency: { type: String, enum: ['VND', 'USD'] } }. TypeScript interface phải match cấu trúc này."
        />
      </Sec>
    </LessonCard>
  );
}
