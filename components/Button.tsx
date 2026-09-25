import Link from 'next/link';

type ButtonProps = {
  href?: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
};

export default function Button({ href, children, variant = 'primary', className = '' }: ButtonProps) {
  const styles = variant === 'primary' ? 'btn-primary' : 'btn-secondary';

  if (href) {
    return (
      <Link href={href} className={`${styles} ${className}`}>
        {children}
      </Link>
    );
  }

  return <button className={`${styles} ${className}`}>{children}</button>;
}
