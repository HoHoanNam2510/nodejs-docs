import { NavLink } from 'react-router-dom';

const MODULES = [
  { to: '/', label: '00' },
  { to: '/01-nen-tang', label: '01' },
  { to: '/02-express-core', label: '02' },
  { to: '/03-express-nangcao', label: '03' },
  { to: '/04-mongodb-core', label: '04' },
  { to: '/05-mongodb-nangcao', label: '05' },
  { to: '/06-authentication', label: '06' },
  { to: '/07-thucchien', label: '07' },
];

export default function Nav() {
  return (
    <nav className="nav">
      <NavLink to="/" className="nav-logo">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
          <rect width="20" height="20" rx="5" fill="#13aa5220" />
          <path d="M5 14V7l5-3 5 3v7l-5 3-5-3z" stroke="#4ade80" strokeWidth="1.2" fill="none" />
          <circle cx="10" cy="10" r="2" fill="#4ade80" />
        </svg>
        Express+MongoDB·<span style={{ color: 'var(--ts-light)' }}>TS</span>
      </NavLink>
      <div className="nav-links">
        {MODULES.map(m => (
          <NavLink
            key={m.to}
            to={m.to}
            end={m.to === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            {m.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
