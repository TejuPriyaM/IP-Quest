'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';

type RecoveryStep = 'email' | 'code' | 'password' | 'complete';

const genericConfirmation = 'If an account uses this email address, recovery instructions will be sent if delivery is available.';

async function submitRecovery(body: Record<string, string>) {
  const response = await fetch('/api/auth/password-recovery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
      ? payload.error
      : 'Password recovery is temporarily unavailable. Please try again.';
    throw new Error(message);
  }
  return payload as Record<string, unknown>;
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<RecoveryStep>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((remaining) => Math.max(0, remaining - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  async function requestCode(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setError('');
    setNotice('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = await submitRecovery({ action: 'request', email: email.trim().toLowerCase() });
      setNotice(typeof payload.message === 'string' ? payload.message : genericConfirmation);
      setCode('');
      setStep('code');
      setCooldown(75);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to request a verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the six-digit verification code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = await submitRecovery({ action: 'verify', email: email.trim().toLowerCase(), code });
      if (typeof payload.resetToken !== 'string') throw new Error('The verification response was invalid. Request a new code and try again.');
      setResetToken(payload.resetToken);
      setStep('password');
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : 'Unable to verify the code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setNotice('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8 || password.length > 256) {
      setError('Password must be between 8 and 256 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = await submitRecovery({
        action: 'reset',
        email: email.trim().toLowerCase(),
        resetToken,
        password,
        confirmPassword,
      });
      setNotice(typeof payload.message === 'string' ? payload.message : 'Your password has been updated.');
      setPassword('');
      setConfirmPassword('');
      setResetToken('');
      setStep('complete');
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Unable to update your password. Please try again.');
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
          <h2 id="recovery-heading">{step === 'complete' ? 'Password updated' : 'Forgot your password?'}</h2>
          <p className="fp-description">
            {step === 'email' && 'Enter your registered email and we will send a six-digit verification code.'}
            {step === 'code' && 'Enter the six-digit code sent to your email. It expires in 10 minutes.'}
            {step === 'password' && 'Choose a new password for your account.'}
            {step === 'complete' && 'Your new password is ready to use.'}
          </p>

          {step === 'email' && (
            <form onSubmit={(event) => void requestCode(event)} noValidate>
              <label htmlFor="recovery-email">Your email address</label>
              <input id="recovery-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
              {error && <div className="fp-error" role="alert">{error}</div>}
              <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Requesting code...' : 'Send verification code'}</button>
            </form>
          )}

          {step === 'code' && (
            <>
              <div className="fp-success" role="status">{notice || genericConfirmation}</div>
              <form onSubmit={(event) => void verifyCode(event)} noValidate>
                <label htmlFor="recovery-code">Verification code</label>
                <input id="recovery-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} />
                {error && <div className="fp-error" role="alert">{error}</div>}
                <button type="submit" disabled={isSubmitting || code.length !== 6}>{isSubmitting ? 'Verifying...' : 'Verify code'}</button>
              </form>
              <p className="fp-back">
                <button type="button" className="fp-resend" onClick={() => void requestCode()} disabled={isSubmitting || cooldown > 0}>
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
                </button>
                {' · '}
                <button type="button" className="fp-resend" onClick={() => { setStep('email'); setError(''); setNotice(''); }}>Change email</button>
              </p>
            </>
          )}

          {step === 'password' && (
            <form onSubmit={(event) => void resetPassword(event)} noValidate>
              <label htmlFor="new-password">New password</label>
              <input id="new-password" type="password" autoComplete="new-password" required minLength={8} maxLength={256} value={password} onChange={(event) => setPassword(event.target.value)} />
              <label htmlFor="confirm-password">Confirm new password</label>
              <input id="confirm-password" type="password" autoComplete="new-password" required minLength={8} maxLength={256} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} />
              {error && <div className="fp-error" role="alert">{error}</div>}
              <button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Updating password...' : 'Update password'}</button>
            </form>
          )}

          {step === 'complete' && <div className="fp-success" role="status">{notice}</div>}

          <div className="fp-divider" aria-hidden="true">✦</div>
          {step === 'complete'
            ? <p className="fp-back"><Link href="/login">Return to log in</Link></p>
            : <p className="fp-back">Remember your password? <Link href="/login">Back to Login</Link></p>}
          <div className="fp-help">💜 Your next big idea is waiting for you!</div>
        </section>
      </section>
      <footer className="fp-footer">Made for curious minds <span>✦</span> IP Quest</footer>
    </main>
  );
}
