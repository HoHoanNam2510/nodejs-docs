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

const BASIC = `import { RequestHandler } from 'express';
import { AppError } from '../utils/AppError';

// Role type — literal union để TypeScript enforce valid roles
type UserRole = 'user' | 'admin';

// requireRole là higher-order function — nhận roles, trả RequestHandler
export const requireRole =
  (...roles: UserRole[]): RequestHandler =>
  (req, res, next) => {
    // req.user được inject bởi authenticate middleware (chạy trước)
    if (!req.user) {
      throw new AppError('Chưa xác thực', 401);
    }

    const userRole: UserRole = req.user.role;

    // includes() check xem user role có trong danh sách allowed roles
    if (!roles.includes(userRole)) {
      throw new AppError('Bạn không có quyền thực hiện thao tác này', 403);
    }

    next();
  };

// --- Cách dùng ---
import { authenticate } from '../middleware/authenticate';
import { requireRole }  from '../middleware/requireRole';

// Chỉ admin
router.delete('/posts/:id', authenticate, requireRole('admin'), deletePost);

// Admin hoặc moderator
router.put('/posts/:id/feature', authenticate, requireRole('admin', 'moderator'), featurePost);

// Chỉ user đã đăng nhập (bất kỳ role)
router.get('/profile', authenticate, getProfile);`;

const REAL = `// src/middleware/requireRole.ts — RBAC đầy đủ với resource ownership

import { RequestHandler, Request } from 'express';
import { AppError } from '../utils/AppError';
import { Types } from 'mongoose';

type UserRole = 'user' | 'admin' | 'moderator';

// --- 1. Role-based middleware ---
export const requireRole =
  (...roles: UserRole[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) throw new AppError('Chưa xác thực', 401);
    if (!roles.includes(req.user.role as UserRole)) {
      throw new AppError('Không có quyền', 403);
    }
    next();
  };

// --- 2. Ownership check — chỉ chủ sở hữu hoặc admin ---
export const requireOwnerOrAdmin =
  (getOwnerId: (req: Request) => string | Types.ObjectId): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) throw new AppError('Chưa xác thực', 401);

    const ownerId = getOwnerId(req).toString();
    const userId  = req.user._id.toString();
    const isOwner = ownerId === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new AppError('Chỉ chủ sở hữu hoặc admin mới có quyền', 403);
    }
    next();
  };

// --- Dùng requireOwnerOrAdmin ---
import { Post } from '../models/Post';

// User chỉ update bài của mình, admin update bất kỳ bài
router.put(
  '/posts/:id',
  authenticate,
  asyncHandler(async (req, _res, next) => {
    const post = await Post.findById(req.params.id);
    if (!post) throw new AppError('Bài viết không tồn tại', 404);
    // Truyền author ID vào requireOwnerOrAdmin
    requireOwnerOrAdmin(() => post.author)(req, _res, next);
  }),
  updatePost
);`;

const MISTAKE = `// ❌ Sai lầm 1: Hardcode role check trong mỗi controller — không reuse
export const deletePost = asyncHandler(async (req, res) => {
  if (req.user?.role !== 'admin') { // lặp ở mọi admin route
    return res.status(403).json({ error: 'Không có quyền' });
  }
  await Post.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ✅ Dùng requireRole middleware — một lần, apply nhiều routes
router.delete('/posts/:id', authenticate, requireRole('admin'), deletePost);
// deletePost chỉ lo business logic

// ❌ Sai lầm 2: Không phân biệt 401 vs 403
throw new AppError('Unauthorized', 401); // dùng cho cả "chưa đăng nhập" VÀ "không có quyền"
// HTTP standard:
// 401 Unauthorized = chưa authenticate (chưa có token / token invalid)
// 403 Forbidden    = đã authenticate nhưng không có quyền (wrong role)

// ✅ Dùng đúng status code
if (!req.user) throw new AppError('Chưa đăng nhập', 401);       // 401
if (!roles.includes(req.user.role)) throw new AppError('...', 403); // 403

// ❌ Sai lầm 3: Quên chain authenticate trước requireRole
router.delete('/admin/users/:id', requireRole('admin'), deleteUser);
// requireRole check req.user — nhưng req.user chưa được inject!
// → req.user = undefined → throw AppError 401 dù user có token hợp lệ

// ✅ Luôn authenticate TRƯỚC requireRole
router.delete('/admin/users/:id', authenticate, requireRole('admin'), deleteUser);`;

export default function Lesson08({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-06-08"
      num="08"
      title="RBAC — requireRole middleware"
      desc="Role-based access control, UserRole literal union, ownership check, 401 vs 403"
      priority="medium"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        RBAC (Role-Based Access Control) là pattern phân quyền dựa trên vai trò của user. Middleware{' '}
        <code>requireRole('admin')</code> là <strong>higher-order function</strong>: nhận list roles
        được phép → trả <code>RequestHandler</code>. TypeScript literal union{' '}
        <code>'user' | 'admin'</code> đảm bảo không thể truyền role không hợp lệ. Pattern này kết
        hợp với <code>authenticate</code> trước: authenticate xác định "ai?" — requireRole xác định
        "được làm gì?".
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'authenticate middleware chạy trước — inject req.user: IUser',
            'requireRole("admin") được gọi → trả RequestHandler (curry pattern)',
            'RequestHandler check: req.user có tồn tại không? (401 nếu không)',
            'roles.includes(req.user.role) — user có đúng role không? (403 nếu không)',
            'next() — tiếp tục xử lý route handler',
            'Controller nhận request đã verify cả authentication và authorization',
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
                'type UserRole = "user" | "admin": TypeScript literal union. Truyền "superadmin" vào requireRole("superadmin") → compile error ngay, không đợi runtime. roles: UserRole[] — rest parameter, nhận 0+ args.',
            },
            {
              line: '2',
              explanation:
                'Higher-order function pattern: requireRole(...roles) → (req, res, next) => { ... }. Gọi requireRole("admin") ngay khi define route → trả RequestHandler được mount vào route. Express gọi handler này khi request đến.',
            },
            {
              line: '3',
              explanation:
                '401 vs 403: 401 Unauthorized = chưa authenticate (req.user undefined). 403 Forbidden = đã authenticate nhưng không đủ quyền (wrong role). Client xử lý khác nhau: 401 → redirect to login, 403 → show "access denied".',
            },
            {
              line: '4',
              explanation:
                'requireOwnerOrAdmin: ownership-based authorization. getOwnerId là callback — caller truyền cách lấy owner ID. Linh hoạt: có thể dùng cho Post, Comment, Profile... chỉ cần truyền function lấy ownerId phù hợp.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Luôn chain <code>authenticate</code> trước <code>requireRole</code>. Nếu không,{' '}
          <code>req.user</code> là <code>undefined</code> và <code>requireRole</code> throw 401 dù
          user có token hợp lệ. Thứ tự: <code>authenticate → requireRole → controller</code>.
        </Callout>
        <Callout type="note">
          <strong>401 vs 403</strong>: 401 Unauthorized = chưa login (không có token hoặc token
          invalid). 403 Forbidden = đã login nhưng không có quyền (wrong role). Phân biệt đúng giúp
          frontend xử lý chính xác: 401 → redirect login page, 403 → show "bạn không có quyền" và
          không redirect.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Viết requireRole với UserRole literal union. Test: route DELETE /admin/posts/:id với authenticate + requireRole("admin"). Gửi request với user token (role: user) → phải nhận 403. Gửi với admin token → phải qua.',
            },
            {
              level: 'medium',
              text: 'Implement requireOwnerOrAdmin middleware cho Blog API: POST update post chỉ cho phép author của bài hoặc admin. Test: author của bài → 200, user khác → 403, admin → 200.',
            },
            {
              level: 'hard',
              text: 'Implement RBAC matrix đầy đủ: 3 roles (user, moderator, admin). moderator có thể xóa comment bất kỳ nhưng không xóa post. admin có thể làm mọi thứ. Viết permissions object { resource: { action: roles[] } } và middleware checkPermission(resource, action) tra cứu từ matrix.',
            },
          ]}
          hint="Permissions matrix: const PERMISSIONS = { post: { delete: ['admin'], update: ['admin', 'moderator'] }, comment: { delete: ['admin', 'moderator'] } }. Middleware: const allowed = PERMISSIONS[resource]?.[action] ?? []; if (!allowed.includes(req.user.role)) throw new AppError('Forbidden', 403)."
        />
      </Sec>
    </LessonCard>
  );
}
