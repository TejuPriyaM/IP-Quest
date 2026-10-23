import React, { useState } from 'react';
import { soundFx } from '../../utils/sound';
import { 
  ShieldCheck, Store, CheckCircle2, AlertCircle, ArrowRight, Sparkles, Scale, 
  Sliders, Users, Check, Clock, Search, FileText, Ban, Layers, HelpCircle, 
  Building, ArrowLeft, Eye, Award, Palette, ShoppingBag, MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const BrandCityGame = ({ onComplete, onBack, onOpenTutorial, onSwitchTo3D, onSwitchToQuick }) => {
  const [currentStep, setCurrentStep] = useState('1_explore_street');
  const [progressCount, setProgressCount] = useState(1);

  // STEP 1: Street Exploration
  const [streetExplored, setStreetExplored] = useState(false);

  // STEP 2: Shop Visits
  const [visitedShopOriginal, setVisitedShopOriginal] = useState(false);
  const [visitedShopCopycat, setVisitedShopCopycat] = useState(false);

  // STEP 3: Inspection Checklist
  const [inspectedSigns, setInspectedSigns] = useState({
    names: false,
    logos: false,
    cups: false
  });

  // STEP 4: Scripted NPC Interactions
  const [npcSarahInteracted, setNpcSarahInteracted] = useState(false);
  const [npcMarcusInteracted, setNpcMarcusInteracted] = useState(false);

  // STEP 5: Distinctiveness Design (Abercrombie Spectrum)
  const [selectedNameTier, setSelectedNameTier] = useState('arbitrary');
  const [brandName, setBrandName] = useState('CitroVibe');
  const [selectedLogoEmblem, setSelectedLogoEmblem] = useState('⚡');

  // STEP 6: Customization
  const [selectedColorTheme, setSelectedColorTheme] = useState({
    name: 'Electric Tangerine & Deep Cobalt',
    primary: 'from-amber-500 to-orange-600',
    accent: '#f97316',
    bgClass: 'bg-orange-500'
  });

  // STEP 7: Storefront Applied
  const [storefrontApplied, setStorefrontApplied] = useState(false);

  // STEP 8: New Responses
  const [npcResponseAudited, setNpcResponseAudited] = useState(false);

  // STEP 9: Mentor Dialogue
  const [mentorConsulted, setMentorConsulted] = useState(false);

  // STEP 10: Final Challenge
  const [challengeAnswers, setChallengeAnswers] = useState({});
  const [trademarkRegistered, setTrademarkRegistered] = useState(false);

  const STEPS_LIST = [
    { id: '1_explore_street', title: '1. Commercial Street', num: 1 },
    { id: '2_visit_shops', title: '2. Visit Shops', num: 2 },
    { id: '3_inspect_branding', title: '3. Inspect Signs', num: 3 },
    { id: '4_observe_confusion', title: '4. Customer Confusion', num: 4 },
    { id: '5_design_brand', title: '5. Distinctive Name', num: 5 },
    { id: '6_customize_signage', title: '6. Colors & Signage', num: 6 },
    { id: '7_apply_storefront', title: '7. Apply to Storefront', num: 7 },
    { id: '8_observe_responses', title: '8. Street Reaction', num: 8 },
    { id: '9_mentor_explanation', title: '9. IP Mentor', num: 9 },
    { id: '10_brand_challenge', title: '10. Register Trademark', num: 10 }
  ];

  const advanceTo = (next, nextNum) => {
    soundFx.playSuccess();
    setCurrentStep(next);
    setProgressCount(Math.max(progressCount, nextNum));
  };

  const ABERCROMBIE_TIERS = [
    {
      id: 'generic',
      tier: 'Generic (0% Protection)',
      nameOption: 'The Juice Shop',
      protectable: false,
      desc: 'The common noun for the product. Cannot be trademarked because competitors must be able to describe their business.',
      color: 'border-rose-500/40 text-rose-300'
    },
    {
      id: 'descriptive',
      tier: 'Descriptive (Weak Protection)',
      nameOption: 'Cold Pressed Fruit Drinks',
      protectable: false,
      desc: 'Merely describes the ingredients or process. Cannot be monopolized without proving extensive secondary meaning.',
      color: 'border-amber-500/40 text-amber-300'
    },
    {
      id: 'suggestive',
      tier: 'Suggestive (Moderate Protection)',
      nameOption: 'VitaBurst',
      protectable: true,
      desc: 'Suggests vitality and citrus burst without directly describing the physical juice. Requires consumer imagination.',
      color: 'border-cyan-500/40 text-cyan-300'
    },
    {
      id: 'arbitrary',
      tier: 'Arbitrary / Fanciful (Highest Protection)',
      nameOption: 'CitroVibe™ / Solaris Elixir™',
      protectable: true,
      desc: 'Invented or arbitrary coined term. Strongest legal trademark protection Immediately distinguishes commercial origin.',
      color: 'border-emerald-500/60 text-emerald-300'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { soundFx.playClick(); onBack(); }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Return to World Map"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Brand City Mission
                </span>
                <span className="text-xs text-slate-400">Trademarks & Commercial Distinctiveness</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight mt-0.5">
                Build a Distinctive Brand
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
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Walk through Brand City in full 3D!"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>🌐 3D Facility</span>
              </button>
            )}

            {onOpenTutorial && (
              <button
                onClick={() => { soundFx.playClick(); onOpenTutorial(); }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Trademark Guide
              </button>
            )}

            {/* Clear Student Inventor Face Display */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/40 shadow-md">
              <div className="w-8 h-8 rounded-full bg-gradient-to-b from-sky-400 to-indigo-600 border border-emerald-400 overflow-hidden shadow-inner flex items-center justify-center shrink-0">
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
                <span className="text-[9px] text-emerald-400 font-bold block leading-none">INVENTOR</span>
                <span className="text-xs font-black text-white leading-tight">Student</span>
              </div>
            </div>

            {/* Right-Top Steps Indicator */}
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/60 text-emerald-300 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/10">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Step {STEPS_LIST.find(s => s.id === currentStep)?.num || 1} of 10</span>
            </div>
          </div>
        </div>

        {/* Active Step & Next Step Progression Strip (Completed steps are hidden) */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Step:</span>
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step {STEPS_LIST.find(s => s.id === currentStep)?.num || 1}: {STEPS_LIST.find(s => s.id === currentStep)?.title.split('. ')[1]}</span>
            </div>
          </div>

          {(() => {
            const currentNum = STEPS_LIST.find(s => s.id === currentStep)?.num || 1;
            const nextStep = STEPS_LIST.find(s => s.num === currentNum + 1);
            if (!nextStep) {
              return (
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  🏆 Final Step of Brand City
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
                  className="px-3 py-1.5 rounded-xl bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-300 border border-emerald-400/60 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
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

      {/* STEP 1: EXPLORE THE COMMERCIAL STREET */}
      {currentStep === '1_explore_street' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 1 • Commercial Avenue</span>
                <h2 className="text-xl font-bold text-white mt-1">Explore Brand City's Busy Market Street</h2>
              </div>
              <span className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1 rounded-full font-medium">
                High Street Retail District
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Entrepreneur Priya opened a fresh organic juice bar called <em>"Zest & Bloom"</em>. But last week, an opportunistic copycat opened <em>"Best & Bloom"</em> three doors down, using almost identical colors and font Customers are constantly confused.
            </p>
          </div>

          {/* Interactive Commercial Street Scene Visual */}
          <div className="relative rounded-2xl bg-gradient-to-r from-slate-950 via-emerald-950/20 to-slate-950 border border-slate-800 p-6 min-h-[300px] flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Store className="w-4 h-4" /> Market Street Avenue
              </span>
              <span className="bg-rose-950/60 text-rose-300 border border-rose-800/40 px-2.5 py-1 rounded-md text-xs font-semibold">
                ⚠️ Consumer Confusion Index: 88%
              </span>
            </div>

            {/* Street Animation & Storefronts Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
              <div className="p-4 bg-slate-900/90 rounded-xl border border-emerald-900/40">
                <span className="text-2xl">🏪</span>
                <h4 className="font-bold text-white text-sm mt-2">Shop A: Zest & Bloom (Original)</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Priya's original craft juice shop. Green awning, fruit splash logo.
                </p>
              </div>

              <div className="p-4 bg-slate-900/90 rounded-xl border border-rose-900/40">
                <span className="text-2xl">🏬</span>
                <h4 className="font-bold text-white text-sm mt-2">Shop B: Best & Bloom (Confusing Copycat)</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Copycat store with nearly identical cursive font, green awning, and citrus emblem.
                </p>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between text-xs">
              <span className="text-slate-300">
                Walk through the street to visit both storefronts and inspect the source of confusion.
              </span>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setStreetExplored(true);
                  advanceTo('2_visit_shops', 2);
                }}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/25"
              >
                <span>Visit Both Shops</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: VISIT BOTH FICTIONAL SHOPS */}
      {currentStep === '2_visit_shops' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 2 • On-Site Storefront Visits</span>
            <h2 className="text-xl font-bold text-white mt-1">Visit Both Fictional Shops</h2>
            <p className="text-sm text-slate-400 mt-2">
              Visit Priya's authentic juice bar and the copycat shop next door. Experience firsthand why passersby struggle to identify the commercial source:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Shop 1: Original */}
            <div 
              onClick={() => {
                soundFx.playClick();
                setVisitedShopOriginal(true);
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                visitedShopOriginal ? 'bg-emerald-950/30 border-emerald-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-bold text-white text-sm">Shop 1: "Zest & Bloom Fresh Juices"</span>
                {visitedShopOriginal && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <div className="my-4 p-4 bg-emerald-900/20 rounded-xl border border-emerald-800/40 text-center">
                <div className="text-3xl mb-1">🍊</div>
                <div className="font-serif italic text-emerald-300 font-bold">Zest & Bloom</div>
                <div className="text-[10px] text-emerald-400 tracking-widest uppercase">Pure Cold-Pressed Craft</div>
              </div>
              <p className="text-xs text-slate-300">
                Founder Priya: "I spent 3 years perfecting cold-pressed immunity recipes. But now half my regulars are accidentally walking into the copycat store!"
              </p>
              <span className="text-[11px] text-emerald-400 font-bold block mt-3">
                {visitedShopOriginal ? '✓ Visited Original Shop' : 'Click to inspect Priya\'s shop'}
              </span>
            </div>

            {/* Shop 2: Copycat */}
            <div 
              onClick={() => {
                soundFx.playClick();
                setVisitedShopCopycat(true);
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                visitedShopCopycat ? 'bg-rose-950/30 border-rose-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-bold text-white text-sm">Shop 2: "Best & Bloom Fresh Juice Bar"</span>
                {visitedShopCopycat && <CheckCircle2 className="w-4 h-4 text-rose-400" />}
              </div>
              <div className="my-4 p-4 bg-rose-900/20 rounded-xl border border-rose-800/40 text-center">
                <div className="text-3xl mb-1">🍋</div>
                <div className="font-serif italic text-rose-300 font-bold">Best & Bloom</div>
                <div className="text-[10px] text-rose-400 tracking-widest uppercase">Pure Cold-Pressed Juice Bar</div>
              </div>
              <p className="text-xs text-slate-300">
                Copycat Owner: "Hey, 'Bloom' is just a normal flower word, and 'Best' rhymes with 'Zest' Why shouldn't I use it if people think we're the same shop?"
              </p>
              <span className="text-[11px] text-rose-400 font-bold block mt-3">
                {visitedShopCopycat ? '✓ Visited Copycat Shop' : 'Click to inspect copycat shop'}
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              disabled={(visitedShopOriginal && visitedShopCopycat)}
              onClick={() => advanceTo('3_inspect_branding', 3)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                visitedShopOriginal && visitedShopCopycat
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-lg shadow-emerald-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Inspect Branding Assets</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: INSPECT NAMES, LOGOS, PACKAGING AND SIGNS */}
      {currentStep === '3_inspect_branding' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 3 • Brand Asset Audit</span>
                <h2 className="text-xl font-bold text-white mt-1">Inspect Names, Logos, Packaging & Signs</h2>
              </div>
              <span className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-3 py-1 rounded-full font-medium">
                {Object.values(inspectedSigns).filter(Boolean).length} / 3 Inspected
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Click to examine each brand touchpoint. Notice how phonetic sound, visual logo appearance, and packaging trade dress create severe commercial confusion:
            </p>
          </div>

          <div className="space-y-3">
            <div 
              onClick={() => {
                soundFx.playClick();
                setInspectedSigns(prev => ({ ...prev, names: true }));
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                inspectedSigns.names ? 'bg-emerald-950/30 border-emerald-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">1. Name & Phonetic Similarity: "Zest & Bloom" vs "Best & Bloom"</span>
                {inspectedSigns.names && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                A difference of only one rhyming letter ('Z' vs 'B'). When spoken aloud in a noisy street ("Meet me at Zest & Bloom"), customers constantly mishear and end up at the copycat
              </p>
            </div>

            <div 
              onClick={() => {
                soundFx.playClick();
                setInspectedSigns(prev => ({ ...prev, logos: true }));
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                inspectedSigns.logos ? 'bg-emerald-950/30 border-emerald-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">2. Logo Emblem & Visual Silhouette</span>
                {inspectedSigns.logos && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Both use a circular citrus slice with two green leaves on top. From 20 feet away on the sidewalk, the two emblems look identical to ordinary shoppers.
              </p>
            </div>

            <div 
              onClick={() => {
                soundFx.playClick();
                setInspectedSigns(prev => ({ ...prev, cups: true }));
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                inspectedSigns.cups ? 'bg-emerald-950/30 border-emerald-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">3. Cup Packaging & Trade Dress</span>
                {inspectedSigns.cups && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Clear plastic 16oz cups with green craft paper sleeves and matching straw colors. Consumers have no visual cue to know they are holding a different merchant's cup.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Audit all 3 branding elements to observe real customer confusion.
            </span>
            <button
              disabled={!Object.values(inspectedSigns).every(Boolean)}
              onClick={() => advanceTo('4_observe_confusion', 4)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                Object.values(inspectedSigns).every(Boolean)
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-lg shadow-emerald-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Observe Customer Confusion</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: OBSERVE CUSTOMER CONFUSION THROUGH SCRIPTED NPC INTERACTIONS */}
      {currentStep === '4_observe_confusion' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 4 • Market Impact</span>
            <h2 className="text-xl font-bold text-white mt-1">Observe Customer Confusion Through Scripted NPCs</h2>
            <p className="text-sm text-slate-400 mt-2">
              Interact with local shoppers on the street. Witness how the confusingly similar branding harms both consumers and Priya's business reputation:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* NPC Sarah */}
            <div 
              onClick={() => {
                soundFx.playClick();
                setNpcSarahInteracted(true);
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                npcSarahInteracted ? 'bg-slate-950 border-emerald-500/60' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-2xl">
                  👩‍💼
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Customer Sarah</h4>
                  <span className="text-[11px] text-slate-400">Regular Buyer</span>
                </div>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl text-xs text-slate-300 space-y-2 border border-slate-800">
                <p>
                  "I meant to buy Priya's famous Ginger Boost, but I walked under the green awning that said 'Best & Bloom' by mistake!"
                </p>
                <p className="text-rose-400 font-medium">
                  "The drink tasted watered-down and sour. I thought Priya had ruined her recipe and I was ready to stop coming here!"
                </p>
              </div>
              <span className="text-[11px] text-emerald-400 font-bold block mt-3">
                {npcSarahInteracted ? '✓ Sarah\'s confusion logged' : 'Click to talk with Sarah'}
              </span>
            </div>

            {/* NPC Marcus */}
            <div 
              onClick={() => {
                soundFx.playClick();
                setNpcMarcusInteracted(true);
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                npcMarcusInteracted ? 'bg-slate-950 border-emerald-500/60' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-2xl">
                  👨‍💻
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Reviewer Marcus</h4>
                  <span className="text-[11px] text-slate-400">Food Blogger</span>
                </div>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl text-xs text-slate-300 space-y-2 border border-slate-800">
                <p>
                  "I was checking in on social media to tag Priya's shop for a 5-star review, but the search results showed 'Best & Bloom' right at the top."
                </p>
                <p className="text-rose-400 font-medium">
                  "I accidentally tagged the copycat shop Now 10,000 of my followers are being directed to the wrong merchant."
                </p>
              </div>
              <span className="text-[11px] text-emerald-400 font-bold block mt-3">
                {npcMarcusInteracted ? '✓ Marcus\'s review error logged' : 'Click to talk with Marcus'}
              </span>
            </div>
          </div>

          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-200">
            <span className="font-bold text-emerald-300 block mb-1">⚖️ Legal Definition: Likelihood of Confusion</span>
            When an ordinary consumer is likely to be deceived into buying from a different business thinking it is the original source, trademark infringement occurs. Distinctiveness is required
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-800">
            <button
              disabled={(npcSarahInteracted && npcMarcusInteracted)}
              onClick={() => advanceTo('5_design_brand', 5)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                npcSarahInteracted && npcMarcusInteracted
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-lg shadow-emerald-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Design a Distinctive Brand</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: DESIGN A DISTINCTIVE BUSINESS NAME AND LOGO (ABERCROMBIE) */}
      {currentStep === '5_design_brand' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 5 • The Abercrombie Spectrum</span>
            <h2 className="text-xl font-bold text-white mt-1">Design a Distinctive Business Name & Logo</h2>
            <p className="text-sm text-slate-400 mt-2">
              Trademark law uses the <em>Abercrombie Spectrum</em> to measure distinctiveness. Generic words have zero protection; fanciful, coined, and arbitrary names receive the highest protection
            </p>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-300 block">
              Select a Brand Name Tier on the Distinctiveness Spectrum:
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {ABERCROMBIE_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedNameTier(tier.id);
                    if (tier.id === 'arbitrary') setBrandName('CitroVibe');
                    else if (tier.id === 'suggestive') setBrandName('VitaBurst');
                    else setBrandName(tier.nameOption);
                  }}
                  className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                    selectedNameTier === tier.id
                      ? 'bg-emerald-950/40 border-emerald-400 shadow-md'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{tier.tier}</span>
                    {selectedNameTier === tier.id && <Check className="w-4 h-4 text-emerald-400" />}
                  </div>
                  <div className="text-emerald-300 font-bold my-1 text-sm font-mono">"{tier.nameOption}"</div>
                  <p className="text-slate-400">{tier.desc}</p>
                </div>
              ))}
            </div>

            {/* Logo Emblem Selection */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-300 block">
                Select a Unique Logo Emblem (Avoid ordinary circular lemon slices):
              </span>
              <div className="flex gap-4">
                {[
                  { symbol: '⚡', label: 'Electric Energy Bolt' },
                  { symbol: '🦚', label: 'Vibrant Peacock Crown' },
                  { symbol: '💎', label: 'Prism Crystal Drop' },
                  { symbol: '🚀', label: 'Cosmic Burst' }
                ].map((emblem) => (
                  <button
                    key={emblem.symbol}
                    onClick={() => {
                      soundFx.playClick();
                      setSelectedLogoEmblem(emblem.symbol);
                    }}
                    className={`flex-1 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedLogoEmblem === emblem.symbol
                        ? 'bg-emerald-500/20 border-emerald-400 text-white shadow-md'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-3xl mb-1">{emblem.symbol}</div>
                    <span className="text-[11px] font-bold block">{emblem.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              disabled={selectedNameTier !== 'arbitrary' && selectedNameTier !== 'suggestive'}
              onClick={() => advanceTo('6_customize_signage', 6)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                selectedNameTier === 'arbitrary' || selectedNameTier === 'suggestive'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 cursor-pointer shadow-lg shadow-emerald-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Customize Colors & Signage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: CUSTOMIZE COLORS AND SIGNAGE */}
      {currentStep === '6_customize_signage' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 6 • Visual Brand Identity</span>
            <h2 className="text-xl font-bold text-white mt-1">Customize Storefront Colors & Cup Packaging</h2>
            <p className="text-sm text-slate-400 mt-2">
              Differentiate Priya's shop from the copycat's dull green awning. Choose a bold, unmistakable visual theme:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                name: 'Electric Tangerine & Deep Cobalt',
                primary: 'from-orange-500 to-amber-500',
                accent: '#f97316',
                bgClass: 'bg-orange-500',
                desc: 'High contrast, bright citrus energy that pops across the avenue.'
              },
              {
                name: 'Radiant Orchid & Sunset Gold',
                primary: 'from-purple-600 to-pink-500',
                accent: '#a855f7',
                bgClass: 'bg-purple-600',
                desc: 'Premium organic luxury tone. Completely distinct from generic green.'
              },
              {
                name: 'Neon Teal & Electric Coral',
                primary: 'from-teal-400 to-cyan-500',
                accent: '#14b8a6',
                bgClass: 'bg-teal-500',
                desc: 'Modern coastal freshness with striking geometric presence.'
              }
            ].map((theme) => (
              <div
                key={theme.name}
                onClick={() => {
                  soundFx.playClick();
                  setSelectedColorTheme(theme);
                }}
                className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedColorTheme.name === theme.name
                    ? 'bg-emerald-950/30 border-emerald-400 shadow-md'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className={`h-12 rounded-lg bg-gradient-to-r ${theme.primary} mb-3 shadow-inner`} />
                <h4 className="font-bold text-white text-sm">{theme.name}</h4>
                <p className="text-slate-400 mt-1">{theme.desc}</p>
                {selectedColorTheme.name === theme.name && (
                  <span className="text-emerald-400 font-bold block mt-2">✓ Selected Palette</span>
                )}
              </div>
            ))}
          </div>

          {/* Live Preview of Signboard & Cup */}
          <div className="p-5 bg-slate-950 rounded-xl border border-slate-800 flex flex-wrap items-center justify-around gap-6 text-center">
            <div>
              <span className="text-xs text-slate-400 block mb-2">Neon Signboard Preview:</span>
              <div className={`px-6 py-3 rounded-xl bg-gradient-to-r ${selectedColorTheme.primary} text-slate-950 font-black text-lg tracking-wider shadow-lg flex items-center gap-2`}>
                <span className="text-2xl">{selectedLogoEmblem}</span>
                <span>{brandName}™</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400 block mb-2">Juice Cup Trade Dress:</span>
              <div className="w-20 h-28 mx-auto bg-slate-900 border-2 border-slate-700 rounded-b-2xl rounded-t-sm flex flex-col items-center justify-center p-2 shadow-md relative">
                <div className="text-2xl mb-1">{selectedLogoEmblem}</div>
                <div className="text-[10px] font-black text-white">{brandName}</div>
                <div className="w-1.5 h-16 bg-amber-400/80 -top-6 absolute rounded-full" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              onClick={() => advanceTo('7_apply_storefront', 7)}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/25"
            >
              <span>Apply to Storefront (Visible Update)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: APPLY NEW BRANDING TO THE STOREFRONT (VISIBLE UPDATE) */}
      {currentStep === '7_apply_storefront' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 7 • Physical Storefront Deployment</span>
            <h2 className="text-xl font-bold text-white mt-1">Live Storefront Transformation</h2>
            <p className="text-sm text-slate-400 mt-2">
              Watch Priya's storefront visibly transform on the commercial street. The new distinctive name, neon emblem, and customized awning replace the confusing old signage:
            </p>
          </div>

          {/* Interactive Transformed Storefront View */}
          <div className="relative rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-emerald-500/60 p-6 text-center space-y-6 shadow-2xl overflow-hidden">
            <div className={`p-6 rounded-2xl bg-gradient-to-r ${selectedColorTheme.primary} text-slate-950 shadow-2xl flex flex-col items-center justify-center border-4 border-slate-900/40 max-w-lg mx-auto`}>
              <div className="text-5xl mb-2 drop-shadow-md">{selectedLogoEmblem}</div>
              <h3 className="text-3xl font-black tracking-tight">{brandName}™</h3>
              <p className="text-xs font-bold tracking-widest uppercase mt-1 opacity-90">
                Cold-Pressed Vitality Bar
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 max-w-2xl mx-auto">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-1">✓ No More Copycat Match:</span>
                "Best & Bloom" looks nothing like {brandName}.
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-1">✓ Instant Recognition:</span>
                The {selectedLogoEmblem} emblem is visible 100 yards away.
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-1">✓ Protectable Mark:</span>
                Qualifies for nationwide Trademark Office registration
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={() => {
                  soundFx.playSuccess();
                  setStorefrontApplied(true);
                  advanceTo('8_observe_responses', 8);
                }}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/25"
              >
                <span>Observe Customer Response Shift</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 8: WALK THROUGH THE STREET & OBSERVE CUSTOMER RESPONSES */}
      {currentStep === '8_observe_responses' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 8 • Market Resolution</span>
            <h2 className="text-xl font-bold text-white mt-1">Customer Reaction: Zero Confusion, Soaring Sales!</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-950 rounded-2xl border border-emerald-500/40 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-2xl">
                  👩‍💼
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Customer Sarah Returns</h4>
                  <span className="text-xs text-emerald-400 font-semibold">Delighted Shopper</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                "I spotted the bright new {brandName} storefront immediately I knew exactly where Priya was without mistaking that dull copycat shop next door. Got my cold ginger shot!"
              </p>
            </div>

            <div className="p-5 bg-slate-950 rounded-2xl border border-emerald-500/40 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-2xl">
                  👨‍💻
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Reviewer Marcus Updates Profile</h4>
                  <span className="text-xs text-emerald-400 font-semibold">Verified Food Critic</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                "Searching for {brandName} online was effortless Only one business profile exists with this name. All my followers are flocking to Priya's real shop."
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-300">
              Confusion rating dropped from <strong>88%</strong> down to <strong>0%</strong>
            </span>
            <button
              onClick={() => advanceTo('9_mentor_explanation', 9)}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/25"
            >
              <span>Consult Trademark Attorney</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 9: MEET AN IP MENTOR TO UNDERSTAND TRADEMARKS */}
      {currentStep === '9_mentor_explanation' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 9 • Legal Foundation</span>
            <h2 className="text-xl font-bold text-white mt-1">Consultation with Trademark Attorney Meera</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/70 border border-slate-700 rounded-2xl p-5 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-4xl shadow-inner mb-3">
                👩‍⚖️
              </div>
              <h3 className="font-bold text-white">Advocate Meera</h3>
              <p className="text-xs text-emerald-400 font-medium">Senior Trademark Counsel</p>

              <div className="bg-slate-900/90 rounded-xl p-3.5 mt-4 text-xs text-slate-300 text-left w-full space-y-2 border border-slate-800">
                <span className="font-bold text-emerald-300 block">The Commercial Purpose:</span>
                <p>
                  "A trademark is a commercial source identifier. Its primary mission is consumer protection: ensuring buyers know who manufactured the goods they trust."
                </p>
              </div>
            </div>

            <div className="md:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div className="space-y-4 text-xs">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="font-bold text-emerald-300 block mb-1">Difference between TM and ®:</span>
                  <p className="text-slate-300">
                    <strong>™ (Unregistered Trademark):</strong> Anyone can claim common-law rights simply by using a brand in commerce.
                    <br />
                    <strong>® (Registered Trademark):</strong> Officially registered with the national trademark office. Gives nationwide presumption of ownership and federal court jurisdiction.
                  </p>
                </div>

                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="font-bold text-emerald-300 block mb-1">Trademark vs Patent:</span>
                  <p className="text-slate-300">
                    A patent protects <em>how an invention technically works</em> (20 years). A trademark protects <em>brand identity and reputation</em> (can last forever as long as renewal fees are paid every 10 years).
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => advanceTo('10_brand_challenge', 10)}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/25"
                >
                  <span>Complete Trademark Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 10: COMPLETE FINAL BRAND-IDENTIFICATION CHALLENGE */}
      {currentStep === '10_brand_challenge' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Step 10 • Official Trademark Registration</span>
            <h2 className="text-xl font-bold text-white mt-1">Submit Application to the Trademark Registry</h2>
          </div>

          {!trademarkRegistered ? (
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-300 block">
                  Verify the Legal Registration Prongs:
                </label>

                {[
                  {
                    id: 'q1',
                    text: 'The brand name "CitroVibe" is inherently distinctive and NOT merely generic or descriptive.',
                    correct: true
                  },
                  {
                    id: 'q2',
                    text: 'A trademark protects brand identity and can last indefinitely with 10-year renewals.',
                    correct: true
                  },
                  {
                    id: 'q3',
                    text: 'Copying a competitor\'s confusingly similar name/logo violates trademark law by deceiving consumers.',
                    correct: true
                  }
                ].map((item) => (
                  <label key={item.id} className="flex items-center gap-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer text-xs text-slate-300 hover:border-slate-700">
                    <input
                      type="checkbox"
                      checked={!!challengeAnswers[item.id]}
                      onChange={(e) => {
                        soundFx.playClick();
                        setChallengeAnswers(prev => ({ ...prev, [item.id]: e.target.checked }));
                      }}
                      className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-400"
                    />
                    <span>{item.text}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  disabled={Object.values(challengeAnswers).filter(Boolean).length < 3}
                  onClick={() => {
                    soundFx.playSuccess();
                    confetti({ particleCount: 90, spread: 80 });
                    setTrademarkRegistered(true);
                  }}
                  className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 ${
                    Object.values(challengeAnswers).filter(Boolean).length >= 3
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-xl shadow-emerald-500/30 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  <span>Grant Official Registered Trademark (®)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-b from-emerald-950/40 via-slate-950 to-slate-900 border-2 border-emerald-500/80 rounded-2xl p-6 text-center space-y-5 shadow-2xl relative">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-400 mx-auto flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/30">
                ®
              </div>

              <div>
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest block">
                  Certificate of Trademark Registration
                </span>
                <h3 className="text-2xl font-black text-white tracking-tight mt-1">
                  Registration Mark: {brandName}®
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Nice Classification: Class 32 (Beverages & Fruit Juices)
                </p>
              </div>

              <div className="max-w-md mx-auto bg-slate-900/90 rounded-xl p-4 border border-emerald-500/30 text-xs text-slate-300 text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-400">Registered Owner:</span>
                  <span className="font-bold text-white">Priya & Student Brand Studio</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Trademark Duration:</span>
                  <span className="font-bold text-emerald-400">Perpetual (Renewable every 10 Years)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Protection Scope:</span>
                  <span className="font-bold text-teal-400">Exclusive Commercial Source Identifier</span>
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                <button
                  onClick={() => {
                    soundFx.playLevelUp();
                    onComplete(200, 50, 3, 'trademark');
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-emerald-500/30 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Claim Brand Guardian Honors & Return to Map</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
