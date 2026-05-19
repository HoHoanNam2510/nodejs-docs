import { Link } from 'react-router-dom';

interface Props {
  prev?: { to: string; label: string };
  next?: { to: string; label: string };
  moduleLabel: string;
}

export default function ModuleFooter({ prev, next, moduleLabel }: Props) {
  return (
    <>
      <div className="module-footer">
        {prev ? (
          <Link to={prev.to} className="mfnav-link">
            <span className="mfnav-dir">← Trước</span>
            <span className="mfnav-name">{prev.label}</span>
          </Link>
        ) : (
          <div />
        )}
        <span className="mfnav-center">{moduleLabel}</span>
        {next ? (
          <Link to={next.to} className="mfnav-link" style={{ textAlign: 'right' }}>
            <span className="mfnav-dir">Tiếp theo →</span>
            <span className="mfnav-name">{next.label}</span>
          </Link>
        ) : (
          <div />
        )}
      </div>
      <footer
        style={{ borderTop: '1px solid var(--border)', padding: '2rem', textAlign: 'center' }}
      >
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text3)',
            marginBottom: '0.4rem',
          }}
        >
          Express.js + MongoDB · TypeScript Edition · {moduleLabel}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)' }}>
          Được xây dựng để học thực tế — không phải để đọc cho vui
        </div>
      </footer>
    </>
  );
}
