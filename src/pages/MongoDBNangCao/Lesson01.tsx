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

export interface IUser {
  name:     string;
  email:    string;
  username: string;
  bio?:     string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true },
    username: { type: String, required: true },
    bio:      String,
  },
  { timestamps: true }
);

// --- Single-field indexes ---
userSchema.index({ email: 1 }, { unique: true });    // unique email
userSchema.index({ username: 1 }, { unique: true }); // unique username
userSchema.index({ createdAt: -1 });                 // sort by newest first

// --- Compound index (2+ fields) ---
userSchema.index({ name: 1, createdAt: -1 });

// --- Text search index ---
userSchema.index({ name: 'text', bio: 'text' });

export const User = model<IUser>('User', userSchema);`;

const REAL = `import { Schema, model, Types } from 'mongoose';

export interface IPost {
  title:     string;
  slug:      string;
  content:   string;
  author:    Types.ObjectId;
  tags:      string[];
  views:     number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    title:     { type: String, required: true },
    slug:      { type: String, required: true },
    content:   { type: String, required: true },
    author:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags:      [String],
    views:     { type: Number, default: 0 },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Unique slug — mỗi bài viết có URL riêng
postSchema.index({ slug: 1 }, { unique: true });

// Tìm bài của tác giả sắp xếp theo mới nhất
postSchema.index({ author: 1, createdAt: -1 });

// Lọc bài published + sắp xếp theo view
postSchema.index({ published: 1, views: -1 });

// Full-text search trên title + content
postSchema.index({ title: 'text', content: 'text' });

export const Post = model<IPost>('Post', postSchema);

// --- Sử dụng text search ---
const results = await Post.find(
  { $text: { $search: 'typescript express' } },
  { score: { $meta: 'textScore' } }
).sort({ score: { $meta: 'textScore' } });`;

const MISTAKE = `// ❌ Sai lầm 1: Index trên field thường xuyên update với write-heavy collection
// Mỗi index làm chậm write operation vì MongoDB cập nhật tất cả indexes khi insert/update
userSchema.index({ lastSeenAt: 1 }); // nếu update mỗi request → quá nhiều index writes

// ✅ Chỉ index fields dùng trong where/sort thường xuyên
// Rule of thumb: <= 5 indexes per collection (trừ collection read-heavy)

// ❌ Sai lầm 2: Sparse index không đúng cách
// Nếu field là optional, dùng sparse: true để không index null values
postSchema.index({ deletedAt: 1 }); // index cả document null deletedAt → lãng phí

// ✅ Đúng
postSchema.index({ deletedAt: 1 }, { sparse: true }); // chỉ index document có deletedAt

// ❌ Sai lầm 3: Compound index sai thứ tự field
// MongoDB dùng leftmost prefix rule — compound index (a, b, c) hỗ trợ query trên:
// a, (a, b), (a, b, c) — nhưng KHÔNG hỗ trợ b hoặc c đơn lẻ
postSchema.index({ views: -1, author: 1 });
// Query: find({ author: userId }) → KHÔNG dùng được index này!

// ✅ Đặt field filter trước, field sort sau
postSchema.index({ author: 1, views: -1 }); // find({ author }) → có index!`;

export default function Lesson01({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-05-01"
      num="01"
      title="Indexes với TypeScript"
      desc="Single-field, compound, text index — MongoDB query performance với Mongoose TypeScript"
      priority="medium"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Index trong MongoDB tương tự B-tree index trong SQL — giúp MongoDB tìm documents nhanh mà
        không phải scan toàn bộ collection (collection scan). Với Mongoose + TypeScript, định nghĩa
        index ngay trong schema bằng <code>schema.index()</code>. Khi gọi{' '}
        <code>mongoose.connect()</code>, Mongoose tự đồng bộ indexes với MongoDB (gọi là{' '}
        <em>ensureIndexes</em>). Có 4 loại index phổ biến: single-field, compound (nhiều fields),
        text search, và geospatial.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Định nghĩa Schema với TypeScript interface — xác định fields cần index',
            'Thêm schema.index({field: 1/-1}, {options}) sau schema definition',
            'Khi app start + mongoose.connect() → Mongoose gọi createIndex() trên MongoDB',
            'MongoDB duy trì index B-tree — tự cập nhật khi insert/update/delete',
            'Query với .find({indexedField}) → MongoDB dùng index plan thay vì COLLSCAN',
            'Dùng .explain("executionStats") để verify index được dùng hay không',
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
                'schema.index({email: 1}, {unique: true}) — 1 = ascending, -1 = descending. unique: true tạo unique constraint: MongoDB throw error nếu insert document trùng email.',
            },
            {
              line: '2',
              explanation:
                'Compound index {author: 1, createdAt: -1} — hỗ trợ query find({author}) và find({author}).sort({createdAt: -1}). Leftmost prefix rule: field đầu tiên phải có mặt trong query.',
            },
            {
              line: '3',
              explanation:
                'Text index {title: "text", content: "text"} — cho phép full-text search bằng $text operator. Mỗi collection chỉ có 1 text index (nhưng có thể gộp nhiều fields).',
            },
            {
              line: '4',
              explanation:
                '$text: {$search: "typescript express"} — tìm documents chứa cả hai từ. {score: {$meta: "textScore"}} — thêm relevance score vào result. Sort theo score để kết quả liên quan nhất lên đầu.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Thêm index vào collection lớn đang chạy production có thể block database. Dùng{' '}
          <code>{'{background: true}'}</code> option để build index nền (không block reads/writes).
          MongoDB 4.2+ luôn build background — option này không còn cần thiết nhưng không có hại.
        </Callout>
        <Callout type="note">
          Xem indexes hiện có: <code>db.collection.getIndexes()</code> trong MongoDB shell. Trong
          Mongoose: <code>await User.listIndexes()</code> — trả array of index definitions. Đây là
          cách debug khi query vẫn chậm dù đã thêm index.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Thêm indexes cho IPost schema: unique slug, compound (author + createdAt descending), và text index trên title. Verify bằng cách log User.collection.getIndexes() khi app start.',
            },
            {
              level: 'medium',
              text: 'Implement GET /posts/search?q=keyword endpoint dùng $text search. Response trả posts sorted theo textScore. Thêm TypeScript type cho query object { $text: { $search: string } }.',
            },
            {
              level: 'hard',
              text: 'Benchmark query không có index vs có index: tạo 10,000 posts, đo thời gian find({author: id}).sort({createdAt: -1}) trước và sau khi thêm compound index {author: 1, createdAt: -1}. Dùng Date.now() và .explain("executionStats") để so sánh nMiliseconds và totalDocsExamined.',
            },
          ]}
          hint="Dùng mongoose.connection.on('open', async () => { const indexes = await Post.listIndexes(); console.log(indexes); }) để xem indexes đã được tạo khi app connect MongoDB."
        />
      </Sec>
    </LessonCard>
  );
}
