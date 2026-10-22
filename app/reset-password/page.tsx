'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { completePasswordRecovery } from '@/lib/auth';

export default function ResetPasswordPage() {
  const [userId, setUserId] = useState('');
  const [secret, setSecret] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isCheckingLink, setIsCheckingLink] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const recoveryUserId = params.get('userId') ?? '';
    const recoverySecret = params.get('secret') ?? '';

    setUserId(recoveryUserId);
    setSecret(recoverySecret);

    if (!recoveryUserId || !recoverySecret) {
      setError('This password-reset link is invalid or incomplete. Request a new one to continue.');
    }

    setIsCheckingLink(false);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (password.length < 8) {
      setError('Your password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      await completePasswordRecovery(userId, secret, password);
      setMessage('Your password has been updated. You can now log in with your new password.');
      setPassword('');
      setConfirmPassword('');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong. Please request a new reset link and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="fp-page">
      <section className="fp-content" aria-labelledby="reset-password-heading">
        <div className="fp-hero">
          <div className="fp-badge">🪄 Almost there!</div>
          <h1>Make a<br /><span>fresh start.</span></h1>
          <p>Choose a new password and get back to exploring your next big idea.</p>
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

        <section className="fp-card" aria-labelledby="reset-password-heading">
          <div className="fp-icon" aria-hidden="true">🔐</div>
          <span className="fp-eyebrow">ACCOUNT RECOVERY</span>
          <h2 id="reset-password-heading">Create a new password</h2>
          <p className="fp-description">Choose a new password for your IP Quest account.</p>

          {isCheckingLink ? (
            <p className="fp-description" role="status">Checking your reset link...</p>
          ) : (
            <>
              {error && <div className="fp-error" role="alert">{error}</div>}
              {message ? (
                <div className="fp-success" role="status">🎉 {message}</div>
              ) : userId && secret ? (
                <form onSubmit={handleSubmit} noValidate>
                  <label htmlFor="new-password">New password</label>
                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <label htmlFor="confirm-password">Confirm new password</label>
                  <input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                  <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Updating password...' : 'Update Password →'}
                  </button>
                </form>
              ) : null}
            </>
          )}

          <div className="fp-divider" aria-hidden="true">✦</div>
          <p className="fp-back"><Link href="/forgot-password">Request a new reset link</Link></p>
          <div className="fp-help"><Link href="/login">Back to login</Link></div>
        </section>
      </section>
      <footer className="fp-footer">Made for curious minds <span>✦</span> IP Quest</footer>
    </main>
  );
}
