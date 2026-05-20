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

const BASIC = `import { PipelineStage } from 'mongoose';
import { Post } from '../models/Post';

// PipelineStage[] — mảng các stage, mỗi stage là 1 bước xử lý
const pipeline: PipelineStage[] = [
  // Stage 1: Lọc chỉ lấy bài published
  { $match: { published: true } },

  // Stage 2: Nhóm theo author, đếm số bài
  { $group: { _id: '$author', postCount: { $sum: 1 } } },

  // Stage 3: Sắp xếp theo postCount giảm dần
  { $sort: { postCount: -1 } },

  // Stage 4: Giới hạn 10 kết quả
  { $limit: 10 },
];

// Post.aggregate() nhận PipelineStage[] — trả any[] mặc định
const result = await Post.aggregate(pipeline);
console.log(result); // [{ _id: ObjectId, postCount: 5 }, ...]

// Typed result — dùng generic
interface AuthorPostCount {
  _id: string;
  postCount: number;
}

const typedResult = await Post.aggregate<AuthorPostCount>(pipeline);
// typedResult: AuthorPostCount[] — fully typed!`;

const REAL = `import { PipelineStage, Types } from 'mongoose';
import { Post } from '../models/Post';

// Dashboard stats — nhiều stages kết hợp
const dashboardPipeline: PipelineStage[] = [
  { $match: { published: true } },

  // $project: chọn fields cần, tính toán field mới
  {
    $project: {
      title:     1,
      author:    1,
      views:     1,
      tags:      1,
      createdAt: 1,
      // field mới: tính từ createdAt đến hôm nay
      daysSincePublished: {
        $divide: [
          { $subtract: ['$$NOW', '$createdAt'] },
          1000 * 60 * 60 * 24, // milliseconds → days
        ],
      },
    },
  },

  // $sort: nhiều fields
  { $sort: { views: -1, createdAt: -1 } },

  // $skip + $limit cho pagination
  { $skip: 0 },
  { $limit: 20 },
];

interface PostWithAge {
  _id:                Types.ObjectId;
  title:              string;
  views:              number;
  daysSincePublished: number;
}

const posts = await Post.aggregate<PostWithAge>(dashboardPipeline);`;

const MISTAKE = `// ❌ Sai lầm 1: Dùng .find().sort().limit() thay vì pipeline khi cần nhiều tính toán
// find() không thể tính field mới, không thể group — phải dùng aggregation
const posts = await Post.find({ published: true })
  .sort({ views: -1 })
  .limit(10);
// Không có cách tính daysSincePublished với .find()

// ✅ Aggregation cho phép tính toán, transform, group trong 1 query
const posts = await Post.aggregate<PostWithAge>([
  { $match: { published: true } },
  { $project: { daysSincePublished: { $divide: [...] } } },
  { $sort: { views: -1 } },
]);

// ❌ Sai lầm 2: Quên $match đầu pipeline → scan toàn collection
const pipeline = [
  { $group: { _id: '$author', count: { $sum: 1 } } }, // đọc toàn bộ collection!
  { $match: { published: true } }, // match sau group → đã đọc hết rồi!
];

// ✅ $match LUÔN đặt đầu tiên để reduce input data sớm
const pipeline = [
  { $match: { published: true } }, // filter trước
  { $group: { _id: '$author', count: { $sum: 1 } } }, // group sau
];

// ❌ Sai lầm 3: Không type kết quả → result là any[]
const result = await Post.aggregate([{ $group: { _id: '$author' } }]);
result[0].author.name; // TypeScript không báo lỗi dù author là ObjectId, không có .name!

// ✅ Luôn generic type kết quả aggregate
const result = await Post.aggregate<AuthorStats>([...]);`;

export default function Lesson02({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-05-02"
      num="02"
      title="Aggregation Pipeline — PipelineStage[] type"
      desc="MongoDB pipeline xử lý data theo từng stage, PipelineStage[] typed, aggregate<T>() generic"
      priority="medium"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Aggregation Pipeline là cách MongoDB xử lý data theo chuỗi các bước (stages). Mỗi stage nhận
        input từ stage trước, xử lý, rồi pass output cho stage sau — giống Unix pipe{' '}
        <code>cat file | grep | sort | head</code>. Mongoose export type <code>PipelineStage</code>{' '}
        từ package <code>mongoose</code> — dùng để type mảng stages.{' '}
        <code>Model.aggregate{'<T>'}(pipeline)</code> trả <code>T[]</code> — luôn generic để có
        TypeScript safety.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Khai báo interface cho expected result — TypeScript type cho output của pipeline',
            'Tạo PipelineStage[] array — mỗi object trong array là 1 stage',
            '$match đầu tiên để filter data sớm nhất có thể (tận dụng index)',
            'Các stages tiếp theo: $project, $group, $sort, $skip, $limit, $lookup...',
            'Model.aggregate<ResultType>(pipeline) — generic type cho type-safe result',
            'result là ResultType[] — không phải any[], TypeScript enforce shape',
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
                "import { PipelineStage } from 'mongoose' — type exported bởi Mongoose. PipelineStage là discriminated union của tất cả stage types: PipelineStage.Match, PipelineStage.Group, PipelineStage.Sort... TypeScript biết { $match: ... } hợp lệ nhưng { $invalid: ... } sẽ báo error.",
            },
            {
              line: '2',
              explanation:
                'Post.aggregate<AuthorPostCount>(pipeline) — generic T truyền vào aggregate() xác định type của mỗi element trong result array. Nếu không truyền T, kết quả là any[] — mất type safety.',
            },
            {
              line: '3',
              explanation:
                '$project: { field: 1 } — include field. { field: 0 } — exclude. { newField: expression } — tạo field mới. Không thể vừa include vừa exclude (trừ _id). Sau $project, document chỉ có fields được chỉ định.',
            },
            {
              line: '4',
              explanation:
                '$skip + $limit cho pagination: skip = (page - 1) * limit. Quan trọng: $sort PHẢI đứng trước $skip/$limit nếu muốn kết quả nhất quán — sort trước, rồi mới skip/limit.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Aggregation pipeline chạy trên MongoDB server — không chạy trong Node.js. Không thể dùng
          JavaScript functions hay Mongoose middleware trong pipeline. Tất cả xử lý phải là MongoDB
          operators (<code>$sum</code>, <code>$divide</code>, <code>$subtract</code>...).
        </Callout>
        <Callout type="note">
          Debug pipeline từng bước: copy pipeline vào MongoDB Compass Aggregation tab — bạn thấy
          output của từng stage. Đây là cách nhanh nhất để kiểm tra pipeline có hoạt động đúng không
          trước khi đưa vào code.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Viết pipeline đếm tổng số bài published trong mỗi tháng của năm hiện tại. Output interface: { _id: { month: number; year: number }; count: number }. Dùng $month và $year operators.',
            },
            {
              level: 'medium',
              text: 'Viết GET /posts/stats endpoint trả: tổng số posts, trung bình views, top 5 tags phổ biến nhất. Dùng 1 aggregation pipeline với nhiều stages. Type kết quả với interface StatsResult.',
            },
            {
              level: 'hard',
              text: 'Pipeline phức tạp: lấy top 10 authors có tổng views cao nhất, kèm thông tin user (join với User collection), và chỉ tính posts được publish trong 30 ngày gần nhất. Dùng $lookup, $unwind, $group, $sort. Type đầy đủ.',
            },
          ]}
          hint="$$NOW là system variable trong MongoDB — giá trị là thời điểm query. Dùng { $subtract: ['$$NOW', '$createdAt'] } để tính khoảng thời gian. Kết quả là milliseconds."
        />
      </Sec>
    </LessonCard>
  );
}
