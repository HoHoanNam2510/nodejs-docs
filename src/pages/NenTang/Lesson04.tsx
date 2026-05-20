import LessonCard from '../../components/LessonCard';
import CodeTabs from '../../components/CodeTabs';
import LineTable from '../../components/LineTable';
import ExerciseSection from '../../components/ExerciseSection';
import Callout from '../../components/Callout';
import { Sec, Flow } from './_helpers';

const BASIC = `// Type alias — đặt tên cho type
type ID = string | number;            // union: string hoặc number
type Status = 'active' | 'inactive' | 'banned'; // literal union

const userId: ID = '123';  // OK — string
const numId: ID  = 456;    // OK — number
// const bad: ID = true;   // Error — boolean không phải ID

// Intersection — kết hợp nhiều types thành một
interface HasTimestamps { createdAt: Date; updatedAt: Date; }
interface IPost         { title: string; content: string; }

type PostDocument = IPost & HasTimestamps;
// PostDocument cần: title, content, createdAt, updatedAt`;

const REAL = `// Discriminated union — TypeScript tự thu hẹp type
type ApiResponse<T> =
  | { success: true;  data: T }
  | { success: false; error: string; statusCode: number };

function handle<T>(res: ApiResponse<T>) {
  if (res.success) {
    console.log(res.data);       // TS biết data tồn tại
  } else {
    console.log(res.error);      // TS biết error tồn tại
    console.log(res.statusCode); // TS biết statusCode tồn tại
  }
}

// Utility types thực dụng
interface IUser { id: string; name: string; email: string; password: string; }
type PublicUser      = Omit<IUser, 'password'>;
type UpdateUserInput = Partial<Pick<IUser, 'name' | 'email'>>;`;

const JSOTS = `// JavaScript — không kiểm soát được value hợp lệ:
function setStatus(status) {
  db.update({ status });
}
setStatus('actve'); // typo → DB nhận sai value, không báo lỗi

// TypeScript — literal union enforce giá trị hợp lệ:
type UserStatus = 'active' | 'inactive' | 'banned';

function setStatus(status: UserStatus) {
  db.update({ status });
}
// setStatus('actve');
// Error: Argument of type '"actve"' is not assignable to
//        parameter of type 'UserStatus'`;

interface Props {
  isDone: boolean;
  onToggleDone: () => void;
}

export default function Lesson04({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-01-04"
      num="04"
      title="Type aliases & Union/Intersection types"
      desc="type keyword, union |, intersection &, literal union, utility types"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        <p>
          <strong>Type alias</strong> đặt tên cho một type bất kỳ. <strong>Union type</strong> (
          <code className="ic">A | B</code>) cho phép một trong hai.{' '}
          <strong>Intersection type</strong> (<code className="ic">A &amp; B</code>) yêu cầu cả hai
          cùng lúc.
        </p>
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'type alias — đặt tên ngắn cho type phức tạp, dùng lại nhiều nơi',
            'Union (|) — giá trị có thể là một trong các type liệt kê',
            'TypeScript dùng "type narrowing" (if/instanceof) để thu hẹp union',
            'Intersection (&) — object phải thỏa mãn tất cả các type',
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
              line: '2',
              explanation:
                'type ID = string | number — ID có thể là cả hai, compiler enforce khi gán',
            },
            {
              line: '3',
              explanation: 'Literal union — chỉ 3 string cụ thể được phép, typo sẽ bị bắt',
            },
            {
              line: '3-4 (real)',
              explanation:
                'Discriminated union — success field giúp TS biết chính xác các field còn lại',
            },
            {
              line: '15-16 (real)',
              explanation:
                'Omit<T,K> và Partial<Pick<T,K>> — utility types tạo type mới từ type có sẵn',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          <strong>type vs interface:</strong> Cả hai thường dùng được. Nhưng{' '}
          <code className="ic">interface</code> có thể <em>extend</em> và được <em>merged</em>{' '}
          (Declaration Merging — quan trọng khi extend Express Request).{' '}
          <code className="ic">type</code> linh hoạt hơn cho union/intersection.
        </Callout>
        <Callout type="note">
          <strong>Utility types hay dùng:</strong> <code className="ic">Partial&lt;T&gt;</code>,{' '}
          <code className="ic">Required&lt;T&gt;</code>,{' '}
          <code className="ic">Pick&lt;T, K&gt;</code>, <code className="ic">Omit&lt;T, K&gt;</code>
          , <code className="ic">Record&lt;K, V&gt;</code>.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Tạo type HttpMethod = "GET" | "POST" | "PUT" | "DELETE". Viết function logRequest(method: HttpMethod, url: string): void.',
            },
            {
              level: 'medium',
              text: 'Tạo type ApiResponse<T> là discriminated union (success/error). Viết function wrapResponse<T>(data: T): ApiResponse<T>.',
            },
            {
              level: 'hard',
              text: 'Từ IUser { id, name, email, password, role, createdAt }, tạo: CreateUserInput (Omit id/createdAt), UpdateUserInput (Partial Pick name/email), PublicUser (Omit password).',
            },
          ]}
          hint='Discriminated union: type ApiResponse<T> = { success: true; data: T } | { success: false; error: string }. Utility: type CreateUserInput = Omit<IUser, "id" | "createdAt">.'
        />
      </Sec>
    </LessonCard>
  );
}
