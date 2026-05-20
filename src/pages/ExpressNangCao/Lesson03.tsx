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

const BASIC = `// src/config/env.ts
import 'dotenv/config'; // load .env vào process.env

const config = {
  port:       Number(process.env.PORT) || 3000,
  mongoUri:   process.env.MONGO_URI   as string,
  jwtSecret:  process.env.JWT_SECRET  as string,
  nodeEnv:    process.env.NODE_ENV    || 'development',
} as const;

// Validate ngay khi module load — fail fast
if (!config.mongoUri)  throw new Error('MONGO_URI is required');
if (!config.jwtSecret) throw new Error('JWT_SECRET is required');

export default config;`;

const REAL = `// src/config/env.ts — production-grade version
import 'dotenv/config';

interface AppConfig {
  port:       number;
  mongoUri:   string;
  jwtSecret:  string;
  jwtExpiry:  string;
  nodeEnv:    'development' | 'production' | 'test';
  corsOrigin: string[];
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(\`Environment variable \${name} is required\`);
  return value;
}

const config: AppConfig = {
  port:       Number(process.env.PORT) || 3000,
  mongoUri:   requireEnv('MONGO_URI'),
  jwtSecret:  requireEnv('JWT_SECRET'),
  jwtExpiry:  process.env.JWT_EXPIRY  || '15m',
  nodeEnv:    (process.env.NODE_ENV   || 'development') as AppConfig['nodeEnv'],
  corsOrigin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
};

export default config;

// .env.example (commit vào git)
// PORT=3000
// MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/mydb
// JWT_SECRET=your-super-secret-key-here
// JWT_EXPIRY=15m
// CORS_ORIGIN=http://localhost:5173,https://myapp.com`;

const MISTAKE = `// ❌ Sai lầm 1: Truy cập process.env trực tiếp trong code
// Không có type, không có default, không validate
app.get('/health', (req, res) => {
  res.json({ env: process.env.NODE_ENV }); // string | undefined
  // nếu NODE_ENV không set → undefined → có thể gây lỗi logic
});

// ❌ Sai lầm 2: Dùng as string mà không validate trước
const secret = process.env.JWT_SECRET as string;
// TypeScript tin rằng secret là string — nhưng thực ra có thể undefined
// jwt.sign(payload, secret) → throws error lúc runtime!

// ✅ Đúng: import config đã được validate
import config from './config/env'; // guaranteed non-null, typed
jwt.sign(payload, config.jwtSecret); // string — không thể undefined

// ❌ Sai lầm 3: Không dùng dotenv — env vars không load trong dev
// Chỉ có trên production server mới có env vars thật
// Trong dev, .env không được load → tất cả undefined

// ✅ Đúng: import 'dotenv/config' ở đầu config file (hoặc entry point)
import 'dotenv/config'; // side-effect import — load .env ngay lập tức`;

export default function Lesson03({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-03-03"
      num="03"
      title="Environment variables — type-safe config với dotenv"
      desc="dotenv, config object typed, validate at startup, fail fast"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Environment variables là cách chuẩn để inject config vào ứng dụng mà không hardcode vào
        source code (tránh leak secrets vào git). <code>process.env</code> có type{' '}
        <code>NodeJS.ProcessEnv</code> — mọi value đều là <code>string | undefined</code>. Thay vì
        truy cập <code>process.env.X</code> rải rắc khắp code, tập trung vào một config file có type
        rõ ràng, validate ngay khi startup.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'dotenv đọc file .env → inject vào process.env (chỉ có tác dụng trong dev)',
            'config/env.ts đọc từ process.env → convert types (Number, split...)',
            'Validate ngay lập tức — nếu thiếu required vars → throw Error → app không start',
            'Export config object typed với as const — tất cả nơi khác import config thay vì process.env',
            'Production: inject env vars qua platform (Railway, Render, Docker) — không cần .env',
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
                "import 'dotenv/config' — side-effect import, load .env vào process.env. Phải đứng TRƯỚC bất kỳ code nào truy cập process.env. Dùng ở entry point hoặc đầu config file.",
            },
            {
              line: '2',
              explanation:
                'as const — freeze object type thành readonly literals. port: number thành port: 3000 (literal). Ngăn code khác mutate config object.',
            },
            {
              line: '3',
              explanation:
                'Number(process.env.PORT) || 3000 — convert string sang number, fallback về 3000 nếu undefined hoặc NaN. An toàn hơn parseInt vì NaN || 3000 = 3000.',
            },
            {
              line: '4',
              explanation:
                'requireEnv(name) — helper function throw Error ngay nếu env var không tồn tại. Fail fast: app crash khi start với message rõ ràng thay vì crash lúc runtime với lỗi khó hiểu.',
            },
            {
              line: '5',
              explanation:
                "corsOrigin: ...split(',') — cho phép nhiều origins cách nhau bằng dấu phẩy trong một env var. CORS_ORIGIN=http://localhost:5173,https://prod.com → ['http://localhost:5173', 'https://prod.com'].",
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          <code>as string</code> cast cho <code>process.env.X</code> chỉ nói với TypeScript "tin tao
          đây là string" — không thực sự validate runtime. Nếu biến không tồn tại, code sẽ crash lúc
          dùng (không lúc start). Luôn dùng <code>requireEnv()</code> hoặc check trước khi cast.
        </Callout>
        <Callout type="note">
          File <code>.env.example</code> nên có tất cả keys với placeholder value, commit vào git.
          Khi onboard developer mới, họ chỉ cần <code>cp .env.example .env</code> rồi điền values
          thật. Không cần hỏi team "app cần env vars gì".
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Tạo config/env.ts với PORT, MONGO_URI, JWT_SECRET. Validate tất cả required vars. Tạo .env và .env.example.',
            },
            {
              level: 'medium',
              text: 'Thêm NODE_ENV với type "development" | "production" | "test". Dùng config.nodeEnv để bật/tắt request logging — chỉ log khi development.',
            },
            {
              level: 'hard',
              text: 'Dùng zod để validate toàn bộ env: z.object({ PORT: z.coerce.number().default(3000), MONGO_URI: z.string().url(), ... }). Lỗi validation hiện đẹp hơn throw Error thủ công.',
            },
          ]}
          hint="z.coerce.number() tự động convert string sang number — perfect cho PORT. z.string().url() validate URL format — báo lỗi rõ ràng nếu MONGO_URI sai format."
        />
      </Sec>
    </LessonCard>
  );
}
