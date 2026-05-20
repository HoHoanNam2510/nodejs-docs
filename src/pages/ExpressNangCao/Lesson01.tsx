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

const BASIC = `// src/routes/users.ts
import { Router } from 'express';
import { Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ users: [] });
});

router.get('/:id', (req: Request<{ id: string }>, res: Response) => {
  res.json({ user: { id: req.params.id } });
});

router.post('/', (req: Request, res: Response) => {
  res.status(201).json({ created: true });
});

export default router;

// src/app.ts — mount router
import usersRouter from './routes/users';
app.use('/users', usersRouter); // tất cả routes trong usersRouter có prefix /users`;

const REAL = `// src/routes/posts.ts
import { Router, Request, Response, NextFunction } from 'express';

interface CreatePostBody {
  title:   string;
  content: string;
  tags?:   string[];
}

interface PostParams {
  id: string;
}

const router = Router();

// GET /posts?page=1&limit=10
router.get('/', (req: Request, res: Response) => {
  const page  = Number(req.query.page)  || 1;
  const limit = Number(req.query.limit) || 10;
  res.json({ page, limit, data: [] });
});

// GET /posts/:id
router.get('/:id', (req: Request<PostParams>, res: Response) => {
  const { id } = req.params;
  res.json({ post: { id } });
});

// POST /posts
router.post(
  '/',
  (req: Request<{}, {}, CreatePostBody>, res: Response) => {
    const { title, content, tags = [] } = req.body;
    res.status(201).json({
      post: { id: crypto.randomUUID(), title, content, tags },
    });
  }
);

// DELETE /posts/:id
router.delete('/:id', (req: Request<PostParams>, res: Response) => {
  res.status(204).send();
});

export default router;`;

const MISTAKE = `// ❌ Sai lầm 1: Import Router sai — không destructure
import express from 'express';
const router = express.Router(); // hoạt động nhưng không idiomatic TS

// ✅ Đúng: destructure Router từ express
import { Router } from 'express';
const router = Router();

// ❌ Sai lầm 2: Mount sai thứ tự — middleware dùng sau khi mount
app.use('/users', usersRouter); // mount trước
app.use(express.json());        // parse json SAU → body undefined trong usersRouter!

// ✅ Đúng: middleware global đứng trước tất cả routes
app.use(express.json());
app.use('/users', usersRouter);

// ❌ Sai lầm 3: Quên export — App.tsx không import được
const router = Router();
router.get('/', handler);
// Thiếu: export default router;

// ✅ Đúng
export default router;`;

export default function Lesson01({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-03-01"
      num="01"
      title="Express Router với TypeScript — tách routes ra file riêng"
      desc="Router type, typed route files, mount với app.use()"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        <code>Router</code> là một mini-app Express — có thể định nghĩa routes, middleware của riêng
        nó rồi mount vào app chính qua <code>app.use('/prefix', router)</code>. Khi project lớn lên,
        tách routes vào các file riêng giúp code dễ đọc, dễ test, và không conflict khi nhiều người
        cùng làm. TypeScript export/import đảm bảo mỗi router file có type đúng.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Tạo file route: src/routes/users.ts — import Router từ express',
            'Định nghĩa các routes trên router object (không phải trực tiếp trên app)',
            'Export default router ở cuối file',
            'Trong app.ts: import router và mount với app.use("/prefix", router)',
            'Request đến /users/123 → Express khớp prefix /users → chuyển /123 vào usersRouter',
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
                "import { Router } from 'express' — Router là named export, không phải default. Type của nó là express.Router — có đầy đủ .get(), .post(), .use() methods.",
            },
            {
              line: '2',
              explanation:
                'const router = Router() — tạo router instance. Không cần new, Router() là factory function.',
            },
            {
              line: '3',
              explanation:
                'router.get("/:id", ...) — route path trong router là relative, không có prefix. Khi mount với app.use("/users", router), path thực tế là /users/:id.',
            },
            {
              line: '4',
              explanation:
                'export default router — bắt buộc. App.ts import router này và mount. Thiếu export → import lỗi hoặc undefined.',
            },
            {
              line: '5',
              explanation:
                'app.use("/users", usersRouter) — mọi request bắt đầu bằng /users sẽ được xử lý bởi usersRouter. Express tự strip prefix trước khi pass vào router.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Middleware global (<code>express.json()</code>, logger...) phải đặt trước{' '}
          <code>app.use(router)</code>. Nếu mount router trước middleware, các routes trong router
          đó sẽ không thấy parsed body.
        </Callout>
        <Callout type="note">
          Router có thể nest: routerA mount routerB với <code>routerA.use('/sub', routerB)</code>.
          Hữu ích cho API versioning: <code>app.use('/api/v1', v1Router)</code>.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Tách app.ts đang có thành 2 file: routes/todos.ts (router) và app.ts (chỉ setup). Mount router với prefix /todos.',
            },
            {
              level: 'medium',
              text: 'Tạo routes/auth.ts với POST /register và POST /login. Tạo routes/users.ts với CRUD. Mount cả hai vào app.ts.',
            },
            {
              level: 'hard',
              text: 'Implement API versioning: routes/v1/index.ts import và re-export tất cả v1 routers. app.use("/api/v1", v1Router). Thêm middleware log version vào v1Router.',
            },
          ]}
          hint="Router.use() nhận middleware chỉ áp dụng cho routes trong router đó — không ảnh hưởng app global. Dùng để thêm auth middleware cho một nhóm routes cụ thể."
        />
      </Sec>
    </LessonCard>
  );
}
