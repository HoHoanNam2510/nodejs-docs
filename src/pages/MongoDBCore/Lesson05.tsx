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

const BASIC = `// src/models/User.ts — Model typing nâng cao với static methods
import { Schema, model, Model } from 'mongoose';

export interface IUser {
  name:     string;
  email:    string;
  password: string;
  role:     'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// Interface mở rộng Model với static methods riêng
interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
}

const userSchema = new Schema<IUser>(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

// Implement static method — this = Model object
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

// Model phải có 2 generic: document type + model type
export const User = model<IUser, IUserModel>('User', userSchema);

// Dùng static method — có type checking!
const user = await User.findByEmail('an@mail.com'); // IUser | null`;

const REAL = `// src/models/User.ts — Đầy đủ với instance methods
import { Schema, model, Model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  name:      string;
  email:     string;
  password:  string;
  role:      'user' | 'admin';
  isActive:  boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Interface cho instance methods (methods trên document instance)
export interface IUserMethods {
  comparePassword(plain: string): Promise<boolean>;
  toSafeObject(): Omit<IUser, 'password'>;
}

// Interface cho static methods (methods trên Model class)
interface IUserModel extends Model<IUser, {}, IUserMethods> {
  findByEmail(email: string): Promise<(Document<unknown> & IUser & IUserMethods) | null>;
  findActiveUsers(): Promise<(Document<unknown> & IUser & IUserMethods)[]>;
}

const userSchema = new Schema<IUser, IUserModel, IUserMethods>(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    role:     { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Instance method — this = document instance
userSchema.methods.comparePassword = async function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toSafeObject = function () {
  const { password, ...safe } = this.toObject();
  return safe;
};

// Static methods — this = Model
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email }).select('+password');
};

userSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

export const User = model<IUser, IUserModel>('User', userSchema);`;

const MISTAKE = `// ❌ Sai lầm 1: Định nghĩa static method với arrow function — this sẽ là undefined!
userSchema.statics.findByEmail = async (email: string) => {
  return this.findOne({ email }); // this = undefined hoặc outer scope
};

// ✅ Đúng: phải dùng function keyword để this = Model
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email }); // this = User Model
};

// ❌ Sai lầm 2: Dùng model<IUser> khi có custom methods — type không đầy đủ
export const User = model<IUser>('User', userSchema);
User.findByEmail('test@mail.com'); // TypeScript Error: Property 'findByEmail' does not exist

// ✅ Đúng: phải dùng cả 2 generics
export const User = model<IUser, IUserModel>('User', userSchema);
User.findByEmail('test@mail.com'); // OK — typed!

// ❌ Sai lầm 3: Instance method dùng arrow function — mất this context
userSchema.methods.comparePassword = async (plain: string) => {
  return bcrypt.compare(plain, this.password); // this.password = undefined!
};

// ✅ Đúng
userSchema.methods.comparePassword = async function (plain: string) {
  return bcrypt.compare(plain, this.password); // this = document
};`;

export default function Lesson05({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-04-05"
      num="05"
      title="Mongoose Model typing nâng cao — static và instance methods"
      desc="IUserModel extends Model<IUser>, statics, instance methods với TypeScript"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Mongoose có 2 loại custom methods: <strong>static methods</strong> gọi trên Model class (
        <code>User.findByEmail()</code>) và <strong>instance methods</strong> gọi trên document
        instance (<code>user.comparePassword()</code>). TypeScript yêu cầu khai báo cả hai vào
        interface riêng để type checking hoạt động. <code>{'Model<IUser>'}</code> một mình không đủ
        — phải dùng <code>{'model<IUser, IUserModel>()'}</code> với 2 generics.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Khai báo IUserMethods interface: các instance methods (comparePassword, toSafeObject)',
            'Khai báo IUserModel interface extends Model<IUser>: các static methods',
            'Khai báo Schema với 3 generics: Schema<IUser, IUserModel, IUserMethods>',
            'Implement methods: userSchema.methods.xxx = function() {...} (phải dùng function, không arrow)',
            'Implement statics: userSchema.statics.xxx = function() {...}',
            'Tạo Model với 2 generics: model<IUser, IUserModel>("User", userSchema)',
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
                'interface IUserModel extends Model<IUser> — kế thừa toàn bộ methods của Mongoose Model (find, findById, create...) và thêm custom static methods. TypeScript dùng interface này để type-check lời gọi User.findByEmail().',
            },
            {
              line: '2',
              explanation:
                'userSchema.statics.findByEmail = function(email) — assign function vào statics object. function keyword bắt buộc vì this phải là Model instance. Tên phải khớp với key trong IUserModel interface.',
            },
            {
              line: '3',
              explanation:
                "model<IUser, IUserModel>('User', userSchema) — 2 generic parameters: IUser cho document shape, IUserModel cho Model type (gồm static methods). Không có IUserModel → findByEmail không có trong type.",
            },
            {
              line: '4',
              explanation:
                'userSchema.methods.comparePassword = function(plain) — assign vào methods object. this = document instance, có thể access this.password, this.name... Arrow function không làm được vì this binding khác.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          <strong>Không dùng arrow function</strong> cho <code>statics</code> và{' '}
          <code>methods</code>. Arrow function capture <code>this</code> từ lexical scope (module
          level), không phải Model hoặc document. Kết quả: <code>this.findOne</code> là{' '}
          <code>undefined</code> → TypeError runtime.
        </Callout>
        <Callout type="note">
          Static methods phù hợp cho các query phổ biến, tái sử dụng nhiều nơi:{' '}
          <code>findByEmail</code>, <code>findActiveUsers</code>. Instance methods phù hợp cho
          operation trên document đó: <code>comparePassword</code>, <code>toSafeObject</code>,{' '}
          <code>generateResetToken</code>.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Thêm static method findByRole(role: "user" | "admin") vào User model trả về danh sách users có role đó. Type đúng trong IUserModel interface.',
            },
            {
              level: 'medium',
              text: 'Thêm instance method toSafeObject() trả về IUser object không có password field. Return type là Omit<IUser, "password">. Dùng trong login route để response không lộ password.',
            },
            {
              level: 'hard',
              text: 'Thêm static method paginate(page: number, limit: number, filter?: FilterQuery<IUser>) trả về { data: IUser[], total: number, pages: number }. Implement đúng TypeScript generics.',
            },
          ]}
          hint="Omit<IUser, 'password'> là utility type tạo type mới từ IUser nhưng bỏ field 'password'. Nếu cần bỏ nhiều fields: Omit<IUser, 'password' | 'resetToken'>."
        />
      </Sec>
    </LessonCard>
  );
}
