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

const BASIC = `import { Schema, model, Model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface 1: Document data fields
export interface IUser {
  name:      string;
  email:     string;
  password:  string;
  firstName: string;
  lastName:  string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface 2: Instance methods (gọi trên document instance)
export interface IUserMethods {
  comparePassword(plain: string): Promise<boolean>;
  getFullName(): string;
}

// Interface 3: Static methods (gọi trên Model class)
interface IUserStatics extends Model<IUser, object, IUserMethods> {
  findByEmail(email: string): Promise<(IUser & IUserMethods & Document) | null>;
}

// 3-generic Schema: <DocType, QueryHelpers, InstanceMethods>
const userSchema = new Schema<IUser, IUserStatics, IUserMethods>(
  {
    name:      { type: String, required: true },
    email:     { type: String, required: true, unique: true },
    password:  { type: String, required: true },
    firstName: String,
    lastName:  String,
  },
  { timestamps: true }
);

// --- Instance methods ---
userSchema.methods.comparePassword = async function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.getFullName = function (): string {
  return \`\${this.firstName} \${this.lastName}\`.trim() || this.name;
};

// --- Static method ---
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// --- Virtual (computed property, không lưu vào DB) ---
userSchema.virtual('fullName').get(function (this: IUser) {
  return \`\${this.firstName} \${this.lastName}\`.trim();
});

// Model với 2 generics: <DocType, ModelType>
export const User = model<IUser, IUserStatics>('User', userSchema);`;

const REAL = `// Cách sử dụng instance methods và statics
import { User } from '../models/User';

// Static method
const user = await User.findByEmail('test@mail.com');
if (!user) throw new AppError('Không tìm thấy user', 404);

// Instance method — gọi trên document instance
const isMatch = await user.comparePassword('mypassword123');
if (!isMatch) throw new AppError('Mật khẩu không đúng', 401);

const fullName = user.getFullName(); // instance method
console.log(fullName); // 'Nguyễn Văn An'

// Virtual — truy cập như property bình thường
console.log(user.fullName); // 'Nguyễn Văn An'
// Nhưng user.toObject() KHÔNG có virtual mặc định!

// Để include virtuals trong toObject() / toJSON():
const userSchema = new Schema<IUser, ...>({ ... }, {
  timestamps: true,
  toJSON:     { virtuals: true }, // virtual xuất hiện khi res.json()
  toObject:   { virtuals: true }, // virtual xuất hiện khi .toObject()
});

// Virtual trong interface (cần thêm vào IUser nếu muốn typed)
export interface IUser {
  // ... các fields ...
  fullName?: string; // virtual — optional vì không luôn có trong toObject
}`;

const MISTAKE = `// ❌ Sai lầm 1: Dùng arrow function trong methods/statics
userSchema.methods.comparePassword = async (plain: string) => {
  return bcrypt.compare(plain, this.password);
  // this là module scope → this.password là undefined!
};

// ✅ Dùng function expression — Mongoose bind 'this' = document instance
userSchema.methods.comparePassword = async function (plain: string) {
  return bcrypt.compare(plain, this.password);
};

// ❌ Sai lầm 2: Model với 1 generic — mất type cho methods
const User = model<IUser>('User', userSchema);
const user = await User.findByEmail('test@mail.com'); // Error: findByEmail không tồn tại!
await user?.comparePassword('pw'); // Error: comparePassword không tồn tại!

// ✅ Model với 2 generics — TypeScript nhận static methods
const User = model<IUser, IUserStatics>('User', userSchema);
const user = await User.findByEmail('test@mail.com'); // OK, typed!

// ❌ Sai lầm 3: Expect virtual trong toObject() mà không bật option
const user = await User.findById(id);
const obj = user?.toObject();
console.log(obj?.fullName); // undefined! virtual không có trong toObject mặc định

// ✅ Enable virtuals trong schema options
new Schema({ ... }, {
  toJSON:   { virtuals: true },
  toObject: { virtuals: true },
})

// ❌ Sai lầm 4: Forget to add virtual to interface — TypeScript không biết
const user = await User.findById(id);
user.fullName; // TypeScript Error: Property 'fullName' does not exist on type 'IUser'

// ✅ Add virtual to interface as optional
interface IUser {
  fullName?: string; // virtual property
}`;

export default function Lesson07({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-05-07"
      num="07"
      title="Virtuals và instance methods với TypeScript"
      desc="3-generic Schema pattern, IUserMethods, IUserStatics extends Model, virtual properties"
      priority="medium"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Mongoose cho phép thêm custom logic vào Model theo 3 cách: <strong>Instance methods</strong>{' '}
        (gọi trên document — <code>user.comparePassword()</code>), <strong>Static methods</strong>{' '}
        (gọi trên Model class — <code>User.findByEmail()</code>), và <strong>Virtuals</strong>{' '}
        (computed properties không lưu DB — <code>user.fullName</code>). Với TypeScript, cần 3
        interfaces riêng biệt và pattern <em>3-generic Schema</em>:{' '}
        <code>{'Schema<IUser, IUserStatics, IUserMethods>'}</code>.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Khai báo 3 interfaces: IUser (data), IUserMethods (instance), IUserStatics extends Model (static)',
            'Tạo Schema với 3 generics: new Schema<IUser, IUserStatics, IUserMethods>({...})',
            'Gán methods: schema.methods.methodName = function() {...} (function, không arrow)',
            'Gán statics: schema.statics.methodName = function() {...}',
            'Gán virtuals: schema.virtual("fieldName").get(function() { return ... })',
            'Export model: model<IUser, IUserStatics>("User", schema) — 2 generics cho full type',
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
                'IUserMethods interface — định nghĩa shape của instance methods. Mỗi method là function signature. TypeScript dùng interface này để type-check khi gọi user.comparePassword() hay user.getFullName().',
            },
            {
              line: '2',
              explanation:
                'IUserStatics extends Model<IUser, object, IUserMethods> — static methods interface. extends Model<...> để TypeScript biết đây là Mongoose Model có đầy đủ static methods (find, findById, create...) + các statics tùy chỉnh.',
            },
            {
              line: '3',
              explanation:
                'new Schema<IUser, IUserStatics, IUserMethods> — 3-generic pattern. Generic 1: document type (IUser). Generic 2: model type với statics (IUserStatics). Generic 3: instance methods (IUserMethods). Cần cả 3 để TypeScript type đầy đủ.',
            },
            {
              line: '4',
              explanation:
                'schema.virtual("fullName").get(function(this: IUser) {...}) — virtual getter. function, không arrow. this là document. Virtual không persist vào MongoDB — tính toán runtime khi truy cập. Cần { toJSON: { virtuals: true } } để xuất hiện trong JSON response.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Virtual properties <strong>không có trong</strong> kết quả của{' '}
          <code>User.aggregate()</code> — aggregation chạy trực tiếp trên MongoDB, không qua
          Mongoose layer. Để có virtual trong aggregation, phải tính trong <code>$project</code>{' '}
          stage.
        </Callout>
        <Callout type="note">
          Instance methods nên chứa logic liên quan đến document cụ thể (so sánh password, format
          output). Static methods nên chứa queries/tìm kiếm (findByEmail, findActive). Không trộn
          lẫn — giúp code dễ test và tái sử dụng.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Thêm virtual "postCount" vào User model (ban đầu return 0 — sẽ populate sau). Thêm instance method toSafeObject() trả IUser không có password field. Enable virtuals trong toJSON option.',
            },
            {
              level: 'medium',
              text: 'Viết IPostMethods với: isOwnedBy(userId: string): boolean (check author), incrementViews(): Promise<void> (tăng views +1 và save), truncatedContent(maxLength: number): string. Implement và type với 3-generic Schema pattern.',
            },
            {
              level: 'hard',
              text: 'Implement User.findWithPostCount() static method dùng aggregation $lookup để join posts collection và trả UserWithPostCount[] typed. Interface UserWithPostCount extends IUser với thêm field postCount: number. So sánh với virtual approach.',
            },
          ]}
          hint="toSafeObject() pattern: const { password, __v, ...safe } = this.toObject({ virtuals: false }); return safe as Omit<IUser, 'password'>. Hoặc dùng this.toObject() rồi delete obj.password — nhưng Object destructure sạch hơn."
        />
      </Sec>
    </LessonCard>
  );
}
