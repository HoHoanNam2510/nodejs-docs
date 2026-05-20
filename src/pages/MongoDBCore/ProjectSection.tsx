import CodeTabs from '../../components/CodeTabs';
import Callout from '../../components/Callout';

const INTERFACES = `// src/types/blog.ts — Tất cả interfaces trước khi viết code
import { Types } from 'mongoose';

export interface IUser {
  name:      string;
  email:     string;
  password:  string;
  bio?:      string;
  avatar?:   string;
  role:      'user' | 'admin';
  isActive:  boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPost {
  title:     string;
  content:   string;
  slug:      string;
  author:    Types.ObjectId | IUser;
  tags:      string[];
  published: boolean;
  views:     number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment {
  content:   string;
  post:      Types.ObjectId | IPost;
  author:    Types.ObjectId | IUser;
  likes:     number;
  createdAt: Date;
  updatedAt: Date;
}`;

const MODELS = `// src/models/User.ts
import { Schema, model, Model } from 'mongoose';
import { IUser } from '../types/blog';

interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<(typeof User.prototype) | null>;
}

const userSchema = new Schema<IUser>(
  {
    name:     { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    bio:      { type: String, default: '' },
    avatar:   { type: String, default: '' },
    role:     { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email }).select('+password');
};

export const User = model<IUser, IUserModel>('User', userSchema);

// src/models/Post.ts
import { Schema, model, Types } from 'mongoose';
import { IPost } from '../types/blog';

const postSchema = new Schema<IPost>(
  {
    title:     { type: String, required: true, trim: true },
    content:   { type: String, required: true },
    slug:      { type: String, required: true, unique: true, lowercase: true },
    author:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags:      [{ type: String, lowercase: true, trim: true }],
    published: { type: Boolean, default: false },
    views:     { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

postSchema.index({ slug: 1 }, { unique: true });
postSchema.index({ tags: 1 });
postSchema.index({ author: 1, createdAt: -1 });

export const Post = model<IPost>('Post', postSchema);

// src/models/Comment.ts
import { IComment } from '../types/blog';

const commentSchema = new Schema<IComment>(
  {
    content: { type: String, required: true, trim: true, maxlength: 1000 },
    post:    { type: Schema.Types.ObjectId, ref: 'Post', required: true },
    author:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
    likes:   { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export const Comment = model<IComment>('Comment', commentSchema);`;

const CRUD = `// src/controllers/post.controller.ts — CRUD typed hoàn chỉnh
import { Request, Response } from 'express';
import { Post, IPost } from '../models/Post';
import { Comment } from '../models/Comment';
import { IUser } from '../types/blog';
import { AppError } from '../utils/errors';
import { asyncHandler } from '../utils/asyncHandler';
import { paginate, PaginationResult } from '../utils/paginate';
import { isValidObjectId } from 'mongoose';
import { z } from 'zod';

const CreatePostSchema = z.object({
  title:   z.string().min(3).max(200),
  content: z.string().min(10),
  tags:    z.array(z.string().toLowerCase()).max(10).optional().default([]),
});

// GET /posts — list với pagination + author populated
export const getPosts = asyncHandler(async (req: Request, res: Response) => {
  const page  = Number(req.query.page)  || 1;
  const limit = Math.min(Number(req.query.limit) || 10, 50);

  const result: PaginationResult<IPost> = await paginate(
    Post,
    { published: true },
    {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: { path: 'author', select: 'name email avatar' },
    }
  );

  res.json({ success: true, ...result });
});

// POST /posts — tạo post mới
export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const body = CreatePostSchema.parse(req.body);
  const slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const post = await Post.create({
    ...body,
    slug,
    author: req.user!._id,
  });

  res.status(201).json({ success: true, data: post });
});

// GET /posts/:id — chi tiết với populate
export const getPostById = asyncHandler(async (
  req: Request<{ id: string }>,
  res: Response
) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) throw new AppError('ID không hợp lệ', 400);

  // Tăng view count atomic
  const post = await Post.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate<{ author: IUser }>('author', 'name email avatar bio')
    .select('-__v');

  if (!post) throw new AppError('Post không tìm thấy', 404);

  // Lấy comments riêng (tránh over-populate)
  const comments = await Comment.find({ post: id })
    .populate<{ author: IUser }>('author', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(20)
    .select('-__v');

  res.json({ success: true, data: { post, comments } });
});`;

const GROUP_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  color: 'var(--text3)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginTop: '2.5rem',
  marginBottom: '1rem',
  paddingBottom: 8,
  borderBottom: '1px solid var(--border)',
};

export default function ProjectSection() {
  return (
    <div style={{ marginTop: '3rem' }}>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '2rem',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--accent)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '0.5rem',
          }}
        >
          Project cuối module
        </div>
        <h2
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
          }}
        >
          Blog API Skeleton — TypeScript + Mongoose
        </h2>
        <p style={{ color: 'var(--text2)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Xây dựng skeleton đầy đủ cho Social Blog API: 3 models typed (User, Post, Comment), CRUD
          endpoints, generic pagination, populate relationships. Đây là nền tảng cho Module 05–07.
        </p>

        <div style={GROUP_STYLE}>Bước 1 — Interfaces</div>
        <Callout type="note">
          Viết toàn bộ interfaces trong <code>src/types/blog.ts</code> trước khi tạo models hoặc
          routes. Interface là hợp đồng — định nghĩa shape của data xuyên suốt codebase.
        </Callout>
        <CodeTabs tabs={[{ label: 'types/blog.ts', code: INTERFACES }]} />

        <div style={GROUP_STYLE}>Bước 2 — Models</div>
        <Callout type="note">
          Mỗi model trong file riêng. Index quan trọng: slug (unique), tags (query by tag), author +
          createdAt (list posts by author, sorted).
        </Callout>
        <CodeTabs tabs={[{ label: 'models/*.ts', code: MODELS }]} />

        <div style={GROUP_STYLE}>Bước 3 — CRUD Controllers</div>
        <Callout type="note">
          Tất cả controllers dùng <code>asyncHandler</code>. Pagination dùng generic{' '}
          <code>paginate&lt;T&gt;()</code>. Populate với TypeScript generics. View count dùng{' '}
          <code>$inc</code> atomic.
        </Callout>
        <CodeTabs tabs={[{ label: 'controllers/post.controller.ts', code: CRUD }]} />

        <div style={GROUP_STYLE}>Checklist hoàn thành</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            'IUser, IPost, IComment interfaces trong src/types/blog.ts',
            'User model với static findByEmail, password select: false',
            'Post model với indexes (slug, tags, author+date)',
            'Comment model với ref đến Post và User',
            'GET /posts — pagination + populate author',
            'POST /posts — tạo với slug tự generate',
            'GET /posts/:id — atomic view count + comments',
            'PATCH /posts/:id — partial update với Zod validation',
            'DELETE /posts/:id — cascade delete comments',
            'Generic paginate<T>() function tái sử dụng',
          ].map((item, i) => (
            <div
              key={i}
              style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13 }}
            >
              <span style={{ color: 'var(--accent)', marginTop: 1, flexShrink: 0 }}>✓</span>
              <span style={{ color: 'var(--text2)' }}>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
