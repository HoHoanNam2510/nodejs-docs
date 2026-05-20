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

const BASIC = `import express from 'express';
const app = express();

// 1. JSON body parser — cho API requests
app.use(express.json({ limit: '10mb' })); // giới hạn body size

// 2. URL-encoded body — cho HTML form submit
app.use(express.urlencoded({ extended: true }));

// 3. Static files — serve từ thư mục public/
app.use(express.static('public'));
// URL /logo.png → file public/logo.png

// 4. Static với options
app.use('/uploads', express.static('uploads', {
  maxAge: '1d',    // cache 1 ngày
  etag:   false,   // tắt ETag
}));`;

const REAL = `import express, { Express } from 'express';
import path from 'path';

const app: Express = express();

// ── Body parsers ──────────────────────────────
app.use(express.json({
  limit: '10mb',  // reject body > 10mb
  strict: true,   // chỉ accept arrays và objects (không phải primitive)
}));

app.use(express.urlencoded({
  extended: true,  // dùng qs library — support nested objects
  limit: '10mb',
}));

// ── Static files ──────────────────────────────
// Serve build React app
app.use(express.static(path.join(__dirname, '../client/dist'), {
  maxAge: '7d',
  index:  'index.html',
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1d',
  dotfiles: 'deny', // không serve file bắt đầu bằng dấu chấm (.env, ...)
}));

// ── API routes ────────────────────────────────
app.use('/api', apiRoutes);

// ── SPA fallback — mọi route không phải /api đều trả index.html ──
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  }
});`;

export default function Lesson07({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-02-07"
      num="07"
      title="Built-in middleware — express.json, urlencoded, static"
      desc="express.json(), express.urlencoded(), express.static(), thứ tự setup"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Express 4.16+ đã tích hợp sẵn các middleware phổ biến nhất. <code>express.json()</code>{' '}
        parse request body khi Content-Type là <code>application/json</code>.{' '}
        <code>express.urlencoded()</code> parse form data từ HTML form.{' '}
        <code>express.static()</code> serve file tĩnh (HTML, CSS, JS, images) từ một thư mục. Không
        cần cài thêm package <code>body-parser</code> như các dự án Express cũ. Thứ tự đăng ký
        middleware quan trọng: body parsers phải đứng trước routes.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'express.json() — parse body với Content-Type: application/json',
            'express.urlencoded({ extended: true }) — parse form data',
            'express.static("public") — serve static files từ thư mục',
            'Thứ tự quan trọng: body parsers phải đứng trước routes',
            'Không cần body-parser package riêng từ Express 4.16+',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: 'Cơ bản .ts', code: BASIC },
            { label: 'Thực tế .ts', code: REAL },
          ]}
        />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable
          rows={[
            {
              line: '1',
              explanation:
                'limit: "10mb" — reject request body vượt quá 10MB. Express trả 413 Payload Too Large tự động. Giá trị mặc định là 100kb.',
            },
            {
              line: '2',
              explanation:
                'extended: true — dùng thư viện qs để parse nested objects: a[b]=1 → { a: { b: "1" } }. extended: false dùng querystring built-in, chỉ parse flat.',
            },
            {
              line: '3',
              explanation:
                'path.join(__dirname, ...) — tạo đường dẫn tuyệt đối từ thư mục hiện tại. An toàn hơn path relative vì không phụ thuộc vào cwd khi chạy.',
            },
            {
              line: '4',
              explanation:
                'dotfiles: "deny" — từ chối serve file bắt đầu bằng dấu chấm (.env, .htaccess). Giá trị khác: "allow", "ignore" (mặc định: trả 404 không lỗi).',
            },
            {
              line: '5',
              explanation:
                'SPA fallback pattern: mọi route không phải /api trả index.html để React Router tự xử lý client-side routing.',
            },
            {
              line: '6',
              explanation:
                'maxAge: "7d" — cache static files trong 7 ngày. Browser sẽ không request lại trong thời gian này. Dùng content hash trong filename để bust cache.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          <code>express.static('public')</code> dùng đường dẫn relative — nguy hiểm khi chạy từ thư
          mục khác. Luôn dùng <code>path.join(__dirname, 'public')</code> để đảm bảo đường dẫn tuyệt
          đối, tránh lỗi "ENOENT: no such file or directory".
        </Callout>
        <Callout type="note">
          Từ Express 4.16+, không cần <code>body-parser</code> package riêng.{' '}
          <code>express.json()</code> và <code>express.urlencoded()</code> là built-in. Nếu thấy
          code cũ dùng <code>require('body-parser')</code> — đó là cách cũ, không cần thiết nữa.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Setup Express app với json và urlencoded middleware. Test với Thunder Client: gửi POST với JSON body và form body, xem req.body đã được parse chưa.',
            },
            {
              level: 'medium',
              text: 'Thêm express.static("public") với maxAge: "1d". Tạo file public/test.html. Truy cập /test.html từ browser.',
            },
            {
              level: 'hard',
              text: 'Implement SPA server: serve React build từ client/dist, mọi route không phải /api/ đều trả index.html. Đảm bảo API routes vẫn hoạt động.',
            },
          ]}
          hint="SPA fallback phải đứng sau tất cả API routes. Điều kiện !req.path.startsWith('/api') tránh API routes bị redirect sang index.html."
        />
      </Sec>
    </LessonCard>
  );
}
