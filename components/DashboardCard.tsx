type DashboardCardProps = {
  title: string;
  value: string;
  supportingText: string;
  icon: string;
  tone?: 'blue' | 'green' | 'amber' | 'violet';
};

const toneClasses = {
  blue: 'bg-blue-50 text-blue-700 ring-blue-100',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  amber: 'bg-amber-50 text-amber-700 ring-amber-100',
  violet: 'bg-violet-50 text-violet-700 ring-violet-100',
};

export default function DashboardCard({ title, value, supportingText, icon, tone = 'blue' }: DashboardCardProps) {
  return (
    <div className="glass-card p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <span className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-2 text-sm font-bold ring-1 ${toneClasses[tone]}`} aria-hidden="true">
          {icon}
        </span>
      </div>
      <p className="mt-5 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{supportingText}</p>
    </div>
  );
}
