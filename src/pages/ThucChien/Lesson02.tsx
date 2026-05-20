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

const INTERFACES = `// src/types/index.ts — VIẾT INTERFACES TRƯỚC KHI VIẾT BẤT KỲ CODE NÀO

import { Types } from 'mongoose';

// ===== USER =====
export interface IUser {
  _id:       Types.ObjectId;
  name:      string;
  email:     string;
  password:  string;         // hashed, không trả về client
  bio?:      string;
  avatar?:   string;         // URL tới Cloudinary / local
  role:      'user' | 'admin';
  isActive:  boolean;        // soft ban bởi admin
  createdAt: Date;
  updatedAt: Date;
}

// ===== POST =====
export interface IPost {
  _id:        Types.ObjectId;
  title:      string;
  content:    string;
  slug:       string;        // URL-friendly, auto-generate từ title
  author:     Types.ObjectId | IUser;  // union: trước/sau populate
  tags:       string[];
  coverImage?: string;
  published:  boolean;
  viewCount:  number;
  likeCount:  number;        // denormalized — update khi toggle like
  createdAt:  Date;
  updatedAt:  Date;
}

// ===== COMMENT =====
export interface IComment {
  _id:       Types.ObjectId;
  post:      Types.ObjectId | IPost;
  author:    Types.ObjectId | IUser;
  content:   string;
  parentId?: Types.ObjectId; // null = top-level, có giá trị = reply
  createdAt: Date;
  updatedAt: Date;
}

// ===== LIKE =====
export interface ILike {
  _id:       Types.ObjectId;
  post:      Types.ObjectId;
  user:      Types.ObjectId;
  createdAt: Date;
}`;

const MODELS = `// src/models/User.ts
import { Schema, model, Model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';

// Instance methods
export interface IUserMethods {
  comparePassword(plain: string): Promise<boolean>;
}

// Static methods
interface UserModel extends Model<IUser, {}, IUserMethods> {
  findByEmail(email: string): Promise<(IUser & Document) | null>;
}

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name:     { type: String, required: true, trim: true, maxlength: 50 },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false }, // hidden by default
    bio:      { type: String, maxlength: 200 },
    avatar:   { type: String },
    role:     { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hash password trước khi save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Instance method
userSchema.methods.comparePassword = function (plain: string) {
  return bcrypt.compare(plain, this.password);
};

// Static method
userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() }).select('+password');
};

export const User = model<IUser, UserModel>('User', userSchema);`;

const POST_MODEL = `// src/models/Post.ts
import { Schema, model } from 'mongoose';
import { IPost } from '../types';

const postSchema = new Schema<IPost>(
  {
    title:      { type: String, required: true, trim: true, maxlength: 200 },
    content:    { type: String, required: true },
    slug:       { type: String, required: true, unique: true },
    author:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags:       [{ type: String, lowercase: true, trim: true }],
    coverImage: { type: String },
    published:  { type: Boolean, default: false },
    viewCount:  { type: Number, default: 0 },
    likeCount:  { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index cho performance
postSchema.index({ slug: 1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ published: 1, createdAt: -1 }); // feed chính

// Auto-generate slug từ title
postSchema.pre('validate', function (next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      + '-' + Date.now();
  }
  next();
});

export const Post = model<IPost>('Post', postSchema);

// src/models/Like.ts
import { Schema as LikeSchema, model as likeModel } from 'mongoose';
import { ILike } from '../types';

const likeSchema = new LikeSchema<ILike>(
  {
    post: { type: LikeSchema.Types.ObjectId, ref: 'Post', required: true },
    user: { type: LikeSchema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Unique constraint: 1 user chỉ like 1 post 1 lần
likeSchema.index({ post: 1, user: 1 }, { unique: true });

export const Like = likeModel<ILike>('Like', likeSchema);`;

export default function Lesson02({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-07-02"
      num="02"
      title="Database Design & Interfaces"
      desc="Interface-first: viết IUser, IPost, IComment, ILike trước — schema là dẫn xuất từ interface"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Nguyên tắc <strong>Interface-first design</strong>: viết TypeScript interfaces trước khi
        viết bất kỳ dòng implementation nào. Interface là <em>contract</em> — quyết định shape của
        data. Mongoose schema chỉ là cách hiện thực hóa contract đó với validation rules. Khi
        interface thay đổi, TypeScript compiler sẽ báo mọi chỗ cần update — không bỏ sót.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Vẽ sơ đồ quan hệ: User ←1:N→ Post ←1:N→ Comment, Post ←M:N→ Like',
            'Viết interface cho từng entity trong src/types/index.ts',
            'Quyết định: embed hay reference? Comment ref Post (1:N nhiều). Like ref cả Post và User.',
            'Viết Mongoose Schema với generic <IUser> — compiler check field names',
            'Thêm indexes phù hợp: slug unique, author+createdAt cho feed, tags cho search',
            'Thêm pre-save hooks: hash password, auto-generate slug',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: 'Tất cả Interfaces', code: INTERFACES },
            { label: 'User Model .ts', code: MODELS },
            { label: 'Post + Like Model .ts', code: POST_MODEL },
          ]}
        />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable
          rows={[
            {
              line: '1',
              explanation:
                'author: Types.ObjectId | IUser — union type. Trước populate: ObjectId (chỉ là ID). Sau populate: IUser (document đầy đủ). TypeScript bắt buộc check type trước khi dùng: if (typeof post.author === "object") { post.author.name }.',
            },
            {
              line: '2',
              explanation:
                'password: { select: false } — field này không được trả về trong queries mặc định. Phải explicit: User.findOne().select("+password") để lấy. Tránh vô tình leak password vào responses.',
            },
            {
              line: '3',
              explanation:
                'new Schema<IUser, UserModel, IUserMethods>() — 3 generics: document interface, model interface (statics), instance methods. TypeScript check schema fields khớp với interface. Thêm/xóa field ở interface → compile error ở schema.',
            },
            {
              line: '4',
              explanation:
                'likeSchema.index({ post, user }, { unique: true }) — compound unique index. MongoDB đảm bảo 1 user chỉ like 1 post 1 lần ở DB level, không phải chỉ ở application level. Atomic toggle: findOne → create hoặc delete.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Denormalized <code>likeCount</code> trong Post — phải update đồng bộ khi toggle like. Nếu
          quên update → likeCount không khớp với số like thực tế. Giải pháp tốt hơn cho scale:
          aggregate từ Like collection. Nhưng cho blog vừa, denormalization là trade-off chấp nhận
          được vì giảm query count khi load feed.
        </Callout>
        <Callout type="note">
          <strong>Embed vs Reference</strong>: Comment dùng reference (ref Post) vì số comment có
          thể rất lớn — embed sẽ làm Post document phình to, vượt 16MB limit. Tags dùng embed (array
          trong Post) vì tags ít và đọc cùng lúc với post. Không có quy tắc tuyệt đối — phân tích
          access pattern trước.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Tạo src/types/index.ts với đầy đủ 4 interfaces. Tạo Comment model với ref đến Post và User. Kết nối MongoDB và test User.create() — verify password được hash tự động trong pre-save hook.',
            },
            {
              level: 'medium',
              text: 'Viết static method User.findByEmail(email) trả IUser | null. Viết instance method user.comparePassword(plain) trả boolean. Test bằng cách tạo user, tìm bằng email, compare password đúng và sai.',
            },
            {
              level: 'hard',
              text: 'Implement slug auto-generation với collision avoidance: nếu slug "my-post-1234567890" đã tồn tại, thử "my-post-1234567891", lặp đến khi unique. Hint: viết generateUniqueSlug(title: string): Promise<string> helper.',
            },
          ]}
          hint="Types.ObjectId không phải string. Khi compare: post.author.toString() === userId. Hoặc dùng mongoose.Types.ObjectId.equals(). Hai ObjectId bằng nhau nhưng post.author === userId sẽ luôn false vì khác reference."
        />
      </Sec>
    </LessonCard>
  );
}
