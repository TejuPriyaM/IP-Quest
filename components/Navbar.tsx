'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getCurrentProfile, getRoleBasedRoute, logout, type UserRole } from '@/lib/auth';

const publicLinks = [
  { href: '/', label: 'Home' },
  { href: '/learn', label: 'Learn' },
  { href: '/games', label: 'Games' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLearnContext, setIsLearnContext] = useState(false);

  useEffect(() => {
    setIsLearnContext(new URLSearchParams(window.location.search).get('from') === 'learn');
    getCurrentProfile()
      .then((currentProfile) => setRole(currentProfile?.role ?? null))
      .catch(() => setRole(null));
  }, [pathname]);

  const progressLink = role === 'teacher' ? '/teacher/progress' : '/progress';
  const links = role ? [
    ...publicLinks,
    { href: progressLink, label: 'Progress' },
    { href: getRoleBasedRoute(role), label: 'Dashboard' },
  ] : [];

  function isActiveLink(href: string) {
    if (href === '/') return pathname === '/';
    if (href === '/learn' && isLearnContext) return true;
    if (role && href === getRoleBasedRoute(role)) return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  async function handleLogout() {
    setIsSigningOut(true);

    try {
      await logout();
      window.location.href = '/login';
    } catch {
      setIsSigningOut(false);
    }
  }

  function closeMenus() {
    setIsOpen(false);
    setIsProfileOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <nav className="section-shell flex items-center justify-between gap-4 py-4" aria-label="Main navigation">
        <Link href="/" className="shrink-0 text-xl font-black tracking-tight text-slate-900">
          IP Quest
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-2 md:flex">
          {links.map((link) => {
            const isActive = isActiveLink(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-100' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="relative hidden items-center gap-3 md:flex">
          {role ? (
            <>
              <button type="button" onClick={() => setIsProfileOpen((open) => !open)} aria-expanded={isProfileOpen} className="btn-secondary">
                Profile
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 top-12 z-50 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-soft">
                  <Link href="/profile" onClick={closeMenus} className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">View Profile</Link>
                  <Link href="/profile?edit=1" onClick={closeMenus} className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Edit Profile</Link>
                  <button type="button" onClick={handleLogout} disabled={isSigningOut} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 disabled:opacity-60">
                    {isSigningOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <Link href="/login" className="btn-secondary">Log in</Link>
              <Link href="/signup" className="btn-primary">Sign up</Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex rounded-lg border border-slate-200 p-2 text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 md:hidden"
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </nav>

      {isOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <div className="section-shell flex flex-col gap-2 py-4">
            {links.map((link) => {
              const isActive = isActiveLink(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={closeMenus}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {role ? (
              <div className="mt-2 border-t border-slate-100 pt-2">
                <Link href="/profile" onClick={closeMenus} className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">View Profile</Link>
                <Link href="/profile?edit=1" onClick={closeMenus} className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Edit Profile</Link>
                <button type="button" onClick={handleLogout} disabled={isSigningOut} className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 disabled:opacity-60">
                  {isSigningOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link href="/login" className="btn-secondary" onClick={() => setIsOpen(false)}>Log in</Link>
                <Link href="/signup" className="btn-primary" onClick={() => setIsOpen(false)}>Sign up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
