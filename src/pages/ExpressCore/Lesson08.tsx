import LessonCard from '../../components/LessonCard';
import CodeTabs from '../../components/CodeTabs';
import LineTable from '../../components/LineTable';
import ExerciseSection from '../../components/ExerciseSection';
import Callout from '../../components/Callout';
import { Sec, Flow } from './_helpers';

interface Props { isDone: boolean; onToggleDone: () => void; }

const BASIC = `// src/types/express.d.ts
import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // thêm req.user — optional vì chưa authenticate thì undefined
    }
  }
}

// Không cần export gì — file .d.ts tự áp dụng cho cả project`;

const REAL = `// src/models/User.ts
export interface IUser {
  _id:      string;
  name:     string;
  email:    string;
  role:     'user' | 'admin';
}

// src/types/express.d.ts
import { IUser } from '../models/User';
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// src/middleware/authenticate.ts
import { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/User';

export const authenticate: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token required' });
  }
  try {
    const token   = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as IUser;
    req.user      = payload; // ← TypeScript OK nhờ Declaration Merging
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// src/routes/profileRoutes.ts
import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.get('/me', authenticate, (req: Request, res: Response) => {
  res.json({ user: req.user }); // req.user: IUser | undefined — TypeScript OK ✓
});

router.get('/admin', authenticate, (req: Request, res: Response) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }
  res.json({ dashboard: {} });
});`;

const MISTAKE = `// ❌ Sai lầm 1: Quên tạo .d.ts → TypeScript báo lỗi
import { RequestHandler } from 'express';

const authenticate: RequestHandler = (req, res, next) => {
  req.user = payload;
  // Error: Property 'user' does not exist on type 'Request<...>'
  next();
};

// ❌ Sai lầm 2: Tạo file .ts thay vì .d.ts
// src/types/express.ts  ← sai, không phải .d.ts
export {}; // cần export để thành module
declare global {
  namespace Express {
    interface Request { user?: any; }
  }
}
// Vẫn có thể không hoạt động đúng cách — TypeScript .d.ts có semantics khác

// ❌ Sai lầm 3: Quên include .d.ts trong tsconfig
// tsconfig.json phải có:
// "include": ["src/**/*"] — đã include *.d.ts files
// Nếu chỉ có "include": ["src/**/*.ts"] → thiếu .d.ts!

// ✅ Đúng: .d.ts file + tsconfig include đúng
// File: src/types/express.d.ts
import { IUser } from '../models/User';
declare global {
  namespace Express {
    interface Request { user?: IUser; }
  }
}
// tsconfig.json: "include": ["src/**/*"] ← include tất cả, kể cả .d.ts`;

export default function Lesson08({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-02-08"
      num="08"
      title="Declaration Merging — thêm req.user vào Express Request"
      desc="express.d.ts, namespace Express, augment Request interface"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Declaration Merging là tính năng TypeScript cho phép mở rộng interface đã có từ thư viện
        khác. Express định nghĩa <code>namespace Express</code> với <code>interface Request</code> —
        ta có thể merge thêm field <code>user</code> vào đó mà không cần fork thư viện. Kỹ thuật
        này dùng file <code>.d.ts</code> (declaration file) để khai báo type mà không có
        implementation. Sau khi merge, <code>req.user</code> xuất hiện ở mọi nơi trong project
        với đúng type đã định nghĩa.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow steps={[
          'Tạo file src/types/express.d.ts (không phải .ts — phải là .d.ts)',
          'Dùng declare global { namespace Express { interface Request { ... } } }',
          'Thêm user?: IUser vào Request interface',
          'Import IUser trong .d.ts file — hoặc dùng type alias',
          'TypeScript tự merge declaration — req.user xuất hiện ở mọi nơi',
        ]} />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs tabs={[
          { label: 'Cơ bản .ts', code: BASIC },
          { label: 'Thực tế .ts', code: REAL },
          { label: 'Sai lầm .ts', code: MISTAKE },
        ]} />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable rows={[
          { line: '1',  explanation: 'declare global — mở rộng global scope. Cần thiết trong module files (có import/export) để declaration không bị giới hạn trong module scope.' },
          { line: '2',  explanation: 'namespace Express — namespace mà @types/express định nghĩa. TypeScript tự ghép tất cả declarations của cùng 1 namespace từ nhiều file.' },
          { line: '3',  explanation: 'File .d.ts — Declaration file, chỉ chứa type declarations, không có implementation code. TypeScript compiler xử lý khác với .ts thông thường.' },
          { line: '4',  explanation: 'interface Request { user?: IUser } — thêm field vào interface có sẵn, không override. user? là optional vì request chưa qua authenticate thì undefined.' },
          { line: '5',  explanation: 'req.user?.role — optional chaining vì req.user có thể undefined. Nếu authenticate đã chạy và set req.user, truy cập an toàn.' },
          { line: '6',  explanation: 'process.env.JWT_SECRET! — non-null assertion operator. Báo TypeScript "tôi biết giá trị này không phải undefined". Dùng khi đã validate env ở startup.' },
        ]} />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          <code>req.user</code> có type <code>IUser | undefined</code> vì là optional. Luôn kiểm
          tra <code>if (!req.user)</code> trước khi dùng, hoặc dùng <code>req.user?.role</code>.
          Nếu middleware <code>authenticate</code> đã chạy, có thể assert <code>req.user!</code>{' '}
          nhưng không khuyến khích — dễ gây lỗi khi thứ tự middleware thay đổi.
        </Callout>
        <Callout type="note">
          File <code>.d.ts</code> là Declaration file — chỉ chứa type declarations, không có
          implementation. TypeScript tự merge với các declarations có sẵn của Express. Phần{' '}
          <code>"include": ["src/**/*"]</code> trong tsconfig phải include cả <code>.d.ts</code> files.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Tạo src/types/express.d.ts thêm requestId?: string vào Request. Viết middleware set req.requestId = crypto.randomUUID(). Test trong route handler.',
            },
            {
              level: 'medium',
              text: 'Extend Request thêm cả startTime?: number. Middleware ghi req.startTime = Date.now(). Trong res.on("finish"), log duration.',
            },
            {
              level: 'hard',
              text: 'Tạo requireRole(...roles: Array<"user" | "admin" | "moderator">): RequestHandler — kiểm tra req.user?.role thuộc roles được phép. Throw 403 nếu không.',
            },
          ]}
          hint="declare global cho phép augment types từ thư viện khác. namespace Express là namespace mà @types/express định nghĩa — mình merge thêm vào. TypeScript tự ghép tất cả declarations của cùng 1 namespace."
        />
      </Sec>
    </LessonCard>
  );
}
