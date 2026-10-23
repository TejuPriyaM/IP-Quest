import React, { useState } from 'react';
import { LOCKER_ITEMS } from '../../data/ipContent';
import { soundFx } from '../../utils/sound';
import { 
  Package, CheckCircle2, AlertCircle, ArrowRight, RotateCcw, 
  Sparkles, ArrowLeft, Trophy 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { IPQuestBadge } from '../IPQuestBadge';

const CATEGORIES = [
  { concept: 'patent', label: '1. Patent (Inventions)', icon: '💡', border: 'border-amber-400 hover:border-amber-500', bg: 'bg-amber-50 hover:bg-amber-100', text: 'text-amber-900' },
  { concept: 'copyright', label: '2. Copyright (Art & Music)', icon: '🎨', border: 'border-purple-400 hover:border-purple-500', bg: 'bg-purple-50 hover:bg-purple-100', text: 'text-purple-900' },
  { concept: 'trademark', label: '3. Trademark (Brand Logos)', icon: '🏷️', border: 'border-emerald-400 hover:border-emerald-500', bg: 'bg-emerald-50 hover:bg-emerald-100', text: 'text-emerald-900' },
  { concept: 'trade_secret', label: '4. Trade Secret (Recipes)', icon: '🔒', border: 'border-rose-400 hover:border-rose-500', bg: 'bg-rose-50 hover:bg-rose-100', text: 'text-rose-900' },
  { concept: 'plagiarism', label: '5. Citation (No Copying)', icon: '🎓', border: 'border-sky-400 hover:border-sky-500', bg: 'bg-sky-50 hover:bg-sky-100', text: 'text-sky-900' }
];

export const IPLockerMiniGame = ({ onComplete, onBack }) => {
  const [itemsQueue, setItemsQueue] = useState(LOCKER_ITEMS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [activeFeedback, setActiveFeedback] = useState(null);
  const [finished, setFinished] = useState(false);

  const currentItem = itemsQueue[currentIndex];

  const handleSortItem = (concept) => {
    if (activeFeedback) return;
    soundFx.playClick();
    const isCorrect = concept === currentItem.correctConcept;

    if (isCorrect) {
      soundFx.playSuccess();
    } else {
      soundFx.playInvestigate();
    }

    const newResult = { item: currentItem, chosen: concept, isCorrect };
    const updatedResults = [...results, newResult];
    setResults(updatedResults);

    setActiveFeedback({
      isCorrect,
      text: currentItem.explanation
    });
  };

  const handleNextItem = () => {
    soundFx.playClick();
    setActiveFeedback(null);
    if (currentIndex < itemsQueue.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setFinished(true);
      const correctCount = results.filter(r => r.isCorrect).length;
      if (correctCount >= 6) {
        confetti({ particleCount: 70, spread: 80 });
      }
    }
  };

  const handleFinishGame = () => {
    const correctCount = results.filter(r => r.isCorrect).length;
    const stars = correctCount >= 7 ? 3 : correctCount >= 5 ? 2 : 1;
    onComplete(140, 50, stars);
  };

  const handleRestart = () => {
    soundFx.playClick();
    setCurrentIndex(0);
    setResults([]);
    setActiveFeedback(null);
    setFinished(false);
  };

  const correctCount = results.filter(r => r.isCorrect).length;

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-8 animate-in fade-in select-none">
      {/* Header Banner in Light Pale Blue Palette */}
      <div className="bg-gradient-to-r from-[#e8f3fb] via-[#f0f7fe] to-[#fff9ee] border-2 border-amber-400 rounded-3xl p-5 shadow-sm relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <IPQuestBadge size={54} className="logo-glow shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 border border-amber-300 shadow-xs">
                  📦 Speed Sorter Arcade
                </span>
                <span className="text-xs text-amber-800 font-extrabold">Easy & Fun School Challenge</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0e2038] font-display mt-0.5 tracking-tight">
                The School IP Locker Sorter
              </h2>
            </div>
          </div>

          <button
            onClick={() => { soundFx.playClick(); onBack(); }}
            className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-sky-50 text-[#0e2038] hover:text-amber-700 border-2 border-sky-200 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-3 pt-3 border-t-2 border-slate-200/80 text-xs text-slate-600 flex items-center gap-2">
          <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black text-[10px] shadow-xs">HOW TO PLAY</span>
          <span>Look at the item in the school locker, then click its matching IP vault below to protect it!</span>
        </div>
      </div>

      {!finished ? (
        <div className="bg-white border-2 border-amber-400/90 rounded-3xl p-6 sm:p-7 space-y-6 shadow-sm">
          {/* Progress bar */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Item {currentIndex + 1} of {itemsQueue.length}</span>
            <span>Correct Placements: <strong className="text-emerald-700">{correctCount}/{results.length}</strong></span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
            <div
              className="bg-gradient-to-r from-amber-400 to-yellow-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${((currentIndex + 1) / itemsQueue.length) * 100}%` }}
            />
          </div>

          {/* Active Locker Object Card */}
          <div className="p-6 sm:p-8 bg-gradient-to-b from-[#f0f7fe] to-[#e8f2fa] rounded-2xl border-2 border-sky-300 text-center space-y-3 relative overflow-hidden shadow-xs">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-amber-100 border-2 border-amber-400 flex items-center justify-center text-4xl shadow-xs animate-pulse">
              📦
            </div>
            <h3 className="text-2xl font-black text-[#0e2038] font-display">{currentItem.name}</h3>
            <p className="text-sm text-slate-700 max-w-lg mx-auto font-medium">
              "{currentItem.description}"
            </p>
          </div>

          {/* 5 Drop Target Vaults */}
          <div className="space-y-3">
            <span className="text-xs font-black uppercase text-amber-800 block text-center tracking-wider">
              TAP THE RIGHT PROTECTION VAULT TO DEPOSIT:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.concept}
                  disabled={!!activeFeedback}
                  onClick={() => handleSortItem(cat.concept)}
                  className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${cat.bg} ${cat.border} hover:scale-105 active:scale-95 shadow-xs`}
                >
                  <span className="text-3xl">{cat.icon}</span>
                  <span className={`text-xs font-black ${cat.text} text-center leading-tight`}>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Feedback & Micro-Explanation */}
          {activeFeedback && (
            <div className={`p-4 rounded-2xl border-2 space-y-3 animate-in zoom-in-95 ${
              activeFeedback.isCorrect ? 'bg-emerald-50 border-emerald-400' : 'bg-rose-50 border-rose-400'
            }`}>
              <div className="flex items-center gap-3">
                {activeFeedback.isCorrect ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-7 h-7 text-rose-600 shrink-0" />
                )}
                <div>
                  <h4 className={`font-black text-sm ${activeFeedback.isCorrect ? 'text-emerald-900' : 'text-rose-900'}`}>
                    {activeFeedback.isCorrect ? '🎯 Accurate Placement!' : '🔎 Let\'s Examine This:'}
                  </h4>
                  <p className="text-xs text-slate-700 mt-0.5 font-medium">{activeFeedback.text}</p>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleNextItem}
                  className="px-5 py-2.5 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 hover:from-yellow-200 hover:to-amber-300 text-slate-950 font-black rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs hover:scale-105"
                >
                  <span>{currentIndex < itemsQueue.length - 1 ? 'Next Locker Item' : 'See Results'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Final Results & Missed Concepts Review in Light Theme */
        <div className="bg-white border-2 border-amber-400 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-4xl shadow-md">
            🏆
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-[#0e2038] font-display">
              Locker Sorting Complete
            </h3>
            <p className="text-sm text-slate-600">
              You protected <strong className="text-amber-800 text-base">{correctCount}</strong> out of <strong className="text-[#0e2038]">{results.length}</strong> items correctly
            </p>
          </div>

          {/* Review of Missed Items if any */}
          {results.some(r => !r.isCorrect) && (
            <div className="p-4 bg-[#f0f7fc] rounded-2xl border-2 border-amber-400/60 space-y-3 text-left">
              <h4 className="text-xs uppercase tracking-wider text-amber-800 font-black">
                Review of Missed Concepts
              </h4>
              <div className="space-y-2">
                {results.filter(r => !r.isCorrect).map((r, i) => (
                  <div key={i} className="text-xs p-3 bg-white rounded-xl border border-sky-200 space-y-1 shadow-xs">
                    <div className="font-bold text-[#0e2038]">{r.item.name}</div>
                    <div className="text-slate-700">
                      You chose <span className="text-rose-600 uppercase font-bold">{r.chosen.replace('_', ' ')}</span> · Correct protection is <span className="text-emerald-700 uppercase font-black">{r.item.correctConcept.replace('_', ' ')}</span>
                    </div>
                    <div className="text-slate-500 italic">"{r.item.explanation}"</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-center items-center gap-3 pt-2">
            <button
              onClick={handleRestart}
              className="px-5 py-3 bg-white hover:bg-sky-50 text-[#0e2038] border-2 border-sky-200 font-black rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
            <button
              onClick={handleFinishGame}
              className="px-6 py-3 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 text-slate-950 font-black rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer hover:scale-105"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Claim Locker Rewards & XP</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
