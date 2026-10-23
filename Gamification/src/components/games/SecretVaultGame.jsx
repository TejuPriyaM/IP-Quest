import React, { useState } from 'react';
import { soundFx } from '../../utils/sound';
import { 
  Lock, KeyRound, ShieldAlert, CheckCircle2, AlertCircle, ArrowRight, 
  ShieldCheck, Terminal, RotateCcw, Shield, Eye, Clock, Scale, 
  FileText, Check, Ban, AlertTriangle, Users, HardDrive, DollarSign, 
  Award, ArrowLeft, HelpCircle, Key, Laptop, FileSpreadsheet, LockKeyhole, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SecretVaultGame = ({ onComplete, onBack, onOpenTutorial, onSwitchTo3D, onSwitchToQuick }) => {
  const [currentStep, setCurrentStep] = useState('1_explore_facility');
  const [progressCount, setProgressCount] = useState(1);

  // STEP 1: Facility Exploration
  const [facilityRoomsVisited, setFacilityRoomsVisited] = useState({});

  // STEP 2: Document Inspection
  const [inspectedDocs, setInspectedDocs] = useState({});

  // STEP 3: Classification (Public vs Trade Secret)
  const [docClassifications, setDocClassifications] = useState({});

  // STEP 4: Vulnerability Hunt
  const [foundWeaknesses, setFoundWeaknesses] = useState({});

  // STEP 5: Remediation Actions
  const [remediatedItems, setRemediatedItems] = useState({});

  // STEP 6: RBAC Configuration
  const [configuredTiers, setConfiguredTiers] = useState({});

  // STEP 7: Incident Response Actions
  const [incidentSteps, setIncidentSteps] = useState({
    revokedToken: false,
    lockedTerminal: false,
    auditLogs: false
  });

  // STEP 8: Investigation Standing Check
  const [standingAudited, setStandingAudited] = useState(false);

  // STEP 9: Mentor Dialogue Stage
  const [mentorProngsChecked, setMentorProngsChecked] = useState({});

  // STEP 10: Final Certification
  const [vaultCertified, setVaultCertified] = useState(false);

  const STEPS_LIST = [
    { id: '1_explore_facility', title: '1. Research Facility', num: 1 },
    { id: '2_inspect_documents', title: '2. Inspect Documents', num: 2 },
    { id: '3_classify_secrecy', title: '3. Secret vs Public', num: 3 },
    { id: '4_find_weaknesses', title: '4. Security Audit', num: 4 },
    { id: '5_secure_equipment', title: '5. Lock & Remediate', num: 5 },
    { id: '6_access_restrictions', title: '6. Role Access (RBAC)', num: 6 },
    { id: '7_incident_response', title: '7. Breach Response', num: 7 },
    { id: '8_investigate_exposure', title: '8. Legal Standing', num: 8 },
    { id: '9_mentor_explanation', title: '9. 3-Prong UTSA Test', num: 9 },
    { id: '10_vault_certification', title: '10. Certify Vault', num: 10 }
  ];

  const advanceTo = (next, nextNum) => {
    soundFx.playSuccess();
    setCurrentStep(next);
    setProgressCount(Math.max(progressCount, nextNum));
  };

  const FACILITY_DOCS = [
    {
      id: 'doc_brochure',
      title: 'Marketing Flyer: "EcoPolymer 2026 Commercial Brochure"',
      type: 'Promotional Literature',
      icon: '📄',
      correct: 'public',
      desc: 'Distributed openly at trade show booths. Lists general environmental claims and sales contacts.',
      reason: 'PUBLIC INFORMATION Information voluntarily published to the public can NEVER be a trade secret.'
    },
    {
      id: 'doc_patent',
      title: 'Published Patent #8812: "Extrusion Nozzle Apparatus"',
      type: 'Published Patent Disclosure',
      icon: '📜',
      correct: 'public',
      desc: 'Discloses the physical nozzle dimensions on the public patent registry for 20 years.',
      reason: 'PUBLIC DISCLOSURE By definition, a patent is a published public document. It is protected by patent law, but CANNOT be a trade secret!'
    },
    {
      id: 'doc_formula',
      title: 'Confidential Recipe: "Matrix-X Polymer Catalyst Ratio & Curing Curve"',
      type: 'Proprietary Manufacturing Know-How',
      icon: '🧪',
      correct: 'trade_secret',
      desc: 'The exact chemical molar ratio (1:4.8) and thermal pressure curve that gives the material 4x tensile strength.',
      reason: 'TRADE SECRET Secret, economically valuable, and gives a massive competitive advantage. Must be protected by reasonable efforts!'
    }
  ];

  const WEAKNESSES = [
    {
      id: 'w_cabinet',
      title: 'Unlocked Steel Filing Cabinet',
      desc: 'Contains printed chemical synthesis ratio sheets in the open hallway.',
      icon: '🗄️',
      fix: 'Lock cabinet and deposit master binder in biometric safe.'
    },
    {
      id: 'w_terminal',
      title: 'Unattended Workstation Logged In',
      desc: 'A lab terminal left open with formula documents on screen while the chemist is at lunch.',
      icon: '💻',
      fix: 'Implement 60-second screen lock and 2-factor authentication.'
    },
    {
      id: 'w_password',
      title: 'Sticky Note with Password on Monitor',
      desc: 'A sticky note reading "Admin2026!" stuck directly onto the main synthesis computer.',
      icon: '📝',
      fix: 'Remove note and enforce password manager policy.'
    },
    {
      id: 'w_visitor',
      title: 'Unescorted Visitor Without Signed NDA',
      desc: 'A visiting chemical supplier contractor walking the lab without an NDA badge.',
      icon: '👤',
      fix: 'Enforce mandatory Non-Disclosure Agreements (NDAs) & badge escorts.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-rose-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { soundFx.playClick(); onBack(); }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Return to World Map"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-rose-500/20">
              <Lock className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-rose-300 bg-rose-500/20 px-3 py-1 rounded-full border border-rose-400/50 shadow-sm flex items-center gap-1.5">
                  <span>🎮 Game 4</span>
                  <span>•</span>
                  <span>The Secret Vault Mission</span>
                </span>
                <span className="text-xs text-rose-200/80">Trade Secrets & Active Secrecy</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight mt-0.5 flex items-center gap-2">
                <span>Game 4: Protect Confidential Information</span>
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
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-400 hover:to-pink-500 text-white font-black text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Explore Secret Vault in full 3D!"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>🌐 3D Facility</span>
              </button>
            )}

            {onOpenTutorial && (
              <button
                onClick={() => { soundFx.playClick(); onOpenTutorial(); }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Trade Secret Guide
              </button>
            )}

            {/* Clear Student Inventor Face Display */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-rose-500/40 shadow-md">
              <div className="w-8 h-8 rounded-full bg-gradient-to-b from-sky-400 to-indigo-600 border border-rose-400 overflow-hidden shadow-inner flex items-center justify-center shrink-0">
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
                <span className="text-[9px] text-rose-400 font-bold block leading-none">INVENTOR</span>
                <span className="text-xs font-black text-white leading-tight">Student</span>
              </div>
            </div>

            {/* Right-Top Steps Indicator */}
            <div className="px-3.5 py-1.5 rounded-xl bg-rose-500/15 border border-rose-400/60 text-rose-300 font-black text-xs flex items-center gap-2 shadow-lg shadow-rose-500/10">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Step {STEPS_LIST.find(s => s.id === currentStep)?.num || 1} of 10</span>
            </div>
          </div>
        </div>

        {/* Active Step & Next Step Progression Strip (Completed steps are hidden) */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Step:</span>
            <div className="px-3.5 py-1.5 rounded-xl bg-rose-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-rose-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step {STEPS_LIST.find(s => s.id === currentStep)?.num || 1}: {STEPS_LIST.find(s => s.id === currentStep)?.title.split('. ')[1]}</span>
            </div>
          </div>

          {(() => {
            const currentNum = STEPS_LIST.find(s => s.id === currentStep)?.num || 1;
            const nextStep = STEPS_LIST.find(s => s.num === currentNum + 1);
            if (!nextStep) {
              return (
                <span className="text-xs text-rose-400 font-bold flex items-center gap-1">
                  🏆 Final Step of Secret Vault
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
                  className="px-3 py-1.5 rounded-xl bg-rose-400/20 hover:bg-rose-400/30 text-rose-300 border border-rose-400/60 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
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

      {/* STEP 1: EXPLORE THE FACILITY */}
      {currentStep === '1_explore_facility' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Step 1 • Facility Exploration</span>
                <h2 className="text-xl font-bold text-white mt-1">Explore the Polymer R&D Research Facility</h2>
              </div>
              <span className="text-xs bg-rose-500/10 text-rose-300 border border-rose-500/20 px-3 py-1 rounded-full font-medium">
                4 Facility Zones
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              BioMatrix Labs has developed a valuable confidential formula for <em>"Matrix-X"</em>, a revolutionary biodegradable polymer. Industrial competitors are desperate to copy it. You must audit the facility and protect the company's know-how.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 'reception', name: 'Public Reception Lobby', icon: '🏢', desc: 'Open visitor area with marketing brochures and guest check-in.' },
              { id: 'lab', name: 'Synthesis Chemical Lab', icon: '🧪', desc: 'Where the secret catalyst formula is mixed and tested.' },
              { id: 'servers', name: 'Server Core & Terminal Room', icon: '🖥️', desc: 'Holds database drives and proprietary process algorithms.' },
              { id: 'vault', name: 'Secure Document Vault', icon: '🔒', desc: 'Reinforced safe intended for master formula notebooks.' }
            ].map((room) => {
              const isVisited = facilityRoomsVisited[room.id];
              return (
                <div
                  key={room.id}
                  onClick={() => {
                    soundFx.playClick();
                    setFacilityRoomsVisited(prev => ({ ...prev, [room.id]: true }));
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isVisited ? 'bg-rose-950/20 border-rose-500/60' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{room.icon}</span>
                    {isVisited ? <CheckCircle2 className="w-4 h-4 text-rose-400" /> : <Eye className="w-4 h-4 text-slate-500" />}
                  </div>
                  <h4 className="font-bold text-white text-sm mt-2">{room.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{room.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Visit all 4 facility rooms to begin document inspection.
            </span>
            <button
              disabled={Object.keys(facilityRoomsVisited).length < 4}
              onClick={() => advanceTo('2_inspect_documents', 2)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                Object.keys(facilityRoomsVisited).length >= 4
                  ? 'bg-rose-500 hover:bg-rose-400 text-slate-950 cursor-pointer shadow-lg shadow-rose-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Inspect Facility Documents</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: INSPECT A PRODUCTION RECIPE, PUBLIC BROCHURE & PATENT DOCUMENT */}
      {currentStep === '2_inspect_documents' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Step 2 • Document Examination</span>
                <h2 className="text-xl font-bold text-white mt-1">Inspect Recipe, Public Brochure & Patent Document</h2>
              </div>
              <span className="text-xs bg-rose-500/10 text-rose-300 border border-rose-500/20 px-3 py-1 rounded-full font-medium">
                {Object.keys(inspectedDocs).length} / 3 Inspected
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Inspect each of the three documents found on the facility desks. Learn to distinguish what is genuinely confidential from what is already public:
            </p>
          </div>

          <div className="space-y-4">
            {FACILITY_DOCS.map((doc) => {
              const isInspected = inspectedDocs[doc.id];
              return (
                <div
                  key={doc.id}
                  onClick={() => {
                    soundFx.playClick();
                    setInspectedDocs(prev => ({ ...prev, [doc.id]: true }));
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isInspected ? 'bg-slate-950 border-rose-500/60' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{doc.icon}</span>
                      <div>
                        <h4 className="font-bold text-white text-sm">{doc.title}</h4>
                        <span className="text-[11px] text-slate-400 font-semibold block">{doc.type}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      isInspected ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isInspected ? '✓ Inspected' : 'Click to Inspect'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-2">{doc.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Inspect all 3 documents to classify their secrecy status.
            </span>
            <button
              disabled={Object.keys(inspectedDocs).length < 3}
              onClick={() => advanceTo('3_classify_secrecy', 3)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                Object.keys(inspectedDocs).length >= 3
                  ? 'bg-rose-500 hover:bg-rose-400 text-slate-950 cursor-pointer shadow-lg shadow-rose-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Classify Public vs Trade Secret</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DETERMINE PUBLIC INFO VS TRADE SECRET */}
      {currentStep === '3_classify_secrecy' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Step 3 • Secrecy Legal Boundary</span>
                <h2 className="text-xl font-bold text-white mt-1">Determine Secrecy Status of Each Document</h2>
              </div>
              <span className="text-xs bg-rose-500/10 text-rose-300 border border-rose-500/20 px-3 py-1 rounded-full font-medium">
                {Object.keys(docClassifications).length} / 3 Classified
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Under trade secret law, information must NOT be generally known. A published brochure or a published patent can NEVER be a trade secret. Select the correct classification:
            </p>
          </div>

          <div className="space-y-4">
            {FACILITY_DOCS.map((doc) => {
              const selected = docClassifications[doc.id];
              const isCorrect = selected === doc.correct;
              return (
                <div key={doc.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{doc.icon}</span>
                    <h4 className="font-bold text-white text-sm">{doc.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400">{doc.desc}</p>

                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setDocClassifications(prev => ({ ...prev, [doc.id]: 'public' }));
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selected === 'public'
                          ? doc.correct === 'public'
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-rose-500 text-white font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Public Information (Not a Secret)
                    </button>

                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setDocClassifications(prev => ({ ...prev, [doc.id]: 'trade_secret' }));
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selected === 'trade_secret'
                          ? doc.correct === 'trade_secret'
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-rose-500 text-white font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Confidential Trade Secret
                    </button>
                  </div>

                  {selected && (
                    <div className={`p-2.5 rounded-lg text-xs mt-2 ${
                      isCorrect ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950/30 text-rose-300 border border-rose-500/30'
                    }`}>
                      {isCorrect ? `✓ Correct ${doc.reason}` : `Incorrect. ${doc.reason}`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Classify all 3 documents correctly to audit facility security vulnerabilities.
            </span>
            <button
              disabled={Object.keys(docClassifications).length < 3 || Object.entries(docClassifications).some(([k, v]) => FACILITY_DOCS.find(d => d.id === k)?.correct !== v)}
              onClick={() => advanceTo('4_find_weaknesses', 4)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                Object.keys(docClassifications).length === 3 && Object.entries(docClassifications).every(([k, v]) => FACILITY_DOCS.find(d => d.id === k)?.correct === v)
                  ? 'bg-rose-500 hover:bg-rose-400 text-slate-950 cursor-pointer shadow-lg shadow-rose-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Audit Security Weaknesses</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: FIND SECURITY WEAKNESSES */}
      {currentStep === '4_find_weaknesses' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Step 4 • Facility Security Vulnerability Audit</span>
                <h2 className="text-xl font-bold text-white mt-1">Identify 4 Security Weaknesses in the Facility</h2>
              </div>
              <span className="text-xs bg-rose-500/10 text-rose-300 border border-rose-500/20 px-3 py-1 rounded-full font-medium">
                {Object.keys(foundWeaknesses).length} / 4 Found
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Trade secret protection is only valid if the owner takes <strong>reasonable measures under the circumstances</strong> to maintain secrecy. Find the 4 glaring security holes:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {WEAKNESSES.map((weakness) => {
              const isFound = foundWeaknesses[weakness.id];
              return (
                <div
                  key={weakness.id}
                  onClick={() => {
                    soundFx.playClick();
                    setFoundWeaknesses(prev => ({ ...prev, [weakness.id]: true }));
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isFound ? 'bg-rose-950/30 border-rose-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{weakness.icon}</span>
                    {isFound ? (
                      <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold">
                        ⚠️ Vulnerability Flagged
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                        Click to Inspect Area
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-white text-sm mt-2">{weakness.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{weakness.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Flag all 4 security weaknesses to apply countermeasures.
            </span>
            <button
              disabled={Object.keys(foundWeaknesses).length < 4}
              onClick={() => advanceTo('5_secure_equipment', 5)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                Object.keys(foundWeaknesses).length >= 4
                  ? 'bg-rose-500 hover:bg-rose-400 text-slate-950 cursor-pointer shadow-lg shadow-rose-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Lock & Remediate Equipment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: SECURE DOCUMENTS AND EQUIPMENT */}
      {currentStep === '5_secure_equipment' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Step 5 • Remediation Countermeasures</span>
                <h2 className="text-xl font-bold text-white mt-1">Execute "Reasonable Efforts" Security Protocols</h2>
              </div>
              <span className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1 rounded-full font-medium">
                {Object.keys(remediatedItems).length} / 4 Countermeasures Implemented
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Apply security countermeasures to fix all four vulnerabilities. These physical and procedural layers establish legal compliance with the "Reasonable Efforts" doctrine:
            </p>
          </div>

          <div className="space-y-3">
            {WEAKNESSES.map((item) => {
              const isFixed = remediatedItems[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    soundFx.playClick();
                    setRemediatedItems(prev => ({ ...prev, [item.id]: true }));
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isFixed ? 'bg-emerald-950/20 border-emerald-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{isFixed ? '🔒' : item.icon}</span>
                    <div>
                      <h4 className="font-bold text-white text-sm">{item.fix}</h4>
                      <span className="text-xs text-slate-400">Target: {item.title}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-lg ${
                    isFixed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isFixed ? '✓ Enforced' : 'Click to Enforce'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Apply all 4 countermeasures to configure Role-Based Access Control (RBAC).
            </span>
            <button
              disabled={Object.keys(remediatedItems).length < 4}
              onClick={() => advanceTo('6_access_restrictions', 6)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                Object.keys(remediatedItems).length >= 4
                  ? 'bg-rose-500 hover:bg-rose-400 text-slate-950 cursor-pointer shadow-lg shadow-rose-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Configure Access Restrictions</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: CONFIGURE APPROPRIATE ACCESS RESTRICTIONS (RBAC) */}
      {currentStep === '6_access_restrictions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Step 6 • Role-Based Access Control</span>
            <h2 className="text-xl font-bold text-white mt-1">Configure Information Access Restrictions</h2>
            <p className="text-sm text-slate-400 mt-2">
              Trade secrets must operate on a <strong>"Need-to-Know"</strong> basis. Assign proper clearance tiers to each asset category:
            </p>
          </div>

          <div className="space-y-4">
            {[
              { id: 'tier_marketing', name: 'Public Press Releases & Product Brochures', correctTier: 'public' },
              { id: 'tier_internal', name: 'General Staff Operating Schedules & Cafeteria Menus', correctTier: 'internal' },
              { id: 'tier_secret', name: 'Proprietary Catalyst Recipe "Matrix-X" Molar Ratio', correctTier: 'restricted' }
            ].map((asset) => {
              const selected = configuredTiers[asset.id];
              return (
                <div key={asset.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-white text-sm">{asset.name}</h4>
                  </div>
                  <div className="flex gap-2">
                    {[
                      { tier: 'public', label: 'Tier 1: Public Access' },
                      { tier: 'internal', label: 'Tier 2: General Staff' },
                      { tier: 'restricted', label: 'Tier 3: Strictly Restricted (Lead Chemists Only)' }
                    ].map((t) => (
                      <button
                        key={t.tier}
                        onClick={() => {
                          soundFx.playClick();
                          setConfiguredTiers(prev => ({ ...prev, [asset.id]: t.tier }));
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          selected === t.tier
                            ? 'bg-rose-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              disabled={
                configuredTiers.tier_marketing !== 'public' ||
                configuredTiers.tier_internal !== 'internal' ||
                configuredTiers.tier_secret !== 'restricted'
              }
              onClick={() => advanceTo('7_incident_response', 7)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                configuredTiers.tier_marketing === 'public' &&
                configuredTiers.tier_internal === 'internal' &&
                configuredTiers.tier_secret === 'restricted'
                  ? 'bg-rose-500 hover:bg-rose-400 text-slate-950 cursor-pointer shadow-lg shadow-rose-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Simulate Security Incident</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: RESPOND TO SIMULATED UNAUTHORIZED ACCESS INCIDENT */}
      {currentStep === '7_incident_response' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Step 7 • Emergency Incident Command</span>
            <h2 className="text-xl font-bold text-white mt-1">Incident Alert: Unauthorized Terminal Access Detected!</h2>
          </div>

          <div className="p-5 bg-rose-950/30 border-2 border-rose-500 rounded-2xl space-y-4">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-rose-500 animate-pulse shrink-0" />
              <div>
                <h4 className="font-bold text-white text-base">Intrusion Alert: Subcontractor Laptop on Terminal 4</h4>
                <p className="text-xs text-rose-300">
                  An unauthorized device plugged into a research workstation port and attempted to query <em>Matrix-X</em> recipe tables
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-white block">Execute Emergency Incident Protocol:</span>

              <div 
                onClick={() => {
                  soundFx.playClick();
                  setIncidentSteps(prev => ({ ...prev, revokedToken: true }));
                }}
                className={`p-3.5 rounded-xl border cursor-pointer text-xs flex items-center justify-between ${
                  incidentSteps.revokedToken ? 'bg-emerald-950/30 border-emerald-500 text-emerald-200' : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}
              >
                <span>1. Sever Network Bridge & Revoke Session Token</span>
                {incidentSteps.revokedToken && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>

              <div 
                onClick={() => {
                  soundFx.playClick();
                  setIncidentSteps(prev => ({ ...prev, lockedTerminal: true }));
                }}
                className={`p-3.5 rounded-xl border cursor-pointer text-xs flex items-center justify-between ${
                  incidentSteps.lockedTerminal ? 'bg-emerald-950/30 border-emerald-500 text-emerald-200' : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}
              >
                <span>2. Engage Terminal Lockdown & Lock Biometric Hardware</span>
                {incidentSteps.lockedTerminal && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>

              <div 
                onClick={() => {
                  soundFx.playClick();
                  setIncidentSteps(prev => ({ ...prev, auditLogs: true }));
                }}
                className={`p-3.5 rounded-xl border cursor-pointer text-xs flex items-center justify-between ${
                  incidentSteps.auditLogs ? 'bg-emerald-950/30 border-emerald-500 text-emerald-200' : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}
              >
                <span>3. Preserve Immutable Forensic Access Logs & Digital Signatures</span>
                {incidentSteps.auditLogs && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-800">
            <button
              disabled={(incidentSteps.revokedToken && incidentSteps.lockedTerminal && incidentSteps.auditLogs)}
              onClick={() => advanceTo('8_investigate_exposure', 8)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                incidentSteps.revokedToken && incidentSteps.lockedTerminal && incidentSteps.auditLogs
                  ? 'bg-rose-500 hover:bg-rose-400 text-slate-950 cursor-pointer shadow-lg shadow-rose-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Investigate Exposure & Legal Standing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 8: INVESTIGATE THE EXPOSURE AND CORRECT WEAKNESSES */}
      {currentStep === '8_investigate_exposure' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Step 8 • Legal Standing Audit</span>
            <h2 className="text-xl font-bold text-white mt-1">Audit Legal Standing for Trade Secret Misappropriation</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-950 rounded-xl border border-emerald-500/40 space-y-3">
              <span className="font-bold text-emerald-400 text-sm block">✓ Because Reasonable Efforts Were Enforced:</span>
              <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4">
                <li>NDAs signed by visiting contractors established formal confidentiality duty.</li>
                <li>Encryption and password policies prevented direct file reading.</li>
                <li>Forensic logs prove the intruder breached access controls through unauthorized means (improper means).</li>
                <li className="font-bold text-emerald-400">Result: Company has strong legal standing to file an Emergency Injunction / TRO in federal court!</li>
              </ul>
            </div>

            <div className="p-5 bg-slate-950 rounded-xl border border-rose-900/40 space-y-3">
              <span className="font-bold text-rose-400 text-sm block">✗ What Happens Without Reasonable Precautions:</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                If BioMatrix Labs had left the formula on a public cafeteria table without password locks or NDAs, courts would rule: <em>"You failed to take reasonable efforts under the circumstances. The trade secret is lost forever!"</em>
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              onClick={() => advanceTo('9_mentor_explanation', 9)}
              className="px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-500/25"
            >
              <span>Review 3-Prong UTSA Test with IP Mentor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 9: REVIEW THE SECURITY MEASURES WITH AN IP MENTOR */}
      {currentStep === '9_mentor_explanation' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Step 9 • Statutory Framework</span>
            <h2 className="text-xl font-bold text-white mt-1">Review the 3-Prong UTSA Legal Test with Mentor Rajiv</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-5 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-4xl shadow-inner mb-3">
                👨‍💼
              </div>
              <h3 className="font-bold text-white">Counsel Rajiv</h3>
              <p className="text-xs text-rose-400 font-medium">Chief IP Security Counsel</p>

              <div className="bg-slate-900/90 rounded-xl p-3.5 mt-4 text-xs text-slate-300 text-left w-full space-y-2 border border-slate-800">
                <span className="font-bold text-rose-300 block">The 3-Prong Legal Rule:</span>
                <p>
                  "Under the Uniform Trade Secrets Act (UTSA) and Defend Trade Secrets Act (DTSA), an asset qualifies as a trade secret ONLY if all 3 prongs are satisfied!"
                </p>
              </div>
            </div>

            <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div className="space-y-3">
                {[
                  {
                    id: 'prong1',
                    title: 'Prong 1: Not Generally Known or Ascertainable',
                    desc: 'The formula cannot be found in textbooks, journals, or public disclosures.'
                  },
                  {
                    id: 'prong2',
                    title: 'Prong 2: Derives Independent Economic Value from Secrecy',
                    desc: 'Competitors do not possess it, giving the company a tangible commercial edge.'
                  },
                  {
                    id: 'prong3',
                    title: 'Prong 3: Subject to Reasonable Efforts to Maintain Secrecy',
                    desc: 'The owner actively enforces NDAs, encryption, and physical access controls.'
                  }
                ].map((p) => {
                  const isChecked = mentorProngsChecked[p.id];
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        soundFx.playClick();
                        setMentorProngsChecked(prev => ({ ...prev, [p.id]: true }));
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isChecked ? 'bg-rose-950/30 border-rose-500' : 'bg-slate-900 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{p.title}</span>
                        {isChecked && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{p.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                <button
                  disabled={Object.keys(mentorProngsChecked).length < 3}
                  onClick={() => advanceTo('10_vault_certification', 10)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                    Object.keys(mentorProngsChecked).length >= 3
                      ? 'bg-rose-500 hover:bg-rose-400 text-slate-950 cursor-pointer shadow-lg shadow-rose-500/25'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>Complete Vault Certification</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 10: COMPLETE FINAL CONFIDENTIALITY-PROTECTION MISSION */}
      {currentStep === '10_vault_certification' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Step 10 • Final Vault Certification</span>
            <h2 className="text-xl font-bold text-white mt-1">Official Trade Secret Security Certification</h2>
          </div>

          {!vaultCertified ? (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-3xl mx-auto">
                🛡️
              </div>
              <h3 className="text-lg font-black text-white">Facility Audit Score: 100 / 100</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                All reasonable precaution protocols verified. The master recipe is sealed in the biometric vault with strict Role-Based Access Control and signed Non-Disclosure Agreements.
              </p>

              <button
                onClick={() => {
                  soundFx.playSuccess();
                  confetti({ particleCount: 90, spread: 80 });
                  setVaultCertified(true);
                }}
                className="px-6 py-3 bg-rose-500 hover:bg-rose-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 mx-auto cursor-pointer shadow-lg shadow-rose-500/25"
              >
                <Lock className="w-4 h-4" />
                <span>Certify Master Vault Protocol</span>
              </button>
            </div>
          ) : (
            <div className="bg-gradient-to-b from-rose-950/40 via-slate-950 to-slate-900 border-2 border-rose-500/80 rounded-2xl p-6 text-center space-y-5 shadow-2xl relative">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-400 mx-auto flex items-center justify-center text-3xl shadow-lg shadow-rose-500/30">
                🔒
              </div>

              <div>
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-widest block">
                  Certified Trade Secret Facility
                </span>
                <h3 className="text-2xl font-black text-white tracking-tight mt-1">
                  Master Vault Protocol Active
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Asset: <em>Formula Matrix-X Chemical Know-How</em>
                </p>
              </div>

              <div className="max-w-md mx-auto bg-slate-900/90 rounded-xl p-4 border border-rose-500/30 text-xs text-slate-300 text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Security Clearance:</span>
                  <span className="font-bold text-white">Tier 3 (Need-to-Know)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Statutory Duration:</span>
                  <span className="font-bold text-rose-400">Potentially Perpetual (as long as kept secret)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Legal Protection:</span>
                  <span className="font-bold text-emerald-400">UTSA / DTSA Misappropriation Relief</span>
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                <button
                  onClick={() => {
                    soundFx.playLevelUp();
                    onComplete(200, 50, 3, 'trade_secret');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-rose-500/30 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Claim Secret Keeper Honors & Return to Map</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
