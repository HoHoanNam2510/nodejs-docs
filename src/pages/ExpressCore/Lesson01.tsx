import LessonCard from '../../components/LessonCard';
import CodeTabs from '../../components/CodeTabs';
import LineTable from '../../components/LineTable';
import ExerciseSection from '../../components/ExerciseSection';
import Callout from '../../components/Callout';
import { Sec, Flow } from './_helpers';

interface Props { isDone: boolean; onToggleDone: () => void; }

const BASIC = `// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}`;

const REAL = `// package.json scripts
{
  "scripts": {
    "dev":   "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}

// src/index.ts — entry point
import app from './app';

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(\`Server running on http://localhost:\${PORT}\`);
});`;

export default function Lesson01({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-02-01"
      num="01"
      title="Cài đặt Express + TypeScript — packages, tsconfig, scripts"
      desc="express, @types/express, ts-node, tsx, cấu hình tsconfig cho backend"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Express là framework Node.js tối giản để xây dựng REST API. Khi kết hợp với TypeScript,
        bạn có type safety cho toàn bộ request/response cycle — giúp phát hiện lỗi sớm lúc compile
        thay vì lúc runtime. Cần cài đặt <code>typescript</code>, <code>@types/express</code> và
        một TypeScript executor như <code>tsx</code> để chạy trực tiếp file <code>.ts</code> khi dev.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow steps={[
          'Khởi tạo project: npm init -y + git init',
          'Cài packages: npm i express + npm i -D typescript @types/node @types/express ts-node tsx',
          'Tạo tsconfig.json với strict mode + outDir: "dist" + rootDir: "src"',
          'Thêm scripts vào package.json: dev, build, start',
          'Tạo src/index.ts và chạy npm run dev',
        ]} />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs tabs={[
          { label: 'Cơ bản .ts', code: BASIC },
          { label: 'Thực tế .ts', code: REAL },
        ]} />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable rows={[
          { line: '5',  explanation: '"target": "ES2020" — TypeScript biên dịch sang ES2020, hỗ trợ async/await, optional chaining, nullish coalescing.' },
          { line: '7',  explanation: '"outDir": "dist" — file .js sau khi build sẽ nằm trong thư mục dist/, tách biệt với source.' },
          { line: '8',  explanation: '"rootDir": "src" — chỉ compile file trong src/. Giữ cấu trúc thư mục khi output ra dist/.' },
          { line: '9',  explanation: '"strict": true — bật toàn bộ strict checks: noImplicitAny, strictNullChecks, strictFunctionTypes... Bắt buộc cho production code.' },
          { line: '10', explanation: '"esModuleInterop": true — cho phép import express from "express" thay vì import * as express from "express".' },
          { line: '3',  explanation: 'tsx watch src/index.ts — tsx là TypeScript executor hiện đại, watch mode tự restart khi file thay đổi (hot-reload).' },
          { line: '4',  explanation: '"build": "tsc" — chạy TypeScript compiler, sinh ra file .js vào dist/. Chỉ dùng khi deploy production.' },
          { line: '5',  explanation: '"start": "node dist/index.js" — chạy file JS đã build. Production server không cần tsx.' },
        ]} />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Quên cài <code>@types/express</code> → <code>import express from 'express'</code> báo lỗi
          "Could not find declaration file for module 'express'". Đây là devDependency — luôn cài
          cùng với express.
        </Callout>
        <Callout type="note">
          Dùng <code>tsx watch</code> thay <code>ts-node-dev</code> — nhẹ hơn, không cần config thêm,
          hot-reload tốt. <code>ts-node-dev</code> đã không còn được maintain tích cực.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Khởi tạo project Express + TS từ đầu. Chạy npx tsc --noEmit — không có lỗi.',
            },
            {
              level: 'medium',
              text: 'Thêm paths alias vào tsconfig: "@/*": ["src/*"] và cài tsconfig-paths. Import thử @/app.',
            },
            {
              level: 'hard',
              text: 'Tạo script "typecheck" chạy tsc --noEmit, script "lint" chạy eslint src --ext .ts. Thêm husky pre-commit hook chạy cả hai.',
            },
          ]}
          hint="tsx là TypeScript executor không cần build — perfect cho dev. tsc chỉ dùng khi build production. Alias paths cần thêm cả vào tsconfig và tsconfig-paths/register khi chạy."
        />
      </Sec>
    </LessonCard>
  );
}
