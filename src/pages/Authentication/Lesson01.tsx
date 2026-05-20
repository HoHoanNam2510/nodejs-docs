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

const BASIC = `// HTTP là stateless — mỗi request độc lập, server không nhớ ai đang gửi
// => Cần cơ chế xác thực danh tính MỖI request

// ❌ Không có auth — ai cũng có thể gọi
app.delete('/posts/:id', async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ✅ Có auth middleware — kiểm tra trước khi xử lý
app.delete('/posts/:id', authenticate, async (req, res) => {
  // req.user đã được inject bởi authenticate middleware
  const post = await Post.findById(req.params.id);
  if (post?.author.toString() !== req.user!._id.toString()) {
    return res.status(403).json({ error: 'Không có quyền' });
  }
  await post!.deleteOne();
  res.json({ success: true });
});`;

const REAL = `// So sánh 3 cách authentication phổ biến:

// ===== 1. SESSION-BASED (truyền thống) =====
// - Server lưu session trong memory/DB (stateful)
// - Client nhận session ID trong cookie
// - Mỗi request: server lookup session ID → lấy user
// Vấn đề: không scale tốt (nhiều server phải share session store)

// ===== 2. JWT — JSON Web Token (stateless) =====
// - Server không lưu gì — token chứa toàn bộ info
// - Client lưu token (localStorage hoặc httpOnly cookie)
// - Mỗi request: server verify token signature → lấy payload
// Ưu điểm: stateless, scale tốt (nhiều server dùng chung secret key)
// Nhược điểm: không revoke được (phải đợi expiry hoặc dùng blacklist)

// Structure của JWT:
// header.payload.signature
// eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI2NjAifQ.abc123...
// ^-- base64(header) ---- ^-- base64(payload) -- ^-- HMAC signature

// ===== 3. REFRESH TOKEN PATTERN (best practice) =====
// Access token: ngắn hạn (15 phút) — dùng để gọi API
// Refresh token: dài hạn (7 ngày) — chỉ dùng để lấy access token mới
// Khi access token hết hạn: client dùng refresh token → nhận access token mới
// Có thể revoke refresh token (lưu trong DB hoặc Redis)`;

const MISTAKE = `// ❌ Sai lầm 1: Lưu password plaintext
await User.create({ email, password }); // CỰC KỲ NGUY HIỂM!
// Nếu DB bị breach, tất cả passwords bị lộ

// ✅ Luôn hash password với bcrypt
const hashed = await bcrypt.hash(password, 10);
await User.create({ email, password: hashed });

// ❌ Sai lầm 2: Lưu JWT trong localStorage
localStorage.setItem('token', token);
// Dễ bị XSS attack đọc token

// ✅ httpOnly cookie (không accessible từ JavaScript)
res.cookie('accessToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000, // 15 phút
});

// ❌ Sai lầm 3: JWT secret quá đơn giản hoặc hardcode
const token = jwt.sign(payload, 'secret'); // ai cũng đoán được!
// ✅ Secret phức tạp, từ environment variable
const token = jwt.sign(payload, process.env.JWT_SECRET!);`;

export default function Lesson01({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-06-01"
      num="01"
      title="Tại sao cần Authentication"
      desc="Stateless HTTP, session vs JWT vs refresh token — hiểu lý do trước khi code"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        HTTP là giao thức <strong>stateless</strong> — mỗi request hoàn toàn độc lập, server không
        biết request này đến từ ai nếu không có thông tin nhận dạng. Authentication (xác thực) là
        quá trình xác minh <em>"bạn là ai?"</em>, còn Authorization (phân quyền) là{' '}
        <em>"bạn được phép làm gì?"</em>. Hai khái niệm khác nhau nhưng thường đi cùng nhau.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Client gửi credentials (email + password) → POST /auth/login',
            'Server verify credentials → tạo token (JWT) hoặc session',
            'Client lưu token → gửi kèm mỗi request sau (header hoặc cookie)',
            'Server nhận request → verify token → biết user là ai → xử lý request',
            'Token hết hạn → client dùng refresh token để lấy access token mới',
            'Logout: xóa token ở client (và blacklist refresh token ở server nếu cần)',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: 'Cơ bản .ts', code: BASIC },
            { label: 'So sánh patterns .ts', code: REAL },
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
                'HTTP stateless: request A và request B hoàn toàn độc lập. Server không tự nhớ "request A đến từ user X". Phải tự nhúng thông tin user vào mỗi request — đó là nhiệm vụ của auth.',
            },
            {
              line: '2',
              explanation:
                'JWT = JSON Web Token. Gồm 3 phần base64-encoded: header (algorithm), payload (data), signature (HMAC). Server chỉ cần secret key để verify — không cần lưu gì. Stateless hoàn toàn.',
            },
            {
              line: '3',
              explanation:
                'Refresh token pattern: access token (15m) ngắn để giảm rủi ro nếu bị đánh cắp. Refresh token (7d) dài nhưng chỉ dùng tại endpoint /auth/refresh — giảm exposure. Kết hợp tốt nhất giữa security và UX.',
            },
            {
              line: '4',
              explanation:
                'httpOnly cookie: browser tự gửi kèm mỗi request, JavaScript không đọc được. Bảo vệ khỏi XSS. Kết hợp với sameSite: strict để chống CSRF. Đây là cách lưu token an toàn nhất cho web app.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Không bao giờ lưu password plaintext trong database. Dù DB có encryption, breach vẫn lộ
          passwords. Hash với bcrypt (cost factor 10+) trước khi lưu — không thể reverse hash, chỉ
          có thể compare.
        </Callout>
        <Callout type="note">
          <strong>Authentication vs Authorization</strong>: Auth(n) xác minh danh tính ("ai?") —
          Auth(z) kiểm tra quyền ("được làm gì?"). Middleware <code>authenticate</code> làm Auth(n),
          middleware <code>requireRole('admin')</code> làm Auth(z). Luôn authenticate trước rồi mới
          authorize.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Vẽ sơ đồ luồng: user login → nhận JWT → gọi API protected → API verify JWT → trả kết quả. Phân biệt access token và refresh token trong sơ đồ.',
            },
            {
              level: 'medium',
              text: 'So sánh session-based vs JWT: tạo bảng liệt kê ưu/nhược điểm của mỗi cách về: scale, revocation, storage, security, implementation complexity.',
            },
            {
              level: 'hard',
              text: 'Implement proof-of-concept: Express server với 2 routes — POST /login trả fake JWT, GET /protected verify JWT. Dùng jsonwebtoken. Mục tiêu: hiểu request cycle trước khi học chi tiết.',
            },
          ]}
          hint="JWT có 3 phần phân tách bằng dấu chấm. Dùng jwt.io để decode và xem payload của bất kỳ JWT nào (không cần secret key). Secret key chỉ cần để verify signature."
        />
      </Sec>
    </LessonCard>
  );
}
