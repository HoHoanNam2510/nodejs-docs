import { useState } from 'react';
import { Link } from 'react-router-dom';
import TocDots from '../components/TocDots';
import { useChecklist } from '../hooks/useChecklist';
import { getAllProgress } from '../hooks/useProgress';

// ── Constants ──────────────────────────────────────────────────────────────
const TOC_SECTIONS = [
  { id: 'hero', label: 'Đầu trang' },
  { id: 'why-ts', label: 'Tại sao TS?' },
  { id: 'roadmap', label: 'Lộ trình' },
  { id: 'knowledge', label: 'Kiến thức' },
  { id: 'progress', label: 'Tiến độ' },
  { id: 'setup', label: 'Setup' },
];

const MODULES = [
  {
    id: 'module_00',
    name: 'Trang chủ & Mục lục',
    to: '/',
    total: 0,
    priority: 'overview',
    time: '~30 phút',
    lessons: '',
    desc: 'Lộ trình tổng thể, danh sách kiến thức, setup môi trường.',
  },
  {
    id: 'module_01',
    name: 'Nền Tảng TypeScript & HTTP',
    to: '/01-nen-tang',
    total: 14,
    priority: 'high',
    time: '~4 giờ',
    lessons: '14 bài',
    desc: 'TS types, interfaces, generics, async/await typed, HTTP protocol, module system.',
  },
  {
    id: 'module_02',
    name: 'Express.js Core',
    to: '/02-express-core',
    total: 10,
    priority: 'high',
    time: '~3 giờ',
    lessons: '10 bài',
    desc: 'Routing typed, middleware, error handling, Request/Response types, Declaration Merging.',
  },
  {
    id: 'module_03',
    name: 'Express.js Nâng Cao',
    to: '/03-express-nangcao',
    total: 9,
    priority: 'medium',
    time: '~3.5 giờ',
    lessons: '9 bài',
    desc: 'Router, zod validation, multer, CORS, cấu trúc project chuẩn, AppError, asyncHandler.',
  },
  {
    id: 'module_04',
    name: 'MongoDB & Mongoose Core',
    to: '/04-mongodb-core',
    total: 12,
    priority: 'high',
    time: '~4 giờ',
    lessons: '12 bài',
    desc: 'Schema generics, typed CRUD, FilterQuery, populate typed, pagination generic.',
  },
  {
    id: 'module_05',
    name: 'MongoDB Nâng Cao',
    to: '/05-mongodb-nangcao',
    total: 8,
    priority: 'medium',
    time: '~3 giờ',
    lessons: '8 bài',
    desc: 'Indexes, Aggregation Pipeline typed, hooks với this type, virtuals, transactions.',
  },
  {
    id: 'module_06',
    name: 'Authentication & Security',
    to: '/06-authentication',
    total: 10,
    priority: 'high',
    time: '~4 giờ',
    lessons: '10 bài',
    desc: 'bcrypt, JWT typed payload, refresh token, RBAC, req.user typed, Helmet.',
  },
  {
    id: 'module_07',
    name: 'Social Blog API — Thực Chiến',
    to: '/07-thucchien',
    total: 8,
    priority: 'high',
    time: '~8 giờ',
    lessons: '8 bước',
    desc: 'Build đầy đủ: auth, posts, comments, likes, RBAC, deploy checklist — 100% TypeScript strict.',
  },
] as const;

// ── Checklist data ──────────────────────────────────────────────────────────
const HIGH_ITEMS = [
  {
    key: 'ck_ts_prim',
    label: <>TypeScript primitive types: string, number, boolean, void, unknown</>,
  },
  { key: 'ck_ts_iface', label: <>Object types &amp; Interfaces — định nghĩa shape</> },
  { key: 'ck_ts_union', label: <>Type aliases &amp; Union/Intersection types</> },
  {
    key: 'ck_ts_gen',
    label: (
      <>
        Generics cơ bản — <code className="ic">Array&lt;T&gt;</code>,{' '}
        <code className="ic">Promise&lt;T&gt;</code>
      </>
    ),
  },
  { key: 'ck_ts_cfg', label: <>tsconfig.json — strict, target, module, outDir</> },
  { key: 'ck_async', label: <>Callback, Promise, async/await — 3 cách xử lý bất đồng bộ</> },
  { key: 'ck_http', label: <>HTTP methods, status codes, request/response cycle</> },
  { key: 'ck_ex_setup', label: <>Cài Express + TypeScript, tsconfig cho project</> },
  {
    key: 'ck_ex_route',
    label: (
      <>
        Routing typed: <code className="ic">Request</code>, <code className="ic">Response</code>,{' '}
        <code className="ic">NextFunction</code>
      </>
    ),
  },
  {
    key: 'ck_ex_mw',
    label: (
      <>
        Middleware — <code className="ic">RequestHandler</code> type
      </>
    ),
  },
  {
    key: 'ck_ex_err',
    label: (
      <>
        Error handling middleware — <code className="ic">ErrorRequestHandler</code>
      </>
    ),
  },
  {
    key: 'ck_ex_decl',
    label: (
      <>
        Declaration Merging — mở rộng <code className="ic">req.user</code>
      </>
    ),
  },
  {
    key: 'ck_mg_schema',
    label: (
      <>
        Mongoose Schema generics — <code className="ic">Schema&lt;IUser&gt;</code>
      </>
    ),
  },
  {
    key: 'ck_mg_crud',
    label: (
      <>
        CRUD typed — <code className="ic">findById</code> trả{' '}
        <code className="ic">IUser | null</code>
      </>
    ),
  },
  {
    key: 'ck_mg_pop',
    label: (
      <>
        Populate typed — <code className="ic">populate&lt;{`{ author: IUser }`}&gt;()</code>
      </>
    ),
  },
  {
    key: 'ck_auth_jwt',
    label: (
      <>
        JWT typed payload — <code className="ic">JwtPayload</code> interface
      </>
    ),
  },
  { key: 'ck_auth_bcrypt', label: <>bcrypt hash &amp; compare</> },
];

const MEDIUM_ITEMS = [
  {
    key: 'ck_zod',
    label: (
      <>
        Zod validation — <code className="ic">z.infer&lt;typeof Schema&gt;</code>
      </>
    ),
  },
  { key: 'ck_router', label: <>Express Router — tách routes ra file riêng</> },
  { key: 'ck_struct', label: <>Cấu trúc thư mục TypeScript chuẩn (src/controllers, services…)</> },
  { key: 'ck_env', label: <>Environment variables — type-safe config object</> },
  {
    key: 'ck_apperr',
    label: (
      <>
        Custom <code className="ic">AppError</code> class &amp;{' '}
        <code className="ic">asyncHandler</code>
      </>
    ),
  },
  {
    key: 'ck_apires',
    label: (
      <>
        Generic response — <code className="ic">ApiResponse&lt;T&gt;</code>
      </>
    ),
  },
  {
    key: 'ck_multer',
    label: (
      <>
        File upload với multer + <code className="ic">@types/multer</code>
      </>
    ),
  },
  { key: 'ck_cors', label: <>CORS &amp; Helmet configuration</> },
  { key: 'ck_mg_idx', label: <>Mongoose indexes typed</> },
  {
    key: 'ck_agg',
    label: (
      <>
        Aggregation Pipeline — <code className="ic">PipelineStage[]</code>
      </>
    ),
  },
  {
    key: 'ck_hooks',
    label: (
      <>
        Mongoose hooks với <code className="ic">this</code> type
      </>
    ),
  },
  {
    key: 'ck_tx',
    label: (
      <>
        Transactions — <code className="ic">ClientSession</code>
      </>
    ),
  },
  {
    key: 'ck_rbac',
    label: (
      <>
        RBAC — <code className="ic">requireRole(...roles)</code> middleware
      </>
    ),
  },
  { key: 'ck_refresh', label: <>Refresh token + access token pattern</> },
  {
    key: 'ck_util',
    label: (
      <>
        Utility types — <code className="ic">Partial&lt;T&gt;</code>,{' '}
        <code className="ic">Pick&lt;T&gt;</code>, <code className="ic">Omit&lt;T&gt;</code>
      </>
    ),
  },
];

const LOW_ITEMS = [
  {
    key: 'ck_jest',
    label: (
      <>
        Jest + TypeScript — <code className="ic">@types/jest</code>,{' '}
        <code className="ic">ts-jest</code>
      </>
    ),
  },
  { key: 'ck_supertest', label: <>Integration test với Supertest</> },
  { key: 'ck_docker', label: <>Docker — multi-stage build (compile TS → run JS)</> },
  {
    key: 'ck_cicd',
    label: (
      <>
        CI/CD — GitHub Actions với bước <code className="ic">tsc --noEmit</code>
      </>
    ),
  },
  {
    key: 'ck_redis',
    label: (
      <>
        Caching với Redis — <code className="ic">ioredis</code>
      </>
    ),
  },
  { key: 'ck_winston', label: <>Logging với Winston</> },
  {
    key: 'ck_swagger',
    label: (
      <>
        Swagger/OpenAPI — <code className="ic">tsoa</code>
      </>
    ),
  },
  { key: 'ck_prisma', label: <>Prisma ORM — TypeScript-first alternative</> },
  { key: 'ck_nestjs', label: <>NestJS — enterprise TypeScript framework</> },
  { key: 'ck_fastify', label: <>Fastify với TypeScript</> },
  { key: 'ck_trpc', label: <>tRPC — type-safe API không cần REST</> },
  {
    key: 'ck_gql',
    label: (
      <>
        GraphQL với TypeScript — <code className="ic">type-graphql</code>
      </>
    ),
  },
];

// ── Setup accordion data ────────────────────────────────────────────────────
const SETUP_ITEMS = [
  {
    id: 'acc-node',
    title: '1. Node.js 18+ & npm',
    content: (
      <>
        <p>
          Download Node.js LTS từ <strong>nodejs.org</strong> (chọn version 18 trở lên).
        </p>
        <div className="pre-wrap-standalone" style={{ marginTop: 12 }}>
          <pre>{`# Kiểm tra version sau khi cài
node --version   # v18.x.x trở lên
npm --version    # 9.x.x trở lên`}</pre>
        </div>
      </>
    ),
  },
  {
    id: 'acc-vscode',
    title: '2. VS Code + Extensions',
    content: (
      <>
        <p>Cài VS Code và các extensions sau:</p>
        <div className="tools-row" style={{ marginTop: 12 }}>
          {[
            { color: '#3178c6', name: 'TypeScript + Webpack Problem Matchers' },
            { color: '#4b32c3', name: 'ESLint' },
            { color: '#f7ba3e', name: 'Prettier' },
            { color: '#a259ff', name: 'Thunder Client' },
            { color: '#13aa52', name: 'MongoDB for VS Code' },
          ].map(e => (
            <div key={e.name} className="tool-pill">
              <div className="tool-dot" style={{ background: e.color }} />
              {e.name}
            </div>
          ))}
        </div>
        <div className="lesson-note" style={{ marginTop: 12 }}>
          <strong>Tip:</strong> Bật <code className="ic">"editor.formatOnSave": true</code> trong VS
          Code settings để Prettier auto-format khi save.
        </div>
      </>
    ),
  },
  {
    id: 'acc-mongo',
    title: '3. MongoDB Atlas (free tier)',
    content: (
      <>
        <p>
          Đăng ký tại <strong>mongodb.com/atlas</strong> → tạo cluster M0 (free).
        </p>
        <div className="pre-wrap-standalone" style={{ marginTop: 12 }}>
          <pre>{`# Connection string dạng:
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/mydb`}</pre>
        </div>
        <div className="lesson-warn" style={{ marginTop: 10 }}>
          <strong>Lưu ý:</strong> Nhớ whitelist IP <code className="ic">0.0.0.0/0</code> trong
          Network Access khi học. Production thì chỉ cho IP cụ thể.
        </div>
      </>
    ),
  },
  {
    id: 'acc-init',
    title: '4. Khởi tạo TypeScript project',
    content: (
      <>
        <div className="pre-wrap-standalone">
          <pre>{`# Tạo thư mục và khởi tạo npm
mkdir my-api && cd my-api
npm init -y

# Cài dependencies
npm install express mongoose bcryptjs jsonwebtoken dotenv zod cors helmet express-rate-limit

# Cài devDependencies
npm install -D typescript ts-node tsx @types/node @types/express @types/bcryptjs @types/jsonwebtoken @types/cors

# Tạo tsconfig.json
npx tsc --init`}</pre>
        </div>
        <p style={{ marginTop: 12, fontSize: 13, color: 'var(--text2)' }}>
          Scripts trong <code className="ic">package.json</code>:
        </p>
        <div className="pre-wrap-standalone" style={{ marginTop: 8 }}>
          <pre>{`"scripts": {
  "dev":   "tsx watch src/index.ts",
  "build": "tsc",
  "start": "node dist/index.js",
  "check": "tsc --noEmit"
}`}</pre>
        </div>
      </>
    ),
  },
  {
    id: 'acc-hello',
    title: '5. Hello World TypeScript — kiểm tra setup',
    content: (
      <>
        <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 10 }}>
          Tạo <code className="ic">src/index.ts</code>:
        </p>
        <div className="pre-wrap-standalone">
          <pre>{`import express, { Express, Request, Response } from 'express';

const app: Express = express();
const PORT = Number(process.env.PORT) || 3000;

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Hello TypeScript + Express!' });
});

app.listen(PORT, () => {
  console.log(\`Server running at http://localhost:\${PORT}\`);
});`}</pre>
        </div>
        <div className="pre-wrap-standalone" style={{ marginTop: 8 }}>
          <pre>{'npm run dev   # tsx watch tự reload khi sửa file'}</pre>
        </div>
        <div className="lesson-note" style={{ marginTop: 10 }}>
          <strong>✅ Thành công!</strong> Mở <code className="ic">http://localhost:3000</code> —
          thấy JSON là setup OK, sẵn sàng bắt đầu Module 01.
        </div>
      </>
    ),
  },
];

// ── Priority badge class helper ─────────────────────────────────────────────
function priorityBadge(p: string) {
  if (p === 'high') return 'badge badge-high';
  if (p === 'medium') return 'badge badge-medium';
  if (p === 'low' || p === 'overview') return 'badge badge-low';
  return 'badge badge-low';
}
function priorityLabel(p: string) {
  if (p === 'high') return 'HIGH';
  if (p === 'medium') return 'MEDIUM';
  if (p === 'overview') return 'Tổng quan';
  return 'LOW';
}

// ── Component ───────────────────────────────────────────────────────────────
export default function Index() {
  const { checked, toggle } = useChecklist();
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const progressData = getAllProgress(
    MODULES.filter(m => m.total > 0).map(m => ({ id: m.id, total: m.total }))
  );
  const progressMap = Object.fromEntries(progressData.map(p => [p.id, p]));

  return (
    <>
      <TocDots sections={TOC_SECTIONS} />

      {/* ── HERO ── */}
      <section className="hero" id="hero">
        <div className="hero-bg" />
        <div className="grid-overlay" />
        <div className="hero-inner">
          <div className="hero-badge">
            <span className="dot" />
            Dành cho junior/fresher backend — từ zero đến production-ready
          </div>
          <h1>
            Xây dựng Backend
            <br />
            với <span className="hl-ts">TypeScript</span>,<br />
            <span className="hl-ex">Express</span> &amp; <span className="hl-mg">MongoDB</span>
          </h1>
          <p className="hero-sub">
            Học đúng cách ngay từ đầu — typed Mongoose, zod validation, JWT auth, RBAC và best
            practices thực tế mà JD tuyển dụng 2025 yêu cầu.
          </p>
          <div className="hero-stats">
            {[
              { num: '8', label: 'Modules' },
              { num: '65+', label: 'Bài học' },
              { num: '~30h', label: 'Thời gian' },
              { num: '100%', label: 'TypeScript' },
            ].map(s => (
              <div key={s.label} className="hero-stat">
                <span className="hero-stat-num">{s.num}</span>
                <span className="hero-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="hero-cta">
            <Link to="/01-nen-tang" className="btn-primary">
              Bắt đầu học →
            </Link>
            <a
              href="#roadmap"
              className="btn-secondary"
              onClick={e => {
                e.preventDefault();
                document.getElementById('roadmap')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Xem lộ trình
            </a>
          </div>
        </div>
      </section>

      {/* ── TẠI SAO TYPESCRIPT ── */}
      <div className="section-alt" id="why-ts">
        <div className="section-inner">
          <span className="section-tag">Lý do chọn TypeScript</span>
          <h2 className="section-title">Tại sao TypeScript, không phải JavaScript?</h2>
          <p className="section-sub">5 lý do thực tế — không phải lý thuyết</p>
          <div className="why-ts-grid">
            {[
              {
                icon: '💼',
                title: 'Thị trường yêu cầu',
                desc: 'Đa số JD tuyển Node.js junior/fresher 2024–2025 đều ghi "TypeScript preferred" hoặc bắt buộc. Học TS ngay = lợi thế khi xin việc.',
              },
              {
                icon: '🎯',
                title: 'Học đúng ngay từ đầu',
                desc: 'Dễ hơn học JS rồi "nghĩ lại". TypeScript buộc bạn hiểu rõ shape của data trước khi dùng — thói quen tốt ngay từ bài đầu tiên.',
              },
              {
                icon: '⚡',
                title: 'Express + TS = chuẩn công ty',
                desc: (
                  <>
                    Cặp đôi <code className="ic">express</code> +{' '}
                    <code className="ic">@types/express</code> + <code className="ic">ts-node</code>{' '}
                    là setup chuẩn của đa số công ty.
                  </>
                ),
              },
              {
                icon: '🦾',
                title: 'Mongoose có full TS support',
                desc: (
                  <>
                    Mongoose v6+ có TypeScript generics đầy đủ.{' '}
                    <code className="ic">Schema&lt;IUser&gt;</code>,{' '}
                    <code className="ic">Model&lt;IUser&gt;</code> — không cần thư viện thêm.
                  </>
                ),
              },
              {
                icon: '🐛',
                title: 'Debug sớm hơn',
                desc: 'Type error báo lúc compile, không đợi đến runtime mới crash production. Tiết kiệm hàng giờ debug mỗi tuần.',
              },
            ].map(card => (
              <div key={card.title} className="why-ts-card">
                <span className="why-ts-icon">{card.icon}</span>
                <div className="why-ts-title">{card.title}</div>
                <div className="why-ts-desc">{card.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── LỘ TRÌNH ── */}
      <section className="section" id="roadmap">
        <span className="section-tag">Lộ trình học</span>
        <h2 className="section-title">8 modules — từ TypeScript cơ bản đến Social Blog API</h2>
        <p className="section-sub">
          Mỗi module xây dựng trên kiến thức của module trước. Project cuối mỗi module giúp củng cố
          ngay.
        </p>
        <div className="module-grid">
          {MODULES.map((m, i) => (
            <Link
              key={m.id}
              to={m.to}
              className="module-card"
              style={
                i === 0
                  ? { borderColor: 'var(--border2)' }
                  : i === 7
                    ? { borderColor: 'rgba(74,222,128,0.2)', background: 'rgba(74,222,128,0.015)' }
                    : {}
              }
            >
              <div className="module-card-num">
                <span>Module 0{i}</span>
                <span className={priorityBadge(m.priority)}>{priorityLabel(m.priority)}</span>
              </div>
              <div className="module-card-title">{m.name}</div>
              <div className="module-card-desc">{m.desc}</div>
              <div className="module-card-meta">
                <span className="module-card-stat">⏱ {m.time}</span>
                {m.lessons && <span className="module-card-stat">📚 {m.lessons}</span>}
                <span className="badge badge-ts">TS</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── KIẾN THỨC ── */}
      <div className="section-alt" id="knowledge">
        <div className="section-inner">
          <span className="section-tag">Kiến thức cần nắm</span>
          <h2 className="section-title">Danh sách kiến thức</h2>
          <p className="section-sub">Tick vào khi bạn đã nắm vững — lưu tự động vào trình duyệt</p>
          <div className="checklist-grid">
            {/* HIGH */}
            <div>
              <div className="checklist-col-title">
                <span className="badge badge-high">HIGH</span> Kiến thức cốt lõi
              </div>
              {HIGH_ITEMS.map(item => (
                <div key={item.key} className={`checklist-item${checked[item.key] ? ' done' : ''}`}>
                  <input
                    type="checkbox"
                    checked={!!checked[item.key]}
                    onChange={() => toggle(item.key)}
                  />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            {/* MEDIUM */}
            <div>
              <div className="checklist-col-title">
                <span className="badge badge-medium">MEDIUM</span> Kiến thức cần biết
              </div>
              {MEDIUM_ITEMS.map(item => (
                <div key={item.key} className={`checklist-item${checked[item.key] ? ' done' : ''}`}>
                  <input
                    type="checkbox"
                    checked={!!checked[item.key]}
                    onChange={() => toggle(item.key)}
                  />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            {/* LOW */}
            <div>
              <div className="checklist-col-title">
                <span className="badge badge-low">LOW</span> Kiến thức nên biết
              </div>
              {LOW_ITEMS.map(item => (
                <div key={item.key} className={`checklist-item${checked[item.key] ? ' done' : ''}`}>
                  <input
                    type="checkbox"
                    checked={!!checked[item.key]}
                    onChange={() => toggle(item.key)}
                  />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── TIẾN ĐỘ ── */}
      <section className="section" id="progress">
        <span className="section-tag">Theo dõi học tập</span>
        <h2 className="section-title">Tiến độ học</h2>
        <p className="section-sub">
          Tổng hợp từ localStorage — tự động cập nhật khi bạn hoàn thành bài
        </p>
        <div className="progress-overview-grid">
          {MODULES.filter(m => m.total > 0).map(m => {
            const prog = progressMap[m.id] || { done: 0, pct: 0 };
            return (
              <Link
                key={m.id}
                to={m.to}
                className="progress-module-item"
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div className="progress-module-name">{m.name}</div>
                <div className="progress-bar-wrap-sm">
                  <div className="progress-bar-fill-sm" style={{ width: `${prog.pct}%` }} />
                </div>
                <div className="progress-module-count">
                  {prog.done}/{m.total} bài · {prog.pct}%
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── SETUP ── */}
      <div className="section-alt" id="setup">
        <div className="section-inner">
          <span className="section-tag">Chuẩn bị</span>
          <h2 className="section-title">Setup môi trường</h2>
          <p className="section-sub">Làm một lần trước khi bắt đầu học — mất khoảng 15–20 phút</p>
          {SETUP_ITEMS.map(item => (
            <div
              key={item.id}
              className={`accordion-item${openAccordion === item.id ? ' open' : ''}`}
            >
              <div
                className="accordion-header"
                onClick={() => setOpenAccordion(prev => (prev === item.id ? null : item.id))}
              >
                <span>{item.title}</span>
                <span className="accordion-chevron">▼</span>
              </div>
              {openAccordion === item.id && <div className="accordion-body">{item.content}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer
        style={{ borderTop: '1px solid var(--border)', padding: '2rem', textAlign: 'center' }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text3)',
            marginBottom: '0.4rem',
          }}
        >
          Express.js + MongoDB · TypeScript Edition · Module 0/7
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)' }}>
          Được xây dựng để học thực tế — không phải để đọc cho vui
        </div>
      </footer>
    </>
  );
}
