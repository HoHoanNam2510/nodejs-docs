import ModuleFooter from '../components/ModuleFooter';
import PageHeader from '../components/PageHeader';

export default function MongoDBNangCao() {
  return (
    <div style={{ paddingTop: 'var(--nav-h)' }}>
      <PageHeader
        moduleNum="Module 05"
        title="MongoDB Nâng Cao"
        subtitle="Aggregation Pipeline, indexes, hooks, transactions với TypeScript"
        priority="medium"
        time="~3 giờ"
        lessonCount={8}
        prevLink={{ to: '/04-mongodb-core', label: 'MongoDB Core' }}
        nextLink={{ to: '/06-authentication', label: 'Authentication' }}
        prereqs={['Module 04 — MongoDB Core']}
      />
      <div className="section">
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text2)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Coming soon — Phase 5</h2>
          <p>Module này sẽ được build trong Phase 5 theo SPEC.</p>
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
