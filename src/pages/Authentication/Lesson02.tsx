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

const BASIC = `import bcrypt from 'bcryptjs'; // dùng bcryptjs — no native deps, bundled types

// --- Hash password ---
const plainPassword = 'mySecret123!';
const saltRounds = 10; // cost factor — số lần hash lặp (2^10 = 1024 lần)

const hashedPassword: string = await bcrypt.hash(plainPassword, saltRounds);
// '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
// ^--^ algorithm (bcrypt v2b)
//     ^--^ cost factor (10)
//         ^-- 22 chars salt (random, embedded in hash)
//                           ^-- 31 chars hash result

// --- Verify password ---
const isMatch: boolean = await bcrypt.compare(plainPassword, hashedPassword);
// true: password khớp
// false: password sai

// --- Compare với wrong password ---
const isWrong: boolean = await bcrypt.compare('wrongPassword', hashedPassword);
// false`;

const REAL = `// src/models/User.ts — tích hợp bcrypt vào Mongoose pre-save hook

import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  name:      string;
  email:     string;
  password:  string;
  role:      'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// Thêm method comparePassword vào interface
export interface IUserMethods {
  comparePassword(plain: string): Promise<boolean>;
}

const userSchema = new Schema<IUser, unknown, IUserMethods>(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 8 },
    role:     { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

// --- Pre-save hook: hash password tự động ---
userSchema.pre('save', async function (this: IUser & Document, next) {
  // Chỉ hash khi password field thay đổi (tránh double-hash)
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// --- Instance method: compare password ---
userSchema.methods.comparePassword = async function (plain: string): Promise<boolean> {
  return bcrypt.compare(plain, this.password);
};

export const User = model<IUser, import('mongoose').Model<IUser, unknown, IUserMethods>>(
  'User',
  userSchema
);

// --- Dùng trong controller ---
const user = await User.findOne({ email });
if (!user) throw new AppError('Email không tồn tại', 404);
const isMatch = await user.comparePassword(req.body.password);
if (!isMatch) throw new AppError('Mật khẩu sai', 401);`;

const MISTAKE = `// ❌ Sai lầm 1: Hash password nhiều lần (double hashing)
userSchema.pre('save', async function (next) {
  this.password = await bcrypt.hash(this.password, 10); // hash lần 1
  next();
});

// Sau đó trong controller:
const hashed = await bcrypt.hash(req.body.password, 10); // hash lần 2 ❌
await User.create({ password: hashed }); // lưu hash của hash!

// ✅ Chỉ hash 1 lần — trong pre-save hook, kiểm tra isModified trước
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // bắt buộc!
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Controller chỉ truyền plaintext — hook tự hash:
await User.create({ name, email, password: req.body.password });

// ❌ Sai lầm 2: So sánh password bằng === (plaintext vs hash)
if (user.password === req.body.password) { ... } // luôn false!

// ✅ Dùng bcrypt.compare — nó tự extract salt từ hash và re-hash
const isMatch = await bcrypt.compare(req.body.password, user.password);

// ❌ Sai lầm 3: Cost factor quá thấp
await bcrypt.hash(password, 1); // quá nhanh — dễ brute force

// ✅ Cost factor 10–12 là cân bằng tốt (test: ~100ms per hash)
// Cost factor 12+ cho sensitive apps (banking)
await bcrypt.hash(password, 10);`;

export default function Lesson02({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-06-02"
      num="02"
      title="bcrypt với TypeScript"
      desc="bcryptjs hash/compare, cost factor, tích hợp pre-save hook, instance method comparePassword"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        bcrypt là thuật toán hash một chiều được thiết kế đặc biệt cho password. Khác với MD5/SHA
        (nhanh — dễ brute force), bcrypt có <strong>cost factor</strong> kiểm soát độ chậm: cost=10
        nghĩa là hash chạy 2^10 = 1024 vòng. Càng chậm → brute force càng tốn thời gian. Quan trọng:
        bcrypt tự embed <strong>random salt</strong> vào hash — cùng password, 2 lần hash cho 2 kết
        quả khác nhau (chống rainbow table). Dùng <code>bcryptjs</code> thay <code>bcrypt</code> —
        không cần native dependencies, TypeScript types bundled sẵn.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'bcrypt.hash(password, 10) — generate random salt → hash password 2^10 lần → trả string',
            'Hash result chứa: algorithm + cost factor + salt + hashed value (tất cả trong 1 string)',
            'Lưu hash string vào DB — không bao giờ lưu plaintext password',
            'Khi verify: bcrypt.compare(plain, hash) — extract salt từ hash → re-hash plain → so sánh',
            'compare() trả true/false — không cần biết salt (embedded trong hash)',
            'Pre-save hook trong Mongoose: tự động hash trước khi lưu — controller không cần biết',
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
                'bcrypt.hash(password, saltRounds): saltRounds = cost factor. Tăng 1 đơn vị = tốn gấp đôi thời gian. Cost 10 ≈ 100ms/hash trên máy thường — đủ chậm để brute force không khả thi, đủ nhanh cho UX tốt.',
            },
            {
              line: '2',
              explanation:
                'bcrypt.compare(plain, hash): extract 22-char salt từ hash string → re-hash plain với salt đó → so sánh result với phần hash trong stored string. Không cần lưu salt riêng — mọi thứ embedded trong 60-char hash string.',
            },
            {
              line: '3',
              explanation:
                'if (!this.isModified("password")) return next(): bắt buộc trong pre-save hook. Nếu không có check này, mỗi lần user.save() (kể cả update name/email) đều re-hash password — dẫn đến double hash.',
            },
            {
              line: '4',
              explanation:
                'userSchema.methods.comparePassword: instance method — gọi được trên từng document (user.comparePassword(plain)). this bên trong là document instance — truy cập được this.password (hash từ DB).',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          <strong>Double hashing</strong> là lỗi phổ biến nhất: hash trong controller rồi lại hash
          trong pre-save hook. Kết quả: lưu "hash của hash" — <code>compare()</code> luôn trả{' '}
          <code>false</code> khi login dù nhập đúng password. Quy tắc: chỉ hash 1 nơi — trong
          pre-save hook, kiểm tra <code>isModified</code> bắt buộc.
        </Callout>
        <Callout type="note">
          <code>bcryptjs</code> vs <code>bcrypt</code>: <code>bcrypt</code> là C++ binding — nhanh
          hơn ~30% nhưng cần build tools (python, node-gyp). <code>bcryptjs</code> là pure JS — chạy
          mọi nơi không cần native deps, TypeScript types bundled. Cho Node.js backend,{' '}
          <code>bcryptjs</code> là lựa chọn thực tế hơn.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Cài bcryptjs, viết script hash password "hello123" với cost 10, 12, 14. Đo thời gian mỗi cost bằng Date.now(). Nhận xét về trade-off performance vs security.',
            },
            {
              level: 'medium',
              text: 'Thêm comparePassword instance method vào User schema trong Blog API. Test: tạo user → login với đúng password → login với sai password → verify result. Đảm bảo pre-save hook không double-hash.',
            },
            {
              level: 'hard',
              text: 'Implement password change endpoint: PUT /users/password với body { currentPassword, newPassword }. Yêu cầu: verify currentPassword trước khi cho phép đổi. Nếu sai currentPassword → 401. Nếu newPassword trùng currentPassword → 400 "Mật khẩu mới phải khác mật khẩu cũ".',
            },
          ]}
          hint="bcrypt.getRounds(hash) trả về cost factor của hash đã tạo — dùng để verify hash không bị double-hash. Nếu cost = 20 thay vì 10, đã bị hash 2 lần."
        />
      </Sec>
    </LessonCard>
  );
}
