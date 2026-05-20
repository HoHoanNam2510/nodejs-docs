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

const BASIC = `import mongoose, { ClientSession } from 'mongoose';
import { User } from '../models/User';
import { Profile } from '../models/Profile';

// Transactions đảm bảo "all or nothing":
// Nếu bước 2 fail, bước 1 sẽ tự rollback

async function createUserWithProfile(
  userData:    { name: string; email: string; password: string },
  profileData: { bio: string; avatar: string }
): Promise<void> {
  // 1. Tạo session
  const session: ClientSession = await mongoose.startSession();

  try {
    // 2. withTransaction() tự quản lý start/commit/abort/retry
    await session.withTransaction(async () => {
      // 3. Truyền { session } vào tất cả operations trong transaction
      const [user] = await User.create([userData], { session });
      await Profile.create([{ ...profileData, user: user._id }], { session });
      // Nếu bất kỳ operation nào throw, withTransaction() tự abort
    });
    // 4. Nếu withTransaction() resolve — commit thành công
  } finally {
    // 5. Luôn endSession() dù thành công hay thất bại
    session.endSession();
  }
}`;

const REAL = `import mongoose, { ClientSession } from 'mongoose';
import { User }    from '../models/User';
import { Post }    from '../models/Post';
import { AppError } from '../utils/errors';
import { asyncHandler } from '../utils/asyncHandler';
import { Request, Response } from 'express';

// Transfer post ownership — cần atomic: update 2 collections cùng lúc
export const transferPost = asyncHandler(async (req: Request, res: Response) => {
  const { postId, fromUserId, toUserId } = req.body as {
    postId:     string;
    fromUserId: string;
    toUserId:   string;
  };

  const session: ClientSession = await mongoose.startSession();

  try {
    let transferred: boolean = false;

    await session.withTransaction(async () => {
      // Verify post belongs to fromUser (trong transaction để tránh race condition)
      const post = await Post.findOne(
        { _id: postId, author: fromUserId },
        null,
        { session }
      );
      if (!post) throw new AppError('Post không tồn tại hoặc không thuộc về user này', 404);

      // Verify toUser tồn tại
      const toUser = await User.findById(toUserId).session(session);
      if (!toUser) throw new AppError('User nhận không tồn tại', 404);

      // Update post author
      await Post.findByIdAndUpdate(
        postId,
        { author: toUserId },
        { session, new: true }
      );

      // Update post counts (giả sử User có postCount field)
      await User.findByIdAndUpdate(fromUserId, { $inc: { postCount: -1 } }, { session });
      await User.findByIdAndUpdate(toUserId,   { $inc: { postCount:  1 } }, { session });

      transferred = true;
    });

    res.json({ success: true, transferred });
  } finally {
    session.endSession();
  }
});`;

const MISTAKE = `// ❌ Sai lầm 1: create() nhận object, không array — session không áp dụng!
// Khi dùng session, create() phải nhận ARRAY, không object đơn
await User.create({ name: 'An' }, { session }); // session bị ignore!

// ✅ create() với session phải là array
await User.create([{ name: 'An' }], { session }); // [{}] — array chứa 1 object

// ❌ Sai lầm 2: Quên truyền session cho 1 operation trong transaction
await session.withTransaction(async () => {
  const [user] = await User.create([userData], { session });   // có session ✅
  await Profile.create([profileData], { session });            // có session ✅
  await Post.create([postData]);  // KHÔNG có session! → không trong transaction!
  // Nếu Profile.create fail → User rollback, nhưng Post đã tồn tại!
});

// ✅ Tất cả operations PHẢI có { session }
await session.withTransaction(async () => {
  const [user]    = await User.create(   [userData],    { session });
  const [profile] = await Profile.create([profileData], { session });
  const [post]    = await Post.create(   [postData],    { session });
});

// ❌ Sai lầm 3: Dùng session.startTransaction() + commit/abort thủ công
// Dễ quên commit hoặc abort trong mọi code path
const session = await mongoose.startSession();
session.startTransaction();
try {
  await User.create([userData], { session });
  await session.commitTransaction(); // phải nhớ commit
} catch (err) {
  await session.abortTransaction(); // phải nhớ abort
  throw err;
} finally {
  session.endSession(); // phải nhớ endSession
}

// ✅ withTransaction() tự handle commit/abort/retry
await session.withTransaction(async () => {
  await User.create([userData], { session });
  // Nếu throw → auto abort. Nếu ok → auto commit. Retry transient errors tự động.
});`;

export default function Lesson08({ isDone, onToggleDone }: Props) {
  return (
    <LessonCard
      id="lesson-05-08"
      num="08"
      title="Transactions với ClientSession"
      desc="ACID transactions, ClientSession type, withTransaction(), session.endSession(), create() array syntax"
      priority="medium"
      isDone={isDone}
      onToggleDone={onToggleDone}
    >
      <Sec title="Khái niệm">
        MongoDB transactions (từ v4.0 với replica set, v4.2 với sharded cluster) đảm bảo ACID: nhiều
        operations trong 1 transaction đều thành công hoặc đều rollback. Dùng khi cần update nhiều
        collections mà data phải nhất quán (create user + profile cùng lúc, transfer ownership...).
        Mongoose export <code>ClientSession</code> type từ MongoDB driver — phải truyền{' '}
        <code>{'{ session }'}</code> vào <strong>tất cả</strong> operations trong transaction.
      </Sec>

      <Sec title="Luồng hoạt động">
        <Flow
          steps={[
            'mongoose.startSession() → tạo ClientSession instance (typed)',
            'session.withTransaction(async () => {...}) → auto start transaction',
            'Tất cả Model operations truyền { session } để participate trong transaction',
            'Nếu callback throw error → withTransaction tự abort transaction + retry transient errors',
            'Nếu callback resolve → withTransaction tự commit transaction',
            'finally: session.endSession() — luôn phải gọi để release connection về pool',
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
                'import { ClientSession } from "mongoose" — type re-exported từ MongoDB Node.js driver. ClientSession là object quản lý transaction context. Mongoose truyền session xuống MongoDB driver khi có { session } option.',
            },
            {
              line: '2',
              explanation:
                'User.create([userData], { session }) — quan trọng: phải là ARRAY (wrap trong []). Đây là quirk của Mongoose: create() với session option chỉ hoạt động với array syntax. create(object, {session}) bị ignore.',
            },
            {
              line: '3',
              explanation:
                'session.withTransaction(async () => {...}) — recommended approach. Auto handles: startTransaction(), commitTransaction() nếu ok, abortTransaction() nếu error, retry với transient network errors (WriteConflict, TransientTransactionError).',
            },
            {
              line: '4',
              explanation:
                'finally { session.endSession() } — phải gọi dù transaction thành công hay thất bại. endSession() trả connection về pool. Nếu quên → connection leak → app chậm dần rồi crash.',
            },
          ]}
        />
      </Sec>

      <Sec title="Lỗi thường gặp">
        <Callout type="warn">
          Transactions yêu cầu MongoDB chạy dưới dạng <strong>replica set</strong>, không phải
          standalone. MongoDB Atlas luôn là replica set. Môi trường local: chạy{' '}
          <code>mongod --replSet rs0</code> và khởi tạo với <code>rs.initiate()</code>. Nếu không,
          transaction sẽ throw{' '}
          <code>MongoServerError: Transaction numbers are only allowed...</code>
        </Callout>
        <Callout type="note">
          Transactions có overhead — mỗi operation cần round trip thêm để coordinate. Chỉ dùng khi
          thực sự cần atomicity (multi-collection update). Với single document update, MongoDB đã
          atomic mặc định — không cần transaction. Nếu operations độc lập, dùng{' '}
          <code>Promise.all()</code> thay transaction để chạy song song.
        </Callout>
      </Sec>

      <Sec title="Bài tập thực hành">
        <ExerciseSection
          exercises={[
            {
              level: 'basic',
              text: 'Viết createUserWithProfile() function dùng transaction: tạo User + Profile trong 1 atomic operation. Nếu Profile.create fail, User phải rollback. Test bằng cách tạo Profile với required field bị thiếu.',
            },
            {
              level: 'medium',
              text: 'Implement POST /posts/:id/purchase: trừ credits của buyer, cộng credits cho seller, update post.soldTo = buyerId. 3 operations, tất cả trong 1 transaction. Type đầy đủ, handle AppError đúng cách.',
            },
            {
              level: 'hard',
              text: 'Viết generic transactional<T>(operations: (session: ClientSession) => Promise<T>) wrapper function. Tự quản lý startSession + withTransaction + endSession. Dùng để refactor createUserWithProfile và purchase endpoint. TypeScript generic T cho return type.',
            },
          ]}
          hint="Generic wrapper pattern: async function transactional<T>(fn: (session: ClientSession) => Promise<T>): Promise<T> { const session = await mongoose.startSession(); try { let result: T; await session.withTransaction(async () => { result = await fn(session); }); return result!; } finally { session.endSession(); } }"
        />
      </Sec>
    </LessonCard>
  );
}
