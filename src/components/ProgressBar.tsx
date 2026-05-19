interface Props {
  count: number;
  total: number;
  pct: number;
}

export default function ProgressBar({ count, total, pct }: Props) {
  return (
    <div className="toc-progress-wrap">
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="progress-text">
        {count}/{total} bài
      </span>
    </div>
  );
}
