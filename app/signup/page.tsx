'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAccount, getCurrentDestination, login, type UserRole } from '@/lib/auth';
import { createProfile } from '@/lib/profile';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Extract<UserRole, 'student' | 'teacher'>>('student');
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

    setIsSubmitting(true);

    try {
      const user = await createAccount({ name: name.trim(), email: email.trim(), password });
      await login({ email: email.trim(), password });
      await createProfile({ userId: user.$id, displayName: name.trim(), role: selectedRole });

      const membershipResponse = await fetch('/api/teachers/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.$id, role: selectedRole }),
      });

      if (!membershipResponse.ok) {
        throw new Error(selectedRole === 'teacher' ? 'Teacher account setup could not be completed. Please contact support before trying again.' : 'Account setup could not be completed. Please try again.');
      }

      const destination = await getCurrentDestination();
      router.replace(destination ?? '/login');
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong. Please try again.');
      setIsSubmitting(false);
    }
  }

  return (
    <main className="section-shell flex min-h-[calc(100vh-81px)] items-center justify-center py-12 sm:py-16">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-9" aria-labelledby="signup-heading">
        <div className="mb-8 border-b border-slate-100 pb-7">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">Start your quest</p>
          <h1 id="signup-heading" className="mt-3 text-3xl font-black tracking-tight text-slate-950">Create your account</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Build your profile and start exploring intellectual property.</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">Display name</label>
            <input id="name" type="text" autoComplete="name" required value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
          </div>
          <fieldset>
            <legend className="mb-2 block text-sm font-semibold text-slate-700">Role</legend>
            <div className="grid grid-cols-2 gap-3">
              {(['student', 'teacher'] as const).map((role) => (
                <label key={role} className={`cursor-pointer rounded-xl border px-4 py-3 text-center text-sm font-semibold capitalize transition ${selectedRole === role ? 'border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-100' : 'border-slate-300 text-slate-600 hover:border-brand-300'}`}>
                  <input type="radio" name="signup-role" value={role} checked={selectedRole === role} onChange={() => setSelectedRole(role)} className="sr-only" />
                  {role}
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
            <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
            <input id="password" type="password" autoComplete="new-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
          </div>
          <div>
            <label htmlFor="confirm-password" className="mb-2 block text-sm font-semibold text-slate-700">Confirm password</label>
            <input id="confirm-password" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
          </div>
          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">Already have an account? <Link href="/login" className="font-bold text-brand-700 hover:text-brand-800">Log in</Link></p>
      </section>
    </main>
  );
}