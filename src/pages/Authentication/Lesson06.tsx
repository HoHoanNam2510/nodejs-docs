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

const BASIC = `// src/types/express.d.ts — Declaration Merging để thêm req.user
import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // optional vì chưa authenticate thì undefined
    }
  }
}

// src/middleware/authenticate.ts
import { RequestHandler } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { verifyAccessToken } from '../utils/jwt';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';

export const authenticate: RequestHandler = asyncHandler(async (req, res, next) => {
  // 1. Extract token từ Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Chưa đăng nhập — cần Bearer token', 401);
  }
  const token = authHeader.split(' ')[1]; // 'Bearer <token>' → '<token>'

  // 2. Verify token — throw nếu expired hoặc invalid
  const payload = verifyAccessToken(token);

  // 3. Lấy user từ DB (đảm bảo user vẫn còn tồn tại và active)
  const user = await User.findById(payload.userId).select('-password');
  if (!user) throw new AppError('User không tồn tại', 401);

  // 4. Gán vào req.user — TypeScript OK vì đã extend Request interface
  req.user = user;
  next();
});`;

const REAL = `// Dùng authenticate trong routes

import { authenticate } from '../middleware/authenticate';

// Protected route — phải đăng nhập
router.get('/profile', authenticate, getProfile);

// --- Controller có thể access req.user với full type ---
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  // req.user: IUser | undefined (vì optional trong interface)
  // Nhưng nếu route đã qua authenticate → req.user chắc chắn có
  // TypeScript không biết điều này → cần non-null assertion hoặc check
  const user = req.user!; // safe sau authenticate middleware

  res.json({
    success: true,
    data: {
      _id:       user._id,
      name:      user.name,
      email:     user.email,
      role:      user.role,
      createdAt: user.createdAt,
    },
  });
});

// --- Helper type để rõ hơn ---
// src/types/express.d.ts — thêm authenticated request type
import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// Trong controller có thể cast để bỏ ?
type AuthRequest = Request & { user: IUser }; // user chắc chắn có

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user: IUser = req.user; // không cần !
  // ...
});`;

const MISTAKE = `// ❌ Sai lầm 1: Không tạo express.d.ts — req.user báo lỗi TypeScript
req.user = user; // Error: Property 'user' does not exist on type 'Request'

// ✅ Tạo src/types/express.d.ts với Declaration Merging
// File này phải được TypeScript tự động pick up — không cần import

// ❌ Sai lầm 2: express.d.ts đặt sai chỗ — TypeScript không tìm thấy
// src/express.d.ts (cùng cấp với main.ts) → có thể không được include
// ✅ Đặt trong src/types/express.d.ts và đảm bảo tsconfig include src/**

// ❌ Sai lầm 3: Không verify user vẫn tồn tại trong DB
export const authenticate = asyncHandler(async (req, res, next) => {
  const payload = verifyAccessToken(token);
  req.user = { _id: payload.userId, role: payload.role } as IUser; // giả lập user từ token
  // Nếu user đã bị xóa khỏi DB nhưng token chưa hết hạn → vẫn qua!
  next();
});

// ✅ Luôn query DB để confirm user vẫn tồn tại
const user = await User.findById(payload.userId);
if (!user) throw new AppError('User không tồn tại', 401);
req.user = user;

// ❌ Sai lầm 4: Bỏ qua case user bị ban/deactivated
const user = await User.findById(payload.userId);
req.user = user!; // không check isActive

// ✅ Check trạng thái user
if (!user || !user.isActive) {
  throw new AppError('Tài khoản đã bị vô hiệu hóa', 403);
}`;

export default function Lesson06({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-06-06"
      num="06"
      title="Auth middleware — typed req.user"
      desc="Declaration Merging mở rộng Request, authenticate RequestHandler, verify token + query DB"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Auth middleware là cầu nối giữa "verify token" và "biết user là ai". Bằng{' '}
        <strong>Declaration Merging</strong>, TypeScript cho phép mở rộng interface{' '}
        <code>Express.Request</code> để thêm <code>req.user</code> — sau middleware này, tất cả
        controllers đều có <code>req.user</code> typed là <code>IUser</code>. Không cần cast thủ
        công ở mỗi controller. Đây là pattern chuẩn trong Express + TypeScript projects.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Request đến protected route → authenticate middleware chạy trước',
            'Extract "Bearer <token>" từ Authorization header',
            'verifyAccessToken(token) → JwtPayload hoặc throw AppError(401)',
            'User.findById(payload.userId) — confirm user vẫn tồn tại trong DB',
            'req.user = user — gán IUser vào request object',
            'next() — tiếp tục xử lý, controller có req.user typed sẵn',
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
                'declare global { namespace Express { interface Request { user?: IUser } } }: Declaration Merging. TypeScript merge interface này với Express.Request — mọi Request object trong project đều có user? field. File .d.ts không cần export.',
            },
            {
              line: '2',
              explanation:
                'authHeader?.startsWith("Bearer "): optional chaining — nếu authHeader undefined → không throw, chỉ trả undefined. Startswith "Bearer " (có space) là convention của Authorization header (RFC 6750).',
            },
            {
              line: '3',
              explanation:
                '.select("-password"): loại bỏ password khỏi user document được gán vào req.user. Middleware chạy mọi request — không muốn load password không cần thiết vào memory.',
            },
            {
              line: '4',
              explanation:
                'req.user = user: TypeScript OK vì đã declare user? trong Express.Request namespace. Không có .d.ts file → error "Property user does not exist". File .d.ts phải trong phạm vi include của tsconfig (thường là src/**).',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Declaration Merging chỉ hoạt động khi file <code>express.d.ts</code> được TypeScript
          include. Kiểm tra <code>tsconfig.json</code>: <code>include: ["src/**/*"]</code> phải bao
          gồm thư mục chứa file này. Nếu TypeScript không pickup, sẽ báo "Property user does not
          exist on type Request" dù file đã tạo.
        </Callout>
        <Callout type="note">
          Luôn query DB trong authenticate middleware, không chỉ trust token payload. Nếu user bị
          xóa hoặc ban sau khi token được issue, chỉ DB mới biết. Token payload là snapshot tại thời
          điểm sign — DB là source of truth. Trade-off: thêm 1 DB query mỗi request → cân nhắc cache
          user object với Redis (TTL ngắn).
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Tạo src/types/express.d.ts với Declaration Merging thêm req.user?: IUser. Tạo authenticate middleware extract Bearer token → verify → findById → req.user. Test: protected route trả req.user khi có token hợp lệ, 401 khi thiếu/sai token.',
            },
            {
              level: 'medium',
              text: 'Thêm isActive: boolean vào IUser. Trong authenticate, check user.isActive — throw AppError(403, "Tài khoản đã bị vô hiệu hóa") nếu false. Test: tạo user → set isActive: false → verify authenticate reject request dù token hợp lệ.',
            },
            {
              level: 'hard',
              text: 'Optimize authenticate với Redis cache: sau khi query DB lần đầu, lưu user vào Redis với key "user:{userId}" và TTL 5 phút. Request tiếp theo trong 5 phút: đọc từ cache thay vì DB. Invalidate cache khi user bị update hoặc ban.',
            },
          ]}
          hint="Nếu req.user vẫn báo lỗi TypeScript dù đã tạo express.d.ts: kiểm tra tsconfig.json có include src/**/* không. Một cách khác: thêm /// <reference path='../types/express.d.ts' /> vào file cần dùng."
        />
      </Sec>
    </LessonCard>
  );
}
