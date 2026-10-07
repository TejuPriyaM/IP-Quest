import Link from 'next/link';
import IPQuestWorld from '@/components/IPQuestWorld';
import SectionHeader from '@/components/SectionHeader';

const missionTips = [
  'Move with W A S D, look around by dragging the mouse, and use E near a highlighted object.',
  'Every mission has a briefing, a clear objective, and a reason the task matters.',
  'Complete the hands-on missions to earn a game badge and unlock the final mystery.',
];

export default function GamesPage() {
  return (
    <main className="section-shell py-14 sm:py-16">
      <SectionHeader
        title="IP Quest world map"
        description="Travel through five learning regions and turn each IP topic into a mission, action, and reward."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <IPQuestWorld />

        <aside className="space-y-5">
          <div className="glass-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Current mission</p>
            <h3 className="mt-3 text-2xl font-bold text-slate-900">Help Professor Nova finish the prototype</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Explore the lab, find the missing components, assemble the irrigation machine, and see how its technical solution works.
            </p>
            <Link href="/games/invention-lab" className="btn-primary mt-5 w-full justify-center">
              Enter Patent Lab
            </Link>
          </div>

          <div className="glass-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Quest rules</p>
            <ul className="mt-4 space-y-3">
              {missionTips.map((tip) => (
                <li key={tip} className="flex gap-3 text-sm text-slate-600">
                  <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Continue the quest</p>
            <div className="mt-4 flex flex-col gap-3">
              <Link href="/games/invention-lab" className="btn-secondary w-full justify-center">Patent Lab</Link>
              <Link href="/games/creator-studio" className="btn-secondary w-full justify-center">Creator Studio</Link>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
