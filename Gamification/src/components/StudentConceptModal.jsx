import React, { useState } from 'react';
import { soundFx } from '../utils/sound';
import { 
  X, CheckCircle2, AlertCircle, Sparkles, Trophy, ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { IPQuestBadge } from './IPQuestBadge';

const CONCEPTS= [
  {
    id: 'patent',
    title: 'Patent',
    subtitle: 'How Inventions & Machines Work',
    icon: '💡',
    color: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
    border: 'border-amber-400',
    bgLight: 'from-[#fffbeb] to-[#fef3c7]',
    duration: '20 Years from filing date',
    summary: 'A patent gives the inventor the exclusive right to make, use, and sell a brand new machine, tool, gadget, or technical process.',
    howToGet: 'Must apply to the government patent office with detailed blueprints showing how the machine actually works.',
    schoolExample: 'A solar-powered backpack that charges your phone while walking, or a bicycle with automatic gear shifting.',
    goldenRule: 'Patents protect real working inventions. An unbuilt idea in your head cannot be patented until designed/built!',
    commonMistake: 'Trying to patent a brand name or logo (those are Trademarks).'
  },
  {
    id: 'copyright',
    title: 'Copyright',
    subtitle: 'Original Creative Art, Music & Writing',
    icon: '🎨',
    color: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-800 border-purple-300',
    border: 'border-purple-400',
    bgLight: 'from-[#faf5ff] to-[#f3e8ff]',
    duration: "Creator's Lifetime + 70 Years",
    summary: 'Automatic legal protection that stops others from copying your original drawings, songs, stories, poems, videos, and video games.',
    howToGet: 'Automatic The exact second you draw the artwork on paper or save the song file onto your computer, you own the copyright!',
    schoolExample: 'Your original comic book character drawing, a poem you wrote in English class, or a music track you recorded.',
    goldenRule: 'You own the exact creative expression Saying "credit to the artist" does NOT allow someone to sell your art on t-shirts!',
    commonMistake: 'Thinking tagging an artist on social media gives you permission to sell their work.'
  },
  {
    id: 'trademark',
    title: 'Trademark',
    subtitle: 'Brand Names, Logos, Slogans & Symbols',
    icon: '🛡️',
    color: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    border: 'border-emerald-400',
    bgLight: 'from-[#f0fdf4] to-[#dcfce7]',
    duration: 'Forever (Renewed every 10 years)',
    summary: 'A unique sign, logo, word, or slogan that tells shoppers who made the product so copycats cannot trick customers in stores.',
    howToGet: 'Use the name in business and register with the trademark office to get the official ® symbol.',
    schoolExample: 'The Nike swoosh, Apple logo, McDonald\'s golden arches, or our invented coined brand CitroVibe™.',
    goldenRule: 'Trademarks prevent customer confusion in the marketplace Made-up coined words get the strongest protection!',
    commonMistake: 'Confusing a trademark with a copyright (trademarks protect names & symbols, copyrights protect creative stories & art).'
  },
  {
    id: 'trade_secret',
    title: 'Trade Secret',
    subtitle: 'Confidential Formulas, Recipes & Code',
    icon: '🔒',
    color: 'text-rose-700',
    badge: 'bg-rose-100 text-rose-800 border-rose-300',
    border: 'border-rose-400',
    bgLight: 'from-[#fff1f2] to-[#ffe4e6]',
    duration: 'As long as it stays secret (forever)',
    summary: 'Private business formulas, customer algorithms, and secret methods that give an edge as long as they are kept strictly locked.',
    howToGet: 'No government filing needed Keep it hidden using passwords, NDAs, biometrics, vaults, and killswitches.',
    schoolExample: 'Coca-Cola\'s secret recipe locked in an Atlanta vault, or KFC\'s 11 secret herbs and spices.',
    goldenRule: 'If you fail to take reasonable security measures and it leaks to the public, the trade secret protection is gone forever!',
    commonMistake: 'Thinking trade secrets are filed at the government patent office (they are NEVER published).'
  },
  {
    id: 'plagiarism',
    title: 'Plagiarism',
    subtitle: 'Academic Honesty & Integrity',
    icon: '🎓',
    color: 'text-sky-700',
    badge: 'bg-sky-100 text-sky-800 border-sky-300',
    border: 'border-sky-400',
    bgLight: 'from-[#f0f9ff] to-[#e0f2fe]',
    duration: 'Academic Rule (Zero-Tolerance in Schools)',
    summary: 'Using someone else\'s words, research, or work and pretending they are your own without properly quoting and citing the creator.',
    howToGet: 'Avoid it by paraphrasing in your unique voice, putting quotes around exact phrases, and adding citations (Author, Year).',
    schoolExample: 'Copying sentences from Wikipedia for your science paper without citing the source.',
    goldenRule: 'Plagiarism is an academic honesty violation. Cite your sources, quote exact words, and write in your own genuine words!',
    commonMistake: 'Thinking that just changing 2 words in a copied paragraph makes it your original work.'
  }
];

const PRACTICE_QUESTIONS = [
  {
    id: 'p1',
    concept: 'patent',
    q: 'Farmer Dave invents a brand new automated soil moisture sensor that uses 40% less water. What protects the invention?',
    options: [
      { id: 'a', label: 'Patent', correct: true, explain: 'Correct Patents protect how new machines, tools, and processes function (20-year exclusive grant).' },
      { id: 'b', label: 'Copyright', correct: false, explain: 'Copyright protects creative art and writing, not functional machines!' },
      { id: 'c', label: 'Trademark', correct: false, explain: 'Trademarks protect brand names and logos, not how machines work.' }
    ]
  },
  {
    id: 'p2',
    concept: 'copyright',
    q: 'Mia draws a comic strip of a solar robot in her sketchbook. When does she own the copyright?',
    options: [
      { id: 'a', label: 'When she files it at City Hall', correct: false, explain: 'No filing is required for copyright!' },
      { id: 'b', label: 'The exact moment it is drawn on paper', correct: true, explain: 'Correct Copyright is automatic the instant original art is fixed in tangible medium.' },
      { id: 'c', label: 'Only if she puts © on every page', correct: false, explain: 'The © symbol is good practice, but rights exist automatically upon creation!' }
    ]
  },
  {
    id: 'p3',
    concept: 'trademark',
    q: 'Why did the founders name their soda "CitroVibe™" instead of "Lemon Soda"?',
    options: [
      { id: 'a', label: 'Because "Lemon Soda" describes the flavor and cannot be owned', correct: true, explain: 'Correct Descriptive words cannot be trademarked. Made-up coined words get maximum protection.' },
      { id: 'b', label: 'Because trademarks only apply to foods with sugar', correct: false, explain: 'Trademarks apply to any brand across any industry!' },
      { id: 'c', label: 'Because patents required a funky name', correct: false, explain: 'Patents do not govern brand names.' }
    ]
  },
  {
    id: 'p4',
    concept: 'trade_secret',
    q: 'If a scientist leaves the secret formula printed on an open lunch table, is it still protected as a trade secret?',
    options: [
      { id: 'a', label: 'Yes, because formulas are always protected', correct: false, explain: 'Without reasonable security efforts, trade secret status is legally void!' },
      { id: 'b', label: 'No You must enforce active reasonable secrecy to keep rights', correct: true, explain: 'Correct If you fail to maintain reasonable security, trade secret protection is forfeited.' },
      { id: 'c', label: 'Yes, if you register it with the police', correct: false, explain: 'Police do not maintain private trade secret filings.' }
    ]
  }
];

export const StudentConceptModal = ({
  isOpen,
  onClose,
  onSelectConceptGame
}) => {
  const [selectedConcept, setSelectedConcept] = useState('patent');
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceAnswer, setPracticeAnswer] = useState(null);
  const [practiceScore, setPracticeScore] = useState(0);

  if (!isOpen) return null;

  const activeC = CONCEPTS.find(c => c.id === selectedConcept) || CONCEPTS[0];
  const currentQ = PRACTICE_QUESTIONS[practiceIndex];

  const handleAnswer = ( optionId, isCorrect) => {
    setPracticeAnswer(optionId);
    if (isCorrect) {
      soundFx.playSuccess();
      setPracticeScore(prev => prev + 25);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    } else {
      soundFx.playError();
    }
  };

  const handleNextQ = () => {
    soundFx.playClick();
    setPracticeAnswer(null);
    setPracticeIndex((prev) => (prev + 1) % PRACTICE_QUESTIONS.length);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white border-4 border-amber-400 rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col my-auto animate-in zoom-in-95">
        
        {/* Modal Header with Light Pale Blue Theme */}
        <div className="p-5 sm:p-6 border-b-2 border-amber-400 bg-gradient-to-r from-[#e8f3fb] via-[#f0f7fe] to-[#fff9ee] flex items-center justify-between gap-4 sticky top-0 z-20 backdrop-blur-md shadow-xs">
          <div className="flex items-center gap-3">
            <IPQuestBadge size={54} className="shadow-xs" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-950 bg-amber-400 px-2.5 py-0.5 rounded-full border border-amber-300 shadow-xs">
                  Explore • Learn • Build a Safer Tomorrow
                </span>
                <span className="text-xs text-amber-800 font-extrabold">Official Handbook</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0e2038] font-display">
                The 5 Superhero Powers of Intellectual Property
              </h2>
            </div>
          </div>
          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className="p-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-all cursor-pointer shadow-xs hover:scale-105"
            title="Close Guide"
          >
            <X className="w-5 h-5 font-black" />
          </button>
        </div>

        {/* Tab Selectors for the 5 Concepts */}
        <div className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {CONCEPTS.map(c => {
              const isSelected = selectedConcept === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedConcept(c.id);
                  }}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? `${c.border} bg-amber-50 shadow-xs text-[#0e2038] scale-[1.03] ring-2 ring-amber-300/40 font-black`
                      : 'border-sky-200 bg-white hover:border-amber-400 text-slate-700'
                  }`}
                >
                  <div className="text-2xl mb-1">{c.icon}</div>
                  <div className="font-black text-xs text-[#0e2038]">{c.title}</div>
                  <div className="text-[10px] opacity-85 truncate text-slate-500">{c.subtitle.split(' ')[0]}...</div>
                </button>
              );
            })}
          </div>

          {/* Active Concept Card */}
          <div className={`p-6 rounded-3xl border-2 ${activeC.border} bg-gradient-to-br ${activeC.bgLight} space-y-5 shadow-xs`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-slate-200/80 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{activeC.icon}</span>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#0e2038] font-display">
                    {activeC.title}: {activeC.subtitle}
                  </h3>
                  <div className="text-xs text-slate-600 mt-0.5">
                    ⏱️ Protection Lasts: <strong className="text-amber-800 font-bold">{activeC.duration}</strong>
                  </div>
                </div>
              </div>
              <span className={`text-xs font-black px-3.5 py-1 rounded-full border-2 ${activeC.badge} self-start sm:self-auto shadow-xs`}>
                ⭐ {activeC.goldenRule.split('.')[0]}
              </span>
            </div>

            {/* Concept What & How */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-white border-2 border-sky-200 space-y-1.5 shadow-xs">
                <div className="font-black text-amber-800 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  <span>What Does It Protect?</span>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {activeC.summary}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border-2 border-sky-200 space-y-1.5 shadow-xs">
                <div className="font-black text-emerald-800 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>How Do You Get It?</span>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {activeC.howToGet}
                </p>
              </div>
            </div>

            {/* School Example & Common Mistake */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-amber-50/80 border-2 border-amber-200 text-slate-800 shadow-xs">
                <div className="font-black text-amber-800 mb-1 flex items-center gap-1.5">
                  <span>🎒 School Example</span>
                </div>
                <p className="text-slate-700 leading-snug">{activeC.schoolExample}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/80 border-2 border-emerald-200 text-slate-800 shadow-xs">
                <div className="font-black text-emerald-800 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>The Golden Rule</span>
                </div>
                <p className="text-slate-700 leading-snug">{activeC.goldenRule}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-50/80 border-2 border-rose-200 text-slate-800 shadow-xs">
                <div className="font-black text-rose-800 mb-1 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>Common Student Mistake</span>
                </div>
                <p className="text-slate-700 leading-snug">{activeC.commonMistake}</p>
              </div>
            </div>

            {/* Action Buttons to Play this Concept */}
            {onSelectConceptGame && (
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onClose();
                    onSelectConceptGame(activeC.id, 'quick');
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 hover:from-yellow-200 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-xs border-2 border-yellow-200 cursor-pointer flex items-center gap-2 hover:scale-105 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>⚡ Play Easy {activeC.title} Mission</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onClose();
                    onSelectConceptGame(activeC.id, '3d');
                  }}
                  className="px-4 py-2.5 bg-white hover:bg-sky-50 text-sky-800 font-bold text-xs rounded-xl border-2 border-sky-300 cursor-pointer flex items-center gap-2 hover:scale-105 transition-all shadow-xs"
                >
                  <span>🌐 3D World</span>
                </button>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    onClose();
                    onSelectConceptGame(activeC.id, '2d');
                  }}
                  className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl border-2 border-slate-300 cursor-pointer flex items-center gap-2 shadow-xs"
                >
                  <span>🎮 10-Step Lab</span>
                </button>
              </div>
            )}
          </div>

          {/* Interactive 10-Second Practice Zone */}
          <div className="p-6 rounded-3xl bg-[#f0f7fc] border-2 border-sky-200 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b-2 border-sky-200/80 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-600" />
                <h4 className="text-base font-black text-[#0e2038]">
                  10-Second Quick Quiz: Question {practiceIndex + 1} of {PRACTICE_QUESTIONS.length}
                </h4>
              </div>
              <span className="text-xs font-mono text-amber-800 font-black bg-white px-3 py-1 rounded-xl border border-sky-200 shadow-xs">
                Score: {practiceScore} points
              </span>
            </div>

            <p className="text-sm text-[#0e2038] font-bold leading-relaxed">
              {currentQ.q}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {currentQ.options.map(opt => {
                const isSelected = practiceAnswer === opt.id;
                return (
                  <button
                    key={opt.id}
                    disabled={practiceAnswer !== null}
                    onClick={() => handleAnswer(opt.id, opt.correct)}
                    className={`p-3.5 rounded-xl border-2 text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between shadow-xs ${
                      practiceAnswer === null
                        ? 'bg-white hover:bg-sky-50 border-sky-200 text-[#0e2038] hover:scale-102'
                        : opt.correct
                        ? 'bg-emerald-500 text-white border-emerald-300 ring-2 ring-emerald-200 shadow-sm'
                        : isSelected
                        ? 'bg-rose-500 text-white border-rose-300 shadow-sm'
                        : 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {practiceAnswer !== null && opt.correct && <span className="text-white font-black text-sm">✓</span>}
                  </button>
                );
              })}
            </div>

            {practiceAnswer !== null && (
              <div className="p-3.5 rounded-xl bg-white border-2 border-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in shadow-xs">
                <span className="text-slate-700 font-medium">
                  {currentQ.options.find(o => o.id === practiceAnswer)?.explain}
                </span>
                <button
                  onClick={handleNextQ}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 text-slate-950 font-black shrink-0 cursor-pointer text-xs border border-yellow-200 shadow-xs hover:scale-105 transition-all"
                >
                  Next Question ➔
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t-2 border-sky-200 bg-[#f8fbff] flex justify-end">
          <button
            onClick={() => { soundFx.playClick(); onClose(); }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 hover:from-yellow-200 hover:to-amber-300 text-slate-950 font-black text-xs cursor-pointer shadow-xs border border-yellow-200 hover:scale-105 transition-all"
          >
            Ready to Play Return to Game
          </button>
        </div>

      </div>
    </div>
  );
};
