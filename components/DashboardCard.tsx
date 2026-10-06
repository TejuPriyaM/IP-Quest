type DashboardCardProps = {
  title: string;
  value: string;
  change: string;
  tone?: 'blue' | 'green' | 'amber' | 'violet';
};

const toneClasses = {
  blue: 'bg-blue-50 text-blue-700',
  green: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  violet: 'bg-violet-50 text-violet-700',
};

export default function DashboardCard({ title, value, change, tone = 'blue' }: DashboardCardProps) {
  return (
    <div className="glass-card p-5">
      <div className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses[tone]}`}>
        {title}
      </div>
      <p className="mt-4 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{change}</p>
    </div>
  );
}
