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
    <main className="section-shell flex min-h-[calc(100vh-81px)] items-center justify-center py-12 sm:py-16">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-9" aria-labelledby="recovery-heading">
        <div className="mb-8 border-b border-slate-100 pb-7">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">Account recovery</p>
          <h1 id="recovery-heading" className="mt-3 text-3xl font-black tracking-tight text-slate-950">
            {step === 'complete' ? 'Password updated' : 'Forgot password?'}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {step === 'email' && 'Enter your account email to request a verification code.'}
            {step === 'code' && 'Enter the six-digit code sent to your email. It expires in 10 minutes.'}
            {step === 'password' && 'Choose a new password for your account.'}
            {step === 'complete' && 'Your new password is ready to use.'}
          </p>
        </div>

        {step === 'email' && (
          <form className="space-y-5" onSubmit={(event) => void requestCode(event)} noValidate>
            <div>
              <label htmlFor="recovery-email" className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
              <input id="recovery-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </div>
            {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? 'Requesting code...' : 'Send verification code'}
            </button>
          </form>
        )}

        {step === 'code' && (
          <form className="space-y-5" onSubmit={(event) => void verifyCode(event)} noValidate>
            <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice || genericConfirmation}</p>
            <div>
              <label htmlFor="recovery-code" className="mb-2 block text-sm font-semibold text-slate-700">Verification code</label>
              <input id="recovery-code" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center font-mono text-lg tracking-[0.2em] text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </div>
            {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={isSubmitting || code.length !== 6} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? 'Verifying...' : 'Verify code'}
            </button>
            <button type="button" onClick={() => void requestCode()} disabled={isSubmitting || cooldown > 0} className="btn-secondary w-full disabled:cursor-not-allowed disabled:opacity-60">
              {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
            </button>
            <button type="button" onClick={() => { setStep('email'); setError(''); setNotice(''); }} className="w-full text-sm font-semibold text-brand-700 hover:text-brand-800">Change email address</button>
          </form>
        )}

        {step === 'password' && (
          <form className="space-y-5" onSubmit={(event) => void resetPassword(event)} noValidate>
            <div>
              <label htmlFor="new-password" className="mb-2 block text-sm font-semibold text-slate-700">New password</label>
              <input id="new-password" type="password" autoComplete="new-password" required minLength={8} maxLength={256} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-2 block text-sm font-semibold text-slate-700">Confirm new password</label>
              <input id="confirm-password" type="password" autoComplete="new-password" required minLength={8} maxLength={256} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
            </div>
            {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? 'Updating password...' : 'Update password'}
            </button>
          </form>
        )}

        {step === 'complete' && (
          <div className="space-y-5">
            <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</p>
            <Link href="/login" className="btn-primary block w-full text-center">Return to log in</Link>
          </div>
        )}

        {step !== 'complete' && <p className="mt-6 text-center text-sm text-slate-600"><Link href="/login" className="font-bold text-brand-700 hover:text-brand-800">Back to log in</Link></p>}
      </section>
    </main>
  );
}
