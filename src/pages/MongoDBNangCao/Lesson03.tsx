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

// $match — lọc documents (như WHERE trong SQL)
const matchStage: PipelineStage.Match = {
  $match: {
    published: true,
    views:     { $gte: 100 },          // views >= 100
    author:    new Types.ObjectId(id),  // match ObjectId — không dùng string!
    createdAt: { $gte: new Date('2024-01-01') },
  },
};

// $project — chọn/tính fields (như SELECT trong SQL)
const projectStage: PipelineStage.Project = {
  $project: {
    title:     1,       // include
    author:    1,       // include
    views:     1,       // include
    content:   0,       // exclude — bỏ field lớn để nhẹ hơn
    // Tạo field mới từ expression:
    titleLength: { $strLenCP: '$title' },
    isPopular:   { $gte: ['$views', 1000] },
  },
};

// $sort — sắp xếp
const sortStage: PipelineStage.Sort = {
  $sort: { views: -1, createdAt: -1 }, // giảm dần
};

// $limit + $skip — phân trang
const page = 2;
const limit = 10;
const skipStage:  PipelineStage.Skip  = { $skip:  (page - 1) * limit };
const limitStage: PipelineStage.Limit = { $limit: limit };

// Kết hợp
interface PostSummary {
  _id:         Types.ObjectId;
  title:       string;
  views:       number;
  titleLength: number;
  isPopular:   boolean;
}

const result = await Post.aggregate<PostSummary>([
  matchStage, projectStage, sortStage, skipStage, limitStage,
]);`;

const REAL = `import { PipelineStage, Types } from 'mongoose';
import { Request, Response }    from 'express';
import { Post }                 from '../models/Post';
import { asyncHandler }         from '../utils/asyncHandler';

// GET /posts?page=1&limit=10&tag=typescript&minViews=50
export const getFilteredPosts = asyncHandler(async (req: Request, res: Response) => {
  const page     = Number(req.query.page)     || 1;
  const limit    = Number(req.query.limit)    || 10;
  const tag      = req.query.tag      as string | undefined;
  const minViews = Number(req.query.minViews) || 0;

  const matchFilter: Record<string, unknown> = { published: true };
  if (tag)      matchFilter.tags     = tag;
  if (minViews) matchFilter.views    = { $gte: minViews };

  const pipeline: PipelineStage[] = [
    { $match: matchFilter },
    {
      $project: {
        title:     1,
        slug:      1,
        author:    1,
        tags:      1,
        views:     1,
        createdAt: 1,
        // Loại bỏ content nặng khỏi list view
        content:   0,
      },
    },
    { $sort: { createdAt: -1 } },
    {
      // Dùng $facet để đồng thời lấy data và total count trong 1 query
      $facet: {
        data:  [{ $skip: (page - 1) * limit }, { $limit: limit }],
        total: [{ $count: 'count' }],
      },
    },
  ];

  interface FacetResult {
    data:  { title: string; slug: string; views: number; createdAt: Date }[];
    total: { count: number }[];
  }

  const [result] = await Post.aggregate<FacetResult>(pipeline);
  const total     = result.total[0]?.count ?? 0;

  res.json({
    success:    true,
    data:       result.data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});`;

const MISTAKE = `// ❌ Sai lầm 1: $match với string thay ObjectId
// MongoDB lưu author là ObjectId — so sánh với string luôn false!
const posts = await Post.aggregate([
  { $match: { author: userId } }, // userId là string '507f1f77...' → không match!
]);

// ✅ Đúng: convert sang ObjectId
import { Types } from 'mongoose';
const posts = await Post.aggregate([
  { $match: { author: new Types.ObjectId(userId) } },
]);

// ❌ Sai lầm 2: $project vừa include vừa exclude (trừ _id)
const result = await Post.aggregate([
  {
    $project: {
      title:   1,    // include
      content: 0,    // exclude — không được mix 1 và 0!
    },
  },
]);
// MongoServerError: Invalid $project :: caused by :: Cannot do exclusion on field content
// in inclusion projection

// ✅ Chọn 1 trong 2: include tất cả cần (với _id: 0 nếu muốn bỏ)
// Hoặc exclude chỉ fields không cần (mặc định include tất cả còn lại)
{ $project: { content: 0, __v: 0 } }       // exclude mode
{ $project: { title: 1, views: 1, _id: 0 } } // include mode

// ❌ Sai lầm 3: Thiếu $sort trước $skip/$limit
// Kết quả không xác định, random order mỗi query
const pipeline = [
  { $match: { published: true } },
  { $skip: 10 },   // skip 10 document nào? Không biết thứ tự!
  { $limit: 10 },
];

// ✅ Luôn $sort trước $skip/$limit
const pipeline = [
  { $match: { published: true } },
  { $sort: { createdAt: -1 } }, // xác định thứ tự trước
  { $skip: 10 },
  { $limit: 10 },
];`;

export default function Lesson03({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-05-03"
      num="03"
      title="$match, $project, $sort, $limit, $skip"
      desc="5 stages nền tảng của aggregation pipeline — lọc, chọn fields, sắp xếp, phân trang"
      priority="medium"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        5 stages cơ bản nhất của aggregation pipeline: <strong>$match</strong> (lọc documents — dùng
        index nếu đặt đầu), <strong>$project</strong> (chọn/transform fields — giảm kích thước
        document), <strong>$sort</strong> (sắp xếp), <strong>$skip</strong> và{' '}
        <strong>$limit</strong> (phân trang). Mongoose export từng stage type riêng (
        <code>PipelineStage.Match</code>, <code>PipelineStage.Project</code>...) — có thể dùng để
        type từng stage riêng biệt hoặc dùng <code>PipelineStage</code> chung.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            '$match: filter documents dùng index → giảm số documents cần xử lý ở stages sau',
            '$project: chọn fields cần thiết, bỏ fields nặng (content, description) → giảm memory',
            '$sort: sắp xếp theo 1 hoặc nhiều fields — ảnh hưởng đến kết quả $skip/$limit',
            '$skip: bỏ qua N documents đầu — tính từ page và limit: skip = (page-1) * limit',
            '$limit: lấy tối đa N documents — kết hợp $skip+$limit = pagination',
            '$facet (nâng cao): chạy nhiều sub-pipeline song song — lấy data + total count cùng lúc',
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
                '$match với ObjectId: new Types.ObjectId(id) convert string sang ObjectId. MongoDB lưu references dưới dạng ObjectId — so sánh string với ObjectId luôn trả false (không có error, chỉ không match).',
            },
            {
              line: '2',
              explanation:
                '$project { field: 1 } — include mode: chỉ giữ lại fields được chỉ định. { field: 0 } — exclude mode: bỏ fields đó, giữ lại tất cả. Không thể mix (ngoại lệ: _id có thể exclude trong inclusion projection).',
            },
            {
              line: '3',
              explanation:
                '$facet cho phép chạy 2+ sub-pipeline song song trên cùng input. data sub-pipeline: lấy page data. total sub-pipeline: đếm tổng. Kết quả là { data: [...], total: [{count: N}] } — 1 round trip thay vì 2.',
            },
            {
              line: '4',
              explanation:
                'result.total[0]?.count ?? 0 — $facet total trả array. Nếu không có document nào match, total là [] rỗng. Optional chaining (?.) + nullish coalescing (?? 0) để xử lý empty array safely.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          <code>$skip + $limit</code> pagination có vấn đề performance với large offset: bỏ 100,000
          documents vẫn cần đọc chúng. Với collections lớn, dùng cursor-based pagination:{' '}
          <code>{'{ $match: { _id: { $gt: lastId } } }'}</code> thay vì <code>$skip</code>.
        </Callout>
        <Callout type="note">
          <code>$facet</code> là pattern hay nhất để pagination: lấy data và total count trong 1
          query thay vì 2 round trips. Cú pháp:{' '}
          <code>{'{ $facet: { data: [...], total: [{ $count: "count" }] } }'}</code>. Result là{' '}
          <code>{'{ data: T[], total: [{ count: number }] }'}</code>.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Viết pipeline lấy 5 bài published có nhiều views nhất. $match published, $sort views desc, $limit 5. Type result là { title: string; views: number }[].',
            },
            {
              level: 'medium',
              text: 'Implement pagination với $facet: GET /posts?page=2&limit=5&tag=nodejs. Trả { data, pagination: { page, limit, total, totalPages } }. Type đầy đủ với FacetResult interface.',
            },
            {
              level: 'hard',
              text: 'Viết reusable paginateWithFacet<T>() generic function nhận model, matchFilter, projectFields, sortFields, page, limit. Trả Promise<{ data: T[], pagination: PaginationMeta }>. Function này dùng được cho cả Post và User.',
            },
          ]}
          hint="$facet pattern: { $facet: { data: [{ $skip }, { $limit }], total: [{ $count: 'count' }] } }. Kết quả [0].total[0]?.count ?? 0 để lấy total. Đặt $sort TRƯỚC $facet vì $facet inherit documents đã sorted."
        />
      </Sec>
    </LessonCard>
  );
}
