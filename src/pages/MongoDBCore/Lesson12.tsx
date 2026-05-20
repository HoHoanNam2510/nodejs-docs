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

const BASIC = `// Populate — thay thế ObjectId bằng document thật
import { Post, IPost } from '../models/Post';
import { IUser } from '../models/User';
import { Types } from 'mongoose';

// Interface IPost khai báo author là ObjectId TRƯỚC khi populate
export interface IPost {
  title:  string;
  author: Types.ObjectId;  // reference — chưa populate
}

// Sau populate, author là IUser thay vì ObjectId
// TypeScript cần generic để biết type sau populate:
const post = await Post.findById(id)
  .populate<{ author: IUser }>('author'); // generic = { field: Type }

// TypeScript biết post.author là IUser
if (post) {
  console.log(post.author.name);  // string — typed!
  console.log(post.author.email); // string — typed!
}

// Populate với select — chỉ lấy một số fields của author
const post2 = await Post.findById(id)
  .populate<{ author: Pick<IUser, 'name' | 'email'> }>('author', 'name email');`;

const REAL = `// src/models/Post.ts — khai báo interface với union type
import { Schema, model, Types } from 'mongoose';
import { IUser } from './User';

// author có thể là ObjectId (chưa populate) hoặc IUser (đã populate)
export interface IPost {
  title:     string;
  content:   string;
  author:    Types.ObjectId | IUser; // union — trước và sau populate
  tags:      string[];
  published: boolean;
  views:     number;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    title:     { type: String, required: true },
    content:   { type: String, required: true },
    author:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags:      [String],
    published: { type: Boolean, default: false },
    views:     { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Post = model<IPost>('Post', postSchema);

// ── Trong controller — populate với generic ────────────────────────────────────

// Populate 1 field
const post = await Post.findById(id)
  .populate<{ author: IUser }>('author', 'name email avatar');

// Populate nhiều fields
const postFull = await Post.findById(id)
  .populate<{ author: IUser }>('author', 'name email')
  .populate<{ tags: string[] }>('tags'); // nếu tags là ref (không phải string)

// Populate nested — author.followers
const postDeep = await Post.findById(id)
  .populate<{ author: IUser & { followers: IUser[] } }>({
    path:     'author',
    select:   'name email',
    populate: { path: 'followers', select: 'name' }, // nested populate
  });

// List posts với author populated
const posts = await Post.find({ published: true })
  .populate<{ author: Pick<IUser, 'name' | 'email'> }>('author', 'name email')
  .sort({ createdAt: -1 })
  .limit(10);
// posts[0].author.name — typed!`;

const MISTAKE = `// ❌ Sai lầm 1: Không dùng generic → author vẫn là ObjectId type
const post = await Post.findById(id).populate('author');
// TypeScript: post.author vẫn là Types.ObjectId | IUser (union)
post?.author.name; // TypeScript Error — ObjectId không có .name

// ✅ Đúng: dùng generic để narrow type
const post = await Post.findById(id).populate<{ author: IUser }>('author');
post?.author.name; // string — TypeScript biết đây là IUser

// ❌ Sai lầm 2: Populate không check null sau khi populate
const post = await Post.findById(id).populate('author');
console.log(post.author); // TypeError: Cannot read 'author' of null

// ✅ Đúng: null check trước
const post = await Post.findById(id).populate<{ author: IUser }>('author');
if (!post) throw new AppError('Post not found', 404);
console.log(post.author.name); // safe

// ❌ Sai lầm 3: Populate trong vòng lặp — N+1 query problem!
const posts = await Post.find();
for (const post of posts) {
  const author = await User.findById(post.author); // N queries cho N posts!
}

// ✅ Đúng: populate ngay trong query — 2 queries total (1 find posts, 1 find all authors)
const posts = await Post.find().populate<{ author: IUser }>('author');`;

export default function Lesson12({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-04-12"
      num="12"
      title="Populate với TypeScript — generic populate<{ field: Type }>()"
      desc="populate generic, Types.ObjectId | IUser union, nested populate, tránh N+1 query"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        <code>populate()</code> thay thế ObjectId reference bằng document thật từ collection khác —
        tương tự JOIN trong SQL. Với TypeScript, phải dùng generic{' '}
        <code>{'populate<{ fieldName: Type }>()'}</code> để TypeScript biết type của field sau khi
        populate. Không có generic, TypeScript giữ nguyên type từ interface (thường là{' '}
        <code>Types.ObjectId | IUser</code>) và không cho phép access properties như{' '}
        <code>.name</code> trực tiếp.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Schema khai báo ref: author: { type: Schema.Types.ObjectId, ref: "User" }',
            'IPost interface: author là Types.ObjectId | IUser (union — trước và sau populate)',
            'Query: Post.findById(id).populate<{ author: IUser }>("author")',
            'Mongoose tìm post → thấy author ObjectId → query User collection → replace ObjectId bằng User document',
            'TypeScript generic: sau populate, post.author có type IUser thay vì union',
            'Kết quả: post.author.name, post.author.email — fully typed',
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
                'author: Types.ObjectId | IUser — union type trong interface. Trước populate: author là ObjectId (12-byte). Sau populate: author là IUser document. TypeScript dùng union vì cả 2 state đều có thể xảy ra.',
            },
            {
              line: '2',
              explanation:
                ".populate<{ author: IUser }>('author') — generic object map: key = field name, value = expected type sau populate. TypeScript dùng generic này để narrow type trong result.",
            },
            {
              line: '3',
              explanation:
                "ref: 'User' trong schema — Mongoose biết collection nào để query khi populate. 'User' phải khớp với tên model (model('User', ...)) chứ không phải collection name.",
            },
            {
              line: '4',
              explanation:
                ".populate('author', 'name email') — đối số thứ 2 là select string. Chỉ lấy name và email của author — giảm data transfer. Tương đương .select('name email') cho sub-document.",
            },
            {
              line: '5',
              explanation:
                'Populate ngay trong query — Mongoose thực hiện 2 queries: 1 cho posts, 1 cho tất cả authors. Nhanh hơn N+1 (1 query post + N queries cho N authors) rất nhiều.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          <strong>N+1 query problem</strong>: Không populate trong query mà populate thủ công trong
          vòng lặp → 1 query lấy danh sách + N queries lấy từng author = N+1 queries. Với 100 posts:
          101 queries vs 2 queries nếu dùng <code>populate()</code>. Hiệu năng sụt mạnh khi data
          lớn.
        </Callout>
        <Callout type="note">
          Khi nào dùng <code>populate()</code> vs <code>$lookup</code> (aggregation)?{' '}
          <code>populate()</code> đơn giản hơn, TypeScript support tốt hơn — dùng cho hầu hết cases.{' '}
          <code>$lookup</code> mạnh hơn khi cần filter/transform trên related documents trước khi
          join — nhưng phức tạp và kém type-safe hơn. Xem thêm ở Module 05.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Thêm populate vào GET /posts/:id: populate author với chỉ name và email. TypeScript generic đúng. Test với Postman — verify author trong response là object, không phải ObjectId string.',
            },
            {
              level: 'medium',
              text: 'Viết GET /posts với author populated và comments count. Dùng virtual field trên Post schema: commentsCount = await Comment.countDocuments({ post: this._id }). Hoặc dùng $lookup aggregate để join.',
            },
            {
              level: 'hard',
              text: 'Implement nested populate: GET /posts/:id trả post với author (name, email) và author.followers (name). TypeScript type: author: IUser & { followers: Pick<IUser, "name">[] }. Đảm bảo không over-populate (không load toàn bộ followers data).',
            },
          ]}
          hint="Nested populate: .populate({ path: 'author', select: 'name email followers', populate: { path: 'followers', select: 'name', options: { limit: 10 } } }). Luôn giới hạn nested populate để không bị over-fetch."
        />
      </Sec>
    </LessonCard>
  );
}
