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

const COMMENT_CONTROLLER = `// src/controllers/comment.controller.ts
import { Request, Response }  from 'express';
import { z }                  from 'zod';
import { asyncHandler }       from '../utils/asyncHandler';
import { AppError }           from '../utils/AppError';
import { sendSuccess }        from '../utils/response';
import { paginate }           from '../utils/paginate';
import { Comment }            from '../models/Comment';
import { Post }               from '../models/Post';
import { IComment }           from '../types';
import { FilterQuery }        from 'mongoose';

const CommentSchema = z.object({
  content:  z.string().min(1).max(500),
  parentId: z.string().optional(),  // reply to comment
});

// --- GET /api/posts/:postId/comments ---
export const getComments = asyncHandler(async (req: Request, res: Response) => {
  const page  = Number(req.query.page)  || 1;
  const limit = Number(req.query.limit) || 20;

  const filter: FilterQuery<IComment> = {
    post:     req.params.postId,
    parentId: { $exists: false },  // chỉ lấy top-level comments
  };

  const result = await paginate(Comment, filter, page, limit, {
    populate: { path: 'author', select: 'name avatar' },
    sort:     { createdAt: 1 },  // oldest first cho comments
  });

  sendSuccess(res, result);
});

// --- POST /api/posts/:postId/comments ---
export const createComment = asyncHandler(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const body = CommentSchema.parse(req.body);

  const post = await Post.findById(postId);
  if (!post || !post.published) throw new AppError('Bài viết không tồn tại', 404);

  const comment = await Comment.create({
    post:     postId,
    author:   req.user!._id,
    content:  body.content,
    parentId: body.parentId,   // undefined = top-level, có giá trị = reply
  });

  await comment.populate('author', 'name avatar');
  sendSuccess(res, comment, 201);
});

// --- DELETE /api/posts/:postId/comments/:commentId ---
export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) throw new AppError('Comment không tồn tại', 404);

  // Author của comment hoặc author của post hoặc admin
  const postAuthor = await Post.findById(comment.post).select('author');
  const isCommentAuthor = comment.author.toString() === req.user!._id.toString();
  const isPostAuthor    = postAuthor?.author.toString() === req.user!._id.toString();
  const isAdmin         = req.user!.role === 'admin';

  if (!isCommentAuthor && !isPostAuthor && !isAdmin)
    throw new AppError('Không có quyền xóa comment này', 403);

  await comment.deleteOne();
  sendSuccess(res, null);
});`;

const LIKE_CONTROLLER = `// src/controllers/like.controller.ts
import { Request, Response }  from 'express';
import { asyncHandler }       from '../utils/asyncHandler';
import { AppError }           from '../utils/AppError';
import { sendSuccess }        from '../utils/response';
import { Like }               from '../models/Like';
import { Post }               from '../models/Post';

// --- POST /api/posts/:postId/like — toggle like/unlike ---
export const toggleLike = asyncHandler(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const userId = req.user!._id;

  const post = await Post.findById(postId);
  if (!post || !post.published) throw new AppError('Bài viết không tồn tại', 404);

  // Kiểm tra đã like chưa
  const existingLike = await Like.findOne({ post: postId, user: userId });

  if (existingLike) {
    // Unlike: xóa like + giảm likeCount
    await Promise.all([
      existingLike.deleteOne(),
      Post.findByIdAndUpdate(postId, { $inc: { likeCount: -1 } }),
    ]);
    sendSuccess(res, { liked: false, likeCount: post.likeCount - 1 });
  } else {
    // Like: tạo like + tăng likeCount
    await Promise.all([
      Like.create({ post: postId, user: userId }),
      Post.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } }),
    ]);
    sendSuccess(res, { liked: true, likeCount: post.likeCount + 1 });
  }
});

// --- GET /api/posts/:postId/like — kiểm tra user đã like chưa ---
export const getLikeStatus = asyncHandler(async (req: Request, res: Response) => {
  const { postId } = req.params;
  const userId = req.user!._id;

  const [liked, likeCount] = await Promise.all([
    Like.exists({ post: postId, user: userId }),
    Like.countDocuments({ post: postId }),
  ]);

  sendSuccess(res, { liked: !!liked, likeCount });
});`;

const ROUTES = `// src/routes/comment.routes.ts
import { Router }        from 'express';
import { authenticate }  from '../middleware/authenticate';
import { getComments, createComment, deleteComment }
  from '../controllers/comment.controller';
import { toggleLike, getLikeStatus }
  from '../controllers/like.controller';

export const commentRouter = Router({ mergeParams: true }); // inherit :postId

commentRouter.get ('/',               getComments);
commentRouter.post('/',  authenticate, createComment);
commentRouter.delete('/:commentId', authenticate, deleteComment);

export const likeRouter = Router({ mergeParams: true });

likeRouter.get ('/',  authenticate, getLikeStatus);
likeRouter.post ('/', authenticate, toggleLike);

// src/routes/post.routes.ts — thêm nested routes
import { commentRouter } from './comment.routes';
import { likeRouter }    from './comment.routes';

postRouter.use('/:postId/comments', commentRouter);
postRouter.use('/:postId/like',     likeRouter);`;

export default function Lesson05({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-07-05"
      num="05"
      title="Comments & Likes"
      desc="Nested resources, threaded comments với parentId, toggle like/unlike pattern"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Comments và Likes là <strong>nested resources</strong> — luôn gắn với một Post. URL pattern:{' '}
        <code>/api/posts/:postId/comments</code>. Router dùng <code>mergeParams: true</code> để kế
        thừa <code>:postId</code> từ parent route. Like dùng <strong>toggle pattern</strong>: check
        exists → nếu có thì xóa (unlike), nếu không thì tạo (like). Compound unique index trên{' '}
        <code>&#123;post, user&#125;</code> đảm bảo 1 user chỉ like 1 lần ở DB level.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Comment: GET /posts/:postId/comments — filter parentId $exists: false (top-level only)',
            'Comment: POST — kiểm tra post tồn tại + published → create với parentId (optional)',
            'Comment: DELETE — check quyền: comment author OR post author OR admin mới được xóa',
            'Like toggle: findOne({ post, user }) → exists? delete + $inc -1 : create + $inc +1',
            'Promise.all([Like.create, Post.update]) — chạy song song, không sequential',
            'mergeParams: true → commentRouter nhận :postId từ postRouter parent',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: 'Comment Controller .ts', code: COMMENT_CONTROLLER },
            { label: 'Like Controller .ts', code: LIKE_CONTROLLER },
            { label: 'Nested Routes .ts', code: ROUTES },
          ]}
        />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable
          rows={[
            {
              line: '1',
              explanation:
                'parentId: { $exists: false } — MongoDB query lấy documents không có field parentId. Dùng cho threaded comments: load top-level trước, rồi lazy-load replies khi user expand. Không load tất cả levels cùng lúc — tránh N+1.',
            },
            {
              line: '2',
              explanation:
                'Router({ mergeParams: true }): bắt buộc phải set khi dùng nested routers. Nếu không set, :postId sẽ undefined trong commentRouter. mergeParams merge params của parent và child routers.',
            },
            {
              line: '3',
              explanation:
                'Promise.all([existingLike.deleteOne(), Post.findByIdAndUpdate(...)]): 2 DB operations chạy song song. Không cần đợi operation 1 xong mới chạy operation 2 — độc lập nhau. Giảm latency từ 2x xuống 1x.',
            },
            {
              line: '4',
              explanation:
                'likeCount trong response: post.likeCount +/- 1 (optimistic update) thay vì query lại DB. Nhanh hơn nhưng có thể sai nếu có race condition. Cho blog personal, chấp nhận được. Production: dùng $inc result hoặc aggregate.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Quên <code>mergeParams: true</code> khi tạo nested Router → <code>req.params.postId</code>{' '}
          luôn là <code>undefined</code> trong comment/like controllers. TypeScript không bắt lỗi
          này — req.params luôn là <code>Record&lt;string, string&gt;</code>. Chỉ phát hiện lúc
          runtime khi query MongoDB với <code>undefined</code>.
        </Callout>
        <Callout type="note">
          <strong>Race condition trong toggle like</strong>: Nếu 2 requests toggle cùng lúc cả 2 đều
          thấy <code>existingLike = null</code> → cả 2 tạo Like → duplicate key error (unique
          index). Giải pháp: try/catch DuplicateKeyError (code 11000) → return{' '}
          <code>&#123;liked: true&#125;</code>. Compound unique index là safety net.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Implement Comments CRUD + Like toggle. Test flow: tạo post → comment vào post → like post → unlike → like lại. Kiểm tra likeCount chính xác và unique constraint trên Like model.',
            },
            {
              level: 'medium',
              text: 'Implement GET replies: GET /api/comments/:commentId/replies trả danh sách comments có parentId === commentId. Dùng lại paginate<IComment>(). Test threaded conversation: post → comment → reply to comment.',
            },
            {
              level: 'hard',
              text: 'Implement comment count denormalization: thêm commentCount vào IPost. Tăng khi create comment, giảm khi delete. Xử lý khi xóa comment có replies — nên xóa luôn replies hay chỉ soft-delete parent? Document trade-off.',
            },
          ]}
          hint="Like.exists({ post, user }) trả null hoặc { _id: ObjectId } — truthy/falsy. Dùng !!liked để convert sang boolean rõ ràng. Like.findOne() cũng được nhưng .exists() nhanh hơn vì không fetch full document."
        />
      </Sec>
    </LessonCard>
  );
}
