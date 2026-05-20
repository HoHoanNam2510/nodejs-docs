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

const BASIC = `// FilterQuery<T> — typed filter object cho Mongoose queries
import { User, IUser } from '../models/User';
import { FilterQuery } from 'mongoose';

// Build filter với type safety
const filter: FilterQuery<IUser> = {
  role:      'admin',                  // chỉ nhận 'user' | 'admin'
  age:       { $gt: 18, $lt: 60 },    // query operators
  isActive:  true,
};

const users = await User.find(filter);

// Comparison operators
const adults      = await User.find({ age: { $gte: 18 } });
const notAdmins   = await User.find({ role: { $ne: 'admin' } });
const multiRoles  = await User.find({ role: { $in: ['user', 'admin'] } });
const notInRoles  = await User.find({ role: { $nin: ['banned'] } });

// Logical operators
const result = await User.find({
  $and: [{ age: { $gte: 18 } }, { isActive: true }],
});

const result2 = await User.find({
  $or: [{ role: 'admin' }, { age: { $gte: 60 } }],
});`;

const REAL = `// src/controllers/post.controller.ts — search với nhiều filter
import { Request, Response } from 'express';
import { Post, IPost } from '../models/Post';
import { FilterQuery } from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler';

interface PostQueryParams {
  search?:    string;
  tag?:       string;
  authorId?:  string;
  published?: string;
  sortBy?:    'createdAt' | 'views' | 'title';
  order?:     'asc' | 'desc';
}

export const getPosts = asyncHandler(async (
  req: Request<{}, {}, {}, PostQueryParams>,
  res: Response
) => {
  const { search, tag, authorId, published, sortBy = 'createdAt', order = 'desc' } = req.query;

  // Build filter dynamically — type-safe
  const filter: FilterQuery<IPost> = {};

  if (published !== undefined) {
    filter.published = published === 'true';
  }
  if (tag) {
    filter.tags = { $in: [tag] }; // array contains
  }
  if (authorId && isValidObjectId(authorId)) {
    filter.author = authorId;
  }
  if (search) {
    filter.$or = [
      { title:   { $regex: search, $options: 'i' } },
      { content: { $regex: search, $options: 'i' } },
    ];
  }

  const sortOrder = order === 'asc' ? 1 : -1;
  const posts = await Post.find(filter)
    .sort({ [sortBy]: sortOrder })
    .select('-__v')
    .populate('author', 'name email');

  res.json({ success: true, data: posts, total: posts.length });
});`;

const MISTAKE = `// ❌ Sai lầm 1: Dùng regex không escape — XSS/ReDoS risk
const search = req.query.search as string; // ".*" — match tất cả
await Post.find({ title: { $regex: search } }); // nguy hiểm nếu search = ".*.*.*.*"

// ✅ Escape regex special chars hoặc limit độ dài
const escaped = search.replace(/[.*+?^{}$()|[\]\\]/g, '\\$&');
await Post.find({ title: { $regex: escaped, $options: 'i' } });

// ❌ Sai lầm 2: $where với function — injection risk
await User.find({ $where: 'this.age > 18' }); // JavaScript injection!
// Kẻ tấn công có thể truyền: "function() { return true; }" để bypass filter

// ✅ Đúng: dùng query operators thay thế
await User.find({ age: { $gt: 18 } });

// ❌ Sai lầm 3: Dùng req.query value trực tiếp làm filter key
const sortField = req.query.sortBy; // 'name' từ user input
await User.find().sort({ [sortField]: 1 }); // $where injection qua sort field!

// ✅ Whitelist cho phép field
const ALLOWED_SORT = ['name', 'email', 'createdAt'] as const;
type SortField = typeof ALLOWED_SORT[number];
const sortField = ALLOWED_SORT.includes(req.query.sortBy as SortField)
  ? req.query.sortBy as SortField
  : 'createdAt';`;

export default function Lesson08({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-04-08"
      num="08"
      title="Query operators với FilterQuery<T> — tìm kiếm có type safety"
      desc="$gt, $in, $or, $regex — FilterQuery<IUser> đảm bảo filter hợp lệ, regex security"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        <code>{'FilterQuery<T>'}</code> là Mongoose TypeScript type cho object filter truyền vào{' '}
        <code>find()</code>, <code>findOne()</code>... Nó cho phép cả giá trị trực tiếp (
        <code>{'{ role: "admin" }'}</code>) lẫn query operators (
        <code>{'{ age: { $gt: 18 } }'}</code>
        ). TypeScript đảm bảo field names phải tồn tại trong <code>IUser</code> — gõ sai field name
        sẽ bị báo lỗi. Khi build filter dynamic từ request params, luôn whitelist các giá trị cho
        phép để tránh injection.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Khai báo filter: FilterQuery<IPost> = {} — empty filter match tất cả',
            'Thêm conditions từ request params: if (tag) filter.tags = { $in: [tag] }',
            'Mỗi condition được TypeScript check: field phải tồn tại trong IPost',
            'User.find(filter) — Mongoose convert filter sang MongoDB query',
            'Chain thêm sort(), select(), populate() sau find()',
            'Await result — trả IPost[] typed',
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
                "FilterQuery<IUser> — union type cho phép cả exact values ({role: 'admin'}) và operator objects ({age: {$gt: 18}}). TypeScript validate field names phải thuộc IUser.",
            },
            {
              line: '2',
              explanation:
                '$gt, $gte, $lt, $lte — comparison operators. $gt = greater than (>), $gte = greater than or equal (>=). MongoDB prefix $ phân biệt operators với field names.',
            },
            {
              line: '3',
              explanation:
                "$in: [tag] — document match nếu field value nằm trong array. Hữu ích cho tags: filter.tags = { $in: ['javascript'] } sẽ tìm posts có 'javascript' trong tags array.",
            },
            {
              line: '4',
              explanation:
                '$or: [{...}, {...}] — document match nếu ít nhất 1 condition đúng. Hữu ích cho full-text search: tìm trong title hoặc content.',
            },
            {
              line: '5',
              explanation:
                "$regex với $options: 'i' — case-insensitive regex search. KHÔNG dùng trực tiếp user input làm regex — escape trước hoặc dùng text index ($text).",
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Không truyền <code>req.query</code> trực tiếp làm MongoDB filter —{' '}
          <strong>NoSQL injection</strong>! Kẻ tấn công gửi <code>{'?role[$ne]=admin'}</code> →
          filter thành <code>{'{ role: { $ne: "admin" } }'}</code> → bypass role check. Luôn
          whitelist fields và validate values trước khi đưa vào filter.
        </Callout>
        <Callout type="note">
          Để tìm kiếm text hiệu quả hơn <code>$regex</code>, tạo text index:{' '}
          <code>postSchema.index({'{ title: "text", content: "text" }'})</code> rồi dùng{' '}
          <code>{'Post.find({ $text: { $search: query } })'}</code>. Nhanh hơn nhiều với dữ liệu lớn
          và hỗ trợ stemming, stop words.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Viết GET /posts với filter: published=true, tag (exact match trong tags array), sort by createdAt desc. Dùng FilterQuery<IPost>.',
            },
            {
              level: 'medium',
              text: 'Viết search endpoint GET /posts/search?q=keyword — tìm trong title và content bằng $regex (escape input trước). Whitelist sortBy field chỉ cho phép "createdAt" | "views" | "title".',
            },
            {
              level: 'hard',
              text: 'Implement dynamic filter builder function: buildPostFilter(params: PostQueryParams): FilterQuery<IPost> — nhận query params và trả filter object. Unit test function này với các input khác nhau (empty, partial, full params).',
            },
          ]}
          hint="Escape regex: const safe = query.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&'). Sau đó: { $regex: safe, $options: 'i' }. Không làm bước này → ReDoS vulnerability."
        />
      </Sec>
    </LessonCard>
  );
}
