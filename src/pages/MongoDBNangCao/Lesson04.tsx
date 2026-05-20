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

// Interface cho output của $group stage
interface AuthorStats {
  _id:        Types.ObjectId; // giá trị của group-by field
  totalPosts: number;
  avgViews:   number;
  maxViews:   number;
  tags:       string[];       // collected từ $push
}

// Pipeline group theo author
const pipeline: PipelineStage[] = [
  { $match: { published: true } },
  {
    $group: {
      _id:        '$author',             // group by field — bắt buộc
      totalPosts: { $sum: 1 },           // đếm documents
      avgViews:   { $avg: '$views' },    // trung bình
      maxViews:   { $max: '$views' },    // giá trị lớn nhất
      tags:       { $push: '$tags' },    // collect tất cả tags vào array
    },
  },
  { $sort: { totalPosts: -1 } },
];

// Dùng generic để type kết quả
const stats = await Post.aggregate<AuthorStats>(pipeline);
// stats: AuthorStats[] — TypeScript biết shape của mỗi object`;

const REAL = `import { PipelineStage, Types } from 'mongoose';
import { Post }    from '../models/Post';
import { Request, Response } from 'express';
import { asyncHandler }      from '../utils/asyncHandler';

interface TagStat {
  _id:       string;   // tên tag
  postCount: number;
  avgViews:  number;
  topPost:   { title: string; views: number } | null;
}

// GET /analytics/tags — thống kê theo tag
export const getTagStats = asyncHandler(async (_req: Request, res: Response) => {
  const pipeline: PipelineStage[] = [
    { $match: { published: true } },

    // Unwind array field: [tag1, tag2] → 2 documents riêng
    { $unwind: '$tags' },

    // Group theo từng tag
    {
      $group: {
        _id:       '$tags',
        postCount: { $sum: 1 },
        avgViews:  { $avg: '$views' },
        // Lấy post có views cao nhất: accumulate all, sort sẽ xử lý sau
        maxViews:  { $max: '$views' },
        posts: {
          $push: {
            title: '$title',
            views: '$views',
          },
        },
      },
    },

    // Sắp xếp theo postCount giảm dần
    { $sort: { postCount: -1 } },

    // Lấy top 10 tags
    { $limit: 10 },

    // Project để format output
    {
      $project: {
        _id:       1,
        postCount: 1,
        avgViews:  { $round: ['$avgViews', 0] }, // làm tròn số nguyên
        topPost: {
          // Lấy phần tử max views từ posts array
          $reduce: {
            input:        '$posts',
            initialValue: null,
            in: {
              $cond: {
                if: {
                  $or: [
                    { $eq: ['$$value', null] },
                    { $gt: ['$$this.views', '$$value.views'] },
                  ],
                },
                then: '$$this',
                else: '$$value',
              },
            },
          },
        },
      },
    },
  ];

  const stats = await Post.aggregate<TagStat>(pipeline);
  res.json({ success: true, data: stats });
});`;

const MISTAKE = `// ❌ Sai lầm 1: Quên $unwind trước $group với array field
// tags là array ['ts', 'express'] — nếu group trực tiếp, _id là cả array
const result = await Post.aggregate([
  { $group: { _id: '$tags', count: { $sum: 1 } } },
  // _id: ['ts', 'express'] — không phải từng tag riêng!
]);

// ✅ $unwind trước để flatten array
const result = await Post.aggregate([
  { $unwind: '$tags' },  // mỗi tag thành 1 document
  { $group: { _id: '$tags', count: { $sum: 1 } } },
  // _id: 'ts', rồi _id: 'express' — từng tag riêng
]);

// ❌ Sai lầm 2: Type _id sai sau $group
// Sau $group { _id: '$author' } — _id là giá trị của author field (ObjectId)
// Không phải string, không phải number!
interface WrongStats {
  _id:   string;  // SAI nếu author là ObjectId
  count: number;
}

// ✅ Match type với loại của group-by field
interface CorrectStats {
  _id:   Types.ObjectId; // author là ObjectId
  count: number;
}

// Nếu group by string field (như tags):
interface TagStats {
  _id:   string; // tag là string
  count: number;
}

// ❌ Sai lầm 3: Dùng $sum: '$field' thay vì $sum: 1 để đếm
{ $group: { _id: '$author', count: { $sum: '$count' } } }
// $sum: '$count' — cộng giá trị của field count (nếu post có count field)
// Thường không phải ý định!

// ✅ $sum: 1 để đếm số documents trong mỗi group
{ $group: { _id: '$author', count: { $sum: 1 } } }`;

export default function Lesson04({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-05-04"
      num="04"
      title="$group với typed result"
      desc="Group by field, accumulators ($sum, $avg, $max, $push), $unwind array, Post.aggregate<AuthorStats>()"
      priority="medium"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        <code>$group</code> là stage mạnh nhất trong aggregation — nhóm documents theo một field và
        tính toán giá trị tổng hợp (aggregation accumulators). Bắt buộc có <code>_id</code> field
        (giá trị để group by — null nếu muốn group toàn bộ). Các accumulators phổ biến:{' '}
        <code>$sum</code> (đếm/tổng), <code>$avg</code> (trung bình), <code>$max/$min</code> (cực
        trị), <code>$push</code> (collect vào array). Khi group by array field, phải dùng{' '}
        <code>$unwind</code> trước.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            '$match: filter documents cần group (published posts, active users...)',
            '$unwind: nếu group-by field là array, flatten trước — 1 document/element',
            '$group { _id: "$field", stat: { $accumulator } } — nhóm và tính toán',
            'Mỗi unique value của _id tạo 1 output document với accumulated stats',
            '$sort theo stat để sắp xếp kết quả (top authors, trending tags...)',
            '$limit nếu chỉ cần top N, $project để format output cuối',
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
                '$group _id — bắt buộc, là field (hay expression) để group by. _id: "$author" → group theo author. _id: null → tất cả documents vào 1 group (dùng để tính tổng toàn collection). _id: { month: { $month: "$createdAt" } } → group theo tháng.',
            },
            {
              line: '2',
              explanation:
                '$sum: 1 — đếm số documents trong mỗi group. $sum: "$views" — cộng giá trị field views. $avg: "$views" — trung bình. $max: "$views" — lớn nhất. $push: "$tags" — collect tất cả values vào 1 array.',
            },
            {
              line: '3',
              explanation:
                '$unwind: "$tags" — flatten array field. Document { tags: ["ts", "express"] } → 2 documents: { tags: "ts" } và { tags: "express" }. Sau đó $group { _id: "$tags" } sẽ group theo từng tag riêng lẻ.',
            },
            {
              line: '4',
              explanation:
                '$round: ["$avgViews", 0] — làm tròn số thập phân. Thứ nhất là giá trị, thứ hai là số chữ số thập phân. 0 = làm tròn đến số nguyên gần nhất. Thường dùng sau $avg để output dễ đọc.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Sau <code>$group</code>, chỉ còn <code>_id</code> và các accumulated fields — tất cả
          fields gốc của document bị mất (trừ fields được accumulate bằng <code>$push</code> hay{' '}
          <code>$first</code>). Nếu cần giữ field gốc, dùng <code>{`$first: '$fieldName'`}</code>{' '}
          trong $group.
        </Callout>
        <Callout type="note">
          <code>$group</code> trong MongoDB không đảm bảo thứ tự output. Luôn thêm{' '}
          <code>$sort</code> sau $group nếu cần thứ tự xác định. Đặc biệt quan trọng khi kết hợp với
          $limit (top N cần sort trước).
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Viết pipeline đếm số bài theo từng tháng trong năm hiện tại. Interface: { _id: number; count: number } (month 1-12). Dùng $month operator.',
            },
            {
              level: 'medium',
              text: 'GET /analytics/authors — top 5 authors có nhiều bài published nhất, kèm totalViews và avgViews. Type đầy đủ với AuthorStats interface. $lookup để join với User collection lấy name và email.',
            },
            {
              level: 'hard',
              text: 'Viết pipeline "weekly report": nhóm posts theo tuần (dùng $week và $year), mỗi tuần có: postsPublished, totalViews, uniqueAuthors (dùng $addToSet), top3Tags (unwind → group → sort → limit). Type kết quả với WeeklyReport interface.',
            },
          ]}
          hint="$addToSet giống $push nhưng loại bỏ duplicates — dùng để đếm unique values. { $addToSet: '$author' } thu thập tất cả unique authors vào array. Sau đó { $size: '$authors' } để đếm số lượng."
        />
      </Sec>
    </LessonCard>
  );
}
