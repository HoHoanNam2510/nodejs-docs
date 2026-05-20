import CodeBlock from '../../components/CodeBlock';
import Callout from '../../components/Callout';

const FULL_APP_TS = `// src/app.ts — full middleware stack
import express       from 'express';
import helmet        from 'helmet';
import cors          from 'cors';
import rateLimit     from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser  from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler';
import { authRouter }   from './routes/auth.routes';
import { postRouter }   from './routes/post.routes';
import { adminRouter }  from './routes/admin.routes';
import config           from './config/env';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true }));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth',  authRouter);
app.use('/api/posts', postRouter);
app.use('/api/admin', adminRouter);

app.use((_req, res) => res.status(404).json({ success: false, error: 'Route không tồn tại' }));
app.use(errorHandler);

export default app;`;

const FULL_INDEX_TS = `// src/index.ts — server entry point
import mongoose from 'mongoose';
import app      from './app';
import config   from './config/env';

async function main() {
  await mongoose.connect(config.mongoUri);
  console.log('MongoDB connected');

  app.listen(config.port, () => {
    console.log(\`Server [\${config.nodeEnv}] → http://localhost:\${config.port}\`);
  });
}

main().catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});`;

const API_ENDPOINTS = `# Social Blog API — Full Endpoint List

# --- Auth ---
POST   /api/auth/register    # đăng ký
POST   /api/auth/login       # đăng nhập → access + refresh token
POST   /api/auth/refresh     # cấp access token mới từ refresh cookie
POST   /api/auth/logout      # clear refresh cookie
GET    /api/auth/me          # 🔒 profile của mình

# --- Posts ---
GET    /api/posts            # feed công khai (pagination + filter tag/author)
GET    /api/posts/:slug      # chi tiết bài (tăng viewCount)
POST   /api/posts            # 🔒 tạo bài mới
PATCH  /api/posts/:id        # 🔒 sửa bài (chỉ author hoặc admin)
DELETE /api/posts/:id        # 🔒 xóa bài (chỉ author hoặc admin)

# --- Comments (nested under post) ---
GET    /api/posts/:postId/comments          # danh sách top-level comments
POST   /api/posts/:postId/comments          # 🔒 thêm comment (có thể reply)
DELETE /api/posts/:postId/comments/:id      # 🔒 xóa (author/post-author/admin)

# --- Likes ---
GET    /api/posts/:postId/like   # 🔒 kiểm tra đã like chưa
POST   /api/posts/:postId/like   # 🔒 toggle like/unlike

# --- Admin (🔒🔑 admin only) ---
GET    /api/admin/stats           # tổng quan: users, posts, comments
GET    /api/admin/users           # danh sách users + search
PATCH  /api/admin/users/:id/ban   # ban/unban user
DELETE /api/admin/posts/:id       # xóa post + cascade
DELETE /api/admin/posts/bulk      # bulk delete (max 100)`;

export default function ProjectSection() {
  return (
    <div style={{ marginTop: '3rem' }}>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text3)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '1rem',
          paddingBottom: 8,
          borderBottom: '1px solid var(--border)',
        }}
      >
        Social Blog API — Full Build
      </div>

      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              background: '#f8717115',
              color: '#f87171',
              border: '1px solid #f8717130',
              borderRadius: 4,
              padding: '2px 8px',
            }}
          >
            HIGH
          </div>
          <h3 style={{ margin: 0, fontSize: '1.05rem' }}>Social Blog API — TypeScript Strict</h3>
        </div>

        <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.6, marginBottom: '1.5rem' }}>
          Project tổng hợp toàn bộ Module 01–07: TypeScript strict, Express, MongoDB, JWT auth,
          RBAC, zod validation, generic pagination, nested resources, error handling chuẩn. Đây là
          blueprint cho REST API production-ready.
        </p>

        {/* Feature grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 10,
            marginBottom: '1.5rem',
          }}
        >
          {[
            { label: 'Auth', desc: 'register/login/refresh/logout, JWT pair, httpOnly cookie' },
            { label: 'Posts', desc: 'CRUD + slug + pagination + filter tag/author + viewCount' },
            { label: 'Comments', desc: 'threaded (parentId), nested routes, 3-level delete auth' },
            { label: 'Likes', desc: 'toggle pattern, compound unique index, denormalized count' },
            { label: 'Admin', desc: 'RBAC, ban/unban, cascade delete, bulk ops, system stats' },
            { label: 'TypeScript', desc: 'strict mode, generics, no any, tsc --noEmit clean' },
          ].map(item => (
            <div
              key={item.label}
              style={{
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '0.75rem 1rem',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--accent)',
                  marginBottom: 4,
                  fontWeight: 600,
                }}
              >
                {item.label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Code sections */}
        {[
          { title: 'app.ts — Full middleware stack', code: FULL_APP_TS },
          { title: 'index.ts — Server entry', code: FULL_INDEX_TS },
          { title: 'API Endpoints — Full list', code: API_ENDPOINTS },
        ].map(({ title, code }) => (
          <div key={title} style={{ marginBottom: '1.25rem' }}>
            <div
              style={{
                fontSize: 11,
                color: 'var(--text3)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '0.5rem',
              }}
            >
              {title}
            </div>
            <CodeBlock code={code} />
          </div>
        ))}

        {/* TypeScript checklist */}
        <div style={{ marginTop: '1.25rem' }}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text3)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.75rem',
            }}
          >
            Pre-deploy TypeScript Checklist
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {[
              'tsc --noEmit → 0 errors',
              'Không có any type trong production code',
              'Tất cả req.body đều qua zod parse',
              'Không lộ stack trace (NODE_ENV check)',
              '.env không commit, có .env.example',
              'Rate limiting trên auth endpoints (max 10)',
              'Helmet() bật với default config',
            ].map(item => (
              <div
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 8,
                  padding: '6px 10px',
                  background: 'var(--bg3)',
                  borderRadius: 5,
                  border: '1px solid var(--border)',
                  fontSize: 12,
                  color: 'var(--text2)',
                  lineHeight: 1.4,
                }}
              >
                <span style={{ color: 'var(--accent)', flexShrink: 0 }}>□</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '1.25rem' }}>
          <Callout type="note">
            <strong>Architecture tổng kết:</strong> Types → Models → Utils (AppError, asyncHandler,
            jwt, response) → Middleware (authenticate, requireRole) → Controllers → Routes → App.
            Layer dưới không import layer trên — giữ dependency flow một chiều. Testing: từng layer
            có thể test độc lập với mock cho layer dưới.
          </Callout>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text3)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.5rem',
            }}
          >
            Mở rộng (tự build thêm)
          </div>
          <ul
            style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.8, paddingLeft: '1.2rem' }}
          >
            <li>Upload avatar với Multer + Cloudinary (hoặc S3) — typed file handling</li>
            <li>Follow/unfollow users — M:N relationship, follower feed</li>
            <li>Search posts bằng MongoDB text index — full-text search</li>
            <li>Notifications: tạo notification khi có like/comment — realtime với Socket.io</li>
            <li>Jest + Supertest integration tests — test auth flow end-to-end</li>
            <li>Docker compose: api + mongodb — một lệnh chạy cả stack</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
