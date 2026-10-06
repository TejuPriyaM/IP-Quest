type SectionHeaderProps = {
  title: string;
  description: string;
  align?: 'left' | 'center';
};

export default function SectionHeader({ title, description, align = 'left' }: SectionHeaderProps) {
  const alignment = align === 'center' ? 'mx-auto text-center' : '';

  return (
    <div className={`max-w-2xl ${alignment}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Learning</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
      <p className="mt-3 text-base text-slate-600">{description}</p>
    </div>
  );
}
