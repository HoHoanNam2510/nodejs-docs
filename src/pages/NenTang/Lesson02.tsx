import LessonCard from '../../components/LessonCard';
import CodeTabs from '../../components/CodeTabs';
import LineTable from '../../components/LineTable';
import ExerciseSection from '../../components/ExerciseSection';
import Callout from '../../components/Callout';
import { Sec, Flow } from './_helpers';

const BASIC = `// Primitive types — 8 loại cơ bản
const username: string  = 'Alice';
const score: number     = 9.5;
const isAdmin: boolean  = true;
const empty: null       = null;
const notSet: undefined = undefined;

// void — hàm không return giá trị
function log(msg: string): void {
  console.log(msg);
}

// never — hàm luôn throw hoặc loop vô tận
function fail(msg: string): never {
  throw new Error(msg);
}

// unknown — phải check type trước khi dùng
const rawInput: unknown = 'hello';
if (typeof rawInput === 'string') {
  console.log(rawInput.toUpperCase()); // OK sau khi check
}`;

const REAL = `// Typing trong Express request handler
import { Request, Response } from 'express';

app.post('/login', (req: Request, res: Response): void => {
  const email: string  = req.body.email;
  const remember: boolean = req.body.rememberMe ?? false;

  if (!email) {
    res.status(400).json({ error: 'Email required' });
    return; // void: return sớm không cần giá trị
  }

  res.json({ token: 'jwt...' });
});`;

const JSOTS = `// JavaScript — không có type safety:
const age = '25';          // string hay number?
const price = 9.99;
console.log(age + price);  // '259.99' — bug! string concat

// TypeScript — phát hiện ngay lúc compile:
const age: number  = 25;
const price: number = 9.99;
console.log(age + price);  // 34.99 — đúng!

// age = 'twenty';
// Error: Type 'string' is not assignable to type 'number'`;

interface Props {
  isDone: boolean;
  onToggleDone: () => void;
}

export default function Lesson02({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-01-02"
      num="02"
      title="Primitive types — 8 loại cơ bản của TypeScript"
      desc="string, number, boolean, null, undefined, void, unknown, never"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        <p>
          TypeScript có 8 primitive types. Hiểu rõ từng loại giúp bạn viết code đúng và tránh bug do
          nhầm type.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            marginTop: 10,
            fontSize: 13,
          }}
        >
          {[
            ['string', 'Chuỗi văn bản'],
            ['number', 'Số nguyên và thực (không phân biệt)'],
            ['boolean', 'true hoặc false'],
            ['null', 'Không có giá trị (chủ động gán)'],
            ['undefined', 'Chưa được gán giá trị'],
            ['void', 'Hàm không return gì'],
            ['unknown', 'Type không biết — phải check trước dùng'],
            ['never', 'Hàm không bao giờ kết thúc bình thường'],
          ].map(([type, desc]) => (
            <div
              key={type}
              style={{
                display: 'flex',
                gap: 8,
                padding: '6px 0',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <code className="ic" style={{ minWidth: 80, color: 'var(--accent)' }}>
                {type}
              </code>
              <span style={{ color: 'var(--text2)', fontSize: 12 }}>{desc}</span>
            </div>
          ))}
        </div>
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Khai báo biến với type annotation: const name: string = "Alice"',
            'TypeScript compiler kiểm tra mọi phép gán và phép tính',
            'Nếu type không khớp → báo lỗi lúc compile (trước khi chạy)',
            'Sau khi compile → type annotations bị xóa, chạy như JS bình thường',
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
              explanation: 'score: number — TS không phân biệt int/float, chỉ có 1 type number',
            },
            {
              line: '8-10',
              explanation:
                'void return type — compiler báo lỗi nếu hàm return giá trị ngoài ý muốn',
            },
            {
              line: '13-15',
              explanation:
                'never — compiler biết code sau throw không bao giờ chạy (dead code detection)',
            },
            {
              line: '18-20',
              explanation: 'unknown — typeof check thu hẹp type: trong if block, TS biết là string',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          <strong>Nhầm any với unknown:</strong> <code className="ic">any</code> tắt type checking
          hoàn toàn. <code className="ic">unknown</code> an toàn hơn — buộc phải check type trước
          khi dùng. Tránh dùng <code className="ic">any</code>, đặc biệt với{' '}
          <code className="ic">strict: true</code>.
        </Callout>
        <Callout type="note">
          <strong>null vs undefined:</strong> Trong TS strict mode, cả hai đều không thể gán cho các
          type khác. Mongoose <code className="ic">findById()</code> trả{' '}
          <code className="ic">null</code> (không phải <code className="ic">undefined</code>) khi
          không tìm thấy — nhớ handle đúng loại.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Khai báo 8 biến, mỗi biến dùng 1 primitive type. Thử gán sai type và đọc thông báo lỗi.',
            },
            {
              level: 'medium',
              text: 'Viết function safeParseInt(val: unknown): number | null — trả number nếu val là string số hợp lệ, null nếu không.',
            },
            {
              level: 'hard',
              text: 'Viết function parseEnv(key: string): string — throw Error nếu env var không tồn tại, đảm bảo return type là string (không phải string | undefined).',
            },
          ]}
          hint='safeParseInt: typeof val === "string" && !isNaN(Number(val)). parseEnv: const val = process.env[key]; if (!val) throw new Error(...); return val;'
        />
      </Sec>
    </LessonCard>
  );
}
