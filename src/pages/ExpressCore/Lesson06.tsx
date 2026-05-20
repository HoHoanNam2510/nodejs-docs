import LessonCard from '../../components/LessonCard';
import CodeTabs from '../../components/CodeTabs';
import LineTable from '../../components/LineTable';
import ExerciseSection from '../../components/ExerciseSection';
import Callout from '../../components/Callout';
import { Sec, Flow } from './_helpers';

interface Props { isDone: boolean; onToggleDone: () => void; }

const BASIC = `import { RequestHandler } from 'express';

// Logger middleware — type rõ ràng
const logger: RequestHandler = (req, res, next) => {
  console.log(\`\${req.method} \${req.url} — \${new Date().toISOString()}\`);
  next(); // PHẢI gọi next() để tiếp tục
};

// Timing middleware
const timing: RequestHandler = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(\`\${req.method} \${req.url} — \${Date.now() - start}ms\`);
  });
  next();
};

// Áp dụng globally
app.use(logger);
app.use(timing);`;

const REAL = `import { RequestHandler, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Thêm request ID vào mỗi request
const requestId: RequestHandler = (req, res, next) => {
  const id = crypto.randomUUID();
  req.headers['x-request-id'] = id;
  res.setHeader('X-Request-ID', id);
  next();
};

// Chỉ cho phép JSON content-type cho POST/PUT/PATCH
const requireJsonContentType: RequestHandler = (req, res, next) => {
  const methods = ['POST', 'PUT', 'PATCH'];
  if (methods.includes(req.method) && !req.is('json')) {
    return res.status(415).json({
      error: 'Content-Type phải là application/json',
    });
  }
  next();
};

// Middleware chỉ áp dụng cho route cụ thể
app.get('/admin/stats',
  requireAuth,    // kiểm tra auth trước
  requireAdmin,   // kiểm tra role
  (req: Request, res: Response) => {
    res.json({ stats: {} });
  }
);`;

const JSOTS = `// ❌ JavaScript — không rõ function signature
const auth = (req, res, next) => {
  // req, res, next là any — không có autocomplete
  const token = req.headers.authorizzation; // typo — không ai báo
  if (!token) return res.status(401).send('No token');
  next();
};

// ✅ TypeScript — RequestHandler type đảm bảo đúng signature
import { RequestHandler } from 'express';

const auth: RequestHandler = (req, res, next) => {
  // req, res, next đã typed đầy đủ
  const token = req.headers.authorizzation;
  // Error: 'authorizzation' does not exist — phải là 'authorization'
  const header = req.headers.authorization; // OK ✓
  if (!header) return res.status(401).json({ error: 'No token' });
  next();
};`;

export default function Lesson06({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-02-06"
      num="06"
      title="Middleware — RequestHandler type và middleware chain"
      desc="RequestHandler, middleware chain, next(), thứ tự middleware"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Middleware là function chạy giữa request và route handler, có quyền đọc/ghi
        <code>req</code>, <code>res</code>, và gọi <code>next()</code> để chuyển sang bước tiếp theo.
        TypeScript cung cấp type <code>RequestHandler</code> từ <code>express</code> — khai báo
        tường minh signature <code>(req, res, next)</code> giúp IDE autocomplete đầy đủ và bắt lỗi
        typo ngay lúc code. Middleware chain là thứ tự các middleware được đăng ký — thứ tự
        <code>app.use()</code> chính là thứ tự thực thi.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow steps={[
          'Middleware là function nhận (req, res, next) — chạy giữa request và route handler',
          'Khai báo type RequestHandler cho middleware function',
          'Gọi next() để chuyển sang middleware/handler tiếp theo',
          'Gọi next(error) để nhảy thẳng đến error handler',
          'Thứ tự app.use() = thứ tự thực thi — quan trọng!',
        ]} />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs tabs={[
          { label: 'Cơ bản .ts', code: BASIC },
          { label: 'Thực tế .ts', code: REAL },
          { label: 'So sánh JS→TS', code: JSOTS },
        ]} />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable rows={[
          { line: '1',  explanation: 'RequestHandler = (req: Request, res: Response, next: NextFunction) => void — type alias đầy đủ cho middleware function, đảm bảo đúng 3 params.' },
          { line: '2',  explanation: 'res.on("finish", cb) — event fires sau khi response đã gửi xong. Đây là nơi đúng để tính response time vì res.statusCode đã có giá trị cuối.' },
          { line: '3',  explanation: 'req.is("json") — kiểm tra Content-Type header có match "application/json" không. Trả về matched type string hoặc false.' },
          { line: '4',  explanation: 'Route-level middleware array: app.get(path, mw1, mw2, handler) — middleware chỉ chạy cho route đó, không ảnh hưởng toàn app.' },
        ]} />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Quên gọi <code>next()</code> — request treo mãi, client timeout. Mỗi middleware phải
          kết thúc bằng <code>next()</code> HOẶC gửi response (<code>res.json()</code>,{' '}
          <code>res.send()</code>). Không được bỏ trống cả hai.
        </Callout>
        <Callout type="note">
          <code>app.use(path, middleware)</code> chỉ áp dụng cho routes bắt đầu bằng{' '}
          <code>path</code>. <code>app.use('/api', authMiddleware)</code> → chỉ protect{' '}
          <code>/api/*</code> routes, các route khác không bị ảnh hưởng.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Viết logger middleware log method, URL, status code, và response time. Dùng res.on("finish", ...).',
            },
            {
              level: 'medium',
              text: 'Viết rateLimiter middleware in-memory: mỗi IP chỉ được 100 requests/minute. Trả 429 nếu vượt quá.',
            },
            {
              level: 'hard',
              text: 'Viết cache middleware: lưu response của GET requests vào Map với key là URL, TTL 60s. Không cache nếu status không phải 200.',
            },
          ]}
          hint="res.on('finish', ...) fires sau khi response đã gửi xong — đây là nơi đúng để log response info. Để đọc status code: res.statusCode."
        />
      </Sec>
    </LessonCard>
  );
}
