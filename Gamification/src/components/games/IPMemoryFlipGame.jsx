import React, { useState, useEffect } from 'react';
import { soundFx } from '../../utils/sound';
import confetti from 'canvas-confetti';
import { 
  Trophy, RotateCcw, ArrowLeft, Star, Sparkles, 
  HelpCircle, CheckCircle2, Clock, Zap
} from 'lucide-react';
import { IPQuestBadge } from '../IPQuestBadge';

const CARDS_DATA= [
  // Pair 1: Patent
  {
    id: 'p1_concept',
    matchKey: 'patent',
    title: 'PATENT',
    subtitle: 'Protects Inventions (20 Yrs)',
    icon: '💡',
    concept: 'patent',
    type: 'concept',
    accentColor: 'border-amber-400 bg-amber-950/40 text-amber-300'
  },
  {
    id: 'p1_example',
    matchKey: 'patent',
    title: 'Smart Farm Sensor',
    subtitle: 'Physical Working Machine',
    icon: '🌱',
    concept: 'patent',
    type: 'example',
    accentColor: 'border-amber-400 bg-amber-950/40 text-amber-300'
  },

  // Pair 2: Copyright
  {
    id: 'p2_concept',
    matchKey: 'copyright',
    title: 'COPYRIGHT',
    subtitle: 'Original Art & Music (Auto ©)',
    icon: '🎨',
    concept: 'copyright',
    type: 'concept',
    accentColor: 'border-purple-400 bg-purple-950/40 text-purple-300'
  },
  {
    id: 'p2_example',
    matchKey: 'copyright',
    title: 'Sketchbook Art & Songs',
    subtitle: 'Protected from the Instant Created',
    icon: '🎵',
    concept: 'copyright',
    type: 'example',
    accentColor: 'border-purple-400 bg-purple-950/40 text-purple-300'
  },

  // Pair 3: Trademark
  {
    id: 'p3_concept',
    matchKey: 'trademark',
    title: 'TRADEMARK',
    subtitle: 'Brand Names & Logos (®)',
    icon: '🛡️',
    concept: 'trademark',
    type: 'concept',
    accentColor: 'border-emerald-400 bg-emerald-950/40 text-emerald-300'
  },
  {
    id: 'p3_example',
    matchKey: 'trademark',
    title: 'CitroVibe™ Sneakers',
    subtitle: 'Unique Coined Brand Name',
    icon: '👟',
    concept: 'trademark',
    type: 'example',
    accentColor: 'border-emerald-400 bg-emerald-950/40 text-emerald-300'
  },

  // Pair 4: Trade Secret
  {
    id: 'p4_concept',
    matchKey: 'trade_secret',
    title: 'TRADE SECRET',
    subtitle: 'Secret Formula & Code (🔐)',
    icon: '🔒',
    concept: 'trade_secret',
    type: 'concept',
    accentColor: 'border-rose-400 bg-rose-950/40 text-rose-300'
  },
  {
    id: 'p4_example',
    matchKey: 'trade_secret',
    title: 'Vault PIN & Secret Spice',
    subtitle: 'Lasts Forever with Active Security',
    icon: '🤐',
    concept: 'trade_secret',
    type: 'example',
    accentColor: 'border-rose-400 bg-rose-950/40 text-rose-300'
  },

  // Pair 5: Academic Originality / Plagiarism
  {
    id: 'p5_concept',
    matchKey: 'plagiarism',
    title: 'CITATION',
    subtitle: 'Academic Honesty in School',
    icon: '🎓',
    concept: 'plagiarism',
    type: 'concept',
    accentColor: 'border-sky-400 bg-sky-950/40 text-sky-300'
  },
  {
    id: 'p5_example',
    matchKey: 'plagiarism',
    title: 'Giving Author Credit',
    subtitle: 'Paraphrase in Your Own Voice',
    icon: '📖',
    concept: 'plagiarism',
    type: 'example',
    accentColor: 'border-sky-400 bg-sky-950/40 text-sky-300'
  },

  // Pair 6: Fair Use
  {
    id: 'p6_concept',
    matchKey: 'fair_use',
    title: 'FAIR USE',
    subtitle: 'Classroom Educational Exception',
    icon: '⚖️',
    concept: 'copyright',
    type: 'concept',
    accentColor: 'border-yellow-400 bg-yellow-950/40 text-yellow-300'
  },
  {
    id: 'p6_example',
    matchKey: 'fair_use',
    title: 'School Slide Presentation',
    subtitle: 'Showing 1 Photo for Homework Class',
    icon: '📽️',
    concept: 'copyright',
    type: 'example',
    accentColor: 'border-yellow-400 bg-yellow-950/40 text-yellow-300'
  }
];

export const IPMemoryFlipGame = ({ onComplete, onBack }) => {
  const [cards, setCards] = useState([]);
  const [flippedIds, setFlippedIds] = useState([]);
  const [matchedKeys, setMatchedKeys] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isWon, setIsWon] = useState(false);

  // Shuffle cards on mount
  useEffect(() => {
    resetGame();
  }, []);

  // Timer
  useEffect(() => {
    let interval;
    if (isActive && !isWon) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isWon]);

  const resetGame = () => {
    soundFx.playClick();
    const shuffled = [...CARDS_DATA].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setFlippedIds([]);
    setMatchedKeys([]);
    setMoves(0);
    setSeconds(0);
    setIsActive(true);
    setIsWon(false);
  };

  const handleCardClick = (card) => {
    // If already flipped or already matched, ignore
    if (flippedIds.includes(card.id) || matchedKeys.includes(card.matchKey) || flippedIds.length >= 2) {
      return;
    }

    soundFx.playClick();
    const newFlipped = [...flippedIds, card.id];
    setFlippedIds(newFlipped);

    // If 2 cards flipped, check match
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const firstCard = cards.find(c => c.id === newFlipped[0]);
      const secondCard = cards.find(c => c.id === newFlipped[1]);

      if (firstCard && secondCard && firstCard.matchKey === secondCard.matchKey) {
        // MATCH
        soundFx.playSuccess();
        const updatedMatched = [...matchedKeys, firstCard.matchKey];
        setMatchedKeys(updatedMatched);
        setFlippedIds([]);

        // Check if all pairs matched
        if (updatedMatched.length === CARDS_DATA.length / 2) {
          // VICTORY
          setIsWon(true);
          soundFx.playLevelUp();
          confetti({ particleCount: 80, spread: 80 });
          onComplete(180, 50, 3);
        }
      } else {
        // NOT A MATCH - flip back after brief pause
        soundFx.playInvestigate();
        setTimeout(() => {
          setFlippedIds([]);
        }, 900);
      }
    }
  };

  const formatTime = ( secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-8 animate-in fade-in select-none">
      {/* Top Banner: Light Pale Blue & Amber Header */}
      <div className="bg-gradient-to-r from-[#e8f3fb] via-[#f0f7fe] to-[#fff9ee] border-2 border-amber-400 rounded-3xl p-5 shadow-sm relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <IPQuestBadge size={54} className="logo-glow shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 border border-amber-300 shadow-xs">
                  🃏 Memory Match Flip
                </span>
                <span className="text-xs text-amber-800 font-extrabold">Instant Fun for All Ages</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0e2038] font-display mt-0.5 tracking-tight">
                Flip & Match the IP Superpower Pairs
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetGame}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-sky-50 text-[#0e2038] hover:text-amber-700 border-2 border-sky-200 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Shuffle</span>
            </button>
            <button
              onClick={() => { soundFx.playClick(); onBack(); }}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-sky-50 text-[#0e2038] hover:text-amber-700 border-2 border-sky-200 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>
        </div>

        {/* Status Tracker: Matches, Moves, Timer */}
        <div className="mt-4 pt-3 border-t-2 border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs font-black">
          <div className="flex items-center gap-2">
            <span className="text-slate-600">MATCHED PAIRS:</span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black border ${
                    i < matchedKeys.length
                      ? 'bg-emerald-500 text-white border-emerald-400 shadow-xs'
                      : 'bg-white text-slate-400 border-slate-200 shadow-xs'
                  }`}
                >
                  {i < matchedKeys.length ? '✓' : i + 1}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-sky-200 shadow-xs text-slate-700">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>MOVES: <strong className="text-[#0e2038]">{moves}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-sky-200 shadow-xs text-slate-700">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>TIME: <strong className="text-[#0e2038]">{formatTime(seconds)}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of 12 Cards in Light Palette */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {cards.map(card => {
          const isFlipped = flippedIds.includes(card.id) || matchedKeys.includes(card.matchKey);
          const isMatched = matchedKeys.includes(card.matchKey);

          return (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`h-36 sm:h-40 rounded-2xl border-3 transition-all duration-300 cursor-pointer select-none relative p-3 flex flex-col justify-between ${
                isFlipped
                  ? isMatched
                    ? 'border-emerald-500 bg-emerald-50 shadow-sm scale-95 opacity-90'
                    : `${card.accentColor} shadow-md scale-102`
                  : 'border-amber-400 bg-gradient-to-br from-white via-[#f0f7fe] to-[#e8f2fa] hover:border-amber-500 hover:scale-102 shadow-xs'
              }`}
            >
              {isFlipped ? (
                // Front of Card
                <div className="flex flex-col justify-between h-full text-center animate-in zoom-in-95">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/30 text-white">
                      {card.type === 'concept' ? 'SUPERPOWER' : 'EXAMPLE'}
                    </span>
                    {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </div>

                  <div className="text-3xl sm:text-4xl my-1 drop-shadow-xs">
                    {card.icon}
                  </div>

                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
                      {card.title}
                    </h4>
                    <p className="text-[10px] text-white/90 line-clamp-1 mt-0.5 font-medium">
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              ) : (
                // Back of Card (Mystery IP Badge on Pale Blue Canvas)
                <div className="flex flex-col items-center justify-center h-full text-center space-y-1.5">
                  <div className="w-12 h-12 rounded-xl bg-white border-2 border-amber-400 flex items-center justify-center text-amber-500 shadow-xs group-hover:scale-110 transition-transform">
                    <IPQuestBadge size={34} />
                  </div>
                  <span className="text-[11px] font-black text-[#0e2038] tracking-wider">
                    TAP TO FLIP
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Victory Celebration Modal in Light Theme */}
      {isWon && (
        <div className="bg-white border-3 border-amber-400 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-md animate-in zoom-in-95 max-w-lg mx-auto">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-4xl shadow-md animate-bounce">
              🏆
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl sm:text-3xl font-black text-[#0e2038] font-display">
              All 6 Pairs Matched
            </h3>
            <p className="text-sm text-amber-800 font-bold">
              Completed in {moves} moves and {formatTime(seconds)}
            </p>
          </div>

          <div className="flex justify-center gap-2 text-amber-500 text-2xl">
            ⭐⭐⭐
          </div>

          <p className="text-xs text-slate-600 max-w-md mx-auto font-medium">
            You matched every invention, creative artwork, trademark logo, and secret formula to its rightful superpower
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 text-slate-950 font-black rounded-xl text-sm transition-all shadow-xs flex items-center gap-2 cursor-pointer hover:scale-105"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Again</span>
            </button>
            <button
              onClick={() => { soundFx.playClick(); onBack(); }}
              className="px-5 py-3 bg-white hover:bg-sky-50 text-[#0e2038] font-black rounded-xl text-sm transition-all border-2 border-sky-200 cursor-pointer shadow-xs"
            >
              Back to Game Hub
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
