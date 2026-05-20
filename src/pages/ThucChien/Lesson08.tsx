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

const TYPE_CHECK = `# 1. TypeScript compile check — phải 0 errors trước khi deploy
npx tsc --noEmit

# Nếu có lỗi, fix hết. KHÔNG dùng @ts-ignore hay any để tắt
# Lỗi phổ biến:
# - Property 'x' does not exist on type 'IPost' → thiếu field trong interface
# - Object is possibly null → quên check null trước khi dùng
# - Type 'string' is not assignable to type '"user" | "admin"' → wrong literal type

# 2. Kiểm tra không có 'any' type trong production code
# (noImplicitAny đã bật trong tsconfig strict)
# Tìm any bị explicit:
grep -r ": any" src/         # should return nothing (or only in legacy util files)
grep -r "as any" src/        # should return nothing`;

const SECURITY_CHECKLIST = `// 3. Kiểm tra không lộ stack trace ở production
// src/middleware/errorHandler.ts — đã implement
if (process.env.NODE_ENV === 'production') {
  // Không trả stack, chỉ message chung cho unknown errors
  res.status(500).json({ success: false, error: 'Đã có lỗi xảy ra' });
}

// 4. Rate limiting trên auth endpoints — phải nghiêm hơn global
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 phút
  max: 10,                    // chỉ 10 login attempts/15 phút (global: 100)
  message: { success: false, error: 'Quá nhiều lần thử, hãy chờ 15 phút' },
  skipSuccessfulRequests: true,  // chỉ count failed requests
});

// Áp riêng cho auth routes
authRouter.post('/login',    authLimiter, login);
authRouter.post('/register', authLimiter, register);

// 5. Helmet bật đầy đủ
app.use(helmet());  // bật hết defaults: CSP, HSTS, X-Frame-Options, etc.
// Hoặc config chi tiết:
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
    },
  },
  hsts: {
    maxAge: 31536000,  // 1 năm
    includeSubDomains: true,
  },
}));`;

const ENV_CHECKLIST = `# 6. .env không commit — kiểm tra .gitignore
cat .gitignore
# Phải có:
# .env
# .env.local
# .env.*.local

# Tạo .env.example (commit file này — template không có values)
PORT=3000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# 7. Tất cả req.body có interface/zod schema
# Kiểm tra: search controllers — không có req.body mà không qua zod parse
grep -r "req\.body" src/controllers/ | grep -v "parse("
# Output phải rỗng — mọi req.body đều qua zod parse

# 8. .env.example phải sync với .env
# Mọi biến trong .env phải có placeholder trong .env.example
# Mọi biến trong config/env.ts phải có trong .env.example`;

const DEPLOY_CONFIG = `# Deploy lên Railway (ví dụ)

# railway.toml — config deploy
[build]
  builder = "NIXPACKS"
  buildCommand = "npm run build"

[deploy]
  startCommand = "npm run start"
  restartPolicyType = "ON_FAILURE"
  restartPolicyMaxRetries = 3

# package.json — scripts phải đúng
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev":   "tsx watch src/index.ts"
  }
}

# Checklist cuối cùng trước khi push:
# □ tsc --noEmit → 0 errors
# □ npm run build → dist/ tạo thành công
# □ node dist/index.js → server start, connect MongoDB
# □ Tất cả env vars đã set trên Railway/Render dashboard
# □ .env không trong git history (git log -- .env phải rỗng)
# □ MONGO_URI trỏ đến Atlas cluster (không phải localhost)
# □ NODE_ENV=production trên server
# □ CORS origin trỏ đúng frontend URL`;

export default function Lesson08({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-07-08"
      num="08"
      title="Pre-Deploy Checklist TypeScript"
      desc="7 điểm kiểm tra trước deploy: tsc noEmit, no-any, no-stack-trace, rate limit, Helmet, env vars, zod"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Checklist trước deploy là <strong>quality gate</strong> — không bước qua nếu còn item chưa
        tick. 7 điểm bắt buộc cho TypeScript Express API: (1) tsc --noEmit, (2) không có{' '}
        <code>any</code> type, (3) không lộ stack trace, (4) .env không commit, (5) tất cả req.body
        qua zod, (6) rate limiting trên auth, (7) Helmet bật. Đây là minimum bar — production thực
        tế còn cần thêm logging, monitoring, backup DB...
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'tsc --noEmit: full type-check không emit files. 0 errors → tiếp tục. Có errors → fix hết.',
            'grep ": any" src/ và "as any" → không được có kết quả trong production code',
            'Review errorHandler: unknown errors ở production trả message chung, không lộ stack',
            '.gitignore check: .env phải listed. git log -- .env phải rỗng (không trong history)',
            'grep "req.body" src/controllers/ | grep -v "parse(" → phải rỗng',
            'npm run build → dist/ tạo thành công → node dist/index.js → server start OK',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: 'TypeScript Checks', code: TYPE_CHECK },
            { label: 'Security Checklist .ts', code: SECURITY_CHECKLIST },
            { label: 'Env & .gitignore', code: ENV_CHECKLIST },
            { label: 'Deploy Config', code: DEPLOY_CONFIG },
          ]}
        />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable
          rows={[
            {
              line: '1',
              explanation:
                'tsc --noEmit: compile TypeScript và báo lỗi nhưng không tạo file dist/. Dùng cho CI/CD check hoặc pre-deploy. Nhanh hơn tsc vì không ghi đĩa. npm script "type-check": "tsc --noEmit" — chạy trước deploy.',
            },
            {
              line: '2',
              explanation:
                'skipSuccessfulRequests: true trong authLimiter: chỉ count failed requests vào window. User login đúng 5 lần thì sai 1 lần — vẫn còn 9 attempts. Tránh lock out user hợp lệ trong khi vẫn chặn brute force.',
            },
            {
              line: '3',
              explanation:
                'git log -- .env: kiểm tra file .env có trong git history không. Nếu đã commit .env một lần (dù đã xóa sau), credentials vẫn còn trong history. Cần rotate tất cả secrets trong .env đó. git filter-branch hoặc BFG Repo Cleaner để xóa khỏi history.',
            },
            {
              line: '4',
              explanation:
                'NODE_ENV=production trên server: ảnh hưởng nhiều thứ: errorHandler không trả stack, Express tắt một số debug behaviors, bcrypt cost factor có thể scale, cookie secure: true. Không set → app chạy như development → security gaps.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Commit <code>.env</code> lên GitHub (dù là private repo) là lỗi nghiêm trọng. GitHub scan
          public repos cho credentials — secrets bị expose trong vài giây. Private repos cũng có
          nguy cơ nếu repo bị fork, clone, hoặc leak. Ngay khi phát hiện commit .env:{' '}
          <strong>rotate tất cả secrets trước</strong>, rồi mới clean git history.
        </Callout>
        <Callout type="note">
          <strong>Sau khi deploy</strong>: Test production endpoint với Thunder Client hoặc Bruno.
          Verify: (1) HTTPS hoạt động, (2) CORS accept requests từ frontend domain, (3) login flow
          hoàn chỉnh end-to-end, (4) rate limiting kick in sau 10 login fails, (5) admin routes từ
          chối non-admin. Production smoke test, không chỉ unit tests.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Chạy đầy đủ 7-item checklist cho Social Blog API. Fix tất cả issues tìm thấy. Cuối cùng: tsc --noEmit → 0 errors, npm run build → success, node dist/index.js → server start + MongoDB connected.',
            },
            {
              level: 'medium',
              text: 'Setup GitHub Actions CI/CD: workflow chạy khi push → checkout → npm ci → tsc --noEmit → npm run build. Nếu bất kỳ step nào fail → block merge. Thêm badge CI status vào README.',
            },
            {
              level: 'hard',
              text: 'Deploy lên Railway hoặc Render. Cấu hình: build command "npm run build", start command "node dist/index.js", env vars từ dashboard (không hardcode). Test production URL với toàn bộ flow: register → login → create post → like → comment → admin delete.',
            },
          ]}
          hint="Railway tự detect Node.js project và chạy npm run build → npm run start. Render cần specify build command và start command trong dashboard. Cả hai đều support MongoDB Atlas connection string qua env vars — không cần change code."
        />
      </Sec>
    </LessonCard>
  );
}
