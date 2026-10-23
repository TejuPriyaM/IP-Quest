import React, { useState } from 'react';
import { soundFx } from '../../utils/sound';
import { 
  Lightbulb, Droplets, Wrench, Shield, CheckCircle2, AlertCircle, Sparkles, ArrowRight, 
  RotateCcw, Cpu, Search, Check, Play, Sliders, Layers, Clock, FileText, 
  Scale, Award, Sprout, Sun, Battery, Gauge, ArrowLeft, Eye, HelpCircle, CheckCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PatentLabGame = ({ onComplete, onBack, onOpenTutorial, onSwitchTo3D, onSwitchToQuick }) => {
  const [currentStep, setCurrentStep] = useState('1_farm_problem');
  const [progressCount, setProgressCount] = useState(1);

  // STEP 1: Farm Observation State
  const [farmPuddleInspected, setFarmPuddleInspected] = useState(false);
  const [farmTimerInspected, setFarmTimerInspected] = useState(false);
  const [farmMeterInspected, setFarmMeterInspected] = useState(false);

  // STEP 2: Farmer & Old Machine Inspection
  const [oldValveChecked, setOldValveChecked] = useState(false);
  const [farmerDialogueStage, setFarmerDialogueStage] = useState(0);

  // STEP 4: Component Inspection States
  const [inspectedComponents, setInspectedComponents] = useState({});
  const [activeComponentInfo, setActiveComponentInfo] = useState(null);

  // STEP 5: Assembly State (Sockets)
  const [installedSockets, setInstalledSockets] = useState({
    sensor: false,
    controller: false,
    valve: false,
    power: false
  });

  // STEP 6: Proto State
  const [soilCondition, setSoilCondition] = useState('dry');
  const [prototypeRunning, setPrototypeRunning] = useState(false);
  const [testedDry, setTestedDry] = useState(false);
  const [testedMoist, setTestedMoist] = useState(false);

  // STEP 8: Technical Features (Patentability Pillars)
  const [pillarsChecked, setPillarsChecked] = useState({
    novelty: false,
    inventiveStep: false,
    utility: false,
    distinctFromBrand: false
  });

  // STEP 9: Mentor Dialogue Stage
  const [mentorDialogStep, setMentorDialogStep] = useState(0);

  // STEP 10: Final Patent Claim Submission
  const [selectedClaimType, setSelectedClaimType] = useState(null);
  const [enablementVerified, setEnablementVerified] = useState(false);
  const [patentGranted, setPatentGranted] = useState(false);

  const STEPS_LIST = [
    { id: '1_farm_problem', title: '1. Farm Problem', num: 1 },
    { id: '2_farmer_machine', title: '2. Inspect Machine', num: 2 },
    { id: '3_enter_lab', title: '3. Invention Lab', num: 3 },
    { id: '4_inspect_components', title: '4. Components', num: 4 },
    { id: '5_assemble_machine', title: '5. Assemble', num: 5 },
    { id: '6_test_prototype', title: '6. Test Sensor', num: 6 },
    { id: '7_compare_systems', title: '7. System Comparison', num: 7 },
    { id: '8_technical_features', title: '8. Patent Criteria', num: 8 },
    { id: '9_mentor_explanation', title: '9. IP Mentor', num: 9 },
    { id: '10_patent_challenge', title: '10. Protection Plan', num: 10 }
  ];

  const advanceTo = (next, nextNum) => {
    soundFx.playSuccess();
    setCurrentStep(next);
    setProgressCount(Math.max(progressCount, nextNum));
  };

  // Components inventory for Step 4
  const LAB_COMPONENTS = [
    {
      id: 'sensor',
      name: 'Capacitive Soil Moisture Probe',
      category: 'Sensory Hardware',
      icon: '🌱',
      isPatentable: true,
      role: 'Measures soil dielectric permittivity in real-time to detect root-zone moisture.',
      reason: 'Physical electronic apparatus essential to the technical problem-solving mechanism.'
    },
    {
      id: 'controller',
      name: 'Microcontroller Logic Unit (MCU)',
      category: 'Embedded Computing',
      icon: '🧠',
      isPatentable: true,
      role: 'Receives probe telemetry, compares against moisture thresholds, and outputs actuator triggers.',
      reason: 'Hardware control unit operating physical circuitry based on sensor feedback.'
    },
    {
      id: 'valve',
      name: 'Electromagnetic Solenoid Water Valve',
      category: 'Electromechanical Actuator',
      icon: '🚰',
      isPatentable: true,
      role: 'Opens water conduit when energized, snaps closed autonomously when moisture threshold reached.',
      reason: 'Tangible mechanical apparatus controlling water flow in response to electronic signals.'
    },
    {
      id: 'power',
      name: 'Rechargeable Solar-Battery Pack',
      category: 'Power Management',
      icon: '☀️',
      isPatentable: true,
      role: 'Provides continuous 12V DC power to the sensor and valve in off-grid agricultural fields.',
      reason: 'Physical industrial power component giving field-ready utility to the machine.'
    },
    {
      id: 'brand_decal',
      name: 'Sticker: "AquaSave 3000™"',
      category: 'Brand Name / Logo',
      icon: '🏷️',
      isPatentable: false,
      role: 'Cosmetic sticker with a catchy name.',
      reason: 'NOT PATENTABLE Brand names and commercial logos belong to Trademark law, not Patent law.'
    },
    {
      id: 'formula',
      name: 'Whiteboard Formula: V = I × R & Ideal Gas Law',
      category: 'Abstract Law of Nature',
      icon: '📐',
      isPatentable: false,
      role: 'Scientific physics equations.',
      reason: 'NOT PATENTABLE Laws of nature, pure math, and abstract ideas cannot be patented.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white border-2 border-amber-400 rounded-2xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { soundFx.playClick(); onBack(); }}
              className="p-2 rounded-xl bg-sky-50 hover:bg-sky-100 text-slate-700 hover:text-slate-900 transition-colors border border-sky-200 cursor-pointer"
              title="Return to World Map"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center text-slate-950 font-black shadow-xs">
              <Lightbulb className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                  Patent Lab Mission
                </span>
                <span className="text-xs text-slate-600">Agricultural Invention Challenge</span>
              </div>
              <h1 className="text-2xl font-black text-[#0e2038] tracking-tight mt-0.5">
                The Smart Irrigation Challenge
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
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Walk through the farm in 3D"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>🌐 3D Facility</span>
              </button>
            )}

            {onOpenTutorial && (
              <button
                onClick={() => { soundFx.playClick(); onOpenTutorial(); }}
                className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-amber-900 text-xs font-semibold flex items-center gap-1.5 border border-sky-200 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Patent Guide
              </button>
            )}

            {/* Clear Student Inventor Face Display */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 border border-amber-400/50 shadow-xs">
              <div className="w-8 h-8 rounded-full bg-gradient-to-b from-sky-400 to-indigo-600 border border-amber-400 overflow-hidden shadow-inner flex items-center justify-center shrink-0">
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
                <span className="text-[9px] text-amber-800 font-bold block leading-none">INVENTOR</span>
                <span className="text-xs font-black text-[#0e2038] leading-tight">Student</span>
              </div>
            </div>

            {/* Right-Top Steps Indicator */}
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-100 border border-amber-400 text-amber-900 font-black text-xs flex items-center gap-2 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Step {STEPS_LIST.find(s => s.id === currentStep)?.num || 1} of 10</span>
            </div>
          </div>
        </div>

        {/* Active Step & Next Step Progression Strip (Completed steps are hidden) */}
        <div className="mt-6 pt-4 border-t border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Current Step:</span>
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step {STEPS_LIST.find(s => s.id === currentStep)?.num || 1}: {STEPS_LIST.find(s => s.id === currentStep)?.title.split('. ')[1]}</span>
            </div>
          </div>

          {(() => {
            const currentNum = STEPS_LIST.find(s => s.id === currentStep)?.num || 1;
            const nextStep = STEPS_LIST.find(s => s.num === currentNum + 1);
            if (!nextStep) {
              return (
                <span className="text-xs text-amber-700 font-bold flex items-center gap-1">
                  🏆 Final Step of Patent Lab
                </span>
              );
            }
            return (
              <div className="flex items-center gap-2 text-xs text-slate-700 flex-wrap">
                <button
                  onClick={() => {
                    soundFx.playSuccess();
                    advanceTo(nextStep.id, nextStep.num);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-400 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 shadow-xs"
                  title="Need help? Advance to the next step immediately"
                >
                  <span>💡 Need Help? Skip to Step {nextStep.num} ➔</span>
                </button>
                <div className="px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-slate-700 flex items-center gap-1.5 font-medium">
                  <span className="w-4 h-4 rounded-full bg-sky-200 text-slate-800 flex items-center justify-center text-[10px] font-bold">
                    {nextStep.num}
                  </span>
                  <span>{nextStep.title.split('. ')[1]}</span>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* STEP 1: EXPLORE THE FARM & OBSERVE THE PROBLEM */}
      {currentStep === '1_farm_problem' && (
        <div className="bg-white border-2 border-sky-200 rounded-2xl p-6 space-y-6 shadow-xs">
          <div className="border-b border-sky-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Step 1 • Field Investigation</span>
                <h2 className="text-xl font-bold text-[#0e2038] mt-1">Explore the Farm: Observe the Water Waste</h2>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full font-medium">
                Objective: Inspect 3 problem hotspots
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-2">
              Farmer Ramesh has called you to GreenAcres Farm. Conventional irrigation sprinklers are gushing water across saturated soil, drowning crops and draining the community reservoir.
            </p>
          </div>

          {/* Interactive Farm Visual Environment */}
          <div className="relative rounded-2xl bg-slate-50 border border-slate-200 p-6 min-h-[340px] overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="flex items-center gap-2 text-emerald-800">
                <Sprout className="w-4 h-4 text-emerald-700" /> GreenAcres Field Plot #4
              </span>
              <span className="flex items-center gap-1.5 text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
                <Droplets className="w-3.5 h-3.5" /> 620 Gallons Wasted Today
              </span>
            </div>

            {/* Farm Scene Interactive Hotspots */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
              {/* Hotspot 1: Muddy Puddles */}
              <div 
                onClick={() => {
                  soundFx.playClick();
                  setFarmPuddleInspected(true);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  farmPuddleInspected 
                    ? 'bg-emerald-50 border-emerald-300' 
                    : 'bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">🌊</span>
                  {farmPuddleInspected ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4 text-amber-400" />}
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-2">Waterlogged Soil Puddle</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Soil moisture is already at 92%, yet sprinklers continue spraying. Crop roots are suffocating.
                </p>
                {farmPuddleInspected && (
                  <span className="inline-block mt-2 text-[11px] text-emerald-800 font-semibold">✓ Root-rot risk diagnosed</span>
                )}
              </div>

              {/* Hotspot 2: Dumb Clock Timer */}
              <div 
                onClick={() => {
                  soundFx.playClick();
                  setFarmTimerInspected(true);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  farmTimerInspected 
                    ? 'bg-emerald-50 border-emerald-300' 
                    : 'bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">⏰</span>
                  {farmTimerInspected ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4 text-amber-400" />}
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-2">Mechanical Clock Timer</h3>
                <p className="text-xs text-slate-600 mt-1">
                  A rigid dial set to spray 20 minutes every hour regardless of whether it rained 5 minutes ago.
                </p>
                {farmTimerInspected && (
                  <span className="inline-block mt-2 text-[11px] text-emerald-800 font-semibold">✓ Zero feedback mechanism found</span>
                )}
              </div>

              {/* Hotspot 3: Water Reservoir Meter */}
              <div 
                onClick={() => {
                  soundFx.playClick();
                  setFarmMeterInspected(true);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  farmMeterInspected 
                    ? 'bg-emerald-50 border-emerald-300' 
                    : 'bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">📉</span>
                  {farmMeterInspected ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Eye className="w-4 h-4 text-amber-400" />}
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-2">Reservoir Depletion Meter</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Water storage dropped 40% in two weeks. Costs are soaring due to pump electricity bills.
                </p>
                {farmMeterInspected && (
                  <span className="inline-block mt-2 text-[11px] text-emerald-800 font-semibold">✓ Economic crisis verified</span>
                )}
              </div>
            </div>

            {/* Field Status Banner */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-slate-700">
                <span className="font-bold text-amber-800">Invention Problem:</span> The timer waters on a schedule instead of checking whether the soil is already wet.
              </div>
              <button
                disabled={(farmPuddleInspected && farmTimerInspected && farmMeterInspected)}
                onClick={() => advanceTo('2_farmer_machine', 2)}
                className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
                  farmPuddleInspected && farmTimerInspected && farmMeterInspected
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/25 cursor-pointer'
                    : 'bg-slate-100 text-slate-500 cursor-not-allowed'
                }`}
              >
                <span>Talk to Farmer Ramesh</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: TALK TO FARMER & INSPECT EXISTING MACHINE */}
      {currentStep === '2_farmer_machine' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Step 2 • Diagnostic Dialogue</span>
            <h2 className="text-xl font-bold text-white mt-1">Talk to the Farmer & Inspect the Existing Machine</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Farmer Character Card */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-4xl shadow-inner mb-3">
                🧑‍🌾
              </div>
              <h3 className="font-bold text-white">Farmer Ramesh</h3>
              <p className="text-xs text-amber-400 font-medium">GreenAcres Farm Steward</p>

              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 mt-4 text-xs text-slate-300 text-left w-full space-y-2">
                <p>
                  "Welcome, young inventor Our current machine is completely dumb. Look at this old brass gate valve and spring dial."
                </p>
                {farmerDialogueStage >= 1 && (
                  <p className="text-amber-200">
                    "If we keep dumping water like this, our well will go dry by next month. Can you engineer a machine that automatically turns on ONLY when the soil needs water?"
                  </p>
                )}
              </div>

              {farmerDialogueStage === 0 ? (
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setFarmerDialogueStage(1);
                  }}
                  className="mt-4 w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Ask Ramesh about the Machine
                </button>
              ) : (
                <div className="mt-4 text-xs text-emerald-400 font-semibold">
                  ✓ Invention Challenge Accepted
                </div>
              )}
            </div>

            {/* Inspect Existing Machine Breakdown */}
            <div className="md:col-span-2 bg-slate-950/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-amber-400" /> Existing "Model-1994" Sprinkler Rig
                  </h4>
                  <span className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2.5 py-0.5 rounded-full font-medium">
                    Prior Art: Obsolete & Inefficient
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-3">
                    <span className="text-xl">🚰</span>
                    <div>
                      <span className="font-bold text-slate-200 block">Manual Brass Gate Valve:</span>
                      <p className="text-slate-400 mt-0.5">
                        Requires a human to physically walk 2 miles to twist it open or shut. No electronic automation.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-3">
                    <span className="text-xl">⏲️</span>
                    <div>
                      <span className="font-bold text-slate-200 block">Mechanical Spring Timer:</span>
                      <p className="text-slate-400 mt-0.5">
                        Blindly ticks down. Has zero connection to ground condition or ambient humidity.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-start gap-3">
                    <span className="text-xl">❌</span>
                    <div>
                      <span className="font-bold text-slate-200 block">Missing Element:</span>
                      <p className="text-amber-400 mt-0.5">
                        No soil moisture telemetry sensor and no autonomous microprocessor logic gate.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Step 2 Complete: We have identified the technical deficiency of prior art.
                </span>
                <button
                  disabled={farmerDialogueStage < 1}
                  onClick={() => advanceTo('3_enter_lab', 3)}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 ${
                    farmerDialogueStage >= 1
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-lg shadow-amber-500/25'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>Enter the Invention Laboratory</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: ENTER THE INVENTION LABORATORY */}
      {currentStep === '3_enter_lab' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Step 3 • The Inventor's Workshop</span>
            <h2 className="text-xl font-bold text-white mt-1">Welcome to the Agricultural Engineering Lab</h2>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-amber-950/20 via-slate-950 to-slate-900 border border-amber-500/30 p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold mb-3">
                  <Wrench className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm">Rapid Prototyping Bench</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Equipped with breadboards, soldering stations, water flumes, and calibration meters.
                </p>
              </div>

              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold mb-3">
                  <Cpu className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm">Prior Art Database Terminal</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Search patent registries to confirm our technical combination has never been published before.
                </p>
              </div>

              <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold mb-3">
                  <Shield className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-white text-sm">Patent Statutory Framework</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Patents protect concrete, functional machines and industrial processes, NOT abstract ideas
                </p>
              </div>
            </div>

            {/* Inventor Notebook Quote */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-xs text-amber-200">
              <span className="font-bold text-amber-400 block mb-1">⚡ Core Patent Principle: The Idea vs Invention Rule</span>
              "You cannot patent the abstract desire: 'I want to save farm water.' You can ONLY patent the concrete, novel technical machine or functional process that physically accomplishes it!"
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => advanceTo('4_inspect_components', 4)}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                <span>Find & Inspect Components</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: FIND & INSPECT COMPONENTS */}
      {currentStep === '4_inspect_components' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Step 4 • Workbench Inspection</span>
                <h2 className="text-xl font-bold text-white mt-1">Inspect Machine Components vs Non-Patentable Items</h2>
              </div>
              <span className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 px-3 py-1 rounded-full font-medium">
                {Object.keys(inspectedComponents).length} / 6 Inspected
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Inspect each item on the laboratory bench. Notice the critical difference between patentable technical apparatuses and unpatentable items (brands, logos, and raw formulas).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LAB_COMPONENTS.map((item) => {
              const isInspected = inspectedComponents[item.id];
              const isSelected = activeComponentInfo?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    soundFx.playClick();
                    setInspectedComponents(prev => ({ ...prev, [item.id]: true }));
                    setActiveComponentInfo(item);
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-400 shadow-md shadow-amber-500/20'
                      : isInspected
                      ? 'bg-slate-800/80 border-slate-700'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-3xl">{item.icon}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.isPatentable 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {item.isPatentable ? 'Patentable Hardware' : 'Non-Patentable'}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm mt-2">{item.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.role}</p>
                </div>
              );
            })}
          </div>

          {/* Detailed Inspector Modal/Card */}
          {activeComponentInfo && (
            <div className={`p-4 rounded-xl border ${
              activeComponentInfo.isPatentable 
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200' 
                : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block">
                    {activeComponentInfo.isPatentable ? '✓ Patentable Technical Component' : '✗ Unpatentable Under Patent Law'}
                  </span>
                  <h4 className="font-bold text-white text-base mt-0.5">{activeComponentInfo.name}</h4>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded bg-slate-900 border border-slate-700">
                  {activeComponentInfo.category}
                </span>
              </div>
              <p className="text-xs mt-2 text-slate-300">{activeComponentInfo.role}</p>
              <div className="mt-2 text-xs font-bold pt-2 border-t border-slate-800/60">
                <span className="text-amber-400">Legal Analysis: </span>{activeComponentInfo.reason}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Inspect at least 4 components to proceed to proto.
            </span>
            <button
              disabled={Object.keys(inspectedComponents).length < 4}
              onClick={() => advanceTo('5_assemble_machine', 5)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                Object.keys(inspectedComponents).length >= 4
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-lg shadow-amber-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Assemble the Machine</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: ASSEMBLE THE MACHINE (PLACEMENT POINTS) */}
      {currentStep === '5_assemble_machine' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Step 5 • Interactive Assembly</span>
                <h2 className="text-xl font-bold text-white mt-1">Assemble the Smart Irrigation Machine</h2>
              </div>
              <span className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 px-3 py-1 rounded-full font-medium">
                {Object.values(installedSockets).filter(Boolean).length} / 4 Sockets Installed
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Click each component socket on the chassis schematic below to mount the physical engineering parts into an enabled proto.
            </p>
          </div>

          {/* Machine Chassis Interactive Socket Board */}
          <div className="rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 p-6 relative">
            <div className="text-center mb-6">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Proto V1.0</span>
              <h3 className="text-lg font-black text-white">Autonomous Soil-Responsive HydroValve</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Socket 1: Soil Sensor */}
              <div 
                onClick={() => {
                  soundFx.playClick();
                  setInstalledSockets(prev => ({ ...prev, sensor: !prev.sensor }));
                }}
                className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center ${
                  installedSockets.sensor
                    ? 'border-emerald-500 bg-emerald-950/30 text-emerald-200'
                    : 'border-slate-700 bg-slate-900/60 hover:border-amber-400 text-slate-400'
                }`}
              >
                <div className="text-3xl mb-2">{installedSockets.sensor ? '🌱' : '🔲'}</div>
                <h4 className="font-bold text-xs uppercase tracking-wider">Socket 1: Ground Probe</h4>
                <p className="text-[11px] mt-1">
                  {installedSockets.sensor ? 'Capacitive Probe Installed' : 'Click to mount Soil Sensor'}
                </p>
                {installedSockets.sensor && (
                  <span className="mt-2 inline-block text-[10px] text-emerald-400 font-bold">✓ Circuit Connected</span>
                )}
              </div>

              {/* Socket 2: Microcontroller */}
              <div 
                onClick={() => {
                  soundFx.playClick();
                  setInstalledSockets(prev => ({ ...prev, controller: !prev.controller }));
                }}
                className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center ${
                  installedSockets.controller
                    ? 'border-emerald-500 bg-emerald-950/30 text-emerald-200'
                    : 'border-slate-700 bg-slate-900/60 hover:border-amber-400 text-slate-400'
                }`}
              >
                <div className="text-3xl mb-2">{installedSockets.controller ? '🧠' : '🔲'}</div>
                <h4 className="font-bold text-xs uppercase tracking-wider">Socket 2: MCU Logic</h4>
                <p className="text-[11px] mt-1">
                  {installedSockets.controller ? 'Microcontroller Mounted' : 'Click to mount MCU'}
                </p>
                {installedSockets.controller && (
                  <span className="mt-2 inline-block text-[10px] text-emerald-400 font-bold">✓ Firmware Flashed</span>
                )}
              </div>

              {/* Socket 3: Solenoid Valve */}
              <div 
                onClick={() => {
                  soundFx.playClick();
                  setInstalledSockets(prev => ({ ...prev, valve: !prev.valve }));
                }}
                className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center ${
                  installedSockets.valve
                    ? 'border-emerald-500 bg-emerald-950/30 text-emerald-200'
                    : 'border-slate-700 bg-slate-900/60 hover:border-amber-400 text-slate-400'
                }`}
              >
                <div className="text-3xl mb-2">{installedSockets.valve ? '🚰' : '🔲'}</div>
                <h4 className="font-bold text-xs uppercase tracking-wider">Socket 3: Actuator</h4>
                <p className="text-[11px] mt-1">
                  {installedSockets.valve ? 'Solenoid Valve Mounted' : 'Click to mount Valve'}
                </p>
                {installedSockets.valve && (
                  <span className="mt-2 inline-block text-[10px] text-emerald-400 font-bold">✓ Pipe Plumbed</span>
                )}
              </div>

              {/* Socket 4: Solar Battery */}
              <div 
                onClick={() => {
                  soundFx.playClick();
                  setInstalledSockets(prev => ({ ...prev, power: !prev.power }));
                }}
                className={`p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer text-center ${
                  installedSockets.power
                    ? 'border-emerald-500 bg-emerald-950/30 text-emerald-200'
                    : 'border-slate-700 bg-slate-900/60 hover:border-amber-400 text-slate-400'
                }`}
              >
                <div className="text-3xl mb-2">{installedSockets.power ? '☀️' : '🔲'}</div>
                <h4 className="font-bold text-xs uppercase tracking-wider">Socket 4: Power Pack</h4>
                <p className="text-[11px] mt-1">
                  {installedSockets.power ? 'Solar Pack Mounted' : 'Click to mount Solar Cell'}
                </p>
                {installedSockets.power && (
                  <span className="mt-2 inline-block text-[10px] text-emerald-400 font-bold">✓ 12V Bus Energized</span>
                )}
              </div>
            </div>

            {/* Assembly Completeness Status */}
            {Object.values(installedSockets).every(Boolean) && (
              <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>All 4 mechanical and electrical subsystems assembled The proto physically enabled.</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Mount all 4 sockets to activate the proto rig.
            </span>
            <button
              disabled={!Object.values(installedSockets).every(Boolean)}
              onClick={() => advanceTo('6_test_prototype', 6)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                Object.values(installedSockets).every(Boolean)
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-lg shadow-amber-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Activate Prototype & Test Sensor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: ACTIVATE PROTOTYPE & OBSERVE SENSOR CONTROLLING WATER FLOW */}
      {currentStep === '6_test_prototype' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Step 6 • Live Verification</span>
                <h2 className="text-xl font-bold text-white mt-1">Activate Prototype: Test Sensor-Controlled Water Flow</h2>
              </div>
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-medium">
                Test Both Soil States
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Toggle between Dry Soil and Moist/Flooded Soil. Watch the capacitive probe feed real-time telemetry into the MCU, causing the solenoid valve to open or snap shut autonomously
            </p>
          </div>

          {/* Proto & Telemetry Deck */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Condition Controller */}
            <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-5 space-y-4">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" /> Soil Test Chamber
              </h4>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setSoilCondition('dry');
                    setTestedDry(true);
                  }}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                    soilCondition === 'dry'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>🌵 Dry Arid Soil (18% Moisture)</span>
                    {testedDry && <CheckCircle className="w-3.5 h-3.5" />}
                  </div>
                  <p className="font-normal text-[11px] mt-1 opacity-90">
                    Needs water: Valve should open.
                  </p>
                </button>

                <button
                  onClick={() => {
                    soundFx.playClick();
                    setSoilCondition('moist');
                    setTestedMoist(true);
                  }}
                  className={`w-full p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                    soilCondition === 'moist'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>💧 Moist / Saturated Soil (78% Moisture)</span>
                    {testedMoist && <CheckCircle className="w-3.5 h-3.5" />}
                  </div>
                  <p className="font-normal text-[11px] mt-1 opacity-90">
                    Adequate water: Valve should shut off instantly.
                  </p>
                </button>
              </div>

              <div className="pt-3 border-t border-slate-700/60">
                <div className="text-[11px] text-slate-400 mb-1">Testing Progress:</div>
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <span className={testedDry ? 'text-emerald-400' : 'text-slate-500'}>
                    {testedDry ? '✓ Dry soil tested' : '○ Test dry soil'}
                  </span>
                  <span>•</span>
                  <span className={testedMoist ? 'text-emerald-400' : 'text-slate-500'}>
                    {testedMoist ? '✓ Moist soil tested' : '○ Test moist soil'}
                  </span>
                </div>
              </div>
            </div>

            {/* Live Proto & Gauges */}
            <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold text-slate-200">Live Hardware Telemetry Feed</span>
                  </div>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${
                    soilCondition === 'dry' 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {soilCondition === 'dry' ? 'VALVE STATUS: ENERGIZED OPEN' : 'VALVE STATUS: AUTONOMOUS CUT-OFF'}
                  </span>
                </div>

                {/* Animated Machine Visual */}
                <div className="bg-slate-900/80 rounded-xl p-5 border border-slate-800 text-center relative overflow-hidden">
                  <div className="flex items-center justify-center gap-8 py-4">
                    <div className="text-center">
                      <div className="text-3xl mb-1">🌱</div>
                      <span className="text-[11px] font-bold text-slate-400 block">Soil Probe</span>
                      <span className="text-xs font-bold text-white">
                        {soilCondition === 'dry' ? '18% VWC' : '78% VWC'}
                      </span>
                    </div>

                    <div className="text-slate-600 font-mono text-xl animate-pulse">──➔</div>

                    <div className="text-center">
                      <div className="text-3xl mb-1">🧠</div>
                      <span className="text-[11px] font-bold text-slate-400 block">Logic Gate</span>
                      <span className="text-xs font-bold text-amber-400">
                        {soilCondition === 'dry' ? 'Trigger HIGH' : 'Trigger LOW'}
                      </span>
                    </div>

                    <div className="text-slate-600 font-mono text-xl animate-pulse">──➔</div>

                    <div className="text-center">
                      <div className="text-3xl mb-1">
                        {soilCondition === 'dry' ? '🚿' : '🛑'}
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 block">Solenoid Valve</span>
                      <span className={`text-xs font-bold ${soilCondition === 'dry' ? 'text-cyan-400' : 'text-rose-400'}`}>
                        {soilCondition === 'dry' ? 'Flow: 4.2 GPM' : 'Flow: 0.0 GPM'}
                      </span>
                    </div>
                  </div>

                  {soilCondition === 'dry' ? (
                    <div className="text-xs text-cyan-300 bg-cyan-950/40 border border-cyan-800/40 p-2.5 rounded-lg mt-2">
                      💦 Dry soil detected Solenoid valve opened automatically to nourish crops.
                    </div>
                  ) : (
                    <div className="text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-800/40 p-2.5 rounded-lg mt-2">
                      🛑 Soil is saturated Solenoid valve shut off instantly. Zero water wasted
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {testedDry && testedMoist 
                    ? '✓ Verified The proto reliably under both conditions.' 
                    : 'Please test both dry and moist soil states.'}
                </span>
                <button
                  disabled={(testedDry && testedMoist)}
                  onClick={() => advanceTo('7_compare_systems', 7)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                    testedDry && testedMoist
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-lg shadow-amber-500/25'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>Compare Systems</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 7: COMPARE OLD AND IMPROVED SYSTEMS SIDE-BY-SIDE */}
      {currentStep === '7_compare_systems' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Step 7 • Industrial Utility</span>
            <h2 className="text-xl font-bold text-white mt-1">Side-by-Side Comparison: Old vs Improved Invention</h2>
            <p className="text-sm text-slate-400 mt-2">
              Patents require an invention to be "useful" (possess industrial utility). Compare the measurable agricultural and economic impact of your new proto the old system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Old Conventional System */}
            <div className="bg-slate-950 border border-rose-900/40 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-base">Conventional Timer Sprinkler</h4>
                <span className="text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded-full font-bold">
                  Existing Baseline
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Daily Water Consumption:</span>
                  <span className="font-bold text-rose-400 text-sm">850 Gallons / Day</span>
                </div>
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Rain / Wet Weather Response:</span>
                  <span className="font-bold text-rose-400 text-sm">Continues Spraying</span>
                </div>
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Crop Health & Yield:</span>
                  <span className="font-bold text-rose-400 text-sm">Root Rot (24% crop loss)</span>
                </div>
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Monthly Utility Expense:</span>
                  <span className="font-bold text-rose-400 text-sm">$240 / Month</span>
                </div>
              </div>
            </div>

            {/* New Patented Invention */}
            <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-base">Smart Sensor-Valve Invention</h4>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
                  New Technical Invention
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Daily Water Consumption:</span>
                  <span className="font-bold text-emerald-400 text-sm">170 Gallons (80% Saved)</span>
                </div>
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Rain / Wet Weather Response:</span>
                  <span className="font-bold text-emerald-400 text-sm">Autonomous Cut-Off</span>
                </div>
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Crop Health & Yield:</span>
                  <span className="font-bold text-emerald-400 text-sm">Optimal Roots (+35% yield)</span>
                </div>
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Monthly Utility Expense:</span>
                  <span className="font-bold text-emerald-400 text-sm">$45 / Month</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200">
            <span className="font-bold text-amber-400 block mb-0.5">💡 Industrial Applicability Established:</span>
            Your proto concrete, tangible economic and technical utility. It solves a real-world problem with measurable technical parameters.
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => advanceTo('8_technical_features', 8)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <span>Inspect Patent Criteria</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 8: INSPECT INVENTION'S TECHNICAL FEATURES */}
      {currentStep === '8_technical_features' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Step 8 • Statutory Requirements</span>
                <h2 className="text-xl font-bold text-white mt-1">The 3 Pillars of Patentability & Brand Distinction</h2>
              </div>
              <span className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 px-3 py-1 rounded-full font-medium">
                {Object.values(pillarsChecked).filter(Boolean).length} / 4 Verified
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              For an invention to be granted a patent, it must satisfy three universal statutory requirements, and remain distinct from trademarks. Check each pillar:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pillar 1: Novelty */}
            <div 
              onClick={() => {
                soundFx.playClick();
                setPillarsChecked(prev => ({ ...prev, novelty: true }));
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                pillarsChecked.novelty
                  ? 'bg-emerald-950/30 border-emerald-500'
                  : 'bg-slate-800/80 border-slate-700 hover:border-amber-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Pillar 1</span>
                {pillarsChecked.novelty && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <h4 className="font-bold text-white text-base mt-1">Novelty (New in the World)</h4>
              <p className="text-xs text-slate-300 mt-2">
                No single prior art publication or product anywhere in the world disclosed this specific autonomous capacitive probe-to-solenoid feedback arrangement before our filing date.
              </p>
              <span className="inline-block mt-3 text-[11px] text-emerald-400 font-semibold">
                {pillarsChecked.novelty ? '✓ Prior art search passed: 100% Novel' : 'Click to verify Novelty'}
              </span>
            </div>

            {/* Pillar 2: Inventive Step */}
            <div 
              onClick={() => {
                soundFx.playClick();
                setPillarsChecked(prev => ({ ...prev, inventiveStep: true }));
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                pillarsChecked.inventiveStep
                  ? 'bg-emerald-950/30 border-emerald-500'
                  : 'bg-slate-800/80 border-slate-700 hover:border-amber-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Pillar 2</span>
                {pillarsChecked.inventiveStep && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <h4 className="font-bold text-white text-base mt-1">Inventive Step (Non-Obviousness)</h4>
              <p className="text-xs text-slate-300 mt-2">
                The technical solution is NOT obvious to an ordinary person skilled in irrigation mechanics. It represents a non-trivial engineering leap beyond routine modifications.
              </p>
              <span className="inline-block mt-3 text-[11px] text-emerald-400 font-semibold">
                {pillarsChecked.inventiveStep ? '✓ Non-obviousness criteria satisfied' : 'Click to verify Inventive Step'}
              </span>
            </div>

            {/* Pillar 3: Industrial Applicability */}
            <div 
              onClick={() => {
                soundFx.playClick();
                setPillarsChecked(prev => ({ ...prev, utility: true }));
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                pillarsChecked.utility
                  ? 'bg-emerald-950/30 border-emerald-500'
                  : 'bg-slate-800/80 border-slate-700 hover:border-amber-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Pillar 3</span>
                {pillarsChecked.utility && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <h4 className="font-bold text-white text-base mt-1">Industrial Applicability (Utility)</h4>
              <p className="text-xs text-slate-300 mt-2">
                The invention is practically feasible to manufacture and has concrete, repeatable utility in commercial farming, greenhouse operations, and municipal landscaping.
              </p>
              <span className="inline-block mt-3 text-[11px] text-emerald-400 font-semibold">
                {pillarsChecked.utility ? '✓ Agricultural utility proven' : 'Click to verify Utility'}
              </span>
            </div>

            {/* Pillar 4: Distinction from Brand Name */}
            <div 
              onClick={() => {
                soundFx.playClick();
                setPillarsChecked(prev => ({ ...prev, distinctFromBrand: true }));
              }}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                pillarsChecked.distinctFromBrand
                  ? 'bg-emerald-950/30 border-emerald-500'
                  : 'bg-slate-800/80 border-slate-700 hover:border-amber-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Legal Boundary</span>
                {pillarsChecked.distinctFromBrand && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <h4 className="font-bold text-white text-base mt-1">Invention vs Brand Distinction</h4>
              <p className="text-xs text-slate-300 mt-2">
                The technical machine itself is protected by Patent. The catchy brand name "AquaSmart" or logo printed on the box is protected by TRADEMARK, not Patent
              </p>
              <span className="inline-block mt-3 text-[11px] text-emerald-400 font-semibold">
                {pillarsChecked.distinctFromBrand ? '✓ IP boundary clearly mastered' : 'Click to verify Boundary'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Verify all 4 criteria to consult the IP mentor.
            </span>
            <button
              disabled={!Object.values(pillarsChecked).every(Boolean)}
              onClick={() => advanceTo('9_mentor_explanation', 9)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                Object.values(pillarsChecked).every(Boolean)
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-lg shadow-amber-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Visit IP Mentor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 9: VISIT AN IP MENTOR WHO EXPLAINS PATENT PROTECTION */}
      {currentStep === '9_mentor_explanation' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Step 9 • Patent Council Consultation</span>
            <h2 className="text-xl font-bold text-white mt-1">Consultation with IP Mentor Dr. Elena</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mentor Persona Card */}
            <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-5 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-4xl shadow-inner mb-3">
                👩‍⚖️
              </div>
              <h3 className="font-bold text-white">Dr. Elena Vance</h3>
              <p className="text-xs text-amber-400 font-medium">Patent Examiner & IP Attorney</p>

              <div className="bg-slate-900/90 rounded-xl p-3.5 mt-4 text-xs text-slate-300 text-left w-full space-y-2 border border-slate-800">
                <span className="font-bold text-amber-300 block">The Patent "Grand Bargain":</span>
                <p>
                  "A patent is a contract between the inventor and society. Society grants you a 20-year legal monopoly to exclude others from copying your machine."
                </p>
                <p>
                  "In return, you MUST publicly publish full blueprints and specifications so humanity can learn from it and build on it once the 20 years expire!"
                </p>
              </div>
            </div>

            {/* Mentor Interactive Dialogue Progression */}
            <div className="md:col-span-2 bg-slate-950/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div className="space-y-4">
                <h4 className="font-bold text-white text-sm">Key Legal Lessons with Dr. Elena:</h4>

                <div 
                  onClick={() => { soundFx.playClick(); setMentorDialogStep(1); }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    mentorDialogStep >= 1 ? 'bg-slate-900 border-amber-500/50' : 'bg-slate-900/40 border-slate-800'
                  }`}
                >
                  <span className="text-xs font-bold text-amber-400 block">Lesson 1: Why Ideas Alone Cannot Be Patented</span>
                  <p className="text-xs text-slate-300 mt-1">
                    If someone says, "I have an idea for a teleporter," they cannot patent it. The law requires <em>enablement</em>: a concrete technical description allowing an expert to actually construct it.
                  </p>
                </div>

                <div 
                  onClick={() => { soundFx.playClick(); setMentorDialogStep(2); }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    mentorDialogStep >= 2 ? 'bg-slate-900 border-amber-500/50' : 'bg-slate-900/40 border-slate-800'
                  }`}
                >
                  <span className="text-xs font-bold text-amber-400 block">Lesson 2: Commercial Value & Infringement Defense</span>
                  <p className="text-xs text-slate-300 mt-1">
                    With a granted patent, if a rival agricultural corporation copies your sensor-valve mechanism without a license, you can demand royalties or obtain a federal court injunction.
                  </p>
                </div>

                <div 
                  onClick={() => { soundFx.playClick(); setMentorDialogStep(3); }}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    mentorDialogStep >= 3 ? 'bg-slate-900 border-amber-500/50' : 'bg-slate-900/40 border-slate-800'
                  }`}
                >
                  <span className="text-xs font-bold text-amber-400 block">Lesson 3: The 20-Year Term & Public Domain</span>
                  <p className="text-xs text-slate-300 mt-1">
                    Patents do not last forever (unlike trade secrets or renewable trademarks). After 20 years from the filing date, the invention enters the public domain for all farmers freely.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {mentorDialogStep >= 3 ? '✓ Consultation complete!' : 'Click through all 3 lessons to continue.'}
                </span>
                <button
                  disabled={mentorDialogStep < 3}
                  onClick={() => advanceTo('10_patent_challenge', 10)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                    mentorDialogStep >= 3
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-lg shadow-amber-500/25'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>Complete Final Patent Challenge</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 10: COMPLETE FINAL PRACTICAL CHALLENGE & RECEIVE PATENT */}
      {currentStep === '10_patent_challenge' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Step 10 • Final Practical Challenge</span>
            <h2 className="text-xl font-bold text-white mt-1">Patent Application: Draft the Protection Claim</h2>
            <p className="text-sm text-slate-400 mt-2">
              To complete the mission and protect Farmer Ramesh's invention from copycat syndicates, you must select the correct technical patent claim and verify the enablement specification.
            </p>
          </div>

          {!patentGranted ? (
            <div className="space-y-6">
              {/* Claim Formulation Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 block">
                  Task 1: Select the Valid Independent Patent Claim:
                </label>
                
                <div 
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedClaimType('abstract');
                  }}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedClaimType === 'abstract'
                      ? 'border-rose-500 bg-rose-950/20 text-rose-200'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="font-bold block text-sm">Option A: "A method to save farm water by wanting soil to stay healthy."</span>
                  <p className="mt-1">
                    Abstract wish. Lacks concrete physical apparatus or technical steps. (Rejected under 35 U.S.C. § 101).
                  </p>
                </div>

                <div 
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedClaimType('brand');
                  }}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedClaimType === 'brand'
                      ? 'border-rose-500 bg-rose-950/20 text-rose-200'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="font-bold block text-sm">Option B: "The distinctive brand name 'AquaSmart' and green droplet logo for farm tools."</span>
                  <p className="mt-1">
                    Incorrect IP category. Brand names and logos are trademarks, not patents
                  </p>
                </div>

                <div 
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedClaimType('valid_technical');
                  }}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedClaimType === 'valid_technical'
                      ? 'border-emerald-500 bg-emerald-950/30 text-emerald-200 shadow-lg shadow-emerald-500/20'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="font-bold block text-sm text-white">
                    Option C: "An autonomous irrigation apparatus comprising a capacitive soil moisture probe operatively connected to a microcontroller configured to actuate an electromechanical solenoid valve upon reaching threshold volumetric water content."
                  </span>
                  <p className="mt-1 text-emerald-400">
                    ✓ Valid technical claim Explicitly defines the concrete physical apparatus and technical interplay.
                  </p>
                </div>
              </div>

              {/* Task 2: Enablement Verification Checkbox */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <label className="flex items-center gap-3 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={enablementVerified}
                    onChange={(e) => {
                      soundFx.playClick();
                      setEnablementVerified(e.target.checked);
                    }}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                  />
                  <span>
                    <strong>Enablement Specification Verified:</strong> Blueprints, wiring schematics, and microcode logic are fully documented in the public disclosure filing.
                  </span>
                </label>
              </div>

              {/* Submit Application Button */}
              <div className="flex justify-end pt-2">
                <button
                  disabled={selectedClaimType !== 'valid_technical' || !enablementVerified}
                  onClick={() => {
                    soundFx.playSuccess();
                    confetti({ particleCount: 90, spread: 80 });
                    setPatentGranted(true);
                  }}
                  className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 ${
                    selectedClaimType === 'valid_technical' && enablementVerified
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-xl shadow-amber-500/30 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>Submit to National Patent Office</span>
                </button>
              </div>
            </div>
          ) : (
            /* Granted Patent Certificate Display */
            <div className="bg-gradient-to-b from-amber-950/40 via-slate-950 to-slate-900 border-2 border-amber-500/80 rounded-2xl p-6 text-center space-y-5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />
              
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 mx-auto flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30">
                📜
              </div>

              <div>
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest block">
                  Official Letters Patent Granted
                </span>
                <h3 className="text-2xl font-black text-white tracking-tight mt-1">
                  Patent Grant No. IN-2026-PAT-8812
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Title: <em>Autonomous Soil-Responsive HydroValve Irrigation System</em>
                </p>
              </div>

              <div className="max-w-md mx-auto bg-slate-900/90 rounded-xl p-4 border border-amber-500/30 text-xs text-slate-300 text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Primary Inventor:</span>
                  <span className="font-bold text-white">Student Inventor & Ramesh</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Statutory Duration:</span>
                  <span className="font-bold text-amber-400">20 Years from Filing</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Legal Protection:</span>
                  <span className="font-bold text-emerald-400">Exclusive Right to Make & Sell</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Water Conservation:</span>
                  <span className="font-bold text-cyan-400">80% Water Waste Eliminated</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap justify-center gap-3">
                <button
                  onClick={() => {
                    soundFx.playLevelUp();
                    onComplete(200, 50, 3, 'patent');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-emerald-500/30 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Claim Mission Rewards & Return to Map</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
