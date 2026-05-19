import { useTocDots } from '../hooks/useTocDots';

interface Section {
  id: string;
  label: string;
}

interface Props {
  sections: Section[];
}

export default function TocDots({ sections }: Props) {
  const activeIndex = useTocDots(sections.map(s => s.id));

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="toc-dots">
      {sections.map((s, i) => (
        <div
          key={s.id}
          className={`toc-dot${i === activeIndex ? ' active' : ''}`}
          data-label={s.label}
          onClick={() => scrollTo(s.id)}
        />
      ))}
    </div>
  );
}
