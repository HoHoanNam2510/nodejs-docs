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

const BASIC = `// src/app.ts
import express, { Express, Request, Response } from 'express';

const app: Express = express();

// Parse JSON body
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;`;

const REAL = `// src/app.ts — cấu trúc đầy đủ
import express, { Express, Request, Response, NextFunction } from 'express';
import userRoutes from './routes/userRoutes';

const app: Express = express();

// ── Middleware ─────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.url}\`);
  next();
});

// ── Routes ────────────────────────────────────
app.use('/api/users', userRoutes);

// ── 404 handler ───────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ── Global error handler ──────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({ success: false, error: err.message });
});

export default app;`;

const JSOTS = `// ❌ JavaScript — không có type safety
const express = require('express');
const app = express();  // app: any — IDE không có autocomplete

app.get('/users', (req, res) => {
  res.jon({ users: [] }); // typo 'jon' thay vì 'json' — không ai báo!
});

// ✅ TypeScript — typed từ đầu đến cuối
import express, { Express, Request, Response } from 'express';
const app: Express = express();

app.get('/users', (req: Request, res: Response) => {
  res.jon({ users: [] }); // Error: Property 'jon' does not exist on type 'Response'
  res.json({ users: [] }); // OK ✓
});`;

export default function Lesson02({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-02-02"
      num="02"
      title="App setup — Express, Request, Response, NextFunction types"
      desc="Express type, typed app instance, cấu trúc src/app.ts chuẩn"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        File <code>app.ts</code> là nơi cấu hình Express instance — đăng ký middleware, mount
        routes, và xử lý lỗi. Tách biệt <code>app.ts</code> (cấu hình) và <code>index.ts</code>{' '}
        (start server) là pattern chuẩn giúp dễ test: import <code>app</code> vào tests mà không cần
        bind port. TypeScript cung cấp các named types <code>Express</code>, <code>Request</code>,
        <code>Response</code>, <code>NextFunction</code> từ <code>@types/express</code>.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Import express và named types Express, Request, Response, NextFunction',
            'Tạo const app: Express = express() — type rõ ràng cho app instance',
            'Bật middleware cần thiết: express.json(), express.urlencoded()',
            'Mount routes và global error handler',
            'Export app (không gọi listen ở đây — để index.ts làm)',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: 'Cơ bản .ts', code: BASIC },
            { label: 'Thực tế .ts', code: REAL },
            { label: 'So sánh JS→TS', code: JSOTS },
          ]}
        />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable
          rows={[
            {
              line: '1',
              explanation:
                'import { Express } — type cho app instance. Không bắt buộc nhưng giúp IDE autocomplete đầy đủ methods của Express app.',
            },
            {
              line: '2',
              explanation:
                'import { Request } — type cho request object trong route handlers. Có thể dùng generic để type params, body, query.',
            },
            {
              line: '3',
              explanation:
                'import { Response } — type cho response object. IDE sẽ gợi ý .json(), .status(), .send(), .redirect()...',
            },
            {
              line: '4',
              explanation:
                'import { NextFunction } — type cho hàm next() trong middleware. Bắt buộc khi viết middleware có 3+ params.',
            },
            {
              line: '12',
              explanation:
                '_res, _req — prefix underscore với unused params. TypeScript coi đây là "intentionally unused" và không báo warning.',
            },
            {
              line: '24',
              explanation:
                'Error handler có đúng 4 params (err, req, res, next) — Express nhận biết đây là error handler qua arity. Thiếu _next sẽ không hoạt động.',
            },
            {
              line: '27',
              explanation:
                'export default app — index.ts import và gọi app.listen(). Test files import app để dùng với supertest mà không start server.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Gọi <code>listen</code> trong <code>app.ts</code> → khó test. Tách <code>app.ts</code>{' '}
          (Express setup) và <code>index.ts</code> (server start) để có thể import app trong tests
          mà không start server thực sự.
        </Callout>
        <Callout type="note">
          <code>_req</code>, <code>_res</code> — prefix underscore với unused params tránh
          TypeScript "unused variable" warning. Đây là convention phổ biến, không phải syntax đặc
          biệt của TS.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Tạo src/app.ts với Express type, 2 routes GET /health và GET /version, export default app.',
            },
            {
              level: 'medium',
              text: 'Thêm middleware log request time (ghi nhận Date.now() lúc vào, log duration lúc response finish với res.on("finish", ...)).',
            },
            {
              level: 'hard',
              text: 'Tạo src/app.test.ts dùng supertest: const res = await request(app).get("/health") — không cần start server.',
            },
          ]}
          hint="Tách app.ts và index.ts là pattern chuẩn để testing. supertest import app trực tiếp mà không cần bind port."
        />
      </Sec>
    </LessonCard>
  );
}
