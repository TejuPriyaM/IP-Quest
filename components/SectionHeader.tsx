type SectionHeaderProps = {
  title: string;
  description: string;
  align?: 'left' | 'center';
  eyebrow?: string;
  level?: 1 | 2;
};

export default function SectionHeader({ title, description, align = 'left', eyebrow = 'IP Quest', level = 1 }: SectionHeaderProps) {
  const alignment = align === 'center' ? 'mx-auto text-center' : '';
  const heading = level === 1
    ? <h1 className="page-title">{title}</h1>
    : <h2 className="page-title">{title}</h2>;

  return (
    <div className={`page-header ${alignment}`}>
      <p className="page-kicker">{eyebrow}</p>
      {heading}
      <p className="page-description">{description}</p>
    </div>
  );
}
