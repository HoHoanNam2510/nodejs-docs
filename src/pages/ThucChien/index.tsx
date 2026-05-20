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

export default function ThucChien() {
  const { done, toggle, count, pct } = useProgress('module_07', 8);
  const t = (id: string) => () => toggle(id);

  return (
    <div style={{ paddingTop: 'var(--nav-h)' }}>
      <PageHeader
        moduleNum="Module 07"
        title="Social Blog API — Thực Chiến"
        subtitle="Build đầy đủ từ zero: auth, posts, comments, likes, RBAC, deploy — 100% TypeScript strict"
        priority="high"
        time="~8 giờ"
        lessonCount={8}
        prevLink={{ to: '/06-authentication', label: 'Authentication & Security' }}
        prereqs={['Module 01–06 hoàn thành', 'TypeScript strict mode', 'MongoDB Atlas']}
      />

      <TocBar count={count} total={8} pct={pct} links={TOC_LINKS} />

      <div className="section">
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={GROUP_LABEL_STYLE}>Giai đoạn 1 — Foundation</div>
          <Lesson01 isDone={done.has('l01')} onToggleDone={t('l01')} />
          <Lesson02 isDone={done.has('l02')} onToggleDone={t('l02')} />

          <div style={{ ...GROUP_LABEL_STYLE, marginTop: '2.5rem' }}>
            Giai đoạn 2 — Core Features
          </div>
          <Lesson03 isDone={done.has('l03')} onToggleDone={t('l03')} />
          <Lesson04 isDone={done.has('l04')} onToggleDone={t('l04')} />
          <Lesson05 isDone={done.has('l05')} onToggleDone={t('l05')} />

          <div style={{ ...GROUP_LABEL_STYLE, marginTop: '2.5rem' }}>
            Giai đoạn 3 — Polish & Deploy
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
                <a href="/06-authentication#lesson-06-06" className="related-link">
                  authenticate middleware
                </a>
                <a href="/06-authentication#lesson-06-08" className="related-link">
                  requireRole RBAC
                </a>
                <a href="/04-mongodb-core#lesson-04-12" className="related-link">
                  Populate với TypeScript
                </a>
              </div>
              <div>
                <div className="related-col-title">Học tiếp theo</div>
                <a href="/05-mongodb-nangcao#lesson-05-02" className="related-link">
                  Aggregation Pipeline
                </a>
                <a href="/06-authentication#lesson-06-07" className="related-link">
                  Refresh token rotation
                </a>
                <a href="#lesson-07-08" className="related-link">
                  Deploy lên Railway/Render
                </a>
              </div>
              <div>
                <div className="related-col-title">Cùng chủ đề</div>
                <a href="#lesson-07-02" className="related-link">
                  Interface-first design
                </a>
                <a href="#lesson-07-07" className="related-link">
                  asyncHandler + AppError
                </a>
                <a href="#lesson-07-08" className="related-link">
                  TypeScript pre-deploy checklist
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ModuleFooter
        prev={{ to: '/06-authentication', label: 'Authentication & Security' }}
        moduleLabel="Module 07/07"
      />
    </div>
  );
}
