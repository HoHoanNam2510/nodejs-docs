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
import Lesson10 from './Lesson10';
import Lesson11 from './Lesson11';
import Lesson12 from './Lesson12';
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

export default function MongoDBCore() {
  const { done, toggle, count, pct } = useProgress('module_04', 12);
  const t = (id: string) => () => toggle(id);

  return (
    <div style={{ paddingTop: 'var(--nav-h)' }}>
      <PageHeader
        moduleNum="Module 04"
        title="MongoDB & Mongoose Core với TypeScript"
        subtitle="Schema generics, typed CRUD, FilterQuery<T>, pagination, populate — Mongoose + TypeScript"
        priority="high"
        time="~4 giờ"
        lessonCount={12}
        prevLink={{ to: '/03-express-nangcao', label: 'Express Nâng Cao' }}
        nextLink={{ to: '/05-mongodb-nangcao', label: 'MongoDB Nâng Cao' }}
        prereqs={[
          'Module 02 — Express Core',
          'Module 03 — Express Nâng Cao',
          'MongoDB Atlas account',
        ]}
      />

      <TocBar count={count} total={12} pct={pct} links={TOC_LINKS} />

      <div className="section">
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={GROUP_LABEL_STYLE}>Nhóm A — Nền tảng MongoDB & Mongoose</div>
          <Lesson01 isDone={done.has('l01')} onToggleDone={t('l01')} />
          <Lesson02 isDone={done.has('l02')} onToggleDone={t('l02')} />
          <Lesson03 isDone={done.has('l03')} onToggleDone={t('l03')} />
          <Lesson04 isDone={done.has('l04')} onToggleDone={t('l04')} />
          <Lesson05 isDone={done.has('l05')} onToggleDone={t('l05')} />

          <div style={{ ...GROUP_LABEL_STYLE, marginTop: '2.5rem' }}>
            Nhóm B — CRUD với TypeScript
          </div>
          <Lesson06 isDone={done.has('l06')} onToggleDone={t('l06')} />
          <Lesson07 isDone={done.has('l07')} onToggleDone={t('l07')} />
          <Lesson08 isDone={done.has('l08')} onToggleDone={t('l08')} />
          <Lesson09 isDone={done.has('l09')} onToggleDone={t('l09')} />
          <Lesson10 isDone={done.has('l10')} onToggleDone={t('l10')} />

          <div style={{ ...GROUP_LABEL_STYLE, marginTop: '2.5rem' }}>Nhóm C — Query nâng cao</div>
          <Lesson11 isDone={done.has('l11')} onToggleDone={t('l11')} />
          <Lesson12 isDone={done.has('l12')} onToggleDone={t('l12')} />

          <ProjectSection />

          <div className="related-section">
            <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Kiến thức liên quan</h3>
            <div className="related-grid">
              <div>
                <div className="related-col-title">Cần biết trước</div>
                <a href="/02-express-core#lesson-02-05" className="related-link">
                  Request body typing
                </a>
                <a href="/03-express-nangcao#lesson-03-08" className="related-link">
                  AppError + asyncHandler
                </a>
                <a href="/01-nen-tang#lesson-01-05" className="related-link">
                  TypeScript Generics
                </a>
              </div>
              <div>
                <div className="related-col-title">Học tiếp theo</div>
                <a href="/05-mongodb-nangcao" className="related-link">
                  Aggregation Pipeline typed
                </a>
                <a href="/05-mongodb-nangcao" className="related-link">
                  Mongoose hooks với TS
                </a>
                <a href="/06-authentication" className="related-link">
                  JWT + bcrypt auth
                </a>
              </div>
              <div>
                <div className="related-col-title">Cùng chủ đề</div>
                <a href="#lesson-04-03" className="related-link">
                  Schema&lt;IUser&gt; generic
                </a>
                <a href="#lesson-04-11" className="related-link">
                  paginate&lt;T&gt;() pattern
                </a>
                <a href="#lesson-04-12" className="related-link">
                  populate&lt;&#123; author: IUser &#125;&gt;()
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ModuleFooter
        prev={{ to: '/03-express-nangcao', label: 'Express.js Nâng Cao' }}
        next={{ to: '/05-mongodb-nangcao', label: 'MongoDB Nâng Cao' }}
        moduleLabel="Module 04/07"
      />
    </div>
  );
}
