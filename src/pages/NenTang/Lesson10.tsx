import LessonCard from '../../components/LessonCard';
import CodeTabs from '../../components/CodeTabs';
import LineTable from '../../components/LineTable';
import ExerciseSection from '../../components/ExerciseSection';
import Callout from '../../components/Callout';
import { Sec, Flow } from './_helpers';

const BASIC = `// Callback — function truyền làm argument, gọi sau khi async xong
function delay(ms: number, callback: () => void): void {
  setTimeout(callback, ms);
}

delay(1000, () => {
  console.log('Chạy sau 1 giây');
});

// Node.js fs — callback pattern truyền thống
import fs from 'fs';

fs.readFile('data.json', 'utf8', (error, content) => {
  if (error) {
    console.error('Lỗi:', error.message);
    return;
  }
  console.log('Nội dung:', content);
});`;

const HELL = `// Callback Hell — lồng nhau nhiều cấp
readFile('config.json', 'utf8', (err1, configData) => {
  if (err1) return console.error(err1);
  const config = JSON.parse(configData);

  connectDB(config.dbUrl, (err2, db) => {
    if (err2) return console.error(err2);

    db.findUser('alice@ex.com', (err3, user) => {
      if (err3) return console.error(err3);

      user.getPosts((err4, posts) => {
        if (err4) return console.error(err4);
        // 4 cấp lồng nhau — còn có thể sâu hơn nữa
        // Gọi là "Pyramid of Doom"
        // → Khó đọc, khó debug, khó test
        // → Giải pháp: Promise và async/await (bài 11, 12)
      });
    });
  });
});`;

interface Props {
  isDone: boolean;
  onToggleDone: () => void;
}

export default function Lesson10({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-01-10"
      num="10"
      title="Callback & Callback Hell"
      desc="callback pattern, Node.js async, pyramid of doom, tại sao cần Promise"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        <p>
          <strong>Callback</strong> là function truyền làm argument, được gọi sau khi một operation
          async hoàn thành. Đây là cách Node.js xử lý async truyền thống. Vấn đề: lồng nhau nhiều
          cấp tạo ra <em>Callback Hell</em> (Pyramid of Doom) — khó đọc, khó debug.
        </p>
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Gọi hàm async, truyền callback: readFile("data.json", callback)',
            'Node.js bắt đầu operation, trả control ngay lập tức (non-blocking)',
            'Khi operation xong → gọi callback(error, result)',
            'Nếu bước tiếp theo cũng async → lồng callback vào → Callback Hell',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: 'Cơ bản .ts', code: BASIC },
            { label: 'Callback Hell', code: HELL },
          ]}
        />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable
          rows={[
            {
              line: '3',
              explanation:
                'callback: (error: Error | null, data?: string) => void — convention: error first',
            },
            {
              line: '14',
              explanation:
                'fs.readFile — Node.js built-in, callback nhận (err, content) — err-first convention',
            },
            {
              line: '27-35',
              explanation: 'Callback Hell — 4 cấp lồng nhau, mỗi cấp phải handle error riêng',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          <strong>Quên handle error:</strong> Callback hell còn tệ hơn khi bỏ qua error ở mỗi bước.
          Nếu một step fail mà không handle → callback không bao giờ được gọi, app treo.{' '}
          <code className="ic">if (err) return callback(err)</code> ở mỗi bước.
        </Callout>
        <Callout type="note">
          <strong>Callback trong Node.js hiện đại:</strong> Hầu hết Node.js built-in APIs giờ có
          promisified version: <code className="ic">fs/promises</code>,{' '}
          <code className="ic">util.promisify()</code>. Mongoose và Express đều dùng Promise.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Viết function withDelay<T>(ms: number, value: T, callback: (val: T) => void): void. Gọi callback sau ms milliseconds với value.',
            },
            {
              level: 'medium',
              text: 'Viết hàm đọc file config.json bằng fs.readFile (callback), parse JSON, log ra port và dbUrl.',
            },
            {
              level: 'hard',
              text: 'Chuyển ví dụ Callback Hell sang dùng util.promisify() để wrap các hàm callback thành Promise.',
            },
          ]}
          hint="util.promisify(fs.readFile) trả function trả Promise. const readFileAsync = promisify(fs.readFile). Sau đó dùng await readFileAsync(...)"
        />
      </Sec>
    </LessonCard>
  );
}
