'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAccount, getCurrentDestination, login } from '@/lib/auth';
import { createProfile } from '@/lib/profile';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | ''>('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Please complete every field.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (selectedRole !== 'student' && selectedRole !== 'teacher') {
      setError('Please select Student or Teacher.');
      return;
    }

    setIsSubmitting(true);

    try {
      await createAccount({ name: name.trim(), email: email.trim(), password });
      await login({ email: email.trim(), password });
      await createProfile({ displayName: name.trim(), role: selectedRole });

      const destination = await getCurrentDestination();
      router.replace(destination ?? '/login');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <div className="login-content">
        <section className="welcome-panel" aria-labelledby="signup-welcome-heading">
          <span className="welcome-badge">Made for curious minds</span>
          <h1 id="signup-welcome-heading">Make room for <span className="highlight">big ideas.</span></h1>
          <p>Build your creator toolkit with lessons and interactive challenges about the ideas people make and share.</p>
          <div className="adventure-art" aria-hidden="true">
            <Image src="/logo-mark.png" alt="" width={270} height={180} className="auth-logo-art" />
          </div>
          <div className="learning-tags" aria-label="Explore creativity, inventions, and ideas">
            <span>Creativity</span><span>Inventions</span><span>Big ideas</span>
          </div>
        </section>

        <section className="login-card" aria-labelledby="signup-heading">
          <div className="login-heading">
            <p className="eyebrow">Start your quest</p>
            <h2 id="signup-heading">Create your account</h2>
            <p className="subtitle">Choose how you are joining IP Quest.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="login-field">
              <label htmlFor="name" className="login-label">Display name</label>
              <input id="name" type="text" autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} className="login-input" />
            </div>
            <div className="login-field">
              <label htmlFor="email" className="login-label">Email</label>
              <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="login-input" />
            </div>
            <div className="login-field">
              <label htmlFor="password" className="login-label">Password</label>
              <input id="password" type="password" autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="login-input" />
            </div>
            <div className="login-field">
              <label htmlFor="confirm-password" className="login-label">Confirm password</label>
              <input id="confirm-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="login-input" />
            </div>
            <fieldset className="login-role-fieldset">
              <legend className="login-label">I am joining as <span aria-hidden="true">*</span></legend>
              <div className="role-options">
                {(['student', 'teacher'] as const).map((role) => (
                  <label key={role} className={`role-option${selectedRole === role ? ' selected' : ''}`}>
                    <input type="radio" name="signup-role" value={role} checked={selectedRole === role} required onChange={() => setSelectedRole(role)} />
                    <span>{role}</span>
                  </label>
                ))}
              </div>
              {selectedRole === 'teacher' && <p className="signup-role-note">Teacher tools require separate approval. Selecting Teacher does not grant access.</p>}
            </fieldset>
            {error && <p role="alert" className="login-error">{error}</p>}
            <button type="submit" disabled={isSubmitting} className="login-button">
              {isSubmitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="login-footer">Already have an account? <Link href="/login">Log in</Link></p>
        </section>
      </div>
    </main>
  );
}