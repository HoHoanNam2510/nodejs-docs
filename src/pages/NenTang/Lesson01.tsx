import LessonCard from '../../components/LessonCard';
import CodeTabs from '../../components/CodeTabs';
import LineTable from '../../components/LineTable';
import ExerciseSection from '../../components/ExerciseSection';
import Callout from '../../components/Callout';
import { Sec, Flow } from './_helpers';

const BASIC = `// hello.ts
const name: string = 'Alice';
const age: number = 25;
const isActive: boolean = true;

function greet(userName: string): string {
  return 'Hello, ' + userName + '!';
}

console.log(greet(name));   // Hello, Alice!
// greet(42);               // Error lúc compile — không đợi runtime crash`;

const REAL = `// server.ts — Express với TypeScript
import express, { Express, Request, Response } from 'express';

const app: Express = express();
const PORT: number = Number(process.env.PORT) || 3000;

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello TypeScript!' });
});

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});`;

interface Props {
  isDone: boolean;
  onToggleDone: () => void;
}

export default function Lesson01({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-01-01"
      num="01"
      title="TypeScript là gì — và tại sao dùng cho backend"
      desc="JS superset, compile step, type checking lúc viết code"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        <p>
          TypeScript là <strong>superset của JavaScript</strong> — mọi code JS đều là code TS hợp
          lệ. TS thêm vào hệ thống <strong>static type</strong>: bạn khai báo type cho biến và
          function, compiler kiểm tra tính đúng đắn lúc viết code, báo lỗi trước khi chạy.
        </p>
        <p style={{ marginTop: 8 }}>
          File <code className="ic">.ts</code> không chạy trực tiếp — phải qua bước compile thành{' '}
          <code className="ic">.js</code> (bằng <code className="ic">tsc</code>,{' '}
          <code className="ic">ts-node</code>, hoặc <code className="ic">tsx</code>).
        </p>
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Viết code TypeScript trong file .ts',
            'TypeScript compiler (tsc) kiểm tra types — báo lỗi nếu sai',
            'Compile thành JavaScript (.js) — type annotations bị xóa',
            'Node.js chạy file .js như bình thường',
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
              line: '1',
              explanation:
                'const name: string — type annotation, compiler biết name phải là string',
            },
            {
              line: '4',
              explanation:
                'function greet(userName: string): string — param type + return type rõ ràng',
            },
            { line: '8', explanation: 'greet(name) — TypeScript kiểm tra: name là string → OK' },
            {
              line: '9',
              explanation:
                '// greet(42) — nếu bỏ comment: Error, argument là number không phải string',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          <strong>Quên cài @types packages:</strong> Nhiều thư viện JS không có built-in types. Phải
          cài thêm <code className="ic">@types/express</code>,{' '}
          <code className="ic">@types/node</code>,... Không có types → IDE mất autocomplete,
          compiler báo lỗi.
        </Callout>
        <Callout type="note">
          <strong>Kiểm tra nhanh:</strong> Chạy <code className="ic">npx tsc --noEmit</code> để
          type-check toàn bộ project mà không sinh file output. Nên add vào CI pipeline.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Viết function calculateBMI(weight: number, height: number): number. Gọi thử với string để thấy TypeScript báo lỗi.',
            },
            {
              level: 'medium',
              text: 'Tạo file server.ts cài express, chạy được trên port 3000 với 1 route GET / trả JSON { status: "ok" }.',
            },
            {
              level: 'hard',
              text: 'Setup project TypeScript hoàn chỉnh: tsconfig.json với strict: true, package.json với scripts dev/build/start, tsconfig path aliases.',
            },
          ]}
          hint="BMI = weight / (height * height). Cài: npm install typescript @types/node ts-node --save-dev, rồi npx tsc --init để tạo tsconfig."
        />
      </Sec>
    </LessonCard>
  );
}
