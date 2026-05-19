export interface ModuleInfo {
  id: string;
  name: string;
  to: string;
  total: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'overview';
  desc: string;
  time: string;
  lessons?: string;
}

export type BadgeVariant = 'high' | 'medium' | 'low' | 'ts';
