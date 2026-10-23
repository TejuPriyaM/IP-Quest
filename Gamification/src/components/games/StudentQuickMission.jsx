import React, { useState } from 'react';
import { soundFx } from '../../utils/sound';
import confetti from 'canvas-confetti';
import {
  Sparkles, CheckCircle2, XCircle, ArrowRight, RotateCcw,
  Trophy, HelpCircle, Lightbulb, Compass, Award, Star, Check
} from 'lucide-react';
import { IPQuestBadge } from '../IPQuestBadge';

const MISSIONS_DATA = {
  patent: {
    realmName: 'Patent Lab',
    themeColor: 'amber',
    headerGradient: 'from-amber-500 via-amber-400 to-yellow-500',
    stages: [
      {
        stageNum: 1,
        badge: 'Mystery 1: Real Machine vs Just an Idea',
        title: 'What Can Truly Be Patented?',
        characterEmoji: '👨‍🌾',
        characterName: 'Farmer Dave',
        storyPrompt: 'Farmer Dave is exhausted. He spends 4 hours every day turning water valves on and off by hand in the scorching sun!',
        question: 'Which of these three things can receive an official government 20-Year Patent?',
        options: [
          {
            id: 'opt1',
            label: '💡 A daydream in someone’s head: "What if plants watered themselves?"',
            isCorrect: false,
            explain: 'Nope An unbuilt thought or idea alone CANNOT be patented. You have to invent and build a real working mechanism!'
          },
          {
            id: 'opt2',
            label: '🌱 A physical smart sensor & valve machine that measures soil moisture and waters crops automatically!',
            isCorrect: true,
            explain: 'BINGO Patents protect real, functional working machines, tools, and technical processes that solve problems!'
          },
          {
            id: 'opt3',
            label: '🏷️ A catchy brand name sticker like "MegaWater 3000™"',
            isCorrect: false,
            explain: 'Sticker names and logos are TRADEMARKS, not patents Patents protect physical machines and mechanisms.'
          }
        ]
      },
      {
        stageNum: 2,
        badge: 'Mystery 2: The Inventor’s Assembly',
        title: 'Connect the 3 Working Parts of the Machine',
        characterEmoji: '🔧',
        characterName: 'Inventor Maya',
        storyPrompt: 'To grant a patent, the patent office must see exactly HOW the physical machine functions. Tap the 3 physical components to assemble Farmer Dave’s smart irrigation system!',
        question: 'Tap each of the 3 working parts below to build the smart irrigation prototype:',
        options: [
          {
            id: 'assembled',
            label: '✅ Proto Fully Connected & Powered!',
            isCorrect: true,
            explain: 'Awesome All 3 mechanical and electronic components work in harmony as a tangible invention!'
          }
        ],
        interactiveTask: {
          type: 'click_parts',
          items: [
            { id: 'sensor', name: 'Soil Moisture Sensor', icon: '🌱', desc: 'Senses when soil is dry like a sponge' },
            { id: 'mcu', name: 'Computer Brain Chip', icon: '🧠', desc: 'Decides when crops need water' },
            { id: 'valve', name: 'Auto Water Valve', icon: '🚰', desc: 'Opens and closes the water tap automatically' }
          ],
          completionMsg: '🎉 Inventions require real physical parts working together!'
        }
      },
      {
        stageNum: 3,
        badge: 'Mystery 3: The 20-Year Rule',
        title: 'Why Does a Patent Expire in 20 Years?',
        characterEmoji: '🏛️',
        characterName: 'Patent Examiner Lin',
        storyPrompt: 'The government gives inventors a 20-Year exclusive monopoly. But why doesn’t it last forever like a trade secret?',
        question: 'Why does a patent expire after 20 years so anyone can build it?',
        options: [
          {
            id: 'p3_opt1',
            label: '🤝 The Grand Bargain: The inventor gets 20 years of profits, then the blueprints become free for all humanity to build and improve!',
            isCorrect: true,
            explain: 'Exact That is the Grand Bargain of Innovation Humanity gets to learn from the invention, and inventors get rewarded for their hard work.'
          },
          {
            id: 'p3_opt2',
            label: '💰 Because the government gets tired of collecting paperwork.',
            isCorrect: false,
            explain: 'Haha, no It’s designed to help society learn from new technology so everyone can benefit from progress.'
          },
          {
            id: 'p3_opt3',
            label: '🚫 Because after 20 years all machines stop working.',
            isCorrect: false,
            explain: 'Nope The 20-year term balances inventor rewards with public scientific progress.'
          }
        ]
      }
    ]
  },
  copyright: {
    realmName: 'Creator Studio',
    themeColor: 'purple',
    headerGradient: 'from-purple-500 via-purple-400 to-indigo-600',
    stages: [
      {
        stageNum: 1,
        badge: 'Mystery 1: When Is Art Protected?',
        title: 'When Does Copyright Truly Begin?',
        characterEmoji: '🎨',
        characterName: 'Artist Mia',
        storyPrompt: 'Mia just finished drawing an original cosmic superhero cat called "Nebula Paws" in her sketchbook!',
        question: 'When is Mia’s drawing legally protected by copyright law?',
        options: [
          {
            id: 'c1_opt1',
            label: '⚡ Automatically, the exact millisecond she draws it on paper or saves it to a phone!',
            isCorrect: true,
            explain: 'CORRECT Copyright is automatic upon creation No paperwork, fee, or registration is required to own your art!'
          },
          {
            id: 'c1_opt2',
            label: '🏛️ Only after filing a $500 application with a government court.',
            isCorrect: false,
            explain: 'Wrong You own the copyright automatically the moment your drawing or song is saved in a tangible form!'
          },
          {
            id: 'c1_opt3',
            label: '🎂 Only after she turns 18 years old.',
            isCorrect: false,
            explain: 'No Even a 7-year-old child owns the full copyright to their original drawings and poems!'
          }
        ]
      },
      {
        stageNum: 2,
        badge: 'Mystery 2: The T-Shirt Copycat',
        title: 'Does Saying "Credit to Artist" Protect a Copycat?',
        characterEmoji: '👕',
        characterName: 'Shopkeeper Alex',
        storyPrompt: 'A store owner saved Mia’s drawing from Instagram, printed it onto 200 T-shirts, sold them for $25 each, and put a tiny label: "Credit to Mia"!',
        question: 'Is the store allowed to sell T-shirts of Mia’s art just by writing "Credit to artist"?',
        options: [
          {
            id: 'c2_opt1',
            label: '❌ NO Saying "Credit to artist" is NOT a commercial license. Selling her art without permission is illegal infringement!',
            isCorrect: true,
            explain: 'SUPERB Tagging the artist or writing "credit" does NOT allow anyone to sell copies or merchandise without a real commercial contract!'
          },
          {
            id: 'c2_opt2',
            label: '✅ Yes, because they tagged her username so she gets free exposure.',
            isCorrect: false,
            explain: 'Nope "Exposure" does not replace legal copyright permission. Only Mia controls who prints and sells her art.'
          },
          {
            id: 'c2_opt3',
            label: '✅ Yes, anything on the internet is 100% free for anyone to sell.',
            isCorrect: false,
            explain: 'Wrong Internet images are protected by copyright just like books in a store!'
          }
        ]
      },
      {
        stageNum: 3,
        badge: 'Mystery 3: School Fair Use',
        title: 'Can Students Use Clips in Class Homework?',
        characterEmoji: '📚',
        characterName: 'Teacher Davis',
        storyPrompt: 'Liam is giving a 3-minute school presentation about space exploration and shows a 10-second clip of a documentary in class.',
        question: 'Is Liam allowed to show this clip in his classroom project?',
        options: [
          {
            id: 'c3_opt1',
            label: '🌟 YES Educational classroom presentations and commentary are protected under Fair Use!',
            isCorrect: true,
            explain: 'Yes Fair Use allows students and teachers to use short quotes and clips for learning, critiquing, and classroom study!'
          },
          {
            id: 'c3_opt2',
            label: '🚫 No, Liam must pay Hollywood $10,000 before school starts.',
            isCorrect: false,
            explain: 'No Educational study is one of the pillars of Fair Use law.'
          }
        ]
      }
    ]
  },
  trademark: {
    realmName: 'Brand City',
    themeColor: 'emerald',
    headerGradient: 'from-emerald-500 via-emerald-400 to-teal-600',
    stages: [
      {
        stageNum: 1,
        badge: 'Mystery 1: The Shopper Confusion',
        title: 'What Is the Superpower of a Trademark?',
        characterEmoji: '🥤',
        characterName: 'Shopkeeper Leo',
        storyPrompt: 'Thirsty customers keep buying sour vinegar drinks because a copycat copied Leo’s logo and bottle shape!',
        question: 'What is the number one job of a Trademark?',
        options: [
          {
            id: 't1_opt1',
            label: '🛡️ To stop customer confusion so shoppers always know WHO genuinely made the authentic product!',
            isCorrect: true,
            explain: 'EXACTLY Trademarks protect brand symbols, logos, and names so customers never get tricked by copycats!'
          },
          {
            id: 't1_opt2',
            label: '💡 To protect how the blender motor spins inside the store.',
            isCorrect: false,
            explain: 'Blender motors are mechanical machines, so they are protected by Patents, not Trademarks!'
          },
          {
            id: 't1_opt3',
            label: '🎨 To protect the drawing of the cat in an art museum.',
            isCorrect: false,
            explain: 'Drawings in an art museum are protected by Copyright, not Trademarks!'
          }
        ]
      },
      {
        stageNum: 2,
        badge: 'Mystery 2: The Best Brand Name',
        title: 'Which Brand Name Gets Superhero Legal Power?',
        characterEmoji: '⚡',
        characterName: 'Brand Expert Sam',
        storyPrompt: 'Sam wants to trademark a name for his electric sports sneakers. Which name gets the STRONGEST legal protection in courts?',
        question: 'Pick the name with the strongest 100% trademark power (Abercrombie Spectrum):',
        options: [
          {
            id: 't2_opt1',
            label: '👟 "Running Shoes" (Generic dictionary word)',
            isCorrect: false,
            explain: 'GENERIC words can NEVER be trademarked Nobody can own the word "Running Shoes".'
          },
          {
            id: 't2_opt2',
            label: '⚡ "VoltStride™" (Invented, coined, made-up word)',
            isCorrect: true,
            explain: 'MAXIMUM POWER Made-up "coined" words like Rolex, Kodak, and VoltStride get 100% strongest trademark protection!'
          },
          {
            id: 't2_opt3',
            label: '🏃 "Fast Shoes" (Merely describes the shoe)',
            isCorrect: false,
            explain: 'Descriptive words are very weak and hard to protect because rivals need to use normal language.'
          }
        ]
      },
      {
        stageNum: 3,
        badge: 'Mystery 3: The ® Circle Rule',
        title: 'When Can You Use the Official ® Symbol?',
        characterEmoji: '®️',
        characterName: 'Judge Vance',
        storyPrompt: 'You see ™ on some products and ® on others. What is the rule?',
        question: 'When is a company legally allowed to print the ® circle symbol on packaging?',
        options: [
          {
            id: 't3_opt1',
            label: '🏛️ Only AFTER the government Trademark Office officially registers and approves the mark!',
            isCorrect: true,
            explain: 'YES Anyone can use TM to claim a brand, but the official ® is strictly reserved for government-registered trademarks!'
          },
          {
            id: 't3_opt2',
            label: '🖍️ The first day you draw a sketch in your school notebook.',
            isCorrect: false,
            explain: 'Using the ® symbol without government registration is actually illegal fraud!'
          }
        ]
      }
    ]
  },
  trade_secret: {
    realmName: 'Secret Vault',
    themeColor: 'rose',
    headerGradient: 'from-rose-500 via-rose-400 to-pink-600',
    stages: [
      {
        stageNum: 1,
        badge: 'Mystery 1: The 135-Year-Old Secret',
        title: 'Why Didn’t Coca-Cola Patent Their Soda Recipe?',
        characterEmoji: '🥤',
        characterName: 'Vault Officer Rajiv',
        storyPrompt: 'Coca-Cola keeps their syrup recipe locked in an underground steel vault in Atlanta, Georgia. They never patented it!',
        question: 'Why did Coca-Cola choose a Trade Secret instead of a Patent?',
        options: [
          {
            id: 'ts1_opt1',
            label: '🔐 A Patent publishes blueprints and ends in 20 years. A Trade Secret can last FOREVER as long as you keep it strictly locked!',
            isCorrect: true,
            explain: 'BRILLIANT If Coca-Cola patented their recipe in 1890, the patent would have expired in 1910 By keeping it secret, it has lasted 135+ years!'
          },
          {
            id: 'ts1_opt2',
            label: '📝 Because they forgot to mail the letter to the patent office.',
            isCorrect: false,
            explain: 'Nope It was an intentional business strategy to avoid public publication!'
          }
        ]
      },
      {
        stageNum: 2,
        badge: 'Mystery 2: The Security Shield',
        title: 'Turn On the 3 Mandatory Secrecy Defenses',
        characterEmoji: '🔒',
        characterName: 'Security Lead Tara',
        storyPrompt: 'To be protected under trade secret law, a company MUST take active "reasonable security measures". Tap all 3 shields to secure the vault!',
        question: 'Activate all 3 security defenses below:',
        options: [
          {
            id: 'secured',
            label: '🛡️ All 3 Security Protocols Active & Enforced!',
            isCorrect: true,
            explain: 'Outstanding The vault is legally and physically secured with passwords, NDAs, and biometric locks!'
          }
        ],
        interactiveTask: {
          type: 'click_parts',
          items: [
            { id: 'nda', name: 'Non-Disclosure Agreements (NDAs)', icon: '📝', desc: 'Workers sign legal contracts promising never to tell' },
            { id: 'pin', name: 'Encrypted Passwords & PINs', icon: '🔑', desc: 'Prevents hackers and unauthorized employees from seeing' },
            { id: 'vault', name: 'Biometric Safe & Laser Lock', icon: '🚨', desc: 'Physical steel safe locked with fingerprint scan' }
          ],
          completionMsg: '🔒 Active reasonable security is required by law!'
        }
      },
      {
        stageNum: 3,
        badge: 'Mystery 3: The Leak Disaster',
        title: 'What Happens If a Secret Leaks on the Internet?',
        characterEmoji: '😱',
        characterName: 'Baker Nina',
        storyPrompt: 'A careless worker accidentally uploaded the top-secret rainbow cupcake formula to a public TikTok video with 2 million views!',
        question: 'What happens to the Trade Secret now that the recipe is public knowledge?',
        options: [
          {
            id: 'ts3_opt1',
            label: '💥 It is GONE FOREVER Once a secret is public knowledge, trade secret protection is permanently destroyed!',
            isCorrect: true,
            explain: 'TRAGIC BUT TRUE You cannot un-see a public secret. Once the world knows the formula, it is no longer a trade secret!'
          },
          {
            id: 'ts3_opt2',
            label: '✨ The government will wipe everyone’s memory like Men In Black.',
            isCorrect: false,
            explain: 'Haha, no sci-fi memory erasers exist in court That is why active secrecy is so vital!'
          }
        ]
      }
    ]
  },
  plagiarism: {
    realmName: 'Originality Academy',
    themeColor: 'sky',
    headerGradient: 'from-sky-500 via-sky-400 to-blue-600',
    stages: [
      {
        stageNum: 1,
        badge: 'Mystery 1: School Homework Honesty',
        title: 'Spot the Academic Plagiarism',
        characterEmoji: '📖',
        characterName: 'Student Jordan',
        storyPrompt: 'Jordan has a 5-page history report due in 20 minutes He copies two whole paragraphs from Wikipedia into his essay.',
        question: 'What MUST Jordan do so this is honest research rather than cheating plagiarism?',
        options: [
          {
            id: 'pl1_opt1',
            label: '🌟 Put exact words in quotation marks ("...") and cite the source author: (Encyclopedia, 2024)!',
            isCorrect: true,
            explain: 'EXACTLY Honest citations make your paper look like a professional scholar, not a cheat!'
          },
          {
            id: 'pl1_opt2',
            label: '🔍 Swap 2 words with synonyms using a thesaurus and don’t tell the teacher.',
            isCorrect: false,
            explain: 'WRONG Swapping two words (patchwriting) without citing the source is STILL plagiarism!'
          },
          {
            id: 'pl1_opt3',
            label: '🙈 Change the font to Comic Sans so the teacher doesn’t notice.',
            isCorrect: false,
            explain: 'Haha, plagiarism detector software checks the text, not the font!'
          }
        ]
      },
      {
        stageNum: 2,
        badge: 'Mystery 2: The Academic Triad',
        title: 'Master the 3 Steps of Honest Research',
        characterEmoji: '🎓',
        characterName: 'Dean Morrison',
        storyPrompt: 'Every great student scientist follows the Golden Academic Triad when writing reports. Tap the 3 pillars of honest study:',
        question: 'Tap the 3 pillars of academic research honesty:',
        options: [
          {
            id: 'triad_done',
            label: '🎓 The Academic Triad is Mastered!',
            isCorrect: true,
            explain: 'Magnificent You know how to research like a true university scientist!'
          }
        ],
        interactiveTask: {
          type: 'click_parts',
          items: [
            { id: 'voice', name: 'Paraphrase in Your Voice', icon: '🗣️', desc: 'Read the science, close the tab, and explain in your own words' },
            { id: 'quotes', name: 'Quotation Marks ("...")', icon: '❝', desc: 'Use quotation marks whenever you quote someone’s exact words' },
            { id: 'cite', name: 'Author Citation (NASA, 2024)', icon: '📚', desc: 'Give credit so readers know who made the original discovery' }
          ],
          completionMsg: '🎓 Integrity and attribution build genuine knowledge!'
        }
      },
      {
        stageNum: 3,
        badge: 'Mystery 3: Why Attribution Matters',
        title: 'Why Do Teachers Want You to Cite Sources?',
        characterEmoji: '🏆',
        characterName: 'Principal Hayes',
        storyPrompt: 'Why is academic honesty the most important rule in schools and universities across the globe?',
        question: 'Why do we cite sources and respect original authors?',
        options: [
          {
            id: 'pl3_opt1',
            label: '💡 To prove you grounded your ideas in real science and to respect the humans who discovered the truth first!',
            isCorrect: true,
            explain: 'ABSOLUTELY Citing real research makes your voice credible and respects fellow thinkers!'
          },
          {
            id: 'pl3_opt2',
            label: '😴 Just to make homework 10 minutes longer.',
            isCorrect: false,
            explain: 'No It is the core foundation of scientific discovery and academic integrity.'
          }
        ]
      }
    ]
  }
};

export const StudentQuickMission = ({
  concept,
  onComplete,
  onSwitchTo3D,
  onSwitchToLab,
  onSwitchToMatcher,
  onSwitchToLightning,
  onSwitchToArcade,
  onSwitchToDropCatcher,
  onSwitchToMemoryFlip
}) => {
  const mission = MISSIONS_DATA[concept];
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [interactiveItemsClicked, setInteractiveItemsClicked] = useState({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);

  const currentStage = mission.stages[currentStageIdx];
  const isInteractive = !!currentStage.interactiveTask;
  const allInteractiveDone = isInteractive
    ? currentStage.interactiveTask.items.every(item => interactiveItemsClicked[item.id])
    : false;

  const handleSelectOption = (option) => {
    if (selectedOptionId) return; // already selected
    setSelectedOptionId(option.id);

    if (option.isCorrect) {
      soundFx.playSuccess();
      confetti({ particleCount: 60, spread: 70 });
      setScore(prev => prev + 1);
      setStars(prev => prev + 1);
    } else {
      soundFx.playInvestigate();
    }
  };

  const handleInteractiveItemClick = ( itemId) => {
    soundFx.playClick();
    setInteractiveItemsClicked(prev => ({ ...prev, [itemId]: true }));

    const updated = { ...interactiveItemsClicked, [itemId]: true };
    if (currentStage.interactiveTask.items.every(item => updated[item.id])) {
      soundFx.playSuccess();
      confetti({ particleCount: 50, spread: 60 });
      setSelectedOptionId('assembled');
      setScore(prev => prev + 1);
      setStars(prev => prev + 1);
    }
  };

  const handleNextStage = () => {
    soundFx.playClick();
    if (currentStageIdx < mission.stages.length - 1) {
      setCurrentStageIdx(prev => prev + 1);
      setSelectedOptionId(null);
      setInteractiveItemsClicked({});
    } else {
      // Completed all 3 stages
      soundFx.playLevelUp();
      confetti({ particleCount: 100, spread: 100 });
      setIsCompleted(true);
      onComplete(200, 50, 3, concept);
    }
  };

  const handleRestart = () => {
    soundFx.playClick();
    setCurrentStageIdx(0);
    setSelectedOptionId(null);
    setInteractiveItemsClicked({});
    setIsCompleted(false);
    setScore(0);
    setStars(0);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-8 animate-in fade-in">
      {/* Top Banner: Student-Friendly Quick Play Banner */}
      <div className="bg-gradient-to-r from-[#e8f3fb] via-[#f0f7fe] to-[#fff9ee] border-2 border-amber-400 rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <IPQuestBadge size={60} className="logo-glow shrink-0" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-black uppercase px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 border border-amber-300 shadow-xs">
                  ⚡ 3-Minute Story Mission
                </span>
                <span className="text-xs text-amber-800 font-extrabold">Easy & Fun for School Students</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0e2038] font-display mt-0.5 tracking-tight">
                {mission.realmName}: Challenge
              </h2>
            </div>
          </div>

          {/* Quick Nav to other easy student games & Arcade */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
            {onSwitchToArcade && (
              <button
                onClick={() => { soundFx.playClick(); onSwitchToArcade(); }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border border-yellow-100 hover:scale-105"
                title="Go to Kids Game Arcade"
              >
                <span>🕹️ Arcade</span>
              </button>
            )}
            {onSwitchToDropCatcher && (
              <button
                onClick={() => { soundFx.playClick(); onSwitchToDropCatcher(); }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border border-yellow-100 hover:scale-105"
                title="Play 2D Catch Game"
              >
                <span>🎮 Catch</span>
              </button>
            )}
            {onSwitchToMemoryFlip && (
              <button
                onClick={() => { soundFx.playClick(); onSwitchToMemoryFlip(); }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border border-emerald-100 hover:scale-105"
                title="Play Memory Match Flip"
              >
                <span>🃏 Memory</span>
              </button>
            )}
            {onSwitchToMatcher && (
              <button
                onClick={() => { soundFx.playClick(); onSwitchToMatcher(); }}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-sky-50 text-amber-800 border-2 border-amber-400 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:scale-105"
                title="Play Card Matcher"
              >
                <span>🎯 Matcher</span>
              </button>
            )}
            {onSwitchToLightning && (
              <button
                onClick={() => { soundFx.playClick(); onSwitchToLightning(); }}
                className="px-3 py-1.5 rounded-xl bg-white hover:bg-sky-50 text-emerald-800 border-2 border-emerald-400 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:scale-105"
                title="Play Speed Quiz"
              >
                <span>⚡ Quiz</span>
              </button>
            )}
            {onSwitchTo3D && (
              <button
                onClick={() => { soundFx.playClick(); onSwitchTo3D(); }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs border border-sky-100"
                title="Explore in 3D"
              >
                <Compass className="w-3.5 h-3.5 text-slate-950" />
                <span>🌐 3D Facility</span>
              </button>
            )}
          </div>
        </div>

        {/* 3-Step Kid-Friendly Progress Indicator */}
        <div className="mt-5 pt-4 border-t border-sky-200/80 flex items-center justify-between gap-2">
          {mission.stages.map((stg, idx) => {
            const isDone = idx < currentStageIdx || isCompleted;
            const isCurrent = idx === currentStageIdx && !isCompleted;
            return (
              <div key={stg.stageNum} className="flex-1 flex items-center gap-2">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-black transition-all ${
                    isDone
                      ? 'bg-emerald-500 text-white ring-2 ring-emerald-300'
                      : isCurrent
                      ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 scale-110 shadow-xs'
                      : 'bg-white text-slate-500 border-2 border-sky-200'
                  }`}
                >
                  {isDone ? '✓' : stg.stageNum}
                </div>
                <div className="hidden sm:block truncate">
                  <div className={`text-[11px] font-black truncate ${isCurrent ? 'text-amber-900' : 'text-slate-600'}`}>
                    Step {stg.stageNum}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate">
                    {stg.title}
                  </div>
                </div>
                {idx < mission.stages.length - 1 && (
                  <div className={`flex-1 h-1.5 rounded-full mx-1 ${isDone ? 'bg-emerald-500' : 'bg-sky-200'}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {!isCompleted ? (
        /* ACTIVE STAGE CARD */
        <div className="bg-white border-2 border-sky-200 rounded-3xl p-5 sm:p-7 shadow-xs space-y-6">
          {/* Story Prompt Character Speech Bubble */}
          <div className="flex items-start gap-4 p-4 rounded-2xl bg-sky-50 border-2 border-sky-200">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 border-2 border-yellow-100 flex items-center justify-center text-3xl shadow-xs shrink-0">
              {currentStage.characterEmoji}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-black text-amber-900 text-sm">{currentStage.characterName}</span>
                <span className="text-[10px] uppercase font-bold text-sky-800 bg-sky-100 px-2 py-0.5 rounded-full border border-sky-300">
                  {currentStage.badge}
                </span>
              </div>
              <p className="text-sm sm:text-base text-[#0e2038] font-medium leading-relaxed">
                "{currentStage.storyPrompt}"
              </p>
            </div>
          </div>

          {/* Interactive Task if Click Parts Stage */}
          {isInteractive && currentStage.interactiveTask && (
            <div className="p-4 sm:p-5 rounded-2xl bg-[#f0f7fe] border-2 border-amber-400/70 space-y-4">
              <div className="flex items-center gap-2 text-xs font-black text-amber-900 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Tap all 3 items to complete the task:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {currentStage.interactiveTask.items.map(item => {
                  const clicked = !!interactiveItemsClicked[item.id];
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleInteractiveItemClick(item.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-2 shadow-xs ${
                        clicked
                          ? 'bg-emerald-500 text-white border-emerald-300 ring-2 ring-emerald-200 scale-102'
                          : 'bg-white hover:bg-sky-50 border-sky-200 text-slate-800 hover:scale-102'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-3xl">{item.icon}</span>
                        {clicked && <Check className="w-5 h-5 text-white font-black" />}
                      </div>
                      <div>
                        <div className={`font-black text-xs ${clicked ? 'text-white' : 'text-[#0e2038]'}`}>
                          {item.name}
                        </div>
                        <div className={`text-[10px] leading-snug mt-0.5 ${clicked ? 'text-emerald-100 font-semibold' : 'text-slate-600'}`}>
                          {item.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {allInteractiveDone && (
                <div className="p-3 rounded-xl bg-emerald-500 text-white font-black text-xs flex items-center justify-between animate-in zoom-in-95">
                  <span>{currentStage.interactiveTask.completionMsg}</span>
                  <button
                    onClick={handleNextStage}
                    className="px-4 py-1.5 rounded-lg bg-white text-emerald-950 font-black hover:bg-emerald-50 cursor-pointer shadow-xs"
                  >
                    Next Step ➔
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Question Prompt */}
          {!isInteractive && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-[#eaf3fb] border-2 border-amber-400/80 shadow-xs">
                <div className="flex items-center gap-2 text-amber-900 text-xs font-black uppercase tracking-wider mb-1">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  <span>Student Challenge Question:</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-[#0e2038] leading-snug">
                  {currentStage.question}
                </h3>
              </div>

              {/* Multiple Choice Options */}
              <div className="space-y-3">
                {currentStage.options.map((opt) => {
                  const isChosen = selectedOptionId === opt.id;
                  let cardStyle = 'bg-white border-2 border-sky-200 hover:border-amber-400 text-slate-800 hover:bg-sky-50';

                  if (selectedOptionId) {
                    if (opt.isCorrect) {
                      cardStyle = 'bg-emerald-500 text-white font-black border-2 border-emerald-300 ring-2 ring-emerald-200 shadow-xs';
                    } else if (isChosen && !opt.isCorrect) {
                      cardStyle = 'bg-rose-100 text-rose-900 font-bold border-2 border-rose-300 shadow-xs';
                    } else {
                      cardStyle = 'bg-slate-50 border-2 border-slate-200 text-slate-400 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={opt.id}
                      disabled={!!selectedOptionId}
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full p-4 rounded-2xl transition-all cursor-pointer text-left flex flex-col gap-2 shadow-xs ${cardStyle}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-xs sm:text-sm font-black leading-snug">{opt.label}</span>
                        {selectedOptionId && opt.isCorrect && (
                          <CheckCircle2 className="w-6 h-6 text-white shrink-0 mt-0.5" />
                        )}
                        {selectedOptionId && isChosen && !opt.isCorrect && (
                          <XCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                        )}
                      </div>

                      {/* Explanation Feedback */}
                      {selectedOptionId && (isChosen || opt.isCorrect) && (
                        <div
                          className={`text-xs p-3 rounded-xl leading-relaxed mt-1 ${
                            opt.isCorrect
                              ? 'bg-emerald-600 text-white border border-emerald-400 font-semibold'
                              : 'bg-rose-50 text-rose-900 border border-rose-300 font-medium'
                          }`}
                        >
                          <strong className="block text-[11px] uppercase tracking-wider mb-0.5 font-black">
                            {opt.isCorrect ? '🌟 Rule Explained:' : '❌ Why That Is Not Correct:'}
                          </strong>
                          {opt.explain}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Next Step Button */}
              {selectedOptionId && (
                <div className="flex justify-end pt-2 animate-in zoom-in-95">
                  <button
                    onClick={handleNextStage}
                    className="px-7 py-3.5 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 hover:from-yellow-200 hover:to-amber-300 text-slate-950 font-black rounded-2xl text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-amber-400/30 border-2 border-yellow-100 cursor-pointer hover:scale-105 transition-all"
                  >
                    <span>
                      {currentStageIdx < mission.stages.length - 1 ? 'Next Challenge Step ➔' : 'Claim Superhero Certificate ➔'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-950 font-black" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* MISSION COMPLETE CELEBRATION CERTIFICATE */
        <div className="bg-white border-2 border-amber-400 rounded-3xl p-6 sm:p-10 shadow-sm text-center space-y-6 animate-in zoom-in-95">
          <div className="flex justify-center">
            <IPQuestBadge size={100} className="logo-glow shadow-xs animate-bounce" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-widest text-amber-900 bg-amber-50 px-3.5 py-1 rounded-full border border-amber-300 inline-block shadow-xs">
              🌟 Official IP Quest Certificate
            </span>
            <h2 className="text-3xl font-black text-[#0e2038] font-display mt-2">
              {mission.realmName} Hero
            </h2>
            <p className="text-sm text-slate-600 font-semibold max-w-lg mx-auto">
              Congratulations You successfully solved the real-world mysteries, protected innovation, and mastered this Intellectual Property superpower
            </p>
          </div>

          {/* Reward Badges */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-xs">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 block">XP Earned</span>
              <span className="text-2xl font-black text-amber-900 mt-0.5 block">+200 XP</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 shadow-xs">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 block">Coins</span>
              <span className="text-2xl font-black text-emerald-900 mt-0.5 block">🪙 ₹50</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-sky-50 border-2 border-sky-300 shadow-xs">
              <span className="text-[10px] font-black uppercase tracking-widest text-sky-800 block">Stars</span>
              <span className="text-2xl font-black text-amber-500 mt-0.5 block">⭐⭐⭐</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              onClick={handleRestart}
              className="px-5 py-3 rounded-2xl bg-white hover:bg-sky-50 text-amber-900 font-black text-xs border-2 border-amber-400 flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <span>Play Again</span>
            </button>

            {onSwitchToMatcher && (
              <button
                onClick={() => { soundFx.playClick(); onSwitchToMatcher(); }}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 hover:from-yellow-200 hover:to-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 border border-yellow-100 cursor-pointer shadow-xs hover:scale-105 transition-all"
              >
                <span>🎯 Play Card Matcher ➔</span>
              </button>
            )}

            {onSwitchToLightning && (
              <button
                onClick={() => { soundFx.playClick(); onSwitchToLightning(); }}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 border border-emerald-100 cursor-pointer shadow-xs hover:scale-105 transition-all"
              >
                <span>⚡ Play Speed Quiz ➔</span>
              </button>
            )}

            {onSwitchTo3D && (
              <button
                onClick={() => { soundFx.playClick(); onSwitchTo3D(); }}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 border border-sky-100 cursor-pointer shadow-xs hover:scale-105 transition-all"
              >
                <Compass className="w-4 h-4 text-slate-950" />
                <span>🌐 3D Facility ➔</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
