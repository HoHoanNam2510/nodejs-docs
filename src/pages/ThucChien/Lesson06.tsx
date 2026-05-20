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

const ADMIN_CONTROLLER = `// src/controllers/admin.controller.ts
import { Request, Response }  from 'express';
import { z }                  from 'zod';
import { asyncHandler }       from '../utils/asyncHandler';
import { AppError }           from '../utils/AppError';
import { sendSuccess }        from '../utils/response';
import { User }               from '../models/User';
import { Post }               from '../models/Post';
import { Comment }            from '../models/Comment';
import { Like }               from '../models/Like';

// --- GET /api/admin/users — danh sách users với search ---
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const search = req.query.search as string | undefined;
  const page   = Number(req.query.page)  || 1;
  const limit  = Number(req.query.limit) || 20;

  const filter = search
    ? { $or: [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ] }
    : {};

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);

  sendSuccess(res, { users, total, page, totalPages: Math.ceil(total / limit) });
});

// --- PATCH /api/admin/users/:id/ban — toggle ban/unban ---
export const toggleBan = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User không tồn tại', 404);
  if (user.role === 'admin')
    throw new AppError('Không thể ban admin', 403);

  user.isActive = !user.isActive;
  await user.save();

  sendSuccess(res, {
    _id:      user._id,
    isActive: user.isActive,
    message:  user.isActive ? 'Đã mở khóa tài khoản' : 'Đã vô hiệu hóa tài khoản',
  });
});

// --- DELETE /api/admin/posts/:id — xóa bài (kèm comments + likes) ---
export const adminDeletePost = asyncHandler(async (req: Request, res: Response) => {
  const post = await Post.findById(req.params.id);
  if (!post) throw new AppError('Bài viết không tồn tại', 404);

  // Xóa cascade: post + comments + likes liên quan
  await Promise.all([
    post.deleteOne(),
    Comment.deleteMany({ post: post._id }),
    Like.deleteMany({ post: post._id }),
  ]);

  sendSuccess(res, { message: 'Đã xóa bài viết và dữ liệu liên quan' });
});

// --- DELETE /api/admin/posts/bulk — xóa nhiều bài cùng lúc ---
const BulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1).max(100),
});

export const bulkDeletePosts = asyncHandler(async (req: Request, res: Response) => {
  const { ids } = BulkDeleteSchema.parse(req.body);

  const [postResult, commentResult, likeResult] = await Promise.all([
    Post.deleteMany({ _id: { $in: ids } }),
    Comment.deleteMany({ post: { $in: ids } }),
    Like.deleteMany({ post: { $in: ids } }),
  ]);

  sendSuccess(res, {
    deletedPosts:    postResult.deletedCount,
    deletedComments: commentResult.deletedCount,
    deletedLikes:    likeResult.deletedCount,
  });
});

// --- GET /api/admin/stats — tổng quan hệ thống ---
export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const [
    totalUsers,
    totalPosts,
    totalComments,
    publishedPosts,
    bannedUsers,
  ] = await Promise.all([
    User.countDocuments(),
    Post.countDocuments(),
    Comment.countDocuments(),
    Post.countDocuments({ published: true }),
    User.countDocuments({ isActive: false }),
  ]);

  sendSuccess(res, {
    totalUsers,
    totalPosts,
    totalComments,
    publishedPosts,
    bannedUsers,
  });
});`;

const ADMIN_ROUTES = `// src/routes/admin.routes.ts
import { Router }       from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireRole }  from '../middleware/requireRole';
import {
  getUsers, toggleBan,
  adminDeletePost, bulkDeletePosts,
  getStats,
} from '../controllers/admin.controller';

export const adminRouter = Router();

// Tất cả admin routes đều cần authenticate + requireRole('admin')
adminRouter.use(authenticate, requireRole('admin'));

adminRouter.get ('/stats',           getStats);
adminRouter.get ('/users',           getUsers);
adminRouter.patch('/users/:id/ban',  toggleBan);
adminRouter.delete('/posts/:id',     adminDeletePost);
adminRouter.delete('/posts/bulk',    bulkDeletePosts);

// src/app.ts — mount admin router
import { adminRouter } from './routes/admin.routes';
app.use('/api/admin', adminRouter);`;

const PROMOTE_ADMIN = `// Tạo admin user đầu tiên — chỉ dùng 1 lần khi setup
// Không nên có API endpoint promote admin — nguy cơ privilege escalation

// Cách 1: Script dùng ts-node
// src/scripts/seed-admin.ts
import mongoose from 'mongoose';
import { User } from '../models/User';
import config   from '../config/env';

async function seedAdmin() {
  await mongoose.connect(config.mongoUri);

  const admin = await User.findOneAndUpdate(
    { email: 'admin@blog.com' },
    { role: 'admin', isActive: true },
    { upsert: true, new: true }
  );

  console.log('Admin created/updated:', admin._id);
  await mongoose.disconnect();
}

seedAdmin();
// Chạy: npx tsx src/scripts/seed-admin.ts

// Cách 2: MongoDB Shell
// db.users.updateOne(
//   { email: "admin@blog.com" },
//   { $set: { role: "admin" } }
// )`;

export default function Lesson06({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-07-06"
      num="06"
      title="Admin Routes & RBAC"
      desc="requireRole('admin'), ban/unban users, cascade delete, bulk operations, system stats"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Admin routes dùng <strong>RBAC (Role-Based Access Control)</strong> — mọi request phải qua 2
        lớp middleware: <code>authenticate</code> (verify token) rồi{' '}
        <code>requireRole('admin')</code> (check role). Dùng{' '}
        <code>adminRouter.use(authenticate, requireRole('admin'))</code> để áp cho toàn bộ admin
        endpoints — không cần lặp lại từng route. Cascade delete: khi xóa post, phải xóa luôn
        comments và likes liên quan.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'adminRouter.use(authenticate, requireRole("admin")) — áp middleware cho toàn bộ router',
            'GET /admin/stats: Promise.all([count users, posts, comments, ...]) — chạy song song',
            'PATCH /admin/users/:id/ban: toggle isActive, không thể ban chính admin',
            'DELETE /admin/posts/:id: xóa post + Promise.all([deleteMany comments, likes])',
            'DELETE /admin/posts/bulk: zod parse body.ids (max 100) → $in filter → deleteMany',
            'Admin đầu tiên: tạo bằng MongoDB shell hoặc seed script — không expose API endpoint',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: 'Admin Controller .ts', code: ADMIN_CONTROLLER },
            { label: 'Admin Routes .ts', code: ADMIN_ROUTES },
            { label: 'Seed Admin .ts', code: PROMOTE_ADMIN },
          ]}
        />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable
          rows={[
            {
              line: '1',
              explanation:
                'adminRouter.use(authenticate, requireRole("admin")): middleware chain áp cho toàn bộ router. Mọi request đến /api/admin/* đều phải qua 2 checks này. Không bao giờ áp middleware theo từng route — dễ quên.',
            },
            {
              line: '2',
              explanation:
                'user.role === "admin" check trước khi ban: không cho ban admin khác. Tránh admin xóa lẫn nhau. Mở rộng: chỉ super-admin (role: "superadmin") mới ban được admin thường.',
            },
            {
              line: '3',
              explanation:
                'Promise.all([post.deleteOne(), Comment.deleteMany(), Like.deleteMany()]): cascade delete đồng thời. Nếu làm tuần tự sẽ 3x chậm hơn. Không dùng transaction ở đây vì không cần atomicity — partial deletion vẫn acceptable.',
            },
            {
              line: '4',
              explanation:
                'ids: z.array(z.string()).max(100): cap bulk operations ở 100 items. Không giới hạn → attacker gửi 10000 IDs → timeouts, memory issues. deleteMany với $in cũng có limit của MongoDB (mặc dù rất cao).',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Không có endpoint <code>POST /admin/promote</code> để promote user thành admin — đây là
          privilege escalation risk. Nếu endpoint này bị exploit (hoặc bug trong auth check), bất kỳ
          ai cũng có thể tự promote. Admin management chỉ qua DB trực tiếp hoặc seed script chạy
          locally.
        </Callout>
        <Callout type="note">
          <strong>Soft delete vs Hard delete</strong>: Ban user dùng soft delete (
          <code>isActive: false</code>) thay vì xóa khỏi DB. User data vẫn còn — posts, comments
          không bị mồ côi. Unban dễ dàng. Ngược lại, xóa post dùng hard delete vì content không cần
          giữ. Chọn strategy phù hợp với business requirement.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Implement admin routes. Tạo admin user bằng seed script. Test: login admin → GET /admin/stats, ban một user thường, verify user bị ban không login được (isActive check trong authenticate).',
            },
            {
              level: 'medium',
              text: 'Implement admin audit log: khi admin thực hiện action (ban user, delete post), ghi log vào AuditLog collection: { admin: ObjectId, action: string, target: string, timestamp: Date }. Typed đầy đủ.',
            },
            {
              level: 'hard',
              text: 'Implement dashboard endpoint: GET /admin/dashboard trả data cho dashboard: top 10 posts by views, top 10 users by post count, posts per day (last 30 days). Dùng Aggregation Pipeline với $group và $facet để gom tất cả trong 1 query.',
            },
          ]}
          hint="Kiểm tra isActive trong authenticate middleware: nếu user.isActive === false → throw AppError(403). Như vậy sau khi ban, user không thể dùng access token hiện tại (dù chưa hết hạn) — check xảy ra mỗi request."
        />
      </Sec>
    </LessonCard>
  );
}
