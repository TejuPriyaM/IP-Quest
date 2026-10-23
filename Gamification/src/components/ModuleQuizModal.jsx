import React, { useState } from 'react';
import { MODULE_QUIZZES } from '../data/moduleQuizzes';
import { soundFx } from '../utils/sound';
import { 
  X, CheckCircle2, XCircle, Award, Sparkles, BookOpen, 
  RotateCcw, ArrowRight, HelpCircle 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { IPQuestBadge } from './IPQuestBadge';

export const ModuleQuizModal = ({
  initialConcept,
  onClose,
  onReward,
  onJumpToRealm,
  isOpen = true,
  onCompleteQuiz
}) => {
  const [activeConcept, setActiveConcept] = useState(initialConcept);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [completedQuizzes, setCompletedQuizzes] = useState({});

  const quiz = MODULE_QUIZZES[activeConcept] || MODULE_QUIZZES.patent;
  const currentQuestion = quiz.questions[currentQIndex];

  const handleSelectOption = ( optionId) => {
    if (isAnswerSubmitted) return;
    soundFx.playClick();
    setSelectedOptionId(optionId);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOptionId || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);

    const chosenOption = currentQuestion.options.find(o => o.id === selectedOptionId);
    if (chosenOption?.isCorrect) {
      soundFx.playSuccess();
      setScore(prev => prev + 1);
    } else {
      soundFx.playError();
    }
  };

  const handleNextQuestion = () => {
    soundFx.playClick();
    if (currentQIndex < quiz.questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOptionId(null);
      setIsAnswerSubmitted(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    setIsQuizFinished(true);
    setCompletedQuizzes(prev => ({
      ...prev,
      [activeConcept]: score + (currentQuestion.options.find(o => o.id === selectedOptionId)?.isCorrect ? 1 : 0)
    }));

    const finalScore = score + (currentQuestion.options.find(o => o.id === selectedOptionId)?.isCorrect ? 1 : 0);
    const earnedXp = finalScore * 40;
    const earnedCoins = finalScore * 10;
    if (onReward) {
      onReward(earnedXp, earnedCoins, activeConcept);
    }
    if (onCompleteQuiz) {
      onCompleteQuiz(activeConcept, finalScore, quiz.questions.length, earnedXp);
    }

    if (finalScore >= 2) {
      soundFx.playSuccess();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }
  };

  const resetQuizForConcept = (concept) => {
    setActiveConcept(concept);
    setCurrentQIndex(0);
    setSelectedOptionId(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setIsQuizFinished(false);
  };

  const handleAttendNextQuiz = (nextConcept) => {
    soundFx.playClick();
    resetQuizForConcept(nextConcept);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white border-4 border-amber-400 rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Top Header & Topic Navigation */}
        <div className="p-4 sm:p-5 border-b-2 border-amber-400 bg-gradient-to-r from-[#e8f3fb] via-[#f0f7fe] to-[#fff9ee] flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <IPQuestBadge size={44} className="shadow-xs" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[#0e2038]">{quiz.title}</h2>
                <span className="text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black border border-amber-300">
                  {quiz.badge}
                </span>
              </div>
              <p className="text-xs text-slate-600 truncate max-w-sm sm:max-w-md font-medium">{quiz.subtitle}</p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-105"
            title="Close Quiz"
          >
            <X className="w-5 h-5 font-black" />
          </button>
        </div>

        {/* 5-Topic Switcher Tabs */}
        <div className="bg-[#f0f7fc] px-3 py-2 border-b-2 border-sky-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0">
          {(['patent', 'copyright', 'trademark', 'trade_secret', 'plagiarism']).map(c => {
            const isCurrent = activeConcept === c;
            const isCompleted = completedQuizzes[c] !== undefined;
            return (
              <button
                key={c}
                onClick={() => {
                  soundFx.playClick();
                  resetQuizForConcept(c);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isCurrent
                    ? 'bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 text-slate-950 shadow-xs font-black border border-yellow-200 scale-105'
                    : 'bg-white text-slate-700 hover:text-[#0e2038] hover:bg-sky-50 border border-sky-200'
                }`}
              >
                <span>
                  {c === 'patent' ? '💡 Patent' : 
                   c === 'copyright' ? '🎨 Copyright' : 
                   c === 'trademark' ? '🛡️ Trademark' : 
                   c === 'trade_secret' ? '🔒 Trade Secret' : '🎓 Plagiarism'}
                </span>
                {isCompleted && (
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isCurrent ? 'text-slate-950' : 'text-emerald-500'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {!isQuizFinished ? (
            /* Active Question State */
            <div className="space-y-4">
              {/* Question Progress Bar */}
              <div className="flex items-center justify-between text-xs font-black">
                <span className="text-amber-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Question {currentQIndex + 1} of {quiz.questions.length}
                </span>
                <span className="text-slate-600 text-[11px] font-mono">
                  Current Score: {score}/{currentQIndex + (isAnswerSubmitted && currentQuestion.options.find(o => o.id === selectedOptionId)?.isCorrect ? 1 : 0)}
                </span>
              </div>

              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 h-full transition-all duration-300 shadow-xs"
                  style={{ width: `${((currentQIndex + 1) / quiz.questions.length) * 100}%` }}
                />
              </div>

              {/* Scenario Context Card if present */}
              {currentQuestion.scenario && (
                <div className="p-3.5 rounded-2xl bg-[#f8fbff] border-2 border-amber-300 text-xs text-slate-700 flex items-start gap-2.5 shadow-xs">
                  <div className="p-1 rounded-lg bg-amber-100 text-amber-800 mt-0.5 shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-black text-amber-800 block text-[11px] uppercase tracking-wider mb-0.5">
                      Case Scenario:
                    </span>
                    <p className="leading-relaxed font-medium">{currentQuestion.scenario}</p>
                  </div>
                </div>
              )}

              {/* Question Text */}
              <div className="p-4 rounded-2xl bg-[#eef6fc] border-2 border-sky-200 shadow-xs">
                <h3 className="text-sm sm:text-base font-bold text-[#0e2038] leading-snug">
                  {currentQuestion.question}
                </h3>
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  let cardStyle = 'bg-white border-2 border-sky-200 hover:border-amber-400 text-[#0e2038] hover:bg-sky-50 shadow-xs';

                  if (isAnswerSubmitted) {
                    if (opt.isCorrect) {
                      cardStyle = 'bg-emerald-500 text-white font-black border-2 border-emerald-300 ring-2 ring-emerald-200 shadow-sm';
                    } else if (isSelected && !opt.isCorrect) {
                      cardStyle = 'bg-rose-500 text-white font-bold border-2 border-rose-300 shadow-sm';
                    } else {
                      cardStyle = 'bg-slate-50 border border-slate-200 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      disabled={isAnswerSubmitted}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`w-full p-3.5 rounded-2xl transition-all flex flex-col gap-1.5 cursor-pointer text-left text-xs sm:text-sm font-semibold shadow-xs ${cardStyle}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="leading-snug">{opt.text}</span>
                        {isAnswerSubmitted && opt.isCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-white shrink-0 mt-0.5" />
                        )}
                        {isAnswerSubmitted && isSelected && !opt.isCorrect && (
                          <XCircle className="w-5 h-5 text-white shrink-0 mt-0.5" />
                        )}
                      </div>

                      {/* Explanation Feedback */}
                      {isAnswerSubmitted && (isSelected || opt.isCorrect) && (
                        <div className={`text-xs mt-1 p-2.5 rounded-xl leading-relaxed ${
                          opt.isCorrect ? 'bg-emerald-50 text-emerald-950 border border-emerald-200 font-medium' : 'bg-rose-50 text-rose-950 border border-rose-200 font-medium'
                        }`}>
                          <span className="font-bold block text-[11px] mb-0.5">
                            {opt.isCorrect ? '✓ Correct Principle:' : '✗ Correction:'}
                          </span>
                          {opt.explanation}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons: Submit / Next */}
              <div className="flex justify-end pt-2">
                {!isAnswerSubmitted ? (
                  <button
                    disabled={!selectedOptionId}
                    onClick={handleSubmitAnswer}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 hover:from-yellow-200 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed shadow-xs border border-yellow-200 cursor-pointer hover:scale-105 transition-all"
                  >
                    Lock In Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-xs border border-emerald-200 cursor-pointer hover:scale-105 transition-all animate-in zoom-in-95"
                  >
                    <span>
                      {currentQIndex < quiz.questions.length - 1 ? 'Next Question ➔' : 'View Final Results ➔'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Quiz Complete Celebration Screen */
            <div className="text-center space-y-6 animate-in zoom-in-95 py-2">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 border-2 border-yellow-200 flex items-center justify-center text-4xl shadow-md">
                <Award className="w-10 h-10 text-slate-950" />
              </div>

              <div className="space-y-1.5">
                <span className="text-xs uppercase tracking-widest text-amber-800 font-bold bg-amber-100 px-3 py-1 rounded-full border border-amber-300 inline-block">
                  Module Completed Successfully
                </span>
                <h3 className="text-2xl font-black text-[#0e2038] font-display">
                  {quiz.title} Quiz Results
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto font-medium">
                  You demonstrated strong comprehension of the {quiz.badge} domain principles
                </p>
              </div>

              {/* Score Badges */}
              <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                <div className="p-3 rounded-2xl bg-[#f0f7fc] border-2 border-amber-300 shadow-xs">
                  <span className="text-[10px] text-amber-800 uppercase tracking-widest block font-black">Score</span>
                  <span className="text-xl font-black text-amber-700 mt-0.5 block">
                    {score}/{quiz.questions.length}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#f0f7fc] border-2 border-emerald-300 shadow-xs">
                  <span className="text-[10px] text-emerald-800 uppercase tracking-widest block font-black">XP Earned</span>
                  <span className="text-xl font-black text-emerald-700 mt-0.5 block">
                    +{score * 40} XP
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#f0f7fc] border-2 border-sky-300 shadow-xs">
                  <span className="text-[10px] text-sky-800 uppercase tracking-widest block font-black">Mastery</span>
                  <span className="text-xl font-black text-amber-500 mt-0.5 block">
                    {score === quiz.questions.length ? '⭐⭐⭐' : score >= 2 ? '⭐⭐' : '⭐'}
                  </span>
                </div>
              </div>

              {/* Continuous Learning Path: Next Quiz */}
              <div className="p-5 rounded-3xl bg-[#f0f7fc] border-2 border-sky-200 text-left shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <span className="text-xs font-black uppercase tracking-wider text-amber-800">
                      Next Quiz to Attend:
                    </span>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black border border-amber-300">
                    Continuous Learning Path
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border-2 border-sky-200 shadow-xs">
                  <div>
                    <h4 className="font-black text-[#0e2038] text-sm sm:text-base">
                      {quiz.nextQuizTitle}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium">
                      Advance seamlessly to the next IP domain quiz to test your student knowledge
                    </p>
                  </div>
                  <div className="text-2xl shrink-0">
                    {quiz.nextQuizConcept === 'patent' ? '💡' :
                     quiz.nextQuizConcept === 'copyright' ? '🎨' :
                     quiz.nextQuizConcept === 'trademark' ? '🛡️' :
                     quiz.nextQuizConcept === 'trade_secret' ? '🔒' : '🎓'}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                  <button
                    onClick={() => handleAttendNextQuiz(quiz.nextQuizConcept)}
                    className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 hover:from-yellow-200 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs border border-yellow-200 cursor-pointer hover:scale-105 transition-all"
                  >
                    <span>Attend Next Quiz Now</span>
                    <ArrowRight className="w-4 h-4 text-slate-950" />
                  </button>

                  <button
                    onClick={() => resetQuizForConcept(activeConcept)}
                    className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-white hover:bg-sky-50 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 border-2 border-slate-300 cursor-pointer shadow-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-700" />
                    <span>Retake</span>
                  </button>

                  {onJumpToRealm && (
                    <button
                      onClick={() => {
                        onJumpToRealm(activeConcept);
                        onClose();
                      }}
                      className="w-full sm:w-auto py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 border border-emerald-200 cursor-pointer hover:scale-105 transition-all shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      <span>Play 3D Realm</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t-2 border-sky-200 bg-[#f8fbff] flex items-center justify-between text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[11px] font-semibold">Interactive Module Assessment • Covers All 5 Key IP Domains</span>
          </div>
          <button
            onClick={() => {
              soundFx.playClick();
              onClose();
            }}
            className="text-xs text-amber-800 hover:text-amber-950 transition-all underline cursor-pointer font-bold"
          >
            Close Quiz
          </button>
        </div>
      </div>
    </div>
  );
};
