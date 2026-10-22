'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { requestPasswordRecovery } from '@/lib/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      await requestPasswordRecovery(email.trim(), `${window.location.origin}/reset-password`);
      setMessage('If an account exists for this email, a password-reset link will be sent. Please check your inbox and spam folder.');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="fp-page">
      <section className="fp-content" aria-labelledby="forgot-password-heading">
        <div className="fp-hero">
          <div className="fp-badge">🪄 A little help!</div>
          <h1 id="forgot-password-heading">Lost your<br /><span>secret key?</span></h1>
          <p>Every great inventor forgets sometimes! Let&apos;s get you back to your adventures.</p>
          <div className="fp-emojis" aria-hidden="true">
            <span>💡</span>
            <span>🎨</span>
            <span>🎵</span>
            <span>🚀</span>
          </div>
          <div className="fp-tags" aria-label="Creativity, inventions, and big ideas">
            <span>Creativity</span>
            <span>Inventions</span>
            <span>Big ideas</span>
          </div>
        </div>

        <section className="fp-card" aria-labelledby="recovery-heading">
          <div className="fp-icon" aria-hidden="true">🔐</div>
          <span className="fp-eyebrow">ACCOUNT RECOVERY</span>
          <h2 id="recovery-heading">Forgot your password?</h2>
          <p className="fp-description">No worries, inventor! Enter your registered email and we&apos;ll send you a link to create a new password.</p>

          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="reset-email">Your email address</label>
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
            {error && <div className="fp-error" role="alert">{error}</div>}
            {message && <div className="fp-success" role="status">🎉 {message}</div>}
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending your link...' : '✉️ Send Reset Link →'}
            </button>
          </form>

          <div className="fp-divider" aria-hidden="true">✦</div>
          <p className="fp-back">Remember your password? <Link href="/login">Back to Login</Link></p>
          <div className="fp-help">💜 Your next big idea is waiting for you!</div>
        </section>
      </section>
      <footer className="fp-footer">Made for curious minds <span>✦</span> IP Quest</footer>
    </main>
  );
}
