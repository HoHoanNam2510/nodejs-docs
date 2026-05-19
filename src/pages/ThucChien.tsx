import ModuleFooter from '../components/ModuleFooter';
import PageHeader from '../components/PageHeader';

export default function ThucChien() {
  return (
    <div style={{ paddingTop: 'var(--nav-h)' }}>
      <PageHeader
        moduleNum="Module 07"
        title="Social Blog API — Thực Chiến"
        subtitle="Build đầy đủ: auth, posts, comments, likes, RBAC, deploy — 100% TypeScript strict"
        priority="high"
        time="~8 giờ"
        lessonCount={8}
        prevLink={{ to: '/06-authentication', label: 'Authentication & Security' }}
        prereqs={['Module 01–06 hoàn thành', 'TypeScript strict mode']}
      />
      <div className="section">
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text2)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div>
          <h2 style={{ marginBottom: '0.5rem' }}>Coming soon — Phase 7</h2>
          <p>Module này sẽ được build trong Phase 7 theo SPEC.</p>
        </div>
      </div>
      <ModuleFooter
        prev={{ to: '/06-authentication', label: 'Authentication & Security' }}
        moduleLabel="Module 07/07"
      />
    </div>
  );
}
