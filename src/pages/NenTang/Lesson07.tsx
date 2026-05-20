import LessonCard from '../../components/LessonCard';
import CodeTabs from '../../components/CodeTabs';
import LineTable from '../../components/LineTable';
import ExerciseSection from '../../components/ExerciseSection';
import Callout from '../../components/Callout';
import { Sec, Flow } from './_helpers';

const DIAGRAM = `
┌──────────────────────────────────────────────┐
│  CLIENT (Browser / Postman / Mobile App)     │
└───────────────────────┬──────────────────────┘
                        │  HTTP Request
                        │  GET /api/users HTTP/1.1
                        │  Host: localhost:3000
                        │  Authorization: Bearer <token>
                        ▼
┌──────────────────────────────────────────────┐
│  SERVER (Express.js)                         │
│                                              │
│  Bước 1: Nhận request                        │
│  Bước 2: Middleware (logger, auth, parse)    │
│  Bước 3: Route handler xử lý logic           │
│  Bước 4: Truy vấn MongoDB qua Mongoose       │
│  Bước 5: Tạo và gửi response                 │
└───────────────────────┬──────────────────────┘
                        │  HTTP Response
                        │  Status: 200 OK
                        │  Content-Type: application/json
                        │  Body: { "users": [...] }
                        ▼
┌──────────────────────────────────────────────┐
│  CLIENT nhận response, render UI             │
└──────────────────────────────────────────────┘
`;

const EXPRESS_CODE = `// Express code tương ứng với HTTP cycle
import express, { Request, Response } from 'express';

const app = express();
app.use(express.json()); // middleware: parse JSON body từ request

app.get('/api/users', (req: Request, res: Response) => {
  // req chứa thông tin HTTP Request:
  console.log(req.method);                    // 'GET'
  console.log(req.url);                       // '/api/users'
  console.log(req.headers['authorization']);  // 'Bearer token123'
  console.log(req.query);                     // { page: '1', limit: '10' }

  // res để gửi HTTP Response:
  res.status(200).json({ users: [] });
  // → Status: 200, Content-Type: application/json
});`;

interface Props {
  isDone: boolean;
  onToggleDone: () => void;
}

export default function Lesson07({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-01-07"
      num="07"
      title="HTTP Request/Response Cycle"
      desc="client → server → response, headers, body, stateless protocol"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        <p>
          HTTP là giao thức <strong>stateless</strong> (không nhớ request trước). Mỗi giao tiếp gồm
          1 Request từ client và 1 Response từ server. Express.js xử lý quá trình này thông qua
          middleware chain và route handlers.
        </p>
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Client gửi HTTP Request: method + URL + headers + body (với POST/PUT)',
            'Express nhận request — chạy qua middleware chain (logger, auth, parse body...)',
            'Route handler khớp với method + path → xử lý logic, truy vấn DB',
            'Server tạo HTTP Response: status code + headers + body',
            'Client nhận response, đọc status code, parse body JSON',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: 'Diagram', code: DIAGRAM },
            { label: 'Express code', code: EXPRESS_CODE },
          ]}
        />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable
          rows={[
            {
              line: 'req.method',
              explanation: 'HTTP method string: "GET", "POST", "PUT", "PATCH", "DELETE"',
            },
            { line: 'req.url', explanation: 'URL path + query string: "/api/users?page=1"' },
            { line: 'req.headers', explanation: 'Object chứa tất cả HTTP headers — key lowercase' },
            {
              line: 'req.query',
              explanation: 'Query string đã được parse thành object: { page: "1", limit: "10" }',
            },
            {
              line: 'res.status().json()',
              explanation:
                'Gửi response: set status code, set Content-Type: application/json, gửi body',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          <strong>Quên express.json() middleware:</strong> Nếu không có{' '}
          <code className="ic">app.use(express.json())</code>, thì{' '}
          <code className="ic">req.body</code> sẽ là <code className="ic">undefined</code> khi
          client gửi JSON body. Middleware này phải đặt trước các routes.
        </Callout>
        <Callout type="note">
          <strong>Stateless — quan trọng cho thiết kế API:</strong> Server không nhớ client giữa các
          request. Mọi thông tin cần thiết phải được gửi trong request (token ở header, user id ở
          params...). Đây là lý do tại sao cần JWT cho authentication.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Tạo Express app với route GET /info trả về: method, url, headers["user-agent"], timestamp hiện tại.',
            },
            {
              level: 'medium',
              text: 'Viết middleware logRequest: log ra console "[METHOD] URL - timestamp" cho mỗi request. Apply cho toàn app.',
            },
            {
              level: 'hard',
              text: 'Tạo route POST /echo nhận JSON body bất kỳ và trả lại chính xác object đó, kèm headers từ request và timestamp server.',
            },
          ]}
          hint="req.body cần express.json() middleware. Để lấy timestamp: new Date().toISOString(). Middleware: app.use((req, res, next) => { ... next(); })"
        />
      </Sec>
    </LessonCard>
  );
}
