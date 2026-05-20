import CodeBlock from '../../components/CodeBlock';

const PROJECT_CODE = `// api-client.ts — Project cuối Module 01

// 1. Interfaces cho JSONPlaceholder API
interface User    { id: number; name: string; username: string; email: string; }
interface Post    { id: number; userId: number; title: string; body: string; }
interface Comment { id: number; postId: number; name: string; email: string; body: string; }

// 2. Custom error
export class ApiError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// 3. Generic fetch helper
const BASE = 'https://jsonplaceholder.typicode.com';

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new ApiError(res.status, 'HTTP ' + res.status + ': ' + res.statusText);
  return res.json() as Promise<T>;
}

// 4. Typed API functions
export const fetchUser     = (id: number)     => fetchJSON<User>   (BASE + '/users/'    + id);
export const fetchPosts    = (userId: number) => fetchJSON<Post[]> (BASE + '/posts?userId=' + userId);
export const fetchComments = (postId: number) => fetchJSON<Comment[]>(BASE + '/comments?postId=' + postId);

// 5. Main — chạy song song với Promise.all
async function main(): Promise<void> {
  try {
    const [user, posts] = await Promise.all([fetchUser(1), fetchPosts(1)]);
    const comments = await fetchComments(posts[0].id);

    console.log('User:', user.name);
    console.log('Posts:', posts.length, 'bài');
    console.log('Comments bài đầu:', comments.length, 'comment');
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      console.error('API Error ' + error.statusCode + ':', error.message);
    } else if (error instanceof Error) {
      console.error('Error:', error.message);
    }
  }
}

main();`;

export default function ProjectSection() {
  return (
    <div
      style={{
        marginTop: '3rem',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        padding: '1.5rem 2rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            background: 'var(--accent)',
            color: '#000',
            padding: '2px 8px',
            borderRadius: 4,
            fontWeight: 700,
          }}
        >
          PROJECT
        </span>
        <span style={{ fontSize: 13, color: 'var(--text3)' }}>Cuối Module 01</span>
      </div>

      <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>
        api-client.ts — TypeScript HTTP Client
      </h3>
      <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: '1rem', lineHeight: 1.6 }}>
        Viết module <code className="ic">api-client.ts</code> hoàn chỉnh: định nghĩa interfaces,
        custom <code className="ic">ApiError</code> class, generic{' '}
        <code className="ic">fetchJSON&lt;T&gt;</code> helper, 3 typed functions, gọi song song bằng{' '}
        <code className="ic">Promise.all</code>, xử lý lỗi đầy đủ.
      </p>

      <CodeBlock code={PROJECT_CODE} />

      <div style={{ marginTop: '1rem', fontSize: 12, color: 'var(--text3)' }}>
        Checklist tự review: <br />
        &nbsp;
        <span style={{ color: 'var(--accent)' }}>✓</span> Không có <code className="ic">any</code>{' '}
        type <br />
        &nbsp;
        <span style={{ color: 'var(--accent)' }}>✓</span> Tất cả functions có return type <br />
        &nbsp;
        <span style={{ color: 'var(--accent)' }}>✓</span> catch (error: unknown) <br />
        &nbsp;
        <span style={{ color: 'var(--accent)' }}>✓</span> tsc --noEmit không lỗi
      </div>
    </div>
  );
}
