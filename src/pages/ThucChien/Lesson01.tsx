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

const PACKAGES = `# Tạo project
mkdir social-blog-api && cd social-blog-api
npm init -y

# Runtime dependencies
npm install express mongoose bcryptjs jsonwebtoken zod cors helmet express-rate-limit express-mongo-sanitize cookie-parser multer

# Dev dependencies (TypeScript + types)
npm install -D typescript ts-node tsx @types/node @types/express @types/bcryptjs @types/jsonwebtoken @types/cors @types/multer @types/cookie-parser

# Kiểm tra versions
npx tsc --version  # TypeScript 5.x`;

const TSCONFIG = `// tsconfig.json — strict mode bắt buộc
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}`;

const STRUCTURE = `social-blog-api/
├── src/
│   ├── types/
│   │   ├── index.ts          ← IUser, IPost, IComment, ILike interfaces
│   │   └── express.d.ts      ← extend Request với req.user
│   ├── config/
│   │   └── env.ts            ← type-safe env config + validation
│   ├── models/
│   │   ├── User.ts           ← User schema + model
│   │   ├── Post.ts           ← Post schema + model
│   │   ├── Comment.ts        ← Comment schema + model
│   │   └── Like.ts           ← Like schema + model
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── post.controller.ts
│   │   ├── comment.controller.ts
│   │   └── admin.controller.ts
│   ├── services/             ← business logic tách khỏi controller
│   │   ├── auth.service.ts
│   │   └── post.service.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── post.routes.ts
│   │   ├── comment.routes.ts
│   │   └── admin.routes.ts
│   ├── middleware/
│   │   ├── authenticate.ts   ← verify JWT + inject req.user
│   │   ├── requireRole.ts    ← RBAC
│   │   └── validate.ts       ← zod schema validation middleware
│   ├── utils/
│   │   ├── AppError.ts       ← custom error class
│   │   ├── asyncHandler.ts   ← wrap async route handlers
│   │   ├── jwt.ts            ← sign + verify helpers
│   │   └── response.ts       ← sendSuccess + sendError
│   ├── app.ts                ← Express setup, middleware stack
│   └── index.ts              ← server start + DB connect
├── .env
├── .env.example
├── tsconfig.json
└── package.json`;

const SCRIPTS = `// package.json scripts
{
  "scripts": {
    "dev":   "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "type-check": "tsc --noEmit"
  }
}

// src/config/env.ts — validate env vars khi startup
const config = {
  port:           Number(process.env.PORT)    || 3000,
  mongoUri:       process.env.MONGO_URI       as string,
  jwtSecret:      process.env.JWT_SECRET      as string,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET as string,
  nodeEnv:        process.env.NODE_ENV        || 'development',
  clientUrl:      process.env.CLIENT_URL      || 'http://localhost:5173',
} as const;

// Fail fast — throw ngay khi start nếu thiếu biến quan trọng
const required = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'] as const;
for (const key of required) {
  if (!process.env[key]) throw new Error(\`Missing env: \${key}\`);
}

export default config;`;

export default function Lesson01({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-07-01"
      num="01"
      title="Setup Project TypeScript"
      desc="npm init, packages, tsconfig.json strict, cấu trúc thư mục chuẩn, scripts"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Bước đầu tiên trong mọi TypeScript project là scaffold đúng cách.{' '}
        <strong>tsconfig.json</strong> với <code>strict: true</code> là bắt buộc — bật{' '}
        <code>strictNullChecks</code>, <code>noImplicitAny</code>, và 8 strict checks khác. Script{' '}
        <code>tsx watch</code> cho dev (HMR-like), <code>tsc</code> cho production build ra JS
        thuần. Cấu trúc thư mục theo layer: types → models → services → controllers → routes.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'npm init -y → cài packages: express, mongoose, bcryptjs, jsonwebtoken, zod...',
            'Tạo tsconfig.json với strict: true, outDir: dist, rootDir: src',
            'Scaffold folder structure: src/{types,config,models,controllers,services,routes,middleware,utils}',
            'Tạo .env + .env.example (commit .env.example, gitignore .env)',
            'src/config/env.ts: validate env vars khi startup — fail fast nếu thiếu',
            'npm run dev → tsx watch src/index.ts → hot reload khi sửa file',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: 'Cài packages', code: PACKAGES },
            { label: 'tsconfig.json', code: TSCONFIG },
            { label: 'Cấu trúc thư mục', code: STRUCTURE },
            { label: 'Scripts + Config', code: SCRIPTS },
          ]}
        />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable
          rows={[
            {
              line: '1',
              explanation:
                'strict: true bật 8 checks: strictNullChecks, noImplicitAny, strictFunctionTypes, strictPropertyInitialization... Không thể tắt riêng lẻ khi dùng strict — chỉ có thể bật thêm. Đây là lý do code TS strict buộc handle null/undefined rõ ràng.',
            },
            {
              line: '2',
              explanation:
                'noUnusedLocals + noUnusedParameters: compile error nếu khai báo biến/param mà không dùng. Giúp phát hiện code thừa. Trong Express route handler, dùng _req hoặc _res (underscore prefix) để bỏ qua param không cần.',
            },
            {
              line: '3',
              explanation:
                'tsx watch: tương tự ts-node nhưng nhanh hơn (dùng esbuild để transpile). Không type-check — chỉ transpile. Nhanh cho dev. Production: tsc (full type-check) → node dist/.',
            },
            {
              line: '4',
              explanation:
                'config as const: TypeScript suy ra literal types cho từng field. port: 3000 (number literal), không phải number. Giúp catch typo khi access config.portXXX — lỗi compile ngay.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Quên cài <code>@types/node</code> → TypeScript không nhận <code>process.env</code>,{' '}
          <code>__dirname</code>, Node.js globals. Luôn cài cùng lúc với <code>typescript</code>.
          Tương tự <code>@types/express</code> phải cài cùng <code>express</code>.
        </Callout>
        <Callout type="note">
          <strong>esModuleInterop: true</strong> cho phép <code>import express from 'express'</code>{' '}
          thay vì <code>import * as express from 'express'</code>. Bắt buộc phải bật khi dùng
          CommonJS packages với ESM-style imports. Hầu hết boilerplate hiện đại đã bật sẵn.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Scaffold project theo cấu trúc trên. Tạo src/index.ts với Express server cơ bản. Chạy npm run dev và verify server lắng nghe trên port 3000. Chạy npm run type-check để kiểm tra 0 errors.',
            },
            {
              level: 'medium',
              text: 'Implement src/config/env.ts với validation đầy đủ. Test: xóa MONGO_URI khỏi .env → server phải crash với message rõ ràng "Missing env: MONGO_URI". Restore .env → server start bình thường.',
            },
            {
              level: 'hard',
              text: 'Thêm path aliases vào tsconfig: "@/*" → "src/*". Cấu hình để import từ "@/utils/AppError" thay vì "../../utils/AppError". Hint: cần cả tsconfig paths + module-alias package (hoặc tsc-alias) để resolve lúc runtime.',
            },
          ]}
          hint="tsx không cần compile — dùng trực tiếp .ts files. Nhưng node dist/ cần compile trước bằng tsc. Hai scripts khác nhau phục vụ 2 mục đích: dev speed vs production correctness."
        />
      </Sec>
    </LessonCard>
  );
}
