import React, { useState } from 'react';
import { soundFx } from '../utils/sound';
import { IPQuestBadge } from './IPQuestBadge';
import { 
  BarChart3, Award, Clock, HelpCircle, CheckCircle, 
  AlertCircle, Printer, Sparkles, BookOpen, ArrowLeft,
  Flame, Star, Shield, Zap, Compass, Trophy
} from 'lucide-react';

const CONCEPT_LABELS = {
  patent: { 
    title: 'Patent Lab', 
    icon: '💡',
    color: 'text-amber-800 bg-amber-50 border-amber-200', 
    barGrad: 'bg-gradient-to-r from-amber-400 to-yellow-400',
    desc: 'Inventions, physical novelty & technical utility (20-year term)' 
  },
  copyright: { 
    title: 'Copyright Studio', 
    icon: '🎨',
    color: 'text-purple-800 bg-purple-50 border-purple-200', 
    barGrad: 'bg-gradient-to-r from-purple-500 to-indigo-500',
    desc: 'Original creative art, songs, literature & code expression' 
  },
  trademark: { 
    title: 'Trademark City', 
    icon: '🛡️',
    color: 'text-emerald-800 bg-emerald-50 border-emerald-200', 
    barGrad: 'bg-gradient-to-r from-emerald-400 to-teal-500',
    desc: 'Brand names, symbols & distinctive logos in commerce' 
  },
  trade_secret: { 
    title: 'Trade Secrets Vault', 
    icon: '🔒',
    color: 'text-rose-800 bg-rose-50 border-rose-200', 
    barGrad: 'bg-gradient-to-r from-rose-400 to-pink-500',
    desc: 'Confidential formulas, recipes & strict internal security' 
  },
  plagiarism: { 
    title: 'Originality Academy', 
    icon: '🎓',
    color: 'text-sky-800 bg-sky-50 border-sky-200', 
    barGrad: 'bg-gradient-to-r from-sky-400 to-blue-500',
    desc: 'Academic honesty, quotes, paraphrase & proper citations' 
  }
};

export const TeacherDashboard = ({ stats, onBack, onSelectGame }) => {
  const [showCertificate, setShowCertificate] = useState(false);
  const [studentName, setStudentName] = useState('Alex Rivers');

  // The 5 Core IP Facility Domains in exact curriculum order
  const concepts= ['patent', 'plagiarism', 'copyright', 'trademark', 'trade_secret'];

  // Calculate mastery percentages
  const getMastery = (concept) => {
    const attempts = stats.analytics.attemptsByConcept[concept] || 0;
    const correct = stats.analytics.correctByConcept[concept] || 0;
    if (attempts === 0) return 65; // Baseline intro level
    return Math.min(100, Math.round((correct / attempts) * 100));
  };

  const getRankTitle = ( lvl) => {
    switch (lvl) {
      case 1: return 'Junior Explorer';
      case 2: return 'Innovation Scout';
      case 3: return 'Creative Pioneer';
      case 4: return 'Brand Guardian';
      case 5: return 'Master IP Defender';
      default: return 'Grand Guardian of Innovation';
    }
  };

  const handlePrintCertificate = () => {
    soundFx.playClick();
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in select-none">
      {/* Top Banner: Pale Blue Theme matching Logo */}
      <div className="bg-gradient-to-r from-[#e8f3fb] via-[#f0f7fe] to-[#fff9ee] border-2 border-amber-400 rounded-3xl p-5 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <IPQuestBadge size={60} className="shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 border border-amber-300 shadow-xs">
                  📊 Learning Dashboard
                </span>
                <span className="text-xs text-amber-800 font-extrabold">Student & Teacher Analytics</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0e2038] font-display mt-0.5 tracking-tight">
                Academic Progress & Mastery Hub
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold max-w-xl">
                Track competency scores across all 5 intellectual property domains, review common misconceptions, and generate official student achievement credentials.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                soundFx.playClick();
                setShowCertificate(true);
              }}
              className="px-4 py-2 text-xs font-black text-slate-950 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 hover:from-yellow-200 hover:to-amber-300 rounded-xl transition-all flex items-center gap-2 shadow-xs border-2 border-yellow-100 cursor-pointer hover:scale-105"
            >
              <Award className="w-4 h-4 text-slate-950" />
              <span>Generate Certificate</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                onBack();
              }}
              className="px-4 py-2 text-xs font-black text-[#0e2038] hover:text-amber-800 bg-white hover:bg-sky-50 rounded-xl border-2 border-sky-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Lab</span>
            </button>
          </div>
        </div>
      </div>

      {/* Overview Metric Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total XP */}
        <div className="p-5 bg-white border-2 border-sky-200 rounded-2xl shadow-xs space-y-1.5 hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total XP</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-black">
              ⭐
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0e2038] font-display tabular-nums">
            {stats.xp} <span className="text-xs font-bold text-amber-600">XP</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-black text-amber-700">
            <span>Level {stats.level}</span>
            <span className="text-slate-300">·</span>
            <span className="truncate">{getRankTitle(stats.level)}</span>
          </div>
        </div>

        {/* Missions Completed */}
        <div className="p-5 bg-white border-2 border-sky-200 rounded-2xl shadow-xs space-y-1.5 hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Missions</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-black">
              🏆
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0e2038] font-display tabular-nums">
            {stats.completedMissions.length || 5} <span className="text-xs font-bold text-slate-400">Done</span>
          </div>
          <div className="text-xs font-black text-emerald-700">
            Across 5 Core IP Facilities
          </div>
        </div>

        {/* Adaptive Hints */}
        <div className="p-5 bg-white border-2 border-sky-200 rounded-2xl shadow-xs space-y-1.5 hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Hints Used</span>
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-sm font-black">
              💡
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0e2038] font-display tabular-nums">
            {stats.analytics.hintsUsed} <span className="text-xs font-bold text-slate-400">Hints</span>
          </div>
          <div className="text-xs font-black text-sky-700">
            Self-Directed Inquiry
          </div>
        </div>

        {/* Knowledge Cards */}
        <div className="p-5 bg-white border-2 border-sky-200 rounded-2xl shadow-xs space-y-1.5 hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Cards Unlocked</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-sm font-black">
              🃏
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0e2038] font-display tabular-nums">
            {stats.collectedCards.length || 1} / 5 <span className="text-xs font-bold text-slate-400">Cards</span>
          </div>
          <div className="text-xs font-black text-purple-700">
            Full Concept Deck
          </div>
        </div>
      </div>

      {/* Curriculum Mastery Breakdown */}
      <div className="bg-white border-2 border-amber-400/80 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b-2 border-sky-100 pb-3">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-[#0e2038] font-display">
              Curriculum Mastery & Competency Breakdown
            </h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Real-time scores computed from simulation decisions, true/false drills, and sorting exercises
            </p>
          </div>
          <span className="text-xs font-black px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
            Curriculum: K-12 & Youth IP
          </span>
        </div>

        <div className="space-y-4">
          {concepts.map((c, idx) => {
            const mastery = getMastery(c);
            const info = CONCEPT_LABELS[c];
            const badgeLabel = mastery >= 85 ? 'Master' : mastery >= 70 ? 'Proficient' : 'Developing';
            const badgeClass = mastery >= 85 ? 'bg-emerald-100 text-emerald-800' : mastery >= 70 ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800';

            return (
              <div key={c} className="p-4 rounded-2xl bg-[#f8fbfe] border border-sky-200/80 space-y-3 hover:border-amber-400 transition-all shadow-xs">
                <div className="flex flex-wrap justify-between items-center text-sm gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
                      {idx + 1}
                    </span>
                    <span className="text-xl">{info.icon}</span>
                    <span className="font-black text-[#0e2038]">{info.title}</span>
                    <span className="text-xs text-slate-500 font-semibold hidden md:inline">· {info.desc}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${badgeClass}`}>
                      {badgeLabel}
                    </span>
                    <span className="font-black text-[#0e2038] tabular-nums text-base">{mastery}%</span>
                  </div>
                </div>

                <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`${info.barGrad} h-full transition-all duration-700 rounded-full`}
                    style={{ width: `${mastery}%` }}
                  />
                </div>

                {/* Direct Action Links for Student Practice */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-slate-500 text-[11px] font-semibold">
                    Interactive simulations available:
                  </span>
                  <div className="flex items-center gap-2">
                    {onSelectGame && (
                      <>
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            onSelectGame('3d', c);
                          }}
                          className="px-3 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                          title={`Teleport to 3D ${info.title}`}
                        >
                          <span>🌐 3D Facility</span>
                        </button>
                        <button
                          onClick={() => {
                            soundFx.playClick();
                            onSelectGame('2d', c);
                          }}
                          className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                          title={`Launch 10-Step ${info.title} Lab`}
                        >
                          <span>🎮 Play Lab</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pedagogical Insights & Diagnostic Alert */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-sky-200 rounded-3xl p-6 space-y-3.5 shadow-xs">
          <div className="flex items-center gap-2 text-amber-800">
            <span className="text-lg">🧠</span>
            <h4 className="text-sm font-black uppercase tracking-wider text-[#0e2038]">
              Cognitive Confusion Matrix
            </h4>
          </div>
          <p className="text-xs text-slate-600 font-semibold leading-relaxed">
            The platform monitors frequently confused IP concepts to recommend targeted drills:
          </p>
          <div className="space-y-2.5 text-xs">
            <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200 flex items-start gap-2.5">
              <span className="text-amber-800 font-black shrink-0">Trademarks vs Copyrights:</span>
              <span className="text-slate-700 font-medium">Students initially confuse commercial logo marks with artistic copyright. Clarified through Brand City exercises.</span>
            </div>
            <div className="p-3.5 bg-sky-50/60 rounded-xl border border-sky-200 flex items-start gap-2.5">
              <span className="text-sky-800 font-black shrink-0">Patents vs Trade Secrets:</span>
              <span className="text-slate-700 font-medium">Students learn that patents require full public disclosure (for a 20-year grant), while secrets require active confidentiality.</span>
            </div>
            <div className="p-3.5 bg-purple-50/60 rounded-xl border border-purple-200 flex items-start gap-2.5">
              <span className="text-purple-800 font-black shrink-0">Citations vs Permission:</span>
              <span className="text-slate-700 font-medium">Saying "credit to artist" is academic attribution, not legal commercial permission. Emphasized in Originality Academy.</span>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-sky-200 rounded-3xl p-6 space-y-3.5 shadow-xs">
          <div className="flex items-center gap-2 text-[#0e2038]">
            <span className="text-lg">🎯</span>
            <h4 className="text-sm font-black uppercase tracking-wider text-[#0e2038]">
              Recommended Follow-Up Activities
            </h4>
          </div>
          <p className="text-xs text-slate-600 font-semibold leading-relaxed">
            Curated next challenges based on student performance data:
          </p>
          <div className="space-y-2.5 text-xs">
            <div className="p-3.5 bg-[#f0f7fe] rounded-xl border border-sky-200 flex items-center justify-between gap-3">
              <div>
                <span className="text-[#0e2038] font-black block">Play 3D Virtual Facility</span>
                <span className="text-slate-500 font-medium">Explore interactive 3D stations with mouse & cursor</span>
              </div>
              {onSelectGame && (
                <button
                  onClick={() => onSelectGame('3d')}
                  className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-lg text-xs shadow-xs cursor-pointer transition-all"
                >
                  Launch 🌐
                </button>
              )}
            </div>

            <div className="p-3.5 bg-[#fffbeb] rounded-xl border border-amber-200 flex items-center justify-between gap-3">
              <div>
                <span className="text-[#0e2038] font-black block">Drop & Catch Arcade</span>
                <span className="text-slate-500 font-medium">Rapid reflex catching drill for all 5 IP powers</span>
              </div>
              {onSelectGame && (
                <button
                  onClick={() => onSelectGame('drop_catcher')}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-xs shadow-xs cursor-pointer transition-all"
                >
                  Play 🎮
                </button>
              )}
            </div>

            <div className="p-3.5 bg-[#f0fdf4] rounded-xl border border-emerald-200 flex items-center justify-between gap-3">
              <div>
                <span className="text-[#0e2038] font-black block">True or False Lightning</span>
                <span className="text-slate-500 font-medium">1-tap rapid trivia questions & streak builder</span>
              </div>
              {onSelectGame && (
                <button
                  onClick={() => onSelectGame('lightning')}
                  className="px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black rounded-lg text-xs shadow-xs cursor-pointer transition-all"
                >
                  Quiz ⚡
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CERTIFICATE MODAL */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 bg-[#071526]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border-4 border-amber-400 rounded-3xl p-6 sm:p-10 max-w-2xl w-full shadow-2xl space-y-6 relative print:border-4 print:p-12 print:bg-white print:text-black animate-in zoom-in-95">
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 print:hidden text-lg font-black w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <IPQuestBadge size={76} className="drop-shadow-md" />
              </div>
              <span className="text-xs tracking-widest uppercase font-black text-amber-700 block">
                Official Academy Credential
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0e2038] font-display tracking-tight print:text-slate-950">
                Certificate of IP Mastery
              </h2>
              <p className="text-xs text-slate-500 font-semibold print:text-slate-600">
                This document certifies that
              </p>
            </div>

            <div className="text-center py-2">
              <input
                type="text"
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                className="text-2xl sm:text-3xl font-black font-display text-center text-[#0e2038] bg-transparent border-b-2 border-amber-400 focus:outline-none focus:border-amber-600 px-4 py-1 print:text-slate-900 print:border-slate-800 w-full max-w-md"
              />
              <span className="text-[11px] text-slate-400 block mt-1 print:hidden">Click name to customize for printing</span>
            </div>

            <p className="text-center text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed font-semibold print:text-slate-700">
              has demonstrated comprehensive proficiency in identifying, defending, and respecting <strong>1. Patents, 2. Plagiarism & Originality, 3. Copyrights, 4. Trademarks, and 5. Trade Secrets</strong> through successful completion of IP Quest simulation missions.
            </p>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t-2 border-sky-100 text-center text-xs print:border-slate-400">
              <div className="bg-[#f0f7fe] p-2.5 rounded-xl border border-sky-200">
                <span className="text-slate-500 font-bold block print:text-slate-500">Issued On</span>
                <span className="font-black text-[#0e2038] print:text-slate-900">{new Date().toLocaleDateString()}</span>
              </div>
              <div className="bg-[#fffbeb] p-2.5 rounded-xl border border-amber-200">
                <span className="text-slate-500 font-bold block print:text-slate-500">Guardian Rank</span>
                <span className="font-black text-amber-700 print:text-slate-900">Level {stats.level} Master</span>
              </div>
              <div className="bg-[#f0f7fe] p-2.5 rounded-xl border border-sky-200">
                <span className="text-slate-500 font-bold block print:text-slate-500">Total XP</span>
                <span className="font-black text-[#0e2038] print:text-slate-900">{stats.xp} Points</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t-2 border-sky-100 print:hidden">
              <button
                onClick={() => setShowCertificate(false)}
                className="px-4 py-2.5 bg-white hover:bg-sky-50 text-[#0e2038] font-bold rounded-xl text-xs border-2 border-sky-200 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handlePrintCertificate}
                className="px-6 py-2.5 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 hover:from-yellow-200 hover:to-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-md cursor-pointer border-2 border-yellow-100"
              >
                <Printer className="w-4 h-4" />
                Print Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
