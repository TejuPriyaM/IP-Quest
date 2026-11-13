import { BarChart3, Flame, Sparkles, type LucideIcon } from 'lucide-react';

type DashboardCardProps = {
  title: string;
  value: string;
  change: string;
  tone?: 'blue' | 'green' | 'amber' | 'violet';
};

const metricIcons: Record<string, LucideIcon> = {
  'Learning progress': BarChart3,
  'Points earned': Sparkles,
  'Quiz streak': Flame,
};

const toneClasses = {
  blue: 'metric-tone-blue',
  green: 'metric-tone-green',
  amber: 'metric-tone-amber',
  violet: 'metric-tone-violet',
};

export default function DashboardCard({ title, value, change, tone = 'blue' }: DashboardCardProps) {
  const Icon = metricIcons[title] ?? BarChart3;
  return (
    <div className={`glass-card metric-card p-5 ${toneClasses[tone]}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase text-slate-500">{title}</p>
        <span className="metric-icon" aria-hidden="true"><Icon size={17} strokeWidth={1.9} /></span>
      </div>
      <p className="mt-3 break-words font-display text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{change}</p>
    </div>
  );
}
