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

const BASIC = `import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  name:      string;
  email:     string;
  password:  string;
  role:      'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  { name: String, email: String, password: String, role: String },
  { timestamps: true }
);

// --- pre hook: chạy TRƯỚC khi save ---
// this: IUser & Document — type rõ ràng để truy cập fields và Mongoose methods
userSchema.pre('save', async function (this: IUser & Document, next) {
  // this.isModified('password') — chỉ hash nếu password thay đổi
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next(); // phải gọi next() để tiếp tục save
});

// --- post hook: chạy SAU khi save ---
// doc là document đã lưu, next là function tiếp theo
userSchema.post('save', function (doc: IUser & Document) {
  console.log('User saved:', doc._id.toString());
  // Không có next() trong post hook của save
});

export const User = model<IUser>('User', userSchema);`;

const REAL = `import { Schema, model, Document, Query } from 'mongoose';

export interface IPost {
  title:     string;
  slug:      string;
  content:   string;
  published: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    title:     { type: String, required: true },
    slug:      { type: String },
    content:   { type: String, required: true },
    published: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Auto-generate slug từ title trước khi save
postSchema.pre('save', function (this: IPost & Document, next) {
  if (this.isModified('title') || this.isNew) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Soft delete: find hooks bỏ qua documents đã xóa
// this trong query hooks là Query object, không phải Document
function excludeDeleted(this: Query<unknown, unknown>) {
  this.where({ deletedAt: null });
}

// Áp dụng filter cho tất cả query methods
postSchema.pre('find', excludeDeleted);
postSchema.pre('findOne', excludeDeleted);
postSchema.pre('findOneAndUpdate', excludeDeleted);
postSchema.pre('countDocuments', excludeDeleted);

export const Post = model<IPost>('Post', postSchema);

// Giờ Post.find() tự động không trả soft-deleted documents!`;

const MISTAKE = `// ❌ Sai lầm 1: Không khai báo this type trong pre hook
userSchema.pre('save', async function (next) {
  // TypeScript: this có type 'Document' — không có user fields!
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10); // Error: property 'password' doesn't exist
  }
  next();
});

// ✅ Khai báo this type rõ ràng
userSchema.pre('save', async function (this: IUser & Document, next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10); // OK!
  }
  next();
});

// ❌ Sai lầm 2: Quên gọi next() trong pre hook
userSchema.pre('save', async function (this: IUser & Document) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  // Quên next() → save() treo mãi, không resolve không reject!
});

// ✅ Luôn gọi next() ở cuối, hoặc gọi next(err) nếu có lỗi
userSchema.pre('save', async function (this: IUser & Document, next) {
  try {
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  } catch (err) {
    next(err as Error); // pass lỗi cho Mongoose error handling
  }
});

// ❌ Sai lầm 3: Dùng arrow function trong hook — this context sai!
userSchema.pre('save', async (next) => {
  // Arrow function không có own 'this' → this là module scope, không phải document!
  this.isModified('password'); // TypeError
});

// ✅ Dùng function expression, không phải arrow function
userSchema.pre('save', async function (next) { ... });`;

export default function Lesson06({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-05-06"
      num="06"
      title="Mongoose hooks với this type"
      desc="pre/post hooks, this: IUser & Document, query hooks, soft delete pattern, arrow function pitfall"
      priority="medium"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Mongoose middleware (hooks) là functions chạy trước (<code>pre</code>) hoặc sau (
        <code>post</code>) một operation (save, find, update, delete). Có 2 loại:{' '}
        <strong>document hooks</strong> (<code>pre('save')</code> — <code>this</code> là document
        instance) và <strong>query hooks</strong> (<code>pre('find')</code> — <code>this</code> là
        Query object). Với TypeScript, phải khai báo <code>this</code> type rõ ràng trong pre hooks
        vì TypeScript không tự suy luận được.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'schema.pre("save", async function(this: IUser & Document, next) {...}) — document hook',
            'this là Mongoose Document instance — có document data (IUser) + Mongoose methods (.isModified, .isNew)',
            'Xử lý logic (hash password, generate slug, validate...) trước khi lưu',
            'Gọi next() để tiếp tục operation. next(err) để throw error và abort save',
            'schema.post("save", fn) chạy sau khi lưu thành công — dùng cho side effects (log, send email)',
            'Query hooks: pre("find") — this là Query, dùng this.where() để thêm filter',
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
                'this: IUser & Document — intersection type: IUser cung cấp data fields (name, email, password...), Document cung cấp Mongoose methods (isModified(), isNew, save(), _id...). Cần cả hai để hook hoạt động đúng với TypeScript.',
            },
            {
              line: '2',
              explanation:
                'this.isModified("password") — Mongoose Document method. Trả true nếu field đó đã thay đổi kể từ lần load từ DB cuối cùng (hoặc kể từ khi tạo mới). Dùng để tránh hash lại password đã hash khi update field khác.',
            },
            {
              line: '3',
              explanation:
                'Query hooks (pre find): this là Query<unknown, unknown>. Dùng this.where({deletedAt: null}) để thêm filter vào tất cả queries. Soft delete pattern: không xóa thực sự — chỉ set deletedAt. Tất cả finds tự bỏ qua deleted docs.',
            },
            {
              line: '4',
              explanation:
                'function expression, không phải arrow function — bắt buộc trong hooks vì arrow function không bind own this. Mongoose inject document/query vào this khi gọi hook. Arrow function dùng this từ lexical scope (module level).',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Hooks không chạy với một số bulk operations: <code>updateMany()</code>,{' '}
          <code>deleteMany()</code>, <code>insertMany()</code> mặc định không trigger{' '}
          <code>pre('save')</code>. Nếu cần hook với bulk ops, dùng{' '}
          <code>{'{ runValidators: true }'}</code> option và handle trong{' '}
          <code>pre('updateMany')</code> riêng.
        </Callout>
        <Callout type="note">
          Soft delete pattern với query hooks rất mạnh: một lần khai báo <code>pre('find')</code>,{' '}
          toàn bộ queries tự filter deleted documents. Không cần sửa từng query. Nếu cần query
          deleted documents (admin), dùng{' '}
          <code>
            {'Post.find({ deletedAt: { $ne: null } }).setOptions({ bypassQueryHooks: true })'}
          </code>
          hoặc tạo method riêng.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Thêm pre("save") hook vào User schema để auto-lowercase email trước khi lưu (this.email = this.email.toLowerCase()). Test: tạo user với email "TEST@MAIL.COM", verify email lưu là "test@mail.com".',
            },
            {
              level: 'medium',
              text: 'Implement soft delete cho Post model: thêm deletedAt field, pre("find"/"findOne"/"countDocuments") hooks để exclude deleted docs. Viết Post.softDelete(id) static method set deletedAt = new Date(). Verify Post.find() không trả deleted posts.',
            },
            {
              level: 'hard',
              text: 'Implement audit log: post("save") hook ghi vào AuditLog collection: { model: "User", docId, action: "created"/"updated", changedFields: string[], timestamp }. Type IUser & Document để lấy this.isNew và this.modifiedPaths(). Dùng asyncHandler pattern trong hook.',
            },
          ]}
          hint="this.isNew — true nếu document chưa lưu bao giờ (mới tạo). this.modifiedPaths() — trả string[] tên các fields đã thay đổi. Dùng kết hợp để biết là 'created' hay 'updated' và fields nào thay đổi."
        />
      </Sec>
    </LessonCard>
  );
}
