import React, { useState, useRef, useEffect } from 'react';
import { soundFx } from '../../utils/sound';
import { 
  Feather, Palette, Music, Sparkles, CheckCircle2, AlertCircle, ArrowRight, 
  Shield, Check, Clock, Scale, FileText, Ban, HelpCircle, ArrowLeft, 
  Eye, Award, Image, Volume2, Stamp, Trash2, Undo2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CreatorStudioGame = ({ onComplete, onBack, onOpenTutorial, onSwitchTo3D, onSwitchToQuick }) => {
  const [currentStep, setCurrentStep] = useState('1_enter_studio');
  const [progressCount, setProgressCount] = useState(1);

  // STEP 1: Studio Exploration
  const [easelInspected, setEaselInspected] = useState(false);
  const [musicDeskInspected, setMusicDeskInspected] = useState(false);
  const [galleryPortalInspected, setGalleryPortalInspected] = useState(false);

  // STEP 2: Interactive Canvas Drawing
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#38bdf8'); // sky blue
  const [brushSize, setBrushSize] = useState(6);
  const [hasDrawnStrokes, setHasDrawnStrokes] = useState(false);
  const [savedArtworkUrl, setSavedArtworkUrl] = useState(null);

  // STEP 3: Fixation Metadata
  const [fixationHash, setFixationHash] = useState('');
  const [fixationTimestamp, setFixationTimestamp] = useState('');

  // STEP 4: Media Exploration (Idea vs Expression)
  const [exploredMedia, setExploredMedia] = useState({});

  // STEP 6: Records Inspection
  const [inspectedRecords, setInspectedRecords] = useState({
    originalDrafts: false,
    licenseCheck: false,
    infringementScope: false
  });

  // STEP 7: Artist Response Strategy
  const [selectedResponse, setSelectedResponse] = useState(null);

  // STEP 8: Authorized vs Permission Matrix
  const [sortedScenarios, setSortedScenarios] = useState({});

  // STEP 9: Exhibition Curation Choices
  const [musicTrackChoice, setMusicTrackChoice] = useState('cc_soundtrack');
  const [backdropChoice, setBackdropChoice] = useState('open_license');
  const [exhibitionCurated, setExhibitionCurated] = useState(false);

  const STEPS_LIST = [
    { id: '1_enter_studio', title: '1. Creative Studio', num: 1 },
    { id: '2_draw_artwork', title: '2. Create Artwork', num: 2 },
    { id: '3_save_fixation', title: '3. Tangible Fixation', num: 3 },
    { id: '4_explore_media', title: '4. Idea vs Expression', num: 4 },
    { id: '5_compare_reused', title: '5. Compare Flyer', num: 5 },
    { id: '6_inspect_records', title: '6. Check Ownership', num: 6 },
    { id: '7_artist_response', title: '7. Legal Response', num: 7 },
    { id: '8_authorized_sorting', title: '8. Fair Use Sorting', num: 8 },
    { id: '9_curate_exhibition', title: '9. Curate Exhibition', num: 9 },
    { id: '10_publish_gallery', title: '10. Publish Gallery', num: 10 }
  ];

  const advanceTo = (next, nextNum) => {
    soundFx.playSuccess();
    setCurrentStep(next);
    setProgressCount(Math.max(progressCount, nextNum));
  };

  // Canvas setup & default preset
  useEffect(() => {
    if (currentStep === '2_draw_artwork' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx && !hasDrawnStrokes) {
        // Fill canvas dark backdrop
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw a decorative starter mascot outline
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(200, 140, 60, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 14px sans-serif';
        ctx.fillText('Draw your original creation!', 110, 145);
      }
    }
  }, [currentStep, hasDrawnStrokes]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawnStrokes(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    soundFx.playClick();
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const stampIcon = ( symbol) => {
    soundFx.playClick();
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    setHasDrawnStrokes(true);
    ctx.font = '36px serif';
    ctx.fillText(symbol, 150 + Math.random() * 80, 100 + Math.random() * 80);
  };

  const handleSaveArtwork = () => {
    if (canvasRef.current) {
      soundFx.playSuccess();
      const url = canvasRef.current.toDataURL('image/png');
      setSavedArtworkUrl(url);
      setFixationHash(`SHA256: 8f9b4e2a...c017d`);
      setFixationTimestamp(new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      }));
      advanceTo('3_save_fixation', 3);
    }
  };

  const MEDIA_EXAMPLES = [
    {
      id: 'graphic_novel',
      title: 'Illustrated Graphic Novel',
      type: 'Visual & Literary Work',
      icon: '🎨',
      protectable: true,
      reason: 'Protected by Copyright Original comic character art, panels, and scripted dialogues are creative expressions.'
    },
    {
      id: 'superhero_idea',
      title: 'Concept: "A teenage hero who talks to trees"',
      type: 'Raw Abstract Idea',
      icon: '💭',
      protectable: false,
      reason: 'UNPROTECTED The Idea-Expression Dichotomy states ideas can NEVER be copyrighted. Anyone can write their own tree-hero story.'
    },
    {
      id: 'melody_song',
      title: 'Original Lo-Fi Synth Soundtrack',
      type: 'Musical Composition & Sound Recording',
      icon: '🎵',
      protectable: true,
      reason: 'Protected by Copyright The recorded arrangement, melody notes, and sound recording are automatically protected upon audio render.'
    },
    {
      id: 'title_name',
      title: 'Book Title: "The Tree Hero"',
      type: 'Short Phrase / Book Title',
      icon: '🏷️',
      protectable: false,
      reason: 'UNPROTECTED BY COPYRIGHT Titles, slogans, and short phrases lack sufficient expressive authorship for copyright (may qualify for trademark if identifying commercial brand).'
    }
  ];

  const SCENARIOS = [
    {
      id: 'scen1',
      title: 'High School Art Class Slide',
      desc: 'An art teacher displays Jordan\'s drawing on an overhead projector to critique complementary color theory in a free classroom lesson.',
      correct: 'authorized',
      reason: 'Fair Use / Fair Dealing: Educational instruction and non-commercial critical analysis is authorized by law.'
    },
    {
      id: 'scen2',
      title: 'Merchandise Hoodie Sales',
      desc: 'A commercial fashion website prints Jordan\'s character onto 2,000 hoodies and sells each for $48 without a license.',
      correct: 'needs_permission',
      reason: 'Requires Permission: Commercial reproduction and merchandising directly exploits the creator\'s exclusive market rights.'
    },
    {
      id: 'scen3',
      title: 'Satirical Parody Webcomic',
      desc: 'A satirical cartoonist draws an exaggerated parody of the character in a humorous political critique commenting on deforestation.',
      correct: 'authorized',
      reason: 'Fair Use / Parody: Transformative commentary and parody targeting the original work is protected under speech doctrines.'
    },
    {
      id: 'scen4',
      title: 'Social Media Promotion with Credit',
      desc: 'An influencer posts Jordan\'s full artwork to advertise an energy drink sponsor, adding: "Credit to Jordan for this cool drawing!"',
      correct: 'needs_permission',
      reason: 'Requires Permission Giving attribution DOES NOT authorize commercial promotional use without the artist\'s consent.'
    }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { soundFx.playClick(); onBack(); }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Return to World Map"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-indigo-500/20">
              <Feather className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                  Creator Studio Mission
                </span>
                <span className="text-xs text-slate-400">Protect Creative Work & Copyright</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight mt-0.5">
                The Creative Work Protection Mission
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
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                title="Explore the Creator Studio in full 3D!"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>🌐 3D Facility</span>
              </button>
            )}

            {onOpenTutorial && (
              <button
                onClick={() => { soundFx.playClick(); onOpenTutorial(); }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                Copyright Guide
              </button>
            )}

            {/* Clear Student Inventor Face Display */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-indigo-500/40 shadow-md">
              <div className="w-8 h-8 rounded-full bg-gradient-to-b from-sky-400 to-indigo-600 border border-indigo-400 overflow-hidden shadow-inner flex items-center justify-center shrink-0">
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
                <span className="text-[9px] text-indigo-400 font-bold block leading-none">INVENTOR</span>
                <span className="text-xs font-black text-white leading-tight">Student</span>
              </div>
            </div>

            {/* Right-Top Steps Indicator */}
            <div className="px-3.5 py-1.5 rounded-xl bg-indigo-500/15 border border-indigo-400/60 text-indigo-300 font-black text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/10">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Step {STEPS_LIST.find(s => s.id === currentStep)?.num || 1} of 10</span>
            </div>
          </div>
        </div>

        {/* Active Step & Next Step Progression Strip (Completed steps are hidden) */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Step:</span>
            <div className="px-3.5 py-1.5 rounded-xl bg-indigo-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step {STEPS_LIST.find(s => s.id === currentStep)?.num || 1}: {STEPS_LIST.find(s => s.id === currentStep)?.title.split('. ')[1]}</span>
            </div>
          </div>

          {(() => {
            const currentNum = STEPS_LIST.find(s => s.id === currentStep)?.num || 1;
            const nextStep = STEPS_LIST.find(s => s.num === currentNum + 1);
            if (!nextStep) {
              return (
                <span className="text-xs text-indigo-400 font-bold flex items-center gap-1">
                  🏆 Final Step of Creator Studio
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
                  className="px-3 py-1.5 rounded-xl bg-indigo-400/20 hover:bg-indigo-400/30 text-indigo-300 border border-indigo-400/60 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
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

      {/* STEP 1: ENTER CREATIVE STUDIO */}
      {currentStep === '1_enter_studio' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Step 1 • Studio Arrival</span>
                <h2 className="text-xl font-bold text-white mt-1">Enter the Creative Studio: Art, Music & Gallery</h2>
              </div>
              <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full font-medium">
                Inspect 3 Studio Zones
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Student artist Luna is in distress. She created a signature character illustration for the school festival, but just saw a commercial promotional poster for a dance club that copied her exact character without asking or giving credit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div 
              onClick={() => { soundFx.playClick(); setEaselInspected(true); }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                easelInspected ? 'bg-indigo-950/30 border-indigo-500/60' : 'bg-slate-800/80 border-slate-700 hover:border-indigo-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">🎨</span>
                {easelInspected ? <CheckCircle2 className="w-5 h-5 text-indigo-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
              </div>
              <h3 className="font-bold text-white text-base mt-3">Digital Illustration Easel</h3>
              <p className="text-xs text-slate-400 mt-1">
                Equipped with drawing tablets and vector brushes. Luna created her character "Solar Lynx" right here.
              </p>
              {easelInspected && <span className="text-[11px] text-indigo-400 font-bold block mt-3">✓ Workspace verified</span>}
            </div>

            <div 
              onClick={() => { soundFx.playClick(); setMusicDeskInspected(true); }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                musicDeskInspected ? 'bg-indigo-950/30 border-indigo-500/60' : 'bg-slate-800/80 border-slate-700 hover:border-indigo-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">🎹</span>
                {musicDeskInspected ? <CheckCircle2 className="w-5 h-5 text-indigo-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
              </div>
              <h3 className="font-bold text-white text-base mt-3">Audio & Soundtrack Desk</h3>
              <p className="text-xs text-slate-400 mt-1">
                Synthesizers and sound recording gear. Demonstrates how original musical melodies are also protected by copyright.
              </p>
              {musicDeskInspected && <span className="text-[11px] text-indigo-400 font-bold block mt-3">✓ Audio station checked</span>}
            </div>

            <div 
              onClick={() => { soundFx.playClick(); setGalleryPortalInspected(true); }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                galleryPortalInspected ? 'bg-indigo-950/30 border-indigo-500/60' : 'bg-slate-800/80 border-slate-700 hover:border-indigo-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">🏛️</span>
                {galleryPortalInspected ? <CheckCircle2 className="w-5 h-5 text-indigo-400" /> : <Eye className="w-5 h-5 text-slate-400" />}
              </div>
              <h3 className="font-bold text-white text-base mt-3">Public Exhibition Gallery</h3>
              <p className="text-xs text-slate-400 mt-1">
                The space where student creators publish original and properly licensed artwork for public exhibition with copyright notices.
              </p>
              {galleryPortalInspected && <span className="text-[11px] text-indigo-400 font-bold block mt-3">✓ Gallery connected</span>}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Inspect all 3 studio stations to open the interactive canvas.
            </span>
            <button
              disabled={(easelInspected && musicDeskInspected && galleryPortalInspected)}
              onClick={() => advanceTo('2_draw_artwork', 2)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                easelInspected && musicDeskInspected && galleryPortalInspected
                  ? 'bg-indigo-500 hover:bg-indigo-400 text-slate-950 cursor-pointer shadow-lg shadow-indigo-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Open Drawing Canvas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: INTERACTIVE CANVAS TO CREATE ORIGINAL ARTWORK */}
      {currentStep === '2_draw_artwork' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Step 2 • The Creative Act</span>
                <h2 className="text-xl font-bold text-white mt-1">Interactive Studio Canvas: Create Your Original Art</h2>
              </div>
              <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full font-medium">
                Live HTML5 Canvas
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Use your mouse or touch screen to draw your original character artwork. Pick vibrant colors, adjust stroke size, or add stamps to craft an expressive original piece.
            </p>
          </div>

          {/* Canvas & Drawing Tools Deck */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Tool Controls */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-4">
              <div>
                <span className="text-xs font-bold text-slate-300 block mb-2">Palette Colors:</span>
                <div className="flex flex-wrap gap-2">
                  {['#38bdf8', '#f59e0b', '#ec4899', '#10b981', '#a855f7', '#ffffff'].map(c => (
                    <button
                      key={c}
                      onClick={() => setBrushColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                        brushColor === c ? 'scale-110 border-white shadow-md' : 'border-slate-700'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-300 block mb-2">Brush Width:</span>
                <div className="flex gap-2">
                  {[3, 6, 12].map(sz => (
                    <button
                      key={sz}
                      onClick={() => setBrushSize(sz)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                        brushSize === sz ? 'bg-indigo-500 text-slate-950 border-indigo-400' : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {sz}px
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-300 block mb-2">Creative Stamps:</span>
                <div className="grid grid-cols-3 gap-2 text-xl">
                  {['⭐', '⚡', '🦊', '🌸', '🚀', '🔥'].map(st => (
                    <button
                      key={st}
                      onClick={() => stampIcon(st)}
                      className="p-2 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 text-center transition-colors cursor-pointer"
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <button
                  onClick={clearCanvas}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear Canvas
                </button>
              </div>
            </div>

            {/* Drawing Canvas Area */}
            <div className="md:col-span-3 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center">
              <canvas
                ref={canvasRef}
                width={420}
                height={300}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full max-w-[420px] h-[300px] bg-slate-900 rounded-lg border border-slate-700 shadow-inner cursor-crosshair touch-none"
              />
              <span className="text-[11px] text-slate-500 mt-2">
                Click and drag to draw your original artwork
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Draw on the canvas to enable tangible fixation.
            </span>
            <button
              disabled={!hasDrawnStrokes}
              onClick={handleSaveArtwork}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                hasDrawnStrokes
                  ? 'bg-indigo-500 hover:bg-indigo-400 text-slate-950 cursor-pointer shadow-lg shadow-indigo-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Save & Fix in Tangible Medium</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SAVE ARTWORK (AUTOMATIC FIXATION IN TANGIBLE MEDIUM) */}
      {currentStep === '3_save_fixation' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Step 3 • Statutory Principle</span>
            <h2 className="text-xl font-bold text-white mt-1">Automatic Fixation in a Tangible Medium of Expression</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Rendered Artwork */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center">
              {savedArtworkUrl ? (
                <img 
                  src={savedArtworkUrl} 
                  alt="Original Artwork" 
                  className="rounded-lg border border-slate-700 max-h-56 shadow-lg object-contain"
                />
              ) : (
                <div className="h-56 w-full flex items-center justify-center text-slate-600">Artwork Asset</div>
              )}
              <span className="text-xs text-indigo-300 font-bold mt-3">
                Original Artwork: "Solar Lynx" by Luna
              </span>
            </div>

            {/* Legal Certificate of Fixation */}
            <div className="bg-slate-950 border border-indigo-500/40 rounded-xl p-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-400" />
                  <h4 className="font-bold text-white text-sm">Automatic Copyright Creation Record</h4>
                </div>

                <div className="p-3 bg-slate-900 rounded-lg text-xs space-y-1.5 border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Creation Timestamp:</span>
                    <span className="text-white font-mono">{fixationTimestamp || 'Oct 11, 2026, 11:20 AM'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cryptographic Hash:</span>
                    <span className="text-indigo-400 font-mono text-[11px]">{fixationHash || 'SHA256: 8f9b4e2a...c017d'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Statutory Term:</span>
                    <span className="text-emerald-400 font-bold">Author Lifetime + 70 Years</span>
                  </div>
                </div>

                <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-xs text-indigo-200">
                  <strong className="text-white block mb-1">⚡ Core Copyright Rule: Automatic Protection</strong>
                  Under international copyright conventions, copyright protection attaches <strong>automatically</strong> the very second an original work is fixed in a tangible medium (canvas, disk, recording). Registration is NOT required for copyright to exist
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => advanceTo('4_explore_media', 4)}
                  className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
                >
                  <span>Explore Idea vs Expression</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: EXPLORE SAMPLE ILLUSTRATIONS, PHOTOS, MUSIC & STORIES */}
      {currentStep === '4_explore_media' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Step 4 • Statutory Scope</span>
                <h2 className="text-xl font-bold text-white mt-1">Idea vs Expression: What Does Copyright Actually Protect?</h2>
              </div>
              <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full font-medium">
                {Object.keys(exploredMedia).length} / 4 Explored
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Copyright law protects original creative <em>expressions</em>, NOT bare underlying ideas, concepts, facts, or raw book titles. Inspect the examples below:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MEDIA_EXAMPLES.map((item) => {
              const isExplored = exploredMedia[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    soundFx.playClick();
                    setExploredMedia(prev => ({ ...prev, [item.id]: true }));
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isExplored
                      ? item.protectable
                        ? 'bg-indigo-950/20 border-indigo-500/60'
                        : 'bg-rose-950/20 border-rose-500/60'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{item.icon}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.protectable 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {item.protectable ? 'Protected Expression' : 'Unprotected Concept'}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm mt-2">{item.title}</h4>
                  <span className="text-[11px] text-slate-400 font-semibold block">{item.type}</span>
                  <p className="text-xs text-slate-300 mt-2">{item.reason}</p>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Inspect all 4 examples to examine the unauthorized reuse flyer.
            </span>
            <button
              disabled={Object.keys(exploredMedia).length < 4}
              onClick={() => advanceTo('5_compare_reused', 5)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                Object.keys(exploredMedia).length >= 4
                  ? 'bg-indigo-500 hover:bg-indigo-400 text-slate-950 cursor-pointer shadow-lg shadow-indigo-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Compare with Reused Flyer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: COMPARE ORIGINAL WITH REUSED VERSION IN PROMO POSTER */}
      {currentStep === '5_compare_reused' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Step 5 • Infringement Discovery</span>
            <h2 className="text-xl font-bold text-white mt-1">Side-by-Side: Original Creation vs Commercial Flyer</h2>
            <p className="text-sm text-slate-400 mt-2">
              Compare Luna's original illustration with the commercial flyer published by "CyberPulse Entertainment". Notice the direct reproduction without permission.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Original Creation */}
            <div className="bg-slate-950 border border-indigo-500/40 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-white text-xs">Luna's Original Creation</span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                  Authentic Author
                </span>
              </div>
              <div className="h-44 bg-slate-900 rounded-lg flex items-center justify-center p-2 border border-slate-800">
                {savedArtworkUrl ? (
                  <img src={savedArtworkUrl} alt="Original" className="max-h-full object-contain" />
                ) : (
                  <div className="text-4xl">🎨</div>
                )}
              </div>
              <div className="text-xs text-slate-300 space-y-1">
                <p><strong>Title:</strong> Solar Lynx Illustration</p>
                <p><strong>Created:</strong> October 2026 (Student Studio)</p>
                <p className="text-emerald-400"><strong>Status:</strong> Valid copyright owned by Luna.</p>
              </div>
            </div>

            {/* Right: Commercial Poster */}
            <div className="bg-slate-950 border border-rose-500/40 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-white text-xs">CyberPulse Nightclub Promo Flyer</span>
                <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full font-bold">
                  Unauthorized Commercial Reuse
                </span>
              </div>
              <div className="h-44 bg-gradient-to-br from-rose-950/60 to-purple-950/60 rounded-lg flex flex-col items-center justify-center p-2 border border-rose-800 text-center relative overflow-hidden">
                <div className="text-2xl mb-1">🎟️</div>
                <div className="font-black text-rose-300 text-sm">NEON RAVE FESTIVAL 2026</div>
                <div className="text-[11px] text-slate-300">Tickets $35 • CyberPulse Club</div>
                <span className="text-[10px] text-amber-300 font-mono mt-2 bg-slate-900/80 px-2 py-0.5 rounded">
                  [Exact Artwork Plastered on Background]
                </span>
              </div>
              <div className="text-xs text-slate-300 space-y-1">
                <p><strong>Entity:</strong> CyberPulse Entertainment LLC</p>
                <p><strong>Tickets Sold:</strong> 1,500 tickets ($52,500 gross revenue)</p>
                <p className="text-rose-400"><strong>Status:</strong> Zero permission, zero license, zero royalties paid!</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => advanceTo('6_inspect_records', 6)}
              className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/20"
            >
              <span>Inspect Creation Records</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: INSPECT AVAILABLE CREATION RECORDS & PERMISSIONS */}
      {currentStep === '6_inspect_records' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Step 6 • Forensic Investigation</span>
                <h2 className="text-xl font-bold text-white mt-1">Audit Creation Records, Timestamps & Permissions</h2>
              </div>
              <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full font-medium">
                {Object.values(inspectedRecords).filter(Boolean).length} / 3 Audited
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Verify proof of authorship and check whether any permission or contractual license was ever granted:
            </p>
          </div>

          <div className="space-y-3">
            <div 
              onClick={() => {
                soundFx.playClick();
                setInspectedRecords(prev => ({ ...prev, originalDrafts: true }));
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                inspectedRecords.originalDrafts ? 'bg-indigo-950/30 border-indigo-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">1. Digital Creation Layers & Timestamped Metadata</span>
                {inspectedRecords.originalDrafts && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Luna has raw PSD sketch files with timestamped layer history dating 3 weeks before CyberPulse published their promotional flyer. Authorship is indisputable.
              </p>
            </div>

            <div 
              onClick={() => {
                soundFx.playClick();
                setInspectedRecords(prev => ({ ...prev, licenseCheck: true }));
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                inspectedRecords.licenseCheck ? 'bg-indigo-950/30 border-indigo-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">2. Contract & Licensing Ledger Audit</span>
                {inspectedRecords.licenseCheck && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Confirmed: CyberPulse Entertainment never contacted Luna, never obtained a written license, and never paid any fee.
              </p>
            </div>

            <div 
              onClick={() => {
                soundFx.playClick();
                setInspectedRecords(prev => ({ ...prev, infringementScope: true }));
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                inspectedRecords.infringementScope ? 'bg-indigo-950/30 border-indigo-500' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">3. Commercial Exploitation Scope</span>
                {inspectedRecords.infringementScope && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                The club printed 5,000 posters across the city and sold $52,500 in tickets using Luna's character as the visual hook.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Audit all 3 records to select the appropriate response strategy.
            </span>
            <button
              disabled={!Object.values(inspectedRecords).every(Boolean)}
              onClick={() => advanceTo('7_artist_response', 7)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                Object.values(inspectedRecords).every(Boolean)
                  ? 'bg-indigo-500 hover:bg-indigo-400 text-slate-950 cursor-pointer shadow-lg shadow-indigo-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Consider Appropriate Response</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 7: HELP ARTIST DOCUMENT WORK & CONSIDER APPROPRIATE RESPONSE */}
      {currentStep === '7_artist_response' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Step 7 • Legal Strategy</span>
            <h2 className="text-xl font-bold text-white mt-1">Select the Legally Effective Response</h2>
            <p className="text-sm text-slate-400 mt-2">
              Help Luna choose how to respond to CyberPulse. Consider the difference between emotional outbursts, misunderstandings about credit, and formal legal remedies.
            </p>
          </div>

          <div className="space-y-4">
            <div 
              onClick={() => {
                soundFx.playClick();
                setSelectedResponse('rant');
              }}
              className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                selectedResponse === 'rant'
                  ? 'border-rose-500 bg-rose-950/20 text-rose-200'
                  : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-400'
              }`}
            >
              <span className="font-bold block text-sm">Option A: Post Angry Insults & Threats on Social Media</span>
              <p className="mt-1">
                Post furious rants online without legal documentation. (Ineffective, damages professionalism, and fails to claim legal damages).
              </p>
            </div>

            <div 
              onClick={() => {
                soundFx.playClick();
                setSelectedResponse('tag_credit');
              }}
              className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                selectedResponse === 'tag_credit'
                  ? 'border-rose-500 bg-rose-950/20 text-rose-200'
                  : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-400'
              }`}
            >
              <span className="font-bold block text-sm">Option B: Ask Them to Just Tag Your Username and Let Them Keep Exploiting It</span>
              <p className="mt-1">
                Attribution alone DOES NOT substitute for permission in commercial exploitation CyberPulse is profiting $52,500 off your work without paying a dime.
              </p>
            </div>

            <div 
              onClick={() => {
                soundFx.playClick();
                setSelectedResponse('cease_license');
              }}
              className={`p-4 rounded-xl border text-xs cursor-pointer transition-all ${
                selectedResponse === 'cease_license'
                  ? 'border-emerald-500 bg-emerald-950/30 text-emerald-200 shadow-lg shadow-emerald-500/20'
                  : 'border-slate-800 bg-slate-950 hover:border-slate-700 text-slate-400'
              }`}
            >
              <span className="font-bold block text-sm text-white">
                Option C: Issue a Formal Cease-and-Desist Notice with an Option for a Commercial License Agreement
              </span>
              <p className="mt-1 text-emerald-400">
                ✓ The correct professional & legal recourse Document proof of fixation, demand immediate withdrawal of unauthorized posters, or negotiate an official retroactive commercial licensing fee with proper artist royalties.
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              disabled={selectedResponse !== 'cease_license'}
              onClick={() => advanceTo('8_authorized_sorting', 8)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                selectedResponse === 'cease_license'
                  ? 'bg-indigo-500 hover:bg-indigo-400 text-slate-950 cursor-pointer shadow-lg shadow-indigo-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Distinguish Authorized vs Infringing Use</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 8: DISTINGUISH AUTHORIZED USE FROM USE THAT REQUIRES PERMISSION */}
      {currentStep === '8_authorized_sorting' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Step 8 • Fair Use Sorting Matrix</span>
                <h2 className="text-xl font-bold text-white mt-1">Authorized Exceptions (Fair Use) vs Permission Required</h2>
              </div>
              <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-1 rounded-full font-medium">
                {Object.keys(sortedScenarios).length} / 4 Classified
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Not all reuse requires permission. The law includes fair use / fair dealing exceptions for education, critique, and parody. Classify each situation:
            </p>
          </div>

          <div className="space-y-4">
            {SCENARIOS.map((scen) => {
              const selected = sortedScenarios[scen.id];
              const isCorrect = selected === scen.correct;
              return (
                <div key={scen.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-white text-sm">{scen.title}</h4>
                  <p className="text-xs text-slate-400">{scen.desc}</p>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setSortedScenarios(prev => ({ ...prev, [scen.id]: 'authorized' }));
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selected === 'authorized'
                          ? scen.correct === 'authorized'
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-rose-500 text-white font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Authorized Fair Use Exception
                    </button>

                    <button
                      onClick={() => {
                        soundFx.playClick();
                        setSortedScenarios(prev => ({ ...prev, [scen.id]: 'needs_permission' }));
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selected === 'needs_permission'
                          ? scen.correct === 'needs_permission'
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-rose-500 text-white font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Requires Written Permission / License
                    </button>
                  </div>

                  {selected && (
                    <div className={`p-2.5 rounded-lg text-xs mt-2 ${
                      isCorrect ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950/30 text-rose-300 border border-rose-500/30'
                    }`}>
                      {isCorrect ? `✓ Correct ${scen.reason}` : `Incorrect. ${scen.reason}`}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-xs text-slate-400">
              Classify all 4 scenarios to curate the gallery exhibition.
            </span>
            <button
              disabled={Object.keys(sortedScenarios).length < 4}
              onClick={() => advanceTo('9_curate_exhibition', 9)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                Object.keys(sortedScenarios).length >= 4
                  ? 'bg-indigo-500 hover:bg-indigo-400 text-slate-950 cursor-pointer shadow-lg shadow-indigo-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Curate Ethical Exhibition</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 9: PREPARE EXHIBITION CONTAINING ORIGINAL & APPROPRIATELY SOURCED CONTENT */}
      {currentStep === '9_curate_exhibition' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Step 9 • Exhibition Curation</span>
            <h2 className="text-xl font-bold text-white mt-1">Curate an Ethical, Properly Licensed Exhibition</h2>
            <p className="text-sm text-slate-400 mt-2">
              Before opening the gallery to the public, select properly licensed assets for the gallery ambiance. Demonstrate respect for fellow creators:
            </p>
          </div>

          <div className="space-y-4">
            {/* Exhibition Music Choice */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <span className="font-bold text-white text-sm flex items-center gap-2">
                <Music className="w-4 h-4 text-indigo-400" /> Background Audio Selection:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <button
                  onClick={() => { soundFx.playClick(); setMusicTrackChoice('pirated_pop'); }}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    musicTrackChoice === 'pirated_pop' 
                      ? 'border-rose-500 bg-rose-950/20 text-rose-300' 
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  <span className="font-bold block">Top 40 Pop Hit from Streaming</span>
                  <p className="text-[11px] mt-1">Commercial recording without broadcast license. (Infringing)</p>
                </button>

                <button
                  onClick={() => { soundFx.playClick(); setMusicTrackChoice('cc_soundtrack'); }}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    musicTrackChoice === 'cc_soundtrack' 
                      ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300 font-bold' 
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  <span className="font-bold block">Creative Commons CC-BY Synth Track</span>
                  <p className="text-[11px] mt-1">Attributed independent artist soundtrack. (100% Ethical)</p>
                </button>
              </div>
            </div>

            {/* Exhibition Backdrop Choice */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <span className="font-bold text-white text-sm flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-400" /> Gallery Banner Photography:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <button
                  onClick={() => { soundFx.playClick(); setBackdropChoice('watermarked_stock'); }}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    backdropChoice === 'watermarked_stock' 
                      ? 'border-rose-500 bg-rose-950/20 text-rose-300' 
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  <span className="font-bold block">Watermarked Commercial Stock Photo</span>
                  <p className="text-[11px] mt-1">Downloaded from image search with watermark. (Infringing)</p>
                </button>

                <button
                  onClick={() => { soundFx.playClick(); setBackdropChoice('open_license'); }}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    backdropChoice === 'open_license' 
                      ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300 font-bold' 
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  <span className="font-bold block">Open-Access CC0 / Public Domain Photo</span>
                  <p className="text-[11px] mt-1">Freely usable museum photographic archive. (100% Ethical)</p>
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              disabled={musicTrackChoice !== 'cc_soundtrack' || backdropChoice !== 'open_license'}
              onClick={() => advanceTo('10_publish_gallery', 10)}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 ${
                musicTrackChoice === 'cc_soundtrack' && backdropChoice === 'open_license'
                  ? 'bg-indigo-500 hover:bg-indigo-400 text-slate-950 cursor-pointer shadow-lg shadow-indigo-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <span>Publish in Interactive Gallery</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 10: PUBLISH IN INTERACTIVE GALLERY WITH COPYRIGHT NOTICE */}
      {currentStep === '10_publish_gallery' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Step 10 • Grand Exhibition Opening</span>
            <h2 className="text-xl font-bold text-white mt-1">The Academy Creator Gallery Exhibition</h2>
          </div>

          {/* Interactive Exhibition Room Visual */}
          <div className="bg-gradient-to-b from-indigo-950/30 via-slate-950 to-slate-900 border-2 border-indigo-500/60 rounded-2xl p-6 text-center space-y-6 shadow-2xl relative">
            <div className="inline-block p-4 bg-slate-900 rounded-2xl border-4 border-amber-400/80 shadow-2xl max-w-sm mx-auto">
              {savedArtworkUrl ? (
                <img src={savedArtworkUrl} alt="Exhibited Artwork" className="rounded max-h-52 mx-auto object-contain" />
              ) : (
                <div className="text-6xl p-8">🎨</div>
              )}
              <div className="mt-3 pt-2 border-t border-slate-800 text-left">
                <span className="font-black text-white text-sm block">"Solar Lynx"</span>
                <span className="text-xs text-indigo-400 font-semibold block">Luna & Student Artist</span>
                <span className="text-[11px] text-slate-400 font-mono block mt-1">
                  © 2026 Luna. All Rights Reserved.
                </span>
              </div>
            </div>

            <div className="max-w-md mx-auto bg-slate-900/90 rounded-xl p-4 border border-indigo-500/30 text-xs text-slate-300 text-left space-y-2">
              <span className="font-bold text-indigo-300 block">Exhibition Legal Clearance:</span>
              <p>
                ✓ <strong>Primary Artwork:</strong> Original creative expression protected by automatic copyright upon fixation.
              </p>
              <p>
                ✓ <strong>Audio Track:</strong> Licensed under Creative Commons CC-BY with credit to composer.
              </p>
              <p>
                ✓ <strong>CyberPulse Resolution:</strong> Formal notice issued. Club agreed to retract posters and license character with royalties.
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              <button
                onClick={() => {
                  soundFx.playLevelUp();
                  confetti({ particleCount: 90, spread: 80 });
                  onComplete(200, 50, 3, 'copyright');
                }}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-indigo-500/30 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Claim Creator Honors & Return to Map</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
