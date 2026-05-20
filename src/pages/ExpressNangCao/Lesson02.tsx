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

const STRUCTURE = `// Cấu trúc thư mục TypeScript Express project chuẩn
src/
├── types/            ← interfaces, type aliases, express.d.ts
│   ├── index.ts      ← export tất cả shared types
│   └── express.d.ts  ← Declaration Merging (req.user...)
├── config/           ← environment config
│   └── env.ts        ← type-safe config object
├── models/           ← Mongoose models
│   ├── User.ts       ← IUser interface + User model
│   └── Post.ts       ← IPost interface + Post model
├── controllers/      ← request handlers (thin layer)
│   ├── user.controller.ts
│   └── post.controller.ts
├── services/         ← business logic (có thể test độc lập)
│   ├── user.service.ts
│   └── post.service.ts
├── routes/           ← Express Router files
│   ├── index.ts      ← mount tất cả routers
│   ├── user.routes.ts
│   └── post.routes.ts
├── middleware/       ← custom middleware
│   ├── auth.middleware.ts
│   ├── error.middleware.ts
│   └── validate.middleware.ts
└── app.ts            ← Express setup (không start server)
index.ts              ← entry point: start server
tsconfig.json
.env
.env.example          ← commit file này, KHÔNG commit .env`;

const CONTROLLER = `// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { asyncHandler } from '../middleware/error.middleware';

// Controller: nhận request → gọi service → trả response
// Không chứa business logic
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await UserService.findAll();
  res.json({ success: true, data: users });
});

export const getUserById = asyncHandler(
  async (req: Request<{ id: string }>, res: Response) => {
    const user = await UserService.findById(req.params.id);
    res.json({ success: true, data: user });
  }
);`;

const SERVICE = `// src/services/user.service.ts
import { AppError } from '../middleware/error.middleware';
import { IUser } from '../types';

// Service: business logic — có thể unit test mà không cần HTTP
export class UserService {
  static async findAll(): Promise<IUser[]> {
    // Sau sẽ replace bằng Mongoose query
    return [];
  }

  static async findById(id: string): Promise<IUser> {
    const user = await SomeModel.findById(id);
    if (!user) throw new AppError('User không tìm thấy', 404);
    return user;
  }

  static async create(data: Omit<IUser, 'id' | 'createdAt'>): Promise<IUser> {
    // validate → save → return
    return SomeModel.create(data);
  }
}`;

export default function Lesson02({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-03-02"
      num="02"
      title="Cấu trúc thư mục TypeScript project chuẩn"
      desc="src/controllers, src/services, src/routes, src/models, src/middleware, src/types"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Một TypeScript Express project chuẩn tách biệt 3 lớp rõ ràng: <strong>Routes</strong> (định
        nghĩa URL + HTTP method), <strong>Controllers</strong> (xử lý request/response), và{' '}
        <strong>Services</strong> (business logic thuần — không biết gì về HTTP). Phân tách này giúp
        mỗi phần có thể test độc lập: service test không cần HTTP server, controller test không cần
        database thực.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Request đến → Router match URL và method → gọi Controller function',
            'Controller parse req.params/body → validate input → gọi Service',
            'Service thực hiện business logic → query database (Model) → trả kết quả',
            'Controller nhận kết quả từ Service → format response → res.json()',
            'Nếu lỗi xảy ra ở bất kỳ bước nào → throw AppError → Error Middleware bắt',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: 'Cấu trúc .ts', code: STRUCTURE },
            { label: 'Controller .ts', code: CONTROLLER },
            { label: 'Service .ts', code: SERVICE },
          ]}
        />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable
          rows={[
            {
              line: 'types/',
              explanation:
                'Chứa tất cả shared TypeScript types: IUser, IPost, ApiResponse. express.d.ts để extend Request interface với req.user. Import từ đây thay vì define lại nhiều chỗ.',
            },
            {
              line: 'config/',
              explanation:
                'env.ts export một config object typed. Validate env vars khi startup — fail fast nếu thiếu biến quan trọng thay vì fail lúc runtime.',
            },
            {
              line: 'controllers/',
              explanation:
                'Thin layer — chỉ nhận request, gọi service, trả response. Không chứa logic phức tạp. Nếu controller > 20 lines, có thể logic đang sai chỗ.',
            },
            {
              line: 'services/',
              explanation:
                'Business logic thuần — không import express, không biết về req/res. Dễ unit test vì chỉ nhận params và trả giá trị.',
            },
            {
              line: 'middleware/',
              explanation:
                'auth.middleware.ts: verify JWT, gán req.user. error.middleware.ts: global error handler + asyncHandler wrapper. validate.middleware.ts: zod validation.',
            },
            {
              line: 'index.ts',
              explanation:
                'Entry point — chỉ import app và gọi app.listen(). Tách với app.ts để dễ test: test files import app.ts mà không start server thật.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Đừng import circular: Model import Service import Model. TypeScript có thể không báo lỗi
          compile nhưng Node.js sẽ crash lúc runtime với{' '}
          <code>Cannot access X before initialization</code>. Luồng phụ thuộc đúng: Route →
          Controller → Service → Model (một chiều).
        </Callout>
        <Callout type="note">
          <code>.env.example</code> nên commit vào git — chứa tất cả env var names với placeholder
          values. <code>.env</code> thực sự chứa secrets — thêm vào <code>.gitignore</code>, không
          bao giờ commit.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Refactor Todo API (Module 02) theo cấu trúc này: tách ra todo.routes.ts, todo.controller.ts, todo.service.ts.',
            },
            {
              level: 'medium',
              text: 'Tạo src/routes/index.ts mount tất cả routers: usersRouter tại /users, postsRouter tại /posts. app.ts chỉ cần app.use("/api", allRoutes).',
            },
            {
              level: 'hard',
              text: 'Viết unit test cho UserService.findById() — mock database, test case: found, not found, invalid id format. Không cần HTTP server để test.',
            },
          ]}
          hint="Service layer không import từ express — đây là điểm quan trọng. Service chỉ làm việc với plain TypeScript objects, không biết gì về HTTP. Điều này cho phép unit test không cần mock Express."
        />
      </Sec>
    </LessonCard>
  );
}
