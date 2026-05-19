import ModuleFooter from '../components/ModuleFooter';
import PageHeader from '../components/PageHeader';

export default function MongoDBCore() {
  return (
    <div style={{ paddingTop: 'var(--nav-h)' }}>
      <PageHeader
        moduleNum="Module 04"
        title="MongoDB & Mongoose Core"
        subtitle="Schema generics, typed CRUD, populate — Mongoose + TypeScript"
        priority="high"
        time="~4 giờ"
        lessonCount={12}
        prevLink={{ to: '/03-express-nangcao', label: 'Express Nâng Cao' }}
        nextLink={{ to: '/05-mongodb-nangcao', label: 'MongoDB Nâng Cao' }}
        prereqs={['Module 02 — Express Core', 'MongoDB Atlas account']}
      />
      <div className="section">
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text2)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Coming soon — Phase 4</h2>
          <p>Module này sẽ được build trong Phase 4 theo SPEC.</p>
        </div>
      </div>
      <ModuleFooter
        prev={{ to: '/03-express-nangcao', label: 'Express Nâng Cao' }}
        next={{ to: '/05-mongodb-nangcao', label: 'MongoDB Nâng Cao' }}
        moduleLabel="Module 04/07"
      />
    </div>
  );
}
