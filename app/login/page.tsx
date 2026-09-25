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
    return <main className="section-shell flex min-h-[70vh] items-center justify-center py-16" aria-busy="true">Checking your session...</main>;
  }

  return (
    <main className="section-shell flex min-h-[calc(100vh-81px)] items-center justify-center py-12 sm:py-16">
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-9" aria-labelledby="login-heading">
        <div className="mb-8 border-b border-slate-100 pb-7">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">Welcome back</p>
          <h1 id="login-heading" className="mt-3 text-3xl font-black tracking-tight text-slate-950">Log in to IP Quest</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">Pick up where your ideas left off.</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
          <fieldset>
            <legend className="mb-2 block text-sm font-semibold text-slate-700">Role</legend>
            <div className="grid grid-cols-2 gap-3">
              {(['student', 'teacher'] as const).map((role) => (
                <label key={role} className={`cursor-pointer rounded-xl border px-4 py-3 text-center text-sm font-semibold capitalize transition ${selectedRole === role ? 'border-brand-600 bg-brand-50 text-brand-700 ring-2 ring-brand-100' : 'border-slate-300 text-slate-600 hover:border-brand-300'}`}>
                  <input type="radio" name="login-role" value={role} checked={selectedRole === role} onChange={() => setSelectedRole(role)} className="sr-only" />
                  {role}
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
            <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
            <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
          </div>
          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">New to IP Quest? <Link href="/signup" className="font-bold text-brand-700 hover:text-brand-800">Create an account</Link></p>
      </section>
    </main>
  );
}