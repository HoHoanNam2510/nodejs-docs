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

const BASIC = `import cors, { CorsOptions } from 'cors';
import express from 'express';

const app = express();

// ── Cách 1: Cho phép tất cả origins (chỉ dùng khi dev/public API)
app.use(cors());

// ── Cách 2: Config cụ thể (production)
const corsOptions: CorsOptions = {
  origin:      ['http://localhost:5173', 'https://myapp.com'],
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // cho phép cookies + Authorization header
  maxAge:      86400, // cache preflight 24 giờ
};

app.use(cors(corsOptions));`;

const REAL = `import cors, { CorsOptions, CorsOptionsDelegate } from 'cors';
import config from './config/env';

// ── Dynamic origin check — đọc từ database/config ────────────────────────────
const allowedOrigins = new Set(config.corsOrigin);
// config.corsOrigin = ['http://localhost:5173', 'https://myapp.com']

const corsDelegate: CorsOptionsDelegate = (req, callback) => {
  const origin = req.headers.origin;

  if (!origin || allowedOrigins.has(origin)) {
    // No origin (server-to-server, curl) hoặc origin trong whitelist
    callback(null, { origin: true, credentials: true });
  } else {
    callback(new Error(\`Origin \${origin} not allowed\`));
  }
};

app.use(cors(corsDelegate));

// ── CORS chỉ cho route API, không áp dụng cho static files ───────────────────
app.use('/api', cors(corsOptions), apiRouter);
app.use(express.static('public')); // không có CORS header

// ── Preflight handler ─────────────────────────────────────────────────────────
// Browser gửi OPTIONS request trước khi gửi POST/PUT/DELETE với custom headers
// cors() tự xử lý OPTIONS — nhưng cần route handler hoặc:
app.options('*', cors(corsOptions)); // explicit preflight handler`;

const MISTAKE = `// ❌ Sai lầm 1: credentials: true + origin: '*' — CORS block bởi browser
app.use(cors({
  origin: '*',
  credentials: true, // CorsOptions lỗi này ngay cả TypeScript cũng không báo
}));
// Browser báo: "Cannot use wildcard in Access-Control-Allow-Origin
//               when credentials flag is true"

// ✅ Đúng: credentials: true cần origin cụ thể
app.use(cors({
  origin: 'http://localhost:5173', // hoặc mảng, hoặc function
  credentials: true,
}));

// ❌ Sai lầm 2: Đặt cors() SAU routes — routes không có CORS headers
app.get('/api/data', handler); // response không có Access-Control-Allow-Origin
app.use(cors());                // quá muộn — middleware sau route không áp dụng

// ✅ Đúng: cors() trước tất cả routes
app.use(cors(corsOptions));
app.get('/api/data', handler);

// ❌ Sai lầm 3: Không handle preflight OPTIONS — DELETE/PUT với custom header bị block
app.put('/users/:id', updateUser); // browser gửi OPTIONS trước, không thấy handler → 404

// ✅ Đúng: cors() tự handle OPTIONS nếu đặt đúng chỗ, hoặc explicit:
app.options('*', cors(corsOptions));`;

export default function Lesson06({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-03-06"
      num="06"
      title="CORS configuration với cors và @types/cors"
      desc="CorsOptions type, dynamic origin, credentials, preflight"
      priority="medium"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        CORS (Cross-Origin Resource Sharing) là cơ chế browser bảo vệ user: mặc định browser block
        request từ origin A đến origin B nếu server B không explicitly cho phép. API ở{' '}
        <code>localhost:3000</code> gọi từ frontend ở <code>localhost:5173</code> → khác port → khác
        origin → bị block. Package <code>cors</code> thêm các HTTP headers cần thiết để browser cho
        phép. <code>CorsOptions</code> type giúp config type-safe.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Browser kiểm tra: request có cross-origin không? Có custom headers không?',
            'Nếu có → gửi OPTIONS preflight request trước để hỏi server có cho phép không',
            'Server cors() middleware nhận OPTIONS → kiểm tra origin → trả Access-Control-Allow-* headers',
            'Browser nhận response preflight OK → gửi request thực',
            'Server xử lý request thực → cors() middleware thêm CORS headers vào response',
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
                'CorsOptions — type cho config object. TypeScript sẽ báo lỗi nếu config sai (credentials: true + origin: \"*\" là invalid combination theo CORS spec).',
            },
            {
              line: '2',
              explanation:
                "origin: string[] — whitelist các origins được phép. Khác với origin: '*' (tất cả), array này chỉ cho phép đúng các domain liệt kê.",
            },
            {
              line: '3',
              explanation:
                "credentials: true — cho phép browser gửi cookies và Authorization header. Bắt buộc nếu dùng httpOnly cookies hoặc Bearer token. Không dùng được với origin: '*'.",
            },
            {
              line: '4',
              explanation:
                'CorsOptionsDelegate — function nhận request, trả options động. Dùng khi list origins lưu trong database hoặc config (không hardcode).',
            },
            {
              line: '5',
              explanation:
                'maxAge: 86400 — browser cache kết quả preflight 86400 giây (1 ngày). Tránh gửi OPTIONS request mỗi lần — giảm latency đáng kể cho requests có custom headers.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          <code>credentials: true</code> không tương thích với <code>origin: '*'</code>. Browser sẽ
          block và log lỗi trong Console. Khi dùng credentials, phải chỉ định origin cụ thể. Lỗi này
          thường xuất hiện khi copy config từ project không dùng credentials.
        </Callout>
        <Callout type="note">
          CORS chỉ là browser restriction — curl, Postman, server-to-server requests không bị ảnh
          hưởng. Nếu API test với Postman thành công nhưng browser lỗi → đây là vấn đề CORS, không
          phải vấn đề API logic.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Config CORS cho Todo API: cho phép localhost:5173 (dev) và domain production. credentials: true. Verify với browser fetch() từ localhost:5173.',
            },
            {
              level: 'medium',
              text: 'Đọc CORS_ORIGIN từ env (comma-separated string), convert sang string[]. Tạo corsDelegate function kiểm tra dynamically. Thêm logging khi reject unknown origin.',
            },
            {
              level: 'hard',
              text: 'Implement CORS khác nhau cho từng route group: /api/public — cors() mở (tất cả origins), /api/admin — cors() strict (chỉ admin domain), /api/v1 — cors() normal (whitelist).',
            },
          ]}
          hint="app.use('/api/public', cors(), publicRouter) — CORS middleware chỉ áp dụng cho routes sau nó trong cùng use() call. Hoặc apply cors() trực tiếp lên router."
        />
      </Sec>
    </LessonCard>
  );
}
