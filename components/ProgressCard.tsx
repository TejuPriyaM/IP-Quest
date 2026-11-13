import { ClipboardCheck, Gamepad2, Target, type LucideIcon } from 'lucide-react';

type ProgressCardProps = {
  label: string;
  value: string;
  detail: string;
};

const progressIcons: Record<string, LucideIcon> = {
  'Topics completed': Target,
  'Lesson assessments': ClipboardCheck,
  'Game progress': Gamepad2,
};

export default function ProgressCard({ label, value, detail }: ProgressCardProps) {
  const Icon = progressIcons[label] ?? Target;
  return (
    <div className="glass-card progress-summary p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
        <span className="metric-icon" aria-hidden="true"><Icon size={17} strokeWidth={1.9} /></span>
      </div>
      <p className="mt-3 break-words font-display text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    </div>
  );
}
