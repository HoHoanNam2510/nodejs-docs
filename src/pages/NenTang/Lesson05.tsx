import LessonCard from '../../components/LessonCard';
import CodeTabs from '../../components/CodeTabs';
import LineTable from '../../components/LineTable';
import ExerciseSection from '../../components/ExerciseSection';
import Callout from '../../components/Callout';
import { Sec, Flow } from './_helpers';

const BASIC = `// Generic — "type parameter" T là placeholder cho type cụ thể
function identity<T>(arg: T): T {
  return arg; // trả về đúng type được truyền vào
}

const s = identity<string>('hello'); // T = string
const n = identity<number>(42);      // T = number
const i = identity('world');         // TS tự suy ra T = string

// Generic với Array
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const num  = first([1, 2, 3]); // num: number | undefined
const name = first(['Alice']);  // name: string | undefined`;

const REAL = `// Generic interfaces — dùng khắp nơi trong project thực tế
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Dùng với nhiều loại data khác nhau — cùng 1 interface
const userRes: ApiResponse<IUser>   = { success: true, data: user };
const listRes: ApiResponse<IPost[]> = { success: true, data: posts };

// Generic utility function
async function findOrThrow<T>(
  query: Promise<T | null>,
  msg: string
): Promise<T> {
  const result = await query;
  if (!result) throw new AppError(msg, 404);
  return result; // TypeScript biết: T, không còn T | null
}

// Dùng:
const user = await findOrThrow(User.findById(id), 'User not found');
// user: IUser — đã được unwrap`;

interface Props {
  isDone: boolean;
  onToggleDone: () => void;
}

export default function Lesson05({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-01-05"
      num="05"
      title="Generics cơ bản — đủ để đọc Express và Mongoose types"
      desc="function generic, Promise<T>, Array<T>, generic interface"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        <p>
          Generic cho phép viết code làm việc với <strong>nhiều type khác nhau</strong> mà vẫn giữ
          type safety. Thay vì dùng <code className="ic">any</code> (mất type info), dùng{' '}
          <code className="ic">T</code> (giữ nguyên type). Khi gọi hàm, TypeScript tự suy ra T từ
          argument.
        </p>
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Khai báo type parameter T trong hàm hoặc interface: function fn<T>(...)',
            'Dùng T như một type bình thường bên trong hàm',
            'Khi gọi: TypeScript suy ra T từ argument, hoặc bạn chỉ định rõ fn<string>(...)',
            'Compiler kiểm tra: mọi nơi dùng T phải nhất quán với type thực tế',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: 'Cơ bản .ts', code: BASIC },
            { label: 'Thực tế .ts', code: REAL },
          ]}
        />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable
          rows={[
            {
              line: '2',
              explanation:
                'function identity<T> — T là type parameter, như variable nhưng cho type',
            },
            {
              line: '3',
              explanation: 'return arg — TypeScript biết return type là T (không phải any)',
            },
            { line: '5', explanation: 'identity<string>("hello") — chỉ định T = string rõ ràng' },
            {
              line: '7',
              explanation: 'identity("world") — TypeScript tự suy ra T = string từ argument',
            },
            {
              line: '20',
              explanation: 'findOrThrow<T> — sau await, result là T (không còn T | null)',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          <strong>Dùng any thay generic:</strong>{' '}
          <code className="ic">function fn(arg: any): any</code> mất hoàn toàn type info. Dùng
          generic: <code className="ic">function fn&lt;T&gt;(arg: T): T</code> — type được bảo toàn.
        </Callout>
        <Callout type="note">
          <strong>Generic đọc trong Mongoose:</strong>{' '}
          <code className="ic">Model&lt;IUser&gt;</code>,{' '}
          <code className="ic">FilterQuery&lt;IUser&gt;</code>,{' '}
          <code className="ic">HydratedDocument&lt;IUser&gt;</code>. Không cần tự viết — chỉ cần đọc
          hiểu.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Viết generic function getProperty<T, K extends keyof T>(obj: T, key: K): T[K]. Test với User object.',
            },
            {
              level: 'medium',
              text: 'Viết generic function paginate<T>(items: T[], page: number, limit: number): { data: T[], total: number, page: number }.',
            },
            {
              level: 'hard',
              text: 'Viết hàm createApiResponse<T>(data: T): ApiResponse<T> và createErrorResponse(error: string): ApiResponse<never>.',
            },
          ]}
          hint="keyof T trả về union của tất cả keys của T. K extends keyof T nghĩa là K phải là một key của T. T[K] là type của field K trong T."
        />
      </Sec>
    </LessonCard>
  );
}
