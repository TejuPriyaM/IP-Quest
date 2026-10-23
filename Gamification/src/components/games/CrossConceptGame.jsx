import React, { useState } from 'react';
import { DETECTIVE_CASES } from '../../data/ipContent';
import { soundFx } from '../../utils/sound';
import { 
  Search, CheckCircle2, AlertCircle, ArrowRight, Lightbulb, 
  Feather, ShieldCheck, Lock, GraduationCap, RotateCcw, HelpCircle, Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { IPQuestBadge } from '../IPQuestBadge';

const CONCEPT_BUTTONS = [
  { concept: 'patent', label: '1. Patent (Inventions)', icon: '💡', color: 'border-amber-400 text-amber-300', bg: 'bg-[#1a346e]' },
  { concept: 'copyright', label: '2. Copyright (Art & Music)', icon: '🎨', color: 'border-purple-400 text-purple-300', bg: 'bg-[#251759]' },
  { concept: 'trademark', label: '3. Trademark (Brand Logos)', icon: '🏷️', color: 'border-emerald-400 text-emerald-300', bg: 'bg-[#0f3d32]' },
  { concept: 'trade_secret', label: '4. Trade Secret (Secret Recipes)', icon: '🤫', color: 'border-rose-400 text-rose-300', bg: 'bg-[#40132b]' },
  { concept: 'plagiarism', label: '5. Plagiarism (Essay Cheating)', icon: '📝', color: 'border-sky-400 text-sky-300', bg: 'bg-[#0e3566]' }
];

export const CrossConceptGame = ({ onComplete, onBack }) => {
  const [caseIndex, setCaseIndex] = useState(0);
  const [selectedClueIndex, setSelectedClueIndex] = useState(0);
  const [assignedConcepts, setAssignedConcepts] = useState({});
  const [feedbackMap, setFeedbackMap] = useState({});
  const [hintsActive, setHintsActive] = useState({});
  const [dossierFinished, setDossierFinished] = useState(false);

  const activeCase = DETECTIVE_CASES[caseIndex];
  const activeClue = activeCase.clues[selectedClueIndex];

  const handleAssign = (concept) => {
    soundFx.playClick();
    const isCorrect = concept === activeClue.correctConcept;

    if (isCorrect) {
      soundFx.playSuccess();
    } else {
      soundFx.playInvestigate();
    }

    const updatedAssigned = { ...assignedConcepts, [activeClue.id]: concept };
    const updatedFeedback = {
      ...feedbackMap,
      [activeClue.id]: {
        isCorrect,
        explanation: activeClue.explanation
      }
    };

    setAssignedConcepts(updatedAssigned);
    setFeedbackMap(updatedFeedback);

    // Check if all clues in case are correctly resolved
    const allResolvedCorrectly = activeCase.clues.every(
      clue => updatedAssigned[clue.id] === clue.correctConcept
    );

    if (allResolvedCorrectly) {
      setDossierFinished(true);
      confetti({ particleCount: 70, spread: 80 });
    }
  };

  const handleNextCaseOrFinish = () => {
    soundFx.playClick();
    if (caseIndex < DETECTIVE_CASES.length - 1) {
      setCaseIndex(caseIndex + 1);
      setSelectedClueIndex(0);
      setAssignedConcepts({});
      setFeedbackMap({});
      setHintsActive({});
      setDossierFinished(false);
    } else {
      onComplete(200, 60, 3);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-5 animate-in fade-in select-none">
      {/* Top Banner matching logo colors */}
      <div className="bg-gradient-to-r from-[#0d2766] via-[#1a47cb] to-[#15803d] border-4 border-amber-400 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <IPQuestBadge size={54} className="logo-glow shrink-0" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-950 bg-amber-400 px-2.5 py-0.5 rounded-full border border-yellow-200 shadow-sm">
                  🕵️ Detective Case #{caseIndex + 1}
                </span>
                <span className="text-xs text-amber-200 font-extrabold">• School Detective Mystery</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white mt-0.5 tracking-tight">
                {activeCase.title}
              </h2>
              <p className="text-xs sm:text-sm text-yellow-100 font-medium max-w-2xl mt-0.5">
                {activeCase.storyLead}
              </p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 text-xs font-black text-amber-300 bg-[#08183c] hover:bg-[#123175] border-2 border-amber-400/80 rounded-xl transition-all cursor-pointer shadow-md"
          >
            Back to Missions
          </button>
        </div>

        {/* Guided Instructions Bar */}
        <div className="mt-4 p-4 bg-[#08183c]/90 rounded-2xl border-2 border-amber-400/60 space-y-1.5 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>How to Solve Like a Detective:</span>
          </div>
          <p className="text-xs text-yellow-100 leading-relaxed font-semibold">
            Click each clue on the left, read what it describes, and tap which of the 5 IP Powers protects it
          </p>
        </div>
      </div>

      {/* Main Detective Investigation Board */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Clues List / Evidence Pins */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <span>Evidence Docket ({Object.values(feedbackMap).filter(f => f.isCorrect).length}/{activeCase.clues.length} Resolved)</span>
          </span>

          <div className="space-y-2">
            {activeCase.clues.map((clue, idx) => {
              const isSelected = idx === selectedClueIndex;
              const feedback = feedbackMap[clue.id];
              const isCorrect = feedback?.isCorrect;

              return (
                <button
                  key={clue.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedClueIndex(idx);
                  }}
                  className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-3 cursor-pointer shadow-md ${
                    isSelected
                      ? 'bg-[#183d94] border-amber-400 ring-2 ring-amber-300 text-white scale-102'
                      : 'bg-[#0f2868] border-blue-900/80 hover:border-amber-400/60 text-slate-200'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {feedback ? (
                      isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-400" />
                      )
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-amber-400/60 flex items-center justify-center text-[10px] text-amber-300 font-black">
                        {idx + 1}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-black truncate">{clue.label}</div>
                    <div className="text-xs text-yellow-200 truncate mt-0.5 font-medium">
                      {assignedConcepts[clue.id]
                        ? `Assigned: ${assignedConcepts[clue.id].toUpperCase().replace('_', ' ')}`
                        : 'Tap to Classify ➔'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Active Clue Inspection & Assignment */}
        <div className="lg:col-span-7 bg-[#0f2868] border-4 border-amber-400/90 rounded-3xl p-6 space-y-5 shadow-2xl">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-950 bg-amber-400 px-3 py-1 rounded-full border border-yellow-200 shadow-sm inline-block">
              Clue #{selectedClueIndex + 1}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-white font-display mt-2">
              {activeClue.label}
            </h3>
            <p className="text-sm text-yellow-100 font-semibold leading-relaxed">
              {activeClue.description}
            </p>
          </div>

          {/* Hint Trigger */}
          <div>
            {!hintsActive[activeClue.id] ? (
              <button
                onClick={() => {
                  soundFx.playClick();
                  setHintsActive(prev => ({ ...prev, [activeClue.id]: true }));
                }}
                className="px-3.5 py-1.5 rounded-full bg-[#08183c] hover:bg-[#123175] text-amber-300 text-xs font-black border-2 border-amber-400/60 inline-flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Need a Hint? Tap here</span>
              </button>
            ) : (
              <div className="p-3 rounded-2xl bg-amber-950/80 border-2 border-amber-400 text-yellow-200 text-xs font-bold animate-fade-in shadow-lg">
                💡 <strong>Detective Clue:</strong> {activeClue.hint}
              </div>
            )}
          </div>

          {/* Assign Buttons */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider block">
              Which Intellectual Property Power Protects This?
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {CONCEPT_BUTTONS.map(btn => {
                const isAssigned = assignedConcepts[activeClue.id] === btn.concept;
                const feedback = feedbackMap[activeClue.id];
                const isCorrect = feedback?.isCorrect && isAssigned;

                let cardStyle = `${btn.bg} border-2 ${btn.color} hover:scale-102`;
                if (isAssigned) {
                  if (isCorrect) {
                    cardStyle = 'bg-emerald-600 border-yellow-300 text-white ring-4 ring-yellow-300 shadow-xl';
                  } else {
                    cardStyle = 'bg-rose-700 border-rose-300 text-white ring-2 ring-rose-400';
                  }
                }

                return (
                  <button
                    key={btn.concept}
                    onClick={() => handleAssign(btn.concept)}
                    className={`p-3.5 rounded-2xl transition-all flex items-center gap-3 cursor-pointer shadow-md text-left ${cardStyle}`}
                  >
                    <span className="text-2xl">{btn.icon}</span>
                    <span className="font-black text-xs">{btn.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Feedback */}
          {feedbackMap[activeClue.id] && (
            <div
              className={`p-4 rounded-2xl border-2 space-y-1 animate-fade-in ${
                feedbackMap[activeClue.id].isCorrect
                  ? 'bg-[#08183c] border-emerald-400 text-emerald-200'
                  : 'bg-[#08183c] border-rose-400 text-rose-200'
              }`}
            >
              <h4 className="text-sm font-black flex items-center gap-1.5">
                {feedbackMap[activeClue.id].isCorrect ? '✅ Solved Correct Category!' : '❌ Not Quite!'}
              </h4>
              <p className="text-xs text-yellow-100 font-semibold leading-relaxed">
                {feedbackMap[activeClue.id].explanation}
              </p>
            </div>
          )}

          {/* Next Case / Finish */}
          {dossierFinished && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 text-slate-950 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl animate-fade-in">
              <span className="font-black text-sm">
                🎉 All evidence in this case correctly resolved
              </span>
              <button
                onClick={handleNextCaseOrFinish}
                className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-black text-xs shadow-md cursor-pointer transition-transform hover:scale-105"
              >
                {caseIndex < DETECTIVE_CASES.length - 1 ? 'Next Detective Case ➔' : 'Claim Detective Badge 🏆'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
