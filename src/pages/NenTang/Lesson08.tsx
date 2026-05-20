import LessonCard from '../../components/LessonCard';
import CodeTabs from '../../components/CodeTabs';
import LineTable from '../../components/LineTable';
import ExerciseSection from '../../components/ExerciseSection';
import Callout from '../../components/Callout';
import { Sec, Flow } from './_helpers';

const METHODS = `// HTTP Methods — mỗi method có ngữ nghĩa riêng
// GET    — Lấy dữ liệu     (không thay đổi state, idempotent)
// POST   — Tạo mới
// PUT    — Thay thế hoàn toàn  (idempotent)
// PATCH  — Cập nhật một phần
// DELETE — Xóa  (idempotent)

// Express routing tương ứng:
app.get('/posts',         getAllPosts);   // GET /posts → danh sách
app.get('/posts/:id',     getPostById);  // GET /posts/123 → 1 bài
app.post('/posts',        createPost);   // POST /posts → tạo mới
app.put('/posts/:id',     replacePost);  // PUT /posts/123 → thay toàn bộ
app.patch('/posts/:id',   updatePost);  // PATCH /posts/123 → một phần
app.delete('/posts/:id',  deletePost);  // DELETE /posts/123 → xóa`;

const STATUS = `// HTTP Status Codes quan trọng nhất

// 2xx — Thành công
res.status(200).json(data);      // 200 OK
res.status(201).json(newItem);   // 201 Created
res.status(204).send();          // 204 No Content (xóa thành công)

// 4xx — Lỗi phía client
res.status(400).json({ error: 'Bad Request — dữ liệu không hợp lệ' });
res.status(401).json({ error: 'Unauthorized — chưa đăng nhập' });
res.status(403).json({ error: 'Forbidden — không có quyền' });
res.status(404).json({ error: 'Not Found — không tìm thấy' });
res.status(409).json({ error: 'Conflict — đã tồn tại' });

// 5xx — Lỗi phía server
res.status(500).json({ error: 'Internal Server Error' });`;

interface Props {
  isDone: boolean;
  onToggleDone: () => void;
}

export default function Lesson08({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-01-08"
      num="08"
      title="HTTP Methods & Status Codes — ngôn ngữ của REST API"
      desc="GET/POST/PUT/PATCH/DELETE, 2xx/4xx/5xx, idempotent"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        <p>
          HTTP Methods có ngữ nghĩa riêng — đây là "ngôn ngữ" của REST API. Status codes thông báo
          kết quả: <strong>2xx</strong> thành công, <strong>4xx</strong> lỗi client,{' '}
          <strong>5xx</strong> lỗi server.
        </p>
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Client chọn method phù hợp với hành động (GET lấy, POST tạo, DELETE xóa...)',
            'Server route match theo method + path → handler tương ứng',
            'Handler xử lý xong → trả status code phản ánh kết quả',
            'Client đọc status code → biết thành công hay thất bại mà không cần đọc body',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: 'HTTP Methods', code: METHODS },
            { label: 'Status Codes', code: STATUS },
          ]}
        />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable
          rows={[
            {
              line: 'GET',
              explanation:
                'Idempotent — gọi nhiều lần ra cùng kết quả. Không được thay đổi state server',
            },
            {
              line: 'POST',
              explanation:
                'Không idempotent — gọi 2 lần → tạo 2 records. Trả 201 Created khi thành công',
            },
            {
              line: 'PUT',
              explanation:
                'Idempotent — thay thế hoàn toàn resource. Client phải gửi đầy đủ tất cả fields',
            },
            {
              line: 'PATCH',
              explanation: 'Chỉ gửi fields muốn cập nhật — linh hoạt hơn PUT cho partial updates',
            },
            {
              line: '204',
              explanation: 'No Content — response không có body. Dùng sau DELETE thành công',
            },
            {
              line: '409',
              explanation: 'Conflict — thường dùng khi email/username đã tồn tại (duplicate key)',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          <strong>Dùng sai status code:</strong> Đừng return 200 cho mọi response rồi để client đọc
          body để biết lỗi. Status code là giao tiếp chuẩn — tools (Postman, monitoring) dựa vào nó.
        </Callout>
        <Callout type="note">
          <strong>401 vs 403:</strong> <code className="ic">401 Unauthorized</code> = chưa đăng
          nhập. <code className="ic">403 Forbidden</code> = đã đăng nhập nhưng không có quyền. Phân
          biệt rõ để client xử lý đúng.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Tạo CRUD routes cho /tasks: GET (200), POST (201), PUT /:id (200), DELETE /:id (204). Dùng array in-memory.',
            },
            {
              level: 'medium',
              text: 'Thêm validation: POST /tasks phải có title (string). Nếu thiếu → 400 Bad Request với message rõ ràng.',
            },
            {
              level: 'hard',
              text: 'Implement đầy đủ: 404 nếu task không tồn tại, 409 nếu tạo task với title đã có, 204 cho DELETE thành công.',
            },
          ]}
          hint='Array in-memory: const tasks: Task[] = []. Tìm task: tasks.find(t => t.id === id). 404: if (!task) res.status(404).json({ error: "Not found" })'
        />
      </Sec>
    </LessonCard>
  );
}
