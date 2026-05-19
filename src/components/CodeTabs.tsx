import { useState } from 'react';
import CodeBlock from './CodeBlock';

export interface Tab {
  label: string;
  code: string;
  html?: boolean;
}

interface Props {
  tabs: Tab[];
}

export default function CodeTabs({ tabs }: Props) {
  const [active, setActive] = useState(0);

  return (
    <div className="code-tabs-wrap">
      <div className="code-tabs">
        {tabs.map((tab, i) => (
          <button
            key={i}
            className={`code-tab${i === active ? ' active' : ''}`}
            onClick={() => setActive(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <CodeBlock code={tabs[active].code} html={tabs[active].html} />
    </div>
  );
}
