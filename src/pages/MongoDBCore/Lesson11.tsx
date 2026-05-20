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

const BASIC = `// Pagination cơ bản với skip + limit
import { Post, IPost } from '../models/Post';

const page  = Number(req.query.page)  || 1;  // default page 1
const limit = Number(req.query.limit) || 10; // default 10 items/page
const skip  = (page - 1) * limit;            // items bỏ qua

// Query với pagination
const [posts, total] = await Promise.all([
  Post.find({ published: true })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-__v'),
  Post.countDocuments({ published: true }),
]);

const totalPages = Math.ceil(total / limit);

res.json({
  data:       posts,
  pagination: {
    total,
    page,
    limit,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  },
});`;

const REAL = `// Generic paginate<T> function — dùng được cho bất kỳ model nào
import { Model, FilterQuery } from 'mongoose';

interface PaginationOptions {
  page:  number;
  limit: number;
  sort?: Record<string, 1 | -1>;
  select?: string;
}

interface PaginationResult<T> {
  data:       T[];
  pagination: {
    total:      number;
    page:       number;
    limit:      number;
    totalPages: number;
    hasNext:    boolean;
    hasPrev:    boolean;
  };
}

export async function paginate<T>(
  model:   Model<T>,
  filter:  FilterQuery<T>,
  options: PaginationOptions
): Promise<PaginationResult<T>> {
  const {
    page  = 1,
    limit = 10,
    sort  = { createdAt: -1 },
    select,
  } = options;

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select(select ?? '-__v') as unknown as Promise<T[]>,
    model.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

// Dùng trong controller — type-safe!
const result = await paginate<IPost>(
  Post,
  { published: true },
  { page: 1, limit: 10, sort: { views: -1 } }
);
// result.data là IPost[]
// result.pagination có đầy đủ typed fields`;

const MISTAKE = `// ❌ Sai lầm 1: Offset pagination với dữ liệu thay đổi liên tục
// Nếu user ở page 2, ai đó xóa 1 post ở page 1
// → skip(10) bỏ qua post mới lên đầu → user thấy post bị duplicate hoặc miss

// ✅ Cursor-based pagination — dùng _id để page
// Lần đầu: Post.find().limit(10).sort({ _id: -1 })
// Lần sau: Post.find({ _id: { $lt: lastId } }).limit(10).sort({ _id: -1 })
// Không bị lệch dù data thay đổi — nhưng không thể nhảy đến page tùy ý

// ❌ Sai lầm 2: Không đặt max limit — client request limit=999999
const limit = Number(req.query.limit); // 999999
await Post.find().limit(limit); // query toàn bộ DB!

// ✅ Đúng: luôn cap limit
const MAX_LIMIT = 100;
const limit = Math.min(Number(req.query.limit) || 10, MAX_LIMIT);

// ❌ Sai lầm 3: Đếm bằng find().length thay vì countDocuments
const posts = await Post.find(filter);      // load tất cả vào memory
const total = posts.length;                 // chậm, tốn RAM
const paged = posts.slice(skip, skip + limit); // pagination thủ công

// ✅ Đúng: Promise.all để query song song
const [posts, total] = await Promise.all([
  Post.find(filter).skip(skip).limit(limit),
  Post.countDocuments(filter), // chỉ đếm, không load data
]);`;

export default function Lesson11({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-04-11"
      num="11"
      title="Pagination với typed result — Generic paginate<T>()"
      desc="skip/limit pattern, PaginationResult<T> interface, countDocuments, Promise.all parallel"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Pagination chia kết quả lớn thành các trang nhỏ. Mongoose dùng <code>.skip(n)</code> (bỏ qua
        n items) và <code>.limit(n)</code> (lấy tối đa n items). Để có <code>totalPages</code>, cần
        đếm tổng số documents match filter bằng <code>countDocuments()</code> — chạy song song với
        query data bằng <code>Promise.all</code> để tối ưu performance. Generic function{' '}
        <code>{'paginate<T>()'}</code> tái sử dụng được cho mọi model — TypeScript đảm bảo result
        đúng type.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Parse query params: page = Number(req.query.page) || 1, limit = min(req.query.limit, 100)',
            'Tính skip = (page - 1) * limit — số items bỏ qua',
            'Promise.all([find().skip().limit(), countDocuments()]) — 2 queries song song',
            'Tính totalPages = Math.ceil(total / limit)',
            'Build PaginationResult<T> object với data và pagination metadata',
            'Response với typed result — client biết hasNext, hasPrev để render UI',
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
                'interface PaginationResult<T> — generic interface với type parameter T. Khi gọi paginate<IPost>(), T = IPost nên data sẽ là IPost[]. TypeScript enforce type safety xuyên suốt.',
            },
            {
              line: '2',
              explanation:
                'async function paginate<T>(model: Model<T>, ...) — generic function. T phải match giữa Model<T> và FilterQuery<T>. TypeScript suy luận T từ model argument.',
            },
            {
              line: '3',
              explanation:
                'Promise.all([...]) — chạy 2 queries song song: 1 query lấy data (có skip/limit), 1 query đếm tổng (countDocuments). Nếu chạy tuần tự, tốn 2x thời gian.',
            },
            {
              line: '4',
              explanation:
                'countDocuments(filter) — đếm số documents match filter, không load data vào memory. Nhanh hơn find().length rất nhiều vì MongoDB chỉ traverse index, không fetch documents.',
            },
            {
              line: '5',
              explanation:
                'Math.ceil(total / limit) — làm tròn lên. Ví dụ: 25 posts / 10 per page = 2.5 → ceil = 3 pages. Nếu dùng Math.floor, page cuối bị thiếu items.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Luôn đặt <strong>giới hạn tối đa cho limit</strong>. Không có cap, client có thể gửi{' '}
          <code>?limit=999999</code> để load toàn bộ database vào memory, gây OOM crash.{' '}
          <code>const limit = Math.min(requested, 100)</code> là pattern chuẩn.
        </Callout>
        <Callout type="note">
          Offset pagination (<code>skip/limit</code>) có vấn đề với data thay đổi liên tục: thêm/xóa
          documents giữa 2 requests có thể gây duplicate hoặc miss items. Cho feed/timeline
          real-time, cursor-based pagination (dùng <code>_id</code> làm cursor) ổn định hơn.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Viết GET /posts với pagination: parse page và limit từ query, cap limit ở 50, tính skip, query song song với Promise.all, response với { data, pagination }.',
            },
            {
              level: 'medium',
              text: 'Implement paginate<T>() generic function. Dùng nó cho cả User và Post endpoints. TypeScript phải infer đúng type cho mỗi model. Test với Postman.',
            },
            {
              level: 'hard',
              text: 'Implement cursor-based pagination: GET /posts?cursor=<lastId>&limit=10. Nếu có cursor: find({ _id: { $lt: cursor } }), nếu không: find(). Response phải có nextCursor để client gọi trang tiếp theo. Type-safe với TypeScript.',
            },
          ]}
          hint="Cursor-based: const query = cursor ? { _id: { $lt: new Types.ObjectId(cursor) } } : {}. Sort by _id: -1 (mới nhất trước). nextCursor = result.length === limit ? result[result.length - 1]._id.toString() : null."
        />
      </Sec>
    </LessonCard>
  );
}
