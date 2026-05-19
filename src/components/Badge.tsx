import { BadgeVariant } from '../types';

interface Props {
  variant: BadgeVariant;
}

const LABELS: Record<BadgeVariant, string> = {
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW',
  ts: 'TypeScript',
};

const CLASSES: Record<BadgeVariant, string> = {
  high: 'badge badge-high',
  medium: 'badge badge-medium',
  low: 'badge badge-low',
  ts: 'badge badge-ts',
};

export default function Badge({ variant }: Props) {
  return <span className={CLASSES[variant]}>{LABELS[variant]}</span>;
}
