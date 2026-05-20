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

const BASIC = `import rateLimit from 'express-rate-limit';

// Rate limiter global — áp dụng cho tất cả routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max:      100,             // tối đa 100 requests mỗi IP
  message:  {
    error: 'Too many requests, please try again after 15 minutes',
  },
  standardHeaders: true,  // trả RateLimit-* headers (RFC 6585)
  legacyHeaders:   false, // tắt X-RateLimit-* headers cũ
});

app.use(globalLimiter);`;

const REAL = `import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';

// ── Auth endpoints — strict (brute-force protection) ─────────────────────────
const authLimiter: RateLimitRequestHandler = rateLimit({
  windowMs:   15 * 60 * 1000,  // 15 phút
  max:        10,               // chỉ 10 lần thử — ngăn brute force
  skipSuccessfulRequests: true, // chỉ count failed requests
  message: {
    success: false,
    error:   'Quá nhiều lần thử. Vui lòng thử lại sau 15 phút.',
  },
  standardHeaders: true,
  legacyHeaders:   false,
});

// ── API routes — moderate ─────────────────────────────────────────────────────
const apiLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max:      60,        // 60 requests/phút = 1 req/giây
  message:  { success: false, error: 'Rate limit exceeded' },
  standardHeaders: true,
  legacyHeaders:   false,

  // Custom key: theo user ID nếu đã đăng nhập, theo IP nếu chưa
  keyGenerator: (req) => {
    return (req as any).user?.id || req.ip || 'unknown';
  },
});

// ── Apply ─────────────────────────────────────────────────────────────────────
app.use('/api', apiLimiter);
app.use('/api/auth/login',    authLimiter);
app.use('/api/auth/register', authLimiter);`;

const MISTAKE = `// ❌ Sai lầm 1: Rate limit quá cao — không bảo vệ được
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10000, // 10000 requests/phút = vô dụng
});

// ✅ Đúng: tùy route — auth endpoint strict hơn API
// Auth: 5-10 lần/15 phút, API: 60-100 lần/phút

// ❌ Sai lầm 2: Không set standardHeaders — client không biết còn bao nhiêu lượt
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
// Response không có RateLimit-Remaining header
// Client không biết còn bao nhiêu request → không thể implement retry logic

// ✅ Đúng: bật standardHeaders để client retry thông minh
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,  // RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset
  legacyHeaders: false,   // tắt deprecated X-RateLimit-* headers
});

// ❌ Sai lầm 3: Deploy nhiều instance (cluster) — rate limit không đồng bộ
// Mỗi instance có in-memory store riêng → mỗi process cho 100 requests
// 4 processes → user thực sự được 400 requests!

// ✅ Đúng production: dùng Redis store
import RedisStore from 'rate-limit-redis';
const limiter = rateLimit({
  store: new RedisStore({ /* redis client */ }),
  windowMs: 15 * 60 * 1000,
  max: 100,
});`;

export default function Lesson07({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-03-07"
      num="07"
      title="Rate limiting với express-rate-limit"
      desc="RateLimitRequestHandler type, per-route limits, brute-force protection"
      priority="medium"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Rate limiting giới hạn số lượng request một IP (hoặc user) có thể gửi trong một khoảng thời
        gian. Thiếu rate limiting khiến API dễ bị brute-force (đoán password), spam, hoặc DoS.
        Package <code>express-rate-limit</code> từ v7 có built-in TypeScript types —{' '}
        <code>RateLimitRequestHandler</code> là type cho limiter instance, không cần{' '}
        <code>@types</code> riêng.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Request đến → rate limiter check IP (hoặc key tùy chỉnh) trong store',
            'Nếu count < max: cho qua, tăng counter, thêm RateLimit headers vào response',
            'Nếu count >= max: trả 429 Too Many Requests với message đã cấu hình',
            'windowMs đếm ngược → khi hết window, counter reset về 0',
            'skipSuccessfulRequests: true — chỉ count requests thất bại (hữu ích cho login)',
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
                'windowMs — sliding window tính bằng milliseconds. 15 * 60 * 1000 = 15 phút. Counter reset sau mỗi window.',
            },
            {
              line: '2',
              explanation:
                'max: 100 — tối đa 100 requests mỗi IP trong windowMs. Khi đạt → 429 response cho đến hết window.',
            },
            {
              line: '3',
              explanation:
                'standardHeaders: true — thêm RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset headers. Client dùng để biết còn bao nhiêu lượt và khi nào reset.',
            },
            {
              line: '4',
              explanation:
                'skipSuccessfulRequests: true — đặc biệt hữu ích cho auth endpoints. Chỉ đếm login failed, không đếm login thành công. User thật đăng nhập thành công không bị ảnh hưởng.',
            },
            {
              line: '5',
              explanation:
                'keyGenerator: (req) => req.user?.id || req.ip — tùy chỉnh key cho rate limit. Theo user ID thì fair hơn IP (nhiều user cùng IP ở office không bị ảnh hưởng lẫn nhau).',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          In-memory store (default) không đồng bộ giữa nhiều server instances. Nếu deploy với PM2
          cluster hoặc horizontal scaling, mỗi process có counter riêng — rate limit thực tế nhân
          với số processes. Cần Redis store cho production multi-instance.
        </Callout>
        <Callout type="note">
          Auth endpoints cần strict hơn nhiều so với API thông thường. Login 5–10 lần/15 phút là đủ
          cho user thật. API thông thường 60–100 lần/phút. Đừng áp dụng auth limit cho tất cả routes
          — gây khó chịu không cần thiết.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Thêm globalLimiter (100 req/15 phút) cho tất cả routes. Thêm authLimiter (5 req/15 phút) riêng cho POST /auth/login.',
            },
            {
              level: 'medium',
              text: 'Implement keyGenerator dùng user ID nếu có req.user (đã auth), fallback về req.ip. Rate limit 100 req/min per user, 20 req/min per IP (unauthenticated).',
            },
            {
              level: 'hard',
              text: 'Tạo custom middleware skip rate limit cho whitelisted IPs (đọc từ env TRUSTED_IPS). Implement tiered rate limiting: free users 60 req/min, premium users 600 req/min (đọc từ req.user.tier).',
            },
          ]}
          hint="skip option nhận function trả boolean — true để bỏ qua rate limit. keyGenerator kết hợp cả user ID và tier để tạo different limits cho different user types."
        />
      </Sec>
    </LessonCard>
  );
}
