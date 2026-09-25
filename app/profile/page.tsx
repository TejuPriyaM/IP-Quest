'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { getCurrentProfile, getCurrentUser } from '@/lib/auth';
import { updateProfile, type ProfileRow } from '@/lib/profile';

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setIsEditing(new URLSearchParams(window.location.search).get('edit') === '1');

    Promise.all([getCurrentProfile(), getCurrentUser()])
      .then(([currentProfile, user]) => {
        if (currentProfile) {
          setProfile(currentProfile.profile);
          setDisplayName(typeof currentProfile.profile.display_name === 'string' ? currentProfile.profile.display_name : '');
        }
        if (user) setEmail(user.email);
      })
      .catch(() => setError('Unable to load your profile. Please try again.'))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!displayName.trim()) {
      setError('Display name cannot be empty.');
      return;
    }

    setIsSaving(true);

    try {
      const currentProfile = await getCurrentProfile();
      if (!currentProfile) throw new Error('Your session has expired. Please log in again.');
      const updated = await updateProfile({ userId: currentProfile.profile.$id, displayName: displayName.trim() });
      setProfile(updated);
      setDisplayName(typeof updated.display_name === 'string' ? updated.display_name : displayName.trim());
      setMessage('Profile updated.');
      setIsEditing(false);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to update your profile.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AuthGuard>
      <main className="section-shell py-10 sm:py-14">
        <section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-9">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-7">
            <div><p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">Your profile</p><h1 className="mt-2 text-3xl font-black text-slate-950">Account details</h1></div>
            {!isEditing && <button type="button" onClick={() => setIsEditing(true)} className="btn-secondary">Edit Profile</button>}
          </div>
          {isLoading ? <p className="mt-8 text-sm text-slate-500" aria-busy="true">Loading profile...</p> : (
            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div><label htmlFor="profile-name" className="mb-2 block text-sm font-semibold text-slate-700">Display name</label><input id="profile-name" value={displayName} disabled={!isEditing} onChange={(event) => setDisplayName(event.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 disabled:bg-slate-50" /></div>
              <div><span className="mb-2 block text-sm font-semibold text-slate-700">Email</span><p className="rounded-xl bg-slate-50 px-4 py-3 text-slate-700">{email}</p></div>
              <div><span className="mb-2 block text-sm font-semibold text-slate-700">Role</span><p className="rounded-xl bg-slate-50 px-4 py-3 capitalize text-slate-700">{typeof profile?.role === 'string' ? profile.role : 'student'}</p></div>
              {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
              {message && <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}
              {isEditing && <div className="flex flex-wrap gap-3"><button type="submit" disabled={isSaving} className="btn-primary disabled:opacity-60">{isSaving ? 'Saving...' : 'Save changes'}</button><Link href="/profile" className="btn-secondary">Cancel</Link></div>}
            </form>
          )}
        </section>
      </main>
    </AuthGuard>
  );
}