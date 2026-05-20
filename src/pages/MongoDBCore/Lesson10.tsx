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

const BASIC = `// Delete methods — xóa 1 hoặc nhiều documents
import { User, IUser } from '../models/User';
import { isValidObjectId } from 'mongoose';

// findByIdAndDelete — xóa 1 document theo _id, trả document đã xóa
const deleted = await User.findByIdAndDelete(id);
// deleted: IUser | null — null nếu không tìm thấy
if (!deleted) throw new AppError('User không tìm thấy', 404);
console.log('Đã xóa:', deleted.name);

// deleteOne — xóa 1 document theo filter, không trả document
const result = await User.deleteOne({ email: 'an@mail.com' });
console.log(result.deletedCount); // 1 nếu xóa được, 0 nếu không tìm thấy

// deleteMany — xóa nhiều documents
const bulkResult = await User.deleteMany({ isActive: false });
console.log(bulkResult.deletedCount); // số documents đã xóa

// Xóa tất cả — NGUY HIỂM, chỉ dùng khi chắc chắn
const allDeleted = await User.deleteMany({});`;

const REAL = `// src/controllers/post.controller.ts — Soft delete + cascade
import { Request, Response } from 'express';
import { Post, IPost } from '../models/Post';
import { Comment } from '../models/Comment';
import { AppError } from '../utils/errors';
import { asyncHandler } from '../utils/asyncHandler';
import { isValidObjectId } from 'mongoose';

// Hard delete với cascade (xóa comments của post)
export const deletePost = asyncHandler(async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new AppError('ID không hợp lệ', 400);

  // Kiểm tra post tồn tại và author đúng
  const post = await Post.findById(id);
  if (!post) throw new AppError('Post không tìm thấy', 404);

  // Authorization: chỉ author hoặc admin mới xóa được
  const userId = req.user?._id?.toString();
  const isOwner = post.author.toString() === userId;
  const isAdmin = req.user?.role === 'admin';
  if (!isOwner && !isAdmin) throw new AppError('Không có quyền xóa', 403);

  // Cascade delete: xóa tất cả comments thuộc post
  await Comment.deleteMany({ post: id });

  // Xóa post
  await Post.findByIdAndDelete(id);

  res.status(204).send(); // 204 No Content — xóa thành công, không trả body
});

// Soft delete — không xóa thật, chỉ mark isDeleted = true
export const softDeletePost = asyncHandler(async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $set: { isDeleted: true, deletedAt: new Date() } },
    { new: true }
  );
  if (!post) throw new AppError('Post không tìm thấy', 404);
  res.json({ success: true, message: 'Đã xóa bài viết' });
});`;

const MISTAKE = `// ❌ Sai lầm 1: Xóa mà không check authorization
app.delete('/posts/:id', asyncHandler(async (req, res) => {
  await Post.findByIdAndDelete(req.params.id); // bất kỳ ai cũng xóa được!
  res.status(204).send();
}));

// ✅ Đúng: luôn check ownership hoặc role trước khi xóa
const post = await Post.findById(id);
if (!post) throw new AppError('Not found', 404);
if (post.author.toString() !== req.user._id.toString()) {
  throw new AppError('Không có quyền', 403);
}
await Post.findByIdAndDelete(id);

// ❌ Sai lầm 2: Không xóa related data — orphaned records
await Post.findByIdAndDelete(postId);
// Comments vẫn còn trong DB với post = postId không tồn tại → orphaned!

// ✅ Đúng: cascade delete hoặc dùng pre-remove hook
postSchema.pre('deleteOne', { document: true }, async function () {
  await Comment.deleteMany({ post: this._id });
});

// ❌ Sai lầm 3: Trả 200 với body khi xóa thành công
res.status(200).json({ message: 'Deleted' }); // không sai nhưng không chuẩn REST

// ✅ Chuẩn REST: 204 No Content khi xóa thành công
res.status(204).send(); // không có body`;

export default function Lesson10({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-04-10"
      num="10"
      title="Delete — findByIdAndDelete, deleteMany, cascade và soft delete"
      desc="Xóa document, cascade delete related data, soft delete pattern, authorization check"
      priority="high"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        Mongoose có 3 delete methods: <code>findByIdAndDelete()</code> (xóa theo id, trả document đã
        xóa), <code>deleteOne()</code> (xóa theo filter, trả metadata), <code>deleteMany()</code>{' '}
        (xóa nhiều). Khi xóa resource, cần xem xét: (1) <strong>Authorization</strong> — chỉ owner
        hoặc admin mới xóa được; (2) <strong>Cascade delete</strong> — xóa related documents để
        tránh orphaned records; (3) <strong>Soft delete</strong> — mark <code>isDeleted: true</code>{' '}
        thay vì xóa thật — có thể khôi phục.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'Validate id bằng isValidObjectId — throw 400 nếu format sai',
            'findById(id) — kiểm tra document tồn tại — throw 404 nếu null',
            'Authorization check: so sánh post.author với req.user._id — throw 403 nếu không phải owner',
            'Cascade delete: xóa related documents (comments, likes...)',
            'findByIdAndDelete(id) — xóa document chính',
            'res.status(204).send() — 204 No Content, không trả body',
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
                'findByIdAndDelete(id) — tìm document theo _id và xóa. Trả document đã xóa (hoặc null nếu không tìm thấy). Dùng khi cần biết document đã xóa là gì (log, cascade).',
            },
            {
              line: '2',
              explanation:
                'deleteOne({ filter }) — xóa document đầu tiên match filter. Không trả document — chỉ trả { acknowledged, deletedCount }. Nhanh hơn findByIdAndDelete vì không fetch document.',
            },
            {
              line: '3',
              explanation:
                'post.author.toString() === userId — so sánh ObjectId với string. ObjectId phải .toString() trước khi so sánh với string. Dùng .equals() nếu so sánh 2 ObjectIds.',
            },
            {
              line: '4',
              explanation:
                'res.status(204).send() — HTTP 204 No Content là status chuẩn cho DELETE thành công. Không có body. Nếu dùng send() sau json() sẽ lỗi — chỉ gọi 1 trong 2.',
            },
            {
              line: '5',
              explanation:
                'Comment.deleteMany({ post: id }) — cascade delete trước khi xóa post. Nếu xóa post trước, comments trở thành orphaned records (có post field trỏ đến document không tồn tại).',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Luôn <strong>check authorization trước khi xóa</strong>. Không có check → IDOR
          vulnerability (Insecure Direct Object Reference) — bất kỳ ai biết ID đều xóa được. Pattern
          chuẩn: findById → check owner → xóa.
        </Callout>
        <Callout type="note">
          Soft delete (<code>isDeleted: true</code>) phù hợp khi cần audit trail hoặc khả năng
          restore. Nhớ thêm filter <code>{'{ isDeleted: false }'}</code> hoặc{' '}
          <code>{'{ isDeleted: { $ne: true } }'}</code> vào tất cả queries, hoặc dùng Mongoose
          middleware để tự động exclude deleted documents.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Viết DELETE /posts/:id: validate id, findById, check req.user._id === post.author, findByIdAndDelete, res.status(204). Dùng asyncHandler.',
            },
            {
              level: 'medium',
              text: 'Thêm cascade delete: khi xóa post, xóa cả comments và likes của post đó. Đảm bảo thứ tự: xóa related trước, xóa post sau. Log số records đã cascade-delete.',
            },
            {
              level: 'hard',
              text: 'Implement soft delete: thêm isDeleted (boolean), deletedAt (Date) vào IPost interface và schema. Viết Mongoose plugin tự động thêm { isDeleted: false } vào tất cả queries của Post model. Test cả delete và restore.',
            },
          ]}
          hint="Mongoose plugin: schema.pre('find', function() { this.where({ isDeleted: false }) }). Áp dụng cho find, findOne, findById, countDocuments. Dùng schema.pre để tự động exclude deleted docs khỏi mọi query."
        />
      </Sec>
    </LessonCard>
  );
}
