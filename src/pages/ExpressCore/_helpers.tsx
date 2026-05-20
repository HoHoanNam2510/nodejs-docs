import { ReactNode } from 'react';

export function Sec({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="lesson-section">
      <div className="lesson-section-title">{title}</div>
      {children}
    </div>
  );
}

export function Flow({ steps }: { steps: string[] }) {
  return (
    <div className="lesson-flow">
      {steps.map((s, i) => (
        <div key={i} className="flow-step">
          <div className="flow-num">{i + 1}</div>
          <div className="flow-text">{s}</div>
        </div>
      ))}
    </div>
  );
}
