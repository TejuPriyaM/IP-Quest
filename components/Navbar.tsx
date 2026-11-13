'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, LogOut, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getCurrentProfile, getRoleBasedRoute, logout, type UserRole } from '@/lib/auth';

const publicLinks = [
  { href: '/', label: 'Home' },
  { href: '/learn', label: 'Learn' },
  { href: '/games', label: 'Adventures' },
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

  const roleLinks = role ? [
    ...(role === 'student' || role === 'teacher'
      ? [{ href: role === 'teacher' ? '/teacher/progress' : '/progress', label: 'Progress' }]
      : []),
    { href: getRoleBasedRoute(role), label: 'Dashboard' },
  ] : [];
  const links = [...publicLinks, ...roleLinks];

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

  function renderLinks(mobile = false) {
    return links.map((link) => {
      const isActive = isActiveLink(link.href);
      return (
        <Link
          key={link.href}
          href={link.href}
          aria-current={isActive ? 'page' : undefined}
          onClick={mobile ? closeMenus : undefined}
          className={`nav-link${isActive ? ' nav-link-active' : ''}`}
        >
          {link.label}
        </Link>
      );
    });
  }

  return (
    <header className="site-header">
      <nav className="site-nav section-shell" aria-label="Main navigation">
        <Link href="/" className="brand-lockup" onClick={closeMenus} aria-label="IP Quest home">
          <Image src="/logo-mark.png" alt="" width={38} height={38} className="brand-symbol" />
          <span className="brand-name"><span>IP</span> Quest</span>
        </Link>

        <div className="nav-links" aria-label="Primary links">{renderLinks()}</div>

        <div className="nav-actions">
          {role ? (
            <div className="profile-wrap">
              <button
                type="button"
                className="profile-toggle"
                onClick={() => setIsProfileOpen((open) => !open)}
                aria-expanded={isProfileOpen}
                aria-controls="profile-menu"
              >
                <span className="profile-initial" aria-hidden="true">{role.slice(0, 1).toUpperCase()}</span>
                <span className="profile-role">{role}</span>
                <ChevronDown size={15} aria-hidden="true" />
              </button>
              {isProfileOpen && (
                <div className="profile-menu" id="profile-menu">
                  <Link href="/profile" onClick={closeMenus}>View profile</Link>
                  <Link href="/profile?edit=1" onClick={closeMenus}>Edit profile</Link>
                  <button type="button" onClick={handleLogout} disabled={isSigningOut}>
                    <LogOut size={16} aria-hidden="true" />
                    {isSigningOut ? 'Logging out...' : 'Log out'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="nav-auth-links">
              <Link href="/login" className="nav-sign-in">Log in</Link>
              <Link href="/signup" className="nav-sign-up">Get started</Link>
            </div>
          )}
        </div>

        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isOpen}
          aria-controls="mobile-navigation"
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
        </button>
      </nav>

      {isOpen && (
        <div className="mobile-navigation" id="mobile-navigation">
          <div className="mobile-navigation-inner section-shell">
            {renderLinks(true)}
            {role ? (
              <div className="mobile-profile-links">
                <Link href="/profile" onClick={closeMenus}>View profile</Link>
                <Link href="/profile?edit=1" onClick={closeMenus}>Edit profile</Link>
                <button type="button" onClick={handleLogout} disabled={isSigningOut}>
                  <LogOut size={16} aria-hidden="true" />{isSigningOut ? 'Logging out...' : 'Log out'}
                </button>
              </div>
            ) : (
              <div className="mobile-auth-links">
                <Link href="/login" className="nav-sign-in" onClick={closeMenus}>Log in</Link>
                <Link href="/signup" className="nav-sign-up" onClick={closeMenus}>Get started</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}