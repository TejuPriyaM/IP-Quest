import React, { useState } from 'react';
import { soundFx } from '../../utils/sound';
import confetti from 'canvas-confetti';
import { 
  Zap, CheckCircle2, XCircle, RotateCcw, Trophy, Star, 
  Flame, Sparkles, Award, ArrowRight, Lightbulb, HelpCircle 
} from 'lucide-react';
import { IPQuestBadge } from '../IPQuestBadge';

const TF_QUESTIONS= [
  {
    id: 'tf1',
    concept: 'patent',
    conceptLabel: 'Patent Law',
    conceptIcon: '💡',
    statement: 'Can you get an official 20-Year Patent for an idea just floating in your head without building a real proto mechanism?',
    isTrue: false,
    funFact: 'FALSE Ideas alone cannot be patented You must invent and describe a real working machine, tool, or technical process.',
    badge: 'Inventions Rule'
  },
  {
    id: 'tf2',
    concept: 'copyright',
    conceptLabel: 'Copyright',
    conceptIcon: '🎨',
    statement: 'The exact millisecond you draw an original superhero comic in your sketchbook, you automatically own the copyright!',
    isTrue: true,
    funFact: 'TRUE Copyright is 100% automatic the moment original art or stories are fixed on paper or saved to a computer!',
    badge: 'Automatic Protection'
  },
  {
    id: 'tf3',
    concept: 'copyright',
    conceptLabel: 'Copyright',
    conceptIcon: '🎨',
    statement: 'If a company sells 500 T-shirts of your drawing, writing "Credit to artist" makes it 100% legal without paying you.',
    isTrue: false,
    funFact: 'FALSE Saying "credit to artist" is NOT a commercial license Selling your art without your permission is illegal infringement!',
    badge: 'Artist Rights'
  },
  {
    id: 'tf4',
    concept: 'trademark',
    conceptLabel: 'Trademark',
    conceptIcon: '🏷️',
    statement: 'Made-up invented words like "VoltStride™" and "Kodak" get the strongest superhero legal protection in courts!',
    isTrue: true,
    funFact: 'TRUE Invented coined words have no dictionary meaning, giving them maximum 100% trademark power to stop copycats!',
    badge: 'Coined Names'
  },
  {
    id: 'tf5',
    concept: 'trademark',
    conceptLabel: 'Trademark',
    conceptIcon: '🏷️',
    statement: 'A sneaker company can trademark the generic dictionary word "Running Shoes" so nobody else can ever say it.',
    isTrue: false,
    funFact: 'FALSE Generic words can NEVER be trademarked Everyone must be free to use normal everyday words.',
    badge: 'Generic Words'
  },
  {
    id: 'tf6',
    concept: 'trade_secret',
    conceptLabel: 'Trade Secret',
    conceptIcon: '🔐',
    statement: 'Coca-Cola chose a Trade Secret instead of a Patent because Trade Secrets can last FOREVER as long as kept locked!',
    isTrue: true,
    funFact: 'TRUE Patents expire after 20 years, but Coca-Cola has kept their secret syrup recipe safe in a vault for over 135 years!',
    badge: 'Forever Protection'
  },
  {
    id: 'tf7',
    concept: 'trade_secret',
    conceptLabel: 'Trade Secret',
    conceptIcon: '🔐',
    statement: 'If an employee accidentally leaks a restaurant’s secret recipe on TikTok, the trade secret stays protected forever anyway.',
    isTrue: false,
    funFact: 'FALSE Once a secret is public knowledge on the internet, trade secret protection is destroyed forever Secrecy is mandatory.',
    badge: 'Active Secrecy'
  },
  {
    id: 'tf8',
    concept: 'plagiarism',
    conceptLabel: 'School Honesty',
    conceptIcon: '📝',
    statement: 'Swapping two adjectives with a thesaurus in a copied Wikipedia paragraph without citing the author is still plagiarism.',
    isTrue: true,
    funFact: 'TRUE "Patchwriting" (swapping words) without citing the source is still cheating Always explain in your own voice and cite.',
    badge: 'Academic Integrity'
  },
  {
    id: 'tf9',
    concept: 'copyright',
    conceptLabel: 'Fair Use in School',
    conceptIcon: '📚',
    statement: 'You are legally allowed to show a 10-second science documentary clip in your classroom school project under Fair Use.',
    isTrue: true,
    funFact: 'TRUE Educational learning, student commentary, and classroom presentations are protected under Fair Use law!',
    badge: 'Fair Use'
  },
  {
    id: 'tf10',
    concept: 'patent',
    conceptLabel: 'Patent Expiration',
    conceptIcon: '💡',
    statement: 'After 20 years, a patent expires so the whole world can learn from it and build better technology for humanity.',
    isTrue: true,
    funFact: 'TRUE This is the "Grand Bargain": 20 years of exclusive rewards for the inventor, then free blueprints for all of humanity!',
    badge: 'Grand Bargain'
  }
];

export const TrueFalseLightningGame = ({ onComplete, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [answeredState, setAnsweredState] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const currentQ = TF_QUESTIONS[currentIndex];

  const handleAnswer = ( choice) => {
    if (answeredState) return;
    const isCorrect = choice === currentQ.isTrue;

    setAnsweredState({ chosen: choice, isCorrect });

    if (isCorrect) {
      soundFx.playSuccess();
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      const newStreak = streak + 1;
      setScore(s => s + 1);
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
    } else {
      soundFx.playError();
      setStreak(0);
    }
  };

  const handleNext = () => {
    soundFx.playClick();
    setAnsweredState(null);

    if (currentIndex < TF_QUESTIONS.length - 1) {
      setCurrentIndex(i => i + 1);
    } else {
      setIsFinished(true);
      soundFx.playLevelUp();
      confetti({ particleCount: 90, spread: 90 });
    }
  };

  const handleRestart = () => {
    soundFx.playClick();
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setAnsweredState(null);
    setIsFinished(false);
  };

  const handleFinishRewards = () => {
    const stars = score >= 9 ? 3 : score >= 6 ? 2 : 1;
    const earnedXp = score * 25 + 50;
    const earnedCoins = score * 6 + 15;
    onComplete(earnedXp, earnedCoins, stars);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 select-none animate-in fade-in">
      {/* Header Banner in Vibrant Logo Colors */}
      <div className="bg-gradient-to-r from-[#e8f3fb] via-[#f0f7fe] to-[#fff9ee] border-2 border-amber-400 rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center text-3xl shadow-xs border-2 border-yellow-200 shrink-0">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 border border-amber-300 shadow-xs">
                  ⚡ 1-Tap Speed Quiz
                </span>
                <span className="text-xs text-amber-800 font-extrabold">Instant Fun for School Students</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0e2038] font-display mt-0.5 tracking-tight">
                True or False Quiz
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onBack && (
              <button
                onClick={onBack}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-sky-50 text-amber-800 text-xs font-black border-2 border-amber-400 cursor-pointer shadow-xs transition-all"
              >
                Back to Missions
              </button>
            )}
          </div>
        </div>

        {/* Progress & Live Streak HUD */}
        <div className="mt-4 pt-3 border-t border-sky-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-amber-800 font-mono">
              Question {currentIndex + 1} of {TF_QUESTIONS.length}
            </span>
            <div className="w-32 h-2.5 rounded-full bg-white overflow-hidden border border-sky-200">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${((currentIndex + 1) / TF_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-bold text-[#0e2038] flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-sky-200 shadow-xs">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              Score: <strong className="text-amber-800">{score}</strong>/{TF_QUESTIONS.length}
            </span>
            {streak > 1 && (
              <span className="font-black text-slate-950 flex items-center gap-1 bg-gradient-to-r from-yellow-300 to-amber-400 px-3 py-1 rounded-xl border-2 border-yellow-200 shadow-xs animate-pulse">
                <Flame className="w-3.5 h-3.5 text-orange-600 fill-orange-500" />
                {streak} Streak
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Question Card */}
      {!isFinished ? (
        <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-sky-200 shadow-xs space-y-6 text-center">
          {/* Badge & Topic */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">{currentQ.conceptIcon}</span>
            <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-50 border border-amber-300 px-3 py-1 rounded-full shadow-xs">
              {currentQ.conceptLabel} • {currentQ.badge}
            </span>
          </div>

          {/* Big, Easy Question Text */}
          <div className="max-w-2xl mx-auto py-2">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-[#0e2038] font-display leading-snug">
              "{currentQ.statement}"
            </h3>
          </div>

          {/* TWO GIANT PLAYABLE BUTTONS: TRUE OR FALSE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto pt-2">
            {/* TRUE BUTTON */}
            <button
              disabled={answeredState !== null}
              onClick={() => handleAnswer(true)}
              className={`p-6 sm:p-8 rounded-3xl border-4 font-display font-black text-2xl sm:text-3xl flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xs ${
                answeredState === null
                  ? 'bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 border-emerald-300 text-white hover:scale-105 active:scale-95'
                  : currentQ.isTrue
                  ? 'bg-emerald-600 border-yellow-300 text-white ring-4 ring-yellow-300 scale-102'
                  : answeredState.chosen === true
                  ? 'bg-rose-100 border-rose-400 text-rose-800 opacity-60'
                  : 'bg-slate-100 border-slate-300 text-slate-400 opacity-40'
              }`}
            >
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-200" />
              <span>TRUE ✅</span>
            </button>

            {/* FALSE BUTTON */}
            <button
              disabled={answeredState !== null}
              onClick={() => handleAnswer(false)}
              className={`p-6 sm:p-8 rounded-3xl border-4 font-display font-black text-2xl sm:text-3xl flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xs ${
                answeredState === null
                  ? 'bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 border-rose-300 text-white hover:scale-105 active:scale-95'
                  : !currentQ.isTrue
                  ? 'bg-emerald-600 border-yellow-300 text-white ring-4 ring-yellow-300 scale-102'
                  : answeredState.chosen === false
                  ? 'bg-rose-100 border-rose-400 text-rose-800 opacity-60'
                  : 'bg-slate-100 border-slate-300 text-slate-400 opacity-40'
              }`}
            >
              <XCircle className="w-8 h-8 sm:w-10 sm:h-10 text-rose-200" />
              <span>FALSE ❌</span>
            </button>
          </div>

          {/* Feedback & Next Button */}
          {answeredState && (
            <div className="p-5 rounded-2xl bg-[#eaf3fb] border-2 border-amber-400 space-y-3 animate-fade-in text-left max-w-xl mx-auto shadow-xs">
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xl shrink-0 font-black shadow-xs ${
                    answeredState.isCorrect
                      ? 'bg-emerald-500 text-white border-2 border-emerald-300'
                      : 'bg-rose-500 text-white border-2 border-rose-300'
                  }`}
                >
                  {answeredState.isCorrect ? '✓' : '✕'}
                </div>
                <div className="flex-1">
                  <h4
                    className={`text-lg font-black font-display ${
                      answeredState.isCorrect ? 'text-emerald-800' : 'text-rose-800'
                    }`}
                  >
                    {answeredState.isCorrect
                      ? '🎉 Correct Super job!'
                      : `Not quite The statement is actually ${currentQ.isTrue ? 'TRUE' : 'FALSE'}.`}
                  </h4>
                  <p className="text-sm text-slate-700 font-semibold mt-1 leading-relaxed">
                    {currentQ.funFact}
                  </p>
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  onClick={handleNext}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 text-slate-950 font-black text-sm border-2 border-yellow-100 hover:scale-105 active:scale-95 shadow-xs inline-flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>{currentIndex < TF_QUESTIONS.length - 1 ? 'Next Question' : 'See Final Score 🏆'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* FINISHED SCORE CARD */
        <div className="p-8 sm:p-10 rounded-3xl bg-white border-2 border-amber-400 shadow-sm text-center space-y-6 animate-fade-in">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-yellow-300 via-amber-400 to-yellow-500 border-4 border-white flex items-center justify-center text-5xl shadow-xs">
            🏆
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-950 bg-amber-400 px-3 py-1 rounded-full border border-yellow-200 shadow-xs">
              Quiz Complete
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-[#0e2038] font-display">
              {score >= 8 ? '🌟 IP Master Genius!' : score >= 5 ? '⚡ Great Detective!' : '🌱 Good Practice!'}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 font-medium max-w-md mx-auto">
              You scored <strong className="text-amber-800 font-black text-lg">{score}</strong> out of{' '}
              <strong className="text-[#0e2038] font-black text-lg">{TF_QUESTIONS.length}</strong>
            </p>
          </div>

          {/* Star Rating */}
          <div className="flex items-center justify-center gap-3 py-1">
            {[1, 2, 3].map(starNum => {
              const active =
                (starNum === 1 && score >= 4) ||
                (starNum === 2 && score >= 7) ||
                (starNum === 3 && score >= 9);
              return (
                <div
                  key={starNum}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border-2 transition-transform ${
                    active
                      ? 'bg-amber-400 border-yellow-200 text-slate-950 scale-110 shadow-xs'
                      : 'bg-slate-100 border-slate-300 text-slate-400'
                  }`}
                >
                  ⭐
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={handleRestart}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-sky-50 text-amber-800 border-2 border-amber-400 font-black text-sm flex items-center gap-2 cursor-pointer shadow-xs transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
            <button
              onClick={handleFinishRewards}
              className="px-7 py-3 rounded-2xl bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 hover:from-yellow-200 hover:to-amber-400 text-slate-950 font-black text-sm border-2 border-yellow-100 shadow-xs flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-5 h-5" />
              <span>Claim Rewards & Continue!</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
