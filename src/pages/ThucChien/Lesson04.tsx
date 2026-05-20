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

const PAGINATE = `// src/utils/paginate.ts — generic pagination helper
import { Model, FilterQuery, PopulateOptions } from 'mongoose';

export interface PaginationResult<T> {
  data:       T[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
  hasNext:    boolean;
  hasPrev:    boolean;
}

export async function paginate<T>(
  model:    Model<T>,
  filter:   FilterQuery<T>,
  page:     number,
  limit:    number,
  options?: {
    sort?:     Record<string, 1 | -1>;
    populate?: PopulateOptions | PopulateOptions[];
    select?:   string;
  }
): Promise<PaginationResult<T>> {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model
      .find(filter)
      .sort(options?.sort ?? { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate(options?.populate ?? [])
      .select(options?.select ?? ''),
    model.countDocuments(filter),
  ]);

  return {
    data:       data as T[],
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext:    page * limit < total,
    hasPrev:    page > 1,
  };
}`;

const POST_CONTROLLER = `// src/controllers/post.controller.ts
import { Request, Response }    from 'express';
import { z }                    from 'zod';
import { FilterQuery }          from 'mongoose';
import { asyncHandler }         from '../utils/asyncHandler';
import { AppError }             from '../utils/AppError';
import { sendSuccess }          from '../utils/response';
import { paginate }             from '../utils/paginate';
import { Post }                 from '../models/Post';
import { IPost }                from '../types';

const PostSchema = z.object({
  title:      z.string().min(3).max(200),
  content:    z.string().min(10),
  tags:       z.array(z.string()).max(10).default([]),
  coverImage: z.string().url().optional(),
  published:  z.boolean().default(false),
});

// --- GET /api/posts — public feed với filter + pagination ---
export const getPosts = asyncHandler(async (req: Request, res: Response) => {
  const page    = Number(req.query.page)  || 1;
  const limit   = Number(req.query.limit) || 10;
  const tag     = req.query.tag     as string | undefined;
  const authorId = req.query.author as string | undefined;

  const filter: FilterQuery<IPost> = { published: true };
  if (tag)      filter.tags   = tag;
  if (authorId) filter.author = authorId;

  const result = await paginate(Post, filter, page, Math.min(limit, 50), {
    populate: { path: 'author', select: 'name avatar' },
    select:   '-content',  // omit full content trong listing
  });

  sendSuccess(res, result);
});

// --- GET /api/posts/:slug ---
export const getPost = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findOne({ slug: req.params.slug, published: true })
    .populate<{ author: { name: string; avatar: string } }>('author', 'name avatar');

  if (!post) throw new AppError('Bài viết không tồn tại', 404);

  // Tăng view count (không await — fire and forget)
  Post.findByIdAndUpdate(post._id, { $inc: { viewCount: 1 } }).exec();

  sendSuccess(res, post);
});

// --- POST /api/posts — cần authenticate ---
export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const body = PostSchema.parse(req.body);
  const post = await Post.create({ ...body, author: req.user!._id });
  sendSuccess(res, post, 201);
});

// --- PATCH /api/posts/:id ---
export const updatePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError('Không tìm thấy bài viết', 404);

  // Chỉ author hoặc admin mới được sửa
  if (post.author.toString() !== req.user!._id.toString()
      && req.user!.role !== 'admin')
    throw new AppError('Không có quyền chỉnh sửa bài viết này', 403);

  const body = PostSchema.partial().parse(req.body);
  const updated = await Post.findByIdAndUpdate(
    req.params.id,
    { $set: body },
    { new: true, runValidators: true }
  );
  sendSuccess(res, updated);
});

// --- DELETE /api/posts/:id ---
export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError('Không tìm thấy bài viết', 404);
  if (post.author.toString() !== req.user!._id.toString()
      && req.user!.role !== 'admin')
    throw new AppError('Không có quyền xóa bài viết này', 403);
  await post.deleteOne();
  sendSuccess(res, null);
});`;

const POST_ROUTES = `// src/routes/post.routes.ts
import { Router }        from 'express';
import { authenticate }  from '../middleware/authenticate';
import { getPosts, getPost, createPost, updatePost, deletePost }
  from '../controllers/post.controller';

export const postRouter = Router();

postRouter.get ('/',     getPosts);           // public — không cần auth
postRouter.get ('/:slug', getPost);           // public
postRouter.post('/',     authenticate, createPost);       // cần login
postRouter.patch('/:id', authenticate, updatePost);       // cần login
postRouter.delete('/:id', authenticate, deletePost);      // author hoặc admin`;

export default function Lesson04({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-07-04"
      num="04"
      title="Posts Module"
      desc="CRUD typed, generic paginate<T>(), filter by tag/author, view count increment"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Posts module là core feature của Social Blog API. Điểm đặc biệt:{' '}
        <strong>generic paginate&lt;T&gt;()</strong> function tái sử dụng cho mọi collection,{' '}
        <code>FilterQuery&lt;IPost&gt;</code> type-safe filter building, và populate với typed
        result. View count dùng <code>$inc</code> operator — atomic increment, không cần
        read-modify-write. Authorization check: author hoặc admin mới được sửa/xóa bài.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'GET /api/posts: parse query params (page, limit, tag, author) → build FilterQuery<IPost>',
            'paginate<IPost>(Post, filter, page, limit, options) → Promise.all([find, count])',
            'find().populate("author", "name avatar").select("-content") — omit content trong listing',
            'GET /api/posts/:slug: findOne({ slug, published: true }) → $inc viewCount (fire-and-forget)',
            'POST /api/posts: authenticate → zod validate → Post.create({ ...body, author: req.user._id })',
            'PATCH/DELETE: authenticate → findById → check author === req.user._id || role === "admin"',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: 'Generic paginate<T> .ts', code: PAGINATE },
            { label: 'Post Controller .ts', code: POST_CONTROLLER },
            { label: 'Post Routes .ts', code: POST_ROUTES },
          ]}
        />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable
          rows={[
            {
              line: '1',
              explanation:
                'paginate<T>(model, filter, page, limit): generic — dùng được với Post, Comment, User, bất kỳ Model nào. Promise.all([find, count]) chạy song song — nếu chạy tuần tự sẽ chậm gấp đôi. Math.min(limit, 50): cap limit để không bị gọi limit=10000.',
            },
            {
              line: '2',
              explanation:
                'FilterQuery<IPost>: type từ mongoose, đảm bảo filter chỉ dùng đúng fields của IPost. Compiler error nếu filter.nonExistentField = "x". Type-safe alternative cho plain object filter.',
            },
            {
              line: '3',
              explanation:
                'Post.findByIdAndUpdate({ $inc: { viewCount: 1 } }).exec(): atomic increment — thread-safe. Không await — fire-and-forget pattern. View count không critical nên không cần chờ update thành công mới trả response.',
            },
            {
              line: '4',
              explanation:
                'PostSchema.partial().parse(req.body): .partial() biến tất cả fields thành optional — phù hợp cho PATCH (chỉ update một phần). Sau parse, chỉ những fields được gửi lên mới có trong object — $set đúng fields.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Không cap <code>limit</code> → client có thể gửi <code>limit=100000</code> → query trả
          100k documents → OOM. Luôn dùng <code>Math.min(limit, MAX_LIMIT)</code>. Tương tự,
          validate <code>page &gt;= 1</code> để tránh skip âm (<code>page=0</code> →{' '}
          <code>skip=-limit</code> → MongoDB error).
        </Callout>
        <Callout type="note">
          <strong>Authorization trong route handler vs middleware</strong>: Kiểm tra{' '}
          <code>post.author === req.user._id</code> trong controller thay vì middleware vì cần load
          document từ DB để so sánh. Middleware chỉ check authentication (token) và role — không
          check ownership của từng resource cụ thể.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Implement Posts module với CRUD đầy đủ. Test: tạo bài, lấy danh sách, lấy chi tiết bằng slug, sửa (chỉ author), xóa. Kiểm tra viewCount tăng khi GET /posts/:slug.',
            },
            {
              level: 'medium',
              text: 'Thêm full-text search: GET /api/posts?q=keyword. Dùng MongoDB text index trên title + content. Kết hợp với pagination. Hint: filter.$text = { $search: q } khi q có giá trị.',
            },
            {
              level: 'hard',
              text: 'Implement "related posts": sau khi get post, trả thêm 3 bài cùng tags, cùng author, không phải bài hiện tại. Dùng $or và $nin. Return dạng { post, related: IPost[] } typed đầy đủ.',
            },
          ]}
          hint="populate().select('-content') không hoạt động cho populated field — select trong populate options là riêng. Dùng: .populate({ path: 'author', select: 'name avatar' }). select('-content') áp dụng cho Post document, không phải nested author."
        />
      </Sec>
    </LessonCard>
  );
}
