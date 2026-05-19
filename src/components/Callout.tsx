import { ReactNode } from 'react';

interface Props {
  type: 'note' | 'warn';
  children: ReactNode;
}

export default function Callout({ type, children }: Props) {
  return <div className={type === 'note' ? 'lesson-note' : 'lesson-warn'}>{children}</div>;
}
