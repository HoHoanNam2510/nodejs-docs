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

const BASIC = `// src/config/database.ts
import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log('MongoDB connected');
};

// src/index.ts — gọi connectDB trước khi start server
import { connectDB } from './config/database';
import app from './app';

const PORT = Number(process.env.PORT) || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(\`Server running on port \${PORT}\`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });`;

const REAL = `// src/config/database.ts — production-ready connection
import mongoose from 'mongoose';
import config from './env';

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected) return; // tránh connect nhiều lần (Next.js hot reload)

  mongoose.set('strictQuery', true); // suppress deprecation warning

  mongoose.connection.on('connected', () => {
    console.log('[MongoDB] Connected');
    isConnected = true;
  });

  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] Connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Disconnected — attempting to reconnect...');
    isConnected = false;
  });

  await mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 5000,  // timeout nếu không tìm được server
    socketTimeoutMS: 45000,          // timeout cho từng operation
    maxPoolSize: 10,                 // số connection tối đa trong pool
  });
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  isConnected = false;
};`;

const MISTAKE = `// ❌ Sai lầm 1: Không xử lý lỗi connect — server start dù MongoDB down
connectDB(); // fire and forget
app.listen(3000);
// Nếu MongoDB không connect được → tất cả queries sẽ fail

// ✅ Đúng: đợi connect xong mới start server
connectDB()
  .then(() => app.listen(3000))
  .catch((err) => { console.error(err); process.exit(1); });

// ❌ Sai lầm 2: MONGO_URI không có auth source
// URI: mongodb://localhost:27017/mydb
// Lỗi: Authentication failed

// ✅ Atlas URI đúng format:
// mongodb+srv://user:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority

// ❌ Sai lầm 3: Hardcode URI trong code
const uri = 'mongodb+srv://admin:password123@cluster0.abc.mongodb.net/blog';
// → Lộ credential khi push lên GitHub!

// ✅ Đúng: luôn dùng environment variable
const uri = process.env.MONGO_URI as string;`;

export default function Lesson02({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-04-02"
      num="02"
      title="Kết nối Mongoose với TypeScript"
      desc="connectDB function typed, connection events, Atlas URI, error handling"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Mongoose kết nối MongoDB qua <code>mongoose.connect(uri)</code> — trả về Promise nên phải
        await. Connection được duy trì trong suốt vòng đời ứng dụng (connection pooling). TypeScript
        yêu cầu hàm <code>connectDB</code> có return type rõ ràng là{' '}
        <code>Promise&lt;void&gt;</code> — nghĩa là hàm async không trả về giá trị nào, chỉ cần chờ
        đến khi connected.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'index.ts gọi connectDB() — await đến khi MongoDB handshake xong',
            'mongoose.connect() mở connection pool (mặc định 5 connections)',
            'Connection events: "connected" → ready, "error" → log, "disconnected" → warning',
            'Sau connectDB() resolve → app.listen() — server bắt đầu nhận request',
            'Mọi Model.find/create... dùng chung connection pool này',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: 'Cơ bản .ts', code: BASIC },
            { label: 'Thực tế .ts', code: REAL },
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
                "import mongoose from 'mongoose' — default import, không phải named. Mongoose export object với tất cả methods: connect, Schema, model, Types...",
            },
            {
              line: '2',
              explanation:
                'Promise<void> — return type cho async function không return giá trị. TypeScript cần type này để caller biết hàm là async và có thể await.',
            },
            {
              line: '3',
              explanation:
                'process.env.MONGO_URI as string — TypeScript kiểu của env vars là string | undefined. Cast as string để tránh lỗi — nhưng phải validate trước (xem Lesson 03-03 env config).',
            },
            {
              line: '4',
              explanation:
                'maxPoolSize: 10 — số connection tối đa Mongoose giữ trong pool. Default là 5. Mỗi request không tạo connection mới — dùng connection từ pool.',
            },
            {
              line: '5',
              explanation:
                'process.exit(1) — thoát process với exit code 1 (lỗi). Nếu không exit, Node.js tiếp tục chạy nhưng mọi DB query đều fail. PM2/Docker sẽ restart process sau exit.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          <code>serverSelectionTimeoutMS</code> mặc định là 30 giây — nếu Atlas URI sai hoặc IP chưa
          whitelist, app sẽ treo 30 giây trước khi báo lỗi. Đặt về 5000ms để fail fast trong
          development.
        </Callout>
        <Callout type="note">
          MongoDB Atlas yêu cầu whitelist IP. Khi dev local: thêm <code>0.0.0.0/0</code> (tất cả IP)
          vào Network Access. Trong production: chỉ whitelist IP của server. Đây là lý do phổ biến
          nhất khiến connect thất bại khi deploy.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Tạo MongoDB Atlas account, tạo free cluster M0, lấy connection URI. Viết connectDB function và kết nối thành công — log "MongoDB connected" ra terminal.',
            },
            {
              level: 'medium',
              text: 'Thêm connection events: log khi connected, warn khi disconnected, error khi có lỗi. Thêm graceful shutdown: khi process nhận SIGTERM, đóng connection trước khi thoát.',
            },
            {
              level: 'hard',
              text: 'Implement connection retry logic: nếu connect fail, thử lại tối đa 3 lần với exponential backoff (1s, 2s, 4s). Sau 3 lần fail → process.exit(1). Viết TypeScript với typed retry config.',
            },
          ]}
          hint="Graceful shutdown: process.on('SIGTERM', async () => { await disconnectDB(); process.exit(0); }). SIGTERM là signal Docker gửi khi stop container."
        />
      </Sec>
    </LessonCard>
  );
}
