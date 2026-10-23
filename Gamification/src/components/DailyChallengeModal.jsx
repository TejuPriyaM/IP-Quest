import React, { useState } from 'react';
import { DAILY_CHALLENGES } from '../data/ipContent';
import { soundFx } from '../utils/sound';
import { Flame, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { IPQuestBadge } from './IPQuestBadge';

export const DailyChallengeModal = ({ streak, onClose, onReward }) => {
  const challenge = DAILY_CHALLENGES[0];
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [, setCompleted] = useState(false);

  const handleSelect = ( optId) => {
    if (feedback) return;
    soundFx.playClick();
    setSelectedOptionId(optId);

    const chosen = challenge.options.find(o => o.id === optId);
    if (!chosen) return;

    if (chosen.isCorrect) {
      soundFx.playSuccess();
      confetti({ particleCount: 50, spread: 60 });
    } else {
      soundFx.playInvestigate();
    }

    setFeedback({
      isCorrect: chosen.isCorrect,
      text: chosen.explanation
    });
  };

  const handleClaim = () => {
    soundFx.playSuccess();
    onReward(challenge.xpReward);
    setCompleted(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border-4 border-amber-400 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 relative animate-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors cursor-pointer"
          title="Close"
        >
          ✕
        </button>

        <div className="flex items-center gap-3.5">
          <IPQuestBadge size={52} className="shadow-xs" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-amber-800 uppercase tracking-wider">Today's Mission</span>
              <span className="text-sky-300">·</span>
              <span className="text-xs text-amber-900 font-black bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">🔥 {streak} Day Streak</span>
            </div>
            <h3 className="text-xl font-black text-[#0e2038] font-display mt-0.5">{challenge.title}</h3>
          </div>
        </div>

        <div className="p-4 bg-[#f0f7fc] rounded-2xl border-2 border-sky-200 space-y-2 shadow-xs">
          <p className="text-sm text-slate-700 leading-relaxed font-semibold">
            "{challenge.scenario}"
          </p>
          <div className="text-xs font-black text-amber-800 pt-1">
            Question: {challenge.question}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {challenge.options.map(opt => {
            const isSelected = selectedOptionId === opt.id;
            return (
              <button
                key={opt.id}
                disabled={!!feedback}
                onClick={() => handleSelect(opt.id)}
                className={`w-full p-3.5 rounded-2xl border-2 text-left transition-all flex items-center justify-between text-sm cursor-pointer disabled:opacity-90 font-bold ${
                  isSelected
                    ? opt.isCorrect
                      ? 'bg-emerald-500 text-white border-emerald-300 ring-2 ring-emerald-200 shadow-sm'
                      : 'bg-rose-500 text-white border-rose-300 shadow-sm'
                    : 'bg-white border-sky-200 hover:border-amber-400 text-[#0e2038] hover:bg-sky-50 shadow-xs'
                }`}
              >
                <span>{opt.text}</span>
                {feedback && opt.isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`p-4 rounded-2xl border-2 space-y-3 ${
            feedback.isCorrect ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}>
            <div className="flex items-center gap-2 text-sm font-black">
              {feedback.isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              )}
              <span>{feedback.isCorrect ? 'Streak Maintained!' : 'Educational Breakdown:'}</span>
            </div>
            <p className="text-xs text-slate-700 pl-7 font-medium">{feedback.text}</p>
            <div className="flex justify-end pt-1">
              <button
                onClick={handleClaim}
                className="px-6 py-2.5 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 hover:from-yellow-200 hover:to-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-xs border border-yellow-200 cursor-pointer hover:scale-105 transition-all"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                Collect +{challenge.xpReward} XP & Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
