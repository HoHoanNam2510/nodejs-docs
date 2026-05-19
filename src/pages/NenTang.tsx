import ModuleFooter from '../components/ModuleFooter';
import PageHeader from '../components/PageHeader';

export default function NenTang() {
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
        nextLink={{ to: '/02-express-core', label: 'Express.js Core' }}
        prereqs={['JavaScript cơ bản', 'Node.js installed']}
      />
      <div className="section">
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text2)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Coming soon — Phase 1</h2>
          <p>Module này sẽ được build trong Phase 1 theo SPEC.</p>
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
