import LessonCard from '../../components/LessonCard';
import CodeTabs from '../../components/CodeTabs';
import LineTable from '../../components/LineTable';
import ExerciseSection from '../../components/ExerciseSection';
import Callout from '../../components/Callout';
import { Sec, Flow } from './_helpers';

const TSCONFIG = `// tsconfig.json — cấu hình TypeScript compiler
{
  "compilerOptions": {
    "target": "ES2020",       // compile ra ES2020
    "module": "CommonJS",     // Node.js dùng CommonJS
    "lib": ["ES2020"],
    "outDir": "./dist",       // output compiled JS
    "rootDir": "./src",       // source TypeScript files
    "strict": true,           // bật toàn bộ strict checks — QUAN TRỌNG
    "esModuleInterop": true,  // import express from 'express' hoạt động
    "skipLibCheck": true,     // bỏ qua check .d.ts (nhanh hơn)
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}`;

const SCRIPTS = `// package.json scripts
{
  "scripts": {
    "dev":        "tsx watch src/index.ts",  // dev với hot reload
    "build":      "tsc",                     // compile TS → JS
    "start":      "node dist/index.js",      // chạy production
    "type-check": "tsc --noEmit"             // check types, không sinh file
  }
}

// Cài packages cần thiết cho backend TS:
// npm install typescript @types/node --save-dev
// npm install ts-node tsx --save-dev
// npm install express
// npm install @types/express --save-dev`;

interface Props {
  isDone: boolean;
  onToggleDone: () => void;
}

export default function Lesson06({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-01-06"
      num="06"
      title="tsconfig.json & Tooling — setup môi trường TypeScript"
      desc="strict mode, target, module, ts-node, tsx, build scripts"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        <p>
          <code className="ic">tsconfig.json</code> điều khiển cách TypeScript compiler (
          <code className="ic">tsc</code>) hoạt động. Option quan trọng nhất:{' '}
          <code className="ic">strict: true</code> bật toàn bộ strict checks. Để chạy{' '}
          <code className="ic">.ts</code> trong dev, dùng <code className="ic">ts-node</code> hoặc{' '}
          <code className="ic">tsx</code> (nhanh hơn ~10x).
        </p>
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'npm init -y → tạo package.json',
            'npm install typescript @types/node ts-node tsx --save-dev',
            'npx tsc --init → tạo tsconfig.json mặc định',
            'Chỉnh tsconfig: bật strict, set outDir/rootDir',
            'Dev: npm run dev (tsx watch) — Production: npm run build rồi npm start',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: 'tsconfig.json', code: TSCONFIG },
            { label: 'package.json scripts', code: SCRIPTS },
          ]}
        />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable
          rows={[
            {
              line: 'strict',
              explanation:
                'Bật: strictNullChecks, noImplicitAny, strictFunctionTypes... Luôn bật cho project mới',
            },
            {
              line: 'target ES2020',
              explanation: 'Output JS dùng ES2020 features — Node 14+ hỗ trợ',
            },
            {
              line: 'module CommonJS',
              explanation:
                'Node.js dùng CommonJS (require). Nếu dùng ESM native thì đổi thành "NodeNext"',
            },
            {
              line: 'esModuleInterop',
              explanation: 'Cho phép: import express from "express" thay vì import * as express',
            },
            {
              line: 'skipLibCheck',
              explanation: 'Bỏ qua type-check file .d.ts của node_modules → compile nhanh hơn',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          <strong>ts-node vs tsx:</strong> <code className="ic">ts-node</code> dùng TypeScript
          compiler (chậm). <code className="ic">tsx</code> dùng esbuild (nhanh ~10x) nhưng không
          type-check — chỉ transpile. Dùng <code className="ic">tsc --noEmit</code> riêng để
          type-check.
        </Callout>
        <Callout type="note">
          <strong>Cấu trúc thư mục chuẩn:</strong> <code className="ic">rootDir: "./src"</code> và{' '}
          <code className="ic">outDir: "./dist"</code>. Toàn bộ TypeScript source trong{' '}
          <code className="ic">src/</code>, compiled JS ra <code className="ic">dist/</code>. Add{' '}
          <code className="ic">dist/</code> vào <code className="ic">.gitignore</code>.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Tạo project TypeScript từ đầu: npm init, cài packages, npx tsc --init, chỉnh tsconfig, chạy được hello.ts.',
            },
            {
              level: 'medium',
              text: 'Thêm path aliases vào tsconfig: "@/*" map tới "src/*". Import thử với @/utils/helper.',
            },
            {
              level: 'hard',
              text: 'Setup complete: tsconfig với strict + paths, package.json với 4 scripts, .gitignore, .env.example, src/index.ts chạy được.',
            },
          ]}
          hint='Path aliases trong tsconfig: { "paths": { "@/*": ["./src/*"] } }. Cần thêm tsconfig-paths khi dùng ts-node: ts-node -r tsconfig-paths/register src/index.ts'
        />
      </Sec>
    </LessonCard>
  );
}
