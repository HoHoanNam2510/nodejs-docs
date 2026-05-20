import ProgressBar from './ProgressBar';

interface TocLink {
  href: string;
  label: string;
}

interface Props {
  count: number;
  total: number;
  pct: number;
  links: TocLink[];
}

export default function TocBar({ count, total, pct, links }: Props) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const navH =
      parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 56;
    const tocBar = document.querySelector<HTMLElement>('.toc-bar');
    const tocH = tocBar ? tocBar.offsetHeight : 0;
    const top = el.getBoundingClientRect().top + window.scrollY - navH - tocH - 16;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <div className="toc-bar">
      <div className="toc-bar-inner">
        <ProgressBar count={count} total={total} pct={pct} />
        <div className="toc-links">
          {links.map(l => (
            <a
              key={l.href}
              href={`#${l.href}`}
              className="toc-link"
              onClick={e => {
                e.preventDefault();
                scrollTo(l.href);
              }}
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
