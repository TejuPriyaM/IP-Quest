import Link from 'next/link';
import IPQuestWorld from '@/components/IPQuestWorld';
import SectionHeader from '@/components/SectionHeader';

const missionTips = [
  'Follow the task at the top of the screen and look for the softly glowing objects.',
  'On a computer, use W A S D or the arrow keys to move; press E near an object. On a touch screen, use the controls shown.',
  'There is no timer. Explore at your own pace, learn from each task, and earn badges as you go.',
];

export default function GamesPage() {
  return (
    <main className="section-shell py-14 sm:py-16">
      <SectionHeader
        title="Choose a learning game"
        description="IP means intellectual property: ideas and creative work people make. Explore familiar situations and learn how inventions, art, brands, and research are protected."
      />

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <IPQuestWorld />

        <aside className="space-y-5">
          <div className="glass-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">Try this first</p>
            <h3 className="mt-3 text-2xl font-bold text-slate-900">Build a water-saving garden helper</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Help Professor Nova find parts, test a simple irrigation machine, and learn what a patent can protect.
            </p>
            <Link href="/games/invention-lab" className="btn-primary mt-5 w-full justify-center">
              Start the mission
            </Link>
          </div>

          <div className="glass-card p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">How to play</p>
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
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">More games</p>
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
