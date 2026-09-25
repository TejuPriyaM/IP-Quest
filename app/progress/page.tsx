import Link from 'next/link';
import SectionHeader from '@/components/SectionHeader';

export default function ProgressPage() {
  return (
    <main className="section-shell py-14 sm:py-16">
      <SectionHeader
        title="Progress tracker"
        description="Your learning journey is being prepared. This page will show milestones, streaks, and achievements in a later phase."
        headingLevel="h1"
      />

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="glass-card p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Current status</p>
          <h3 className="mt-3 text-3xl font-bold text-slate-900">Coming soon</h3>
          <p className="mt-3 text-base text-slate-600">
            Progress tracking is planned for a future phase once the core learning and quiz flow is stable.
          </p>
        </div>

        <div className="glass-card p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Quick actions</p>
          <div className="mt-5 flex flex-col gap-3">
            <Link href="/learn" className="btn-primary">
              Continue learning
            </Link>
            <Link href="/games" className="btn-secondary">
              Try a quiz
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
