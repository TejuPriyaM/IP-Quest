import React from 'react';
import { STORY_CHAPTERS } from '../../data/ipContent';
import { soundFx } from '../../utils/sound';
import { BookOpen, Shield, CheckCircle2, Lock, ArrowRight, Zap, Trophy } from 'lucide-react';

export const StoryModeView = ({ completedMissions, onLaunchChapter, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">Story Campaign</span>
                <span className="text-slate-400">·</span>
                <span className="text-xs text-slate-300">The Copy Cats Syndicate</span>
              </div>
              <h2 className="text-2xl font-bold font-display text-white">Chronicles of the IP Guardians</h2>
              <p className="text-sm text-slate-300">
                A syndicate of rogue counterfeiters is threatening inventors, creators, and students. Defend the realm across 6 story missions
              </p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-700/60 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
          >
            Back to Map
          </button>
        </div>
      </div>

      {/* Chapters Timeline List */}
      <div className="space-y-4">
        {STORY_CHAPTERS.map((ch, idx) => {
          const isCompleted = completedMissions.includes(ch.id);
          const isUnlocked = idx === 0 || completedMissions.includes(STORY_CHAPTERS[idx - 1].id);

          return (
            <div
              key={ch.id}
              className={`p-6 rounded-2xl border transition-all ${
                isCompleted
                  ? 'bg-slate-800/80 border-emerald-500/50'
                  : isUnlocked
                  ? 'bg-slate-800/90 border-slate-700 hover:border-amber-500/60'
                  : 'bg-slate-900/60 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Chapter 0{ch.chapterNumber}
                    </span>
                    <span className="text-slate-500">·</span>
                    <span className="text-xs text-slate-400">Rival: {ch.villain}</span>
                    {isCompleted && (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Cleared
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-white">{ch.title}</h3>
                  <p className="text-sm text-slate-300 max-w-xl">{ch.premise}</p>
                  <p className="text-xs text-slate-400 mt-1 italic">Mission: {ch.objective}</p>
                </div>

                <div className="shrink-0 flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs text-amber-400 font-bold">+{ch.rewardXP} XP</div>
                    {ch.rewardBadge && (
                      <div className="text-[10px] text-slate-400">{ch.rewardBadge}</div>
                    )}
                  </div>

                  {isUnlocked ? (
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        onLaunchChapter(ch);
                      }}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      {isCompleted ? 'Replay Mission' : 'Play Chapter'}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="px-4 py-2 bg-slate-800 text-slate-500 text-xs font-semibold rounded-xl flex items-center gap-2 border border-slate-750">
                      <Lock className="w-3.5 h-3.5" /> Locked
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
