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

const BASIC = `// SQL (PostgreSQL) — dữ liệu dạng bảng, cột cố định
CREATE TABLE users (
  id    SERIAL PRIMARY KEY,
  name  VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL
);

INSERT INTO users (name, email) VALUES ('An', 'an@mail.com');

SELECT * FROM users WHERE email = 'an@mail.com';

// MongoDB — dữ liệu dạng document (JSON-like)
// Không cần tạo bảng trước — document tự mô tả cấu trúc
db.users.insertOne({
  name:  'An',
  email: 'an@mail.com',
  age:   25,          // field tùy ý — SQL cần thêm cột
  tags:  ['admin'],   // array nội tuyến — SQL cần bảng riêng
});

db.users.findOne({ email: 'an@mail.com' });`;

const REAL = `// Khi nào dùng MongoDB?
// ✅ Tốt cho: blog, social feed, product catalog, real-time apps
// ✅ Schema thay đổi thường xuyên (early-stage startup)
// ✅ Dữ liệu lồng nhau sâu (comment của post, items của order)
// ✅ Read nhiều hơn write (aggregate, full-text search)

// Khi nào KHÔNG dùng MongoDB?
// ❌ Cần ACID transactions phức tạp (banking, accounting)
// ❌ Nhiều JOIN giữa các collections (dấu hiệu dùng SQL tốt hơn)
// ❌ Dữ liệu quan hệ chặt chẽ, schema ổn định lâu dài

// So sánh thuật ngữ
// SQL          → MongoDB
// Database     → Database
// Table        → Collection
// Row/Record   → Document
// Column       → Field
// JOIN         → $lookup (aggregation) hoặc populate (Mongoose)
// Primary key  → _id (ObjectId tự động)
// Index        → Index (cú pháp khác nhau)`;

export default function Lesson01({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-04-01"
      num="01"
      title="MongoDB vs SQL — Document model và khi nào dùng"
      desc="Khác biệt cơ bản giữa document database và relational database"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        MongoDB là <strong>document database</strong> — lưu dữ liệu dạng BSON (Binary JSON), không
        có schema cứng. Mỗi document trong một collection có thể có cấu trúc khác nhau. Ngược lại,
        SQL database yêu cầu schema cố định, dữ liệu dạng bảng với rows và columns. Mongoose là ODM
        (Object Document Mapper) cho MongoDB trong Node.js — nó thêm schema validation và TypeScript
        types lên trên MongoDB driver.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'SQL: tạo bảng (DDL) → insert rows → query với JOIN để lấy related data',
            'MongoDB: tạo collection tự động khi insert → document tự mô tả shape',
            'Mongoose thêm layer: định nghĩa Schema → validate trước khi lưu → query trả typed object',
            'Mongoose populate() thay thế JOIN: load related documents từ collection khác',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: 'SQL vs MongoDB', code: BASIC },
            { label: 'Khi nào dùng', code: REAL },
          ]}
        />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable
          rows={[
            {
              line: '1',
              explanation:
                'SQL cần DDL (CREATE TABLE) trước khi insert. MongoDB không cần — collection tự tạo khi insert document đầu tiên.',
            },
            {
              line: '2',
              explanation:
                'MongoDB document có thể chứa array nội tuyến (tags: []) và nested object — SQL cần bảng phụ và JOIN.',
            },
            {
              line: '3',
              explanation:
                '_id là primary key tự động, kiểu ObjectId (12-byte hex). Không cần khai báo, Mongoose tự tạo.',
            },
            {
              line: '4',
              explanation:
                'Mongoose thêm schema validation: nếu document không khớp schema, save() sẽ throw ValidationError trước khi đến MongoDB.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          MongoDB không có foreign key constraints — bạn hoàn toàn có thể lưu <code>authorId</code>{' '}
          trỏ đến user không tồn tại. Mongoose <code>populate()</code> sẽ trả <code>null</code> thay
          vì lỗi. Phải validate tự tay hoặc dùng Mongoose pre-save hook.
        </Callout>
        <Callout type="note">
          MongoDB Atlas free tier (M0) là đủ để học và build side project. Giới hạn: 512MB storage,
          shared cluster. Khi cần production, M10+ có dedicated cluster và backup tự động.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Liệt kê 3 ứng dụng thực tế phù hợp với MongoDB và 3 ứng dụng nên dùng SQL. Giải thích lý do cho mỗi lựa chọn.',
            },
            {
              level: 'medium',
              text: 'Thiết kế document schema cho một ứng dụng blog: mỗi post có title, content, author (reference), tags (array), và comments (embedded). Viết ví dụ document JSON.',
            },
            {
              level: 'hard',
              text: 'So sánh 2 design: (A) comments embedded trong post document vs (B) comments là collection riêng. Phân tích trade-offs về read performance, write complexity, và document size limit (16MB BSON limit của MongoDB).',
            },
          ]}
          hint="MongoDB có hard limit 16MB per document. Nếu comments embedded và post có hàng nghìn comments, document sẽ vượt giới hạn. Reference collection (B) không có giới hạn này nhưng cần populate() để lấy data."
        />
      </Sec>
    </LessonCard>
  );
}
