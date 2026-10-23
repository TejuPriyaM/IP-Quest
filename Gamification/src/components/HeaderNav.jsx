import React from 'react';
import { BarChart3, BookOpen, Volume2, VolumeX } from 'lucide-react';
import { soundFx } from '../utils/sound';
import { IPQuestBadge } from './IPQuestBadge';

const REALMS = [
  { id: 'patent', name: 'Patent Lab', icon: '💡' },
  { id: 'copyright', name: 'Copyright Studio', icon: '🎨' },
  { id: 'trademark', name: 'Trademark City', icon: '🛡️' },
  { id: 'trade_secret', name: 'Trade Secrets Vault', icon: '🔒' },
  { id: 'plagiarism', name: 'Originality Academy', icon: '🎓' }
];

const ACTIVITIES = [
  { id: '2d', name: 'Lab' },
  { id: '3d', name: '3D World' },
  { id: 'quick', name: 'Story' },
  { id: 'locker', name: 'Locker' },
  { id: 'drop_catcher', name: 'Catch' },
  { id: 'memory_flip', name: 'Memory' },
  { id: 'lightning', name: 'Quiz' },
  { id: 'matcher', name: 'Concept Match' },
  { id: 'detective', name: 'Detective' },
  { id: 'arcade', name: 'Arcade' }
];

const selectClassName =
  'min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#0e2038] shadow-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200';

export const HeaderNav = ({
  activeRealm,
  onSelectRealm,
  activeMode,
  onSelectMode,
  stats,
  onToggleSound,
  onOpenLegal,
  onOpenConceptsGuide,
  onOpenArcade,
  onOpenDashboard,
  isDashboardActive
}) => {
  const selectedActivity = ACTIVITIES.some(activity => activity.id === activeMode)
    ? activeMode
    : '2d';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex min-h-[4.5rem] max-w-7xl items-center gap-3 px-3 py-2 sm:px-5 lg:px-8">
        <button
          type="button"
          onClick={() => {
            soundFx.playClick();
            onOpenArcade();
          }}
          className="group flex shrink-0 items-center gap-2 rounded-xl text-left"
          title="Go to IP Quest Arcade"
        >
          <IPQuestBadge size={48} className="transition-transform group-hover:scale-105" />
          <span className="flex flex-col leading-tight">
            <span className="text-lg font-black tracking-tight text-[#0e2038] sm:text-xl">
              <span className="text-amber-500">IP</span> Quest
            </span>
            <span className="hidden text-[9px] font-semibold tracking-wide text-slate-500 sm:block">
              Explore · Learn · Build
            </span>
          </span>
        </button>

        <nav
          aria-label="Main navigation"
          className="scrollbar-none min-w-0 flex-1 overflow-x-auto"
        >
          <div className="flex min-w-max items-center justify-end gap-2">
            <label className="sr-only" htmlFor="realm-navigation">Learning realm</label>
            <select
              id="realm-navigation"
              value={activeRealm}
              onChange={event => {
                soundFx.playClick();
                onSelectRealm(event.target.value);
              }}
              className={selectClassName}
            >
              {REALMS.map(realm => (
                <option key={realm.id} value={realm.id}>
                  {realm.icon} {realm.name}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="activity-navigation">Activity</label>
            <select
              id="activity-navigation"
              value={selectedActivity}
              onChange={event => {
                soundFx.playClick();
                onSelectMode(event.target.value);
              }}
              className={selectClassName}
            >
              {ACTIVITIES.map(activity => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onOpenDashboard();
              }}
              aria-current={isDashboardActive ? 'page' : undefined}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                isDashboardActive
                  ? 'border-amber-300 bg-amber-100 text-amber-950'
                  : 'border-slate-200 bg-white text-[#0e2038] hover:border-amber-300 hover:bg-amber-50'
              }`}
            >
              <BarChart3 className="h-4 w-4 text-amber-600" />
              <span className="hidden sm:inline">Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundFx.playClick();
                onOpenConceptsGuide();
              }}
              aria-label="Open rules guide"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#0e2038] transition hover:border-amber-300 hover:bg-amber-50"
            >
              <BookOpen className="h-4 w-4 text-amber-600" />
              <span className="hidden lg:inline">Rules</span>
            </button>

            <div className="hidden items-center gap-1 whitespace-nowrap rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-[#0e2038] lg:flex">
              <span>Lv {stats.level}</span>
              <span className="text-slate-300">·</span>
              <span>{stats.xp} XP</span>
              <span className="text-slate-300">·</span>
              <span>₹{stats.coins}</span>
            </div>

            <button
              type="button"
              onClick={onToggleSound}
              aria-label={stats.soundEnabled ? 'Mute audio' : 'Unmute audio'}
              className="rounded-xl border border-slate-200 bg-white p-2 text-amber-700 transition hover:border-amber-300 hover:bg-amber-50"
            >
              {stats.soundEnabled
                ? <Volume2 className="h-4 w-4" />
                : <VolumeX className="h-4 w-4 text-slate-400" />}
            </button>

            <button
              type="button"
              onClick={onOpenLegal}
              className="rounded-xl px-2 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            >
              Notice
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};
