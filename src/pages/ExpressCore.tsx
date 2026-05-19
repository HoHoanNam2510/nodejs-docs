import ModuleFooter from '../components/ModuleFooter';
import PageHeader from '../components/PageHeader';

export default function ExpressCore() {
  return (
    <div style={{ paddingTop: 'var(--nav-h)' }}>
      <PageHeader
        moduleNum="Module 02"
        title="Express.js Core"
        subtitle="Setup, routing typed, middleware, error handling"
        priority="high"
        time="~3 giờ"
        lessonCount={10}
        prevLink={{ to: '/01-nen-tang', label: 'Nền Tảng TS & HTTP' }}
        nextLink={{ to: '/03-express-nangcao', label: 'Express Nâng Cao' }}
        prereqs={['Module 01 — Nền Tảng', 'TypeScript cơ bản']}
      />
      <div className="section">
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text2)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Coming soon — Phase 2</h2>
          <p>Module này sẽ được build trong Phase 2 theo SPEC.</p>
        </div>
      </div>
      <ModuleFooter
        prev={{ to: '/01-nen-tang', label: 'Nền Tảng TS & HTTP' }}
        next={{ to: '/03-express-nangcao', label: 'Express Nâng Cao' }}
        moduleLabel="Module 02/07"
      />
    </div>
  );
}
