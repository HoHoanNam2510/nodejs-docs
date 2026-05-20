# SPEC: Bộ Tài Liệu Học Tập Express.js + MongoDB (TypeScript Edition)

> Tài liệu định nghĩa đầy đủ cho Agent AI để build — không cần plan thêm.
> Version 2.0 — TypeScript Edition

---

## GHI CHÚ VỀ QUYẾT ĐỊNH DÙNG TYPESCRIPT

### Phạm vi áp dụng TypeScript

Bộ tài liệu này dạy **TypeScript + Express + MongoDB** từ đầu — không phải "học JS rồi migrate sang TS".

| Thành phần                    | Ngôn ngữ           | Lý do                                                                          |
| ----------------------------- | ------------------ | ------------------------------------------------------------------------------ |
| **Code ví dụ trong bài học**  | TypeScript (`.ts`) | Nội dung chính đang dạy                                                        |
| **Project cuối module**       | TypeScript         | Thực hành đúng với nội dung học                                                |
| **UI logic của HTML page**    | Vanilla JS         | Progress tracking, accordion, tabs — UI trang web, không liên quan đến bài học |
| **HTML/CSS của landing page** | HTML + CSS         | Không thay đổi                                                                 |

### Tại sao TypeScript, không phải JavaScript?

1. **Thực tế thị trường**: Hầu hết JD tuyển dụng Node.js junior/fresher 2024–2025 đều ghi "TypeScript preferred" hoặc bắt buộc
2. **Học đúng ngay từ đầu**: Dễ hơn học JS rồi "nghĩ lại" — TS buộc bạn hiểu rõ shape của data trước khi dùng
3. **Express + TS rất phổ biến**: Cặp đôi `express` + `@types/express` + `ts-node` là setup chuẩn của đa số công ty
4. **Type-safe Mongoose**: `mongoose` có TS generics đầy đủ từ v6+ — không cần thư viện thêm
5. **Dễ debug hơn JS**: Type error báo lúc compile, không đợi đến runtime mới crash

### Thêm vào Module 01 — Kiến thức TS bắt buộc biết (HIGH)

Module 01 "Nền tảng" cần bổ sung một nhóm bài TS cơ bản **trước khi** học Express:

```
01-nen-tang.html sẽ có thêm nhóm bài:
  - TypeScript là gì, tại sao dùng
  - Primitive types: string, number, boolean, null, undefined
  - Object types và interfaces
  - Type aliases và union types
  - Generics cơ bản (đủ để đọc được Express types)
  - tsconfig.json — các options quan trọng
  - Compile & run: tsc, ts-node, tsx
```

---

## 1. ĐÁNH GIÁ FILE HIỆN TẠI (`expressjs-mongodb-course.html`)

### ✅ Điểm tốt cần giữ lại

- **Color system**: Dark theme với CSS variables (`--bg`, `--accent`, `--mongo`...) — xuyên suốt, nhất quán
- **UI Components**: lesson-card accordion, code-tabs, pre-wrapper + copy button, explain-grid, lesson-note/warn callouts, toc-dots sidebar
- **Code syntax highlighting**: Inline span classes (`.kw`, `.fn`, `.str`, `.cm`...) — hiệu quả, không cần thư viện ngoài
- **Animations**: `fadeUp` staggered hero, pulse dot — nhẹ và đúng chỗ
- **Nav**: Fixed + backdrop-filter + logo pattern

### ❌ Vấn đề cần sửa

| Vấn đề                         | Mô tả                                                        | Cách sửa                                                                               |
| ------------------------------ | ------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| **Dùng JavaScript thuần**      | Code ví dụ không có types, không phản ánh thực tế thị trường | Viết lại toàn bộ code ví dụ bằng TypeScript                                            |
| **Thiếu kiến thức TS**         | Không có bài nào giải thích types, interfaces, generics      | Thêm nhóm bài TypeScript cơ bản vào Module 01                                          |
| **Font tiếng Việt**            | `DM Sans` + `Syne` không tối ưu cho dấu tiếng Việt           | Đổi sang `IBM Plex Sans` (body) + `Be Vietnam Pro` (heading) + `JetBrains Mono` (code) |
| **Nav không link giữa files**  | Nav chỉ có anchor links nội bộ                               | Nav phải link đủ 8 modules                                                             |
| **Nội dung quá mỏng**          | Thiếu luồng hoạt động, bài tập, phân cấp ưu tiên             | Thêm sections theo layout spec bên dưới                                                |
| **Không có bài tập**           | Chỉ có code example                                          | Thêm 3 cấp bài tập + hint toggle                                                       |
| **Không có progress tracking** | Không biết đang học đến đâu                                  | localStorage-based progress                                                            |

---

## 2. DANH SÁCH KIẾN THỨC ĐẦY ĐỦ

### 🔴 HIGH — Kiến thức cốt lõi bắt buộc

#### Nền tảng JavaScript/TypeScript (prerequisite)

- [ ] Callback, Promise, async/await — 3 cách xử lý bất đồng bộ
- [ ] try/catch/finally — xử lý lỗi
- [ ] Destructuring, spread operator, optional chaining
- [ ] Module system: `import`/`export` (ESM — chuẩn dùng với TS)
- [ ] Arrow functions, closure, `this` context
- [ ] **TypeScript: Primitive types** — `string`, `number`, `boolean`, `null`, `undefined`, `void`
- [ ] **TypeScript: Object types & Interfaces** — định nghĩa shape của object
- [ ] **TypeScript: Type aliases & Union types** — `type`, `|`, `&`
- [ ] **TypeScript: Generics cơ bản** — `Array<T>`, `Promise<T>`, đủ để đọc Express types
- [ ] **TypeScript: `tsconfig.json`** — `strict`, `target`, `module`, `outDir`, `rootDir`
- [ ] **TypeScript: Compile & run** — `tsc`, `ts-node`, `tsx` (dev), build scripts

#### HTTP & API cơ bản

- [ ] HTTP protocol: request/response cycle
- [ ] HTTP methods: GET, POST, PUT, PATCH, DELETE
- [ ] HTTP status codes: 2xx, 4xx, 5xx và ý nghĩa
- [ ] Headers: Content-Type, Authorization, CORS headers
- [ ] REST API design principles: resource naming, URL structure

#### Express.js Core (TypeScript)

- [ ] Cài đặt: `express`, `@types/express`, `typescript`, `ts-node`
- [ ] Khởi tạo app với types: `Express`, `Request`, `Response`, `NextFunction`
- [ ] Routing: `app.get/post/put/delete` với typed request/response
- [ ] Route parameters — `req.params` với type assertion
- [ ] Query string — `req.query` và cách type đúng
- [ ] Request body — `req.body` với interface định nghĩa shape
- [ ] Middleware với TypeScript: `RequestHandler` type
- [ ] Error handling middleware: `ErrorRequestHandler` type — 4 tham số
- [ ] Express Router: `Router` type, tách routes ra file riêng
- [ ] Mở rộng `Request` interface: thêm `req.user` bằng Declaration Merging

#### MongoDB & Mongoose Core (TypeScript)

- [ ] Mongoose với TypeScript: Schema generics `Schema<IUser>`
- [ ] Interface cho Document: `IUser`, `IPost` — định nghĩa shape
- [ ] Model typing: `Model<IUser>`, return type của các queries
- [ ] CRUD với typed results: `findById` trả `IUser | null`
- [ ] Query operators với TypeScript — `FilterQuery<T>`
- [ ] Sort, limit, skip — pagination đúng cách
- [ ] Populate với TypeScript: `PopulatedDoc`, nested types
- [ ] Timestamps: `createdAt`, `updatedAt` — thêm vào interface

#### Authentication cơ bản (TypeScript)

- [ ] bcrypt với `@types/bcryptjs`
- [ ] JWT với `jsonwebtoken` — type-safe payload interface
- [ ] Auth middleware: extend `Request` để có `req.user: IUser`
- [ ] `httpOnly` cookie vs `Authorization` header — trade-offs

---

### 🟡 MEDIUM — Kiến thức cần biết

#### Express.js nâng cao (TypeScript)

- [ ] Input validation với `express-validator` + TypeScript
- [ ] File upload với `multer` + `@types/multer` — `req.file` typing
- [ ] CORS configuration với `cors` + `@types/cors`
- [ ] Rate limiting với `express-rate-limit`
- [ ] Helmet — `helmet()` không cần `@types` (bundled)
- [ ] Cấu trúc thư mục project chuẩn với TS: `src/controllers`, `src/services`, `src/routes`, `src/models`, `src/middleware`, `src/config`, `src/types`
- [ ] Environment variables: `dotenv` + type-safe config object
- [ ] Custom error class: `class AppError extends Error`
- [ ] `zod` hoặc `class-validator` — runtime validation + type inference

#### MongoDB nâng cao (TypeScript)

- [ ] Indexes với Mongoose TypeScript
- [ ] Aggregation Pipeline: `PipelineStage[]` type
- [ ] Transactions với TypeScript: `ClientSession` type
- [ ] Schema design patterns: embedded vs reference — type implications
- [ ] Mongoose pre/post hooks với TS: `this` type trong hooks
- [ ] Mongoose virtuals và methods — cách type đúng

#### Security

- [ ] Refresh token + access token flow — typed payload
- [ ] RBAC: `role` field trong User interface, middleware `requireRole()`
- [ ] Input sanitization: `express-mongo-sanitize`
- [ ] Không lộ stack trace — `NODE_ENV` check

#### Code quality (TypeScript-specific)

- [ ] Naming conventions: interfaces `I` prefix (hoặc không — chọn 1 convention và giữ nhất quán)
- [ ] `type` vs `interface` — khi nào dùng cái nào
- [ ] Strict mode: tại sao bật `strict: true` và xử lý các lỗi phổ biến
- [ ] Generic utility types: `Partial<T>`, `Pick<T>`, `Omit<T>`, `Required<T>`
- [ ] Async error handling: wrapper function `asyncHandler`
- [ ] Response format chuẩn: `ApiResponse<T>` generic interface

---

### 🟢 LOW — Kiến thức nên biết (tương lai)

#### Testing (TypeScript)

- [ ] Jest với TypeScript: `@types/jest`, `ts-jest`
- [ ] Integration test với Supertest: `@types/supertest`
- [ ] Typed mocks: `jest.mocked()`, mock Mongoose models
- [ ] Test coverage với `--coverage`

#### DevOps cơ bản

- [ ] Docker: Dockerfile với multi-stage build (compile TS → chạy JS)
- [ ] CI/CD với GitHub Actions — bước `tsc --noEmit` để type-check
- [ ] Deploy lên Railway / Render: cấu hình build command `tsc`
- [ ] Environment management: dev/staging/production

#### Performance & Scale

- [ ] Caching với Redis: `ioredis` (có TypeScript support tốt hơn `redis` package)
- [ ] Logging với Winston + `winston-transport` types
- [ ] Swagger/OpenAPI: `swagger-ui-express` + `tsoa` (tự generate từ TS decorators)
- [ ] API versioning (`/api/v1/...`)

#### New tech stack liên quan

- [ ] Prisma ORM — TypeScript-first ORM, alternative cho Mongoose với SQL
- [ ] NestJS — framework TypeScript-first, kiến trúc enterprise
- [ ] Fastify với TypeScript — nhanh hơn Express, TS support tốt hơn
- [ ] tRPC — type-safe API không cần REST (full-stack TS)
- [ ] GraphQL với TypeScript: `type-graphql` hoặc `pothos`

---

## 3. KIẾN TRÚC BỘ TÀI LIỆU

### Tech Stack — React + TypeScript + Vite

| Lớp         | Công nghệ                    | Lý do                                                                          |
| ----------- | ---------------------------- | ------------------------------------------------------------------------------ |
| **UI**      | React 18 + TypeScript        | Component reuse — Nav, LessonCard, CodeBlock, Badge không duplicate 8 lần      |
| **Routing** | React Router v6              | `<Link to="/01-nen-tang">` thay anchor href, active link tự động               |
| **Build**   | Vite                         | HMR nhanh khi viết nội dung, `npm run build` ra static files deploy được       |
| **CSS**     | `shared.css` (giữ nguyên)    | Import 1 lần trong `main.tsx`, tất cả pages dùng chung — không thay đổi CSS    |
| **State**   | React Context + localStorage | `useProgress` hook thay thế localStorage spaghetti rải rắc trong mỗi file HTML |

### Cấu trúc project

```
nodejs-docs/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/               ← Reusable UI components
│   │   ├── Nav.tsx               ← Fixed top nav, active link tự động theo route
│   │   ├── TocDots.tsx           ← Right-side section nav dots
│   │   ├── PageHeader.tsx        ← Compact ~40vh header cho trang 01–07
│   │   ├── TocBar.tsx            ← Sticky progress + anchor links bar
│   │   ├── LessonCard.tsx        ← Accordion lesson (header + body)
│   │   ├── CodeBlock.tsx         ← <pre> + copy button + syntax spans
│   │   ├── CodeTabs.tsx          ← Tab switcher (Cơ bản / Thực tế / Sai lầm / JS→TS)
│   │   ├── Badge.tsx             ← HIGH / MEDIUM / LOW / TS badges
│   │   ├── Callout.tsx           ← lesson-note (green) + lesson-warn (yellow)
│   │   ├── ExerciseSection.tsx   ← 3-level exercises + hint toggle
│   │   ├── LineTable.tsx         ← Line-by-line explanation table
│   │   ├── ModuleFooter.tsx      ← Prev/Next module navigation
│   │   └── ProgressBar.tsx       ← Progress bar + text
│   ├── pages/                    ← 8 trang nội dung (mỗi module = 1 folder)
│   │   ├── Index.tsx             ← Module 00: trang chủ & mục lục (single file)
│   │   ├── NenTang/              ← Module 01: TypeScript cơ bản & HTTP ✅
│   │   │   ├── index.tsx         ← orchestrator: PageHeader + TocBar + Lessons + Footer
│   │   │   ├── _helpers.tsx      ← Sec, Flow — helper components nội bộ
│   │   │   ├── _toc.ts           ← TOC_LINKS array
│   │   │   ├── Lesson01.tsx      ← mỗi lesson 1 file (~80–130 lines)
│   │   │   ├── Lesson02.tsx
│   │   │   ├── ...
│   │   │   ├── Lesson14.tsx
│   │   │   └── ProjectSection.tsx← project cuối module
│   │   ├── ExpressCore/          ← Module 02: Express.js Core
│   │   │   ├── index.tsx
│   │   │   ├── _helpers.tsx
│   │   │   ├── _toc.ts
│   │   │   ├── Lesson01.tsx – Lesson10.tsx
│   │   │   └── ProjectSection.tsx
│   │   ├── ExpressNangCao/       ← Module 03: Express.js Nâng Cao
│   │   │   └── (cùng cấu trúc, 9 lessons)
│   │   ├── MongoDBCore/          ← Module 04: MongoDB & Mongoose Core
│   │   │   └── (cùng cấu trúc, 12 lessons)
│   │   ├── MongoDBNangCao/       ← Module 05: MongoDB Nâng Cao
│   │   │   └── (cùng cấu trúc, 8 lessons)
│   │   ├── Authentication/       ← Module 06: Auth & Security
│   │   │   └── (cùng cấu trúc, 10 lessons)
│   │   └── ThucChien/            ← Module 07: Social Blog API Thực Chiến
│   │       └── (cùng cấu trúc, 8 bước)
│   ├── hooks/
│   │   ├── useProgress.ts        ← localStorage progress per module
│   │   ├── useChecklist.ts       ← localStorage knowledge checklist (trang 00)
│   │   └── useTocDots.ts         ← scroll → active dot tracking
│   ├── utils/
│   │   └── highlight.ts          ← tokenizer: tự động syntax-highlight code TS/JS/JSON
│   ├── types/
│   │   └── index.ts              ← shared types (Module, Lesson, Badge, etc.)
│   ├── App.tsx                   ← Router setup, routes định nghĩa
│   ├── main.tsx                  ← entry point, import shared.css
│   └── shared.css                ← CSS chung — GIỮ NGUYÊN toàn bộ, không đổi
├── index.html                    ← Vite entry HTML
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### Quy ước Folder-Per-Page (áp dụng từ Module 01 trở đi)

Mỗi module nội dung (01–07) là **1 folder** trong `src/pages/`, không phải 1 file đơn. Vite tự resolve `import from '../pages/NenTang'` → `NenTang/index.tsx`, nên `App.tsx` không cần thay đổi.

| File                 | Vai trò                                                                                         |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| `index.tsx`          | Orchestrator: mount `PageHeader`, `TocBar`, tất cả `LessonXX`, `ProjectSection`, `ModuleFooter` |
| `_helpers.tsx`       | `Sec` + `Flow` components — dùng nội bộ trong folder, không export ra ngoài                     |
| `_toc.ts`            | `TOC_LINKS` array — danh sách anchor links cho `TocBar`                                         |
| `LessonXX.tsx`       | 1 file = 1 bài (80–130 lines). Props: `{ isDone: boolean; onToggleDone: () => void }`           |
| `ProjectSection.tsx` | Phần project cuối module, không nhận props                                                      |

**Lý do split**: File đơn ~2500+ lines khó đọc, khó edit, khó review. Mỗi `LessonXX.tsx` độc lập — có thể sửa 1 bài mà không ảnh hưởng bài khác.

### Lý do chuyển từ HTML sang React

| Vấn đề với HTML thuần        | Giải pháp React                                    |
| ---------------------------- | -------------------------------------------------- |
| Nav duplicate 8 lần          | `<Nav />` component — sửa 1 chỗ, cập nhật khắp nơi |
| LessonCard structure lặp lại | `<LessonCard>` với props typed                     |
| localStorage logic rải rắc   | `useProgress(moduleId)` hook tái sử dụng           |
| Code tab switch inline JS    | `<CodeTabs>` component với React state             |
| Active nav link hardcode     | React Router `<NavLink>` tự detect active route    |

### Dev workflow

```bash
# Cài đặt
npm create vite@latest nodejs-docs -- --template react-ts
cd nodejs-docs
npm install react-router-dom

# Dev (HMR)
npm run dev

# Build static
npm run build
# Output: dist/ — deploy được lên bất kỳ static host nào
```

> **Lưu ý**: `shared.css` vẫn là file CSS duy nhất, import trong `src/main.tsx`. Không dùng CSS Modules hay Tailwind — giữ nguyên class-based CSS để đồng nhất với thiết kế gốc.

---

## 4. TYPOGRAPHY SPEC

### Font stack mới

```css
/* Google Fonts import */
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=IBM+Plex+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=JetBrains+Mono:ital,wght@0,400;0,500;1,400&display=swap');

/* Áp dụng */
body           → font-family: 'IBM Plex Sans', sans-serif;
h1, h2, h3     → font-family: 'Be Vietnam Pro', sans-serif;
code, pre, .ic → font-family: 'JetBrains Mono', monospace;
```

### Tại sao 3 font này?

- **IBM Plex Sans**: Thiết kế cho tài liệu kỹ thuật, hỗ trợ đầy đủ Latin Extended (dấu tiếng Việt), không bị dính chữ
- **Be Vietnam Pro**: Font Việt Nam, tối ưu cho tiếng Việt, heading rõ nét, weight 800 mạnh
- **JetBrains Mono**: Tốt nhất cho code TypeScript — ligatures cho `=>`, `?.`, `??`, `::` đẹp; dễ phân biệt `0/O`, `1/l/I`

### CSS variables giữ nguyên — chỉ đổi font

```css
/* GIỮ NGUYÊN toàn bộ color variables */
:root { --bg, --bg2, --bg3, --surface, --border, --accent, --mongo, ... }

/* CHỈ THAY font references */
/* Trước: 'Syne'    → Sau: 'Be Vietnam Pro' */
/* Trước: 'DM Sans' → Sau: 'IBM Plex Sans'  */
/* Trước: 'DM Mono' → Sau: 'JetBrains Mono' */
```

---

## 5. LAYOUT SPEC — LANDING PAGE CHI TIẾT (trang 01–07)

Blueprint chuẩn cho **mỗi trang kiến thức**. Agent AI follow đúng thứ tự sections.

---

### SECTION 1: NAV (cố định, giống nhau ở tất cả trang)

```
[Logo] Express+MongoDB·TS    [00] [01] [02] [03] [04] [05] [06] [07]
```

- Fixed top, backdrop-filter blur
- Link active = trang hiện tại, class `active` + accent color
- Mobile: overflow-x auto, scrollbar hidden

---

### SECTION 2: PAGE HEADER (compact ~40vh, chỉ trang 00 dùng full-height hero)

```
┌─────────────────────────────────────────────────────────────┐
│  [← Module trước]                      [Module sau →]       │  breadcrumb
│                                                             │
│  Module 01  [TypeScript]                                    │  số + language badge
│  Nền Tảng TypeScript & HTTP                                 │  h1
│  "Những thứ cần biết trước khi học Express"                 │  subtitle
│                                                             │
│  [⏱ ~4 giờ]  [📚 14 bài]  [🔴 HIGH]                       │  meta chips
│                                                             │
│  Cần biết trước:  [JavaScript cơ bản]  [Node.js installed]  │  prerequisites
└─────────────────────────────────────────────────────────────┘
```

**CSS**: `min-height: 40vh`, `padding-top: 80px`, grid background từ file gốc

---

### SECTION 3: PROGRESS BAR + MỤC LỤC (sticky dưới nav)

```
┌──────────────────────────────────────────────────────────┐
│  ████████████░░░░░░░  5/14 bài hoàn thành                │  progress bar
│  ① TS là gì  ② Types  ③ Interfaces  ④ Async/Await  ...   │  anchor links
└──────────────────────────────────────────────────────────┘
```

- Sticky `top: 56px`
- Progress key: `em_progress` object, field `module_01`
- Anchor link → smooth scroll đến lesson — **offset = nav height (`--nav-h`) + TocBar height đo từ DOM + 16px padding**, tránh bị che bởi sticky bars

---

### SECTION 4: LESSONS (accordion — cấu trúc bên trong)

```
┌─ LESSON CARD ────────────────────────────────────────────────┐
│  [01] Tiêu đề bài học           [🔴 HIGH] [TypeScript] [▼]   │
├──────────────────────────────────────────────────────────────┤
│  BODY:                                                       │
│                                                              │
│  4.1 KHÁI NIỆM                                               │
│  ─────────────                                               │
│  Định nghĩa ngắn gọn. Tại sao cần biết.                      │
│  TS-specific: giải thích liên quan đến type system nếu có.   │
│                                                              │
│  4.2 LUỒNG HOẠT ĐỘNG                                         │
│  ───────────────────                                         │
│  Bước 1 → Bước 2 → Bước 3                                    │
│  (numbered steps hoặc text arrows — không cần SVG/canvas)    │
│                                                              │
│  4.3 CODE VÍ DỤ (tabs)                                       │
│  ─────────────────────                                       │
│  [Cơ bản .ts] [Thực tế .ts] [Sai lầm .ts] [So sánh JS→TS]    │
│  <pre>... TypeScript code ...</pre>                          │
│  Tab "So sánh JS→TS" chỉ xuất hiện ở Module 01 và 02         │
│  để giúp người có background JS chuyển sang TS dễ hơn        │
│                                                              │
│  4.4 GIẢI THÍCH TỪNG DÒNG                                    │
│  ─────────────────────────                                   │
│  ┌────┬──────────────────────────────────────────────────┐   │
│  │Line│ Giải thích                                       │   │
│  ├────┼──────────────────────────────────────────────────┤   │
│  │ 1  │ import express, { Request, Response } from ...   │   │
│  │    │ → import có named types từ @types/express        │   │
│  │ 3  │ const app: Express = express()                   │   │
│  │    │ → gán type rõ ràng cho app instance              │   │
│  └────┴──────────────────────────────────────────────────┘   │
│                                                              │
│  4.5 LỖI THƯỜNG GẶP                                          │
│  ──────────────────                                          │
│  ⚠️ [warn callout]: lỗi phổ biến (TS error hoặc runtime)     │
│  ✅ [note callout]: cách đúng                                │
│  TS-specific: type errors compiler báo và cách fix           │
│                                                              │
│  4.6 BÀI TẬP THỰC HÀNH                                       │
│  ────────────────────────                                    │
│  🟢 Cơ bản: [mô tả — thường là viết function/interface TS]   │
│  🟡 Nâng cao: [mô tả — combine types, generics]              │
│  🔴 Challenge: [mô tả — real-world scenario]                 │
│  [💡 Gợi ý] toggle hiện/ẩn                                   │
│                                                              │
│  [✓ Đánh dấu hoàn thành]  ← lưu localStorage                 │
└──────────────────────────────────────────────────────────────┘
```

**Priority Badge + Language Badge CSS:**

```css
/* Priority */
.badge-high {
  background: #f8717115;
  color: #f87171;
  border: 1px solid #f8717130;
}
.badge-medium {
  background: #fbbf2415;
  color: #fbbf24;
  border: 1px solid #fbbf2430;
}
.badge-low {
  background: #60a5fa15;
  color: #60a5fa;
  border: 1px solid #60a5fa30;
}

/* Language indicator — TypeScript blue */
.badge-ts {
  background: #3178c615;
  color: #5ba4e5;
  border: 1px solid #3178c630;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
}
```

> **Quy tắc hiển thị badge TS**: Tất cả lessons từ Module 01 trở đi đều có badge `[TypeScript]` vì code ví dụ là TS. Không cần giải thích lại mỗi bài.

---

### SECTION 5: LIÊN KẾT KIẾN THỨC

```
┌───────────────────────────────────────────────────────────┐
│  Kiến thức liên quan                                      │
│                                                           │
│  ← Cần biết trước         Học tiếp theo →                 │
│  [TS Interfaces]           [Express Request types]        │
│  [async/await]             [Error handling TS]            │
│                                                           │
│  Cùng chủ đề:                                             │
│  [Generic types] [Union types] [@types packages]          │
└───────────────────────────────────────────────────────────┘
```

---

### SECTION 6: FOOTER

```
[← Module trước: Tên]     [Về trang chủ]     [Module sau: Tên →]
───────────────────────────────────────────────────────────────
Express.js + MongoDB · TypeScript Edition · Module X/7
```

---

## 6. SPEC CHI TIẾT TỪNG FILE

---

### FILE 00 — `00-index.html` — Trang Chủ & Mục Lục

**Mục đích**: Navigation hub. Người học thấy toàn bộ bức tranh.

**Sections**:

1. **Hero** (full viewport): "TypeScript + Express + MongoDB từ Zero", stats, CTA
2. **Tại sao TypeScript?** — 5 lý do ngắn gọn, thực tế (không lý thuyết)
3. **Danh sách kiến thức** (3 columns: HIGH / MEDIUM / LOW) — checklist có thể tick
4. **Lộ trình học** (8 module cards) — mỗi card: số, tên, mô tả, số bài, thời gian, badge priority, link
5. **Setup môi trường** (accordion):
   - Node.js 18+
   - VS Code + extensions: TypeScript + Webpack, ESLint, Prettier
   - MongoDB Atlas free tier
   - Thunder Client hoặc Bruno (API testing)
   - `npm init -y` + cài packages ban đầu
6. **Tổng overview progress** từ localStorage

**Không có** lesson chi tiết — chỉ là navigation hub.

---

### FILE 01 — `01-nen-tang.html` — Nền Tảng TypeScript & HTTP

**Priority**: 🔴 HIGH toàn bộ

**Lessons** (14 bài — tăng từ 12 do thêm TS basics):

**Nhóm A — TypeScript Cơ Bản (6 bài)**

1. TypeScript là gì — JS superset, compile step, tại sao dùng trong backend
2. Primitive types: `string`, `number`, `boolean`, `null`, `undefined`, `void`, `unknown`, `never`
3. Object types & Interfaces: `interface User { name: string; age: number }`
4. Type aliases & Union/Intersection: `type ID = string | number`; `type AdminUser = User & Admin`
5. Generics cơ bản: `function identity<T>(arg: T): T` — đủ để đọc `Promise<T>`, `Array<T>`
6. tsconfig.json & tooling: `strict`, `target: ES2020`, `module: CommonJS`, `ts-node`, `tsx`

**Nhóm B — JavaScript Async & HTTP (8 bài)**

7. HTTP Request/Response Cycle — diagram text
8. HTTP Methods & Status Codes — bảng tổng hợp
9. URL structure + JSON parse/stringify
10. Callback & Callback Hell
11. Promise: `.then()`, `.catch()`, `.finally()`, `Promise.all()`
12. Async/Await với TypeScript: return type `Promise<User>`, try/catch typed errors
13. ESM modules với TypeScript: `import`/`export`, `export default` — **chỉ dùng ESM, không dạy CommonJS `require`** (TS standard)
14. Error handling: typed errors, `instanceof`, custom error class với TS

**Tab "So sánh JS→TS"** bắt buộc cho bài 2, 3, 4, 12, 13 — giúp người có background JS chuyển sang.

**Project cuối module**: Viết module TypeScript `api-client.ts` — 3 functions `fetchUser`, `fetchPosts`, `fetchComments` với typed return types, gọi song song `Promise.all`, xử lý lỗi với custom `ApiError` class.

---

### FILE 02 — `02-express-core.html` — Express.js Core với TypeScript

**Priority**: 🔴 HIGH toàn bộ

**Lessons** (10 bài):

1. **Cài đặt Express + TypeScript**
   - Packages: `express`, `@types/express`, `typescript`, `ts-node`, `tsx`, `@types/node`
   - `tsconfig.json` cho Express project
   - `package.json` scripts: `dev`, `build`, `start`

2. **App setup với types**

   ```typescript
   import express, { Express } from 'express';
   const app: Express = express();
   ```

3. **Routing với typed Request/Response**

   ```typescript
   import { Request, Response } from 'express';
   app.get('/users', (req: Request, res: Response) => {
     res.json({ users: [] });
   });
   ```

4. **Route params & query string — typing đúng cách**

   ```typescript
   // Params
   app.get('/users/:id', (req: Request<{ id: string }>, res: Response) => {
     const { id } = req.params; // string, không phải any
   });
   // Query — cần cast vì req.query là Record<string, unknown>
   const page = Number(req.query.page) || 1;
   ```

5. **Request body với interface**

   ```typescript
   interface CreateUserBody {
     name: string;
     email: string;
     age?: number;
   }
   app.post('/users', (req: Request<{}, {}, CreateUserBody>, res: Response) => {
     const { name, email } = req.body; // typed!
   });
   ```

6. **Middleware với `RequestHandler` type**

   ```typescript
   import { RequestHandler } from 'express';
   const logger: RequestHandler = (req, res, next) => {
     console.log(`${req.method} ${req.url}`);
     next();
   };
   ```

7. **Built-in middleware** — `express.json()`, `express.urlencoded()`, `express.static()`

8. **Custom middleware — Request extension (Declaration Merging)**

   ```typescript
   // src/types/express.d.ts
   import { IUser } from '../models/User';
   declare global {
     namespace Express {
       interface Request {
         user?: IUser; // thêm req.user
       }
     }
   }
   ```

9. **Error handling middleware với `ErrorRequestHandler`**

   ```typescript
   import { ErrorRequestHandler } from 'express';
   const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
     res.status(err.statusCode || 500).json({ error: err.message });
   };
   ```

10. **404 handler** — catch-all route

**Tab "Sai lầm" bắt buộc**:

- Bài 4: Dùng `req.params.id` mà không cast sang number khi cần
- Bài 5: `req.body` là `any` nếu không dùng `express.json()` trước
- Bài 8: Quên tạo `.d.ts` file → `req.user` báo lỗi TS
- Bài 9: Viết 3 tham số → Express không nhận là error handler

**Tab "So sánh JS→TS"**: Bài 2, 3, 5, 6, 9

**Project cuối module**: Todo API bằng TypeScript — interface `ITodo`, typed routes, custom error class, logger middleware, in-memory array.

---

### FILE 03 — `03-express-nangcao.html` — Express.js Nâng Cao (TypeScript)

**Priority**: 🔴 HIGH (Router, cấu trúc) + 🟡 MEDIUM (validation, upload, CORS)

**Lessons** (9 bài — tăng 1 do thêm bài Zod):

1. **Express Router với TypeScript** — `Router` type, typed route files
2. **Cấu trúc thư mục TypeScript project chuẩn**:

   ```
   src/
   ├── types/          ← interfaces, type aliases, express.d.ts
   ├── config/         ← env config typed
   ├── models/         ← Mongoose models
   ├── controllers/    ← request handlers
   ├── services/       ← business logic
   ├── routes/         ← Express Router
   ├── middleware/     ← custom middleware
   └── app.ts          ← Express setup
   index.ts            ← entry point (server start)
   tsconfig.json
   ```

3. **Environment variables — type-safe config**

   ```typescript
   // src/config/env.ts
   const config = {
     port: Number(process.env.PORT) || 3000,
     mongoUri: process.env.MONGO_URI as string,
     jwtSecret: process.env.JWT_SECRET as string,
   } as const;

   // validate at startup
   if (!config.mongoUri) throw new Error('MONGO_URI is required');

   export default config;
   ```

4. **Input validation với `zod`** (thay `express-validator` — TS-first, tốt hơn)

   ```typescript
   import { z } from 'zod';

   const CreateUserSchema = z.object({
     name: z.string().min(2),
     email: z.string().email(),
     age: z.number().min(0).max(150).optional(),
   });

   type CreateUserInput = z.infer<typeof CreateUserSchema>; // auto-generate type!
   ```

5. **File upload với `multer` + `@types/multer`**

   ```typescript
   import multer, { FileFilterCallback } from 'multer';
   import { Request } from 'express';

   const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
     file.mimetype.startsWith('image/') ? cb(null, true) : cb(null, false);
   };
   ```

6. **CORS với `cors` + `@types/cors`**

7. **Rate limiting với `express-rate-limit`** (v7 có built-in types)

8. **Custom `AppError` class và `asyncHandler` wrapper**

   ```typescript
   export class AppError extends Error {
     constructor(
       public message: string,
       public statusCode: number = 500
     ) {
       super(message);
     }
   }

   export const asyncHandler =
     (fn: RequestHandler): RequestHandler =>
     (req, res, next) =>
       Promise.resolve(fn(req, res, next)).catch(next);
   ```

9. **Response format chuẩn với Generic**

   ```typescript
   interface ApiResponse<T> {
     success: boolean;
     data?: T;
     message?: string;
     error?: string;
   }

   // Helper
   export const sendSuccess = <T>(res: Response, data: T, statusCode = 200) =>
     res.status(statusCode).json({ success: true, data } satisfies ApiResponse<T>);
   ```

**Project cuối module**: Refactor Todo API → cấu trúc chuẩn + `zod` validation + `AppError` + `asyncHandler`.

---

### FILE 04 — `04-mongodb-core.html` — MongoDB & Mongoose với TypeScript

**Priority**: 🔴 HIGH toàn bộ

**Lessons** (12 bài):

1. **MongoDB vs SQL** — document model, khi nào dùng

2. **Kết nối Mongoose với TypeScript**

   ```typescript
   import mongoose from 'mongoose';

   export const connectDB = async (): Promise<void> => {
     await mongoose.connect(config.mongoUri);
     console.log('MongoDB connected');
   };
   ```

3. **Schema với TypeScript Interface**

   ```typescript
   import { Schema, model, Document, Model } from 'mongoose';

   // 1. Định nghĩa interface (shape của document)
   export interface IUser {
     name: string;
     email: string;
     age?: number;
     role: 'user' | 'admin';
     createdAt: Date;
     updatedAt: Date;
   }

   // 2. Schema — generic với interface
   const userSchema = new Schema<IUser>(
     {
       name: { type: String, required: true },
       email: { type: String, required: true, unique: true },
       role: { type: String, enum: ['user', 'admin'], default: 'user' },
     },
     { timestamps: true }
   );

   // 3. Model — typed
   export const User = model<IUser>('User', userSchema);
   ```

4. **Schema validation với TypeScript** — required, unique, enum với TS literal types

5. **Mongoose Model typing nâng cao**

   ```typescript
   // Static methods
   interface IUserModel extends Model<IUser> {
     findByEmail(email: string): Promise<IUser | null>;
   }

   userSchema.statics.findByEmail = function (email: string) {
     return this.findOne({ email });
   };

   export const User = model<IUser, IUserModel>('User', userSchema);
   ```

6. **Create với typed result**

   ```typescript
   const user: IUser = await User.create({ name: 'An', email: 'an@mail.com' });
   // user._id là Types.ObjectId — không phải string!
   ```

7. **Read — handling `null` returns**

   ```typescript
   const user = await User.findById(id);
   // TypeScript: user là IUser | null — phải check trước khi dùng
   if (!user) throw new AppError('User not found', 404);
   // Sau đây user chắc chắn là IUser
   ```

8. **Query operators với `FilterQuery<T>`**

   ```typescript
   import { FilterQuery } from 'mongoose';

   const filter: FilterQuery<IUser> = {
     age: { $gt: 18, $lt: 60 },
     role: { $in: ['user', 'admin'] },
   };
   const users = await User.find(filter);
   ```

9. **Update — typed options**

   ```typescript
   const updated = await User.findByIdAndUpdate(
     id,
     { $set: { name: 'New Name' } },
     { new: true, runValidators: true }
   ); // returns IUser | null
   ```

10. **Delete** — `findByIdAndDelete`, `deleteMany`

11. **Pagination với typed result**

    ```typescript
    interface PaginationResult<T> {
      data: T[]
      total: number
      page: number
      totalPages: number
    }

    async function paginate<T>(
      model: Model<T>,
      filter: FilterQuery<T>,
      page: number,
      limit: number
    ): Promise<PaginationResult<T>> { ... }
    ```

12. **Populate với TypeScript**

    ```typescript
    // Khai báo ref trong interface
    export interface IPost {
      title: string;
      author: Types.ObjectId | IUser; // union: trước/sau populate
    }

    // Sau populate
    const post = await Post.findById(id).populate<{ author: IUser }>('author');
    post?.author.name; // typed!
    ```

**Project cuối module**: Blog API skeleton — `IUser`, `IPost`, `IComment` interfaces + Models, CRUD endpoints typed, pagination generic.

---

### FILE 05 — `05-mongodb-nangcao.html` — MongoDB Nâng Cao với TypeScript

**Priority**: 🟡 MEDIUM chủ yếu

**Lessons** (8 bài):

1. **Indexes với TypeScript**

   ```typescript
   userSchema.index({ email: 1 }, { unique: true });
   userSchema.index({ name: 'text', bio: 'text' }); // text search
   ```

2. **Aggregation Pipeline — `PipelineStage[]` type**

   ```typescript
   import { PipelineStage } from 'mongoose';

   const pipeline: PipelineStage[] = [
     { $match: { published: true } },
     { $group: { _id: '$author', count: { $sum: 1 } } },
     { $sort: { count: -1 } },
   ];
   const result = await Post.aggregate(pipeline);
   ```

3. **`$match`, `$project`, `$sort`, `$limit`, `$skip`** — typed examples

4. **`$group` với typed result**

   ```typescript
   interface AuthorStats {
     _id: Types.ObjectId;
     totalPosts: number;
     avgViews: number;
   }
   const stats = await Post.aggregate<AuthorStats>([
     {
       $group: {
         _id: '$author',
         totalPosts: { $sum: 1 },
         avgViews: { $avg: '$views' },
       },
     },
   ]);
   // stats: AuthorStats[] — fully typed!
   ```

5. **`$lookup` vs `populate`** — khi nào dùng cái nào

6. **Mongoose hooks với `this` type**

   ```typescript
   userSchema.pre('save', async function (this: IUser & Document, next) {
     if (this.isModified('password')) {
       this.password = await bcrypt.hash(this.password, 10);
     }
     next();
   });
   ```

7. **Virtuals và instance methods với TypeScript**

   ```typescript
   // Thêm method vào interface
   export interface IUserMethods {
     comparePassword(plain: string): Promise<boolean>
   }

   // Schema
   const userSchema = new Schema<IUser, Model<IUser, {}, IUserMethods>, IUserMethods>({...})
   userSchema.methods.comparePassword = async function(plain: string) {
     return bcrypt.compare(plain, this.password)
   }
   ```

8. **Transactions với `ClientSession`**

   ```typescript
   import { ClientSession } from 'mongoose';

   const session: ClientSession = await mongoose.startSession();
   await session.withTransaction(async () => {
     await User.create([newUser], { session });
     await Profile.create([newProfile], { session });
   });
   session.endSession();
   ```

**Project cuối module**: Aggregation cho Blog API — `AuthorStats`, `TopPost` typed interfaces, 2 endpoints thống kê.

---

### FILE 06 — `06-authentication.html` — Authentication & Security (TypeScript)

**Priority**: 🔴 HIGH (JWT + bcrypt) + 🟡 MEDIUM (refresh token, RBAC, security)

**Lessons** (10 bài):

1. **Tại sao cần auth** — stateless HTTP, session vs token

2. **bcrypt với TypeScript**

   ```typescript
   import bcrypt from 'bcryptjs'; // dùng bcryptjs — no native deps, TS types included

   const hash = await bcrypt.hash(password, 10); // string
   const isMatch = await bcrypt.compare(plain, hash); // boolean
   ```

3. **JWT với typed payload**

   ```typescript
   import jwt, { Secret, SignOptions } from 'jsonwebtoken';

   interface JwtPayload {
     userId: string;
     role: 'user' | 'admin';
     iat?: number;
     exp?: number;
   }

   export const signToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string =>
     jwt.sign(payload, config.jwtSecret as Secret, { expiresIn: '15m' });

   export const verifyToken = (token: string): JwtPayload =>
     jwt.verify(token, config.jwtSecret as Secret) as JwtPayload;
   ```

4. **Đăng ký với typed request body (zod)**

   ```typescript
   const RegisterSchema = z.object({
     name: z.string().min(2),
     email: z.string().email(),
     password: z.string().min(8),
   });
   type RegisterInput = z.infer<typeof RegisterSchema>;
   ```

5. **Đăng nhập** — tìm user → compare → sign token → response

6. **Auth middleware — typed `req.user`**

   ```typescript
   // express.d.ts đã khai báo req.user?: IUser
   export const authenticate: RequestHandler = asyncHandler(async (req, res, next) => {
     const token = req.headers.authorization?.split(' ')[1];
     if (!token) throw new AppError('Chưa đăng nhập', 401);

     const payload = verifyToken(token);
     const user = await User.findById(payload.userId);
     if (!user) throw new AppError('User không tồn tại', 401);

     req.user = user; // TypeScript OK vì đã extend Request
     next();
   });
   ```

7. **Refresh token pattern**

   ```typescript
   interface TokenPair {
     accessToken: string; // 15 phút
     refreshToken: string; // 7 ngày
   }

   export const generateTokenPair = (userId: string, role: string): TokenPair => ({
     accessToken: signToken({ userId, role }, '15m'),
     refreshToken: signToken({ userId, role }, '7d'),
   });
   ```

8. **RBAC — `requireRole` middleware**

   ```typescript
   export const requireRole =
     (...roles: Array<'user' | 'admin'>): RequestHandler =>
     (req, res, next) => {
       if (!req.user || !roles.includes(req.user.role)) {
         throw new AppError('Không có quyền', 403);
       }
       next();
     };

   // Dùng:
   router.delete('/posts/:id', authenticate, requireRole('admin'), deletePost);
   ```

9. **Helmet + security headers**

10. **Input sanitization: `express-mongo-sanitize`**
    ```typescript
    import mongoSanitize from 'express-mongo-sanitize';
    app.use(mongoSanitize()); // ngăn { $gt: '' } trong req.body
    ```

**Project cuối module**: Auth layer hoàn chỉnh cho Blog API — register, login, refresh, protect routes.

---

### FILE 07 — `07-thucchien.html` — Social Blog API (TypeScript — Full Build)

**Priority**: 🔴 HIGH — tổng hợp tất cả

**Features của project**:

- Auth: register, login, logout, refresh token
- Users: profile, update profile, upload avatar
- Posts: CRUD, pagination, filter by tag/author, view count
- Comments: CRUD, populate
- Likes: toggle like/unlike
- Admin: xóa bài, ban user (RBAC)

**8 bước build** (mỗi bước là 1 lesson card):

1. **Setup project TypeScript**
   - `npm init`, install packages, `tsconfig.json` strict
   - Cấu trúc thư mục đầy đủ
   - Scripts: `dev` (tsx watch), `build` (tsc), `start` (node dist)

2. **Database design & interfaces**

   ```typescript
   // Toàn bộ interfaces trước khi viết code
   interface IUser { ... }
   interface IPost { ... }
   interface IComment { ... }
   interface ILike { ... }
   ```

3. **Auth module** — register, login, refresh, middleware

4. **Posts module** — CRUD, filter, pagination với generic `paginate<IPost>()`

5. **Comments & Likes** — nested resources, toggle pattern

6. **Admin routes** — RBAC, bulk operations

7. **Error handling & response format nhất quán**

   ```typescript
   // Tất cả routes dùng asyncHandler
   // Tất cả errors qua AppError
   // Tất cả responses qua sendSuccess<T> / sendError
   ```

8. **Pre-deploy checklist TypeScript**
   - [ ] `tsc --noEmit` không có lỗi
   - [ ] Không có `any` type trong production code
   - [ ] Tất cả `req.body` có interface/zod schema
   - [ ] Không lộ stack trace (`NODE_ENV === 'production'`)
   - [ ] `.env` không commit, có `.env.example`
   - [ ] Rate limiting trên auth endpoints
   - [ ] Helmet bật

---

## 7. SHARED CSS — COMPONENTS THÊM MỚI

Ngoài CSS từ file gốc, bổ sung:

```css
/* ── PRIORITY BADGES ── */
.badge-high {
  background: #f8717115;
  color: #f87171;
  border: 1px solid #f8717130;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}
.badge-medium {
  background: #fbbf2415;
  color: #fbbf24;
  border: 1px solid #fbbf2430;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}
.badge-low {
  background: #60a5fa15;
  color: #60a5fa;
  border: 1px solid #60a5fa30;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
}

/* ── TYPESCRIPT BADGE ── */
.badge-ts {
  background: #3178c615;
  color: #5ba4e5;
  border: 1px solid #3178c630;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 4px;
  letter-spacing: 0.03em;
}

/* ── LESSON INNER SECTIONS ── */
.lesson-section {
  margin-top: 1.25rem;
}
.lesson-section-title {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text3);
  margin-bottom: 0.75rem;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border);
}
.lesson-concept {
  /* nền tảng — no special bg, just spacing */
}
.lesson-flow {
  background: var(--surface);
  border-radius: 8px;
  padding: 1rem;
}
.flow-step {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 8px;
}
.flow-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--surface2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: var(--accent);
  flex-shrink: 0;
  margin-top: 1px;
}
.flow-text {
  font-size: 13px;
  color: var(--text2);
  line-height: 1.5;
}

/* ── LINE EXPLAIN TABLE ── */
.line-table {
  width: 100%;
  border-collapse: collapse;
  margin: 0.75rem 0;
  font-size: 12.5px;
}
.line-table td {
  padding: 7px 10px;
  border-bottom: 1px solid var(--border);
  vertical-align: top;
  line-height: 1.5;
}
.line-table td:first-child {
  color: var(--text3);
  font-family: 'JetBrains Mono', monospace;
  white-space: nowrap;
  width: 48px;
  text-align: center;
}
.line-table td:last-child {
  color: var(--text2);
}
.line-table tr:last-child td {
  border-bottom: none;
}

/* ── EXERCISES ── */
.exercise-section {
  margin-top: 1.25rem;
  background: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1rem;
}
.exercise-item {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  font-size: 13px;
}
.exercise-item:last-of-type {
  margin-bottom: 0;
}
.exercise-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 5px;
}
.ex-basic {
  background: #4ade80;
}
.ex-medium {
  background: #fbbf24;
}
.ex-hard {
  background: #f87171;
}
.hint-toggle {
  margin-top: 10px;
  background: transparent;
  border: 1px solid var(--border2);
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 12px;
  color: var(--text3);
  cursor: pointer;
  transition: all 0.2s;
}
.hint-toggle:hover {
  color: var(--text2);
  border-color: var(--text3);
}
.hint-body {
  display: none;
  margin-top: 8px;
  font-size: 12.5px;
  color: var(--text2);
  background: var(--surface);
  border-radius: 6px;
  padding: 10px 12px;
  line-height: 1.55;
}
.hint-body.open {
  display: block;
}

/* ── PROGRESS ── */
.progress-bar-wrap {
  background: var(--surface);
  border-radius: 100px;
  height: 4px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}
.progress-bar-fill {
  height: 100%;
  background: var(--accent);
  border-radius: 100px;
  transition: width 0.4s ease;
}
.complete-btn {
  background: transparent;
  border: 1px solid var(--border2);
  border-radius: 6px;
  padding: 7px 14px;
  font-size: 12px;
  color: var(--text3);
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'IBM Plex Sans', sans-serif;
  margin-top: 1rem;
}
.complete-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.complete-btn.done {
  background: #4ade8015;
  border-color: var(--accent);
  color: var(--accent);
}

/* ── PAGE HEADER (compact) ── */
.page-header {
  min-height: 40vh;
  display: flex;
  align-items: flex-end;
  padding: 80px 2rem 3rem;
  position: relative;
  overflow: hidden;
}
.page-header-bg {
  /* giống .hero-bg — gradient + grid */
}
.module-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--text3);
  margin-bottom: 0.5rem;
  display: block;
}
.page-header h1 {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: clamp(1.8rem, 4vw, 3.2rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  margin-bottom: 0.5rem;
}
.page-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 1rem;
}
.meta-chip {
  background: var(--surface);
  border: 1px solid var(--border2);
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 12px;
  color: var(--text2);
}
.prereq-row {
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.prereq-label {
  font-size: 11px;
  color: var(--text3);
}
.prereq-badge {
  font-size: 11px;
  background: var(--surface2);
  border: 1px solid var(--border2);
  border-radius: 4px;
  padding: 2px 8px;
  color: var(--text2);
}

/* ── STICKY TOC BAR ── */
.toc-bar {
  position: sticky;
  top: 56px;
  z-index: 90;
  background: rgba(13, 15, 14, 0.95);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
  padding: 10px 2rem;
}
.toc-bar-inner {
  max-width: 960px;
  margin: 0 auto;
}
.toc-links {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
}
.toc-links::-webkit-scrollbar {
  display: none;
}
.toc-link {
  font-size: 12px;
  color: var(--text3);
  text-decoration: none;
  padding: 4px 10px;
  border-radius: 5px;
  white-space: nowrap;
  font-family: 'JetBrains Mono', monospace;
  transition: all 0.15s;
}
.toc-link:hover {
  color: var(--text2);
  background: var(--surface);
}

/* ── RELATED TOPICS ── */
.related-section {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
}
.related-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}
@media (max-width: 600px) {
  .related-grid {
    grid-template-columns: 1fr;
  }
}
.related-col-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text3);
  margin-bottom: 8px;
}
.related-link {
  display: block;
  font-size: 13px;
  color: var(--text2);
  text-decoration: none;
  padding: 6px 10px;
  border-radius: 6px;
  margin-bottom: 4px;
  border: 1px solid var(--border);
  transition: all 0.15s;
}
.related-link:hover {
  border-color: var(--border2);
  color: var(--text);
}

/* ── MODULE FOOTER NAV ── */
.module-footer {
  border-top: 1px solid var(--border);
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.mfnav-link {
  display: flex;
  flex-direction: column;
  text-decoration: none;
  padding: 12px 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  transition: border-color 0.2s;
  max-width: 200px;
}
.mfnav-link:hover {
  border-color: var(--border2);
}
.mfnav-dir {
  font-size: 11px;
  color: var(--text3);
  margin-bottom: 3px;
}
.mfnav-name {
  font-size: 13px;
  color: var(--text);
  font-weight: 500;
}
.mfnav-center {
  font-size: 12px;
  color: var(--text3);
}

/* ── KNOWLEDGE CHECKLIST (trang 00) ── */
.checklist-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}
@media (max-width: 800px) {
  .checklist-grid {
    grid-template-columns: 1fr;
  }
}
.checklist-col-title {
  font-family: 'Be Vietnam Pro', sans-serif;
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}
.checklist-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--text2);
}
.checklist-item input[type='checkbox'] {
  margin-top: 2px;
  accent-color: var(--accent);
  flex-shrink: 0;
  cursor: pointer;
}
.checklist-item.done {
  color: var(--text3);
  text-decoration: line-through;
}
```

---

## 8. REACT HOOKS & COMPONENTS — Shared UI Logic

UI logic của trang web dùng React + TypeScript (không liên quan đến TS content đang dạy trong bài học).

### `src/types/index.ts` — Shared types

```typescript
export interface Module {
  id: string; // 'module_01'
  name: string;
  href: string; // '/01-nen-tang'
  total: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'overview';
}

export interface Lesson {
  id: string; // 'lesson_01_01'
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

export type BadgeVariant = 'high' | 'medium' | 'low' | 'ts';
```

### `src/hooks/useProgress.ts` — Progress per module

```typescript
import { useState, useCallback } from 'react';

const STORAGE_KEY = 'em_progress';

export function useProgress(moduleId: string, total: number) {
  const [done, setDone] = useState<Set<string>>(() => {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return new Set<string>(saved[moduleId] || []);
  });

  const toggle = useCallback(
    (lessonId: string) => {
      setDone(prev => {
        const next = new Set(prev);
        next.has(lessonId) ? next.delete(lessonId) : next.add(lessonId);
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        saved[moduleId] = [...next];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        return next;
      });
    },
    [moduleId]
  );

  const pct = total > 0 ? Math.round((done.size / total) * 100) : 0;
  return { done, toggle, count: done.size, pct };
}
```

### `src/hooks/useChecklist.ts` — Knowledge checklist (trang 00)

```typescript
import { useState, useCallback } from 'react';

const STORAGE_KEY = 'em_checklist';

export function useChecklist() {
  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  );

  const toggle = useCallback((key: string) => {
    setChecked(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { checked, toggle };
}
```

### `src/components/LessonCard.tsx` — Accordion lesson

```typescript
import { useState } from 'react';
import Badge, { BadgeVariant } from './Badge';

interface Props {
  id: string;
  num: string;
  title: string;
  desc?: string;
  priority: BadgeVariant;
  isDone: boolean;
  onToggleDone: () => void;
  children: React.ReactNode;  // lesson body content
}

export default function LessonCard({ id, num, title, desc, priority, isDone, onToggleDone, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`lesson-card ${open ? 'open' : ''}`} id={id}>
      <div className="lesson-header" onClick={() => setOpen(o => !o)}>
        <div className="lesson-num-box">{num}</div>
        <div>
          <div className="lesson-title">{title}</div>
          {desc && <div className="lesson-desc-short">{desc}</div>}
        </div>
        <div className="lesson-badges">
          <Badge variant={priority} />
          <Badge variant="ts" />
        </div>
        <div className="lesson-toggle">▼</div>
      </div>
      {open && (
        <div className="lesson-body">
          {children}
          <button
            className={`complete-btn ${isDone ? 'done' : ''}`}
            onClick={e => { e.stopPropagation(); onToggleDone(); }}
          >
            {isDone ? '✓ Đã hoàn thành' : 'Đánh dấu hoàn thành'}
          </button>
        </div>
      )}
    </div>
  );
}
```

### `src/utils/highlight.ts` — Syntax tokenizer (zero-dependency)

Tokenizer xử lý TypeScript / JavaScript / JSON, emit HTML với inline `<span class="...">`.

**Token classes** (đã có sẵn trong `shared.css`):

| Class     | Màu                   | Token                                   |
| --------- | --------------------- | --------------------------------------- |
| `.kw`     | purple `#c084fc`      | keywords: `const`, `async`, `import`, … |
| `.tp`     | yellow `#fde68a`      | built-in types: `string`, `Promise`, …  |
| `.fn`     | blue `#60a5fa`        | function calls: `identifier(`           |
| `.method` | cyan `#67e8f9`        | method calls sau `.` : `obj.method(`    |
| `.prop`   | yellow `#fde68a`      | property access sau `.` : `obj.prop`    |
| `.str`    | green `#86efac`       | strings `"`, `'`, `` ` ``               |
| `.num`    | orange `#fb923c`      | number literals                         |
| `.cm`     | gray italic `#6a7a6b` | comments `//` và `/* */`                |
| `.op`     | cyan `#89ddff`        | operators: `=>`, `??`, `===`, `?.`, …   |

**Quy tắc quan trọng khi viết code ví dụ trong lessons**:

- **KHÔNG cần** thêm HTML `<span>` thủ công — tokenizer tự xử lý
- **KHÔNG cần** prop `html={true}` — `CodeBlock` tự auto-highlight mọi plain-text code
- Custom type names (VD: `User`, `IPost`) không được tô màu — chỉ built-in types mới được. Đây là behavior đúng

### `src/components/CodeBlock.tsx` — Code block + copy

```typescript
import { useState } from 'react';
import { highlight } from '../utils/highlight';

interface Props {
  code: string;    // plain text — auto-highlighted bởi tokenizer
  html?: boolean;  // true: dùng code string là HTML thuần (đã có <span> thủ công)
  standalone?: boolean;
}

export default function CodeBlock({ code, html, standalone }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Copy button luôn trả về plain text, không bao gồm HTML tags
    const text = html ? code.replace(/<[^>]+>/g, '') : code;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Plain text → auto highlight; html string → dùng nguyên
  const displayHtml = html ? code : highlight(code);

  return (
    <div className={standalone ? 'pre-wrap-standalone' : 'pre-wrap'}>
      <button className={`copy-btn${copied ? ' copied' : ''}`} onClick={handleCopy}>
        {copied ? 'copied!' : 'copy'}
      </button>
      <pre dangerouslySetInnerHTML={{ __html: displayHtml }} />
    </div>
  );
}
```

### `src/components/Nav.tsx` — Fixed nav với active route

```typescript
import { NavLink } from 'react-router-dom';

const MODULES = [
  { to: '/', label: '00' },
  { to: '/01-nen-tang', label: '01' },
  { to: '/02-express-core', label: '02' },
  { to: '/03-express-nangcao', label: '03' },
  { to: '/04-mongodb-core', label: '04' },
  { to: '/05-mongodb-nangcao', label: '05' },
  { to: '/06-authentication', label: '06' },
  { to: '/07-thucchien', label: '07' },
];

export default function Nav() {
  return (
    <nav className="nav">
      <NavLink to="/" className="nav-logo">
        {/* SVG logo */}
        Express+MongoDB·<span style={{ color: 'var(--ts-light)' }}>TS</span>
      </NavLink>
      <div className="nav-links">
        {MODULES.map(m => (
          <NavLink
            key={m.to}
            to={m.to}
            end={m.to === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {m.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
```

---

## 9. BUILD PHASES — HƯỚNG DẪN CHO AGENT

> **Nguyên tắc**: Mỗi Phase = 1 chat session riêng. Không build nhiều files cùng lúc. Paste spec này vào đầu session + nói "Thực hiện Phase X".

---

### Phase 0 — Foundation: Vite project + shared components + trang chủ (1 session)

**Task**: Scaffold Vite React + TS project, tạo shared components, implement `src/pages/Index.tsx`

**Checklist**:

- [x] `package.json`: `react`, `react-dom`, `react-router-dom`, `vite`, `@types/react`, `@types/react-dom`
- [x] `vite.config.ts`: base config
- [x] `tsconfig.json`: strict mode, path aliases
- [x] `src/main.tsx`: import `shared.css`, wrap `<App>` trong `<BrowserRouter>`
- [x] `src/App.tsx`: `<Routes>` mapping 8 pages
- [x] `src/shared.css`: giữ nguyên CSS từ Phase 0 cũ (đã có — copy vào `src/`)
- [x] `src/types/index.ts`: `Module`, `Lesson`, `BadgeVariant` types
- [x] `src/hooks/useProgress.ts`: localStorage progress hook
- [x] `src/hooks/useChecklist.ts`: localStorage checklist hook
- [x] `src/hooks/useTocDots.ts`: scroll → active dot tracking
- [x] `src/components/Nav.tsx`: fixed nav, NavLink active
- [x] `src/components/TocDots.tsx`: right-side section dots
- [x] `src/components/Badge.tsx`: HIGH/MEDIUM/LOW/TS badges
- [x] `src/components/Callout.tsx`: lesson-note + lesson-warn
- [x] `src/components/CodeBlock.tsx`: pre + copy button
- [x] `src/components/CodeTabs.tsx`: tab switcher
- [x] `src/components/LessonCard.tsx`: accordion, complete button
- [x] `src/components/LineTable.tsx`: line-by-line explanation
- [x] `src/components/ExerciseSection.tsx`: 3-level exercises + hint
- [x] `src/components/PageHeader.tsx`: compact 40vh header cho trang 01–07
- [x] `src/components/TocBar.tsx`: sticky progress bar + anchor links (scroll offset tự tính nav+bar height)
- [x] `src/components/ModuleFooter.tsx`: prev/next navigation
- [x] `src/utils/highlight.ts`: syntax tokenizer cho TS/JS/JSON — dùng bởi CodeBlock
- [x] `src/pages/Index.tsx`: Hero, WhyTS, Roadmap, Checklist, Progress, Setup sections

**Input**: `expressjs-mongodb-course.html` (styling reference), `src/shared.css` (đã có)
**Output**: toàn bộ `src/` scaffold + `src/pages/Index.tsx` hoạt động

> **✅ COMPLETED** — `npm run build` thành công, 0 TypeScript errors. 50 modules transformed.

---

### Phase 1 — Nền tảng (1 session)

**Task**: Tạo `src/pages/NenTang/` folder với 14 lessons

**Checklist**:

- [x] `src/pages/NenTang/index.tsx` — orchestrator, `useProgress('module_01', 14)`
- [x] `src/pages/NenTang/_helpers.tsx` — `Sec`, `Flow` components
- [x] `src/pages/NenTang/_toc.ts` — 14 TOC_LINKS
- [x] Nhóm A (Lesson01–06): TS types, interfaces, union, generics, tsconfig, tooling
- [x] Nhóm B (Lesson07–14): HTTP, async/await typed, ESM, custom errors
- [x] `<CodeTabs>` với tab "So sánh JS→TS" cho bài 2, 3, 4, 12, 13
- [x] `src/pages/NenTang/ProjectSection.tsx` — `api-client.ts` với typed functions

**Output**: `src/pages/NenTang/` folder (index.tsx + \_helpers.tsx + \_toc.ts + Lesson01–14.tsx + ProjectSection.tsx)

> **✅ COMPLETED** — `npx tsc --noEmit && npm run build` thành công, 0 TypeScript errors. 75 modules transformed.

---

### Phase 2 — Express Core (1 session)

**Task**: Tạo `src/pages/ExpressCore/` folder với 10 lessons

**Checklist**:

- [x] `src/pages/ExpressCore/index.tsx` — orchestrator, `useProgress('module_02', 10)`
- [x] `src/pages/ExpressCore/_helpers.tsx` — `Sec`, `Flow`
- [x] `src/pages/ExpressCore/_toc.ts` — 10 TOC_LINKS
- [x] Lesson01–10: tất cả code TS
- [x] Bài 8: Declaration Merging cho `req.user`
- [x] Tab "Sai lầm": bài 4, 5, 8, 9
- [x] Tab "So sánh JS→TS": bài 2, 3, 5, 6, 9
- [x] `src/pages/ExpressCore/ProjectSection.tsx` — Todo API TypeScript

**Output**: `src/pages/ExpressCore/` folder (cùng cấu trúc với NenTang/)

> **✅ COMPLETED** — `npx tsc --noEmit && npm run build` thành công, 0 TypeScript errors. 88 modules transformed. Xóa stub `ExpressCore.tsx` để folder/index.tsx resolve đúng.
>
> **Post-Phase 2 improvements** (apply cho tất cả phases sau):
>
> - `TocBar.tsx` — scroll offset tính đúng nav + bar height, không bị che nữa
> - `src/utils/highlight.ts` — tokenizer tự động; `CodeBlock` không cần `html={true}` hay `<span>` thủ công

---

### Phase 3 — Express Nâng Cao (1 session)

**Task**: Tạo `src/pages/ExpressNangCao/` folder với 9 lessons

**Checklist**:

- [x] `src/pages/ExpressNangCao/index.tsx` — orchestrator, `useProgress('module_03', 9)`
- [x] `src/pages/ExpressNangCao/_helpers.tsx` + `_toc.ts`
- [x] Lesson01–09: dùng `zod` thay `express-validator`
- [x] Bài 4: `z.infer<typeof Schema>` — auto-generate type
- [x] Bài 8: `AppError` class + `asyncHandler` wrapper
- [x] Bài 9: `ApiResponse<T>` generic interface
- [x] `src/pages/ExpressNangCao/ProjectSection.tsx` — Refactor Todo API

**Output**: `src/pages/ExpressNangCao/` folder (cùng cấu trúc với NenTang/)

> **✅ COMPLETED** — `npx tsc --noEmit && npm run build` thành công, 0 TypeScript errors. 101 modules transformed. Xóa stub `ExpressNangCao.tsx` để folder/index.tsx resolve đúng.

---

### Phase 4 — MongoDB Core (1 session)

**Task**: Tạo `src/pages/MongoDBCore/` folder với 12 lessons

**Checklist**:

- [ ] `src/pages/MongoDBCore/index.tsx` — orchestrator, `useProgress('module_04', 12)`
- [ ] `src/pages/MongoDBCore/_helpers.tsx` + `_toc.ts`
- [ ] Lesson01–12: Mongoose generics xuyên suốt
- [ ] Bài 3: Interface + Schema generic + Model typed
- [ ] Bài 5: Static methods với `IUserModel extends Model<IUser>`
- [ ] Bài 7: Handling `IUser | null` — TypeScript null safety
- [ ] Bài 11: Generic `paginate<T>()` function
- [ ] Bài 12: `populate<{ author: IUser }>()` pattern
- [ ] `src/pages/MongoDBCore/ProjectSection.tsx` — Blog API skeleton typed

**Output**: `src/pages/MongoDBCore/` folder (cùng cấu trúc với NenTang/)

---

### Phase 5 — MongoDB Nâng Cao (1 session)

**Task**: Tạo `src/pages/MongoDBNangCao/` folder với 8 lessons

**Checklist**:

- [ ] `src/pages/MongoDBNangCao/index.tsx` — orchestrator, `useProgress('module_05', 8)`
- [ ] `src/pages/MongoDBNangCao/_helpers.tsx` + `_toc.ts`
- [ ] Lesson01–08:
- [ ] Bài 2: `PipelineStage[]` type
- [ ] Bài 4: `Post.aggregate<AuthorStats>()` — generic aggregation
- [ ] Bài 6: `this: IUser & Document` trong hooks
- [ ] Bài 7: 3-generic Schema pattern cho methods
- [ ] Bài 8: `ClientSession` type
- [ ] `src/pages/MongoDBNangCao/ProjectSection.tsx`

**Output**: `src/pages/MongoDBNangCao/` folder (cùng cấu trúc với NenTang/)

---

### Phase 6 — Authentication (1 session)

**Task**: Tạo `src/pages/Authentication/` folder với 10 lessons

**Checklist**:

- [ ] `src/pages/Authentication/index.tsx` — orchestrator, `useProgress('module_06', 10)`
- [ ] `src/pages/Authentication/_helpers.tsx` + `_toc.ts`
- [ ] Lesson01–10:
- [ ] Bài 3: `JwtPayload` interface, `signToken`, `verifyToken` typed
- [ ] Bài 4: `zod` schema + `z.infer` cho register/login
- [ ] Bài 6: `authenticate` middleware với typed `req.user`
- [ ] Bài 7: `TokenPair` interface, `generateTokenPair`
- [ ] Bài 8: `requireRole(...roles: Array<'user' | 'admin'>)` — literal union
- [ ] `src/pages/Authentication/ProjectSection.tsx` — Auth layer cho Blog API

**Output**: `src/pages/Authentication/` folder (cùng cấu trúc với NenTang/)

---

### Phase 7 — Project Thực Chiến (1 session)

**Task**: Tạo `src/pages/ThucChien/` folder với 8 bước

**Checklist**:

- [ ] `src/pages/ThucChien/index.tsx` — orchestrator, `useProgress('module_07', 8)`
- [ ] `src/pages/ThucChien/_helpers.tsx` + `_toc.ts`
- [ ] Lesson01–08 (8 bước build Social Blog API):
- [ ] Bước 1: `tsconfig.json` strict + project structure
- [ ] Bước 2: Tất cả interfaces trước khi viết code
- [ ] Bước 7: Pattern nhất quán — `asyncHandler` + `AppError` + `sendSuccess<T>`
- [ ] Bước 8: Pre-deploy checklist TypeScript (7 items)
- [ ] `src/pages/ThucChien/ProjectSection.tsx`

**Output**: `src/pages/ThucChien/` folder (cùng cấu trúc với NenTang/)

---

## 10. CHECKLIST REVIEW TRƯỚC KHI SHIP MỖI PAGE

- [ ] **TypeScript**: page file là `.tsx`, không có `any` untyped
- [ ] **Components**: dùng `<LessonCard>`, `<CodeBlock>`, `<Badge>`, `<Callout>` — không inline HTML duplicate
- [ ] **Font**: IBM Plex Sans / Be Vietnam Pro / JetBrains Mono — class CSS đúng (dùng từ `shared.css`)
- [ ] **Nav**: `<Nav>` component, NavLink active tự detect route hiện tại
- [ ] **Progress**: `useProgress(moduleId, total)` hook wired — complete button hoạt động
- [ ] **Code lessons**: 100% TypeScript (`.ts` extension, có type annotations, không có untyped `any`)
- [ ] **Mỗi lesson**: đủ 6 sub-sections (Khái niệm, Luồng, Code, Giải thích, Lỗi, Bài tập)
- [ ] **Priority badge**: mỗi `<LessonCard>` có `priority` prop
- [ ] **TS badge**: `<Badge variant="ts" />` trong mỗi lesson
- [ ] **Copy button**: mỗi `<CodeBlock>` tự có copy button
- [ ] **Warn + Note callout**: ít nhất 1 mỗi loại mỗi lesson
- [ ] **Bài tập**: 3 cấp (🟢🟡🔴) + hint toggle
- [ ] **Complete button**: lưu localStorage, data-lesson attribute đúng
- [ ] **Related topics**: cuối trang, 3 cột (Cần biết trước / Học tiếp / Cùng chủ đề)
- [ ] **Module footer nav**: link trang trước + trang sau
- [ ] **Không dùng thư viện JS ngoài** cho UI (vanilla JS only)
- [ ] **Tiếng Việt**: dấu hiển thị đúng

---

## 11. GHI CHÚ VỀ THAY ĐỔI SO VỚI VERSION 1.0

| Thay đổi                | V1.0 (JS)                        | V2.0 (TS)                                                 |
| ----------------------- | -------------------------------- | --------------------------------------------------------- |
| **Ngôn ngữ code ví dụ** | JavaScript                       | TypeScript                                                |
| **Module 01**           | 12 bài (JS/HTTP only)            | 14 bài (+ 6 bài TS basics)                                |
| **Express setup**       | `require('express')`             | `import express, { Express } from 'express'`              |
| **Request body typing** | Không typed                      | Interface + zod schema                                    |
| **Validation library**  | `express-validator`              | `zod` (TS-first, better DX)                               |
| **Mongoose**            | Schema plain                     | `Schema<IUser>` generics                                  |
| **JWT payload**         | Plain object                     | Typed `JwtPayload` interface                              |
| **Error class**         | JS class                         | `class AppError extends Error` với typed statusCode       |
| **Async wrapper**       | Không mention                    | `asyncHandler: (fn: RequestHandler) => RequestHandler`    |
| **LOW section**         | TypeScript là mục tiêu tương lai | TypeScript là nền tảng, LOW focus vào NestJS/Fastify/tRPC |
| **Tổng số lessons**     | ~61                              | ~65 (thêm 4 bài TS)                                       |
| **Project cuối**        | JS                               | TypeScript với strict mode                                |

---

_Spec version 2.0 — TypeScript Edition — Sẵn sàng để build theo từng Phase._
