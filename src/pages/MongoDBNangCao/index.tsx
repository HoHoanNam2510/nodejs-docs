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

export default function MongoDBNangCao() {
  const { done, toggle, count, pct } = useProgress('module_05', 8);
  const t = (id: string) => () => toggle(id);

  return (
    <div style={{ paddingTop: 'var(--nav-h)' }}>
      <PageHeader
        moduleNum="Module 05"
        title="MongoDB Nâng Cao với TypeScript"
        subtitle="Indexes, Aggregation Pipeline typed, Mongoose hooks, virtuals & methods, transactions"
        priority="medium"
        time="~3 giờ"
        lessonCount={8}
        prevLink={{ to: '/04-mongodb-core', label: 'MongoDB Core' }}
        nextLink={{ to: '/06-authentication', label: 'Authentication' }}
        prereqs={['Module 04 — MongoDB & Mongoose Core', 'TypeScript Generics (Module 01)']}
      />

      <TocBar count={count} total={8} pct={pct} links={TOC_LINKS} />

      <div className="section">
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={GROUP_LABEL_STYLE}>Nhóm A — Query Performance & Aggregation</div>
          <Lesson01 isDone={done.has('l01')} onToggleDone={t('l01')} />
          <Lesson02 isDone={done.has('l02')} onToggleDone={t('l02')} />
          <Lesson03 isDone={done.has('l03')} onToggleDone={t('l03')} />
          <Lesson04 isDone={done.has('l04')} onToggleDone={t('l04')} />
          <Lesson05 isDone={done.has('l05')} onToggleDone={t('l05')} />

          <div style={{ ...GROUP_LABEL_STYLE, marginTop: '2.5rem' }}>
            Nhóm B — Schema nâng cao & Transactions
          </div>
          <Lesson06 isDone={done.has('l06')} onToggleDone={t('l06')} />
          <Lesson07 isDone={done.has('l07')} onToggleDone={t('l07')} />
          <Lesson08 isDone={done.has('l08')} onToggleDone={t('l08')} />

          <ProjectSection />

          <div className="related-section">
            <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Kiến thức liên quan</h3>
            <div className="related-grid">
              <div>
                <div className="related-col-title">Cần biết trước</div>
                <a href="/04-mongodb-core#lesson-04-03" className="related-link">
                  Schema{'<IUser>'} generic
                </a>
                <a href="/04-mongodb-core#lesson-04-08" className="related-link">
                  FilterQuery{'<T>'} operators
                </a>
                <a href="/01-nen-tang#lesson-01-05" className="related-link">
                  TypeScript Generics
                </a>
              </div>
              <div>
                <div className="related-col-title">Học tiếp theo</div>
                <a href="/06-authentication" className="related-link">
                  bcrypt pre-save hook
                </a>
                <a href="/06-authentication" className="related-link">
                  JWT auth với typed payload
                </a>
                <a href="/07-thucchien" className="related-link">
                  Social Blog API full build
                </a>
              </div>
              <div>
                <div className="related-col-title">Cùng chủ đề</div>
                <a href="#lesson-05-02" className="related-link">
                  PipelineStage[] type
                </a>
                <a href="#lesson-05-04" className="related-link">
                  aggregate{'<AuthorStats>'}()
                </a>
                <a href="#lesson-05-07" className="related-link">
                  3-generic Schema pattern
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ModuleFooter
        prev={{ to: '/04-mongodb-core', label: 'MongoDB & Mongoose Core' }}
        next={{ to: '/06-authentication', label: 'Authentication & Security' }}
        moduleLabel="Module 05/07"
      />
    </div>
  );
}
