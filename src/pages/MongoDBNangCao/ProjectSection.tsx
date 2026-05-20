import CodeBlock from '../../components/CodeBlock';
import Callout from '../../components/Callout';

const AUTHOR_STATS_CODE = `// src/analytics/blog.analytics.ts
import { PipelineStage, Types } from 'mongoose';
import { Post }    from '../models/Post';
import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';

// --- Interface cho result types ---
interface AuthorStats {
  _id:        Types.ObjectId;
  authorName: string;
  authorEmail: string;
  totalPosts:  number;
  totalViews:  number;
  avgViews:    number;
  tags:        string[]; // unique tags từ tất cả posts của author
}

// GET /analytics/authors — top authors theo tổng views
export const getAuthorStats = asyncHandler(async (_req: Request, res: Response) => {
  const pipeline: PipelineStage[] = [
    { $match: { published: true } },

    // Unwind tags trước khi group để collect unique tags per author
    // (sẽ join lại sau với $group và $addToSet)
    {
      $group: {
        _id:        '$author',
        totalPosts: { $sum: 1 },
        totalViews: { $sum: '$views' },
        avgViews:   { $avg: '$views' },
        tags:       { $addToSet: '$tags' }, // array of arrays
      },
    },

    // Sort theo totalViews giảm dần
    { $sort: { totalViews: -1 } },

    // Top 10 authors
    { $limit: 10 },

    // Join với User để lấy name và email
    {
      $lookup: {
        from:         'users',
        localField:   '_id',
        foreignField: '_id',
        as:           'authorInfo',
      },
    },
    { $unwind: '$authorInfo' },

    // Flatten tags (array of arrays → flat array) và dedupe
    {
      $project: {
        _id:         1,
        authorName:  '$authorInfo.name',
        authorEmail: '$authorInfo.email',
        totalPosts:  1,
        totalViews:  1,
        avgViews:    { $round: ['$avgViews', 0] },
        // $reduce để flatten array of arrays
        tags: {
          $reduce: {
            input:        '$tags',
            initialValue: [] as string[],
            in: { $setUnion: ['$$value', '$$this'] },
          },
        },
      },
    },
  ];

  const stats = await Post.aggregate<AuthorStats>(pipeline);
  res.json({ success: true, data: stats });
});`;

const TOP_POSTS_CODE = `// src/analytics/blog.analytics.ts (tiếp theo)
interface TopPost {
  _id:         Types.ObjectId;
  title:       string;
  slug:        string;
  views:       number;
  authorName:  string;
  tags:        string[];
  publishedAt: Date;
  rank:        number; // thứ hạng 1, 2, 3...
}

// GET /analytics/top-posts?period=week|month|all
export const getTopPosts = asyncHandler(async (req: Request, res: Response) => {
  const period = (req.query.period as string) || 'month';

  // Tính date filter dựa vào period
  const dateFilter: Record<string, Date> = {};
  if (period === 'week') {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    dateFilter['$gte'] = weekAgo;
  } else if (period === 'month') {
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    dateFilter['$gte'] = monthAgo;
  }

  const matchStage: Record<string, unknown> = { published: true };
  if (Object.keys(dateFilter).length > 0) {
    matchStage.createdAt = dateFilter;
  }

  const pipeline: PipelineStage[] = [
    { $match: matchStage },
    { $sort: { views: -1 } },
    { $limit: 20 },

    // Join author
    {
      $lookup: {
        from:         'users',
        localField:   'author',
        foreignField: '_id',
        as:           'authorInfo',
        pipeline: [{ $project: { name: 1 } }], // chỉ lấy name
      },
    },
    { $unwind: '$authorInfo' },

    {
      $project: {
        title:       1,
        slug:        1,
        views:       1,
        tags:        1,
        authorName:  '$authorInfo.name',
        publishedAt: '$createdAt',
      },
    },
  ];

  const posts = await Post.aggregate<Omit<TopPost, 'rank'>>(pipeline);

  // Thêm rank sau khi aggregate (hoặc dùng $setWindowFields nếu MongoDB 5.0+)
  const rankedPosts: TopPost[] = posts.map((p, i) => ({ ...p, rank: i + 1 }));

  res.json({ success: true, period, data: rankedPosts });
});`;

export default function ProjectSection() {
  return (
    <div style={{ marginTop: '3rem' }}>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text3)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: '1rem',
          paddingBottom: 8,
          borderBottom: '1px solid var(--border)',
        }}
      >
        Project cuối module
      </div>

      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '1.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              background: '#fbbf2415',
              color: '#fbbf24',
              border: '1px solid #fbbf2430',
              borderRadius: 4,
              padding: '2px 8px',
            }}
          >
            MEDIUM
          </div>
          <h3 style={{ margin: 0, fontSize: '1.05rem' }}>
            Blog API — Analytics Endpoints với Typed Aggregation
          </h3>
        </div>

        <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.6, marginBottom: '1rem' }}>
          Xây dựng 2 analytics endpoints cho Blog API dùng kiến thức từ Module 05: Aggregation
          Pipeline, $lookup, $group, $sort, typed result với generic interfaces.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginBottom: '1.5rem',
          }}
        >
          {[
            {
              label: 'GET /analytics/authors',
              desc: 'Top 10 authors theo tổng views — join User, flatten tags, AuthorStats typed',
            },
            {
              label: 'GET /analytics/top-posts',
              desc: 'Top 20 posts theo period (week/month/all) — date filter, $lookup author, rank field',
            },
          ].map(item => (
            <div
              key={item.label}
              style={{
                background: 'var(--bg3)',
                border: '1px solid var(--border)',
                borderRadius: 6,
                padding: '0.75rem 1rem',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 11,
                  color: 'var(--accent)',
                  marginBottom: 4,
                }}
              >
                {item.label}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text3)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.5rem',
            }}
          >
            Endpoint 1 — Author Stats
          </div>
          <CodeBlock code={AUTHOR_STATS_CODE} />
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text3)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.5rem',
            }}
          >
            Endpoint 2 — Top Posts
          </div>
          <CodeBlock code={TOP_POSTS_CODE} />
        </div>

        <Callout type="note">
          <strong>TypeScript checklist:</strong> Tất cả interface kết quả đều typed (AuthorStats,
          TopPost). Generic <code>aggregate&lt;T&gt;()</code> trên tất cả pipeline calls. Không có{' '}
          <code>any</code> type untyped. Date filter được build dynamically nhưng vẫn type-safe với{' '}
          <code>Record&lt;string, unknown&gt;</code>.
        </Callout>

        <div style={{ marginTop: '1rem' }}>
          <div
            style={{
              fontSize: 11,
              color: 'var(--text3)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.5rem',
            }}
          >
            Mở rộng (tự làm thêm)
          </div>
          <ul
            style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.8, paddingLeft: '1.2rem' }}
          >
            <li>
              Thêm index <code>{'{author: 1, published: 1, views: -1}'}</code> để optimize
              AuthorStats pipeline
            </li>
            <li>
              Implement <code>GET /analytics/tags</code> — top tags theo số posts và tổng views
            </li>
            <li>
              Cache analytics endpoints bằng Redis (TTL 5 phút) — analytics không cần realtime
            </li>
            <li>
              Thêm <code>$setWindowFields</code> (MongoDB 5.0+) để tính rank trong pipeline thay vì
              JS <code>.map()</code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
