import LessonCard from '../../components/LessonCard';
import CodeTabs from '../../components/CodeTabs';
import LineTable from '../../components/LineTable';
import ExerciseSection from '../../components/ExerciseSection';
import Callout from '../../components/Callout';
import { Sec, Flow } from './_helpers';

const URL_CODE = `// URL anatomy
// https://api.example.com/api/users?page=2&limit=10&sort=name
// ─────── ─────────────── ────────── ──────────────────────────
// scheme       host          path         query string

// Express: đọc query string — giá trị luôn là string
app.get('/api/users', (req: Request, res: Response) => {
  const page  = Number(req.query.page)  || 1;   // convert sang number
  const limit = Number(req.query.limit) || 10;
  const sort  = String(req.query.sort  || 'createdAt');

  // Route params — /api/users/:id
  // req.params.id là string, dù truyền vào là số
});

// Params từ URL path
app.get('/users/:id', (req: Request<{ id: string }>, res: Response) => {
  const id: string = req.params.id; // luôn là string
});`;

const JSON_CODE = `// JSON — định dạng trao đổi dữ liệu qua HTTP
const user = { name: 'Alice', age: 25, roles: ['user'] };

// Object → JSON string (gửi qua HTTP)
const jsonStr = JSON.stringify(user);
// '{"name":"Alice","age":25,"roles":["user"]}'

// JSON string → Object (nhận từ HTTP)
const parsed = JSON.parse(jsonStr);
// { name: 'Alice', age: 25, roles: ['user'] }

// TypeScript: JSON.parse() trả về 'any' — phải type assertion
interface UserDTO { name: string; age: number; roles: string[]; }

// Cách 1: type assertion (không safe, dùng khi chắc chắn source)
const typed = JSON.parse(jsonStr) as UserDTO;

// Cách 2: Zod validation (safe — dùng trong project thực tế)
// const result = UserSchema.safeParse(JSON.parse(jsonStr));`;

interface Props {
  isDone: boolean;
  onToggleDone: () => void;
}

export default function Lesson09({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-01-09"
      num="09"
      title="URL structure & JSON — định dạng dữ liệu của web"
      desc="URL anatomy, query string typing, JSON parse/stringify"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        <p>
          URL có cấu trúc cố định: protocol + host + path + query string.{' '}
          <strong>Query string</strong> (<code className="ic">?key=value</code>) truyền params
          lọc/phân trang — luôn là <code className="ic">string</code> trong Express, phải convert
          sang đúng type. <strong>JSON</strong> là định dạng trao đổi data chuẩn giữa client/server.
        </p>
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Client xây dựng URL với query params: /api/users?page=2&limit=10',
            'Express parse URL → req.query là object với values là string',
            'Handler convert query string sang đúng type (Number, Boolean...)',
            'Server trả JSON: res.json(data) → tự stringify + set Content-Type',
            'Client nhận JSON string → tự parse thành object (fetch API làm tự động)',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: 'URL & query .ts', code: URL_CODE },
            { label: 'JSON .ts', code: JSON_CODE },
          ]}
        />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable
          rows={[
            {
              line: 'req.query.page',
              explanation:
                'Type là string | ParsedQs | string[] | ParsedQs[] — phải Number() convert',
            },
            {
              line: 'Number(...) || 1',
              explanation: 'Convert + fallback: nếu undefined hoặc NaN → dùng 1',
            },
            {
              line: 'JSON.stringify',
              explanation:
                'Object → JSON string. Bỏ methods, undefined fields, circular refs bị lỗi',
            },
            {
              line: 'as UserDTO',
              explanation:
                'Type assertion — compiler tin bạn, không verify lúc runtime. Dùng Zod nếu cần safe',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          <strong>req.query luôn là string:</strong> URL <code className="ic">/users?page=2</code> →{' '}
          <code className="ic">req.query.page === "2"</code> (string, không phải number 2). Phép so
          sánh <code className="ic">req.query.page === 2</code> luôn là{' '}
          <code className="ic">false</code>.
        </Callout>
        <Callout type="note">
          <strong>JSON.parse không safe với TypeScript:</strong> Nếu API trả sai schema, type
          assertion sẽ không bắt được lỗi. Dùng <code className="ic">zod</code> để validate + type
          safe — sẽ học trong Module 03.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Route GET /search nhận query: q (string), page (number, default 1), limit (number, default 10). Log ra console với đúng types.',
            },
            {
              level: 'medium',
              text: 'Viết helper parseQueryInt(val: unknown, fallback: number): number — an toàn hơn Number() || fallback.',
            },
            {
              level: 'hard',
              text: 'Route GET /users với full pagination: page, limit, sort (asc/desc), sortBy (field name). Trả về { data, page, limit, total, totalPages }.',
            },
          ]}
          hint='parseQueryInt: check typeof val === "string", rồi parseInt(val, 10), check isNaN. Fallback nếu NaN. Type sort: "asc" | "desc" với validate.'
        />
      </Sec>
    </LessonCard>
  );
}
