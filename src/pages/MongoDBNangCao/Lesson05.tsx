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

const BASIC = `import { PipelineStage, Types } from 'mongoose';
import { Post } from '../models/Post';

// --- $lookup (aggregation JOIN) ---
// Dùng khi cần join nhiều collections, filter trên joined data, aggregate
const pipeline: PipelineStage[] = [
  { $match: { published: true } },
  {
    $lookup: {
      from:         'users',    // collection name (không phải model name)
      localField:   'author',   // field trong Post (ObjectId)
      foreignField: '_id',      // field trong User để match
      as:           'authorInfo', // output field — luôn là array!
    },
  },
  // $unwind để biến array[1] → object đơn
  { $unwind: '$authorInfo' },
  {
    $project: {
      title:           1,
      views:           1,
      'authorInfo.name':  1, // chỉ lấy name từ user
      'authorInfo.email': 1,
    },
  },
];

interface PostWithAuthor {
  _id:        Types.ObjectId;
  title:      string;
  views:      number;
  authorInfo: { name: string; email: string };
}

const posts = await Post.aggregate<PostWithAuthor>(pipeline);`;

const REAL = `import { Post } from '../models/Post';

// --- populate() — Mongoose convenience, dùng cho simple lookup ---
// Phù hợp khi: chỉ cần join 1-2 levels, không cần filter/aggregate trên joined data

// Bài 1: populate author trong 1 post
const post = await Post
  .findById(postId)
  .populate<{ author: { name: string; email: string; _id: string } }>(
    'author',
    'name email' // chỉ lấy 2 fields
  );

if (post) {
  console.log(post.author.name);  // typed!
  console.log(post.author.email); // typed!
}

// Bài 2: populate nhiều levels (author + author's profile)
const post2 = await Post
  .findById(postId)
  .populate({
    path:     'author',
    select:   'name email',
    populate: {         // nested populate
      path:   'profile',
      select: 'avatar bio',
    },
  });

// --- Khi nào dùng $lookup vs populate? ---
// populate:
//   ✅ Simple: 1-2 level join, không cần filter/aggregate trên joined data
//   ✅ Code ngắn gọn, dễ đọc
//   ❌ Nhiều queries (N+1 problem nếu dùng trong loop)
//   ❌ Không filter/sort dựa vào joined data

// $lookup:
//   ✅ Cần filter, sort, aggregate dựa vào joined data
//   ✅ 1 query duy nhất (efficient hơn với data lớn)
//   ✅ Kết hợp với $group, $match sau join
//   ❌ Verbose hơn, khó đọc hơn
//   ❌ Không dùng Mongoose virtuals/methods trên joined documents`;

const MISTAKE = `// ❌ Sai lầm 1: Dùng model name thay collection name trong $lookup
const pipeline = [
  {
    $lookup: {
      from: 'User',   // SAI — model name, không phải collection name!
      // MongoDB lưu collection tên lowercase + plural: 'users'
    },
  },
];

// ✅ Đúng: dùng collection name (lowercase + plural — Mongoose convention)
from: 'users'   // từ model 'User'
from: 'posts'   // từ model 'Post'
from: 'comments' // từ model 'Comment'

// ❌ Sai lầm 2: Quên $unwind sau $lookup — authorInfo là array!
const result = await Post.aggregate([
  { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'authorInfo' } },
  { $project: { 'authorInfo.name': 1 } }, // authorInfo là [{ name, email }] — array!
]);
result[0].authorInfo.name; // undefined! authorInfo là array, phải .authorInfo[0].name

// ✅ $unwind để flatten array → object đơn
{ $unwind: '$authorInfo' }
// Hoặc dùng $lookup với pipeline syntax (MongoDB 3.6+):
{
  $lookup: {
    from: 'users',
    let: { authorId: '$author' },
    pipeline: [
      { $match: { $expr: { $eq: ['$_id', '$$authorId'] } } },
      { $project: { name: 1, email: 1 } },
    ],
    as: 'authorInfo',
  },
}
// Sau đó $unwind hoặc dùng $first nếu luôn có 1 result

// ❌ Sai lầm 3: populate trong vòng lặp — N+1 query problem
const posts = await Post.find({ published: true });
for (const post of posts) {
  await post.populate('author'); // 1 query / post → 100 posts = 101 queries!
}

// ✅ populate trước khi loop
const posts = await Post.find({ published: true }).populate('author');
// Mongoose tự gom thành 1 query với $in: [authorId1, authorId2, ...]`;

export default function Lesson05({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-05-05"
      num="05"
      title="$lookup vs populate — khi nào dùng cái nào"
      desc="$lookup (aggregation JOIN) vs Mongoose populate — trade-offs, N+1 problem, nested populate"
      priority="medium"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Cả <code>$lookup</code> và <code>populate()</code> đều giải quyết cùng vấn đề: load related
        documents từ collection khác. <code>populate()</code> là Mongoose abstraction — ở dưới chạy
        nhiều queries, dễ dùng, TypeScript support tốt. <code>$lookup</code> là MongoDB native JOIN
        — chạy 1 query, mạnh hơn, dùng khi cần filter/aggregate trên joined data. Rule of thumb:
        dùng <code>populate()</code> cho simple cases, <code>$lookup</code> khi cần aggregation
        logic.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'populate(): Mongoose tạo query chính → lấy _ids của ref field → 1 query $in để load refs',
            '$lookup: MongoDB thực hiện hash join trực tiếp trên server — không round trip',
            '$lookup as field luôn là array — dùng $unwind để flatten nếu expect 1 result',
            'populate với TypeScript: .populate<{ field: Type }>("field") — generic type cho populated result',
            'Nested populate: { path: "author", populate: { path: "profile" } } — đệ quy',
            'N+1 problem: tránh populate trong vòng lặp — Mongoose tự batch với $in khi populate trước loop',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: '$lookup .ts', code: BASIC },
            { label: 'populate .ts', code: REAL },
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
                '$lookup from: "users" — đây là MongoDB collection name (lowercase + plural), không phải Mongoose model name. Mongoose tự pluralize và lowercase model name khi tạo collection. Model "User" → collection "users", Model "BlogPost" → collection "blogposts".',
            },
            {
              line: '2',
              explanation:
                'populate<{ author: Type }>("author") — generic type override cho TypeScript. Sau populate, post.author sẽ có type đã chỉ định thay vì Types.ObjectId. Cần vì TypeScript không thể tự suy luận type của populated field.',
            },
            {
              line: '3',
              explanation:
                'Nested populate { path, populate } — load sub-documents của sub-documents. Mỗi level thêm 1 query. Không nên quá 2-3 levels vì nhiều queries + data lớn. Với data phức tạp, $lookup pipeline approach hiệu quả hơn.',
            },
            {
              line: '4',
              explanation:
                'Mongoose batch populate: khi populate("author") trên array, Mongoose collect tất cả authorIds → 1 query { _id: { $in: [id1, id2, ...] } } → map kết quả về đúng post. Đây là lý do không cần N queries.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          <code>$lookup from</code> phải là MongoDB collection name thực tế (lowercase, plural).
          Dùng Mongoose convention: <code>modelName.collection.name</code> để lấy collection name
          programmatically thay vì hardcode string — tránh bug khi đổi tên model.
        </Callout>
        <Callout type="note">
          Muốn biết populate có dùng index không? Mongoose populate dùng <code>findById</code> hoặc{' '}
          <code>find({'{_id: {$in: [...]}}'})</code> — cả hai đều dùng <code>_id</code> index mặc
          định. Nếu populate theo field khác (không phải <code>_id</code>), cần thêm index cho field
          đó.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Viết GET /posts/:id với populate author (chỉ lấy name, email, avatar). Type kết quả với interface PostWithAuthor. Trả 404 nếu post không tồn tại.',
            },
            {
              level: 'medium',
              text: 'Viết $lookup pipeline: lấy top 5 posts theo views, kèm author name và email. Dùng $lookup + $unwind + $project. Type đầy đủ, collection name lấy từ User.collection.name.',
            },
            {
              level: 'hard',
              text: 'So sánh performance: implement GET /posts/list bằng 2 cách — (A) find().populate() và (B) $lookup pipeline. Đo thời gian với 1000 posts. Log ra difference. Viết comment lý giải khi nào A nhanh hơn B và ngược lại.',
            },
          ]}
          hint="Dùng User.collection.name thay vì hardcode 'users'. Ví dụ: { from: User.collection.name } — không bị bug nếu đổi tên model hay database naming convention."
        />
      </Sec>
    </LessonCard>
  );
}
