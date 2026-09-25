type ProgressCardProps = {
  label: string;
  value: string;
  detail: string;
};

export default function ProgressCard({ label, value, detail }: ProgressCardProps) {
  return (
    <div className="glass-card p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-600">{detail}</p>
    </div>
  );
}
