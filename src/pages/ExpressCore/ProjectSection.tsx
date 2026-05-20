import CodeBlock from '../../components/CodeBlock';

const PROJECT_CODE = `// todo-api.ts — TypeScript Todo API (Module 02 Project)

import express, { Express, Request, Response, NextFunction } from 'express';
import { RequestHandler, ErrorRequestHandler } from 'express';
import crypto from 'crypto';

// ── Interfaces ────────────────────────────────────────────────────────────────

interface ITodo {
  id:        string;
  title:     string;
  completed: boolean;
  priority:  'low' | 'medium' | 'high';
  createdAt: Date;
}

// ── AppError hierarchy ────────────────────────────────────────────────────────

class AppError extends Error {
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

class NotFoundError   extends AppError {
  constructor(resource = 'Resource') {
    super(resource + ' không tìm thấy', 404, 'NOT_FOUND');
  }
}

class ValidationError extends AppError {
  constructor(msg: string) { super(msg, 400, 'VALIDATION_ERROR'); }
}

// ── asyncHandler ──────────────────────────────────────────────────────────────

const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// ── In-memory store ───────────────────────────────────────────────────────────

let todos: ITodo[] = [];

// ── Express app setup ─────────────────────────────────────────────────────────

const app: Express = express();

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────

// GET /todos?completed=true&priority=high
app.get('/todos', (req: Request, res: Response) => {
  const { completed, priority } = req.query;

  let result = [...todos];

  if (completed !== undefined) {
    const isDone = completed === 'true';
    result = result.filter(t => t.completed === isDone);
  }

  if (priority !== undefined) {
    result = result.filter(t => t.priority === priority);
  }

  res.json({ success: true, data: result, count: result.length });
});

// POST /todos
app.post('/todos', asyncHandler(async (req: Request, res: Response) => {
  const { title, priority = 'medium' } = req.body as {
    title?:    string;
    priority?: ITodo['priority'];
  };

  if (!title || typeof title !== 'string' || title.trim() === '') {
    throw new ValidationError('title là bắt buộc và phải là string không rỗng');
  }

  const validPriorities: ITodo['priority'][] = ['low', 'medium', 'high'];
  if (!validPriorities.includes(priority)) {
    throw new ValidationError('priority phải là "low", "medium", hoặc "high"');
  }

  const todo: ITodo = {
    id:        crypto.randomUUID(),
    title:     title.trim(),
    completed: false,
    priority,
    createdAt: new Date(),
  };

  todos.push(todo);
  res.status(201).json({ success: true, data: todo });
}));

// PATCH /todos/:id
app.patch('/todos/:id', asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const todo = todos.find(t => t.id === req.params.id);
  if (!todo) throw new NotFoundError('Todo');

  const { title, completed, priority } = req.body as Partial<ITodo>;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      throw new ValidationError('title phải là string không rỗng');
    }
    todo.title = title.trim();
  }

  if (completed !== undefined) todo.completed = Boolean(completed);

  const validPriorities: ITodo['priority'][] = ['low', 'medium', 'high'];
  if (priority !== undefined) {
    if (!validPriorities.includes(priority)) {
      throw new ValidationError('priority phải là "low", "medium", hoặc "high"');
    }
    todo.priority = priority;
  }

  res.json({ success: true, data: todo });
}));

// DELETE /todos/:id
app.delete('/todos/:id', asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const index = todos.findIndex(t => t.id === req.params.id);
  if (index === -1) throw new NotFoundError('Todo');

  todos.splice(index, 1);
  res.status(204).send();
}));

// ── 404 handler ───────────────────────────────────────────────────────────────

app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError('Route'));
});

// ── Error handler ─────────────────────────────────────────────────────────────

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error:   err.message,
      code:    err.code,
    });
  }
  if (err instanceof SyntaxError) {
    return res.status(400).json({ success: false, error: 'Invalid JSON body' });
  }
  res.status(500).json({
    success: false,
    error:   process.env.NODE_ENV === 'production'
               ? 'Internal Server Error'
               : (err as Error).message,
  });
};

app.use(errorHandler);

export default app;

// ── index.ts (entry point) ────────────────────────────────────────────────────
// import app from './todo-api';
// const PORT = Number(process.env.PORT) || 3000;
// app.listen(PORT, () => console.log('Todo API running on http://localhost:' + PORT));`;

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
        <span style={{ fontSize: 13, color: 'var(--text3)' }}>Cuối Module 02</span>
      </div>

      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>
        todo-api.ts — TypeScript Todo API
      </h3>
      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: '1rem', lineHeight: 1.6 }}>
        Viết Todo API hoàn chỉnh với TypeScript: interface <code className="ic">ITodo</code>,{' '}
        <code className="ic">AppError</code> hierarchy, <code className="ic">asyncHandler</code>{' '}
        wrapper, CRUD routes với filter query, typed request generics, 404 handler và global error
        handler — không có <code className="ic">any</code> trong toàn bộ file.
      </p>

      <CodeBlock code={PROJECT_CODE} />

      <div style={{ marginTop: '1rem', fontSize: 12, color: 'var(--text3)' }}>
        Checklist tự review: <br />
        &nbsp;
        <span style={{ color: 'var(--accent)' }}>✓</span> Không có <code className="ic">any</code>{' '}
        type <br />
        &nbsp;
        <span style={{ color: 'var(--accent)' }}>✓</span> Typed routes với Request generics <br />
        &nbsp;
        <span style={{ color: 'var(--accent)' }}>✓</span> asyncHandler cho mọi async route <br />
        &nbsp;
        <span style={{ color: 'var(--accent)' }}>✓</span> Error hierarchy: AppError, NotFoundError,
        ValidationError <br />
        &nbsp;
        <span style={{ color: 'var(--accent)' }}>✓</span> tsc --noEmit không lỗi
      </div>
    </div>
  );
}
