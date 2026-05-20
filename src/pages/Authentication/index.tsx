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

export default function Authentication() {
  const { done, toggle, count, pct } = useProgress('module_06', 10);
  const t = (id: string) => () => toggle(id);

  return (
    <div style={{ paddingTop: 'var(--nav-h)' }}>
      <PageHeader
        moduleNum="Module 06"
        title="Authentication & Security"
        subtitle="bcrypt, JWT typed, refresh token, req.user typed, RBAC, Helmet, NoSQL injection"
        priority="high"
        time="~4 giờ"
        lessonCount={10}
        prevLink={{ to: '/05-mongodb-nangcao', label: 'MongoDB Nâng Cao' }}
        nextLink={{ to: '/07-thucchien', label: 'Social Blog API' }}
        prereqs={['Module 04 — MongoDB & Mongoose Core', 'Module 03 — Express Nâng Cao']}
      />

      <TocBar count={count} total={10} pct={pct} links={TOC_LINKS} />

      <div className="section">
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={GROUP_LABEL_STYLE}>Nhóm A — Core Authentication</div>
          <Lesson01 isDone={done.has('l01')} onToggleDone={t('l01')} />
          <Lesson02 isDone={done.has('l02')} onToggleDone={t('l02')} />
          <Lesson03 isDone={done.has('l03')} onToggleDone={t('l03')} />
          <Lesson04 isDone={done.has('l04')} onToggleDone={t('l04')} />
          <Lesson05 isDone={done.has('l05')} onToggleDone={t('l05')} />

          <div style={{ ...GROUP_LABEL_STYLE, marginTop: '2.5rem' }}>
            Nhóm B — Authorization & Security
          </div>
          <Lesson06 isDone={done.has('l06')} onToggleDone={t('l06')} />
          <Lesson07 isDone={done.has('l07')} onToggleDone={t('l07')} />
          <Lesson08 isDone={done.has('l08')} onToggleDone={t('l08')} />
          <Lesson09 isDone={done.has('l09')} onToggleDone={t('l09')} />
          <Lesson10 isDone={done.has('l10')} onToggleDone={t('l10')} />

          <ProjectSection />

          <div className="related-section">
            <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Kiến thức liên quan</h3>
            <div className="related-grid">
              <div>
                <div className="related-col-title">Cần biết trước</div>
                <a href="/03-express-nangcao#lesson-03-08" className="related-link">
                  asyncHandler wrapper
                </a>
                <a href="/03-express-nangcao#lesson-03-04" className="related-link">
                  zod validation
                </a>
                <a href="/05-mongodb-nangcao#lesson-05-06" className="related-link">
                  Mongoose pre-save hook
                </a>
              </div>
              <div>
                <div className="related-col-title">Học tiếp theo</div>
                <a href="/07-thucchien" className="related-link">
                  Auth layer trong Social Blog API
                </a>
                <a href="/07-thucchien" className="related-link">
                  RBAC trong thực chiến
                </a>
                <a href="/07-thucchien" className="related-link">
                  Pre-deploy security checklist
                </a>
              </div>
              <div>
                <div className="related-col-title">Cùng chủ đề</div>
                <a href="#lesson-06-03" className="related-link">
                  JwtPayload typed interface
                </a>
                <a href="#lesson-06-07" className="related-link">
                  Token rotation pattern
                </a>
                <a href="#lesson-06-08" className="related-link">
                  requireRole literal union
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ModuleFooter
        prev={{ to: '/05-mongodb-nangcao', label: 'MongoDB Nâng Cao' }}
        next={{ to: '/07-thucchien', label: 'Social Blog API — Thực Chiến' }}
        moduleLabel="Module 06/07"
      />
    </div>
  );
}
