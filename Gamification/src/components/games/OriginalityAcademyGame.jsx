import React, { useState } from 'react';
import { soundFx } from '../../utils/sound';
import { 
  GraduationCap, BookOpen, Quote, CheckCircle2, AlertCircle, ArrowRight, 
  Sparkles, FileText, Check, Search, Scale, ArrowLeft, Eye, HelpCircle, 
  Award, Edit3, ShieldAlert, BookMarked, RefreshCw, AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const OriginalityAcademyGame = ({ onComplete, onBack, onOpenTutorial, onSwitchTo3D, onSwitchToQuick }) => {
  const [currentStep, setCurrentStep] = useState('1_explore_school');
  const [progressCount, setProgressCount] = useState(1);

  // STEP 1: Exploration
  const [deskVisited, setDeskVisited] = useState(false);
  const [libraryVisited, setLibraryVisited] = useState(false);
  const [computerLabVisited, setComputerLabVisited] = useState(false);

  // STEP 2: Collected Documents
  const [collectedDocs, setCollectedDocs] = useState({});

  // STEP 3 & 4: Document Viewer & Comparison
  const [selectedSourceTab, setSelectedSourceTab] = useState('source_lin');
  const [activeParagraphIndex, setActiveParagraphIndex] = useState(1);

  // STEP 5: Highlighting Tool
  const [highlightActive, setHighlightActive] = useState(false);
  const [highlightedSpans, setHighlightedSpans] = useState({});

  // STEP 6: Classification
  const [classifiedExcerpts, setClassifiedExcerpts] = useState({});

  // STEP 7: Interactive Passage Rewriting
  const [selectedRewriteStyle, setSelectedRewriteStyle] = useState(null);

  // STEP 8: Citations & Quotation marks
  const [quotesInserted, setQuotesInserted] = useState(false);
  const [inTextCitationInserted, setInTextCitationInserted] = useState(false);
  const [bibliographyInserted, setBibliographyInserted] = useState(false);

  // STEP 9: Similarity Scan
  const [scanningCompleted, setScanningCompleted] = useState(false);
  const [similarityScore, setSimilarityScore] = useState(76);

  // STEP 10: Teacher Review
  const [ethicsAcknowledged, setEthicsAcknowledged] = useState(false);

  const STEPS_LIST = [
    { id: '1_explore_school', title: '1. School & Library', num: 1 },
    { id: '2_collect_docs', title: '2. Collect Sources', num: 2 },
    { id: '3_document_viewer', title: '3. Doc Viewer', num: 3 },
    { id: '4_compare_passages', title: '4. Compare Text', num: 4 },
    { id: '5_highlight_matches', title: '5. Highlight Matches', num: 5 },
    { id: '6_classify_plagiarism', title: '6. Classify Types', num: 6 },
    { id: '7_edit_passage', title: '7. Edit Original Words', num: 7 },
    { id: '8_insert_citations', title: '8. Insert Citations', num: 8 },
    { id: '9_submit_assignment', title: '9. Scanner Check', num: 9 },
    { id: '10_teacher_review', title: '10. Teacher Debrief', num: 10 }
  ];

  const advanceTo = (next, nextNum) => {
    soundFx.playSuccess();
    setCurrentStep(next);
    setProgressCount(Math.max(progressCount, nextNum));
  };

  const SOURCE_DOCS = [
    {
      id: 'doc_assignment',
      title: 'Student Essay Draft: "The Plight of Coral Reef Ecosystems"',
      author: 'Jordan Miller (Grade 10)',
      type: 'Submitted Assignment',
      icon: '📝',
      desc: 'Contains several flagged passages that triggered the school honor code alert.'
    },
    {
      id: 'doc_lin',
      title: 'Journal Article: "Thermal Stress in Scleractinia Corals"',
      author: 'Dr. Maya Lin (2021), Journal of Marine Biology',
      type: 'Published Academic Journal',
      icon: '📑',
      desc: 'Original peer-reviewed research containing specific scientific findings and verbatim phrasing.'
    },
    {
      id: 'doc_notes',
      title: 'Jordan\'s Research Notes & Web Bookmarks',
      author: 'Jordan Miller',
      type: 'Student Rough Notes',
      icon: '📒',
      desc: 'Shows where Jordan copied text into a scratchpad without recording author names or page numbers.'
    },
    {
      id: 'doc_unesco',
      title: 'Global Marine Heritage Report (2019)',
      author: 'UNESCO Oceans Commission',
      type: 'Published Policy Report',
      icon: '🏛️',
      desc: 'Statistical report on oceanic economic impact and global reef mortality.'
    }
  ];

  const EXCERPTS_TO_CLASSIFY = [
    {
      id: 'ex1',
      text: '"Thermal anomalies exceed the cellular tolerance threshold of photosynthetic symbionts, triggering widespread zooxanthellae expulsion."',
      context: 'Jordan pasted this sentence word-for-word without quotation marks or naming Dr. Lin.',
      correctType: 'unattributed_copy',
      label: 'Unattributed Copying (Direct Plagiarism)',
      explanation: 'Verbatim copy-pasting of someone else\'s sentence without quotation marks or attribution is blatant plagiarism.'
    },
    {
      id: 'ex2',
      text: '"Warm ocean conditions go past the cellular tolerance limits of microscopic plant partners, causing massive zooxanthellae release."',
      context: 'Jordan replaced 3 words with synonyms using a thesaurus, but retained the exact sentence structure without citing Dr. Lin.',
      correctType: 'poor_paraphrase',
      label: 'Poor Paraphrasing (Patchwriting)',
      explanation: 'Patchwriting (swapping a few synonyms while keeping the author\'s exact sentence anatomy without citation) is still plagiarism.'
    },
    {
      id: 'ex3',
      text: 'According to marine biologist Dr. Lin (2021), "thermal anomalies exceed the cellular tolerance threshold," causing rapid coral starvation (p. 44).',
      context: 'Jordan used quotation marks for the exact technical term and cited the author and page number.',
      correctType: 'direct_quote',
      label: 'Legitimate Direct Quotation',
      explanation: 'Properly attributed with quotation marks and parenthetical citation. Fully honest and transparent.'
    },
    {
      id: 'ex4',
      text: 'When ocean waters warm beyond safe biological limits, corals expel their vital nutrient-producing algae partners, leading to mass bleaching (Lin, 2021).',
      context: 'Jordan synthesized the concept completely in their own original voice and credited Dr. Lin as the source of the finding.',
      correctType: 'proper_synthesis',
      label: 'Proper Attribution & Original Synthesis',
      explanation: 'The highest standard of academic writing: expressing ideas in your own words while giving honest credit to the discoverer.'
    },
    {
      id: 'ex5',
      text: 'Oceans cover roughly 71% of Earth\'s surface and contain over 96% of all water on our planet.',
      context: 'A universally accepted geographical fact found in every basic science textbook.',
      correctType: 'common_knowledge',
      label: 'Common Knowledge (No Citation Needed)',
      explanation: 'Universal, widely known facts do not require citation because they are not the exclusive discovery of a single researcher.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { soundFx.playClick(); onBack(); }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Return to World Map"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20">
              <GraduationCap className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                  Originality Academy Mission
                </span>
                <span className="text-xs text-slate-400">Plagiarism Investigation & Revision</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight mt-0.5">
                The Plagiarism Investigation
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onSwitchToQuick && (
              <button
                onClick={() => { soundFx.playClick(); onSwitchToQuick(); }}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 hover:from-yellow-200 hover:to-amber-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md border border-yellow-100 cursor-pointer hover:scale-105 transition-all"
                title="Switch to Easy 3-Minute Quick Mission"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>⚡ Easy Mission</span>
              </button>
            )}

            {onSwitchTo3D && (
              <button
                onClick={() => { soundFx.playClick(); onSwitchTo3D(); }}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Explore Originality Academy in full 3D!"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>🌐 3D Facility</span>
              </button>
            )}

            {onOpenTutorial && (
              <button
                onClick={() => { soundFx.playClick(); onOpenTutorial(); }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Integrity Guide
              </button>
            )}

            {/* Clear Student Inventor Face Display */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/40 shadow-md">
              <div className="w-8 h-8 rounded-full bg-gradient-to-b from-sky-400 to-indigo-600 border border-cyan-400 overflow-hidden shadow-inner flex items-center justify-center shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <ellipse cx="50" cy="45" rx="35" ry="32" fill="#3e2723" />
                  <circle cx="20" cy="52" r="7" fill="#fbd2a4" />
                  <circle cx="80" cy="52" r="7" fill="#fbd2a4" />
                  <ellipse cx="50" cy="52" rx="27" ry="28" fill="#fbd2a4" />
                  <circle cx="50" cy="74" r="10" fill="#fbd2a4" />
                  <circle cx="34" cy="58" r="6" fill="#f87171" opacity="0.6" />
                  <circle cx="66" cy="58" r="6" fill="#f87171" opacity="0.6" />
                  <path d="M 24 38 Q 45 28 76 36 Q 60 48 50 42 Q 35 48 24 38 Z" fill="#3e2723" />
                  <rect x="25" y="24" width="50" height="6" rx="3" fill="#3e2723" />
                  <circle cx="37" cy="27" r="11" fill="#d97706" stroke="#b45309" strokeWidth="2" />
                  <circle cx="37" cy="27" r="8" fill="#38bdf8" opacity="0.85" />
                  <circle cx="63" cy="27" r="11" fill="#d97706" stroke="#b45309" strokeWidth="2" />
                  <circle cx="63" cy="27" r="8" fill="#38bdf8" opacity="0.85" />
                  <rect x="46" y="25" width="8" height="4" fill="#d97706" />
                  <path d="M 30 44 Q 38 41 44 44" stroke="#271a15" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <path d="M 56 44 Q 62 41 70 44" stroke="#271a15" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <ellipse cx="37" cy="52" rx="6" ry="6" fill="#ffffff" />
                  <circle cx="37" cy="52" r="4.2" fill="#0284c7" />
                  <circle cx="37" cy="52" r="2.2" fill="#090d16" />
                  <circle cx="38.5" cy="50.5" r="1.3" fill="#ffffff" />
                  <ellipse cx="63" cy="52" rx="6" ry="6" fill="#ffffff" />
                  <circle cx="63" cy="52" r="4.2" fill="#0284c7" />
                  <circle cx="63" cy="52" r="2.2" fill="#090d16" />
                  <circle cx="64.5" cy="50.5" r="1.3" fill="#ffffff" />
                  <path d="M 50 49 L 48.5 58 L 51.5 58 Z" fill="#e2a578" />
                  <path d="M 40 66 Q 50 75 60 66" fill="#be123c" />
                  <path d="M 42 66 Q 50 71 58 66" fill="#ffffff" />
                </svg>
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-[9px] text-cyan-400 font-bold block leading-none">INVENTOR</span>
                <span className="text-xs font-black text-white leading-tight">Student</span>
              </div>
            </div>

            {/* Right-Top Steps Indicator */}
            <div className="px-3.5 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-400/60 text-cyan-300 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/10">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Step {STEPS_LIST.find(s => s.id === currentStep)?.num || 1} of 10</span>
            </div>
          </div>
        </div>

        {/* Active Step & Next Step Progression Strip (Completed steps are hidden) */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Step:</span>
            <div className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step {STEPS_LIST.find(s => s.id === currentStep)?.num || 1}: {STEPS_LIST.find(s => s.id === currentStep)?.title.split('. ')[1]}</span>
            </div>
          </div>

          {(() => {
            const currentNum = STEPS_LIST.find(s => s.id === currentStep)?.num || 1;
            const nextStep = STEPS_LIST.find(s => s.num === currentNum + 1);
            if (!nextStep) {
              return (
                <span className="text-xs text-cyan-400 font-bold flex items-center gap-1">
                  🏆 Final Step of Originality Academy
                </span>
              );
            }
            return (
              <div className="flex items-center gap-2 text-xs text-slate-300 flex-wrap">
                <button
                  onClick={() => {
                    soundFx.playSuccess();
                    advanceTo(nextStep.id, nextStep.num);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-300 border border-cyan-400/60 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                  title="Need help? Advance to next step immediately"
                >
                  <span>💡 Need Help? Skip to Step {nextStep.num} ➔</span>
                </button>
                <div className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center gap-1.5 font-medium">
                  <span className="w-4 h-4 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-[10px] font-bold">
                    {nextStep.num}
                  </span>
                  <span>{nextStep.title.split('. ')[1]}</span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* STEP 1: EXPLORE THE CLASSROOM & LIBRARY */}
      {currentStep === '1_explore_school' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Step 1 • Campus Investigation</span>
                <h2 className="text-xl font-bold text-white mt-1">Explore the School, Library & Computer Lab</h2>
              </div>
              <span className="text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-3 py-1 rounded-full font-medium">
                Visit 3 Locations
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Teacher Ms. Clara has received an assignment submission from Jordan that triggered an automated similarity flag. You must investigate fairly, explore the research paper's origin, and help Jordan improve the work ethically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Location 1: Classroom */}
            <div 
              onClick={() => { soundFx.playClick(); setDeskVisited(true); }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                deskVisited ? 'bg-cyan-950/30 border-cyan-500/60' : 'bg-slate-800/80 border-slate-700 hover:border-cyan-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">🏫</span>
                {deskVisited ? <CheckCircle2 className="w-5 h-5 text-cyan-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
              </div>
              <h3 className="font-bold text-white text-base mt-3">Biology Classroom Desk</h3>
              <p className="text-xs text-slate-400 mt-1">
                Teacher's podium with the flagged paper. Jordan looks anxious and says: "I didn't mean to cheat I was rushing late at night and pasted notes from my browser!"
              </p>
              {deskVisited && <span className="text-[11px] text-cyan-400 font-bold block mt-3">✓ Student perspective recorded</span>}
            </div>

            {/* Location 2: Library */}
            <div 
              onClick={() => { soundFx.playClick(); setLibraryVisited(true); }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                libraryVisited ? 'bg-cyan-950/30 border-cyan-500/60' : 'bg-slate-800/80 border-slate-700 hover:border-cyan-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">📚</span>
                {libraryVisited ? <CheckCircle2 className="w-5 h-5 text-cyan-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
              </div>
              <h3 className="font-bold text-white text-base mt-3">Academy Reference Library</h3>
              <p className="text-xs text-slate-400 mt-1">
                Stacks of peer-reviewed journals. Here is Dr. Maya Lin's 2021 study on marine biology that matches Jordan's sentences.
              </p>
              {libraryVisited && <span className="text-[11px] text-cyan-400 font-bold block mt-3">✓ Primary journal identified</span>}
            </div>

            {/* Location 3: Computer Lab */}
            <div 
              onClick={() => { soundFx.playClick(); setComputerLabVisited(true); }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                computerLabVisited ? 'bg-cyan-950/30 border-cyan-500/60' : 'bg-slate-800/80 border-slate-700 hover:border-cyan-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">💻</span>
                {computerLabVisited ? <CheckCircle2 className="w-5 h-5 text-cyan-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
              </div>
              <h3 className="font-bold text-white text-base mt-3">Research Computer Terminal</h3>
              <p className="text-xs text-slate-400 mt-1">
                The terminal holds Jordan's digital draft, revision history, and the automated text-matching software report.
              </p>
              {computerLabVisited && <span className="text-[11px] text-cyan-400 font-bold block mt-3">✓ Digital terminal online</span>}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Visit all 3 campus locations to begin collecting evidence.
            </span>
            <button
              disabled={(deskVisited && libraryVisited && computerLabVisited)}
              onClick={() => advanceTo('2_collect_docs', 2)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                deskVisited && libraryVisited && computerLabVisited
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer shadow-lg shadow-cyan-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Collect Case Documents</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: COLLECT ASSIGNMENT, RESEARCH NOTES & SOURCES */}
      {currentStep === '2_collect_docs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Step 2 • Evidence Gathering</span>
                <h2 className="text-xl font-bold text-white mt-1">Collect the Assignment & Source Documents</h2>
              </div>
              <span className="text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-3 py-1 rounded-full font-medium">
                {Object.keys(collectedDocs).length} / 4 Documents Collected
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Collect all four documents into your investigation binder. We need Jordan's assignment, rough scratchpad, and the published scientific references.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SOURCE_DOCS.map((doc) => {
              const isCollected = collectedDocs[doc.id];
              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    soundFx.playClick();
                    setCollectedDocs(prev => ({ ...prev, [doc.id]: true }));
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isCollected
                      ? 'bg-cyan-950/20 border-cyan-500/60'
                      : 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{doc.icon}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isCollected 
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' 
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      {isCollected ? '✓ In Binder' : 'Click to Collect'}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm mt-2">{doc.title}</h4>
                  <span className="text-[11px] text-cyan-400 font-semibold block mt-0.5">{doc.author}</span>
                  <p className="text-xs text-slate-400 mt-1">{doc.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Collect all 4 documents to open the side-by-side document viewer.
            </span>
            <button
              disabled={Object.keys(collectedDocs).length < 4}
              onClick={() => advanceTo('3_document_viewer', 3)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                Object.keys(collectedDocs).length >= 4
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer shadow-lg shadow-cyan-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Open Document Viewer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 & 4: OPEN IN INTERACTIVE VIEWER & COMPARE PASSAGES SIDE-BY-SIDE */}
      {(currentStep === '3_document_viewer' || currentStep === '4_compare_passages') && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                  {currentStep === '3_document_viewer' ? 'Step 3 • Interactive Document Viewer' : 'Step 4 • Side-by-Side Comparison'}
                </span>
                <h2 className="text-xl font-bold text-white mt-1">Compare Assignment against Published Sources</h2>
              </div>
              <span className="text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-3 py-1 rounded-full font-medium">
                Dual Document Engine
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Inspect Jordan's submitted assignment on the left alongside Dr. Maya Lin's published research paper on the right. Notice how several passages match verbatim.
            </p>
          </div>

          {/* Side-by-Side Document Panes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Pane: Student Submission */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-white text-xs">Jordan's Assignment Draft</span>
                  </div>
                  <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full font-bold">
                    Flagged: 76% Similarity
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                    <span className="font-bold text-slate-400 text-[10px] uppercase block mb-1">Paragraph 1: Introduction</span>
                    <p className="text-slate-300 leading-relaxed">
                      "Coral reefs are among the most biologically diverse marine ecosystems on Earth. Millions of marine species depend on reefs for shelter and foraging."
                    </p>
                    <span className="text-[10px] text-slate-500 block mt-1">Status: General introductory facts.</span>
                  </div>

                  <div className="p-3 bg-rose-950/20 rounded-xl border border-rose-500/40">
                    <span className="font-bold text-rose-400 text-[10px] uppercase block mb-1">Paragraph 2: Scientific Mechanism (FLAGGED)</span>
                    <p className="text-rose-200 leading-relaxed font-mono">
                      "Thermal anomalies exceed the cellular tolerance threshold of photosynthetic symbionts, triggering widespread zooxanthellae expulsion and rapid skeletal degradation."
                    </p>
                    <span className="text-[10px] text-rose-400 font-bold block mt-2">
                      ⚠️ Zero quotation marks. Zero author attribution
                    </span>
                  </div>

                  <div className="p-3 bg-amber-950/20 rounded-xl border border-amber-500/40">
                    <span className="font-bold text-amber-400 text-[10px] uppercase block mb-1">Paragraph 3: Paraphrase Attempt (PATCHWRITING)</span>
                    <p className="text-amber-200 leading-relaxed font-mono">
                      "Warm ocean heat exceeds the cellular limits of algae helpers, causing massive zooxanthellae loss and bone breakdown."
                    </p>
                    <span className="text-[10px] text-amber-400 font-bold block mt-2">
                      ⚠️ Swapped 3 synonyms, but copied exact syntax without citation
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                Author: Jordan Miller • Course: Marine Biology 101
              </div>
            </div>

            {/* Right Pane: Published Academic Source */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white text-xs">Dr. Maya Lin (2021) • Journal Article</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                    Original Source (p. 44)
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                    <span className="font-bold text-slate-400 text-[10px] uppercase block mb-1">Journal Excerpt (Lin 2021):</span>
                    <p className="text-slate-300 leading-relaxed font-mono">
                      "Our experimental assays prove that <span className="bg-rose-500/20 text-rose-300 px-1 rounded font-bold">thermal anomalies exceed the cellular tolerance threshold of photosynthetic symbionts, triggering widespread zooxanthellae expulsion and rapid skeletal degradation</span> across Great Barrier Reef samples."
                    </p>
                    <div className="mt-3 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
                      Citation: Lin, M. (2021). <em>Thermal Stress in Scleractinia Corals</em>. Journal of Marine Biology, 45(2), 39-48.
                    </div>
                  </div>

                  <div className="p-3 bg-cyan-950/20 rounded-xl border border-cyan-500/30 text-cyan-200">
                    <span className="font-bold text-cyan-400 block mb-1">Investigation Discovery:</span>
                    Jordan copied Dr. Lin's experimental findings verbatim into Paragraph 2, and patchwrote Paragraph 3, without giving Dr. Lin credit
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                {currentStep === '3_document_viewer' ? (
                  <button
                    onClick={() => advanceTo('4_compare_passages', 4)}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Text Comparison</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => advanceTo('5_highlight_matches', 5)}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <span>Activate Highlighter Tool</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: HIGHLIGHT MATCHING TEXT */}
      {currentStep === '5_highlight_matches' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Step 5 • Interactive Forensic Highlighter</span>
                <h2 className="text-xl font-bold text-white mt-1">Highlight Verbatim Matches & Borrowed Text</h2>
              </div>
              <span className="text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-3 py-1 rounded-full font-medium">
                {Object.keys(highlightedSpans).length} / 3 Phrases Marked
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Click each flagged text span below to activate forensic similarity highlights between Jordan's submission and Dr. Lin's published article.
            </p>
          </div>

          <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-cyan-400" /> Interactive Forensic Highlighter
              </span>
              <span className="text-[11px] text-slate-400">Click spans to highlight</span>
            </div>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-sm leading-relaxed space-y-3">
              <p>
                In our marine analysis,{' '}
                <span 
                  onClick={() => {
                    soundFx.playClick();
                    setHighlightedSpans(prev => ({ ...prev, span1: !prev.span1 }));
                  }}
                  className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors font-medium ${
                    highlightedSpans.span1 
                      ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50 underline' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  "thermal anomalies exceed the cellular tolerance threshold"
                </span>{' '}
                and cause extensive stress. Furthermore,{' '}
                <span 
                  onClick={() => {
                    soundFx.playClick();
                    setHighlightedSpans(prev => ({ ...prev, span2: !prev.span2 }));
                  }}
                  className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors font-medium ${
                    highlightedSpans.span2 
                      ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50 underline' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  "triggering widespread zooxanthellae expulsion"
                </span>{' '}
                within affected colonies, which directly results in{' '}
                <span 
                  onClick={() => {
                    soundFx.playClick();
                    setHighlightedSpans(prev => ({ ...prev, span3: !prev.span3 }));
                  }}
                  className={`px-1.5 py-0.5 rounded cursor-pointer transition-colors font-medium ${
                    highlightedSpans.span3 
                      ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50 underline' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  "rapid skeletal degradation."
                </span>
              </p>
            </div>

            {Object.keys(highlightedSpans).length >= 3 && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Forensic Match Confirmed: All 3 spans are 100% identical to Dr. Lin's 2021 study on page 44!</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Highlight all 3 matches to categorize plagiarism types.
            </span>
            <button
              disabled={Object.keys(highlightedSpans).length < 3}
              onClick={() => advanceTo('6_classify_plagiarism', 6)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                Object.keys(highlightedSpans).length >= 3
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer shadow-lg shadow-cyan-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Classify Plagiarism Types</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: IDENTIFY UNATTRIBUTED COPYING, PATCHWRITING, QUOTES & ATTRIBUTION */}
      {currentStep === '6_classify_plagiarism' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Step 6 • Academic Integrity Taxonomy</span>
                <h2 className="text-xl font-bold text-white mt-1">Classify Forms of Copying vs Proper Attribution</h2>
              </div>
              <span className="text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 px-3 py-1 rounded-full font-medium">
                {Object.keys(classifiedExcerpts).length} / 5 Classified
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Evaluate each excerpt and select its true academic integrity classification:
            </p>
          </div>

          <div className="space-y-4">
            {EXCERPTS_TO_CLASSIFY.map((item, idx) => {
              const selected = classifiedExcerpts[item.id];
              const isCorrect = selected === item.correctType;
              return (
                <div key={item.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Excerpt {idx + 1}</span>
                      <p className="text-xs font-serif italic text-white mt-1">{item.text}</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">{item.context}</p>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {[
                      { type: 'unattributed_copy', label: 'Unattributed Copying' },
                      { type: 'poor_paraphrase', label: 'Patchwriting (Poor Paraphrase)' },
                      { type: 'direct_quote', label: 'Direct Quotation' },
                      { type: 'proper_synthesis', label: 'Proper Synthesis' },
                      { type: 'common_knowledge', label: 'Common Knowledge' }
                    ].map((opt) => (
                      <button
                        key={opt.type}
                        onClick={() => {
                          soundFx.playClick();
                          setClassifiedExcerpts(prev => ({ ...prev, [item.id]: opt.type }));
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          selected === opt.type
                            ? opt.type === item.correctType
                              ? 'bg-emerald-500 text-slate-950 font-bold'
                              : 'bg-rose-500 text-white font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {selected && (
                    <div className={`p-2.5 rounded-lg text-xs ${
                      isCorrect ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950/30 text-rose-300 border border-rose-500/30'
                    }`}>
                      {isCorrect ? `✓ Correct ${item.explanation}` : `Incorrect. This is ${item.label}. ${item.explanation}`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Classify all 5 excerpts to unlock the passage editor.
            </span>
            <button
              disabled={Object.keys(classifiedExcerpts).length < 5}
              onClick={() => advanceTo('7_edit_passage', 7)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                Object.keys(classifiedExcerpts).length >= 5
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer shadow-lg shadow-cyan-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Edit with Original Wording</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: EDIT SAMPLE PASSAGE USING ORIGINAL WORDING */}
      {currentStep === '7_edit_passage' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Step 7 • Authorial Voice & Synthesis</span>
            <h2 className="text-xl font-bold text-white mt-1">Rewrite the Flagged Passage in Original Voice</h2>
            <p className="text-sm text-slate-400 mt-2">
              Help Jordan replace the copied sentences with authentic, personal analytical synthesis. Avoid the "thesaurus trap" and express the core scientific concept in your own original wording.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-1">Original Flagged Text (Do Not Use):</span>
              <p className="text-xs text-rose-200 font-mono">
                "Thermal anomalies exceed the cellular tolerance threshold of photosynthetic symbionts, triggering widespread zooxanthellae expulsion and rapid skeletal degradation."
              </p>
            </div>

            <label className="text-xs font-bold text-slate-300 block">
              Choose the Best Original Synthesis for Jordan's Paper:
            </label>

            <div 
              onClick={() => {
                soundFx.playClick();
                setSelectedRewriteStyle('thesaurus');
              }}
              className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                selectedRewriteStyle === 'thesaurus'
                  ? 'border-rose-500 bg-rose-950/20 text-rose-200'
                  : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-400'
              }`}
            >
              <span className="font-bold block text-sm">Option A: Lazy Synonym Swapping (Patchwriting)</span>
              <p className="mt-1 font-serif italic">
                "Hot water spikes go over the cell resistance limits of plant companions, creating massive zooxanthellae rejection and quick bone rotting."
              </p>
              <span className="text-[11px] text-rose-400 block mt-2">
                ✗ Still plagiarism Keeps identical sentence structure and mimics the author's exact phrasing without original thought.
              </span>
            </div>

            <div 
              onClick={() => {
                soundFx.playClick();
                setSelectedRewriteStyle('original_synthesis');
              }}
              className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                selectedRewriteStyle === 'original_synthesis'
                  ? 'border-emerald-500 bg-emerald-950/30 text-emerald-200 shadow-lg shadow-emerald-500/20'
                  : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-400'
              }`}
            >
              <span className="font-bold block text-sm text-white">Option B: Authentic Original Synthesis & Conceptual Framing</span>
              <p className="mt-1 font-serif italic text-white">
                "As global sea temperatures rise, the delicate biological partnership between corals and their nutrient-providing algae breaks down, causing severe reef bleaching and starvation."
              </p>
              <span className="text-[11px] text-emerald-400 block mt-2">
                ✓ Perfect Written completely in Jordan's original voice, expressing the scientific concept clearly and authentically.
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              disabled={selectedRewriteStyle !== 'original_synthesis'}
              onClick={() => advanceTo('8_insert_citations', 8)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                selectedRewriteStyle === 'original_synthesis'
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer shadow-lg shadow-cyan-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Insert Citations & Quotes</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 8: INSERT APPROPRIATE CITATIONS AND QUOTATION MARKS */}
      {currentStep === '8_insert_citations' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Step 8 • Citation Mechanics</span>
            <h2 className="text-xl font-bold text-white mt-1">Insert Quotation Marks & Academic Citations</h2>
            <p className="text-sm text-slate-400 mt-2">
              Even with original wording, ethical scholarship requires attributing the underlying empirical discovery to the scientific researcher who discovered it. Complete the 3 citation elements:
            </p>
          </div>

          <div className="space-y-4">
            {/* Citation Element 1 */}
            <div 
              onClick={() => {
                soundFx.playClick();
                setQuotesInserted(!quotesInserted);
              }}
              className={`p-4 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                quotesInserted ? 'bg-emerald-950/30 border-emerald-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <span className="font-bold text-white text-sm block">1. Quotation Marks for Exact Key Term</span>
                <p className="text-slate-400 mt-1">
                  Enclose the specialized technical phrase <em>"thermal tolerance threshold"</em> in quotation marks.
                </p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-lg ${quotesInserted ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                {quotesInserted ? '✓ Quotes Added' : '+ Add Quotes'}
              </span>
            </div>

            {/* Citation Element 2 */}
            <div 
              onClick={() => {
                soundFx.playClick();
                setInTextCitationInserted(!inTextCitationInserted);
              }}
              className={`p-4 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                inTextCitationInserted ? 'bg-emerald-950/30 border-emerald-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <span className="font-bold text-white text-sm block">2. In-Text Parenthetical Attribution</span>
                <p className="text-slate-400 mt-1">
                  Add the author and year of publication directly after the finding: <strong>(Lin, 2021, p. 44)</strong>.
                </p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-lg ${inTextCitationInserted ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                {inTextCitationInserted ? '✓ In-Text Cited' : '+ Add In-Text Citation'}
              </span>
            </div>

            {/* Citation Element 3 */}
            <div 
              onClick={() => {
                soundFx.playClick();
                setBibliographyInserted(!bibliographyInserted);
              }}
              className={`p-4 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                bibliographyInserted ? 'bg-emerald-950/30 border-emerald-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <span className="font-bold text-white text-sm block">3. Works Cited / Bibliographic Entry</span>
                <p className="text-slate-400 mt-1">
                  Append the full formal bibliography entry to the end of Jordan's paper so readers can trace the primary source.
                </p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-lg ${bibliographyInserted ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                {bibliographyInserted ? '✓ Reference Appended' : '+ Append Reference'}
              </span>
            </div>

            {quotesInserted && inTextCitationInserted && bibliographyInserted && (
              <div className="p-4 bg-slate-950 rounded-xl border border-emerald-500/40 text-xs space-y-2">
                <span className="font-bold text-emerald-400 block">Preview of Revised Paragraph:</span>
                <p className="text-slate-200 italic font-serif">
                  "As global sea temperatures rise, the delicate biological partnership between corals and their nutrient-providing algae exceeds its <span className="text-amber-300 font-bold">"thermal tolerance threshold"</span>, causing severe reef bleaching and starvation <span className="text-emerald-400 font-bold">(Lin, 2021, p. 44)</span>."
                </p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <strong>Works Cited:</strong> Lin, M. (2021). <em>Thermal Stress in Scleractinia Corals</em>. Journal of Marine Biology, 45(2), 39-48.
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              disabled={(quotesInserted && inTextCitationInserted && bibliographyInserted)}
              onClick={() => advanceTo('9_submit_assignment', 9)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                quotesInserted && inTextCitationInserted && bibliographyInserted
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer shadow-lg shadow-cyan-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Submit & Run Similarity Scanner</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 9: SUBMIT REVISED ASSIGNMENT & RUN SCANNER */}
      {currentStep === '9_submit_assignment' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Step 9 • Academic Verification Engine</span>
            <h2 className="text-xl font-bold text-white mt-1">Submit Revised Assignment: Scanner Verification</h2>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center space-y-6">
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">Academy Anti-Plagiarism Scanner</span>
              <h3 className="text-lg font-black text-white mt-1">Submission Re-Audit in Progress</h3>
            </div>

            {/* Similarity Score Dial & Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-lg mx-auto">
              <div className="p-4 bg-slate-900 rounded-xl border border-rose-900/40">
                <span className="text-xs text-rose-400 font-bold block">Original Draft</span>
                <div className="text-4xl font-black text-rose-500 my-2">76%</div>
                <span className="text-[11px] text-slate-400">Unattributed Similarity (FLAGGED)</span>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-emerald-500/40">
                <span className="text-xs text-emerald-400 font-bold block">Revised Submission</span>
                <div className="text-4xl font-black text-emerald-400 my-2">
                  {scanningCompleted ? '4%' : '...'}
                </div>
                <span className="text-[11px] text-slate-400">
                  {scanningCompleted ? 'Legitimate Attributed Quotation' : 'Calculating...'}
                </span>
              </div>
            </div>

            {!scanningCompleted ? (
              <button
                onClick={() => {
                  soundFx.playSuccess();
                  setScanningCompleted(true);
                  setSimilarityScore(4);
                }}
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 mx-auto cursor-pointer shadow-lg shadow-cyan-500/25"
              >
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Execute Similarity Scan Engine</span>
              </button>
            ) : (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 max-w-md mx-auto">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <span className="font-bold block text-sm">ACADEMIC INTEGRITY CLEARED!</span>
                All borrowed thoughts properly cited. Original student synthesis accounts for 96% of the paper.
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                disabled={!scanningCompleted}
                onClick={() => advanceTo('10_teacher_review', 10)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                  scanningCompleted
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer shadow-lg shadow-cyan-500/25'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>Review Result with Teacher Ms. Clara</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 10: REVIEW BEFORE-AND-AFTER RESULT WITH THE TEACHER */}
      {currentStep === '10_teacher_review' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Step 10 • Honor Council Debrief</span>
            <h2 className="text-xl font-bold text-white mt-1">Review Before-and-After Result with Teacher Ms. Clara</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Teacher Card */}
            <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-5 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-4xl shadow-inner mb-3">
                👩‍🏫
              </div>
              <h3 className="font-bold text-white">Teacher Ms. Clara</h3>
              <p className="text-xs text-cyan-400 font-medium">Head of Academic Integrity</p>

              <div className="bg-slate-900/90 rounded-xl p-3.5 mt-4 text-xs text-slate-300 text-left w-full space-y-2 border border-slate-800">
                <span className="font-bold text-cyan-300 block">Teacher's Debrief:</span>
                <p>
                  "Jordan, your revision shows outstanding character Plagiarism is an ethical breach of trust. By attributing Dr. Lin, you honor her hard work while demonstrating your own command of the science."
                </p>
              </div>
            </div>

            {/* Plagiarism vs Copyright Infringement Law Card */}
            <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-cyan-400" />
                  <h4 className="font-bold text-white text-sm">Critical Distinction: Plagiarism vs Copyright Infringement</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-900 rounded-xl border border-cyan-500/30">
                    <span className="font-bold text-cyan-300 block mb-1">What is Plagiarism?</span>
                    <p className="text-slate-300">
                      An <strong>ethical violation</strong> of academic honesty. Claiming someone else's thoughts as your own. It applies even to 500-year-old works in the public domain where copyright has long expired
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-900 rounded-xl border border-indigo-500/30">
                    <span className="font-bold text-indigo-300 block mb-1">What is Copyright Infringement?</span>
                    <p className="text-slate-300">
                      A <strong>legal property violation</strong> of statutory law. Unauthorized reproduction, distribution, or commercial exploitation of a copyrighted work without permission.
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-cyan-950/20 rounded-xl border border-cyan-500/20 text-xs text-cyan-200">
                  <strong>The Golden Rule of Scholarship:</strong> Whenever you rely on someone else's discovery, quote what is verbatim, paraphrase in your own voice, and cite the source clearly
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    soundFx.playLevelUp();
                    confetti({ particleCount: 90, spread: 80 });
                    onComplete(200, 50, 3, 'plagiarism');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-cyan-500/30 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Claim Academic Honors & Return to Map</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
