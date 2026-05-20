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
import Lesson13 from './Lesson13';
import Lesson14 from './Lesson14';
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

export default function NenTang() {
  const { done, toggle, count, pct } = useProgress('module_01', 14);
  const t = (id: string) => () => toggle(id);

  return (
    <div style={{ paddingTop: 'var(--nav-h)' }}>
      <PageHeader
        moduleNum="Module 01"
        title="Nền Tảng TypeScript & HTTP"
        subtitle="Những thứ cần biết trước khi học Express"
        priority="high"
        time="~4 giờ"
        lessonCount={14}
        prevLink={{ to: '/', label: 'Trang chủ' }}
        nextLink={{ to: '/02-express-core', label: 'Express Core' }}
        prereqs={['JavaScript cơ bản', 'Node.js 18+ installed']}
      />

      <TocBar count={count} total={14} pct={pct} links={TOC_LINKS} />

      <div className="section">
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={GROUP_LABEL_STYLE}>Nhóm A — TypeScript Cơ Bản</div>
          <Lesson01 isDone={done.has('l01')} onToggleDone={t('l01')} />
          <Lesson02 isDone={done.has('l02')} onToggleDone={t('l02')} />
          <Lesson03 isDone={done.has('l03')} onToggleDone={t('l03')} />
          <Lesson04 isDone={done.has('l04')} onToggleDone={t('l04')} />
          <Lesson05 isDone={done.has('l05')} onToggleDone={t('l05')} />
          <Lesson06 isDone={done.has('l06')} onToggleDone={t('l06')} />

          <div style={{ ...GROUP_LABEL_STYLE, marginTop: '2.5rem' }}>
            Nhóm B — JavaScript Async & HTTP
          </div>
          <Lesson07 isDone={done.has('l07')} onToggleDone={t('l07')} />
          <Lesson08 isDone={done.has('l08')} onToggleDone={t('l08')} />
          <Lesson09 isDone={done.has('l09')} onToggleDone={t('l09')} />
          <Lesson10 isDone={done.has('l10')} onToggleDone={t('l10')} />
          <Lesson11 isDone={done.has('l11')} onToggleDone={t('l11')} />
          <Lesson12 isDone={done.has('l12')} onToggleDone={t('l12')} />
          <Lesson13 isDone={done.has('l13')} onToggleDone={t('l13')} />
          <Lesson14 isDone={done.has('l14')} onToggleDone={t('l14')} />

          <ProjectSection />

          <div className="related-section">
            <h3 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Kiến thức liên quan</h3>
            <div className="related-grid">
              <div>
                <div className="related-col-title">Cần biết trước</div>
                <a href="#lesson-01-02" className="related-link">
                  Primitive types
                </a>
                <a href="#lesson-01-03" className="related-link">
                  Object & Interfaces
                </a>
                <a href="#lesson-01-10" className="related-link">
                  Callback pattern
                </a>
              </div>
              <div>
                <div className="related-col-title">Học tiếp theo</div>
                <a href="/02-express-core" className="related-link">
                  Express Request types
                </a>
                <a href="/02-express-core" className="related-link">
                  RequestHandler type
                </a>
                <a href="/02-express-core" className="related-link">
                  Declaration Merging
                </a>
              </div>
              <div>
                <div className="related-col-title">Cùng chủ đề</div>
                <a href="#lesson-01-04" className="related-link">
                  Utility types
                </a>
                <a href="#lesson-01-05" className="related-link">
                  Generic types
                </a>
                <a href="#lesson-01-13" className="related-link">
                  import type
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ModuleFooter
        prev={{ to: '/', label: 'Trang chủ' }}
        next={{ to: '/02-express-core', label: 'Express.js Core' }}
        moduleLabel="Module 01/07"
      />
    </div>
  );
}
