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

const BASIC = `import mongoSanitize from 'express-mongo-sanitize';
import express from 'express';

const app = express();

app.use(express.json());

// Ngăn MongoDB operator injection trong req.body, req.params, req.query
app.use(mongoSanitize());

// Ví dụ attack ngăn chặn:
// POST /auth/login với body: { "email": { "$gt": "" }, "password": "anything" }
// Không có sanitize: MongoDB query { email: { $gt: "" } } match MỌI user!
// Có sanitize: ký tự $ bị xóa → query { email: { gt: "" } } → không match → an toàn

// Hoặc dùng options để throw error thay vì xóa
app.use(mongoSanitize({
  onSanitize: ({ req, key }) => {
    console.warn('Sanitized:', key, 'in', req.path);
  },
  replaceWith: '_', // thay $ bằng _ thay vì xóa
}));`;

const REAL = `// src/app.ts — full security middleware stack

import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

const app: Express = express();

// ===== SECURITY MIDDLEWARE — thứ tự quan trọng =====

// 1. Ẩn headers lộ thông tin server
app.use(helmet());

// 2. CORS — whitelist origins
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));

// 3. Rate limiting — toàn bộ API
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max:      100,             // 100 requests/IP
    message:  { success: false, error: 'Quá nhiều requests. Thử lại sau.' },
  })
);

// 4. Parse JSON body
app.use(express.json({ limit: '10kb' })); // limit body size — chống DoS

// 5. Sanitize MongoDB operators — sau parse, trước routes
app.use(mongoSanitize());

// 6. Routes
app.use('/api/auth', authRouter);
app.use('/api/posts', postRouter);
// ...

// 7. Error handler (cuối cùng)
app.use(errorHandler);

export default app;

// ===== Checklist Security cho mỗi endpoint =====
// [ ] Input validated với zod
// [ ] req.body typed (không dùng any)
// [ ] Không lộ internal errors trong production
// [ ] Rate limiting trên auth endpoints
// [ ] SQL/NoSQL injection không thể (mongoSanitize + zod)`;

const MISTAKE = `// ❌ Sai lầm 1: Đặt mongoSanitize() TRƯỚC express.json()
// → req.body chưa được parse → sanitize không có gì để làm!
app.use(mongoSanitize());   // req.body là undefined ở đây
app.use(express.json());    // parse xảy ra sau → đã quá muộn

// ✅ Thứ tự đúng: parse JSON trước, sanitize sau
app.use(express.json());
app.use(mongoSanitize());   // lúc này req.body là object — sanitize được

// ❌ Sai lầm 2: Chỉ sanitize body, quên params và query
// express-mongo-sanitize mặc định sanitize cả 3: body, params, query
// Nhưng nếu tự viết sanitize → dễ quên
// Attack via query: GET /users?role[$gt]=user → trả tất cả users có role!
// Attack via params: GET /posts/{"$gt":"0"} → match nhiều posts

// ✅ mongoSanitize() tự xử lý body + params + query cùng lúc

// ❌ Sai lầm 3: Chỉ dùng mongoSanitize, quên validate input với zod
// mongoSanitize xóa $ prefix — nhưng không validate kiểu dữ liệu
// POST /login với body: { email: 123, password: [] }
// → mongoSanitize không chặn (không có $)
// → User.findOne({ email: 123 }) — MongoDB ép kiểu → unexpected behavior

// ✅ Kết hợp cả hai: mongoSanitize (chặn operator injection) + zod (type validation)
app.use(mongoSanitize());                   // layer 1: sanitize operators
const body = RegisterSchema.parse(req.body); // layer 2: validate types

// ❌ Sai lầm 4: Lộ stack trace trong production
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack,    // ❌ lộ file paths, line numbers — security info!
  });
});

// ✅ Ẩn stack trace trong production
app.use((err: AppError, req: Request, res: Response) => {
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message,
    ...(isDev && { stack: err.stack }), // chỉ trả stack trong dev
  });
});`;

export default function Lesson10({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-06-10"
      num="10"
      title="Input Sanitization & Security Stack"
      desc="express-mongo-sanitize, body size limit, error stack trace ẩn production, security middleware order"
      priority="medium"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        NoSQL injection là tấn công khai thác MongoDB query operators (<code>$gt</code>,{' '}
        <code>$ne</code>, <code>$where</code>...) được nhúng vào request body/params/query.{' '}
        <code>express-mongo-sanitize</code> xóa các keys bắt đầu bằng <code>$</code> hoặc chứa{' '}
        <code>.</code> — vô hiệu hóa operator injection. Kết hợp với <strong>zod validation</strong>{' '}
        (enforce types) cho bảo vệ 2 lớp. Ngoài ra: giới hạn body size (chống DoS), ẩn stack trace
        production (chống info disclosure).
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Request đến → helmet() thêm security headers',
            'express.json({ limit: "10kb" }) → parse JSON body, reject nếu > 10kb',
            'mongoSanitize() → scan req.body/params/query, xóa keys có $ hoặc .',
            'zod Schema.parse(req.body) → validate types và format',
            'Business logic chạy — input đã safe ở 2 lớp',
            'Error handler: ẩn stack trace nếu NODE_ENV = production',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: 'Cơ bản .ts', code: BASIC },
            { label: 'Full security stack .ts', code: REAL },
            { label: 'Sai lầm .ts', code: MISTAKE },
          ]}
        />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable
          rows={[
            {
              line: '1',
              explanation:
                'mongoSanitize(): scan đệ quy req.body, req.params, req.query. Xóa keys bắt đầu bằng $ hoặc chứa . (dot notation tạo nested key trong MongoDB). { email: { "$gt": "" } } → { email: { gt: "" } } sau sanitize.',
            },
            {
              line: '2',
              explanation:
                'express.json({ limit: "10kb" }): reject request body > 10KB với 413 Payload Too Large. Chặn cơ bản nhất chống DoS qua large payloads. 10KB đủ cho hầu hết API requests — file upload dùng multipart/form-data riêng.',
            },
            {
              line: '3',
              explanation:
                'process.env.NODE_ENV !== "production": NODE_ENV phân biệt dev vs production behavior. Trong dev: trả stack trace để debug dễ hơn. Trong production: chỉ trả message — attacker không biết file structure.',
            },
            {
              line: '4',
              explanation:
                'Thứ tự middleware quan trọng: helmet → cors → rateLimit → express.json → mongoSanitize → routes → errorHandler. express.json phải trước mongoSanitize (sanitize req.body đã parsed). errorHandler phải cuối cùng.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          <code>mongoSanitize()</code> phải đặt <strong>sau</strong> <code>express.json()</code>.
          Nếu đặt trước, <code>req.body</code> chưa được parse (vẫn là raw Buffer) — không có gì để
          sanitize. Middleware chạy theo thứ tự khai báo trong Express.
        </Callout>
        <Callout type="note">
          Defense in depth: dùng nhiều lớp bảo vệ. mongoSanitize chặn operator injection nhưng không
          validate types. Zod validate types nhưng không biết MongoDB operators. Kết hợp cả hai:{' '}
          <strong>layer 1</strong> — mongoSanitize xóa dangerous characters;{' '}
          <strong>layer 2</strong> — zod enforce exact types và format.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Thêm mongoSanitize() vào Blog API (sau express.json()). Test attack: POST /auth/login với body { "email": { "$gt": "" }, "password": "x" }. Verify không có mongoSanitize → match user; có mongoSanitize → không match (operator bị xóa).',
            },
            {
              level: 'medium',
              text: 'Implement error handler middleware với NODE_ENV check: dev trả full stack trace, production chỉ trả message. Test bằng cách throw AppError trong route. Verify production response không có stack field.',
            },
            {
              level: 'hard',
              text: 'Audit toàn bộ Blog API với security checklist: (1) helmet() đầu tiên, (2) CORS whitelist, (3) rate limit auth routes, (4) body size limit, (5) mongoSanitize, (6) tất cả endpoints có zod validation, (7) không có any type trong controllers, (8) error handler ẩn stack production. Fix mọi item chưa pass.',
            },
          ]}
          hint="Test NoSQL injection mà không cần tool: dùng Postman gửi JSON body { 'email': { '$gt': '' }, 'password': 'anything' }. Nếu server trả user data → vulnerable. Với mongoSanitize: { 'email': { 'gt': '' } } sau sanitize → findOne không match → 401."
        />
      </Sec>
    </LessonCard>
  );
}
