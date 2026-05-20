import LessonCard from '../../components/LessonCard';
import CodeTabs from '../../components/CodeTabs';
import LineTable from '../../components/LineTable';
import ExerciseSection from '../../components/ExerciseSection';
import Callout from '../../components/Callout';
import { Sec, Flow } from './_helpers';

interface Props { isDone: boolean; onToggleDone: () => void; }

const BASIC = `import express, { Request, Response } from 'express';
const app = express();
app.use(express.json()); // BẮT BUỘC — parse JSON body

interface CreateUserBody {
  name:  string;
  email: string;
  age?:  number;
}

app.post('/users',
  (req: Request<{}, {}, CreateUserBody>, res: Response) => {
    const { name, email, age } = req.body;
    // name: string  ✓
    // email: string ✓
    // age: number | undefined ✓

    if (!name || !email) {
      return res.status(400).json({ error: 'name và email là bắt buộc' });
    }

    res.status(201).json({
      success: true,
      data: { id: crypto.randomUUID(), name, email, age },
    });
  }
);`;

const REAL = `interface CreateTodoBody   { title: string; priority?: 'low' | 'medium' | 'high'; }
interface UpdateTodoBody   { title?: string; completed?: boolean; priority?: 'low' | 'medium' | 'high'; }
interface BulkDeleteBody   { ids: string[]; }

// POST /todos
app.post('/todos',
  (req: Request<{}, {}, CreateTodoBody>, res: Response) => {
    const { title, priority = 'medium' } = req.body;
    const todo = { id: crypto.randomUUID(), title, priority, completed: false };
    res.status(201).json({ success: true, data: todo });
  }
);

// PATCH /todos/:id
app.patch('/todos/:id',
  (req: Request<{ id: string }, {}, UpdateTodoBody>, res: Response) => {
    const { id } = req.params;
    const updates = req.body; // type: UpdateTodoBody
    res.json({ success: true, data: { id, ...updates } });
  }
);

// DELETE /todos/bulk
app.delete('/todos/bulk',
  (req: Request<{}, {}, BulkDeleteBody>, res: Response) => {
    const { ids } = req.body; // string[]
    res.json({ success: true, deleted: ids.length });
  }
);`;

const MISTAKE = `// ❌ Sai lầm 1: Quên express.json() — req.body là undefined
const app = express();
// app.use(express.json()); ← thiếu dòng này!

app.post('/users', (req: Request, res: Response) => {
  const { name } = req.body; // TypeError: Cannot destructure 'undefined'
  res.json({ name });
});

// ❌ Sai lầm 2: Không type body — req.body là any
app.post('/users', (req: Request, res: Response) => {
  const { nane, emial } = req.body; // typos — không ai báo!
  // nane và emial đều undefined, user được tạo với data rỗng
  res.status(201).json({ name: nane, email: emial });
});

// ✅ Đúng: có express.json() + typed interface
interface CreateUserBody { name: string; email: string; }
app.use(express.json());
app.post('/users',
  (req: Request<{}, {}, CreateUserBody>, res: Response) => {
    const { nane } = req.body;
    // Error: Property 'nane' does not exist on type 'CreateUserBody'
    const { name, email } = req.body; // OK ✓
    res.status(201).json({ name, email });
  }
);`;

const JSOTS = `// ❌ JavaScript
app.post('/users', (req, res) => {
  // req.body là any — IDE không có autocomplete, typos không được báo
  const user = {
    name: req.body.nane,    // typo — undefined
    email: req.body.emial,  // typo — undefined
    role: req.body.role,    // có thể bị inject 'admin'!
  };
  db.save(user); // data rác vào database
});

// ✅ TypeScript
interface CreateUserBody {
  name:  string;
  email: string;
  // role KHÔNG có trong interface → không thể inject qua body
}

app.post('/users',
  (req: Request<{}, {}, CreateUserBody>, res: Response) => {
    const { name, email } = req.body; // autocomplete, type-safe
    // req.body.role → Error: không tồn tại trong CreateUserBody
    db.save({ name, email, role: 'user' }); // role luôn là 'user'
  }
);`;

export default function Lesson05({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-02-05"
      num="05"
      title="Request body — typing với interface và body parsing"
      desc="express.json(), interface cho body, Request<P,RB,B,Q> generics"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        <code>req.body</code> chứa data client gửi lên trong request body (POST/PUT/PATCH).
        Mặc định Express không parse body — phải bật middleware <code>express.json()</code> trước.
        TypeScript cho phép type chính xác shape của body qua 3rd generic của <code>Request</code>:
        <code>Request&lt;Params, ResBody, BodyType, Query&gt;</code>. Điều này giúp IDE autocomplete,
        bắt typo, và tăng bảo mật bằng cách chỉ accept đúng fields được khai báo.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow steps={[
          'Bật express.json() middleware — không có nó, req.body là undefined',
          'Định nghĩa interface cho từng loại request body',
          'Khai báo type qua 3rd generic: Request<{}, {}, CreateUserBody>',
          'Destructure từ req.body — TypeScript kiểm tra đúng fields',
          'Validate runtime với thư viện (bài sau) hoặc manual check',
        ]} />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs tabs={[
          { label: 'Cơ bản .ts', code: BASIC },
          { label: 'Thực tế .ts', code: REAL },
          { label: 'Sai lầm .ts', code: MISTAKE },
          { label: 'So sánh JS→TS', code: JSOTS },
        ]} />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable rows={[
          { line: '1',  explanation: 'app.use(express.json()) — middleware parse Content-Type: application/json. Phải đứng TRƯỚC routes. Thiếu dòng này → req.body là undefined.' },
          { line: '2',  explanation: 'Request<{}, {}, CreateUserBody> — 3rd generic type req.body. {} là placeholder cho Params và ResBody không dùng.' },
          { line: '3',  explanation: 'age?: number — optional field trong interface. TypeScript type là number | undefined, không cần gửi lên nếu không có.' },
          { line: '4',  explanation: 'priority = "medium" — default parameter khi destructure. Nếu client không gửi priority, sẽ dùng "medium". Type inference tự hiểu.' },
          { line: '5',  explanation: 'Request<{ id: string }, {}, UpdateTodoBody> — combine Params và Body generics. id từ URL, updates từ body, đều được typed.' },
          { line: '6',  explanation: 'interface bảo mật body: chỉ fields trong interface mới được TypeScript accept. Client không thể inject field "role: admin" nếu không khai báo.' },
          { line: '7',  explanation: 'ids: string[] — array type trong body interface. req.body.ids là string[], đảm bảo bulk operations nhận đúng format.' },
        ]} />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          TypeScript chỉ kiểm tra lúc compile — ở runtime, <code>req.body</code> vẫn có thể là
          bất kỳ thứ gì client gửi. Luôn cần validate runtime (bài sau với <code>zod</code>) để
          đảm bảo data thực sự đúng format trước khi dùng.
        </Callout>
        <Callout type="note">
          Đặt <code>express.json()</code> trước tất cả routes. Thứ tự middleware trong Express
          là sequential — route đứng trước <code>express.json()</code> sẽ không thấy parsed body,
          <code>req.body</code> vẫn là <code>undefined</code>.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Viết POST /products với interface CreateProductBody { name, price, category }. Validate tất cả required fields.',
            },
            {
              level: 'medium',
              text: 'Viết PATCH /products/:id nhận Partial<CreateProductBody>. Chỉ update fields được gửi lên.',
            },
            {
              level: 'hard',
              text: 'Viết type-safe mergeBody function: <T extends object>(body: Partial<T>, defaults: T): T. Dùng trong route PATCH.',
            },
          ]}
          hint="Partial<T> làm tất cả fields optional — perfect cho PATCH. Object.assign({}, defaults, body) để merge, hoặc spread { ...defaults, ...body }."
        />
      </Sec>
    </LessonCard>
  );
}
