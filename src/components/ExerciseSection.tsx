import { useState } from 'react';

interface Exercise {
  level: 'basic' | 'medium' | 'hard';
  text: string;
}

interface Props {
  exercises: Exercise[];
  hint?: string;
}

const DOT_CLASS: Record<Exercise['level'], string> = {
  basic: 'exercise-dot ex-basic',
  medium: 'exercise-dot ex-medium',
  hard: 'exercise-dot ex-hard',
};

export default function ExerciseSection({ exercises, hint }: Props) {
  const [showHint, setShowHint] = useState(false);

  return (
    <div className="exercise-section">
      {exercises.map((ex, i) => (
        <div key={i} className="exercise-item">
          <div className={DOT_CLASS[ex.level]} />
          <span>{ex.text}</span>
        </div>
      ))}
      {hint && (
        <>
          <button className="hint-toggle" onClick={() => setShowHint(h => !h)}>
            {showHint ? '💡 Ẩn gợi ý' : '💡 Gợi ý'}
          </button>
          <div className={`hint-body${showHint ? ' open' : ''}`}>{hint}</div>
        </>
      )}
    </div>
  );
}
