import React, { useState } from 'react';
import { soundFx } from '../../utils/sound';
import confetti from 'canvas-confetti';
import {
  Lightbulb, Feather, ShieldCheck, Lock, GraduationCap,
  Sparkles, CheckCircle2, XCircle, ArrowRight, RotateCcw,
  BookOpen, HelpCircle, Flame, Trophy
} from 'lucide-react';
import { IPQuestBadge } from '../IPQuestBadge';

const MATCH_ITEMS= [
  {
    id: 'm1',
    emoji: '💧',
    title: 'Solar Smart Irrigation Pump',
    description: 'An automated solar pump invented by Dave that measures soil humidity and opens water valves automatically.',
    concept: 'patent',
    hint: 'Think: Does this protect a physical machine or technical mechanism?',
    explanation: 'Patents protect real working machines, functional inventions, and technical processes (granted for 20 years).'
  },
  {
    id: 'm2',
    emoji: '🎨',
    title: 'Mia\'s Neon Comic Strip: "AstroBot"',
    description: 'An original 12-page hand-drawn sci-fi comic book story created and colored by student Mia in her studio.',
    concept: 'copyright',
    hint: 'Think: Does this protect original art, stories, songs, and creative drawings?',
    explanation: 'Copyright automatically protects original creative art, illustrations, music, writing, and games upon creation.'
  },
  {
    id: 'm3',
    emoji: '🥤',
    title: 'CitroVibe™ Sparkling Juice Logo',
    description: 'The distinctive name, logo design, and bottle symbol used on shelves so shoppers never confuse it with rival drinks.',
    concept: 'trademark',
    hint: 'Think: Does this identify the brand name so customers do not get tricked in stores?',
    explanation: 'Trademarks protect unique brand names, logos, and slogans that identify the source of goods in commerce.'
  },
  {
    id: 'm4',
    emoji: '🧪',
    title: 'BioMatrix Secret Enzyme Formula (PIN: 9042)',
    description: 'A confidential plant nutrient recipe locked inside a high-security vault with passwords, NDAs, and biometric sensors.',
    concept: 'trade_secret',
    hint: 'Think: Is this confidential business information kept secret behind passwords?',
    explanation: 'Trade secrets protect private formulas, code, and customer data for centuries, as long as active reasonable security is enforced.'
  },
  {
    id: 'm5',
    emoji: '📝',
    title: 'Science Fair Report with Wikipedia Sentences',
    description: 'A student copied three full paragraphs from a science blog word-for-word into their paper without any citations.',
    concept: 'plagiarism',
    hint: 'Think: Did the student copy someone else\'s writing and pretend they wrote it?',
    explanation: 'Plagiarism is taking someone else\'s words or thoughts and claiming them as your own without quoting and citing them.'
  },
  {
    id: 'm6',
    emoji: '🤖',
    title: 'Bionic Hand with Magnetic Grippers',
    description: 'An engineering team designed an electric prosthetic hand mechanism that grasps fragile eggs without breaking them.',
    concept: 'patent',
    hint: 'Think: Is this a functional mechanical device that solves a technical problem?',
    explanation: 'Patents protect novel, non-obvious, functional devices and physical mechanisms.'
  },
  {
    id: 'm7',
    emoji: '🎵',
    title: 'Original Synthwave Soundtrack: "Pixel Horizon"',
    description: 'An original MP3 music beat recorded, composed, and arranged by a 9th-grade student on their digital workstation.',
    concept: 'copyright',
    hint: 'Think: Who owns an original music track recorded on a computer?',
    explanation: 'Original musical compositions and sound recordings are automatically copyrighted the instant they are recorded.'
  },
  {
    id: 'm8',
    emoji: '👟',
    title: 'ZapTrack™ Running Sneaker Brand & Slogan',
    description: 'The coined name "ZapTrack" and the swooshing lightning bolt logo stitched on athlete shoes.',
    concept: 'trademark',
    hint: 'Think: Does this logo tell runners which company made the shoe?',
    explanation: 'Brand names and distinctive logos serve as trademarks to avoid consumer confusion in marketplaces.'
  },
  {
    id: 'm9',
    emoji: '🍪',
    title: 'Grandma\'s 100-Year Cookie Crust Formula',
    description: 'The handwritten measurement sheet of spices kept in a locked family lockbox and never published.',
    concept: 'trade_secret',
    hint: 'Think: Has this recipe never been patented or published to keep it confidential?',
    explanation: 'Secret culinary recipes are classic trade secrets that last as long as the family or business never publishes them.'
  },
  {
    id: 'm10',
    emoji: '📚',
    title: 'Borrowing Research Data Without Mentioning Author',
    description: 'Using a university chart in your classroom slide deck without listing the research professor or year of the study.',
    concept: 'plagiarism',
    hint: 'Think: Did the presenter fail to give academic credit and citation?',
    explanation: 'Academic integrity requires citing every chart, statistic, and study source you include in your school presentations.'
  }
];

const CONCEPTS_INFO = [
  {
    id: 'patent',
    name: 'Patent',
    badge: '💡 Inventions',
    icon: <Lightbulb className="w-5 h-5 text-amber-700" />,
    color: 'text-amber-800',
    border: 'border-amber-400 hover:border-amber-500',
    bgColor: 'bg-amber-50',
    shortDesc: 'How Inventions & Machines Work',
    rule: '20 Years protection. Must be brand new, clever, and a real working machine!'
  },
  {
    id: 'copyright',
    name: 'Copyright',
    badge: '🎨 Creative Art',
    icon: <Feather className="w-5 h-5 text-purple-700" />,
    color: 'text-purple-800',
    border: 'border-purple-400 hover:border-purple-500',
    bgColor: 'bg-purple-50',
    shortDesc: 'Drawings, Songs, Stories & Games',
    rule: 'Automatic protection the second you create it "Credit" is not a license to sell!'
  },
  {
    id: 'trademark',
    name: 'Trademark',
    badge: '🏷️ Brand Names',
    icon: <ShieldCheck className="w-5 h-5 text-emerald-700" />,
    color: 'text-emerald-800',
    border: 'border-emerald-400 hover:border-emerald-500',
    bgColor: 'bg-emerald-50',
    shortDesc: 'Brand Names, Logos & Slogans',
    rule: 'Stops copycats from fooling shoppers. Invented made-up words get superhero power!'
  },
  {
    id: 'trade_secret',
    name: 'Trade Secret',
    badge: '🔐 Secret Recipes',
    icon: <Lock className="w-5 h-5 text-rose-700" />,
    color: 'text-rose-800',
    border: 'border-rose-400 hover:border-rose-500',
    bgColor: 'bg-rose-50',
    shortDesc: 'Secret Recipes, Formulas & Code',
    rule: 'Lasts forever as long as kept locked up with passwords and safes!'
  },
  {
    id: 'plagiarism',
    name: 'Plagiarism',
    badge: '✍️ School Honesty',
    icon: <GraduationCap className="w-5 h-5 text-sky-700" />,
    color: 'text-sky-800',
    border: 'border-sky-400 hover:border-sky-500',
    bgColor: 'bg-sky-50',
    shortDesc: 'School Honesty & Giving Credit',
    rule: 'Never steal writing 1. Explain in your words, 2. Put quotes ("..."), 3. Cite the author!'
  }
];

export const EasyConceptMatcher = ({ onComplete, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [answeredState, setAnsweredState] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const currentItem = MATCH_ITEMS[currentIndex];

  const handleChoose = (concept) => {
    if (answeredState) return;

    const isCorrect = currentItem.concept === concept;
    setAnsweredState({ chosen: concept, isCorrect });

    if (isCorrect) {
      soundFx.playSuccess();
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      if ((streak + 1) % 3 === 0) {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
      }
    } else {
      soundFx.playError();
      setStreak(0);
    }
  };

  const handleNext = () => {
    soundFx.playClick();
    setShowHint(false);
    setAnsweredState(null);

    if (currentIndex < MATCH_ITEMS.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
      soundFx.playLevelUp();
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.5 } });
    }
  };

  const handleRestart = () => {
    soundFx.playClick();
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setShowHint(false);
    setAnsweredState(null);
    setIsFinished(false);
  };

  const handleFinish = () => {
    soundFx.playClick();
    const starsEarned = score >= 8 ? 3 : score >= 5 ? 2 : 1;
    onComplete(score * 25, score * 5, starsEarned);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-in fade-in select-none">
      {/* Header Banner matching logo colors */}
      <div className="bg-gradient-to-r from-[#e8f3fb] via-[#f0f7fe] to-[#fff9ee] border-2 border-amber-400 rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <IPQuestBadge size={54} className="logo-glow shrink-0" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-950 bg-amber-400 px-2.5 py-0.5 rounded-full border border-amber-300 shadow-xs">
                  ⚡ Easy Learning Mode
                </span>
                <span className="text-xs text-amber-800 font-extrabold">• 1-Tap Power Matcher</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0e2038] font-display mt-0.5 tracking-tight">
                The 5 IP Superpowers Matcher
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Read the card below and tap which superpower protects it: Patent, Copyright, Trademark, Trade Secret, or Plagiarism
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                soundFx.playClick();
                setShowCheatSheet(prev => !prev);
              }}
              className="px-4 py-2 rounded-xl bg-white hover:bg-sky-50 text-amber-800 text-xs font-black border-2 border-amber-400/80 flex items-center gap-1.5 shadow-xs cursor-pointer transition-all"
            >
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>{showCheatSheet ? 'Hide Cheat Sheet' : '💡 Student Cheat Sheet'}</span>
            </button>
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 rounded-xl bg-white hover:bg-sky-50 text-slate-700 text-xs font-bold border-2 border-slate-300 cursor-pointer shadow-xs"
              >
                Back to Missions
              </button>
            )}
          </div>
        </div>

        {/* Progress & Stats Bar */}
        <div className="mt-4 pt-3 border-t-2 border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-amber-800 font-mono">
              Card {currentIndex + 1} of {MATCH_ITEMS.length}
            </span>
            <div className="w-36 h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 transition-all duration-300 rounded-full"
                style={{ width: `${((currentIndex + 1) / MATCH_ITEMS.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-bold text-[#0e2038] flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-sky-200 shadow-xs">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              Score: <strong className="text-amber-800">{score}</strong>/{MATCH_ITEMS.length}
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

      {/* STUDENT CHEAT SHEET (DRAWER) */}
      {showCheatSheet && (
        <div className="p-5 rounded-3xl bg-[#f0f7fc] border-2 border-amber-400 shadow-sm space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b-2 border-sky-200 pb-2">
            <h3 className="text-sm font-black text-amber-800 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              The 5 Superpowers Cheat Sheet (Read Before Answering)
            </h3>
            <button
              onClick={() => setShowCheatSheet(false)}
              className="text-xs text-slate-700 hover:text-slate-950 cursor-pointer font-bold px-2 py-1 rounded bg-white border border-slate-300"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            {CONCEPTS_INFO.map(c => (
              <div key={c.id} className={`p-3 rounded-2xl border-2 ${c.bgColor} ${c.border} space-y-1.5 shadow-xs`}>
                <div className="flex items-center gap-1.5 font-black text-xs text-[#0e2038]">
                  {c.icon}
                  <span>{c.name}</span>
                </div>
                <div className="text-[11px] font-black text-amber-800">{c.shortDesc}</div>
                <div className="text-[10px] text-slate-600 leading-tight font-medium">{c.rule}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN GAME ARENA */}
      {!isFinished ? (
        <div className="space-y-5">
          {/* Card Presentation */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-amber-400/90 shadow-sm space-y-5 text-center relative">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-yellow-300 via-amber-400 to-yellow-500 border-4 border-yellow-100 flex items-center justify-center text-4xl shadow-md">
              {currentItem.emoji}
            </div>

            <div className="space-y-1.5 max-w-xl mx-auto">
              <span className="text-[11px] uppercase font-black tracking-widest text-slate-950 bg-amber-400 px-3 py-1 rounded-full border border-amber-300 shadow-xs inline-block">
                What Protects This?
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-[#0e2038] font-display">
                {currentItem.title}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-semibold">
                {currentItem.description}
              </p>
            </div>

            {/* Hint Trigger */}
            <div className="pt-1">
              {!showHint ? (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setShowHint(true);
                  }}
                  className="px-4 py-1.5 rounded-full bg-white hover:bg-sky-50 text-amber-800 text-xs font-bold border-2 border-amber-400/70 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Need a Hint? Tap here</span>
                </button>
              ) : (
                <div className="inline-block p-3 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs font-bold animate-fade-in max-w-md shadow-xs">
                  💡 <strong>Hint:</strong> {currentItem.hint}
                </div>
              )}
            </div>

            {/* ANSWER BUTTONS (5 BIG PILLS) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3">
              {CONCEPTS_INFO.map(concept => {
                const isSelected = answeredState?.chosen === concept.id;
                const isCorrect = currentItem.concept === concept.id;

                let btnStyle = 'bg-white border-2 border-sky-200 text-[#0e2038] hover:border-amber-400 hover:scale-105 hover:bg-sky-50';
                if (answeredState) {
                  if (isCorrect) {
                    btnStyle = 'bg-emerald-500 border-2 border-emerald-300 text-white ring-2 ring-emerald-200 shadow-md scale-105 font-black';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-500 border-2 border-rose-300 text-white ring-2 ring-rose-200 font-bold';
                  } else {
                    btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-50';
                  }
                }

                return (
                  <button
                    key={concept.id}
                    disabled={answeredState !== null}
                    onClick={() => handleChoose(concept.id)}
                    className={`p-4 rounded-2xl transition-all flex flex-col items-center justify-center gap-2 cursor-pointer shadow-xs ${btnStyle}`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#f0f7fc] flex items-center justify-center text-2xl border border-sky-200">
                      {concept.icon}
                    </div>
                    <div className="font-black text-sm text-center leading-tight">
                      {concept.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold text-center line-clamp-1">
                      {concept.badge}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Feedback & Next Button */}
            {answeredState && (
              <div className="p-5 rounded-2xl bg-[#f0f7fc] border-2 border-amber-400 space-y-3 animate-fade-in text-left shadow-xs">
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
                    <h4 className={`text-base font-black ${answeredState.isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
                      {answeredState.isCorrect
                        ? '🎉 Awesome That is 100% Correct!'
                        : `Oops The correct answer was ${currentItem.concept.toUpperCase()}.`}
                    </h4>
                    <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                      {currentItem.explanation}
                    </p>
                  </div>
                </div>

                <div className="text-right pt-2">
                  <button
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 text-slate-950 font-black text-sm border-2 border-yellow-200 hover:scale-105 active:scale-95 shadow-xs inline-flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <span>{currentIndex < MATCH_ITEMS.length - 1 ? 'Next Card' : 'See Results 🏆'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* FINISHED SCREEN */
        <div className="p-8 sm:p-10 rounded-3xl bg-white border-4 border-amber-400 shadow-md text-center space-y-6 animate-fade-in">
          <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-yellow-300 via-amber-400 to-yellow-500 border-4 border-yellow-100 flex items-center justify-center text-5xl shadow-md">
            🏆
          </div>

          <div className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-950 bg-amber-400 px-3 py-1 rounded-full border border-amber-300 shadow-xs">
              Challenge Completed
            </span>
            <h3 className="text-3xl sm:text-4xl font-black text-[#0e2038] font-display">
              {score >= 8 ? '🌟 IP Superhero Champion!' : score >= 5 ? '⚡ Great Job, Hero!' : '🌱 Keep Practicing!'}
            </h3>
            <p className="text-sm text-slate-600 font-medium max-w-md mx-auto">
              You matched <strong className="text-amber-800 font-black text-lg">{score}</strong> out of{' '}
              <strong className="text-[#0e2038] font-black text-lg">{MATCH_ITEMS.length}</strong> items correctly
            </p>
          </div>

          {/* Stars */}
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
                      ? 'bg-amber-400 border-amber-300 text-slate-950 scale-110 shadow-xs'
                      : 'bg-slate-100 border-slate-200 text-slate-300'
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
              className="px-5 py-3 rounded-2xl bg-white hover:bg-sky-50 text-slate-800 border-2 border-slate-300 font-bold text-sm flex items-center gap-2 cursor-pointer shadow-xs transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
            <button
              onClick={handleFinish}
              className="px-7 py-3 rounded-2xl bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 hover:from-yellow-200 hover:to-amber-400 text-slate-950 font-black text-sm border-2 border-yellow-200 shadow-sm flex items-center gap-2 cursor-pointer transition-transform hover:scale-105 active:scale-95"
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
