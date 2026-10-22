'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentDestination, getCurrentProfile, login, logout, type UserRole } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Extract<UserRole, 'student' | 'teacher'>>('student');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getCurrentDestination()
      .then((destination) => {
        if (destination) router.replace(destination);
        else setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ email: email.trim(), password });
      const currentProfile = await getCurrentProfile();

      if (!currentProfile || currentProfile.role !== selectedRole) {
        await logout();
        setError('The selected role does not match your account.');
        setIsSubmitting(false);
        return;
      }

      const destination = await getCurrentDestination();
      router.replace(destination ?? '/login');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <main className="login-page login-loading" aria-busy="true">Checking your session...</main>;
  }

  return (
    <main className="login-page">
      <div className="login-content">
        <section className="welcome-panel" aria-labelledby="welcome-heading">
          <span className="welcome-badge">A world of big ideas</span>
          <h1 id="welcome-heading">Make your mark. <span className="highlight">Protect your ideas.</span></h1>
          <p>Discover the clever creations, stories, and inventions that make our world more interesting.</p>
          <div className="adventure-art" aria-hidden="true">
            <span className="art-item">💡</span>
            <span className="art-item">🎨</span>
            <span className="art-item">🎵</span>
            <span className="art-item">🚀</span>
          </div>
          <div className="learning-tags" aria-label="Explore creativity, inventions, and ideas">
            <span>Creativity</span>
            <span>Inventions</span>
            <span>Big ideas</span>
          </div>
        </section>
        <section className="login-card" aria-labelledby="login-heading">
          <div className="login-heading">
            <p className="eyebrow">Welcome back</p>
            <h1 id="login-heading">Log in to IP Quest</h1>
            <p className="subtitle">Pick up where your ideas left off.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <fieldset className="login-role-fieldset">
              <legend className="login-label">Role</legend>
              <div className="role-options">
                {(['student', 'teacher'] as const).map((role) => (
                  <label key={role} className={`role-option${selectedRole === role ? ' selected' : ''}`}>
                    <input type="radio" name="login-role" value={role} checked={selectedRole === role} onChange={() => setSelectedRole(role)} />
                    <span>{role}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="login-field">
              <label htmlFor="email" className="login-label">Email</label>
              <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="login-input" />
            </div>
            <div className="login-field">
              <label htmlFor="password" className="login-label">Password</label>
              <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="login-input" />
            </div>
            {error && <p role="alert" className="login-error">{error}</p>}
            <button type="submit" disabled={isSubmitting} className="login-button">
              {isSubmitting ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="login-footer"><Link href="/forgot-password">Forgot your password?</Link></p>
          <p className="login-footer">New to IP Quest? <Link href="/signup">Create an account</Link></p>
        </section>
      </div>
    </main>
  );
}