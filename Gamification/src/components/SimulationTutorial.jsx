import React, { useState } from 'react';
import { soundFx } from '../utils/sound';
import { 
  Lightbulb, Feather, ShieldCheck, Lock, GraduationCap, ArrowRight, 
  ArrowLeft, CheckCircle2, AlertCircle, Sparkles, Scale, FileText, 
  Search, Shield, DollarSign, Clock, HelpCircle, Play, Gavel, 
  Layers, Sliders, Check, RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const SimulationTutorial = ({ 
  onBack, 
  onLaunchGame, 
  initialConcept = 'patent' 
}) => {
  const [selectedConcept, setSelectedConcept] = useState(initialConcept);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Mini-sandbox states inside tutorial
  const [demoFilingStage, setDemoFilingStage] = useState(1);
  const [demoRoyaltyRate, setDemoRoyaltyRate] = useState(5);
  const [demoYear, setDemoYear] = useState(1);
  const [demoPrecautionCount, setDemoPrecautionCount] = useState(2);
  const [demoSimilarity, setDemoSimilarity] = useState(85);
  const [demoQuotesActive, setDemoQuotesActive] = useState(false);

  // Concept configuration metadata
  const CONCEPT_META = {
    patent: {
      title: 'Patent Student Guide',
      subtitle: 'How Inventions & Machines Work (Step-by-step easy guide)',
      color: 'amber',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      borderColor: 'border-amber-500/50',
      textColor: 'text-amber-400',
      buttonBg: 'bg-amber-400 hover:bg-amber-300 text-slate-950',
      icon: <Lightbulb className="w-6 h-6 text-amber-400" />
    },
    copyright: {
      title: 'Copyright Student Guide',
      subtitle: 'Protecting Your Drawings, Songs & Stories (Create and own your art)',
      color: 'indigo',
      badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
      borderColor: 'border-indigo-500/50',
      textColor: 'text-indigo-400',
      buttonBg: 'bg-indigo-500 hover:bg-indigo-400 text-white',
      icon: <Feather className="w-6 h-6 text-indigo-400" />
    },
    trademark: {
      title: 'Trademark Student Guide',
      subtitle: 'Making Cool Brand Names & Logos (No copycat confusion)',
      color: 'emerald',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      borderColor: 'border-emerald-500/50',
      textColor: 'text-emerald-400',
      buttonBg: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />
    },
    trade_secret: {
      title: 'Trade Secret Student Guide',
      subtitle: 'Locking Up Secret Recipes & Formulas (Secret formulas kept safe)',
      color: 'rose',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      borderColor: 'border-rose-500/50',
      textColor: 'text-rose-400',
      buttonBg: 'bg-rose-500 hover:bg-rose-400 text-white',
      icon: <Lock className="w-6 h-6 text-rose-400" />
    },
    plagiarism: {
      title: 'Academic Integrity Guide',
      subtitle: 'Writing Honest School Projects & Citing Sources (Get an A+ with your own words)',
      color: 'cyan',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      borderColor: 'border-cyan-500/50',
      textColor: 'text-cyan-400',
      buttonBg: 'bg-cyan-400 hover:bg-cyan-300 text-slate-950',
      icon: <GraduationCap className="w-6 h-6 text-cyan-400" />
    }
  };

  // 6 Procedural tutorial steps per concept
  const TUTORIAL_DATA= {
    patent: [
      {
        stepNumber: 1,
        phaseTitle: 'Meaning & The Social Contract',
        badge: 'Legal Foundations',
        headline: 'What is a Patent and How Does It Work?',
        explanation: 'A patent is a 20-year government monopoly granted to an inventor in exchange for public disclosure of full engineering schematics.',
        procedureBullets: [
          { title: 'The Right to Exclude', desc: 'It does not give you permission to sell, but gives you the legal weapon to stop unauthorized copycats.' },
          { title: 'The Grand Bargain', desc: 'You must publish a blueprint so other scientists learn from it. In return, you get 20 years with zero copycats.' },
          { title: 'Public Domain Return', desc: 'When the 20-year period expires, your machine becomes free for all humans to manufacture (like generic medicine).' }
        ],
        interactiveWidget: (
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-750 space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">The Social Contract Dial</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                <strong className="text-white block mb-1">Inventor Gives:</strong>
                <span className="text-slate-300 text-[11px]">Public disclosure of full detailed blueprints.</span>
              </div>
              <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
                <strong className="text-white block mb-1">Government Gives:</strong>
                <span className="text-slate-300 text-[11px]">20-year legal monopoly to exclude all rivals.</span>
              </div>
            </div>
          </div>
        ),
        proTip: 'Remember: Patents protect technical function and machines, not logos, names, or abstract math!'
      },
      {
        stepNumber: 2,
        phaseTitle: 'Subject Matter Qualification',
        badge: 'Statutory Eligibility',
        headline: 'What Qualifies for a Patent? (Component Selection)',
        explanation: 'Under 35 U.S.C. § 101, an invention must be a process, machine, manufacture, or composition of matter. Natural laws and abstract thoughts are banned.',
        procedureBullets: [
          { title: 'Novelty Requirement', desc: 'Must be completely new anywhere in the world prior to your filing date.' },
          { title: 'Non-Obviousness', desc: 'Cannot be an obvious combination of existing off-the-shelf tools.' },
          { title: 'Industrial Utility', desc: 'Must operate in the physical world to solve a concrete real-world problem.' }
        ],
        interactiveWidget: (
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-750 space-y-2">
            <span className="text-xs font-bold text-slate-300 block">Test Subject Matter Qualification:</span>
            <div className="space-y-1.5 text-xs">
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/40 text-emerald-200 flex items-center justify-between">
                <span>Dual-Vortex Fluid Filter Mechanism</span>
                <span className="font-bold text-[10px] px-2 py-0.5 rounded bg-emerald-500 text-slate-950">QUALIFIES</span>
              </div>
              <div className="p-2 rounded bg-rose-500/10 border border-rose-500/40 text-rose-200 flex items-center justify-between">
                <span>Mathematical Formula (E = mc²)</span>
                <span className="font-bold text-[10px] px-2 py-0.5 rounded bg-rose-500 text-white">LAW OF NATURE</span>
              </div>
            </div>
          </div>
        ),
        proTip: 'A flashlight taped to a bike fails because it is obvious to anyone skilled in the art.'
      },
      {
        stepNumber: 3,
        phaseTitle: 'The 5-Step Filing Procedure',
        badge: 'USPTO Process',
        headline: 'How to Apply for and Obtain a Granted Patent',
        explanation: 'Follow the rigorous procedural pipeline from initial prior art search to official patent grant.',
        procedureBullets: [
          { title: '1. Prior Art Search', desc: 'Examine international patent databases to confirm zero identical inventions exist.' },
          { title: '2. Specification & Claims', desc: 'Draft legal claims that legally define the exact perimeter boundary of your monopoly.' },
          { title: '3. Official Application', desc: 'Submit application papers, formal drawings, and filing fees to the Patent Office.' },
          { title: '4. Examiner Office Action', desc: 'USPTO patent examiners review claims and challenge obviousness; respond with legal amendments.' },
          { title: '5. Notice of Allowance & Grant', desc: 'Pay issue fee; the official patent deed is sealed and published with a unique patent number.' }
        ],
        interactiveWidget: (
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-750 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold">Filing Stage Simulator:</span>
              <span className="text-amber-400 font-bold">Stage {demoFilingStage} of 5</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 transition-all duration-300" style={{ width: `${demoFilingStage * 20}%` }} />
            </div>
            <button
              onClick={() => {
                soundFx.playClick();
                setDemoFilingStage(prev => (prev < 5 ? prev + 1 : 1));
              }}
              className="w-full py-1.5 bg-slate-800 hover:bg-slate-750 text-amber-300 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Advance to Next Filing Stage ({demoFilingStage}/5)
            </button>
          </div>
        ),
        proTip: 'Most patents take 18–36 months of examination before final grant!'
      },
      {
        stepNumber: 4,
        phaseTitle: 'Comparative Case Audits',
        badge: 'Judicial Examination',
        headline: 'Why Projects Are Approved vs Rejected',
        explanation: 'Study actual case submissions to understand the real difference between granted claims and rejected attempts.',
        procedureBullets: [
          { title: 'Maya’s Hydro-Cyclone (Approved)', desc: 'Novel spinning fluid chamber with self-cleaning sediment separation. Met novelty, non-obviousness, and utility.' },
          { title: 'Bicycle Flashlight (Rejected)', desc: 'Fails non-obviousness. Fastening an existing flashlight onto an existing bike creates zero technical synergy.' },
          { title: 'Ocean Wave Formula (Rejected)', desc: 'Fails Section 101. An abstract mathematical equation cannot be monopolized by one entity.' }
        ],
        interactiveWidget: (
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-750 text-xs text-slate-300 space-y-2">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-400" /> Comparison Takeaway:
            </div>
            <p className="text-[11px] leading-relaxed">
              Examiners compare your claims against thousands of global patent documents. If an identical design exists in Tokyo from 1982, your application is rejected
            </p>
          </div>
        ),
        proTip: 'Always run an exhaustive prior art search before spending thousands on filing fees.'
      },
      {
        stepNumber: 5,
        phaseTitle: '20-Year Lifecycle & Renewals',
        badge: 'Maintenance Fees',
        headline: 'Keeping the Patent Active & Public Domain Transition',
        explanation: 'A patent lasts 20 years from filing date, but requires mandatory maintenance fees to prevent premature expiration.',
        procedureBullets: [
          { title: 'Maintenance Fee at 3.5 Years', desc: 'First government fee to keep the patent alive in early commercialization.' },
          { title: 'Maintenance Fee at 7.5 Years', desc: 'Second renewal checkpoint as product sales mature.' },
          { title: 'Maintenance Fee at 11.5 Years', desc: 'Final maintenance fee to ensure protection through year 20.' },
          { title: 'Year 20 Expiration', desc: 'Monopoly expires forever. The technology becomes public domain property.' }
        ],
        interactiveWidget: (
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-750 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Timeline Slider:</span>
              <span className="text-amber-400 font-bold">Year {demoYear} of 20</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              value={demoYear}
              onChange={(e) => setDemoYear(Number(e.target.value))}
              className="w-full accent-amber-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="text-[11px] text-slate-400">
              {demoYear < 4 ? 'Status: Early Protection (1st fee due at 3.5 yrs)' : demoYear < 8 ? 'Status: Mid-lifecycle (2nd fee due at 7.5 yrs)' : demoYear < 12 ? 'Status: Late protection (3rd fee due at 11.5 yrs)' : demoYear < 20 ? 'Status: Final commercial window' : 'EXPIRED Technology enters Public Domain.'}
            </div>
          </div>
        ),
        proTip: 'If maintenance fees are not paid, the patent lapses early and copycats can sell immediately.'
      },
      {
        stepNumber: 6,
        phaseTitle: 'Infringement, Royalties & Court',
        badge: 'Enforcement Action',
        headline: 'What If Someone Copies Your Granted Patent?',
        explanation: 'Follow the official 3-step enforcement procedure: Cease & Desist, Licensing & Royalty negotiation, and Federal Court litigation.',
        procedureBullets: [
          { title: '1. Cease & Desist Notice', desc: 'Formal letter demanding that the infringer halt sales and preserve production records.' },
          { title: '2. Commercial License & Royalties', desc: 'Negotiate a win-win license where the infringer pays you 3% to 8% royalty on every unit sold.' },
          { title: '3. Federal Lawsuit for Injunction', desc: 'Sue in federal court to seize unauthorized copies and collect lost profits.' }
        ],
        interactiveWidget: (
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-750 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Licensing Royalty Rate:</span>
              <span className="text-emerald-400 font-bold">{demoRoyaltyRate}% per unit</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              value={demoRoyaltyRate}
              onChange={(e) => setDemoRoyaltyRate(Number(e.target.value))}
              className="w-full accent-emerald-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="text-[11px] text-slate-300 bg-slate-800 p-2 rounded border border-slate-700">
              At {demoRoyaltyRate}% royalty on 50,000 units sold at ₹3,200 each: 
              <strong className="text-emerald-400 ml-1 font-bold">
                ₹{((50000 * 3200 * demoRoyaltyRate) / 100).toLocaleString('en-IN')} Royalty Payout
              </strong>
            </div>
          </div>
        ),
        proTip: 'Most patent disputes settle with a licensing agreement rather than a full trial in court.'
      }
    ],

    trademark: [
      {
        stepNumber: 1,
        phaseTitle: 'Meaning & Consumer Guarantee',
        badge: 'Commercial Origin',
        headline: 'What is a Trademark and How Does It Work?',
        explanation: 'A trademark is a commercial brand identifier (name, logo, slogan) that tells consumers who manufactured the product and prevents fraud.',
        procedureBullets: [
          { title: 'Consumer Protection', desc: 'Prevents shoppers from buying a fake sneaker thinking it came from a trusted athletic company.' },
          { title: 'Brand Goodwill', desc: 'Allows companies to invest in quality knowing competitors cannot steal their reputation.' },
          { title: 'Symbols: ™ vs ®', desc: '™ indicates common law claim; ® can ONLY be used after official federal registration is granted!' }
        ],
        interactiveWidget: (
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-750 grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
              <strong className="text-emerald-400 block mb-1">™ Symbol:</strong>
              <span className="text-slate-300 text-[11px]">Unregistered claim. Anyone can use it on day 1 to declare brand intent.</span>
            </div>
            <div className="p-3 bg-slate-800 rounded-lg border border-slate-700">
              <strong className="text-emerald-400 block mb-1">® Registered Symbol:</strong>
              <span className="text-slate-300 text-[11px]">Legally certified by USPTO. Using it without registration is a federal crime!</span>
            </div>
          </div>
        ),
        proTip: 'Never put the ® symbol on your logo until your official certificate arrives from the trademark office!'
      },
      {
        stepNumber: 2,
        phaseTitle: 'The Abercrombie Distinctiveness Spectrum',
        badge: 'Brand Strength',
        headline: 'What Qualifies as a Strong Trademark?',
        explanation: 'Courts classify trademarks along a 5-tier spectrum. Generic words can never be trademarked; Fanciful words have the strongest protection.',
        procedureBullets: [
          { title: 'Generic (Unprotectable)', desc: 'Common noun for the product (e.g. "Apple" for a basket of apples). Never protectable.' },
          { title: 'Descriptive (Weak)', desc: 'Describes an ingredient or quality (e.g. "Warm Fresh Bread"). Requires secondary meaning.' },
          { title: 'Suggestive (Good)', desc: 'Hints at a feature without stating it directly (e.g. "Netflix" for streaming movies).' },
          { title: 'Arbitrary (Strong)', desc: 'Real dictionary word with zero connection to the product (e.g. "Apple" for microchips).' },
          { title: 'Fanciful (Strongest)', desc: 'Completely coined, made-up word with no other meaning (e.g. "Kodak", "Rolex", "AeroStride").' }
        ],
        interactiveWidget: (
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-750 space-y-2 text-xs">
            <span className="text-xs font-bold text-emerald-400 block">The 5-Tier Strength Hierarchy:</span>
            <div className="grid grid-cols-5 gap-1 text-[10px] text-center font-bold">
              <div className="p-1.5 bg-rose-500/20 text-rose-300 rounded border border-rose-500/40">Generic</div>
              <div className="p-1.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/40">Descriptive</div>
              <div className="p-1.5 bg-blue-500/20 text-blue-300 rounded border border-blue-500/40">Suggestive</div>
              <div className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/40">Arbitrary</div>
              <div className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded border border-emerald-500/40">Fanciful</div>
            </div>
          </div>
        ),
        proTip: 'Inventing a completely new word is the safest and strongest way to protect your brand!'
      },
      {
        stepNumber: 3,
        phaseTitle: 'The 5 Registration Steps',
        badge: 'USPTO Process',
        headline: 'The Official Path from Trademark Search to ® Certificate',
        explanation: 'Registering a trademark requires comprehensive clearance searches, examination, and a public 30-day opposition window.',
        procedureBullets: [
          { title: '1. Clearance Search', desc: 'Scan federal, state, and commercial databases for confusingly similar names.' },
          { title: '2. Application Filing', desc: 'Specify International Nice Classes of goods and provide commercial specimen.' },
          { title: '3. Examining Attorney Review', desc: 'USPTO lawyer checks for conflicting registrations or descriptiveness.' },
          { title: '4. Official Gazette Publication', desc: 'Published for 30 days so the public and rival companies can oppose if harmed.' },
          { title: '5. Certificate of Registration', desc: 'Issued with federal registration number; brand gains nationwide constructive notice.' }
        ],
        interactiveWidget: (
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-750 text-xs text-slate-300 space-y-1">
            <span className="text-emerald-400 font-bold block">The 30-Day Opposition Window:</span>
            <p className="text-[11px] leading-relaxed">
              Before your certificate is granted, your mark is published in the Official Gazette. If a company with a similar mark believes customers will be confused, they can file an opposition with the Trademark Trial and Appeal Board (TTAB).
            </p>
          </div>
        ),
        proTip: 'Always check existing business registries before designing packaging and neon signs.'
      },
      {
        stepNumber: 4,
        phaseTitle: 'Comparative Case Audits',
        badge: 'Lanham Act Cases',
        headline: 'Why Trademarks Are Approved vs Rejected',
        explanation: 'Examine comparative filings to see how the trademark office rules on descriptiveness and consumer confusion.',
        procedureBullets: [
          { title: 'AeroStride® (Approved)', desc: 'Coined fanciful term for running footwear. Instantly distinctive; zero conflicting marks.' },
          { title: 'Warm Fresh Bread (Rejected)', desc: 'Merely descriptive under Section 2(e)(1). Competitors need to use these words to describe fresh bread.' },
          { title: 'Apple® Computers (Approved)', desc: 'Arbitrary mark. Fruit has zero relationship to microchips and operating systems.' },
          { title: 'Apple for Gala Apples (Rejected)', desc: 'Generic noun. You cannot trademark the actual name of the product you sell.' }
        ],
        interactiveWidget: (
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-750 space-y-1.5 text-xs text-slate-300">
            <span className="text-white font-bold">Key Rule of Law:</span>
            <p className="text-[11px]">
              No single company is allowed to monopolize everyday descriptive English words that other competitors need to describe their products.
            </p>
          </div>
        ),
        proTip: 'If your brand name merely describes what you do, you cannot stop other people from using those words.'
      },
      {
        stepNumber: 5,
        phaseTitle: 'Indefinite Lifecycle & 10-Year Renewals',
        badge: 'Forever Duration',
        headline: 'Can a Trademark Last Forever? (Yes, With Active Renewals)',
        explanation: 'Unlike patents and copyrights, trademarks have no expiration date as long as you keep using them and file renewals every 10 years.',
        procedureBullets: [
          { title: 'Continuous Commercial Use', desc: 'If you stop selling products for 3 consecutive years, the mark is considered abandoned.' },
          { title: '10-Year Maintenance Renewals', desc: 'File Section 8 Declaration of Continued Use and Section 9 Renewal every decade.' },
          { title: 'The Threat of Genericide', desc: 'If the public uses your brand name as a generic noun (like Aspirin, Escalator, Yo-yo), you lose trademark rights!' }
        ],
        interactiveWidget: (
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-750 space-y-2 text-xs">
            <span className="text-emerald-400 font-bold block">Famous Victims of Genericide:</span>
            <div className="grid grid-cols-3 gap-2 text-[10px] text-center">
              <div className="p-2 bg-slate-800 rounded border border-slate-700">
                <span className="font-bold text-white block">Escalator</span>
                <span className="text-slate-400">Originally a trademark of Otis Elevator Co.</span>
              </div>
              <div className="p-2 bg-slate-800 rounded border border-slate-700">
                <span className="font-bold text-white block">Aspirin</span>
                <span className="text-slate-400">Originally a trademark of Bayer AG.</span>
              </div>
              <div className="p-2 bg-slate-800 rounded border border-slate-700">
                <span className="font-bold text-white block">Yo-Yo</span>
                <span className="text-slate-400">Originally a trademark of Duncan Toys.</span>
              </div>
            </div>
          </div>
        ),
        proTip: 'Always use your trademark as an adjective followed by a generic noun (e.g. "LEGO® bricks", not "Legos").'
      },
      {
        stepNumber: 6,
        phaseTitle: 'Infringement, Confusion & Injunctions',
        badge: 'Lanham Act Enforcement',
        headline: 'What If Someone Uses a Confusingly Similar Brand?',
        explanation: 'Enforce your trademark rights through Likelihood of Confusion audits, Cease & Desist notices, and federal court injunctions.',
        procedureBullets: [
          { title: 'The Polaroid Test', desc: 'Courts evaluate similarity of mark, similarity of products, marketing channels, and evidence of consumer confusion.' },
          { title: 'Cease & Desist Letter', desc: 'Warn the infringing merchant to pull misleading signage and destroy counterfeit stock.' },
          { title: 'Federal Injunction', desc: 'Obtain a court order forcing the infringer to change their brand name and disgorge profits.' }
        ],
        interactiveWidget: (
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-750 space-y-2 text-xs text-slate-300">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Gavel className="w-4 h-4 text-emerald-400" /> Court Remedy:
            </div>
            <p className="text-[11px] leading-relaxed">
              Under 15 U.S.C. § 1117 (Lanham Act), trademark owners can recover defendant's profits, actual damages, and up to treble damages for willful counterfeiting
            </p>
          </div>
        ),
        proTip: 'Proof of actual customer confusion (e.g. customers sending complaints to the wrong company) is decisive in court.'
      }
    ],

    copyright: [
      {
        stepNumber: 1,
        phaseTitle: 'Meaning & The Idea-Expression Dichotomy',
        badge: 'Creative Authorship',
        headline: 'What Does Copyright Protect? (Expression, Not Ideas)',
        explanation: 'Copyright protects original works of authorship fixed in any tangible medium. The idea itself is free for all; only the unique expression is protected.',
        procedureBullets: [
          { title: 'Idea vs Expression', desc: 'The idea of "a young wizard going to magic boarding school" is free; J.K. Rowling’s specific prose and characters are copyrighted.' },
          { title: 'Bundle of 6 Exclusive Rights', desc: 'Exclusive right to reproduce, prepare derivative works, distribute, publicly perform, publicly display, and transmit digitally.' },
          { title: 'Automatic Protection', desc: 'Protection begins the split second your pen touches paper or pixels are saved to a hard drive!' }
        ],
        interactiveWidget: (
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-750 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700">
              <strong className="text-indigo-300 block mb-1">Unprotected Idea:</strong>
              <span className="text-slate-300 text-[11px]">"A superhero bitten by a radioactive insect." (Free for anyone)</span>
            </div>
            <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700">
              <strong className="text-indigo-300 block mb-1">Protected Expression:</strong>
              <span className="text-slate-300 text-[11px]">The exact costume, dialogue, and illustrations of Peter Parker.</span>
            </div>
          </div>
        ),
        proTip: 'You cannot copyright a general concept or plot outline—only the specific creative execution.'
      },
      {
        stepNumber: 2,
        phaseTitle: 'What Qualifies for Copyright Protection?',
        badge: 'Creative Spark',
        headline: 'Works with Creative Originality vs Unprotectable Elements',
        explanation: 'To qualify, a work must possess at least a "modicum of creative originality" (Feist v. Rural). Titles, short slogans, and raw facts do not qualify.',
        procedureBullets: [
          { title: 'Novels, Art, Music & Code', desc: 'Original stories, character illustrations, recorded songs, and software code qualify 100%.' },
          { title: 'Short Titles (Unprotectable)', desc: 'Under Circular 34, book titles and character names lack sufficient expression to be copyrighted.' },
          { title: 'Raw Facts & Directories', desc: 'Alphabetical telephone directories lack creative spark. Facts belong to everyone!' }
        ],
        interactiveWidget: (
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-750 space-y-1.5 text-xs">
            <span className="text-indigo-400 font-bold block">Feist Publications v. Rural Telephone (1991):</span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              The Supreme Court ruled that raw facts are not created by an author; they are discovered. Arranging names alphabetically lacks even a tiny spark of creativity.
            </p>
          </div>
        ),
        proTip: 'Titles and brand slogans belong under Trademark law, not Copyright!'
      },
      {
        stepNumber: 3,
        phaseTitle: 'Fixation & Voluntary Registration Procedure',
        badge: 'Copyright Office',
        headline: 'From Instant Fixation to Formal Legal Registration',
        explanation: 'Copyright is automatic upon creation, but formal registration with the U.S. Copyright Office is required before filing a federal lawsuit.',
        procedureBullets: [
          { title: '1. Fixation in Tangible Medium', desc: 'Saved to disk, recorded on audio tape, or printed on canvas. Immediate common law copyright.' },
          { title: '2. Copyright Notice (Optional)', desc: 'Marking "© 2026 Author Name. All rights reserved" alerts copycats and defeats innocent infringement claims.' },
          { title: '3. Form eCO Online Registration', desc: 'Submit application form, deposit copies of the creative work, and pay modest fee.' },
          { title: '4. Certificate of Registration', desc: 'Allows you to claim statutory damages (up to ₹10,00,000 per willful infringement) and attorney fees in court.' }
        ],
        interactiveWidget: (
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-750 text-xs text-slate-300 space-y-1">
            <strong className="text-white block">Why Register if It's Already Automatic?</strong>
            <p className="text-[11px] leading-relaxed">
              Without formal registration, you cannot file a copyright lawsuit in court Timely registration also lets you win up to ₹10,00,000 in statutory damages without having to prove actual financial loss.
            </p>
          </div>
        ),
        proTip: 'Always register within 3 months of publication to preserve statutory damages.'
      },
      {
        stepNumber: 4,
        phaseTitle: 'Comparative Case Audits',
        badge: 'Authorship Law',
        headline: 'Why Creative Works Are Protected vs Rejected',
        explanation: 'Compare 4 creative submissions to understand where the legal line between original authorship and infringement lies.',
        procedureBullets: [
          { title: '80,000-Word Fantasy Novel (Protected)', desc: 'Original prose, dialogue, world-building, and character designs. Fully protected expression.' },
          { title: 'Short Title "Space Warriors" (Rejected)', desc: 'Circular 34 excludes short titles and phrases. Belongs under trademark if used as a brand.' },
          { title: 'Traced Character Clone (Infringing)', desc: 'Changing hair color on a traced drawing is an unauthorized derivative work and illegal copy.' }
        ],
        interactiveWidget: (
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-750 space-y-1 text-xs text-slate-300">
            <span className="text-indigo-400 font-bold block">Derivative Works:</span>
            <p className="text-[11px]">
              Only the copyright owner has the exclusive legal right to make sequels, adaptations, translations, or video games based on their original story.
            </p>
          </div>
        ),
        proTip: 'Making minor edits to someone else’s art does not make it your original creation.'
      },
      {
        stepNumber: 5,
        phaseTitle: 'Author Life + 70 Years Duration',
        badge: 'Public Domain',
        headline: 'How Long Does Copyright Last? (Lifetime + 70 Years)',
        explanation: 'For individual authors, copyright lasts for the author’s entire lifetime plus an additional 70 years after their death.',
        procedureBullets: [
          { title: 'Author Lifetime', desc: 'Full commercial control for the creator during their entire life.' },
          { title: '70 Years Post-Mortem', desc: 'Provides financial royalties and estate protection for the creator’s children and grandchildren.' },
          { title: 'Public Domain Day (Jan 1)', desc: 'After 70 years, the work enters the Public Domain. Anyone can freely adapt it (e.g. Pride & Prejudice, Sherlock Holmes).' }
        ],
        interactiveWidget: (
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-750 space-y-2 text-xs">
            <span className="text-indigo-400 font-bold block">The Public Domain Goldmine:</span>
            <p className="text-[11px] text-slate-300">
              When a work enters the Public Domain, Disney, Broadway, and indie creators can make movies and stage plays without paying a dime in royalties
            </p>
          </div>
        ),
        proTip: 'Works created by corporate employees (Work Made for Hire) last 95 years from publication or 120 years from creation.'
      },
      {
        stepNumber: 6,
        phaseTitle: 'DMCA Takedowns, Fair Use & Licensing',
        badge: 'Enforcement Protocol',
        headline: 'Enforcing Rights Online and the 4-Factor Fair Use Test',
        explanation: 'Handle digital infringement with DMCA takedowns and evaluate whether unauthorized use qualifies as legal Fair Use.',
        procedureBullets: [
          { title: 'DMCA Takedown Notice', desc: 'Section 512 notice to YouTube, TikTok, or web hosts forcing prompt removal of pirated content.' },
          { title: 'The 4-Factor Fair Use Test', desc: '1. Purpose of use (commercial vs educational/parody); 2. Nature of work; 3. Amount used; 4. Effect on the market.' },
          { title: 'Commercial Licensing', desc: 'License synchronisation rights for games, TV shows, and advertisements for steady royalty revenue.' }
        ],
        interactiveWidget: (
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-750 space-y-1 text-xs text-slate-300">
            <span className="text-white font-bold block">Parody vs Piracy:</span>
            <p className="text-[11px]">
              Parody that pokes fun at the original work is protected Fair Use (Campbell v. Acuff-Rose). Merely uploading an entire song for background music is NOT Fair Use
            </p>
          </div>
        ),
        proTip: 'Giving credit to the artist does NOT shield you from copyright infringement if you lack a license!'
      }
    ],

    trade_secret: [
      {
        stepNumber: 1,
        phaseTitle: 'Meaning & The Secrecy Advantage',
        badge: 'Confidentiality Law',
        headline: 'What is a Trade Secret? (Value Through Secrecy)',
        explanation: 'A trade secret is proprietary business information that derives independent commercial value from being kept confidential, guarded by reasonable precautions.',
        procedureBullets: [
          { title: 'No Government Registry', desc: 'There is zero paperwork to file with the government. Protection exists automatically as long as secrecy holds.' },
          { title: 'Patent vs Trade Secret', desc: 'Patents grant a guaranteed 20-year monopoly but force public blueprints; Trade secrets can last forever but risk reverse engineering.' },
          { title: 'The 3 Legal Prongs', desc: '1. Not generally known; 2. Has economic competitive value; 3. Owner takes reasonable security precautions.' }
        ],
        interactiveWidget: (
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-750 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700">
              <strong className="text-rose-400 block mb-1">Patent Monopoly:</strong>
              <span className="text-slate-300 text-[11px]">Public blueprints. 20-year cap. Safe from reverse engineering.</span>
            </div>
            <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700">
              <strong className="text-rose-400 block mb-1">Trade Secret:</strong>
              <span className="text-slate-300 text-[11px]">Zero blueprints. Can last forever. Vulnerable to reverse engineering!</span>
            </div>
          </div>
        ),
        proTip: 'If your invention can be easily figured out by looking at the outside of the box, file a patent!'
      },
      {
        stepNumber: 2,
        phaseTitle: 'What Qualifies as a Trade Secret?',
        badge: 'Inventory Scope',
        headline: 'Confidential Formulas, Customer Lists & Algorithms',
        explanation: 'Trade secrets cover internal recipes, manufacturing specifications, client negotiation discounts, and ranking algorithms.',
        procedureBullets: [
          { title: 'Proprietary Recipes & Formulas', desc: 'The Coca-Cola 7X formula, KFC 11 herbs and spices, WD-40 lubricant formula.' },
          { title: 'Software Algorithms', desc: 'Search engine ranking weights, high-frequency trading algorithms, AI training datasets.' },
          { title: 'Confidential Business Data', desc: 'Customer margin spreadsheets, supplier cost breakdowns, unreleased product roadmap.' }
        ],
        interactiveWidget: (
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-750 space-y-1.5 text-xs text-slate-300">
            <span className="text-rose-400 font-bold block">What Can NEVER Be a Trade Secret:</span>
            <p className="text-[11px]">
              Information you publish on your public website, street addresses, or general professional skills an employee carries in their head.
            </p>
          </div>
        ),
        proTip: 'Mark every confidential document clearly: "CONFIDENTIAL & PROPRIETARY PROPERTY".'
      },
      {
        stepNumber: 3,
        phaseTitle: 'The "Reasonable Precautions" Protocol',
        badge: 'Security Layers',
        headline: 'The 4 Essential Security Layers Required by Law',
        explanation: 'Under UTSA and DTSA, if a business fails to take reasonable precautions, a federal court will rule the trade secret is legally forfeited!',
        procedureBullets: [
          { title: '1. Written NDAs', desc: 'Require all employees, vendors, and visitors to sign strict Non-Disclosure Agreements.' },
          { title: '2. Physical Vaults & Biometrics', desc: 'Lock prototypes in secure rooms with badge access logs and security cameras.' },
          { title: '3. AES-256 Digital Encryption', desc: 'Encrypt databases and restrict server access based strictly on the "Need-to-Know" rule.' },
          { title: '4. Immediate Exit Protocols', desc: 'Revoke cloud logins and security badges the minute an employee resigns; audit company laptops.' }
        ],
        interactiveWidget: (
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-750 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Security Layer Check:</span>
              <span className="text-rose-400 font-bold">{demoPrecautionCount} / 4 Layers Active</span>
            </div>
            <button
              onClick={() => {
                soundFx.playClick();
                setDemoPrecautionCount(prev => (prev < 4 ? prev + 1 : 1));
              }}
              className="w-full py-1.5 bg-slate-800 hover:bg-slate-750 text-rose-300 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Toggle Next Precaution Layer ({demoPrecautionCount}/4)
            </button>
          </div>
        ),
        proTip: 'Courts do not protect secrets you didn’t care to guard yourself!'
      },
      {
        stepNumber: 4,
        phaseTitle: 'Comparative Case Audits',
        badge: 'Judicial Cases',
        headline: 'Why Trade Secrets Win or Lose in Court',
        explanation: 'Examine 4 real-world legal outcomes to understand how federal judges apply trade secret standards.',
        procedureBullets: [
          { title: 'Coca-Cola (Protected 130+ Yrs)', desc: 'Locked written formula in bank vault; 2 executives hold half each; suppliers sign NDAs. Supreme security.' },
          { title: 'Open Google Drive Leads (Lost)', desc: 'Company left client list on an open link with no password. Court ruled trade secret forfeited!' },
          { title: 'Reverse Engineering (100% Legal)', desc: 'Competitor purchased drink in store and analyzed chemicals in mass spectrometer. Lawful competitor victory.' },
          { title: 'Midnight USB Flash Drive (Theft)', desc: 'Ex-engineer downloaded 5,000 CAD files to thumb drive. Federal judge issued emergency seizure order.' }
        ],
        interactiveWidget: (
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-750 space-y-1 text-xs text-slate-300">
            <span className="text-white font-bold block">The Reverse Engineering Rule:</span>
            <p className="text-[11px]">
              Unlike patent law, reverse engineering of a legally purchased product is 100% legal under trade secret law.
            </p>
          </div>
        ),
        proTip: 'If your secret is easily reverse-engineered from the shelf, a patent is your only defense.'
      },
      {
        stepNumber: 5,
        phaseTitle: 'Infinite Duration vs The 3 Vulnerabilities',
        badge: 'Lifecycle Duration',
        headline: 'Can a Secret Last Forever? Yes, Until It Leaks!',
        explanation: 'A trade secret has no expiration date, but can be extinguished permanently in a split second by 3 events.',
        procedureBullets: [
          { title: 'Event 1: Public Disclosure', desc: 'If leaked onto the internet or published in a scientific paper, the secret is dead forever.' },
          { title: 'Event 2: Lawful Reverse Engineering', desc: 'If a competitor figures out how your product works without stealing your files, they can sell it freely.' },
          { title: 'Event 3: Independent Invention', desc: 'If a competitor invents the exact same thing independently, both companies can sell it.' }
        ],
        interactiveWidget: (
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-750 text-xs text-slate-300 space-y-1">
            <span className="text-rose-400 font-bold block">Chartreuse Liqueur Case Study:</span>
            <p className="text-[11px] leading-relaxed">
              Carthusian monks have guarded the secret recipe of 130 botanical plants for over 400 years. Only two monks know the recipe at any given time
            </p>
          </div>
        ),
        proTip: 'Once a trade secret is public, you cannot put the toothpaste back in the tube.'
      },
      {
        stepNumber: 6,
        phaseTitle: 'Misappropriation, Emergency TROs & Injunctions',
        badge: 'Federal Court Action',
        headline: 'What If an Ex-Employee Steals Your Source Code?',
        explanation: 'Follow the 3-step legal emergency protocol under the Defend Trade Secrets Act (DTSA).',
        procedureBullets: [
          { title: '1. Emergency Cease & Desist', desc: 'Demand immediate forensic imaging of all defendant hard drives and cessation of sales.' },
          { title: '2. Ex-Parte Temporary Restraining Order (TRO)', desc: 'Emergency judge order to seize equipment and freeze competitor product launches before harm occurs.' },
          { title: '3. Civil Damages & Criminal Referral', desc: 'Collect actual losses, unjust enrichment, reasonable royalties, plus punitive damages for willful theft.' }
        ],
        interactiveWidget: (
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-750 space-y-1.5 text-xs text-slate-300">
            <span className="text-white font-bold block">Economic Espionage Act:</span>
            <p className="text-[11px]">
              Trade secret theft is not just a civil lawsuit—it is a federal felony carrying up to 10 years in federal prison and millions in criminal fines
            </p>
          </div>
        ),
        proTip: 'Move fast: judges only grant emergency TROs if you act within days of discovering the breach.'
      }
    ],

    plagiarism: [
      {
        stepNumber: 1,
        phaseTitle: 'Meaning & Intellectual Honesty',
        badge: 'Academic Ethics',
        headline: 'What is Plagiarism? (Attribution vs Permission)',
        explanation: 'Plagiarism is an academic ethics violation where a scholar passes off another person’s ideas, text, or research as their own without proper attribution.',
        procedureBullets: [
          { title: 'Plagiarism vs Copyright', desc: 'Copyright is about permission and money; Plagiarism is about honesty and truth in scholarship.' },
          { title: 'Public Domain Trap', desc: 'Copying a 400-year-old Shakespeare play without credit is NOT copyright infringement, but is 100% plagiarism!' },
          { title: 'Standing on Giants’ Shoulders', desc: 'Citing sources shows your paper is grounded in real research. It strengthens your scholarship.' }
        ],
        interactiveWidget: (
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-750 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700">
              <strong className="text-cyan-300 block mb-1">Plagiarism:</strong>
              <span className="text-slate-300 text-[11px]">Failing to give credit. A violation of school honor codes and academic truth.</span>
            </div>
            <div className="p-2.5 bg-slate-800 rounded-lg border border-slate-700">
              <strong className="text-cyan-300 block mb-1">Copyright Infringement:</strong>
              <span className="text-slate-300 text-[11px]">Copying without legal permission or license. A commercial civil violation.</span>
            </div>
          </div>
        ),
        proTip: 'You can plagiarize public domain material even if no law was broken!'
      },
      {
        stepNumber: 2,
        phaseTitle: 'What Requires Citation vs Common Knowledge?',
        badge: 'Attribution Rules',
        headline: 'Do I Need to Cite Everything I Write? (No)',
        explanation: 'Universal facts known by educated students do not require citations. Unique findings, empirical data, and verbatim text ALWAYS do.',
        procedureBullets: [
          { title: 'Requires Citation', desc: 'Specific research statistics, unique scientific theories, external computer code, direct quotes.' },
          { title: 'Common Knowledge Exemption', desc: 'Universal facts found across standard encyclopedias (e.g. "Paris is the capital of France", "Water freezes at 0°C").' },
          { title: 'The 5-Source Test', desc: 'If you can find the fact uncredited in 5 independent textbooks, it is common knowledge.' }
        ],
        interactiveWidget: (
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-750 space-y-1.5 text-xs text-slate-300">
            <span className="text-cyan-400 font-bold block">Quick Test:</span>
            <div className="space-y-1 text-[11px]">
              <div>✓ "Water boils at 100°C" → <strong className="text-emerald-400">Common Knowledge (No citation)</strong></div>
              <div>✓ "73% of Arctic ice melted over 4 decades" → <strong className="text-rose-400">Requires Citation (NASA, 2024)</strong></div>
            </div>
          </div>
        ),
        proTip: 'When in doubt, cite your source You will never get penalized for providing an extra citation.'
      },
      {
        stepNumber: 3,
        phaseTitle: 'The 5-Step Academic Integrity Procedure',
        badge: 'Research Method',
        headline: 'How to Incorporate Research Without Plagiarizing',
        explanation: 'Master the 5-step research pipeline: Read, Paraphrase, Quotation Marks, In-Text Citation, and Works Cited bibliography.',
        procedureBullets: [
          { title: '1. Read & Comprehend', desc: 'Understand the concept fully so you can explain it to a classmate.' },
          { title: '2. Authentic Paraphrase', desc: 'Close the source book and rewrite the concept in your own distinct vocabulary and syntax.' },
          { title: '3. Verbatim Quotation Marks', desc: 'If using 3+ consecutive words directly from the source, wrap them in quotation marks (" ").' },
          { title: '4. In-Text Citation', desc: 'Insert author surname and publication year immediately adjacent to the idea: (Hawking, 1988).' },
          { title: '5. Works Cited Bibliography', desc: 'Append the full bibliographic citation at the end of your document.' }
        ],
        interactiveWidget: (
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-750 space-y-2 text-xs">
            <span className="text-cyan-400 font-bold block">Interactive Quotation Snapper:</span>
            <div className="p-2 bg-slate-800 rounded font-serif text-[11px] text-slate-200">
              {demoQuotesActive ? '"even light itself cannot escape"' : 'even light itself cannot escape'} (Hawking, 1988)
            </div>
            <button
              onClick={() => {
                soundFx.playClick();
                setDemoQuotesActive(!demoQuotesActive);
              }}
              className="w-full py-1.5 bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
            >
              {demoQuotesActive ? '✓ Quotation Marks Applied (" ")' : '+ Click to Snap Quotation Marks'}
            </button>
          </div>
        ),
        proTip: 'Citing the author at the end of the sentence is still plagiarism if you copied verbatim words without quotation marks!'
      },
      {
        stepNumber: 4,
        phaseTitle: 'Comparative Case Audits',
        badge: 'Honor Council',
        headline: 'Why Student Papers Are Approved vs Flagged',
        explanation: 'Study submissions to the Originality Academy Honor Board to learn what constitutes patchwriting and self-plagiarism.',
        procedureBullets: [
          { title: 'Authentic Synthesis (Approved)', desc: 'Thoroughly restated principles in original prose, properly cited the doctor, and added original experimental data.' },
          { title: 'Patchwriting (Flagged)', desc: 'Swapping every 3rd word using a thesaurus while keeping identical sentence syntax is still plagiarism!' },
          { title: 'Missing Quotation Marks (Flagged)', desc: 'Cited the author at the end, but pasted 25 consecutive words verbatim without quotes.' },
          { title: 'Self-Plagiarism / Recycling (Flagged)', desc: 'Submitted an essay from 10th grade English to 12th grade Civics without explicit permission.' }
        ],
        interactiveWidget: (
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-750 space-y-1 text-xs text-slate-300">
            <span className="text-white font-bold block">What is "Patchwriting"?</span>
            <p className="text-[11px]">
              Patchwriting is when a student copies a sentence and merely changes a few words with a thesaurus. Because the original sentence structure remains, it proves the student didn't genuinely understand the concept.
            </p>
          </div>
        ),
        proTip: 'Each school class demands new scholarly effort. You cannot recycle past papers without written permission.'
      },
      {
        stepNumber: 5,
        phaseTitle: 'Lifelong Academic Record & Retractions',
        badge: 'Career Impact',
        headline: 'Does Plagiarism Expire? (Never)',
        explanation: 'Unlike patents that expire in 20 years, academic dishonesty has no statute of limitations. Degrees can be revoked 20 years later.',
        procedureBullets: [
          { title: 'Permanent Academic Transcript', desc: 'Notation of "XF" (Failure due to academic dishonesty) stays on your university record.' },
          { title: 'Retroactive Degree Revocation', desc: 'Universities regularly strip Ph.D. and Master\'s degrees decades later if plagiarism is uncovered.' },
          { title: 'Journal Retractions', desc: 'Published scientific papers are publicly retracted with public notices of misconduct.' }
        ],
        interactiveWidget: (
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-750 space-y-1 text-xs text-slate-300">
            <span className="text-cyan-400 font-bold block">Real-World Case:</span>
            <p className="text-[11px] leading-relaxed">
              In 2011, Germany’s Defense Minister Karl-Theodor zu Guttenberg resigned and had his doctorate revoked by the University of Bayreuth after an online audit revealed extensive uncredited copy-pasted passages in his 2006 thesis.
            </p>
          </div>
        ),
        proTip: 'Academic honesty follows you throughout your entire professional life.'
      },
      {
        stepNumber: 6,
        phaseTitle: 'Similarity Scanners & Honor Board Hearings',
        badge: 'Detection & Board',
        headline: 'Algorithmic Text Fingerprinting & Disciplinary Hearings',
        explanation: 'Understand how Turnitin-style algorithms cross-reference 90+ billion web pages and how honor councils conduct hearings.',
        procedureBullets: [
          { title: 'Text Fingerprinting', desc: 'Scanners break essays into 6-word shingles and match them against databases of web pages and student submissions.' },
          { title: 'Similarity Percentage', desc: 'A score above 20% triggers automatic faculty investigation for missing quotations and uncredited passages.' },
          { title: 'Honor Board Hearings', desc: 'Students present rough drafts, research outlines, and browser histories to prove honest scholarship.' }
        ],
        interactiveWidget: (
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-750 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300">Similarity Scanner Match:</span>
              <span className={`font-bold ${demoSimilarity < 10 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {demoSimilarity}% Similarity
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${demoSimilarity < 10 ? 'bg-emerald-400' : 'bg-rose-500'}`} 
                style={{ width: `${demoSimilarity}%` }} 
              />
            </div>
            <button
              onClick={() => {
                soundFx.playSuccess();
                setDemoSimilarity(prev => (prev === 85 ? 4 : 85));
                if (demoSimilarity === 85) confetti({ particleCount: 30, spread: 40 });
              }}
              className="w-full py-1.5 bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
            >
              {demoSimilarity === 85 ? '✓ Apply Proper Quotations & Citations' : 'Reset to Unquoted Draft'}
            </button>
          </div>
        ),
        proTip: 'Always run your paper through your school\'s draft scanner before clicking final submit.'
      }
    ]
  };

  const currentConceptMeta = CONCEPT_META[selectedConcept];
  const currentTutorialSteps = TUTORIAL_DATA[selectedConcept];
  const activeStep = currentTutorialSteps[currentStepIndex];

  const handleNextStep = () => {
    soundFx.playClick();
    if (currentStepIndex < currentTutorialSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      soundFx.playSuccess();
      confetti({ particleCount: 60, spread: 60 });
    }
  };

  const handlePrevStep = () => {
    soundFx.playClick();
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSwitchConcept = (concept) => {
    soundFx.playClick();
    setSelectedConcept(concept);
    setCurrentStepIndex(0);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* SIMULATION TUTORIAL TOP HEADER */}
      <div className="bg-slate-800/95 border border-slate-700 rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-slate-900 border ${currentConceptMeta.borderColor} flex items-center justify-center shadow-md`}>
              {currentConceptMeta.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-xs uppercase tracking-wider font-bold ${currentConceptMeta.textColor}`}>
                  Interactive Simulation Tutorial
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-xs text-slate-300">Step-by-Step Procedural Walkthrough</span>
              </div>
              <h2 className="text-2xl font-bold font-display text-white">{currentConceptMeta.title}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{currentConceptMeta.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onLaunchGame(selectedConcept)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${currentConceptMeta.buttonBg}`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Launch Playable Simulator
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 text-xs font-semibold text-slate-300 bg-slate-700/60 hover:bg-slate-700 hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              Back to Map
            </button>
          </div>
        </div>

        {/* 5 IP CONCEPT SWITCHER TABS */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-6 pt-4 border-t border-slate-700/80">
          {[
            { id: 'patent', label: 'Patent', icon: '🔬' },
            { id: 'trademark', label: 'Trademark', icon: '🏙️' },
            { id: 'copyright', label: 'Copyright', icon: '🎨' },
            { id: 'trade_secret', label: 'Trade Secret', icon: '🔐' },
            { id: 'plagiarism', label: 'Plagiarism', icon: '📚' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleSwitchConcept(tab.id)}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-2 ${
                selectedConcept === tab.id
                  ? 'bg-slate-700 border-amber-400 text-white font-bold shadow-md'
                  : 'bg-slate-850/60 border-slate-750 text-slate-400 hover:text-white hover:border-slate-650'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="text-xs block">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* STEP PROGRESS DOTS / TIMELINE */}
        <div className="mt-5 pt-3 border-t border-slate-700/60 flex items-center justify-between gap-2">
          <span className="text-xs text-slate-400 font-medium">
            Procedural Step {currentStepIndex + 1} of {currentTutorialSteps.length}:{' '}
            <strong className="text-white">{activeStep.phaseTitle}</strong>
          </span>

          <div className="flex items-center gap-1.5">
            {currentTutorialSteps.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  soundFx.playClick();
                  setCurrentStepIndex(idx);
                }}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  currentStepIndex === idx
                    ? 'bg-amber-400 text-slate-950 shadow-sm scale-105'
                    : idx < currentStepIndex
                    ? 'bg-slate-700 text-amber-300 border border-slate-600'
                    : 'bg-slate-800 text-slate-500 border border-slate-750 hover:text-slate-300'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ACTIVE STEP CARD */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 sm:p-8 space-y-6 shadow-lg">
        {/* Step Header */}
        <div className="border-b border-slate-700 pb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs uppercase font-bold px-2.5 py-0.5 rounded-full border ${currentConceptMeta.badgeBg}`}>
                {activeStep.badge}
              </span>
              <span className="text-xs text-slate-400">Step {activeStep.stepNumber} of 6</span>
            </div>
            <h3 className="text-2xl font-bold text-white mt-1.5">{activeStep.headline}</h3>
            <p className="text-sm text-slate-300 mt-1 leading-relaxed max-w-3xl">
              {activeStep.explanation}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              disabled={currentStepIndex === 0}
              onClick={handlePrevStep}
              className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextStep}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${currentConceptMeta.buttonBg}`}
            >
              {currentStepIndex === currentTutorialSteps.length - 1 ? 'Finish Tutorial' : 'Next Step'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2-Column Content: Left Details, Right Interactive Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Procedural Bullets & Explanation */}
          <div className="lg:col-span-7 space-y-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Official Procedural Workflow:
            </span>

            <div className="space-y-2.5">
              {activeStep.procedureBullets.map((bullet, idx) => (
                <div key={idx} className="p-3.5 bg-slate-850 rounded-2xl border border-slate-750 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 text-amber-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{bullet.title}</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{bullet.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pro Tip Box */}
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-750 flex items-start gap-2.5 text-xs text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 block mb-0.5">Examiner / Judicial Pro Tip:</strong>
                <p className="text-[11px] text-slate-300 leading-relaxed">{activeStep.proTip}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Live Interactive Sandbox Widget */}
          <div className="lg:col-span-5 bg-slate-850 rounded-2xl p-5 border border-slate-750 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-750 pb-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> Interactive Sandbox Widget
              </span>
              <span className="text-[10px] text-slate-400">Live Simulation</span>
            </div>

            {activeStep.interactiveWidget}

            {/* Direct Game Launch Call-To-Action */}
            <div className="pt-2 border-t border-slate-750">
              <div className="text-[11px] text-slate-400 mb-2">
                Ready to play the full hands-on simulator with all 7 procedure stages?
              </div>
              <button
                onClick={() => onLaunchGame(selectedConcept)}
                className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${currentConceptMeta.buttonBg}`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Launch Full {CONCEPT_META[selectedConcept].title.split(' ')[0]} Simulator
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Navigation Toolbar */}
        <div className="pt-4 border-t border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Need to revisit an earlier step?</span>
            <button
              onClick={() => setCurrentStepIndex(0)}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              Restart from Step 1
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentStepIndex === 0}
              onClick={handlePrevStep}
              className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 transition-all cursor-pointer"
            >
              Previous Step
            </button>
            <button
              onClick={handleNextStep}
              className={`px-5 py-2 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer ${currentConceptMeta.buttonBg}`}
            >
              {currentStepIndex === currentTutorialSteps.length - 1 ? 'Complete Tutorial' : 'Continue to Next Step'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
