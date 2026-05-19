import ModuleFooter from '../components/ModuleFooter';
import PageHeader from '../components/PageHeader';

export default function Authentication() {
  return (
    <div style={{ paddingTop: 'var(--nav-h)' }}>
      <PageHeader
        moduleNum="Module 06"
        title="Authentication & Security"
        subtitle="bcrypt, JWT typed, refresh token, RBAC, req.user typed, Helmet"
        priority="high"
        time="~4 giờ"
        lessonCount={10}
        prevLink={{ to: '/05-mongodb-nangcao', label: 'MongoDB Nâng Cao' }}
        nextLink={{ to: '/07-thucchien', label: 'Thực Chiến' }}
        prereqs={['Module 04 — MongoDB Core', 'Module 03 — Express Nâng Cao']}
      />
      <div className="section">
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text2)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Coming soon — Phase 6</h2>
          <p>Module này sẽ được build trong Phase 6 theo SPEC.</p>
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
