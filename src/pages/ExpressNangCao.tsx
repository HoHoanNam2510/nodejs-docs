import ModuleFooter from '../components/ModuleFooter';
import PageHeader from '../components/PageHeader';

export default function ExpressNangCao() {
  return (
    <div style={{ paddingTop: 'var(--nav-h)' }}>
      <PageHeader
        moduleNum="Module 03"
        title="Express.js Nâng Cao"
        subtitle="Router, zod validation, multer, CORS, cấu trúc project chuẩn"
        priority="medium"
        time="~3.5 giờ"
        lessonCount={9}
        prevLink={{ to: '/02-express-core', label: 'Express.js Core' }}
        nextLink={{ to: '/04-mongodb-core', label: 'MongoDB Core' }}
        prereqs={['Module 02 — Express Core']}
      />
      <div className="section">
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text2)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Coming soon — Phase 3</h2>
          <p>Module này sẽ được build trong Phase 3 theo SPEC.</p>
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
