'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const footerLinks = [
  { href: '/learn', label: 'Learning library' },
  { href: '/games', label: 'Adventures' },
  { href: '/login', label: 'Account' },
];

export default function SiteFooter() {
  const pathname = usePathname();
  if (pathname.startsWith('/games') || pathname === '/forgot-password' || pathname === '/reset-password') return null;

  return (
    <footer className="site-footer">
      <div className="site-footer-inner section-shell">
        <Link href="/" className="footer-brand" aria-label="IP Quest home">
          <Image src="/logo-mark.png" alt="" width={32} height={32} />
          <span>IP Quest</span>
        </Link>
        <p className="footer-note">Explore ideas. Learn how to protect them.</p>
        <nav className="footer-links" aria-label="Footer navigation">
          {footerLinks.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </nav>
      </div>
    </footer>
  );
}