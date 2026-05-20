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

const BASIC = `// Update methods — findByIdAndUpdate, updateOne, updateMany
import { User, IUser } from '../models/User';

// findByIdAndUpdate — update và trả document
// Mặc định: trả document TRƯỚC khi update
// { new: true }: trả document SAU khi update (thường muốn cái này)
const updated = await User.findByIdAndUpdate(
  id,
  { $set: { name: 'Tên Mới' } },
  { new: true, runValidators: true }
);
// updated: IUser | null

// Kiểm tra có tìm thấy không
if (!updated) throw new AppError('User không tìm thấy', 404);

// updateOne — update 1 document, không trả document (trả update result)
const result = await User.updateOne(
  { email: 'an@mail.com' },
  { $set: { isActive: false } }
);
console.log(result.modifiedCount); // số document được update

// updateMany — update nhiều documents
const bulkResult = await User.updateMany(
  { role: 'user', isActive: false },
  { $set: { role: 'banned' } }
);
console.log(bulkResult.modifiedCount);`;

const REAL = `// src/controllers/user.controller.ts — Update với validation
import { Request, Response } from 'express';
import { User } from '../models/User';
import { AppError } from '../utils/errors';
import { asyncHandler } from '../utils/asyncHandler';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';

const UpdateUserSchema = z.object({
  name:     z.string().min(2).max(100).optional(),
  bio:      z.string().max(500).optional(),
  avatar:   z.string().url().optional(),
}).strict(); // reject unknown fields

type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

// PATCH /users/:id — partial update
export const updateUser = asyncHandler(async (
  req: Request<{ id: string }, {}, UpdateUserInput>,
  res: Response
) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) throw new AppError('ID không hợp lệ', 400);

  const body = UpdateUserSchema.parse(req.body);

  // Không cho phép update _id, email, password qua endpoint này
  const updated = await User.findByIdAndUpdate(
    id,
    { $set: body },               // chỉ update các fields trong body
    { new: true, runValidators: true }
  ).select('-password -__v');

  if (!updated) throw new AppError('User không tìm thấy', 404);

  res.json({ success: true, data: updated });
});

// Update operators hay dùng:
// $set: { field: value }        — set giá trị
// $inc: { views: 1 }            — tăng/giảm số
// $push: { tags: 'newTag' }     — thêm vào array
// $pull: { tags: 'oldTag' }     — xóa khỏi array
// $addToSet: { tags: 'tag' }    — thêm vào array nếu chưa có (unique)
// $unset: { bio: '' }           — xóa field`;

const MISTAKE = `// ❌ Sai lầm 1: Update không có $set — THAY THẾ toàn bộ document!
await User.findByIdAndUpdate(id, { name: 'Mới' });
// → document chỉ còn { _id, name: 'Mới' } — mất hết các fields khác!

// ✅ Đúng: luôn dùng $set để update partial
await User.findByIdAndUpdate(id, { $set: { name: 'Mới' } });

// ❌ Sai lầm 2: Quên { new: true } — nhận document CŨ
const updated = await User.findByIdAndUpdate(id, { $set: { name: 'Mới' } });
console.log(updated?.name); // 'Tên Cũ' — không phải 'Mới'!

// ✅ Đúng: { new: true } để nhận document đã update
const updated = await User.findByIdAndUpdate(
  id,
  { $set: { name: 'Mới' } },
  { new: true }
);

// ❌ Sai lầm 3: Quên { runValidators: true } — bỏ qua schema validation khi update!
await User.findByIdAndUpdate(id, { $set: { age: -100 } }); // qua được validation!
// min: 0 trong schema nhưng update không validate mặc định

// ✅ Đúng: { runValidators: true } để enforce validators khi update
await User.findByIdAndUpdate(id, { $set: { age: -100 } }, { runValidators: true });
// ValidationError: age (-100) is less than minimum 0`;

export default function Lesson09({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-04-09"
      num="09"
      title="Update — findByIdAndUpdate với typed options"
      desc="$set, $inc, $push — { new: true, runValidators: true }, không thay thế toàn bộ document"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Mongoose có nhiều update methods: <code>findByIdAndUpdate()</code> (update và trả document),{' '}
        <code>updateOne()</code> (update 1, trả result metadata), <code>updateMany()</code> (update
        nhiều). Quan trọng nhất: luôn dùng <code>$set</code> để update partial — không có{' '}
        <code>$set</code> sẽ thay thế toàn bộ document. Hai options bắt buộc:{' '}
        <code>{'{ new: true }'}</code> để nhận document sau khi update, và{' '}
        <code>{'{ runValidators: true }'}</code> để schema validation áp dụng cho update.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Validate request params (id) bằng isValidObjectId',
            'Validate request body bằng Zod schema — .strict() để reject unknown fields',
            'findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true })',
            'Mongoose tìm document theo _id → chạy validators → apply update operators',
            'Trả document sau update (new: true) hoặc null nếu không tìm thấy',
            'select("-password -__v") để bỏ sensitive fields khỏi response',
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
                'findByIdAndUpdate(id, update, options) — 3 params: document id, update object (phải dùng operators như $set), options object. Trả Promise<IUser | null>.',
            },
            {
              line: '2',
              explanation:
                '$set: body — partial update operator. Chỉ update các fields có trong body, giữ nguyên các fields khác. Không có $set → MongoDB hiểu là replace toàn bộ document.',
            },
            {
              line: '3',
              explanation:
                '{ new: true } — mặc định findByIdAndUpdate trả document TRƯỚC khi update. new: true để trả document SAU khi update — thường là cái bạn muốn trả cho client.',
            },
            {
              line: '4',
              explanation:
                '{ runValidators: true } — mặc định Mongoose KHÔNG chạy validators khi update. Option này bật lại validation: min, max, enum, required sẽ được check.',
            },
            {
              line: '5',
              explanation:
                '$inc: { views: 1 } — tăng views lên 1. Atomic operation — an toàn khi nhiều requests cùng lúc. Tương đương: views = views + 1 nhưng không có race condition.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Update <strong>không có</strong> <code>$set</code> sẽ thay thế toàn bộ document. Ví dụ:{' '}
          <code>{'findByIdAndUpdate(id, { name: "An" })'}</code> → document chỉ còn lại{' '}
          <code>{'{ _id, name: "An" }'}</code> — mất hết email, role, password, timestamps. Luôn
          dùng <code>{'{ $set: {...} }'}</code>.
        </Callout>
        <Callout type="note">
          <code>.strict()</code> trong Zod schema reject bất kỳ field nào không được khai báo. Quan
          trọng cho update endpoint — ngăn client gửi <code>{'{ role: "admin" }'}</code> để tự leo
          thang quyền. Chỉ cho phép update các fields mà user được phép thay đổi.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Viết PATCH /posts/:id: validate id, validate body (title, content, tags — optional), findByIdAndUpdate với $set, { new: true, runValidators: true }. Chỉ author mới được update (check req.user._id).',
            },
            {
              level: 'medium',
              text: 'Implement atomic view count: mỗi GET /posts/:id tăng views lên 1 bằng $inc. Không fetch document rồi tính tay (race condition). Trả post với views đã tăng.',
            },
            {
              level: 'hard',
              text: 'Viết PATCH /posts/:id/tags/add và /remove để add/remove tag bằng $addToSet và $pull. Validate: tag phải là string 2-30 ký tự, không chứa spaces. Giới hạn tối đa 10 tags — check trước khi add.',
            },
          ]}
          hint="$addToSet: { tags: newTag } — thêm nếu chưa có, bỏ qua nếu đã có. $pull: { tags: tagToRemove } — xóa tất cả elements match giá trị. Cả hai đều atomic, an toàn với concurrent requests."
        />
      </Sec>
    </LessonCard>
  );
}
