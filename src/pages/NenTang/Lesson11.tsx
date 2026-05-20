import LessonCard from '../../components/LessonCard';
import CodeTabs from '../../components/CodeTabs';
import LineTable from '../../components/LineTable';
import ExerciseSection from '../../components/ExerciseSection';
import Callout from '../../components/Callout';
import { Sec, Flow } from './_helpers';

const BASIC = `// Promise<T> — đại diện cho giá trị sẽ có trong tương lai
const fetchUser = (id: string): Promise<{ name: string }> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id === '404') reject(new Error('Not found'));
      else resolve({ name: 'Alice' });
    }, 500);
  });
};

// Dùng Promise chain
fetchUser('123')
  .then(user => {
    console.log('Tìm thấy:', user.name);
    return user.name.toUpperCase(); // giá trị cho .then tiếp theo
  })
  .then(upperName => console.log(upperName))
  .catch(error  => console.error('Lỗi:', error.message))
  .finally(()   => console.log('Xong — dù thành công hay thất bại'));`;

const ALL_CODE = `// Promise.all — chạy song song, fail nếu 1 cái fail
async function getDashboard(userId: string) {
  const [user, posts, notifCount] = await Promise.all([
    fetchUser(userId),          // Promise<User>
    fetchUserPosts(userId),     // Promise<Post[]>
    fetchNotifications(userId), // Promise<number>
  ]);
  // Cả 3 requests chạy đồng thời → nhanh hơn ~3x so với tuần tự
  return { user, posts, notifCount };
}

// Promise.allSettled — tiếp tục dù có request fail
const results = await Promise.allSettled([fetchA(), fetchB(), fetchC()]);

results.forEach(result => {
  if (result.status === 'fulfilled') {
    console.log('OK:', result.value);
  } else {
    console.error('Fail:', result.reason);
  }
});`;

interface Props {
  isDone: boolean;
  onToggleDone: () => void;
}

export default function Lesson11({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-01-11"
      num="11"
      title="Promise — xử lý async có cấu trúc"
      desc=".then .catch .finally, Promise.all, Promise.allSettled"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        <p>
          <strong>Promise</strong> là object đại diện cho một giá trị sẽ có trong tương lai. Có 3
          state: <em>pending</em> (đang xử lý), <em>fulfilled</em> (thành công → .then),{' '}
          <em>rejected</em> (thất bại → .catch). Promise chain giải quyết Callback Hell bằng cách
          flatten code.
        </p>
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Tạo Promise: new Promise((resolve, reject) => { ... })',
            'Khi async xong: gọi resolve(value) nếu thành công, reject(error) nếu thất bại',
            '.then(value => ...) — chạy khi fulfilled, return value truyền cho .then tiếp',
            '.catch(error => ...) — bắt lỗi từ bất kỳ bước nào trước đó',
            '.finally(() => ...) — luôn chạy dù success hay fail (cleanup)',
          ]}
        />
      </Sec>

      <Sec title="Code ví dụ">
        <CodeTabs
          tabs={[
            { label: 'Cơ bản .ts', code: BASIC },
            { label: 'Promise.all .ts', code: ALL_CODE },
          ]}
        />
      </Sec>

      <Sec title="Giải thích từng dòng">
        <LineTable
          rows={[
            {
              line: '2',
              explanation:
                'Promise<{ name: string }> — generic type, khai báo type của value khi fulfilled',
            },
            {
              line: '7',
              explanation:
                'resolve(value) — chuyển Promise sang fulfilled state, .then nhận value này',
            },
            {
              line: '15',
              explanation: '.then return value → truyền cho .then tiếp theo trong chain',
            },
            {
              line: '3-6 (all)',
              explanation:
                'Promise.all — tất cả chạy song song, array results có đúng types nhờ generic',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          <strong>Promise.all fail fast:</strong> Nếu 1 trong các promises fail →{' '}
          <code className="ic">Promise.all</code> reject ngay, không đợi cái còn lại. Nếu muốn chờ
          tất cả dù có fail → dùng <code className="ic">Promise.allSettled</code>.
        </Callout>
        <Callout type="note">
          <strong>Không quên .catch():</strong> Promise không được handle error sẽ tạo{' '}
          <em>UnhandledPromiseRejection</em> — Node.js cảnh báo và có thể crash process. Trong
          Express, dùng <code className="ic">asyncHandler</code> wrapper để tự động forward lỗi.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Viết function sleep(ms: number): Promise<void>. Dùng nó để tạo delay 2 giây trước khi log "Done".',
            },
            {
              level: 'medium',
              text: 'Viết fetchWithRetry<T>(url: string, retries: number): Promise<T> — thử lại tối đa retries lần nếu fetch thất bại.',
            },
            {
              level: 'hard',
              text: 'Viết hàm fetchAll([url1, url2, url3]): Promise<Result[]> dùng Promise.allSettled, trả array với { url, data?, error? } cho mỗi request.',
            },
          ]}
          hint="sleep: return new Promise(resolve => setTimeout(resolve, ms)). fetchWithRetry: dùng đệ quy hoặc for loop với try/catch, giảm retries mỗi lần thất bại."
        />
      </Sec>
    </LessonCard>
  );
}
