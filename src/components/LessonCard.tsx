import { useState, ReactNode } from 'react';
import Badge from './Badge';
import { BadgeVariant } from '../types';

interface Props {
  id: string;
  num: string;
  title: string;
  desc?: string;
  priority: BadgeVariant;
  isDone: boolean;
  onToggleDone: () => void;
  children: ReactNode;
}

export default function LessonCard({
  id,
  num,
  title,
  desc,
  priority,
  isDone,
  onToggleDone,
  children,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`lesson-card${open ? ' open' : ''}`} id={id}>
      <div className="lesson-header" onClick={() => setOpen(o => !o)}>
        <div className="lesson-num-box">{num}</div>
        <div>
          <div className="lesson-title">{title}</div>
          {desc && <div className="lesson-desc-short">{desc}</div>}
        </div>
        <div className="lesson-badges">
          <Badge variant={priority} />
          <Badge variant="ts" />
        </div>
        <div className="lesson-toggle">▼</div>
      </div>
      {open && (
        <div className="lesson-body">
          {children}
          <button
            className={`complete-btn${isDone ? ' done' : ''}`}
            onClick={e => {
              e.stopPropagation();
              onToggleDone();
            }}
          >
            {isDone ? '✓ Đã hoàn thành' : 'Đánh dấu hoàn thành'}
          </button>
        </div>
      )}
    </div>
  );
}
