import LessonCard from '../../components/LessonCard';
import CodeTabs from '../../components/CodeTabs';
import LineTable from '../../components/LineTable';
import ExerciseSection from '../../components/ExerciseSection';
import Callout from '../../components/Callout';
import { Sec, Flow } from './_helpers';

interface Props { isDone: boolean; onToggleDone: () => void; }

const BASIC = `import express, { Request, Response } from 'express';
const app = express();
app.use(express.json());

// GET — trả danh sách
app.get('/todos', (req: Request, res: Response) => {
  res.json({ todos: [] });
});

// POST — tạo mới
app.post('/todos', (req: Request, res: Response) => {
  const todo = req.body;
  res.status(201).json({ created: todo });
});

// PUT — cập nhật toàn bộ
app.put('/todos/:id', (req: Request, res: Response) => {
  res.json({ updated: req.params.id });
});

// DELETE — xóa
app.delete('/todos/:id', (req: Request, res: Response) => {
  res.status(204).send();
});`;

const REAL = `interface ITodo {
  id:        string;
  title:     string;
  completed: boolean;
  createdAt: Date;
}

// In-memory store (sẽ thay bằng MongoDB sau)
let todos: ITodo[] = [];

app.get('/todos', (_req: Request, res: Response) => {
  res.json({ success: true, data: todos, count: todos.length });
});

app.post('/todos', (req: Request<{}, {}, Pick<ITodo, 'title'>>, res: Response) => {
  const todo: ITodo = {
    id:        crypto.randomUUID(),
    title:     req.body.title,
    completed: false,
    createdAt: new Date(),
  };
  todos.push(todo);
  res.status(201).json({ success: true, data: todo });
});

app.patch('/todos/:id', (req: Request<{ id: string }>, res: Response) => {
  const todo = todos.find(t => t.id === req.params.id);
  if (!todo) return res.status(404).json({ success: false, error: 'Not found' });
  Object.assign(todo, req.body);
  res.json({ success: true, data: todo });
});`;

const JSOTS = `// ❌ JavaScript — req.body là any, dễ typo
app.post('/todos', (req, res) => {
  const { tittle } = req.body; // typo — không ai báo!
  todos.push({ id: Date.now(), tittle }); // data sai từ đầu
  res.json({ ok: true });
});

// ✅ TypeScript — body được typed qua generic
interface CreateTodoBody { title: string; }

app.post('/todos',
  (req: Request<{}, {}, CreateTodoBody>, res: Response) => {
    const { tittle } = req.body;
    // Error: Property 'tittle' does not exist on type 'CreateTodoBody'
    const { title } = req.body; // OK ✓
    res.status(201).json({ success: true, data: { title } });
  }
);`;

export default function Lesson03({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-02-03"
      num="03"
      title="Routing — app.get/post/put/delete với typed handlers"
      desc="HTTP methods, route handlers, typed req/res, chaining routes"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Express cung cấp các method tương ứng HTTP verbs: <code>app.get</code>, <code>app.post</code>,
        <code>app.put</code>, <code>app.patch</code>, <code>app.delete</code>. Mỗi route handler
        nhận <code>(req: Request, res: Response)</code> — TypeScript type hai object này để IDE
        autocomplete và bắt lỗi. Với TypeScript, bạn có thể type chính xác <code>req.params</code>,
        <code>req.body</code>, <code>req.query</code> qua generics của <code>Request</code>.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow steps={[
          'Chọn HTTP method phù hợp: GET (đọc), POST (tạo), PUT/PATCH (cập nhật), DELETE (xóa)',
          'Định nghĩa route handler với kiểu (req: Request, res: Response) => void',
          'Truy cập data từ req: .params, .query, .body, .headers',
          'Gọi res.status(code).json(data) để trả response',
          'Không quên return sau res.json() để tránh gọi res nhiều lần',
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
          { line: '1',  explanation: 'Request<Params, ResBody, ReqBody, Query> — 4 generics cho type safety. Thứ tự: Params, ResponseBody, RequestBody, QueryString.' },
          { line: '2',  explanation: 'Pick<ITodo, "title"> — utility type lấy chỉ field "title" từ ITodo. Dùng cho body POST: chỉ gửi title, server tự tạo id/createdAt.' },
          { line: '3',  explanation: 'res.status(201).json(...) — method chaining: set status code rồi gửi JSON. 201 Created dùng khi tạo resource mới thành công.' },
          { line: '4',  explanation: 'return res.status(404).json(...) — return để dừng function sau khi gửi response. Không return → code tiếp theo vẫn chạy, gây lỗi "headers already sent".' },
          { line: '5',  explanation: 'crypto.randomUUID() — built-in Node.js (v14.17+), tạo UUID v4. Không cần cài thêm package, type safe với string.' },
          { line: '6',  explanation: 'Object.assign(todo, req.body) — merge req.body vào object todo có sẵn. Chỉ update fields được gửi lên, giữ nguyên fields còn lại.' },
          { line: '7',  explanation: 'res.status(204).send() — 204 No Content: xóa thành công, không trả body. Dùng .send() thay .json() vì 204 không được có body.' },
        ]} />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Gọi <code>res.json()</code> hai lần → "Cannot set headers after they are sent to the client".
          Luôn <code>return</code> sau mỗi response hoặc dùng <code>if/else</code> tách biệt để
          đảm bảo chỉ một response được gửi.
        </Callout>
        <Callout type="note">
          Thứ tự routes quan trọng. <code>app.get('/todos/stats', ...)</code> phải đứng trước
          <code>app.get('/todos/:id', ...)</code> — route cụ thể trước route dynamic. Express
          match route theo thứ tự đăng ký.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Viết 4 routes CRUD cho /products với interface IProduct { id, name, price }. Dùng mảng in-memory.',
            },
            {
              level: 'medium',
              text: 'Thêm route GET /products/search?name=x — filter theo tên. Type req.query.name đúng cách.',
            },
            {
              level: 'hard',
              text: 'Dùng Router để tách routes products ra file src/routes/productRoutes.ts. Mount vào app.ts.',
            },
          ]}
          hint="req.query có type ParsedQs (từ qs package) — mỗi field là string | string[] | ParsedQs | undefined. Cần cast: const name = req.query.name as string."
        />
      </Sec>
    </LessonCard>
  );
}
