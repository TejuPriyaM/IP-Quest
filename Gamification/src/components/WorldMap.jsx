import React, { useState } from 'react';
import { soundFx } from '../utils/sound';
import { 
  Lightbulb, Feather, ShieldCheck, Lock, GraduationCap, Search, 
  Package, Sparkles, Trophy, Star, Shield, ArrowRight, BookOpen, 
  Flame, CheckCircle2, HelpCircle, AlertCircle
} from 'lucide-react';
import { ModuleQuizModal } from './ModuleQuizModal';

const REGIONS= [
  {
    concept: 'patent',
    name: 'Patent Lab',
    theme: '3D Smart Irrigation Challenge',
    icon: <Lightbulb className="w-8 h-8 text-amber-400" />,
    bgGradient: 'from-amber-950/40 via-slate-900 to-amber-900/20',
    borderColor: 'border-amber-500/50 hover:border-amber-400',
    textColor: 'text-amber-400',
    tagline: 'Step into the farm Help Farmer Ramesh, collect 3 machine parts, build the smart water-saving invention at the workbench, and get a 20-year patent!',
    easyPointSummary: 'Protects HOW INVENTIONS WORK (20 Years)',
    easyRule: 'An idea alone cannot be patented until it is built into a practical, working machine!',
    missionCount: 5
  },
  {
    concept: 'copyright',
    name: 'Creator Studio',
    theme: '3D Protect Creative Work',
    icon: <Feather className="w-8 h-8 text-indigo-400" />,
    bgGradient: 'from-indigo-950/40 via-slate-900 to-purple-900/20',
    borderColor: 'border-indigo-500/50 hover:border-indigo-400',
    textColor: 'text-indigo-400',
    tagline: 'Step into the neon studio Help Artist Luna save her drawing, stop copycat festival t-shirts, and learn how copyright protects art!',
    easyPointSummary: 'Protects ORIGINAL CREATIVE ART & MEDIA (Automatic)',
    easyRule: 'Saying "credit to artist" is NOT a commercial license to print & sell!',
    missionCount: 5
  },
  {
    concept: 'trademark',
    name: 'Brand City',
    theme: '3D Build a Distinctive Brand',
    icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
    bgGradient: 'from-emerald-950/40 via-slate-900 to-teal-900/20',
    borderColor: 'border-emerald-500/50 hover:border-emerald-400',
    textColor: 'text-emerald-400',
    tagline: 'Walk Market Street Help shoppers confused by copycats, create the unique coined brand CitroVibe™, and install a glowing neon store sign!',
    easyPointSummary: 'Protects BRAND NAMES, LOGOS & SLOGANS (Can last forever)',
    easyRule: 'Made-up coined words (like CitroVibe™ or Kodak) get maximum 100% legal power!',
    missionCount: 5
  },
  {
    concept: 'trade_secret',
    name: 'The Secret Vault',
    theme: '3D High-Security Vault Facility',
    icon: <Lock className="w-8 h-8 text-rose-400" />,
    bgGradient: 'from-rose-950/40 via-slate-900 to-pink-900/20',
    borderColor: 'border-rose-500/50 hover:border-rose-400',
    textColor: 'text-rose-400',
    tagline: 'Explore the high-tech lab Lock the secret recipe in the safe with PIN 9042, set computer auto-locks, and block sneaky cyber hackers!',
    easyPointSummary: 'Protects CONFIDENTIAL RECIPES & CODE (No expiration date)',
    easyRule: 'You MUST maintain reasonable security (locks, passwords) or rights are lost forever!',
    missionCount: 5
  },
  {
    concept: 'plagiarism',
    name: 'Originality Academy',
    theme: '3D Plagiarism Investigation',
    icon: <GraduationCap className="w-8 h-8 text-cyan-400" />,
    bgGradient: 'from-cyan-950/40 via-slate-900 to-blue-900/20',
    borderColor: 'border-cyan-500/50 hover:border-cyan-400',
    textColor: 'text-cyan-400',
    tagline: 'Explore the campus library Help student Jordan fix a copied essay, learn how to cite sources, and fire the Academic Integrity Beacon!',
    easyPointSummary: 'Protects ACADEMIC HONESTY & ATTRIBUTION',
    easyRule: 'Paraphrase in your own voice, use quotation marks, and always cite author & year!',
    missionCount: 5
  }
];

const EASY_POINTS_MAP = {
  patent: {
    title: 'Patent: How Inventions Work',
    icon: '💡',
    definition: 'Exclusive legal right granted by the government to make and sell a new technical machine or process for 20 years.',
    color: 'text-amber-400',
    badge: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
    points: [
      '1. Novelty: It must never have existed or been published anywhere in the world before.',
      '2. Inventive Step: It cannot be an obvious tweak that any mechanic could easily guess.',
      '3. Practical Utility: An unbuilt idea in your head cannot be patented—it must actually work!'
    ],
    example: 'Real Example: James Dyson patented the dual-cyclone bagless vacuum mechanism.',
    goldenRule: 'Patents protect how tools WORK. Brand names are Trademarks. Ideas alone are not patentable!',
    do: 'DO build and test a physical working prototype.',
    dont: 'DON\'T try to patent just a brand name or an unbuilt thought.'
  },
  copyright: {
    title: 'Copyright: Protecting Creative Art',
    icon: '🎨',
    definition: 'Automatic protection for original artistic expressions (drawings, music, books, videos, software code) the moment they are created.',
    color: 'text-indigo-400',
    badge: 'bg-indigo-400/20 text-indigo-300 border-indigo-400/40',
    points: [
      '1. Instant & Automatic: Vests the exact second you draw, record, or write it. No fee required!',
      '2. Protects Expression, Not Ideas: Anyone can write about wizards, but cannot copy Harry Potter.',
      '3. Credit is NOT a License: Saying "credit to artist" does not allow selling festival merchandise!'
    ],
    example: 'Real Example: Disney owns the copyright to Frozen songs; others cannot sell them without paying royalties.',
    goldenRule: 'The creator has the exclusive right to sell copies. Giving credit is not a free license!',
    do: 'DO ask permission and pay a licensing fee before selling another\'s artwork.',
    dont: 'DON\'T believe tagging an artist on social media gives you commercial rights.'
  },
  trademark: {
    title: 'Trademark: Protecting Brand Identity',
    icon: '™️',
    definition: 'Protects brand names, logos, symbols, and slogans to prevent customer confusion in the marketplace.',
    color: 'text-emerald-400',
    badge: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40',
    points: [
      '1. Stops Customer Confusion: Ensures shoppers know who made the juice or sneakers.',
      '2. Coined Names are Strongest: Invented words (CitroVibe™, Kodak) get 100% legal power.',
      '3. Can Last Forever: Does not expire if renewed every 10 years and used in business.'
    ],
    example: 'Real Example: The Nike Swoosh and word "Nike" tell shoppers the sneakers are genuine.',
    goldenRule: 'Trademarks protect shoppers from knock-offs. Generic everyday words get 0% protection!',
    do: 'DO invent a unique coined word for your brand.',
    dont: 'DON\'T try to trademark common generic words like "Juice".'
  },
  trade_secret: {
    title: 'Trade Secret: Confidential Know-How',
    icon: '🔐',
    definition: 'Protects confidential business formulas, secret recipes, and algorithms by keeping them strictly secret.',
    color: 'text-rose-400',
    badge: 'bg-rose-400/20 text-rose-300 border-rose-400/40',
    points: [
      '1. Secret + Economic Value: Must give your business a competitive edge because others don\'t know it.',
      '2. Must Maintain Reasonable Precautions: You MUST use passwords, vaults, and NDAs!',
      '3. Never Expires: Unlike patents (which expire in 20 years), trade secrets can last centuries!'
    ],
    example: 'Real Example: Coca-Cola has protected its secret formula in a vault for over 135 years.',
    goldenRule: 'If you leave it unencrypted or post it online, legal protection is gone forever!',
    do: 'DO enforce passwords, biometric safes, and confidentiality NDAs.',
    dont: 'DON\'T leave secret formulas on open desks or unencrypted drives.'
  },
  plagiarism: {
    title: 'Plagiarism: Academic Honesty & Attribution',
    icon: '📚',
    definition: 'Ethical academic standard in school: borrowing another person\'s words or ideas without giving them proper credit.',
    color: 'text-cyan-400',
    badge: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/40',
    points: [
      '1. Ethical Trust vs Legal Property: Plagiarism is a school honesty rule; copyright is legal property.',
      '2. Swapping 2 Words is NOT Enough: Changing a couple of words is "patchwriting" and still counts!',
      '3. The 3-Step Fix: Paraphrase in your own voice + quote exact words + cite (Author, Year).'
    ],
    example: 'Real Example: A research paper citing (Lin, 2021) gets top marks, while copying text causes failure.',
    goldenRule: 'Celebrate your own voice If you borrow someone else\'s insight, always cite the source.',
    do: 'DO write in your own authentic voice and add parenthetical citations.',
    dont: 'DON\'T copy-paste paragraphs or swap synonyms without attribution.'
  }
};

export const WorldMap = ({
  stats,
  onSelectRegion,
  onOpenDetective,
  onOpenLocker,
  onOpenStory,
  onOpenDaily,
  onOpenLibrary,
  onOpenTutorial,
  onOpenConceptsGuide,
  onOpenMatcher
}) => {
  const [selectedEasyConcept, setSelectedEasyConcept] = useState('patent');
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizConcept, setQuizConcept] = useState('patent');
  const [guideView, setGuideView] = useState('cards');

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero Mission Directive Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-slate-700/80 p-8 overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Intellectual Property Quest • School Edition</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-display tracking-tight leading-tight">
            Defend Innovation. Master Intellectual Property Through Gameplay.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Welcome, Guardian Master the 5 superhero pillars of innovation: <strong>Patents</strong>, <strong>Copyrights</strong>, <strong>Trademarks</strong>, <strong>Trade Secrets</strong>, and <strong>Academic Originality</strong>. Choose your favorite game style below—play easy visual 2D labs or explore full 3D interactive worlds
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            {onOpenMatcher && (
              <button
                onClick={() => { soundFx.playClick(); onOpenMatcher(); }}
                className="px-6 py-3 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 hover:from-yellow-200 hover:to-amber-300 text-slate-950 font-black text-sm rounded-xl transition-all flex items-center gap-2.5 cursor-pointer shadow-xl shadow-yellow-500/25 border-2 border-yellow-200 hover:scale-105"
              >
                <span>🎯 60-SEC CONCEPT MATCHER (Super Easy)</span>
              </button>
            )}
            <button
              onClick={() => { soundFx.playClick(); onSelectRegion('patent', '2d'); }}
              className="px-5 py-3 bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-500 hover:from-teal-300 hover:to-emerald-400 text-slate-950 font-black text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xl shadow-teal-500/25 border-2 border-teal-200 hover:scale-105"
            >
              <span>🎮 PLAY 2D LAB (Easy Step-by-Step)</span>
            </button>
            <button
              onClick={() => { soundFx.playClick(); onSelectRegion('patent', '3d'); }}
              className="px-5 py-3 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xl shadow-amber-400/25 border-2 border-amber-200 hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>🌐 PLAY 3D WORLD</span>
            </button>
            {onOpenConceptsGuide && (
              <button
                onClick={() => { soundFx.playClick(); onOpenConceptsGuide(); }}
                className="px-4 py-2.5 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/50 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>💡 5 Rules Cheat Sheet</span>
              </button>
            )}
            <button
              onClick={() => { soundFx.playClick(); onOpenDetective(); }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Search className="w-4 h-4 text-amber-400" />
              <span>IP Detective</span>
            </button>
            <button
              onClick={() => { soundFx.playClick(); onOpenLocker(); }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>IP Locker</span>
            </button>
            <button
              onClick={() => { soundFx.playClick(); onOpenDaily(); }}
              className="px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Flame className="w-4 h-4 text-rose-400" />
              <span>Daily (+35 XP)</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ============================================================== */}
      {/* 5 IP CONCEPTS MADE EASY: INTERACTIVE STUDENT QUICK-GUIDE */}
      {/* ============================================================== */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border-2 border-amber-400/60 shadow-2xl space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center text-2xl border border-amber-400/30">
              💡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  Made Super Simple for Students
                </span>
                <span className="text-xs text-slate-400">• The 5 Superpowers of Innovation</span>
              </div>
              <h2 className="text-xl font-black text-white font-display mt-0.5">
                The 5 IP Concepts Explained Simply
              </h2>
            </div>
          </div>

          {/* Quick Learning View Switcher & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700">
              <button
                onClick={() => { soundFx.playClick(); setGuideView('cards'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  guideView === 'cards'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🎴 Focused Cards
              </button>
              <button
                onClick={() => { soundFx.playClick(); setGuideView('table'); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  guideView === 'table'
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                📊 All 5 Cheat Table
              </button>
            </div>

            {onOpenMatcher && (
              <button
                onClick={() => { soundFx.playClick(); onOpenMatcher(); }}
                className="px-3.5 py-1.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <span>🎯 60-Sec Matcher Game</span>
              </button>
            )}

            <button
              onClick={() => {
                soundFx.playClick();
                onSelectRegion(selectedEasyConcept);
              }}
              className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-400/20"
            >
              <span>Play 3D {EASY_POINTS_MAP[selectedEasyConcept].title.split(':')[0]}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* VIEW 1: All 5 Cheat Table (Comparison at a Glance) */}
        {guideView === 'table' ? (
          <div className="space-y-4 animate-fade-in">
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Concept</th>
                    <th className="py-3.5 px-4">What It Protects</th>
                    <th className="py-3.5 px-4">Duration</th>
                    <th className="py-3.5 px-4">#1 Golden Simple Rule</th>
                    <th className="py-3.5 px-4">Everyday Example</th>
                    <th className="py-3.5 px-4 text-right">Quick Play</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {[
                    {
                      id: 'patent',
                      name: 'Patent',
                      icon: '💡',
                      badge: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
                      protects: 'HOW INVENTIONS WORK',
                      protectsSub: 'Physical machines, mechanisms, automated tools',
                      duration: '20 Years',
                      rule: 'Must be brand new & built into a machine An unbuilt thought cannot be patented.',
                      example: 'Automatic water-saving sprinkler, solar scooter motor',
                      color: 'text-amber-400'
                    },
                    {
                      id: 'copyright',
                      name: 'Copyright',
                      icon: '🎨',
                      badge: 'bg-indigo-400/20 text-indigo-300 border-indigo-400/40',
                      protects: 'CREATIVE ART & MUSIC',
                      protectsSub: 'Drawings, songs, stories, poems, game code',
                      duration: 'Creator Life + 70 Yrs',
                      rule: 'Automatic protection Saying "credit to artist" is NOT a license to sell prints or shirts!',
                      example: 'Comic book character drawings, acoustic songs, video games',
                      color: 'text-indigo-400'
                    },
                    {
                      id: 'trademark',
                      name: 'Trademark',
                      icon: '🏷️',
                      badge: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40',
                      protects: 'BRAND NAMES & LOGOS',
                      protectsSub: 'Store emblems, sneaker logos, brand words & slogans',
                      duration: 'Forever (Renew 10y)',
                      rule: 'Protects shoppers from fake knockoffs Made-up coined words (CitroVibe™, Kodak) get 100% power!',
                      example: 'Nike Swoosh, Apple logo, CitroVibe™ coined juice name',
                      color: 'text-emerald-400'
                    },
                    {
                      id: 'trade_secret',
                      name: 'Trade Secret',
                      icon: '🤫',
                      badge: 'bg-rose-400/20 text-rose-300 border-rose-400/40',
                      protects: 'SECRET RECIPES & CODE',
                      protectsSub: 'Confidential formulas, recipes, algorithms, methods',
                      duration: 'Forever (If secret)',
                      rule: 'Keep locked in safes with passwords If leaked or posted online, protection is gone forever!',
                      example: 'Coca-Cola syrup recipe in vault, KFC 11 spices',
                      color: 'text-rose-400'
                    },
                    {
                      id: 'plagiarism',
                      name: 'Plagiarism',
                      icon: '📝',
                      badge: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/40',
                      protects: 'SCHOOL ACADEMIC HONESTY',
                      protectsSub: 'Giving credit to original authors and researchers',
                      duration: 'School Ethics Rule',
                      rule: 'Never copy homework 1. Use your own words, 2. Put quotes ("..."), 3. Always cite author & year!',
                      example: 'Copying an encyclopedia paragraph into science essay without credit',
                      color: 'text-cyan-400'
                    }
                  ].map(row => (
                    <tr key={row.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{row.icon}</span>
                          <div>
                            <span className={row.color}>{row.name}</span>
                            <span className={`block text-[10px] px-2 py-0.5 rounded-full border w-fit mt-0.5 ${row.badge}`}>
                              {row.id === 'patent' ? 'Inventions' : row.id === 'copyright' ? 'Creative Art' : row.id === 'trademark' ? 'Brands' : row.id === 'trade_secret' ? 'Secret Recipe' : 'School Honesty'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-200">{row.protects}</div>
                        <div className="text-[11px] text-slate-400">{row.protectsSub}</div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-300 whitespace-nowrap">
                        {row.duration}
                      </td>
                      <td className="py-3 px-4 text-slate-300 leading-snug max-w-xs">
                        {row.rule}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px] max-w-xs">
                        {row.example}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              soundFx.playClick();
                              onSelectRegion(row.id, '2d');
                            }}
                            className="px-2.5 py-1 bg-teal-500/20 hover:bg-teal-500/35 border border-teal-500/50 text-teal-200 rounded-lg font-bold text-[11px] transition-all cursor-pointer"
                            title="Play 2D Lab"
                          >
                            🎮 2D
                          </button>
                          <button
                            onClick={() => {
                              soundFx.playClick();
                              onSelectRegion(row.id, '3d');
                            }}
                            className="px-2.5 py-1 bg-amber-400/20 hover:bg-amber-400/35 border border-amber-400/50 text-amber-300 rounded-lg font-bold text-[11px] transition-all cursor-pointer"
                            title="Play 3D Realm"
                          >
                            🌐 3D
                          </button>
                          <button
                            onClick={() => {
                              soundFx.playClick();
                              setQuizConcept(row.id);
                              setShowQuizModal(true);
                            }}
                            className="px-2.5 py-1 bg-indigo-500/20 hover:bg-indigo-500/35 border border-indigo-500/50 text-indigo-300 rounded-lg font-bold text-[11px] transition-all cursor-pointer"
                            title="Attend Topic Quiz"
                          >
                            🏆 Quiz
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
              <span>💡 Tip: Click <strong>"🎮 2D"</strong> on any concept to play its step-by-step interactive simulation, or <strong>"🎯 60-Sec Matcher Game"</strong> to test sorting!</span>
              {onOpenMatcher && (
                <button
                  onClick={() => { soundFx.playClick(); onOpenMatcher(); }}
                  className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                >
                  Start 60-Second Matcher Now ➔
                </button>
              )}
            </div>
          </div>
        ) : (
          /* VIEW 2: Focused 5 Concept Selectors + Deep Dive Card */
          <>
            {/* 5 Concept Selectors */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'patent', label: '1. Patent', icon: '💡', sub: 'Inventions (20 yrs)' },
                { id: 'copyright', label: '2. Copyright', icon: '🎨', sub: 'Creative Art' },
                { id: 'trademark', label: '3. Trademark', icon: '™️', sub: 'Brand Names' },
                { id: 'trade_secret', label: '4. Trade Secret', icon: '🔐', sub: 'Secret Recipes' },
                { id: 'plagiarism', label: '5. Plagiarism', icon: '📚', sub: 'School Honesty' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundFx.playClick();
                    setSelectedEasyConcept(tab.id);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedEasyConcept === tab.id
                      ? 'bg-amber-400/15 border-amber-400 text-white shadow-lg'
                      : 'bg-slate-800/60 border-slate-750 hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{tab.icon}</span>
                    {selectedEasyConcept === tab.id && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="font-extrabold text-xs text-white">{tab.label}</div>
                    <div className="text-[10px] text-slate-400">{tab.sub}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Concept Deep-Dive Card */}
            {(() => {
              const cInfo = EASY_POINTS_MAP[selectedEasyConcept];
              return (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{cInfo.icon}</span>
                      <h3 className="text-lg font-black text-white">{cInfo.title}</h3>
                    </div>
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${cInfo.badge} self-start sm:self-auto`}>
                      {cInfo.goldenRule}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                    {cInfo.definition}
                  </p>

                  {/* 3 Easy Points Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {cInfo.points.map((pt, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>

                  {/* Do vs Don't and Real World Example */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                    <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200">
                      <div className="font-bold flex items-center gap-1.5 text-emerald-300 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Correct Action (DO)</span>
                      </div>
                      <span>{cInfo.do}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-200">
                      <div className="font-bold flex items-center gap-1.5 text-rose-300 mb-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Common Trap (DON'T)</span>
                      </div>
                      <span>{cInfo.dont}</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-slate-300">
                      <div className="font-bold flex items-center gap-1.5 text-amber-300 mb-1">
                        <Star className="w-3.5 h-3.5 text-amber-400" />
                        <span>Everyday Example</span>
                      </div>
                      <span>{cInfo.example}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        onSelectRegion(selectedEasyConcept, '2d');
                      }}
                      className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-teal-500/20"
                    >
                      <span>🎮 Play 2D {cInfo.title.split(':')[0]} Lab (Easy Step-by-Step)</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        onSelectRegion(selectedEasyConcept, '3d');
                      }}
                      className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <Sparkles className="w-4 h-4 text-slate-950" />
                      <span>Enter 3D {cInfo.title.split(':')[0]} Realm</span>
                    </button>
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setQuizConcept(selectedEasyConcept);
                        setShowQuizModal(true);
                      }}
                      className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-black text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
                    >
                      <Trophy className="w-4 h-4 text-amber-300" />
                      <span>Attend Quiz ➔</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>

      {/* Featured 5 Regions Map Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold font-display text-white">The Five Realms of IP Quest</h2>
            <p className="text-xs text-slate-400">Select any region to enter hands-on 3D real-time gameplay</p>
          </div>
          <span className="text-xs text-slate-400 font-mono">5/5 Realms Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {REGIONS.map((region, idx) => (
            <div
              key={region.concept}
              className={`p-6 rounded-2xl border-2 transition-all relative overflow-hidden group bg-gradient-to-b ${region.bgGradient} ${region.borderColor} shadow-lg`}
            >
              <div className="flex items-start justify-between">
                <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-750 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  {region.icon}
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Realm 0{idx + 1}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${region.textColor}`}>
                  {region.theme}
                </span>
                <h3 className="text-xl font-bold text-white font-display">
                  {region.name}
                </h3>

                {/* Glowing Easy Point Summary Badge */}
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-400/40 text-[11px] space-y-1">
                  <div className="font-extrabold text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Easy Point: {region.easyPointSummary}</span>
                  </div>
                  <div className="text-[10px] text-slate-300 leading-tight">
                    {region.easyRule}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {region.tagline}
                </p>
              </div>

              {/* Dual Play Action Buttons: 2D Easy Lab vs 3D Realm */}
              <div className="mt-5 pt-3 border-t border-slate-750/70 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Choose Game Style:</span>
                  <span>{region.missionCount} Missions</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onSelectRegion(region.concept, '2d');
                    }}
                    className="py-2 px-2.5 rounded-xl bg-teal-500/20 hover:bg-teal-500/35 border border-teal-500/50 text-teal-200 font-bold text-[11px] text-center transition-all cursor-pointer shadow-sm hover:scale-[1.02] flex items-center justify-center gap-1"
                    title="Easy visual step-by-step puzzles"
                  >
                    <span>🎮 2D Lab</span>
                  </button>
                  <button
                    onClick={() => {
                      soundFx.playClick();
                      onSelectRegion(region.concept, '3d');
                    }}
                    className={`py-2 px-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[11px] text-center transition-all cursor-pointer shadow-sm hover:scale-[1.02] flex items-center justify-center gap-1`}
                    title="Full 3D walkaround realm"
                  >
                    <Sparkles className="w-3 h-3 text-slate-950" />
                    <span>🌐 3D Realm</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* 6th Card: Grand Syndicate Case */}
          <div
            onClick={() => {
              soundFx.playClick();
              onOpenStory();
            }}
            className="p-6 rounded-2xl border-2 border-purple-500/50 hover:border-purple-400 transition-all cursor-pointer relative overflow-hidden group bg-gradient-to-b from-purple-950/40 via-slate-900 to-indigo-950/30 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-start justify-between">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-750 flex items-center justify-center text-purple-400 shadow-md group-hover:scale-110 transition-transform">
                <Trophy className="w-8 h-8" />
              </div>
              <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                Campaign
              </span>
            </div>

            <div className="mt-4 space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                Narrative Adventure
              </span>
              <h3 className="text-xl font-bold text-white font-display group-hover:text-purple-300 transition-colors">
                The Copy Cats Chronicles
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                6-chapter episodic storyline defending the realm against counterfeiters and intellectual property thieves.
              </p>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-750/70 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">6 Story Chapters</span>
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                View Episodes <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges and Mastery Milestones */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Your Earned IP Guardian Badges</h3>
          </div>
          <button
            onClick={() => { soundFx.playClick(); onOpenLibrary(); }}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            View IP Cards Library
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { id: 'b_patent', name: 'Patent Pioneer', icon: '💡', desc: 'Invention master' },
            { id: 'b_copy', name: 'Copyright Creator', icon: '🎨', desc: 'Expression guardian' },
            { id: 'b_trade', name: 'Brand Builder', icon: '™️', desc: 'Trademark champion' },
            { id: 'b_secret', name: 'Secret Keeper', icon: '🔐', desc: 'Vault security' },
            { id: 'b_plag', name: 'Originality Star', icon: '📚', desc: 'Academic integrity' },
            { id: 'b_detect', name: 'Master Detective', icon: '🕵️', desc: 'Cross-concept expert' }
          ].map(badge => {
            const hasBadge = stats.badges.includes(badge.name) || stats.completedMissions.length > 0;
            return (
              <div
                key={badge.id}
                className={`p-3.5 rounded-xl border text-center transition-all ${
                  hasBadge
                    ? 'bg-slate-850 border-amber-500/50 shadow-sm'
                    : 'bg-slate-900 border-slate-800 opacity-40'
                }`}
              >
                <div className="text-2xl mb-1">{badge.icon}</div>
                <div className="text-xs font-bold text-white truncate">{badge.name}</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5">{badge.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Module Quizzes Modal with Next Quiz Continuous Chain */}
      <ModuleQuizModal
        isOpen={showQuizModal}
        initialConcept={quizConcept}
        onClose={() => setShowQuizModal(false)}
        onJumpToRealm={(c) => {
          onSelectRegion(c);
        }}
      />
    </div>
  );
};
