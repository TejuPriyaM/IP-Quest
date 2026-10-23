import React from 'react';
import { soundFx } from '../../utils/sound';
import { 
  Play, Sparkles, Trophy, Zap, Target, Search, 
  Package, Compass, Lightbulb, Feather, ShieldCheck, 
  Lock, GraduationCap, Flame, ArrowRight, Heart
} from 'lucide-react';
import { IPQuestBadge } from '../IPQuestBadge';

const ARCADE_GAMES= [
  {
    id: 'drop_catcher',
    title: 'Drop & Catch',
    badge: '🕹️ Action',
    difficulty: 'Easy',
    icon: '🎮',
    description: 'Control the IP Vault catcher Catch falling Patents, Artworks, and Logos from the sky while dodging pirate rip-offs.',
    features: ['Keys, touch or mouse', '2x Mission Bonuses', 'Combos & High Scores'],
    isPopular: true
  },
  {
    id: 'memory_flip',
    title: 'Memory Match',
    badge: '🃏 Puzzle',
    difficulty: 'Easy',
    icon: '🃏',
    description: 'Flip mystery cards to match IP superpowers with real inventions, creative art, and brand logos.',
    features: ['12 Mystery Cards', 'Timer & Move Tracker', 'Confetti Celebration'],
    isPopular: true
  },
  {
    id: 'locker',
    title: 'Locker Sorter',
    badge: '📦 Sorter',
    difficulty: 'Easy',
    icon: '📦',
    description: 'Sort school inventions, music tracks, and cafeteria drinks into the correct IP protection vaults.',
    features: ['1-Tap Vault Sorting', 'Real School Dilemmas', 'Instant Explanations'],
  },
  {
    id: 'lightning',
    title: 'True or False',
    badge: '⚡ Trivia',
    difficulty: 'Easy',
    icon: '🔥',
    description: 'Rapid-fire 1-tap questions Can you patent an unbuilt daydream? Answer fast before time runs out.',
    features: ['Rapid 1-Tap Buttons', 'Streak Multipliers', 'Fun Fact Popups'],
  },
  {
    id: '3d',
    title: '3D Facility',
    badge: '🌐 Interactive 3D',
    difficulty: '3D World',
    icon: '🌐',
    description: 'Explore 5 interactive 3D worlds: Patent Lab, Plagiarism Academy, Copyright Studio, Trademark City, and Secret Vault with real-time 3D portals!',
    features: ['All 5 IP Topics in 3D', '3D Teleport Portals & Quests', 'Click, Touch or WASD Navigation'],
    isPopular: true
  },
  {
    id: 'matcher',
    title: 'Concept Matcher',
    badge: '🎯 Cards',
    difficulty: 'Easy',
    icon: '🎯',
    description: 'Inspect inventions and creative works, then tap which of the 5 IP superpowers legally protects them.',
    features: ['Illustrated Cards', 'Hint Lifeline', 'XP Rewards'],
  },
  {
    id: 'detective',
    title: 'Mystery Detective',
    badge: '🕵️ Case',
    difficulty: 'Puzzle',
    icon: '🕵️',
    description: 'Inspect evidence from school studios and robotics labs to solve student copyright and trademark disputes.',
    features: ['Clue Inspection', 'Evidence Analysis', 'Detective Badges'],
  },
  {
    id: 'lab',
    concept: 'trade_secret',
    title: 'Secret Vault',
    badge: '🔒 Lab',
    difficulty: 'Mission',
    icon: '🔒',
    description: 'Stop trade secret leaks at BioMatrix Labs, set secure PIN codes, and protect confidential formula files.',
    features: ['Interactive Vault Lab', 'Biometric Safe & Locks', 'Mentor Rajiv Guidance'],
  }
];

export const StudentArcadeHub = ({ onSelectGame, onOpenConceptsGuide, onOpenDashboard }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-10 animate-in fade-in select-none">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="relative z-10 max-w-3xl space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-amber-400 text-amber-800 text-xs font-black shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>KIDS & SCHOOL ARCADE • EXPLORE, LEARN, BUILD A SAFER TOMORROW</span>
          </div>

          <div className="flex items-center gap-3">
            <IPQuestBadge size={64} className="logo-glow shrink-0 hidden sm:block" />
            <h1 className="text-3xl sm:text-4xl font-black text-[#0e2038] font-display tracking-tight leading-tight">
              Play & Learn Intellectual Property
            </h1>
          </div>

          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            Pick any interactive game below Catch falling inventions, flip memory cards, sort items into lockers, or explore in 3D. All games are designed to be <strong className="text-amber-700">easy, educational, and super fun</strong> for students
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => {
                soundFx.playClick();
                onSelectGame('drop_catcher');
              }}
              className="px-6 py-3.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-sm transition hover:bg-amber-300 flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>PLAY DROP & CATCH</span>
            </button>

            <button
              onClick={() => {
                soundFx.playClick();
                onSelectGame('3d');
              }}
              className="px-5 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-semibold text-sm transition hover:border-amber-300 hover:bg-amber-50 flex items-center gap-2 cursor-pointer"
            >
              <span>🌐 3D FACILITY</span>
            </button>

            {onOpenConceptsGuide && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenConceptsGuide();
                }}
                className="px-4 py-3 bg-white hover:bg-sky-50 text-amber-800 hover:text-amber-950 border-2 border-amber-400 text-xs font-black rounded-2xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <span>💡 5 Concepts Guide</span>
              </button>
            )}

            {onOpenDashboard && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  onOpenDashboard();
                }}
                className="px-4 py-3 bg-white hover:bg-sky-50 text-[#0e2038] hover:text-amber-800 border-2 border-sky-300 text-xs font-black rounded-2xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <span>📊 Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Arcade Game Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🕹️</span>
            <h2 className="text-xl font-black text-[#0e2038] font-display">
              Arcade Games
            </h2>
          </div>
          <span className="text-xs text-[#0e2038] font-bold bg-white px-3 py-1 rounded-full border border-sky-200 shadow-xs">
            8 Games Available
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {ARCADE_GAMES.map(game => (
            <div
              key={game.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between shadow-sm transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md relative overflow-hidden"
            >
              {game.isPopular && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase shadow-xs flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-slate-950" /> POPULAR
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-2xl shrink-0">
                    {game.icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 inline-block">
                      {game.difficulty}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-[#0e2038] font-display leading-tight mt-1">
                      {game.title}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {game.description}
                </p>

                <div className="space-y-1 pt-1 border-t border-slate-100">
                  {game.features.map((feat, i) => (
                    <div key={i} className="text-[11px] text-slate-700 flex items-center gap-1.5 font-semibold">
                      <span className="text-amber-600 font-bold">✓</span>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-2">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onSelectGame(game.id, game.concept);
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Play Game</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
