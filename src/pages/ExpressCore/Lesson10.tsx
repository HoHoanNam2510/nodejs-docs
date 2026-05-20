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

const BASIC = `import express, { Request, Response, NextFunction } from 'express';
const app = express();

app.use(express.json());

// ── Routes ────────────────────────────────────
app.get('/users', (req: Request, res: Response) => {
  res.json({ users: [] });
});

app.post('/users', (req: Request, res: Response) => {
  res.status(201).json({ created: true });
});

// ── 404 handler — sau tất cả routes ──────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error:   'Route not found',
  });
});

// ── Error handler — cuối cùng ─────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ success: false, error: err.message });
});`;

const REAL = `import express, { Request, Response, NextFunction } from 'express';
import { ErrorRequestHandler } from 'express';
import { AppError, NotFoundError } from './errors/AppError';
import { errorHandler } from './middleware/errorHandler';
import userRoutes from './routes/userRoutes';
import postRoutes from './routes/postRoutes';

const app = express();

// ── 1. Body parsers ───────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── 2. Global middleware ──────────────────────
app.use(requestId);
app.use(logger);

// ── 3. Routes ─────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/posts', postRoutes);

// ── 4. 404 — pass to error handler ────────────
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError('Route'));
  // Dùng next() thay vì res.json() — để error handler xử lý nhất quán
});

// ── 5. Global error handler — cuối cùng ───────
app.use(errorHandler);

export default app;

// Kết quả: mọi lỗi đều đi qua 1 chỗ — errorHandler
// GET /api/v1/unknown → NotFoundError(404) → errorHandler → JSON response
// GET /users/999 → asyncHandler → NotFoundError → errorHandler → JSON
// POST /users với data sai → ValidationError(400) → errorHandler → JSON`;

export default function Lesson10({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-02-10"
      num="10"
      title="404 handler — catch-all route và xử lý route không tồn tại"
      desc="catch-all route, thứ tự sau routes, kết hợp với error handler"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Khi request không khớp với bất kỳ route nào đã đăng ký, Express tiếp tục xuống dưới trong
        middleware chain. Đặt một <code>app.use()</code> không có path ở cuối — nó sẽ catch tất cả
        requests không được xử lý. Pattern tốt nhất: thay vì trả response 404 trực tiếp, dùng{' '}
        <code>next(new NotFoundError())</code> để error handler xử lý nhất quán — tất cả lỗi đi qua
        1 chỗ, dễ maintain và test.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Đặt 404 handler sau tất cả routes nhưng trước error handler',
            'Dùng app.use() không có path — match mọi request không đến được route nào',
            'Trả response JSON với status 404 và message rõ ràng',
            'Hoặc dùng next(new NotFoundError()) → để error handler xử lý nhất quán',
            'Thứ tự cuối cùng: routes → 404 handler → error handler',
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
                'app.use() không có path — match tất cả HTTP methods và tất cả paths. Chỉ chạy nếu không có route nào trước đó gửi response hoặc gọi next().',
            },
            {
              line: '2',
              explanation:
                'Vị trí sau routes nhưng trước error handler — 404 handler phải thấy requests không được route nào handle, nhưng lỗi của nó cần error handler xử lý.',
            },
            {
              line: '3',
              explanation:
                'next(new NotFoundError()) — pass error object vào error handler thay vì trả response trực tiếp. Giúp tất cả error responses có cùng format.',
            },
            {
              line: '4',
              explanation:
                'Thứ tự middleware chain đầy đủ: body parsers → global MW → routes → 404 handler → error handler. Phá vỡ thứ tự này gây bugs khó debug.',
            },
            {
              line: '5',
              explanation:
                '_req prefix — underscore báo TypeScript "tham số này intentionally unused". Tránh warning "declared but never read" mà không cần tắt rule.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          404 handler đặt trước routes → TẤT CẢ requests đều trả 404, kể cả routes hợp lệ. Express
          chạy middleware theo thứ tự từ trên xuống, không check toàn bộ app trước. Luôn đặt 404
          handler sau khi đã mount tất cả routes.
        </Callout>
        <Callout type="note">
          Dùng <code>next(new NotFoundError())</code> thay <code>res.status(404).json(...)</code> để
          tất cả lỗi đi qua 1 error handler duy nhất — nhất quán format, dễ maintain, dễ test, dễ
          thêm logging về sau.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Thêm 404 và error handler vào app.ts theo đúng thứ tự. Dùng Thunder Client test route không tồn tại — xem response.',
            },
            {
              level: 'medium',
              text: 'Route /api/v1/health trả JSON { status, uptime, timestamp }. Viết 404 handler chỉ áp dụng cho /api/v1/ prefix, trả HTML cho routes khác.',
            },
            {
              level: 'hard',
              text: 'Viết integration test với supertest: test 404 response, test error handler với thrown AppError, test async error từ asyncHandler.',
            },
          ]}
          hint="app.uptime() không tồn tại — dùng process.uptime() (seconds từ lúc Node.js start). Để format: Math.floor(process.uptime()) seconds."
        />
      </Sec>
    </LessonCard>
  );
}
