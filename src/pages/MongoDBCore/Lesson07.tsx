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

const BASIC = `// findById — trả IUser | null, PHẢI check null trước khi dùng
import { User, IUser } from '../models/User';
import { AppError } from '../utils/errors';

// ❌ Không check null — TypeScript báo lỗi
const user = await User.findById(id);
console.log(user.name); // Error: Object is possibly 'null'

// ✅ Cách 1: if check — type narrows sau block
const user = await User.findById(id);
if (!user) throw new AppError('User không tìm thấy', 404);
// Sau dòng này TypeScript biết user là IUser (không phải null)
console.log(user.name); // string — safe!

// ✅ Cách 2: Optional chaining — nếu chỉ cần 1 field
const name = user?.name; // string | undefined

// findOne — cũng trả IUser | null
const userByEmail = await User.findOne({ email: 'an@mail.com' });
if (!userByEmail) throw new AppError('Email không tồn tại', 404);

// find — trả IUser[] (luôn là array, có thể rỗng — không phải null)
const users = await User.find({ role: 'admin' });
// users.length === 0 nếu không có admin nào — không phải null`;

const REAL = `// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import { User } from '../models/User';
import { AppError } from '../utils/errors';
import { asyncHandler } from '../utils/asyncHandler';
import { isValidObjectId } from 'mongoose';

// GET /users/:id
export const getUserById = asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;

  // Validate ObjectId format trước khi query — tránh CastError
  if (!isValidObjectId(id)) {
    throw new AppError('ID không hợp lệ', 400);
  }

  const user = await User.findById(id).select('-password -__v');

  // TypeScript: user là IUser | null tại đây
  if (!user) {
    throw new AppError('User không tìm thấy', 404);
  }

  // TypeScript: user là IUser (đã narrow sau null check)
  res.json({ success: true, data: user });
});

// GET /users — list với optional filter
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const { role, search } = req.query;

  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;
  if (search) filter.name = { $regex: search, $options: 'i' };

  // find() luôn trả array — không bao giờ null
  const users = await User.find(filter).select('-password -__v').sort({ createdAt: -1 });

  res.json({ success: true, data: users, total: users.length });
});`;

const MISTAKE = `// ❌ Sai lầm 1: Không validate ObjectId — Mongoose throw CastError
app.get('/users/:id', async (req, res) => {
  const user = await User.findById('not-valid-id'); // CastError!
  // CastError không phải AppError → error handler không xử lý đúng
});

// ✅ Đúng: check isValidObjectId trước
import { isValidObjectId } from 'mongoose';
if (!isValidObjectId(req.params.id)) {
  throw new AppError('ID không hợp lệ', 400);
}

// ❌ Sai lầm 2: Dùng findById() kết quả trực tiếp mà không check null
const user = await User.findById(id);
user.name; // Object is possibly null — TypeScript Error

// ✅ Đúng: phải narrow type
const user = await User.findById(id);
if (!user) throw new AppError('Not found', 404);
user.name; // string — TypeScript biết đây là IUser

// ❌ Sai lầm 3: Coi find() có thể null
const users = await User.find();
if (!users) return; // Điều này không bao giờ đúng
// find() luôn trả array, có thể rỗng []

// ✅ Đúng: check length nếu cần
const users = await User.find();
if (users.length === 0) {
  return res.json({ data: [], message: 'Không có users nào' });
}`;

export default function Lesson07({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-04-07"
      num="07"
      title="Read — handling null returns và TypeScript null safety"
      desc="findById → IUser | null, type narrowing, isValidObjectId, find() luôn là array"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        <code>findById()</code> và <code>findOne()</code> trả về <code>IUser | null</code> — đây là
        điểm TypeScript ép buộc bạn phải xử lý. Nếu dùng <code>user.name</code> mà không check null,
        TypeScript báo lỗi compile time: <em>"Object is possibly null"</em>. Phải{' '}
        <strong>narrow type</strong> bằng if check trước. Ngược lại, <code>find()</code> luôn trả{' '}
        <code>IUser[]</code> — không bao giờ null — có thể là array rỗng.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Nhận id từ req.params.id — kiểu string',
            'isValidObjectId(id) → validate format trước khi query (tránh CastError)',
            'User.findById(id) — query MongoDB, trả Promise<IUser | null>',
            'if (!user) throw AppError — TypeScript narrow: sau block này user là IUser',
            'Dùng user.name, user.email... an toàn vì TypeScript đã biết không null',
            'select("-password -__v") — loại bỏ sensitive fields khỏi query result',
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
                'User.findById(id) — query MongoDB với _id. Trả Promise<(Document & IUser) | null>. TypeScript strict mode không cho phép access properties mà không check null trước.',
            },
            {
              line: '2',
              explanation:
                "if (!user) throw AppError — pattern 'guard clause'. Sau dòng này, TypeScript type narrows: user không còn là null | undefined trong scope còn lại. Không cần user! hay as IUser.",
            },
            {
              line: '3',
              explanation:
                "isValidObjectId(id) từ mongoose — check xem string có phải ObjectId hợp lệ không (24 hex chars). Nếu không validate, findById('abc') throw CastError — MongoDB driver lỗi format, không phải 'not found'.",
            },
            {
              line: '4',
              explanation:
                ".select('-password -__v') — exclude fields. Prefix '-' để exclude, không có prefix để include. __v là Mongoose version key (document version). select('-__v') để response sạch hơn.",
            },
            {
              line: '5',
              explanation:
                'User.find() — luôn trả array. Nếu không có document nào match filter, trả []. Không bao giờ trả null hay undefined. Check rỗng bằng users.length === 0.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Nếu không validate ObjectId trước khi <code>findById()</code>, Mongoose throw{' '}
          <code>CastError</code> (không phải <code>AppError</code>). Error handler của bạn cần xử lý
          CastError riêng, hoặc đơn giản hơn: luôn validate bằng <code>isValidObjectId(id)</code> và
          throw <code>AppError</code> sớm.
        </Callout>
        <Callout type="note">
          TypeScript type narrowing chỉ hoạt động trong cùng scope. Nếu bạn throw trong if block,
          code sau đó TypeScript biết là safe. Nhưng nếu return hoặc assign vào biến khác, phải
          check lại. Guard clause pattern (throw sớm) là cách dễ đọc nhất.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Viết GET /posts/:id route: validate ObjectId, findById, null check với AppError 404, select("-__v"), response. Dùng asyncHandler.',
            },
            {
              level: 'medium',
              text: 'Viết GET /users route với query params: role (filter), search (regex on name), page, limit. Implement pagination: skip = (page - 1) * limit. Response: { data, total, page, totalPages }.',
            },
            {
              level: 'hard',
              text: 'Viết generic findOrThrow<T>(model: Model<T>, id: string): Promise<T> — validate ObjectId, findById, throw AppError 404 nếu null. Type-safe: có thể dùng cho User, Post, Comment bất kỳ model nào.',
            },
          ]}
          hint="Generic function: async function findOrThrow<T>(model: Model<T>, id: string): Promise<Document<unknown, {}, T> & T> { if (!isValidObjectId(id)) throw new AppError('Invalid ID', 400); const doc = await model.findById(id); if (!doc) throw new AppError('Not found', 404); return doc; }"
        />
      </Sec>
    </LessonCard>
  );
}
