import CodeBlock from '../../components/CodeBlock';

const PROJECT_CODE = `// todo-api-v2.ts — Refactored Todo API (Module 03 Project)
// Áp dụng: Router, cấu trúc thư mục, zod, AppError, asyncHandler, ApiResponse<T>

// ── src/types/index.ts ────────────────────────────────────────────────────────

export interface ITodo {
  id:        string;
  title:     string;
  completed: boolean;
  priority:  'low' | 'medium' | 'high';
  createdAt: Date;
}

export interface ApiResponse<T = unknown> {
  success:     boolean;
  data?:       T;
  message?:    string;
  error?:      string;
  code?:       string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page:       number;
  limit:      number;
  total:      number;
  totalPages: number;
  hasNext:    boolean;
  hasPrev:    boolean;
}

// ── src/config/env.ts ─────────────────────────────────────────────────────────

import 'dotenv/config';

const config = {
  port:    Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
} as const;

export default config;

// ── src/middleware/error.middleware.ts ────────────────────────────────────────

import { RequestHandler, ErrorRequestHandler } from 'express';

export class AppError extends Error {
  constructor(
    public message:    string,
    public statusCode: number = 500,
    public code?:      string
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(\`\${resource} không tìm thấy\`, 404, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(msg: string) { super(msg, 400, 'VALIDATION_ERROR'); }
}

export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error:   err.message,
      code:    err.code,
    } satisfies ApiResponse<never>);
    return;
  }
  if (err.name === 'ZodError') {
    res.status(400).json({
      success: false,
      error:   'Validation failed',
      details: err.errors,
    });
    return;
  }
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    error:   config.nodeEnv === 'production' ? 'Internal Server Error' : err.message,
  });
};

// ── src/middleware/response.middleware.ts ────────────────────────────────────

import { Response } from 'express';

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200, message?: string): void => {
  res.status(statusCode).json({ success: true, data, message } satisfies ApiResponse<T>);
};

export const sendPaginated = <T>(res: Response, data: T[], pagination: PaginationMeta): void => {
  res.json({ success: true, data, pagination } satisfies ApiResponse<T[]>);
};

// ── src/schemas/todo.schema.ts ────────────────────────────────────────────────

import { z } from 'zod';

export const CreateTodoSchema = z.object({
  title:    z.string().min(1, 'Title không được rỗng').max(100).trim(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});

export const UpdateTodoSchema = CreateTodoSchema.partial();

export const PaginationSchema = z.object({
  page:  z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export type CreateTodoInput = z.infer<typeof CreateTodoSchema>;
export type UpdateTodoInput = z.infer<typeof UpdateTodoSchema>;

// ── src/routes/todo.routes.ts ─────────────────────────────────────────────────

import { Router, Request, Response } from 'express';
import crypto from 'crypto';

const router = Router();
let todos: ITodo[] = [];

// GET /todos?page=1&limit=10&priority=high
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = PaginationSchema.parse(req.query);
  const { priority, completed } = req.query;

  let filtered = [...todos];
  if (priority) filtered = filtered.filter(t => t.priority === priority);
  if (completed !== undefined) filtered = filtered.filter(t => t.completed === (completed === 'true'));

  const total  = filtered.length;
  const paged  = filtered.slice((page - 1) * limit, page * limit);

  sendPaginated(res, paged, {
    page, limit, total,
    totalPages: Math.ceil(total / limit),
    hasNext:    page < Math.ceil(total / limit),
    hasPrev:    page > 1,
  });
}));

// POST /todos
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const input = CreateTodoSchema.parse(req.body);
  const todo: ITodo = {
    id:        crypto.randomUUID(),
    title:     input.title,
    priority:  input.priority,
    completed: false,
    createdAt: new Date(),
  };
  todos.push(todo);
  sendSuccess(res, todo, 201, 'Todo created');
}));

// GET /todos/:id
router.get('/:id', asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const todo = todos.find(t => t.id === req.params.id);
  if (!todo) throw new NotFoundError('Todo');
  sendSuccess(res, todo);
}));

// PATCH /todos/:id
router.patch('/:id', asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const idx = todos.findIndex(t => t.id === req.params.id);
  if (idx === -1) throw new NotFoundError('Todo');

  const updates = UpdateTodoSchema.parse(req.body);
  todos[idx] = { ...todos[idx], ...updates };
  sendSuccess(res, todos[idx]);
}));

// DELETE /todos/:id
router.delete('/:id', asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const idx = todos.findIndex(t => t.id === req.params.id);
  if (idx === -1) throw new NotFoundError('Todo');
  todos.splice(idx, 1);
  res.status(204).send();
}));

export default router;

// ── src/app.ts ────────────────────────────────────────────────────────────────

import express from 'express';
import cors, { CorsOptions } from 'cors';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import todoRouter from './routes/todo.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

// ── Security middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173', credentials: true } as CorsOptions));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false }));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/todos', todoRouter);

// ── Error handler (đặt cuối) ──────────────────────────────────────────────────
app.use(errorHandler);

export default app;

// ── src/index.ts ──────────────────────────────────────────────────────────────
// import app from './app';
// import config from './config/env';
// app.listen(config.port, () => {
//   console.log(\`Todo API v2 running on http://localhost:\${config.port}\`);
// });`;

export default function ProjectSection() {
  return (
    <div
      style={{
        marginTop: '3rem',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '1.5rem 2rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            background: 'var(--accent)',
            color: '#000',
            padding: '2px 8px',
            borderRadius: 4,
            fontWeight: 700,
          }}
        >
          PROJECT
        </span>
        <span style={{ fontSize: 13, color: 'var(--text3)' }}>Cuối Module 03</span>
      </div>

      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>
        todo-api-v2.ts — Refactored Todo API với kiến trúc chuẩn
      </h3>
      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: '1rem', lineHeight: 1.6 }}>
        Refactor Todo API từ Module 02 theo kiến trúc chuẩn: <code className="ic">Router</code> tách
        routes, <code className="ic">zod</code> validation với{' '}
        <code className="ic">z.infer&lt;&gt;</code>, <code className="ic">AppError</code> hierarchy,{' '}
        <code className="ic">asyncHandler</code> wrapper,{' '}
        <code className="ic">ApiResponse&lt;T&gt;</code> nhất quán, CORS + rate limiting + Helmet.
        Cấu trúc thư mục chuẩn sẵn sàng mở rộng cho MongoDB.
      </p>

      <CodeBlock code={PROJECT_CODE} />

      <div style={{ marginTop: '1rem', fontSize: 12, color: 'var(--text3)' }}>
        Checklist tự review: <br />
        &nbsp;<span style={{ color: 'var(--accent)' }}>✓</span> Zod validation trên mọi POST/PATCH
        body <br />
        &nbsp;<span style={{ color: 'var(--accent)' }}>✓</span>{' '}
        <code className="ic">ApiResponse&lt;T&gt;</code> nhất quán cho mọi response <br />
        &nbsp;<span style={{ color: 'var(--accent)' }}>✓</span> asyncHandler bao mọi async route —
        không có bare try/catch <br />
        &nbsp;<span style={{ color: 'var(--accent)' }}>✓</span> CORS + Rate limiting + Helmet đã bật{' '}
        <br />
        &nbsp;<span style={{ color: 'var(--accent)' }}>✓</span> tsc --noEmit không lỗi, không có{' '}
        <code className="ic">any</code>
      </div>
    </div>
  );
}
