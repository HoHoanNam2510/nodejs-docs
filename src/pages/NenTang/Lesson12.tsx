import LessonCard from '../../components/LessonCard';
import CodeTabs from '../../components/CodeTabs';
import LineTable from '../../components/LineTable';
import ExerciseSection from '../../components/ExerciseSection';
import Callout from '../../components/Callout';
import { Sec, Flow } from './_helpers';

const BASIC = `// async/await — cú pháp dễ đọc hơn Promise chain
interface User { id: string; name: string; email: string; }

// Khai báo return type: Promise<User>
async function getUser(id: string): Promise<User> {
  const response = await fetch('/api/users/' + id);

  if (!response.ok) {
    throw new Error('HTTP ' + response.status);
  }

  // response.json() → Promise<any> — cần cast
  return response.json() as Promise<User>;
}

// Trong route handler
app.get('/users/:id', async (req: Request, res: Response) => {
  const user = await getUser(req.params.id);
  res.json(user);
});`;

const TRYCATCH = `// try/catch với typed errors — TypeScript 4.0+
interface IPost { title: string; content: string; }

async function createPost(data: IPost) {
  try {
    const post = await Post.create(data);
    return post;
  } catch (error: unknown) {
    // error là 'unknown' — phải check type trước khi dùng
    if (error instanceof Error) {
      if ((error as any).code === 11000) {   // MongoDB duplicate key
        throw new AppError('Tiêu đề đã tồn tại', 409);
      }
      throw new AppError('Tạo post thất bại: ' + error.message, 500);
    }
    throw error;
  }
}`;

const JSOTS = `// JavaScript — không có return type, không biết lỗi gì:
async function getUser(id) {
  const user = await User.findById(id);
  return user; // trả về gì? không biết
}

// TypeScript — explicit, IDE hỗ trợ đầy đủ:
async function getUser(id: string): Promise<IUser | null> {
  return User.findById(id);
}

// Người gọi phải handle null — TypeScript enforce:
const user = await getUser('123');
if (!user) throw new AppError('Not found', 404);
user.name; // OK — TS biết user là IUser (không null)

// catch (error) khác nhau:
// JS:  catch (e) { e.message }     // OK — any type
// TS:  catch (e: unknown) { }      // phải check instanceof trước`;

interface Props {
  isDone: boolean;
  onToggleDone: () => void;
}

export default function Lesson12({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-01-12"
      num="12"
      title="Async/Await với TypeScript — cú pháp đọc như code đồng bộ"
      desc="return type Promise<T>, try/catch typed errors, error: unknown"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        <p>
          <code className="ic">async/await</code> là syntactic sugar cho Promise — code đọc như đồng
          bộ nhưng chạy bất đồng bộ. TypeScript thêm vào: khai báo rõ return type (
          <code className="ic">Promise&lt;T&gt;</code>) và xử lý{' '}
          <code className="ic">error: unknown</code> trong catch block (TS 4.0+).
        </p>
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Khai báo function với async — return type tự động là Promise<T>',
            'await expression — tạm dừng function, chờ Promise resolve, trả về T',
            'Nếu Promise reject → throw Error tại điểm await đó',
            'try/catch bắt lỗi — error là unknown, phải instanceof check trước dùng',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: 'Cơ bản .ts', code: BASIC },
            { label: 'try/catch .ts', code: TRYCATCH },
            { label: 'So sánh JS→TS', code: JSOTS },
          ]}
        />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable
          rows={[
            {
              line: '5',
              explanation:
                'async function: Promise<User> — TypeScript enforce return type, báo lỗi nếu return sai',
            },
            {
              line: '6',
              explanation:
                'await fetch() — tạm dừng tại đây đến khi response về, không block thread',
            },
            {
              line: '12',
              explanation: 'as Promise<User> — cast type vì response.json() trả any. Zod safer hơn',
            },
            {
              line: '7 (try)',
              explanation:
                'catch (error: unknown) — bắt buộc từ TS strict mode, phải check instanceof',
            },
            {
              line: '9 (try)',
              explanation:
                '(error as any).code — Mongoose error có thêm field, phải cast để truy cập',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          <strong>await bên ngoài async function:</strong> Chỉ dùng{' '}
          <code className="ic">await</code> bên trong <code className="ic">async</code> function.
          Top-level await chỉ hoạt động với <code className="ic">module: "ESNext"</code>. Lỗi phổ
          biến: quên <code className="ic">async</code> khi thêm <code className="ic">await</code>{' '}
          vào handler.
        </Callout>
        <Callout type="note">
          <strong>Async Express handler:</strong> Express không tự handle rejected Promise trong
          async handler — request treo nếu throw error mà không có try/catch. Giải pháp: dùng{' '}
          <code className="ic">asyncHandler</code> wrapper (Module 03).
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Viết async function getPost(id: number): Promise<Post> gọi JSONPlaceholder API. Xử lý 404 bằng throw Error.',
            },
            {
              level: 'medium',
              text: 'Viết async function getUserWithPosts(userId: number) — gọi song song user và posts, trả { user, posts }. Typed đầy đủ.',
            },
            {
              level: 'hard',
              text: 'Viết async Express route GET /users/:id — fetch từ JSONPlaceholder, handle 404 (throw AppError), handle network error (throw AppError 503).',
            },
          ]}
          hint="JSONPlaceholder: https://jsonplaceholder.typicode.com/users/:id. Promise.all cho parallel. 404: if (!response.ok && response.status === 404) throw new AppError(..., 404)"
        />
      </Sec>
    </LessonCard>
  );
}
