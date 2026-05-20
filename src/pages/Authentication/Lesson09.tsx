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

const BASIC = `import helmet from 'helmet'; // built-in TypeScript types — không cần @types/helmet
import express, { Express } from 'express';

const app: Express = express();

// helmet() thêm 14+ security headers trong 1 dòng
app.use(helmet());

// Các headers helmet thêm:
// Content-Security-Policy: default-src 'self' — chặn XSS
// X-Frame-Options: SAMEORIGIN — chặn clickjacking
// X-Content-Type-Options: nosniff — chặn MIME sniffing
// Strict-Transport-Security: max-age=15552000 — bắt buộc HTTPS
// X-XSS-Protection: 0 — tắt built-in XSS filter (đã deprecated, CSP tốt hơn)
// Referrer-Policy: no-referrer — không gửi Referer header
// Cross-Origin-Opener-Policy: same-origin
// Cross-Origin-Resource-Policy: same-origin`;

const REAL = `import helmet from 'helmet';
import express from 'express';
import cors from 'cors';

const app = express();

// --- 1. Helmet với custom config ---
app.use(
  helmet({
    // Cho phép inline scripts từ CDN (nếu có)
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc:  ["'self'", 'https://cdn.jsdelivr.net'],
        styleSrc:   ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        imgSrc:     ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc:    ["'self'", 'https://fonts.gstatic.com'],
      },
    },
    // Tắt CSP (development only) — không nên tắt ở production
    // contentSecurityPolicy: false,

    // Cross-Origin-Resource-Policy — cho phép load resources từ origin khác
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// --- 2. CORS cấu hình an toàn ---
const allowedOrigins = [
  'http://localhost:5173',
  'https://yourdomain.com',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Cho phép requests không có origin (Postman, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS: Origin không được phép'));
      }
    },
    credentials: true,           // Cho phép cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,                  // Cache preflight 10 phút
  })
);

// --- 3. Hide Express fingerprint ---
app.disable('x-powered-by'); // Xóa header "X-Powered-By: Express"
// Helmet đã làm điều này — nhưng tường minh không hại`;

const MISTAKE = `// ❌ Sai lầm 1: Đặt helmet() sau các routes — headers không được thêm
app.get('/api/users', getUsers); // route không có security headers!
app.use(helmet());               // quá muộn

// ✅ Luôn đặt middleware security ĐẦU TIÊN — trước tất cả routes
app.use(helmet());
app.use(cors(...));
app.use(express.json());
// ... routes sau

// ❌ Sai lầm 2: CORS cho phép mọi origin — không an toàn
app.use(cors()); // origin: * — bất kỳ website nào cũng gọi được API!

// ✅ Whitelist explicit origins
app.use(cors({
  origin: ['https://yourdomain.com', 'http://localhost:5173'],
  credentials: true,
}));

// ❌ Sai lầm 3: Tắt hoàn toàn CSP (Content-Security-Policy)
app.use(helmet({ contentSecurityPolicy: false })); // mất bảo vệ XSS quan trọng nhất

// ✅ Cấu hình CSP phù hợp thay vì tắt
app.use(helmet({
  contentSecurityPolicy: {
    directives: { scriptSrc: ["'self'", 'https://trusted-cdn.com'] }
  }
}));

// ❌ Sai lầm 4: Để X-Powered-By header
// Response: X-Powered-By: Express
// Attacker biết tech stack → target known Express vulnerabilities

// ✅ app.disable('x-powered-by') hoặc dùng helmet() (đã xử lý)`;

export default function Lesson09({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-06-09"
      num="09"
      title="Helmet + Security Headers"
      desc="helmet() 14 headers, Content-Security-Policy, CORS an toàn, ẩn Express fingerprint"
      priority="medium"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Security headers là lớp bảo vệ đầu tiên ở tầng HTTP — browser (hoặc client) đọc headers và
        áp dụng policies. <code>helmet</code> là middleware Express thêm 14+ headers bảo mật trong 1
        dòng. Không thay thế authentication hay validation — bổ sung thêm. Quan trọng nhất:{' '}
        <strong>Content-Security-Policy</strong> (chặn XSS),{' '}
        <strong>Strict-Transport-Security</strong> (bắt HTTPS), <strong>X-Frame-Options</strong>{' '}
        (chặn clickjacking). Helmet v7+ có TypeScript types bundled — không cần{' '}
        <code>@types/helmet</code>.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'app.use(helmet()) — mount middleware ĐẦU TIÊN, trước routes',
            'Mỗi request → helmet thêm security headers vào response',
            'Browser nhận response → đọc CSP → chặn scripts/styles không trong whitelist',
            'Strict-Transport-Security → browser tự redirect HTTP → HTTPS cho domain này',
            'X-Frame-Options: SAMEORIGIN → browser từ chối embed trang trong iframe từ domain khác',
            'Không lộ "X-Powered-By: Express" → attacker không biết tech stack',
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
                'import helmet from "helmet": helmet v7+ không cần @types/helmet — types bundled. app.use(helmet()) thêm toàn bộ default headers. Có thể fine-tune từng header bằng options object.',
            },
            {
              line: '2',
              explanation:
                'Content-Security-Policy (CSP): header quan trọng nhất. Whitelist sources cho scripts, styles, images. Browser refuse load resources không trong whitelist — chặn XSS injected scripts từ domain lạ.',
            },
            {
              line: '3',
              explanation:
                'cors() với origin function: dynamic origin check. Cho phép requests không có origin header (Postman, server-to-server). allowedOrigins whitelist — chỉ approve frontend domains của mình. credentials: true bắt buộc khi dùng cookies.',
            },
            {
              line: '4',
              explanation:
                'app.disable("x-powered-by"): xóa header "X-Powered-By: Express". Fingerprinting: attacker scan headers để biết stack → lookup known vulnerabilities. Ẩn tech stack là security through obscurity — defense in depth.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Đặt <code>app.use(helmet())</code> và <code>app.use(cors())</code> phải là dòng đầu tiên,
          trước <code>app.use(express.json())</code> và tất cả routes. Nếu đặt sau routes, các
          request đến routes đó không có security headers.
        </Callout>
        <Callout type="note">
          CORS <code>credentials: true</code> bắt buộc khi frontend dùng{' '}
          <code>fetch(url, {'{ credentials: "include" }'})</code> để gửi cookies. Đồng thời,{' '}
          <code>origin</code> phải là URL cụ thể (không phải <code>"*"</code>) — browser từ chối{' '}
          <code>credentials</code> với wildcard origin.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Thêm helmet() vào Blog API app.ts. Dùng curl -I http://localhost:3000/api/users hoặc browser DevTools Network tab để xem headers trước và sau khi thêm helmet. List ra các headers mới.',
            },
            {
              level: 'medium',
              text: 'Cấu hình CORS cho phép http://localhost:5173 (Vite dev) và https://myblog.com (production). Bật credentials: true. Test với Postman (không có origin header → phải pass) và browser fetch với credentials: "include".',
            },
            {
              level: 'hard',
              text: 'Cấu hình CSP strict: chỉ cho phép scripts từ self, styles từ self + Google Fonts, images từ self + data: + cloudinary. Test: inject <script>alert("xss")</script> vào comment → browser có block không? Check CSP violation report.',
            },
          ]}
          hint="Để test CSP violation: thêm reportUri vào CSP config — browser gửi violation report đến endpoint đó khi có vi phạm. Nhanh hơn: mở F12 → Console → thấy CSP violation warning khi load resource bị block."
        />
      </Sec>
    </LessonCard>
  );
}
