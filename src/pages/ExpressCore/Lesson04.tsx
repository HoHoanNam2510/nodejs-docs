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

const BASIC = `import { Request, Response } from 'express';

// req.params — always string, cần type generic
app.get('/users/:id', (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params; // string, guaranteed
  res.json({ userId: id });
});

// Cần số? Parse rõ ràng
app.get('/items/:id', (req: Request<{ id: string }>, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id) || id < 1) {
    return res.status(400).json({ error: 'ID phải là số nguyên dương' });
  }
  res.json({ item: { id } });
});`;

const REAL = `interface PaginationQuery {
  page?:  string;
  limit?: string;
  sort?:  string;
  order?: 'asc' | 'desc';
}

app.get('/posts',
  (req: Request<{}, {}, {}, PaginationQuery>, res: Response) => {
    const page  = Math.max(1, Number(req.query.page)  || 1);
    const limit = Math.min(100, Number(req.query.limit) || 20);
    const sort  = req.query.sort ?? 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;

    // Giả lập query MongoDB
    res.json({
      success: true,
      meta: { page, limit, sort, order },
      data:  [],
    });
  }
);

// Multiple params
app.get('/users/:userId/posts/:postId',
  (req: Request<{ userId: string; postId: string }>, res: Response) => {
    const { userId, postId } = req.params;
    res.json({ userId, postId });
  }
);`;

const MISTAKE = `// ❌ Sai lầm 1: Dùng req.params.id như số mà không parse
app.get('/items/:id', (req: Request<{ id: string }>, res: Response) => {
  const id = req.params.id; // vẫn là string!
  const item = items[id];   // items[id] → undefined nếu items là array
  res.json(item);
});
// Kết quả: items["5"] → undefined, nhưng không có lỗi TypeScript vì
// bracket access với string trên array vẫn hợp lệ

// ❌ Sai lầm 2: Trực tiếp dùng req.query.page như number
app.get('/posts', (req: Request, res: Response) => {
  const page = req.query.page as number; // RUNTIME ERROR — thực ra là string!
  const skip = (page - 1) * 10;          // NaN - 10 = NaN
  res.json({ skip });
});

// ✅ Đúng: luôn parse và validate
app.get('/posts', (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const skip = (page - 1) * 10; // số nguyên, guaranteed
  res.json({ skip });
});`;

export default function Lesson04({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-02-04"
      num="04"
      title="Route params & query string — typing đúng cách"
      desc="req.params, req.query, ParsedQs, type casting, số nguyên từ string"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        <code>req.params</code> chứa các dynamic segments từ URL path (ví dụ <code>:id</code>), luôn
        có type <code>string</code> dù route pattern có vẻ như nhận số.
        <code>req.query</code> chứa query string parameters sau dấu <code>?</code>, có type
        <code>ParsedQs</code> — mỗi field có thể là{' '}
        <code>string | string[] | ParsedQs | undefined</code>. Cả hai đều cần parse và validate thủ
        công khi cần dùng như số hay enum.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Định nghĩa route với :param trong path: /users/:id',
            'Khai báo Params generic cho Request: Request<{ id: string }>',
            'req.params.id luôn là string — cần parse nếu cần số: Number(req.params.id)',
            'req.query có type ParsedQs — cần cast hoặc destructure cẩn thận',
            'Validate sau khi parse: kiểm tra isNaN(), bounds, etc.',
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
                'Request<Params, ResBody, ReqBody, Query> — 4 generics theo thứ tự. Bỏ qua params giữa dùng {} làm placeholder.',
            },
            {
              line: '2',
              explanation:
                'Request<{ id: string }> — type Params object. TypeScript enforce req.params.id là string, báo lỗi nếu truy cập field không khai báo.',
            },
            {
              line: '3',
              explanation:
                'ParsedQs — type của req.query từ package qs. Mỗi field: string | string[] | ParsedQs | ParsedQs[] | undefined. Cần cast khi dùng.',
            },
            {
              line: '4',
              explanation:
                'Number(req.query.page) — convert string sang number. Trả NaN nếu không phải số. Kết hợp với || 1 để có default value.',
            },
            {
              line: '5',
              explanation:
                'Math.max(1, ...) / Math.min(100, ...) — clamp giá trị trong range hợp lệ. Ngăn page=0 hoặc limit=99999.',
            },
            {
              line: '6',
              explanation:
                'req.query.sort ?? "createdAt" — nullish coalescing: dùng default "createdAt" khi sort là undefined hoặc null.',
            },
            {
              line: '7',
              explanation:
                'Request<{}, {}, {}, PaginationQuery> — 4th generic type req.query. IDE autocomplete req.query.page, req.query.limit, ...',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          <code>req.params.id</code> là <code>string</code> dù route là <code>/items/:id</code>.
          TypeScript không tự convert sang number — bạn phải parse và validate thủ công.
          <code>items[req.params.id]</code> trả <code>undefined</code> nếu items là array.
        </Callout>
        <Callout type="note">
          Dùng 4th generic của <code>Request&lt;P, RB, B, Q&gt;</code> để type{' '}
          <code>req.query</code>:
          <code>
            Request&lt;{'{}'}, {'{}'}, {'{}'}, {'{ page?: string }'}&gt;
          </code>
          . IDE sẽ autocomplete đúng tên các query params bạn khai báo.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Viết route GET /products/:id trả product theo id (mảng in-memory). Trả 404 nếu không tìm thấy.',
            },
            {
              level: 'medium',
              text: 'Viết route GET /products?category=x&minPrice=100&maxPrice=500 — filter và trả kết quả đúng type.',
            },
            {
              level: 'hard',
              text: 'Viết middleware validateObjectId kiểm tra req.params.id là MongoDB ObjectId hợp lệ (24 ký tự hex) trước khi vào handler.',
            },
          ]}
          hint="isNaN(Number(str)) là cách nhanh kiểm tra string có parse được số không. MongoDB ObjectId validate: /^[0-9a-fA-F]{24}$/.test(id)."
        />
      </Sec>
    </LessonCard>
  );
}
