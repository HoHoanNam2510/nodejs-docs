import LessonCard from '../../components/LessonCard';
import CodeTabs from '../../components/CodeTabs';
import LineTable from '../../components/LineTable';
import ExerciseSection from '../../components/ExerciseSection';
import Callout from '../../components/Callout';
import { Sec, Flow } from './_helpers';

const BASIC = `// Interface định nghĩa "shape" của object
interface User {
  id: string;
  name: string;
  email: string;
  age?: number;           // optional — có hoặc không cũng được
  readonly role: string;  // không thể thay đổi sau khi gán
}

const user: User = {
  id: '123',
  name: 'Alice',
  email: 'alice@example.com',
  role: 'user',
};

// user.role = 'admin'; // Error: Cannot assign to 'role' (read-only)
// user.phone = '09xx'; // Error: 'phone' does not exist in type 'User'`;

const REAL = `// Interfaces trong Express + Mongoose
interface CreatePostBody {
  title: string;
  content: string;
  tags?: string[];
}

interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

// Route handler — body được typed hoàn toàn
app.post('/posts', (req: Request<{}, {}, CreatePostBody>, res: Response) => {
  const { title, content, tags } = req.body;
  // title: string, content: string, tags: string[] | undefined
});`;

const JSOTS = `// JavaScript — object nhận bất kỳ shape nào:
function createUser(data) {
  return { id: Date.now(), ...data };
}
createUser({ naem: 'Alice', emal: 'alice@ex.com' }); // typo → không ai báo!

// TypeScript — interface enforce shape:
interface CreateUserInput {
  name: string;
  email: string;
}
function createUser(data: CreateUserInput) {
  return { id: Date.now(), ...data };
}
// createUser({ naem: 'Alice' });
// Error: 'naem' does not exist in type 'CreateUserInput'`;

interface Props {
  isDone: boolean;
  onToggleDone: () => void;
}

export default function Lesson03({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-01-03"
      num="03"
      title="Object types & Interfaces — định nghĩa shape của data"
      desc="interface, optional fields, readonly, interface cho Mongoose document"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        <p>
          <strong>Interface</strong> định nghĩa "shape" của một object — những field nào tồn tại và
          type của chúng. TypeScript dùng <em>structural typing</em>: một object thỏa mãn interface
          nếu nó có đủ các field được yêu cầu.
        </p>
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Định nghĩa interface: mô tả shape của object (field, type, optional/required)',
            'Dùng interface làm type annotation cho biến, param, return type',
            'Compiler kiểm tra mọi object literal khớp interface: thiếu field → Error',
            'Structural typing: object có thêm field vẫn OK (duck typing)',
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
              line: '4',
              explanation:
                'age?: number — dấu ? nghĩa là optional. Type thực tế là number | undefined',
            },
            {
              line: '5',
              explanation: 'readonly role — compiler báo lỗi nếu cố gán lại sau khi khởi tạo',
            },
            {
              line: '13',
              explanation:
                'Object literal bị kiểm tra chặt chẽ — thêm field không có trong interface sẽ báo lỗi',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          <strong>Nhầm interface với class:</strong> Interface chỉ tồn tại lúc compile — không có
          runtime. Không thể <code className="ic">instanceof</code> với interface. Dùng class nếu
          cần runtime check.
        </Callout>
        <Callout type="note">
          <strong>Convention prefix I:</strong> Trong Mongoose, thường dùng{' '}
          <code className="ic">IUser</code>, <code className="ic">IPost</code> (prefix I) để phân
          biệt interface với Model class. Chọn 1 convention và giữ nhất quán trong project.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Viết interface IProduct { id, name, price, description?, inStock }. Tạo 2 products thỏa mãn interface.',
            },
            {
              level: 'medium',
              text: 'Viết interface IUserProfile extends IUser { bio?: string; avatar?: string; }. Dùng interface kế thừa.',
            },
            {
              level: 'hard',
              text: 'Viết interface IMongoDocument { _id: string; createdAt: Date; updatedAt: Date; }. Sau đó IUser và IPost đều extends IMongoDocument.',
            },
          ]}
          hint="Interface có thể extends nhiều interface: interface A extends B, C { }. Với Mongoose, thêm readonly _id: string vào IMongoDocument."
        />
      </Sec>
    </LessonCard>
  );
}
