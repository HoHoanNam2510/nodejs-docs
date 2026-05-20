import PageHeader from '../../components/PageHeader';
import TocBar from '../../components/TocBar';
import ModuleFooter from '../../components/ModuleFooter';
import { useProgress } from '../../hooks/useProgress';
import { TOC_LINKS } from './_toc';
import Lesson01 from './Lesson01';
import Lesson02 from './Lesson02';
import Lesson03 from './Lesson03';
import Lesson04 from './Lesson04';
import Lesson05 from './Lesson05';
import Lesson06 from './Lesson06';
import Lesson07 from './Lesson07';
import Lesson08 from './Lesson08';
import Lesson09 from './Lesson09';
import ProjectSection from './ProjectSection';

const GROUP_LABEL_STYLE: React.CSSProperties = {
  fontFamily: 'var(--font-mono)',
  fontSize: 11,
  color: 'var(--text3)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  margin: '2rem 0 1rem',
  paddingBottom: 8,
  borderBottom: '1px solid var(--border)',
};

export default function ExpressNangCao() {
  const { done, toggle, count, pct } = useProgress('module_03', 9);
  const t = (id: string) => () => toggle(id);

  return (
    <div style={{ paddingTop: 'var(--nav-h)' }}>
      <PageHeader
        moduleNum="Module 03"
        title="Express.js Nâng Cao với TypeScript"
        subtitle="Router, zod validation, multer, CORS, rate limiting, AppError, ApiResponse<T>"
        priority="high"
        time="~3.5 giờ"
        lessonCount={9}
        prevLink={{ to: '/02-express-core', label: 'Express Core' }}
        nextLink={{ to: '/04-mongodb-core', label: 'MongoDB Core' }}
        prereqs={['Module 02 — Express Core', 'TypeScript cơ bản']}
      />

      <TocBar count={count} total={9} pct={pct} links={TOC_LINKS} />

      <div className="section">
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={GROUP_LABEL_STYLE}>Nhóm A — Kiến trúc & Cấu trúc</div>
          <Lesson01 isDone={done.has('l01')} onToggleDone={t('l01')} />
          <Lesson02 isDone={done.has('l02')} onToggleDone={t('l02')} />
          <Lesson03 isDone={done.has('l03')} onToggleDone={t('l03')} />
          <Lesson04 isDone={done.has('l04')} onToggleDone={t('l04')} />

          <div style={{ ...GROUP_LABEL_STYLE, marginTop: '2.5rem' }}>
            Nhóm B — Middleware & Security
          </div>
          <Lesson05 isDone={done.has('l05')} onToggleDone={t('l05')} />
          <Lesson06 isDone={done.has('l06')} onToggleDone={t('l06')} />
          <Lesson07 isDone={done.has('l07')} onToggleDone={t('l07')} />
          <Lesson08 isDone={done.has('l08')} onToggleDone={t('l08')} />
          <Lesson09 isDone={done.has('l09')} onToggleDone={t('l09')} />

          <ProjectSection />

          <div className="related-section">
            <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Kiến thức liên quan</h3>
            <div className="related-grid">
              <div>
                <div className="related-col-title">Cần biết trước</div>
                <a href="/02-express-core#lesson-02-06" className="related-link">
                  Middleware basics
                </a>
                <a href="/02-express-core#lesson-02-09" className="related-link">
                  Error handling middleware
                </a>
                <a href="/01-nen-tang#lesson-01-03" className="related-link">
                  TypeScript Interfaces
                </a>
              </div>
              <div>
                <div className="related-col-title">Học tiếp theo</div>
                <a href="/04-mongodb-core" className="related-link">
                  Mongoose Schema generics
                </a>
                <a href="/04-mongodb-core" className="related-link">
                  MongoDB CRUD typed
                </a>
                <a href="/06-authentication" className="related-link">
                  JWT + bcrypt
                </a>
              </div>
              <div>
                <div className="related-col-title">Cùng chủ đề</div>
                <a href="#lesson-03-04" className="related-link">
                  Zod schema inference
                </a>
                <a href="#lesson-03-08" className="related-link">
                  AppError hierarchy
                </a>
                <a href="#lesson-03-09" className="related-link">
                  ApiResponse&lt;T&gt; pattern
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ModuleFooter
        prev={{ to: '/02-express-core', label: 'Express.js Core' }}
        next={{ to: '/04-mongodb-core', label: 'MongoDB & Mongoose Core' }}
        moduleLabel="Module 03/07"
      />
    </div>
  );
}
