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

const BASIC = `import { Response } from 'express';

// ── Generic response interface ────────────────────────────────────────────────
interface ApiResponse<T> {
  success: boolean;
  data?:   T;
  message?: string;
  error?:  string;
  code?:   string;
}

// ── Helper functions ──────────────────────────────────────────────────────────
export const sendSuccess = <T>(
  res:        Response,
  data:       T,
  statusCode: number = 200,
  message?:   string
) =>
  res.status(statusCode).json({
    success: true,
    data,
    message,
  } satisfies ApiResponse<T>);

export const sendError = (
  res:        Response,
  error:      string,
  statusCode: number = 500,
  code?:      string
) =>
  res.status(statusCode).json({
    success: false,
    error,
    code,
  } satisfies ApiResponse<never>);

// ── Dùng trong routes ─────────────────────────────────────────────────────────
app.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await UserService.findById(req.params.id);
  sendSuccess(res, user);               // 200, data: IUser
}));

app.post('/users', asyncHandler(async (req, res) => {
  const user = await UserService.create(req.body);
  sendSuccess(res, user, 201, 'User created successfully');
}));`;

const REAL = `import { Response } from 'express';

// ── Full ApiResponse type ─────────────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success:    boolean;
  data?:      T;
  message?:   string;
  error?:     string;
  code?:      string;
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

// ── Response helpers ──────────────────────────────────────────────────────────

export const sendSuccess = <T>(
  res:        Response,
  data:       T,
  statusCode: number = 200,
  message?:   string
): void => {
  res.status(statusCode).json({ success: true, data, message } satisfies ApiResponse<T>);
};

export const sendPaginated = <T>(
  res:        Response,
  data:       T[],
  pagination: PaginationMeta
): void => {
  res.json({ success: true, data, pagination } satisfies ApiResponse<T[]>);
};

export const sendError = (
  res:        Response,
  error:      string,
  statusCode: number = 500,
  code?:      string
): void => {
  res.status(statusCode).json({ success: false, error, code } satisfies ApiResponse<never>);
};

// ── Ví dụ dùng trong route ────────────────────────────────────────────────────

// GET /users?page=1&limit=10
router.get('/', asyncHandler(async (req, res) => {
  const page  = Number(req.query.page)  || 1;
  const limit = Number(req.query.limit) || 10;
  const skip  = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find().skip(skip).limit(limit),
    User.countDocuments(),
  ]);

  sendPaginated(res, users, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNext:    page < Math.ceil(total / limit),
    hasPrev:    page > 1,
  });
}));`;

const JSOTS = `// JavaScript — response format không nhất quán
app.get('/users',    (req, res) => res.json(users));           // array trực tiếp
app.post('/users',   (req, res) => res.json({ user: newUser })); // wrapped
app.delete('/users', (req, res) => res.json({ deleted: true }));  // khác nữa
// Frontend phải handle 3 format khác nhau → code messy

// TypeScript với ApiResponse<T> — luôn nhất quán
// ✅ GET  /users    → { success: true, data: IUser[] }
// ✅ POST /users    → { success: true, data: IUser, message: '...' }
// ✅ DELETE /users  → { success: true, data: null }
// ✅ Error          → { success: false, error: '...', code: '...' }

// Frontend TypeScript client có thể type response:
interface ApiResponse<T> { success: boolean; data?: T; error?: string; }

const getUsers = async (): Promise<IUser[]> => {
  const res = await fetch('/api/users');
  const json: ApiResponse<IUser[]> = await res.json();
  if (!json.success) throw new Error(json.error);
  return json.data!; // guaranteed IUser[]
};

// "satisfies" keyword (TS 4.9+) — check type mà không widening
const response = {
  success: true,
  data: user,
} satisfies ApiResponse<IUser>;
// TypeScript check response conform ApiResponse<IUser>
// Nhưng type vẫn là { success: true, data: IUser } (không widened)`;

export default function Lesson09({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-03-09"
      num="09"
      title="Response format chuẩn với ApiResponse<T> generic"
      desc="Generic interface, sendSuccess helper, satisfies keyword, pagination meta"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        API nhất quán là API dễ dùng: mọi response đều có cùng shape — frontend chỉ cần học một
        pattern. <code>ApiResponse&lt;T&gt;</code> là generic interface với{' '}
        <code>success: boolean</code> + <code>data?: T</code>. Generic <code>T</code> khác nhau cho
        từng endpoint: <code>ApiResponse&lt;IUser&gt;</code>,{' '}
        <code>ApiResponse&lt;IUser[]&gt;</code>... TypeScript <code>satisfies</code> operator (TS
        4.9+) check type mà không mất type information cụ thể.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Định nghĩa ApiResponse<T> interface một lần trong src/types/index.ts',
            'Export sendSuccess<T>(), sendPaginated<T>(), sendError() helpers',
            'Controller gọi sendSuccess(res, data) thay vì res.json({ ... }) trực tiếp',
            'TypeScript kiểm tra data có đúng type T không qua satisfies',
            'Frontend TypeScript có thể type toàn bộ API calls: fetch().then(res: ApiResponse<T>)',
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
                'ApiResponse<T = unknown> — default generic T = unknown. Khi dùng ApiResponse mà không specify type, T là unknown thay vì any — safer.',
            },
            {
              line: '2',
              explanation:
                'sendSuccess<T>(res, data, statusCode, message) — TypeScript infer T từ data. Gọi sendSuccess(res, user) → T tự động là IUser. Không cần viết sendSuccess<IUser>(res, user).',
            },
            {
              line: '3',
              explanation:
                'satisfies ApiResponse<T> — kiểm tra object literal conform với interface nhưng giữ nguyên type hẹp hơn. Khác as: không force type, chỉ check.',
            },
            {
              line: '4',
              explanation:
                'PaginationMeta — typed object chứa thông tin page. hasNext và hasPrev tính từ page và totalPages — frontend dùng để disable prev/next buttons.',
            },
            {
              line: '5',
              explanation:
                'Promise.all([User.find(...), User.countDocuments()]) — query song song thay vì tuần tự. Tổng time = max(find_time, count_time) thay vì find_time + count_time.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Tránh overuse <code>sendSuccess(res, null)</code> khi không có data. Nếu endpoint trả{' '}
          <code>204 No Content</code> (DELETE), dùng <code>res.status(204).send()</code> — không cần
          wrap trong <code>{'{ success: true, data: null }'}</code>. Có convention rõ ràng và giữ
          nhất quán.
        </Callout>
        <Callout type="note">
          <code>satisfies</code> hữu ích hơn type annotation khi bạn muốn TypeScript check type mà
          không lose narrowed type. <code>const x: ApiResponse&lt;IUser&gt; = &#123;...&#125;</code>{' '}
          widens type. <code>const x = &#123;...&#125; satisfies ApiResponse&lt;IUser&gt;</code> giữ
          type cụ thể hơn.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Tạo ApiResponse<T> interface và sendSuccess, sendError helpers. Refactor tất cả routes Todo API dùng helpers thay vì res.json() trực tiếp.',
            },
            {
              level: 'medium',
              text: 'Thêm PaginationMeta và sendPaginated helper. Implement GET /todos?page=1&limit=10 trả paginated result. Kiểm tra hasNext và hasPrev đúng.',
            },
            {
              level: 'hard',
              text: 'Tạo typed HTTP client cho frontend: class ApiClient với methods getUsers(): Promise<IUser[]>, createUser(data): Promise<IUser>. Dùng ApiResponse<T> để type tất cả responses. Handle cả error case (success: false).',
            },
          ]}
          hint="TypeScript infer generic tự động: sendSuccess(res, users) → T infer là IUser[]. Chỉ cần specify type khi infer không đúng hoặc muốn explicit cho readability."
        />
      </Sec>
    </LessonCard>
  );
}
