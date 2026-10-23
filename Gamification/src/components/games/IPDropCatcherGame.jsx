import React, { useState, useEffect, useRef } from 'react';
import { soundFx } from '../../utils/sound';
import confetti from 'canvas-confetti';
import { 
  Trophy, RotateCcw, ArrowLeft, Volume2, VolumeX, 
  Sparkles, Flame, Heart, Play, ShieldAlert, Award
} from 'lucide-react';
import { IPQuestBadge } from '../IPQuestBadge';

const ITEM_TYPES = [
  // Patents
  { icon: '💡', label: 'Invention', concept: 'patent', points: 15, color: '#f59e0b' },
  { icon: '⚙️', label: 'Machine Gear', concept: 'patent', points: 15, color: '#f59e0b' },
  { icon: '🌱', label: 'Smart Sensor', concept: 'patent', points: 20, color: '#eab308' },
  
  // Copyrights
  { icon: '🎨', label: 'Original Art', concept: 'copyright', points: 15, color: '#a855f7' },
  { icon: '🎵', label: 'Song Melody', concept: 'copyright', points: 15, color: '#8b5cf6' },
  { icon: '📖', label: 'Story Book', concept: 'copyright', points: 20, color: '#c084fc' },
  
  // Trademarks
  { icon: '🏷️', label: 'Brand Logo', concept: 'trademark', points: 15, color: '#10b981' },
  { icon: '👟', label: 'Coined Sneaker', concept: 'trademark', points: 15, color: '#059669' },
  { icon: '🥤', label: 'Brand Soda', concept: 'trademark', points: 20, color: '#34d399' },
  
  // Trade Secrets
  { icon: '🔒', label: 'Secret Recipe', concept: 'trade_secret', points: 20, color: '#f43f5e' },
  { icon: '🔐', label: 'Vault Key', concept: 'trade_secret', points: 25, color: '#e11d48' },
  
  // Academic Originality
  { icon: '🎓', label: 'Good Citation', concept: 'plagiarism', points: 20, color: '#38bdf8' },
  { icon: '📜', label: 'Original Essay', concept: 'plagiarism', points: 20, color: '#0ea5e9' },
  
  // Hazards (Counterfeit pirates, copycat rip-offs, plagiarized cut-paste)
  { icon: '🏴‍☠️', label: 'Counterfeiter!', concept: 'hazard', points: -20, color: '#ef4444' },
  { icon: '⚠️', label: 'Stolen Code!', concept: 'hazard', points: -15, color: '#dc2626' },
  { icon: '✂️', label: 'Copy-Pasted!', concept: 'hazard', points: -15, color: '#b91c1c' }
];

const TARGET_GOALS = [
  {
    concept: 'patent',
    name: 'PATENTS',
    icon: '💡',
    instruction: 'Catch INVENTIONS & SMART MACHINES (20 Yrs)',
    accent: 'from-amber-500 to-yellow-500',
    border: 'border-amber-400'
  },
  {
    concept: 'copyright',
    name: 'COPYRIGHTS',
    icon: '🎨',
    instruction: 'Catch ORIGINAL ART & MUSIC (Automatic ©)',
    accent: 'from-purple-500 to-indigo-600',
    border: 'border-purple-400'
  },
  {
    concept: 'trademark',
    name: 'TRADEMARKS',
    icon: '🛡️',
    instruction: 'Catch BRAND NAMES & LOGOS (®)',
    accent: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-400'
  },
  {
    concept: 'trade_secret',
    name: 'TRADE SECRETS',
    icon: '🔒',
    instruction: 'Catch CONFIDENTIAL RECIPES & VAULT KEYS (🔐)',
    accent: 'from-rose-500 to-pink-600',
    border: 'border-rose-400'
  },
  {
    concept: 'plagiarism',
    name: 'ORIGINAL CITATIONS',
    icon: '🎓',
    instruction: 'Catch HONEST CITATIONS & ESSAYS (No Copying)',
    accent: 'from-sky-500 to-blue-600',
    border: 'border-sky-400'
  }
];

export const IPDropCatcherGame = ({ onComplete, onBack, initialConcept }) => {
  const canvasRef = useRef(null);
  
  // Game state
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('ip_catcher_high_score') || '0', 10);
    } catch {
      return 0;
    }
  });

  const [currentTargetIdx, setCurrentTargetIdx] = useState(() => {
    if (initialConcept) {
      const idx = TARGET_GOALS.findIndex(g => g.concept === initialConcept);
      if (idx !== -1) return idx;
    }
    return 0;
  });

  // Basket position
  const basketXRef = useRef(200);
  const targetXRef = useRef(200);
  const itemsRef = useRef([]);
  const animationFrameRef = useRef(null);
  const lastSpawnRef = useRef(0);
  const lastTargetChangeRef = useRef(Date.now());
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const comboRef = useRef(0);
  const nextItemIdRef = useRef(1);

  const currentGoal = TARGET_GOALS[currentTargetIdx];

  // Start / Restart Game
  const startGame = () => {
    soundFx.playClick();
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setLives(3);
    setCombo(0);
    scoreRef.current = 0;
    livesRef.current = 3;
    comboRef.current = 0;
    itemsRef.current = [];
    lastSpawnRef.current = Date.now();
    lastTargetChangeRef.current = Date.now();

    const canvas = canvasRef.current;
    if (canvas) {
      basketXRef.current = canvas.width / 2;
      targetXRef.current = canvas.width / 2;
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const step = 40;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        targetXRef.current = Math.max(45, targetXRef.current - step);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        targetXRef.current = Math.min(canvas.width - 45, targetXRef.current + step);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main game loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let active = true;

    const updateAndDraw = () => {
      if (!active) return;
      const now = Date.now();
      const width = canvas.width;
      const height = canvas.height;

      // Rotate target mission every 18 seconds to keep student engaged with all 5 IP powers
      if (now - lastTargetChangeRef.current > 18000) {
        lastTargetChangeRef.current = now;
        setCurrentTargetIdx(prev => (prev + 1) % TARGET_GOALS.length);
        soundFx.playLevelUp();
      }

      // Smooth basket movement toward targetX
      basketXRef.current += (targetXRef.current - basketXRef.current) * 0.25;

      // Spawn falling items
      const spawnInterval = Math.max(650, 1400 - Math.floor(scoreRef.current / 40) * 100);
      if (now - lastSpawnRef.current > spawnInterval) {
        lastSpawnRef.current = now;
        
        // 45% chance to spawn an item matching current target superpower
        let chosenType = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
        if (Math.random() < 0.45) {
          const matchingItems = ITEM_TYPES.filter(t => t.concept === TARGET_GOALS[currentTargetIdx].concept);
          if (matchingItems.length > 0) {
            chosenType = matchingItems[Math.floor(Math.random() * matchingItems.length)];
          }
        }

        itemsRef.current.push({
          id: nextItemIdRef.current++,
          x: Math.random() * (width - 70) + 35,
          y: -30,
          speed: 2.2 + Math.random() * 1.8 + Math.min(2.5, scoreRef.current / 150),
          icon: chosenType.icon,
          label: chosenType.label,
          concept: chosenType.concept,
          points: chosenType.points,
          color: chosenType.color,
          size: 32
        });
      }

      // Clear canvas with cheerful pale blue sky backdrop matching logo
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#f0f6fc');
      skyGrad.addColorStop(0.5, '#e2effa');
      skyGrad.addColorStop(1, '#cee4f7');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw subtle ambient clouds & golden sparkles
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      for (let i = 0; i < 6; i++) {
        const cx = ((i * 120) + (now * 0.01)) % (width + 100) - 50;
        const cy = 40 + (i % 3) * 50;
        ctx.beginPath();
        ctx.arc(cx, cy, 24, 0, Math.PI * 2);
        ctx.arc(cx + 20, cy - 6, 28, 0, Math.PI * 2);
        ctx.arc(cx + 44, cy, 22, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw golden sparkle particles
      ctx.fillStyle = 'rgba(245, 166, 35, 0.4)';
      for (let i = 0; i < 15; i++) {
        const sx = (i * 47) % width;
        const sy = ((i * 31) + (now * 0.02)) % height;
        ctx.fillRect(sx, sy, 3, 3);
      }

      // Basket dimensions
      const basketWidth = 96;
      const basketHeight = 28;
      const basketY = height - 48;
      const basketX = basketXRef.current;

      // Update and draw items
      const remainingItems= [];

      for (let i = 0; i < itemsRef.current.length; i++) {
        const item = itemsRef.current[i];
        item.y += item.speed;

        // Collision check with catcher basket
        const inXRange = item.x >= basketX - basketWidth / 2 - 10 && item.x <= basketX + basketWidth / 2 + 10;
        const inYRange = item.y >= basketY - 18 && item.y <= basketY + basketHeight;

        if (inXRange && inYRange) {
          // Caught by basket
          if (item.concept === 'hazard') {
            soundFx.playInvestigate();
            livesRef.current -= 1;
            comboRef.current = 0;
            setLives(livesRef.current);
            setCombo(0);

            if (livesRef.current <= 0) {
              setGameOver(true);
              setIsPlaying(false);
              const finalScore = scoreRef.current;
              if (finalScore > highScore) {
                setHighScore(finalScore);
                try {
                  localStorage.setItem('ip_catcher_high_score', finalScore.toString());
                } catch {
                  // ignore
                }
              }
              const starsAwarded = finalScore >= 200 ? 3 : finalScore >= 100 ? 2 : 1;
              onComplete(finalScore, Math.floor(finalScore / 3), starsAwarded);
              return;
            }
          } else {
            const isTargetConcept = item.concept === TARGET_GOALS[currentTargetIdx].concept;
            const pointsMultiplier = isTargetConcept ? 2 : 1;
            const pts = item.points * pointsMultiplier;

            scoreRef.current += pts;
            comboRef.current += 1;
            setScore(scoreRef.current);
            setCombo(comboRef.current);

            if (isTargetConcept) {
              soundFx.playSuccess();
            } else {
              soundFx.playClick();
            }

            if (scoreRef.current > highScore) {
              setHighScore(scoreRef.current);
            }
          }
          continue;
        }

        if (item.y > height + 30) {
          if (item.concept === TARGET_GOALS[currentTargetIdx].concept) {
            comboRef.current = 0;
            setCombo(0);
          }
          continue;
        }

        remainingItems.push(item);

        // Draw falling item
        ctx.save();
        ctx.font = `${item.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Item circle background pill for strong contrast on light canvas
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = 'rgba(14, 32, 56, 0.15)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(item.x, item.y, 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = item.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.fillText(item.icon, item.x, item.y);

        // Item badge label below
        ctx.font = 'bold 10px sans-serif';
        ctx.fillStyle = '#0e2038';
        ctx.fillText(item.label, item.x, item.y + 26);
        ctx.restore();
      }

      itemsRef.current = remainingItems;

      // Draw Hero Catcher Basket (Vault Wagon matching logo colors)
      ctx.save();
      const activeGoal = TARGET_GOALS[currentTargetIdx];

      // Outer glow of basket
      ctx.shadowColor = 'rgba(245, 166, 35, 0.4)';
      ctx.shadowBlur = 12;

      // Basket body gradient (Navy & Gold matching logo)
      const basketGrad = ctx.createLinearGradient(
        basketX - basketWidth / 2, basketY,
        basketX + basketWidth / 2, basketY + basketHeight
      );
      basketGrad.addColorStop(0, '#0e2038');
      basketGrad.addColorStop(0.5, '#173b6a');
      basketGrad.addColorStop(1, '#0e2038');

      ctx.fillStyle = basketGrad;
      ctx.beginPath();
      ctx.roundRect(basketX - basketWidth / 2, basketY, basketWidth, basketHeight, 14);
      ctx.fill();

      // Golden rim border
      ctx.strokeStyle = '#f5a623';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Basket label / icon
      ctx.shadowBlur = 0;
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#ffbe2e';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${activeGoal.icon} IP VAULT`, basketX, basketY + basketHeight / 2);

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(updateAndDraw);
    };

    animationFrameRef.current = requestAnimationFrame(updateAndDraw);

    return () => {
      active = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, gameOver, currentTargetIdx, highScore, onComplete]);

  // Touch / Mouse cursor controls on canvas game field
  const handlePointerInput = ( clientX) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const localX = clientX - rect.left;
    targetXRef.current = Math.max(50, Math.min(canvas.width - 50, localX * scaleX));
  };

  const handlePointerMove = (e) => {
    handlePointerInput(e.clientX);
  };

  const handlePointerDown = (e) => {
    handlePointerInput(e.clientX);
  };

  const moveLeft = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    targetXRef.current = Math.max(50, targetXRef.current - 50);
  };

  const moveRight = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    targetXRef.current = Math.min(canvas.width - 50, targetXRef.current + 50);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-8 animate-in fade-in select-none">
      {/* Top Banner: Light Pale Blue & Gold Arcade Header */}
      <div className="bg-gradient-to-r from-[#e8f3fb] via-[#f0f7fe] to-[#fff9ee] border-2 border-amber-400 rounded-3xl p-4 sm:p-5 shadow-sm relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <IPQuestBadge size={54} className="logo-glow shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 border border-amber-300 shadow-xs">
                  🕹️ 2D Action Arcade
                </span>
                <span className="text-xs text-amber-800 font-extrabold">Super Simple & Easy to Play!</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0e2038] font-display mt-0.5 tracking-tight flex items-center gap-2">
                <span>IP Defender: Drop & Catch!</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => { soundFx.playClick(); onBack(); }}
              className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-sky-50 text-[#0e2038] hover:text-amber-700 border-2 border-sky-200 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>
        </div>

        {/* Current Active Mission Target Ribbon */}
        <div className="mt-3 pt-3 border-t-2 border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600">CURRENT TARGET:</span>
            <div className={`px-3 py-1 rounded-xl bg-gradient-to-r ${currentGoal.accent} text-white font-black text-xs shadow-xs border border-white/60 flex items-center gap-1.5 animate-pulse`}>
              <span className="text-base">{currentGoal.icon}</span>
              <span>{currentGoal.instruction}</span>
              <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded text-[10px] font-black uppercase ml-1">
                2x BONUS
              </span>
            </div>
          </div>

          {/* Score & Lives bar */}
          <div className="flex items-center gap-4 text-xs font-black">
            <div className="flex items-center gap-1 text-rose-600">
              <span className="text-slate-600">LIVES:</span>
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 ${i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-300'}`}
                />
              ))}
            </div>

            <div className="px-3 py-1 rounded-xl bg-white border-2 border-sky-200 text-amber-700 shadow-xs">
              SCORE: <span className="text-[#0e2038] text-sm font-black">{score}</span>
            </div>

            {combo > 1 && (
              <div className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 flex items-center gap-1 text-[11px] font-black animate-bounce shadow-xs">
                <Flame className="w-3 h-3" /> {combo}x COMBO
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Canvas Game Area */}
      <div className="relative rounded-3xl border-3 border-amber-400/90 shadow-sm overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          width={640}
          height={420}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onMouseDown={(e) => handlePointerInput(e.clientX)}
          onMouseMove={(e) => {
            if (e.buttons === 1) handlePointerInput(e.clientX);
          }}
          className="w-full h-[380px] sm:h-[420px] block cursor-crosshair select-none"
        />

        {/* Start Game Overlay */}
        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-yellow-300 to-amber-500 border-4 border-white flex items-center justify-center text-4xl shadow-md animate-bounce">
              🎮
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black text-[#0e2038] font-display">
                Ready to Catch & Learn?
              </h3>
              <p className="text-sm text-slate-600 max-w-md font-semibold">
                Move the IP Vault left and right Catch the target intellectual property items for <strong className="text-amber-700">2x Bonus Points</strong> and dodge the pirate rip-offs 🏴‍☠️
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-bold text-left max-w-md w-full bg-[#f0f7fc] p-3 rounded-2xl border border-sky-200">
              <div className="flex items-center gap-1.5 text-amber-800">
                <span>💡 Patents</span>
              </div>
              <div className="flex items-center gap-1.5 text-purple-800">
                <span>🎨 Copyright</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-800">
                <span>🛡️ Trademarks</span>
              </div>
              <div className="flex items-center gap-1.5 text-rose-800">
                <span>🔒 Trade Secrets</span>
              </div>
              <div className="flex items-center gap-1.5 text-sky-800">
                <span>🎓 Citations</span>
              </div>
              <div className="flex items-center gap-1.5 text-red-700">
                <span>🏴‍☠️ Avoid Pirates!</span>
              </div>
            </div>

            <button
              onClick={startGame}
              className="px-8 py-3.5 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 hover:from-yellow-200 hover:to-amber-300 text-slate-950 font-black text-base rounded-2xl transition-all shadow-md border-2 border-yellow-100 cursor-pointer hover:scale-105 flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>PLAY GAME NOW!</span>
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {gameOver && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-18 h-18 rounded-3xl bg-amber-400 text-slate-950 flex items-center justify-center text-4xl shadow-md">
              🏆
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black text-[#0e2038] font-display">
                Mission Complete
              </h3>
              <p className="text-xs text-amber-700 font-bold uppercase tracking-wider">
                Awesome Reflexes & IP Protection
              </p>
            </div>

            <div className="flex items-center gap-4 bg-[#f0f7fc] px-6 py-3 rounded-2xl border-2 border-amber-400">
              <div className="text-center">
                <div className="text-[10px] text-slate-500 font-bold">YOUR SCORE</div>
                <div className="text-2xl font-black text-amber-700">{score}</div>
              </div>
              <div className="w-px h-8 bg-slate-300" />
              <div className="text-center">
                <div className="text-[10px] text-slate-500 font-bold">BEST SCORE</div>
                <div className="text-2xl font-black text-[#0e2038]">{highScore}</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={startGame}
                className="px-6 py-3 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 text-slate-950 font-black rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer hover:scale-105"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Again</span>
              </button>
              <button
                onClick={() => { soundFx.playClick(); onBack(); }}
                className="px-5 py-3 bg-white hover:bg-sky-50 text-[#0e2038] font-black rounded-xl text-sm transition-all border-2 border-sky-200 cursor-pointer shadow-xs"
              >
                Choose Another Game
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Touch On-Screen Controls for mobile & tablet students in Light Theme */}
      <div className="flex items-center justify-between gap-3 bg-white border-2 border-sky-200 p-3 rounded-2xl shadow-xs">
        <button
          onClick={moveLeft}
          className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-xl border border-yellow-200 shadow-xs active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <span>⬅️ MOVE LEFT</span>
        </button>
        <span className="text-[11px] text-slate-600 font-bold px-2 text-center hidden sm:inline">
          Use Mouse / Touch Drag or Left / Right Arrows
        </span>
        <button
          onClick={moveRight}
          className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-xl border border-yellow-200 shadow-xs active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <span>MOVE RIGHT ➡️</span>
        </button>
      </div>
    </div>
  );
};
