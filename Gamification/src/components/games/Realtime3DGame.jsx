import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { soundFx } from '../../utils/sound';
import { 
  ArrowLeft, Sparkles, Award, Compass, Eye, Shield, Lightbulb, Feather, 
  ShieldCheck, Lock, GraduationCap, Volume2, VolumeX, Maximize2, Zap,
  Footprints, Video, Layers, Crosshair, Flashlight, RefreshCw, CheckCircle2,
  AlertTriangle, Check, ArrowRight, Wrench, Cpu, Droplets, Palette, Search,
  Sliders, Key, FileText, BookOpen, User, HelpCircle, CheckSquare, X,
  ChevronDown, ChevronUp, Star, Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ModuleQuizModal } from '../ModuleQuizModal';
import { IPQuestBadge } from '../IPQuestBadge';

export const REALM_STEPS= {
  patent: [
    {
      stepNumber: 1,
      title: 'Help Farmer Ramesh Stop Water Waste',
      shortLabel: 'Talk to Farmer Ramesh',
      objective: 'Walk to Farmer Ramesh at the flooded crop field (3, -4) to assess why water is being wasted.',
      targetName: 'Farmer Ramesh',
      targetLocation: '(3, -4)',
      targetCoords: { x: 3, z: -4 },
      badgeIcon: '🧑‍🌾'
    },
    {
      stepNumber: 2,
      title: 'Collect the 3 Machine Parts',
      shortLabel: 'Collect 3 Machine Parts',
      objective: 'Find three parts near the barn: a soil sensor, a small computer, and an automatic water valve.',
      targetName: 'Machine Parts Cache',
      targetLocation: 'Barn Workshop (-11, -1)',
      targetCoords: { x: -11, z: -1 },
      badgeIcon: '📦'
    },
    {
      stepNumber: 3,
      title: 'Build the Smart Watering Machine',
      shortLabel: 'Build at Workbench',
      objective: 'Step to the Invention Workbench at (-6, 8) to connect the wires and build the working machine!',
      targetName: 'Invention Workbench',
      targetLocation: 'Workbench (-6, 8)',
      targetCoords: { x: -6, z: 8 },
      badgeIcon: '⚙️'
    },
    {
      stepNumber: 4,
      title: 'Test the Sprinkler Machine on Soil',
      shortLabel: 'Test the Machine',
      objective: 'Test the machine at (8, 6): see how it responds when the soil is wet or dry.',
      targetName: 'Live Soil Testing Bed',
      targetLocation: 'Sprinkler Rig (8, 6)',
      targetCoords: { x: 8, z: 6 },
      badgeIcon: '💧'
    },
    {
      stepNumber: 5,
      title: 'Get Official 20-Year Patent Protection',
      shortLabel: 'Get Patent with Dr. Elena',
      objective: 'Show Dr. Elena Vance at (14, -8) how your machine works and explain what makes your invention useful.',
      targetName: 'Dr. Elena Vance (Examiner)',
      targetLocation: 'Patent Office Plinth (14, -8)',
      targetCoords: { x: 14, z: -8 },
      badgeIcon: '👩‍⚖️'
    }
  ],
  copyright: [
    {
      stepNumber: 1,
      title: 'Help Artist Luna Protect Her Artwork',
      shortLabel: 'Talk to Artist Luna',
      objective: 'Meet Artist Luna at (0, -4) to investigate who copied her original "Solar Lynx" drawing without permission.',
      targetName: 'Artist Luna',
      targetLocation: 'Studio Center (0, -4)',
      targetCoords: { x: 0, z: -4 },
      badgeIcon: '👩‍🎨'
    },
    {
      stepNumber: 2,
      title: 'Save & Lock the Drawing on Digital Easel',
      shortLabel: 'Save Art on Digital Easel',
      objective: 'Step to the Digital Creator Easel at (0, -14) to save the drawing and prove you created it first!',
      targetName: 'Digital Creator Easel',
      targetLocation: 'Holographic Easel (0, -14)',
      targetCoords: { x: 0, z: -14 },
      badgeIcon: '🎨'
    },
    {
      stepNumber: 3,
      title: 'Inspect the Copycat Festival Billboard',
      shortLabel: 'Scan Festival Billboard',
      objective: 'Inspect the festival billboard at (12, 6) using the magnifying scanner to document the stolen drawing.',
      targetName: 'Festival Billboard',
      targetLocation: 'Billboard Rig (12, 6)',
      targetCoords: { x: 12, z: 6 },
      badgeIcon: '🔍'
    },
    {
      stepNumber: 4,
      title: 'Teach Promoter Marcus About Copyright',
      shortLabel: 'Talk to Promoter Marcus',
      objective: 'Talk to Promoter Marcus at (16, 6) and explain that "credit" is NOT permission to sell someone’s art!',
      targetName: 'Promoter Marcus',
      targetLocation: 'Club Kiosk (16, 6)',
      targetCoords: { x: 16, z: 6 },
      badgeIcon: '👔'
    },
    {
      stepNumber: 5,
      title: 'Celebrate at the Grand Art Gallery',
      shortLabel: 'Turn on Gallery Lights',
      objective: 'Activate the Gallery Master Switch at (0, 10) to light up the Grand Creator Gallery and celebrate original art!',
      targetName: 'Gallery Master Switch',
      targetLocation: 'Master Console (0, 10)',
      targetCoords: { x: 0, z: 10 },
      badgeIcon: '🏛️'
    }
  ],
  trademark: [
    {
      stepNumber: 1,
      title: 'Help Confused Shopper Sarah',
      shortLabel: 'Talk to Shopper Sarah',
      objective: 'Talk to Customer Sarah on Market Street (-3, -4) to see how copycat storefronts are tricking customers.',
      targetName: 'Customer Sarah',
      targetLocation: 'Market Street (-3, -4)',
      targetCoords: { x: -3, z: -4 },
      badgeIcon: '👩‍💼'
    },
    {
      stepNumber: 2,
      title: 'Invent a 100% Unique Coined Brand Name',
      shortLabel: 'Invent "CitroVibe™" Name',
      objective: 'Enter the Brand Spectrum Lab at (0, 10) and invent a unique coined mark (CitroVibe™) that copycats cannot steal.',
      targetName: 'Brand Spectrum Lab',
      targetLocation: 'Kiosk (0, 10)',
      targetCoords: { x: 0, z: 10 },
      badgeIcon: '⭐'
    },
    {
      stepNumber: 3,
      title: 'Install the Glowing Storefront Sign',
      shortLabel: 'Install CitroVibe™ Storefront',
      objective: 'Walk to Priya\'s storefront at (-10, -8) to install the bright glowing CitroVibe™ neon sign!',
      targetName: 'Priya\'s Storefront Site',
      targetLocation: 'Storefront (-10, -8)',
      targetCoords: { x: -10, z: -8 },
      badgeIcon: '🏪'
    },
    {
      stepNumber: 4,
      title: 'Check the Trademark Registry Database',
      shortLabel: 'Check Brand Registry',
      objective: 'Scan the Trademark Clearance Registry Kiosk at (6, 4) to verify no other company uses CitroVibe.',
      targetName: 'Clearance Registry Kiosk',
      targetLocation: 'Registry Console (6, 4)',
      targetCoords: { x: 6, z: 4 },
      badgeIcon: '🛡️'
    },
    {
      stepNumber: 5,
      title: 'Register the Official ® Trademark with Meera',
      shortLabel: 'Register Official ® Status',
      objective: 'Meet Trademark Advocate Meera at (12, 8) to secure official ® registered trademark status that can last forever!',
      targetName: 'Advocate Meera',
      targetLocation: 'Legal Chamber (12, 8)',
      targetCoords: { x: 12, z: 8 },
      badgeIcon: '⚖️'
    }
  ],
  trade_secret: [
    {
      stepNumber: 1,
      title: 'Security Briefing with Chief Rajiv',
      shortLabel: 'Talk to Chief Rajiv',
      objective: 'Talk to Chief Security Officer Rajiv at (0, 10) to learn how to keep secret recipes safe with passwords and locks.',
      targetName: 'Counsel Rajiv',
      targetLocation: 'Vault Chamber (0, 10)',
      targetCoords: { x: 0, z: 10 },
      badgeIcon: '👨‍💼'
    },
    {
      stepNumber: 2,
      title: 'Lock the Secret Recipe in the Safe',
      shortLabel: 'Lock Safe (PIN: 9042)',
      objective: 'Approach the unlocked formula cabinet at (-8, 0), enter Master PIN (9042), and lock the secret formula safe!',
      targetName: 'Biometric Safe Cabinet',
      targetLocation: 'Vault Wing (-8, 0)',
      targetCoords: { x: -8, z: 0 },
      badgeIcon: '🔐'
    },
    {
      stepNumber: 3,
      title: 'Set Password & Auto-Lock on Lab Computer',
      shortLabel: 'Lock Lab Computer',
      objective: 'Walk to the open computer at (8, 0) and turn on password protection and automatic 2-minute screen timeout!',
      targetName: 'Unattended Polymer Terminal',
      targetLocation: 'Terminal Array (8, 0)',
      targetCoords: { x: 8, z: 0 },
      badgeIcon: '💻'
    },
    {
      stepNumber: 4,
      title: 'Block Cyber Hacker Intrusion with Killswitch',
      shortLabel: 'Pull Emergency Killswitch',
      objective: 'Sprint to the Master Air-Gap Console at (0, -14) and pull the physical killswitch to block sneaky cyber hackers!',
      targetName: 'Air-Gap Console',
      targetLocation: 'Console (0, -14)',
      targetCoords: { x: 0, z: -14 },
      badgeIcon: '🚨'
    },
    {
      stepNumber: 5,
      title: 'Certify the High-Security Master Vault',
      shortLabel: 'Certify Master Vault',
      objective: 'Report back to Chief Rajiv at (0, 10) to obtain official certification that your secret recipe is 100% safe!',
      targetName: 'Counsel Rajiv',
      targetLocation: 'Vault Chamber (0, 10)',
      targetCoords: { x: 0, z: 10 },
      badgeIcon: '📜'
    }
  ],
  plagiarism: [
    {
      stepNumber: 1,
      title: 'Help Student Jordan with School Homework',
      shortLabel: 'Talk to Student Jordan',
      objective: 'Speak with Student Jordan at (0, -4) to assess why the biology essay was flagged for 78% copied text.',
      targetName: 'Student Jordan',
      targetLocation: 'Quad Lawn (0, -4)',
      targetCoords: { x: 0, z: -4 },
      badgeIcon: '🧑‍🎓'
    },
    {
      stepNumber: 2,
      title: 'Find the Original Book in the Library',
      shortLabel: 'Find Book in Library',
      objective: 'Navigate to the Library Archives at (-10, -8) to retrieve Dr. Lin’s original 2021 science research book.',
      targetName: 'Library Archives Plinth',
      targetLocation: 'Archives (-10, -8)',
      targetCoords: { x: -10, z: -8 },
      badgeIcon: '📑'
    },
    {
      stepNumber: 3,
      title: 'Fix the Copied Sentences at Writing Desk',
      shortLabel: 'Rewrite at Writing Desk',
      objective: 'Step to the Writing Desk at (10, -6) to explain ideas in your own words, add quotation marks, and cite Dr. Lin!',
      targetName: 'Authorial Synthesis Plinth',
      targetLocation: 'Plinth (10, -6)',
      targetCoords: { x: 10, z: -6 },
      badgeIcon: '✍️'
    },
    {
      stepNumber: 4,
      title: 'Learn the School Academic Honor Code',
      shortLabel: 'Read Honor Code Obelisk',
      objective: 'Examine the Honor Monument at (0, 0) to learn why Plagiarism is about school honesty, while Copyright is about property.',
      targetName: 'Honor Monument',
      targetLocation: 'Central Obelisk (0, 0)',
      targetCoords: { x: 0, z: 0 },
      badgeIcon: '🏛️'
    },
    {
      stepNumber: 5,
      title: 'Fire the Academic Integrity Beacon!',
      shortLabel: 'Fire Integrity Beacon',
      objective: 'Activate the glowing Academic Integrity Beacon at (0, 10) to submit the 100% honest clean essay to Teacher Clara!',
      targetName: 'Academic Integrity Beacon',
      targetLocation: 'Beacon Array (0, 10)',
      targetCoords: { x: 0, z: 10 },
      badgeIcon: '🌟'
    }
  ]
};

// ==========================================
// EASY POINTS & CORE CONCEPTS FOR ALL 5 TOPICS
// Simple, intuitive, student-friendly language
// ==========================================
export const EASY_POINTS = {
  patent: {
    title: 'Patent: Protecting Inventions',
    simpleDefinition: 'A patent can protect a new, useful invention—like how a working machine solves a problem. It does not protect a brand name or an idea by itself.',
    icon: '💡',
    color: 'text-amber-400',
    badgeColor: 'bg-amber-400/20 text-amber-300 border-amber-400/50',
    tagline: 'A patent gives its owner the right to make, use, or sell the invention for a limited time.',
    points: [
      {
        title: 'Point 1: Novelty (Brand New)',
        description: 'Your machine or process must never have existed or been published anywhere in the world before.',
        icon: '✨'
      },
      {
        title: 'Point 2: Inventive Step (Not Obvious)',
        description: 'It cannot be something a normal mechanic or engineer could easily guess or combine without creativity.',
        icon: '⚙️'
      },
      {
        title: 'Point 3: Practical Utility & Working Machine',
        description: 'You cannot patent just an abstract thought It must actually work and solve a real problem (like our smart soil sensor valve).',
        icon: '🛠️'
      }
    ],
    realWorldExample: 'Everyday Example: James Dyson patented the dual-cyclone bagless vacuum cleaner mechanism, stopping copycats for 20 years.',
    goldenRule: 'Golden Rule: Inventions = Patents. Brand names = Trademarks. Ideas alone = Not protectable until built!',
    dosAndDonts: {
      do: 'DO build and test a physical working proto solves a real technical problem.',
      dont: 'DON\'T try to patent an abstract thought in your head or a brand name like "AquaFlow".'
    },
    checklist: [
      'Inventions & machines are patented for 20 years, not logos or abstract ideas.',
      'Must satisfy Novelty (never existed before) and Inventive Step (non-obvious).',
      'Requires full public disclosure in exchange for exclusive commercial rights.'
    ],
    quickCheck: {
      question: 'Can you patent the brand name "AquaFlow" for your farm\'s juice shop?',
      options: [
        { text: 'Yes, all names and logos are patents', correct: false, explanation: 'Names and logos belong to Trademarks, not Patents!' },
        { text: 'No, names are Trademarks; patents protect how machines and gadgets work', correct: true, explanation: 'Spot on Patents protect the mechanical/technical invention itself.' }
      ]
    }
  },
  copyright: {
    title: 'Copyright: Protecting Creative Art',
    simpleDefinition: 'Copyright protects ORIGINAL CREATIVE EXPRESSIONS (paintings, songs, books, videos, video game code) the very second you create them!',
    icon: '🎨',
    color: 'text-indigo-400',
    badgeColor: 'bg-indigo-400/20 text-indigo-300 border-indigo-400/50',
    tagline: 'Automatic legal protection that begins the second you draw, record, or write your creation.',
    points: [
      {
        title: 'Point 1: Instant Automatic Protection',
        description: 'The second your original artwork is "fixed" on canvas, screen, or paper, copyright exists automatically No fee or registration needed.',
        icon: '⚡'
      },
      {
        title: 'Point 2: Protects Expression, NOT Facts or Ideas',
        description: 'Anyone can write a story about wizards, but they cannot copy J.K. Rowling\'s exact words or specific Harry Potter characters.',
        icon: '📖'
      },
      {
        title: 'Point 3: Credit is NOT a Commercial License!',
        description: 'Saying "Credits to the artist" does NOT allow a business to print and sell festival posters without written permission and royalties.',
        icon: '🚫'
      }
    ],
    realWorldExample: 'Everyday Example: Disney owns the copyright to Mickey Mouse animations and Frozen songs; others cannot copy or sell them without license.',
    goldenRule: 'Golden Rule: The creator controls who copies, performs, or sells their art. Credit alone is not permission!',
    dosAndDonts: {
      do: 'DO ask permission and negotiate a written license before commercially printing or selling someone\'s art.',
      dont: 'DON\'T believe that tagging an artist or giving "credit" gives you the legal right to sell their work.'
    },
    checklist: [
      'Copyright vests automatically the instant original art, music, or code is created.',
      'Protects creative expression, NOT raw ideas, facts, or historical events.',
      'Attribution is not a commercial license—you need written permission and royalties to sell copies.'
    ],
    quickCheck: {
      question: 'If you tag an artist on social media, can you print and sell t-shirts with their drawing?',
      options: [
        { text: 'Yes, because you gave them credit', correct: false, explanation: 'Attribution does not grant commercial reproduction rights!' },
        { text: 'No, you must have an official license or permission to sell their art', correct: true, explanation: 'Exactly Only the copyright owner can authorize commercial copies.' }
      ]
    }
  },
  trademark: {
    title: 'Trademark: Protecting Brand Identity',
    simpleDefinition: 'A trademark protects BRAND NAMES, LOGOS, SLOGANS, and SYMBOLS so customers know who made the product and can trust the quality.',
    icon: '™️',
    color: 'text-emerald-400',
    badgeColor: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/50',
    tagline: 'Preventing customer confusion in the marketplace.',
    points: [
      {
        title: 'Point 1: Stopping Customer Confusion',
        description: 'If two shops have confusingly similar names (like Priya\'s Juice vs Best & Bloom), customers get tricked into buying sour juice!',
        icon: '🛒'
      },
      {
        title: 'Point 2: Made-Up Words are the Strongest',
        description: 'Invented coined words (like "CitroVibe" or "Kodak") get 100% legal protection. Everyday generic words ("Juice") get 0% protection!',
        icon: '⭐'
      },
      {
        title: 'Point 3: Can Last Forever!',
        description: 'Unlike patents (20 years), trademarks last indefinitely as long as the business keeps using them and renews every 10 years.',
        icon: '♾️'
      }
    ],
    realWorldExample: 'Everyday Example: The Nike Swoosh and the name "Nike" tell shoppers the shoes are authentic and made by Nike.',
    goldenRule: 'Golden Rule: Trademarks protect shoppers from being fooled by knock-off brands. Distinctive coined names win!',
    dosAndDonts: {
      do: 'DO invent a unique, coined word (like CitroVibe™ or Kodak) for maximum 100% brand power.',
      dont: 'DON\'T pick common generic dictionary words like "Juice" (0% protection, cannot be owned).'
    },
    checklist: [
      'Trademarks protect brand names, logos, slogans & symbols to prevent customer confusion.',
      'Fanciful coined words (invented names) have the strongest legal distinctiveness.',
      'Can last forever as long as renewed every 10 years and actively used in commerce.'
    ],
    quickCheck: {
      question: 'Why can\'t a juice bar trademark the single common word "Juice"?',
      options: [
        { text: 'Because it is a generic word that all competitors must be free to use', correct: true, explanation: 'Correct Generic words belong to everyone and cannot be monopolized.' },
        { text: 'Because juice has too much sugar', correct: false, explanation: 'The legal reason is that generic words cannot identify a single commercial source.' }
      ]
    }
  },
  trade_secret: {
    title: 'Trade Secret: Protecting Confidential Know-How',
    simpleDefinition: 'A trade secret protects VALUABLE BUSINESS SECRETS (secret recipes, chemical formulas, algorithms) by keeping them strictly confidential.',
    icon: '🔐',
    color: 'text-rose-400',
    badgeColor: 'bg-rose-400/20 text-rose-300 border-rose-400/50',
    tagline: 'Lasts forever without filing any public papers, as long as reasonable security is maintained.',
    points: [
      {
        title: 'Point 1: Secret + Business Value',
        description: 'The formula must not be generally known, and keeping it secret gives the business an edge over competitors.',
        icon: '💎'
      },
      {
        title: 'Point 2: Must Take "Reasonable Precautions"',
        description: 'You MUST lock cabinets, use passwords, require NDAs, and enforce 2FA. If you leave it on a coffee table, you lose legal protection forever!',
        icon: '🛡️'
      },
      {
        title: 'Point 3: Never Expires (Unlike Patents)',
        description: 'A patent expires in 20 years because you publish the blueprint. A trade secret can last for centuries if never leaked!',
        icon: '⏳'
      }
    ],
    realWorldExample: 'Everyday Example: Coca-Cola has protected its secret formula in a physical vault for over 135 years instead of patenting it.',
    goldenRule: 'Golden Rule: If you share it on the internet or leave it unprotected, your trade secret is dead forever. Lock it up!',
    dosAndDonts: {
      do: 'DO actively lock formulas in biometric safes, use passwords, require NDAs, and enforce access control.',
      dont: 'DON\'T leave secret formulas unencrypted or published—legal protection is lost forever!'
    },
    checklist: [
      'Protects confidential recipes, chemical catalysts & source code without public paperwork.',
      'Lasts indefinitely (unlike 20-year patents) as long as secrecy is preserved.',
      'You MUST maintain active reasonable precautions or courts will dismiss your claim.'
    ],
    quickCheck: {
      question: 'What happens if a company fails to password-protect its secret manufacturing formula?',
      options: [
        { text: 'It automatically turns into a patent', correct: false, explanation: 'Patents require formal application and examination at the government office.' },
        { text: 'It loses trade secret legal protection because reasonable precautions were not taken', correct: true, explanation: 'Exactly Courts require proof of active reasonable security measures.' }
      ]
    }
  },
  plagiarism: {
    title: 'Plagiarism: Academic Honesty & Attribution',
    simpleDefinition: 'Plagiarism means COPYING SOMEONE ELSE\'S WORDS OR IDEAS and pretending you wrote them yourself. It is an ethical violation of honesty.',
    icon: '📚',
    color: 'text-cyan-400',
    badgeColor: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/50',
    tagline: 'Mastering scholarship through original thinking and honest attribution.',
    points: [
      {
        title: 'Point 1: Ethical Trust vs Legal Property',
        description: 'Plagiarism is a moral breach of academic honesty in school; copyright infringement is a legal violation of economic property rights.',
        icon: '⚖️'
      },
      {
        title: 'Point 2: Changing 2 Words is NOT Enough!',
        description: 'Simply swapping a couple of words with synonyms is "patchwriting" and still counts as plagiarism if uncredited.',
        icon: '🔍'
      },
      {
        title: 'Point 3: The 3 Easy Solutions',
        description: '1. Paraphrase completely in your own voice. 2. Put exact words in quotation marks "...". 3. Always cite the author (Name, Year)!',
        icon: '✍️'
      }
    ],
    realWorldExample: 'Everyday Example: A student research paper that cites Dr. Lin (2021) gets an A+ for scholarship, while copying sentences without credit causes failure.',
    goldenRule: 'Golden Rule: Be proud of your own voice If you borrow someone else\'s brilliant idea, always celebrate them with a citation.',
    dosAndDonts: {
      do: 'DO synthesize concepts in your authentic voice, put borrowed phrases in quotes, and cite (Author, Year).',
      dont: 'DON\'T patchwrite by swapping 2 words with synonyms or copy-pasting without citation.'
    },
    checklist: [
      'Plagiarism is an academic honesty violation in school; copyright is economic property law.',
      'Patchwriting (swapping synonyms) is still plagiarism if the source structure is copied without credit.',
      'The 3 Golden Rules: 1. Paraphrase in your voice. 2. Quote exact terms. 3. Cite the source!'
    ],
    quickCheck: {
      question: 'How do you fix a research paper that has a 78% similarity score?',
      options: [
        { text: 'Change the font color to white so the teacher cannot see it', correct: false, explanation: 'Cheating will get you caught by similarity scanners!' },
        { text: 'Rewrite in your own voice, quote key terms, and add in-text citations', correct: true, explanation: 'A+ That drops similarity down to a clean 4% ethically.' }
      ]
    }
  }
};

// ==========================================
// PROCEDURAL HIGH-RESOLUTION TEXTURE GENERATORS
// ==========================================
function createCobblestoneCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#292524';
  ctx.fillRect(0, 0, 512, 512);

  for (let y = 0; y < 512; y += 32) {
    const shift = (y / 32) % 2 === 0 ? 0 : 16;
    for (let x = -16; x < 528; x += 32) {
      const stoneX = x + shift;
      const shade = 55 + Math.floor(Math.random() * 35);
      ctx.fillStyle = `rgb(${shade}, ${shade + 2}, ${shade + 5})`;
      ctx.fillRect(stoneX + 2, y + 2, 28, 28);
      ctx.fillStyle = '#1c1917';
      ctx.strokeRect(stoneX + 1.5, y + 1.5, 29, 29);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  return tex;
}

function createWoodPlankCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#451a03';
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 512; i += 64) {
    const woodVal = 85 + (i % 3) * 20;
    ctx.fillStyle = `rgb(${woodVal + 30}, ${woodVal + 10}, 30)`;
    ctx.fillRect(0, i, 512, 62);
    ctx.strokeStyle = '#291003';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, i + 63);
    ctx.lineTo(512, i + 63);
    ctx.stroke();
    for (let g = 0; g < 12; g++) {
      ctx.fillStyle = 'rgba(35, 12, 5, 0.2)';
      ctx.fillRect(Math.random() * 512, i + Math.random() * 60, 40 + Math.random() * 80, 2);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

function createSoilGrassCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#14532d';
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = Math.random();
    if (r > 0.35) {
      ctx.fillStyle = r > 0.7 ? '#166534' : '#15803d';
      ctx.fillRect(x, y, 2.5, 3.5);
    } else {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x, y, 3, 3);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  return tex;
}

function createSciFiMetalFloorCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#334155';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 3;
  for (let x = 0; x < 512; x += 64) {
    for (let y = 0; y < 512; y += 64) {
      ctx.fillStyle = (x + y) % 128 === 0 ? '#475569' : '#334155';
      ctx.fillRect(x + 2, y + 2, 60, 60);
      ctx.strokeRect(x + 2, y + 2, 60, 60);
      ctx.fillStyle = '#52525b';
      ctx.fillRect(x + 5, y + 5, 3, 3);
      ctx.fillRect(x + 55, y + 5, 3, 3);
      ctx.fillRect(x + 5, y + 55, 3, 3);
      ctx.fillRect(x + 55, y + 55, 3, 3);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 5);
  return tex;
}

function createLearningDisplayTexture({ title, subtitle, icon, accent, scene }) {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, canvas.width, 96);
  ctx.fillStyle = accent;
  ctx.fillRect(0, 96, canvas.width, 12);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${icon}  ${title}`, 38, 62, 690);

  const art = { x: 34, y: 132, w: 700, h: 258 };
  const gradient = ctx.createLinearGradient(art.x, art.y, art.x + art.w, art.y + art.h);
  gradient.addColorStop(0, '#e0f2fe');
  gradient.addColorStop(1, '#dcfce7');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(art.x, art.y, art.w, art.h, 24);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(art.x, art.y, art.w, art.h, 24);
  ctx.clip();

  if (scene === 'art') {
    ctx.fillStyle = '#fde68a';
    ctx.beginPath();
    ctx.arc(560, 188, 44, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7c3aed';
    ctx.beginPath();
    ctx.moveTo(150, 360);
    ctx.lineTo(310, 180);
    ctx.lineTo(450, 360);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#db2777';
    ctx.beginPath();
    ctx.arc(310, 256, 62, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 58px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦', 310, 278);
  } else if (scene === 'billboard') {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(art.x, art.y + 180, art.w, 78);
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(170, 240, 76, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 46px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('FESTIVAL', 282, 228);
    ctx.font = '26px system-ui, sans-serif';
    ctx.fillText('LIVE MUSIC  •  ART  •  COMMUNITY', 282, 270);
  } else if (scene === 'invention') {
    ctx.strokeStyle = '#0369a1';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(160, 260);
    ctx.lineTo(315, 260);
    ctx.lineTo(470, 260);
    ctx.stroke();
    ctx.fillStyle = '#16a34a';
    ctx.beginPath();
    ctx.arc(160, 260, 58, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1d4ed8';
    ctx.beginPath();
    ctx.roundRect(260, 208, 110, 104, 18);
    ctx.fill();
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(424, 220, 104, 80, 22);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SENSE', 160, 275);
    ctx.fillText('THINK', 315, 275);
    ctx.fillText('DO', 476, 275);
  } else {
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(384, 258, 82, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 84px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, 384, 254, 120);
    ctx.textBaseline = 'alphabetic';
  }
  ctx.restore();

  ctx.fillStyle = '#334155';
  ctx.font = '600 28px system-ui, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(subtitle, 38, 454, 690);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export const Realtime3DGame = ({
  initialConcept,
  stats,
  onCompleteMission,
  onBack,
  onSwitchTo2D,
  onSwitchRealm,
  onOpenDashboard
}) => {
  const containerRef = useRef(null);
  const [currentConcept, setCurrentConcept] = useState(initialConcept);
  
  // Game State & Quest Tracking
  const [activePrompt, setActivePrompt] = useState(null);
  const [questTitle, setQuestTitle] = useState('');
  const [questObjective, setQuestObjective] = useState('');
  const [questProgress, setQuestProgress] = useState({ current: 0, total: 5 });
  const [notification, setNotification] = useState(null);
  const [missionCompleteCelebration, setMissionCompleteCelebration] = useState(false);
  const [isSprinting, setIsSprinting] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(true);
  const [cameraMode, setCameraMode] = useState('follow');
  const [playerCoord, setPlayerCoord] = useState({ x: 0, z: 0 });
  const playerCoordRef = useRef({ x: 0, z: 0 });

  // Easy Points & Concept Mastery Guides
  const [showEasyPointsModal, setShowEasyPointsModal] = useState(false);
  const [easyConceptTab, setEasyConceptTab] = useState(initialConcept);
  const [showRealmEasyCard, setShowRealmEasyCard] = useState(false);
  const [quizAnswered, setQuizAnswered] = useState({});
  const [masteredChecklist, setMasteredChecklist] = useState({});
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [quizModalConcept, setQuizModalConcept] = useState(initialConcept);

  // Interactive In-World Modals for Hands-On Student Agency
  const [circuitModal, setCircuitModal] = useState(false);
  const [circuitWires, setCircuitWires] = useState({
    probe: false, mcu: false, valve: false, power: false
  });
  const [testingBedModal, setTestingBedModal] = useState(false);
  const [patentSoilMoisture, setPatentSoilMoisture] = useState(14);
  const [patentValveOpen, setPatentValveOpen] = useState(false);
  const [patentAutoEnabled, setPatentAutoEnabled] = useState(false);
  const [patentClaimsModal, setPatentClaimsModal] = useState(false);

  const [copyrightCanvasModal, setCopyrightCanvasModal] = useState(false);
  const [studentCreatorName, setStudentCreatorName] = useState('Student Inventor');
  const [chosenLicense, setChosenLicense] = useState('arr');
  const [infringementLoupeModal, setInfringementLoupeModal] = useState(false);
  const [detectedVectors, setDetectedVectors] = useState({
    v1: false, v2: false, v3: false
  });

  const [brandSpectrumModal, setBrandSpectrumModal] = useState(false);
  const [brandSelected, setBrandSelected] = useState('CitroVibe™');
  const [brandTier, setBrandTier] = useState('fanciful');
  const [confusionPercent, setConfusionPercent] = useState(85);

  const [vaultKeypadModal, setVaultKeypadModal] = useState(false);
  const [keypadInput, setKeypadInput] = useState('');
  const [rbacInternPerm, setRbacInternPerm] = useState(false);
  const [firewallLockdownModal, setFirewallLockdownModal] = useState(false);
  const [firewallNodes, setFirewallNodes] = useState({
    n1: false, n2: false, n3: false
  });

  const [plagiarismWorkbenchModal, setPlagiarismWorkbenchModal] = useState(false);
  const [similarityScore, setSimilarityScore] = useState(78);
  const [fixedPassages, setFixedPassages] = useState({
    p1: false, p2: false, p3: false
  });

  // Student Backpack / Passport Drawer
  const [showBackpack, setShowBackpack] = useState(false);

  // Dynamic Interactive NPC Dialogue with Student Choice System
  const [dialogueModal, setDialogueModal] = useState(null);

  // Three.js instances
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const animFrameIdRef = useRef(null);
  
  // Realistic Inventor 3D Rig
  const playerGroupRef = useRef(null);
  const playerFlashlightRef = useRef(null);
  const playerVelocityYRef = useRef(0);
  const isGroundedRef = useRef(true);
  const playerRotationRef = useRef(0);
  const leftLegRef = useRef(null);
  const rightLegRef = useRef(null);
  const leftArmRef = useRef(null);
  const rightArmRef = useRef(null);
  const headGroupRef = useRef(null);
  const torsoGroupRef = useRef(null);
  const scannerToolRef = useRef(null);
  const idleTimerRef = useRef(0);

  // Dynamic Scene Elements
  const windTurbineBladesRef = useRef(null);
  const waterSprayParticlesRef = useRef(null);
  const laserBeamsRef = useRef([]);
  const movingNPCsRef = useRef([]);
  const priyaStorefrontRef = useRef(null);
  const priyaNeonSignRef = useRef(null);
  const beaconRingsRef = useRef([]);
  const alarmLightRef = useRef(null);
  const waterPipeSectionRef = useRef(null);

  // Input states
  const keysPressed = useRef({});
  const joystickVector = useRef({ x: 0, y: 0 });
  const [isTouchMoving, setIsTouchMoving] = useState(false);
  const joystickOrigin = useRef({ x: 0, y: 0 });
  const [joystickThumbPos, setJoystickThumbPos] = useState({ x: 0, y: 0 });
  const dpadMovement = useRef({ x: 0, z: 0 });

  // Camera Orbit / Mouse drag
  const isOrbitingRef = useRef(false);
  const orbitAngleRef = useRef(0);
  const orbitPitchRef = useRef(0.4);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const cameraModeRef = useRef('follow');

  // Click-to-Move, Cursor Reticle & Raycasting Navigation
  const targetMovePosRef = useRef(null);
  const pendingActionRef = useRef(null);
  const clickMarkerMeshRef = useRef(null);
  const cursorReticleMeshRef = useRef(null);
  const mouseDownInfo = useRef({ 
    x: 0, y: 0, time: 0, button: 0, isDrag: false 
  });
  const [showTouchControls, setShowTouchControls] = useState(true);
  const [isCleanMode, setIsCleanMode] = useState(false);
  const zoomFactorRef = useRef(1.0);
  const [hoveredObject, setHoveredObject] = useState(null);
  const [cursorStyle, setCursorStyle] = useState('crosshair');

  // Dynamic Interactables list & Sequential Step Enforcer
  const interactablesRef = useRef([]);
  const nearestInteractableRef = useRef(null);
  const questStepRef = useRef(0);
  const waypointMeshRef = useRef(null);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [expandedStepsHUD, setExpandedStepsHUD] = useState(true);
  const modalOpenRef = useRef(false);
  const isModalOpen = Boolean(
    showEasyPointsModal ||
    showQuizModal ||
    circuitModal ||
    testingBedModal ||
    patentClaimsModal ||
    copyrightCanvasModal ||
    infringementLoupeModal ||
    brandSpectrumModal ||
    vaultKeypadModal ||
    firewallLockdownModal ||
    plagiarismWorkbenchModal ||
    showBackpack ||
    dialogueModal ||
    missionCompleteCelebration
  );
  modalOpenRef.current = isModalOpen;

  useEffect(() => {
    if (!isModalOpen) return;

    setHoveredObject(null);
    setActivePrompt(null);
    setCursorStyle('crosshair');
    isOrbitingRef.current = false;
    mouseDownInfo.current.isDrag = false;
    if (cursorReticleMeshRef.current) {
      cursorReticleMeshRef.current.visible = false;
    }
  }, [isModalOpen]);

  // Realm specific state trackers
  const realmStateRef = useRef({
    patent: {
      farmerSpoke: false,
      sensorCollected: false,
      mcuCollected: false,
      valveCollected: false,
      circuitWired: false,
      assembled: false,
      testedWetDry: false,
      claimsApproved: false
    },
    copyright: {
      lunaSpoke: false,
      artworkCustomized: false,
      artworkFixed: false,
      vectorsFound: false,
      promoterConfronted: false,
      galleryCurated: false
    },
    trademark: {
      sarahSpoke: false,
      brandDesigned: false,
      storefrontRenovated: false,
      confusionEliminated: false,
      attorneySpoke: false
    },
    trade_secret: {
      cabinetLocked: false,
      rbacConfigured: false,
      terminalSecured: false,
      intrusionRepelled: false,
      counselSpoke: false
    },
    plagiarism: {
      jordanSpoke: false,
      sourceFound: false,
      passagesRewritten: false,
      citationsAdded: false,
      beaconFired: false
    }
  });

  const showToast = ( msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 3800);
  };

  // Sequential Step Advancer: Unlocks strictly the NEXT step and finishes the mission at Step 5
  const advanceQuestStep = ( newStep, customToast) => {
    questStepRef.current = newStep;
    setQuestProgress({ current: newStep, total: 5 });
    const realmStepList = REALM_STEPS[currentConcept];
    if (newStep < 5) {
      const nextStepInfo = realmStepList[newStep];
      if (nextStepInfo) {
        setQuestObjective(nextStepInfo.objective);
      }
      soundFx.playSuccess();
      if (customToast) {
        showToast(customToast);
      } else if (nextStepInfo) {
        showToast(`✓ Step ${newStep} cleared Unlocked Step ${newStep + 1}: ${nextStepInfo.shortLabel}`);
      }
    } else {
      // 100% Realm Mastery Completion
      setQuestObjective(`🎉 All 5 Steps Mastered Official ${currentConcept.toUpperCase().replace('_', ' ')} Certification Conferred.`);
      soundFx.playLevelUp();
      confetti({ particleCount: 160, spread: 100 });
      setMissionCompleteCelebration(true);
      setShowCertificateModal(true);
      onCompleteMission(250, 60, 3, currentConcept);
      showToast(`🏆 ${currentConcept.toUpperCase().replace('_', ' ')} REALM 100% MASTERED All 5 steps completed.`);
    }
  };

  // Safe Sequential Interaction Trigger
  const handleTriggerInteract = (item) => {
    const curStep = questStepRef.current;
    if (item.stepIndex !== undefined && item.stepIndex > curStep) {
      soundFx.playInvestigate();
      const curStepInfo = REALM_STEPS[currentConcept]?.[curStep];
      showToast(`🔒 Step ${item.stepIndex + 1} is locked Complete Step ${curStep + 1} (${curStepInfo?.shortLabel || 'Current Step'}) first.`);
      return;
    }
    soundFx.playClick();
    item.action();
  };

  // Keyboard Event Handlers & Sprinting
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (modalOpenRef.current) {
        keysPressed.current[e.key.toLowerCase()] = false;
        keysPressed.current[e.code] = false;
        return;
      }

      keysPressed.current[e.key.toLowerCase()] = true;
      keysPressed.current[e.code] = true;

      if (e.key === 'Shift') {
        setIsSprinting(true);
      }

      // Toggle Flashlight (F)
      if (e.key === 'f' || e.key === 'F') {
        soundFx.playClick();
        setFlashlightOn(curr => {
          const next = !curr;
          if (playerFlashlightRef.current) playerFlashlightRef.current.intensity = next ? 2.5 : 0;
          return next;
        });
      }

      // Toggle Backpack / Field Guide (B)
      if (e.key === 'b' || e.key === 'B') {
        soundFx.playClick();
        setShowBackpack(curr => !curr);
      }

      // Focus / Toggle Inventor Face View (V)
      if (e.key === 'v' || e.key === 'V') {
        soundFx.playClick();
        setCameraMode(curr => curr === 'face' ? 'follow' : 'face');
      }

      // Jump (Space)
      if (e.code === 'Space' && isGroundedRef.current) {
        soundFx.playJump();
        playerVelocityYRef.current = 0.28;
        isGroundedRef.current = false;
      }

      // Interact (E)
      if ((e.key === 'e' || e.key === 'E') && nearestInteractableRef.current) {
        soundFx.playClick();
        nearestInteractableRef.current.action();
      }
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
      keysPressed.current[e.code] = false;

      if (e.key === 'Shift') {
        setIsSprinting(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Helper to spawn an animated click ring on the terrain
  const spawnClickRipple = ( x, y, z, colorHex = 0xf59e0b) => {
    if (!sceneRef.current) return;
    if (clickMarkerMeshRef.current) {
      sceneRef.current.remove(clickMarkerMeshRef.current);
      clickMarkerMeshRef.current = null;
    }
    const ringGeo = new THREE.RingGeometry(0.35, 0.65, 24);
    const ringMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.95, side: THREE.DoubleSide });
    const marker = new THREE.Mesh(ringGeo, ringMat);
    marker.rotation.x = -Math.PI / 2;
    marker.position.set(x, y + 0.04, z);
    marker.userData = { created: Date.now() };
    sceneRef.current.add(marker);
    clickMarkerMeshRef.current = marker;
  };

  // Dedicated Click-to-Move and Interactive Action Handler
  const executeClickNavigation = ( clientX, clientY) => {
    if (!containerRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

    // 1. Check if clicked near an interactable NPC, Portal, or Workbench
    let clickedInteractable= null;
    let minRayDist = Infinity;
    for (const item of interactablesRef.current) {
      const sphere = new THREE.Sphere(
        new THREE.Vector3(item.position.x, item.position.y + 0.9, item.position.z), 
        Math.max(1.8, item.radius * 0.9)
      );
      if (raycaster.ray.intersectsSphere(sphere)) {
        const d = raycaster.ray.origin.distanceTo(item.position);
        if (d < minRayDist) {
          minRayDist = d;
          clickedInteractable = item;
        }
      }
    }

    if (clickedInteractable) {
      soundFx.playClick();
      targetMovePosRef.current = new THREE.Vector3(clickedInteractable.position.x, 0, clickedInteractable.position.z);
      pendingActionRef.current = clickedInteractable.action;
      spawnClickRipple(clickedInteractable.position.x, 0.05, clickedInteractable.position.z, 0x38bdf8);
      showToast(`Walking to ${clickedInteractable.name}...`);
    } else {
      // 2. Intersect with ground plane at y = 0
      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const targetPoint = new THREE.Vector3();
      if (raycaster.ray.intersectPlane(groundPlane, targetPoint)) {
        targetPoint.x = Math.max(-28, Math.min(28, targetPoint.x));
        targetPoint.z = Math.max(-28, Math.min(28, targetPoint.z));
        targetMovePosRef.current = targetPoint;
        pendingActionRef.current = null;
        spawnClickRipple(targetPoint.x, 0.05, targetPoint.z, 0xf59e0b);
        soundFx.playFootstep();
      }
    }
  };

  // Mouse drag camera controls, Wheel zoom & Click-to-Move
  const handleMouseDown = (e) => {
    if (modalOpenRef.current) return;

    mouseDownInfo.current = { 
      x: e.clientX, 
      y: e.clientY, 
      time: Date.now(), 
      button: e.button, 
      isDrag: false 
    };
    if (e.button === 1 || e.button === 2) {
      isOrbitingRef.current = true;
      setCursorStyle('grabbing');
    }
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (modalOpenRef.current) {
      setHoveredObject(null);
      return;
    }

    const distFromDown = Math.hypot(e.clientX - mouseDownInfo.current.x, e.clientY - mouseDownInfo.current.y);

    // If mouse button is held down and dragged > 6px, enter orbit rotation
    if (e.buttons > 0 && distFromDown > 6) {
      mouseDownInfo.current.isDrag = true;
      isOrbitingRef.current = true;
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      orbitAngleRef.current -= dx * 0.006;
      orbitPitchRef.current = Math.max(0.1, Math.min(1.2, orbitPitchRef.current + dy * 0.005));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      setCursorStyle('grabbing');
      return;
    }

    if (isOrbitingRef.current) {
      setCursorStyle('grabbing');
      return;
    }

    // Raycast hover detection when cursor is inside 3D game field
    if (containerRef.current && cameraRef.current && sceneRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);

      let found= null;
      let minRayDist = Infinity;
      for (const item of interactablesRef.current) {
        const sphere = new THREE.Sphere(
          new THREE.Vector3(item.position.x, item.position.y + 0.9, item.position.z),
          Math.max(1.8, item.radius * 0.9)
        );
        if (raycaster.ray.intersectsSphere(sphere)) {
          const d = raycaster.ray.origin.distanceTo(item.position);
          if (d < minRayDist) {
            minRayDist = d;
            found = item;
          }
        }
      }

      const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const pt = new THREE.Vector3();
      const hitsGround = raycaster.ray.intersectPlane(groundPlane, pt) && Math.abs(pt.x) <= 28 && Math.abs(pt.z) <= 28;

      if (found) {
        setCursorStyle('pointer');
        setHoveredObject({
          name: found.name,
          category: 'Station',
          actionDesc: found.prompt || 'Click to walk & interact',
          screenPos: { x: e.clientX - rect.left, y: e.clientY - rect.top }
        });
        if (cursorReticleMeshRef.current) {
          cursorReticleMeshRef.current.position.set(found.position.x, 0.04, found.position.z);
          cursorReticleMeshRef.current.visible = true;
          cursorReticleMeshRef.current.scale.set(1.35, 1.35, 1.35);
        }
      } else if (hitsGround) {
        setCursorStyle('crosshair');
        setHoveredObject({
          name: 'Navigation Point',
          category: 'Ground',
          actionDesc: 'Click to walk here',
          screenPos: { x: e.clientX - rect.left, y: e.clientY - rect.top }
        });
        if (cursorReticleMeshRef.current) {
          cursorReticleMeshRef.current.position.set(pt.x, 0.03, pt.z);
          cursorReticleMeshRef.current.visible = true;
          cursorReticleMeshRef.current.scale.set(1.0, 1.0, 1.0);
        }
      } else {
        setCursorStyle('grab');
        setHoveredObject(null);
        if (cursorReticleMeshRef.current) {
          cursorReticleMeshRef.current.visible = false;
        }
      }
    }
  };

  const handleMouseLeave = () => {
    isOrbitingRef.current = false;
    setHoveredObject(null);
    setCursorStyle('crosshair');
    if (cursorReticleMeshRef.current) {
      cursorReticleMeshRef.current.visible = false;
    }
  };

  const handleWheel = (e) => {
    zoomFactorRef.current = Math.max(0.6, Math.min(1.8, zoomFactorRef.current + e.deltaY * 0.0012));
  };

  const handleMouseUp = (e) => {
    if (modalOpenRef.current) return;

    const wasDrag = mouseDownInfo.current.isDrag || isOrbitingRef.current;
    isOrbitingRef.current = false;
    setCursorStyle('crosshair');
    const dt = Date.now() - mouseDownInfo.current.time;
    const dx = Math.abs(e.clientX - mouseDownInfo.current.x);
    const dy = Math.abs(e.clientY - mouseDownInfo.current.y);

    // If it was a left click (not a sustained camera orbit drag): navigate player
    if (mouseDownInfo.current.button === 0 && !wasDrag && dt < 700 && dx < 18 && dy < 18) {
      executeClickNavigation(e.clientX, e.clientY);
    }
  };

  // Sync cameraModeRef
  useEffect(() => {
    cameraModeRef.current = cameraMode;
  }, [cameraMode]);

  // Build high-fidelity Three.js scene
  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = Math.max(container.clientWidth || window.innerWidth, 320);
    const height = Math.max(container.clientHeight || (window.innerHeight - 80), 400);

    // 1. Setup Scene, Camera, High-Precision PBR Renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1200);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Dynamic Resize Observer for zero distortion
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = Math.max(container.clientWidth || window.innerWidth, 320);
      const h = Math.max(container.clientHeight || (window.innerHeight - 80), 400);
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    // Clear references
    interactablesRef.current = [];
    laserBeamsRef.current = [];
    movingNPCsRef.current = [];
    beaconRingsRef.current = [];
    waterSprayParticlesRef.current = null;
    windTurbineBladesRef.current = null;
    priyaStorefrontRef.current = null;
    priyaNeonSignRef.current = null;
    alarmLightRef.current = null;
    waterPipeSectionRef.current = null;

    // ==========================================
    // 2. HIGH-FIDELITY REALISTIC INVENTOR CHARACTER RIG
    // ==========================================
    const playerGroup = new THREE.Group();
    playerGroupRef.current = playerGroup;

    // Torso Group: Layered Inventor Coat with Utility Belt & Lanyard
    const torsoGroup = new THREE.Group();
    torsoGroupRef.current = torsoGroup;

    // Outer Technical Lab Coat / Explorer Parka
    const coatMat = new THREE.MeshStandardMaterial({ 
      color: 0x0369a1, // Deep Inventor Marine Blue
      roughness: 0.5, 
      metalness: 0.2 
    });
    const coatMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.32, 0.95, 16), coatMat);
    coatMesh.position.y = 1.05;
    coatMesh.castShadow = true;
    torsoGroup.add(coatMesh);

    // Sculpted Coat Lapels & Inner Shirt
    const shirtMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 });
    const innerShirt = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.6, 0.35), shirtMat);
    innerShirt.position.set(0, 1.15, 0.08);
    torsoGroup.add(innerShirt);

    // Inventor Utility Belt with Metallic Buckle
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x3f2e1e, roughness: 0.6 });
    const belt = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.12, 16), beltMat);
    belt.position.y = 0.68;
    torsoGroup.add(belt);

    const buckleMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });
    const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.1, 0.08), buckleMat);
    buckle.position.set(0, 0.68, 0.36);
    torsoGroup.add(buckle);

    // Belt Side Tool Holsters (Wrench, Digital Pliers, Calipers)
    const pouchMat = new THREE.MeshStandardMaterial({ color: 0x291d13, roughness: 0.5 });
    const pouchL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.14), pouchMat);
    pouchL.position.set(-0.38, 0.66, 0);
    torsoGroup.add(pouchL);

    const pouchR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.18, 0.14), pouchMat);
    pouchR.position.set(0.38, 0.66, 0);
    torsoGroup.add(pouchR);

    // Mini Brass Wrench inserted into right holster
    const wrenchMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.28, 8),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.9, roughness: 0.3 })
    );
    wrenchMesh.position.set(0.42, 0.75, 0);
    wrenchMesh.rotation.z = -0.3;
    torsoGroup.add(wrenchMesh);

    // Inventor ID Badge Lanyard (Hangs over chest)
    const badgeLanyard = new THREE.Mesh(
      new THREE.TorusGeometry(0.26, 0.02, 6, 16),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b })
    );
    badgeLanyard.rotation.x = Math.PI / 2.3;
    badgeLanyard.position.set(0, 1.45, 0.1);
    torsoGroup.add(badgeLanyard);

    const idCard = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.2, 0.02),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
    );
    idCard.position.set(0, 1.05, 0.36);
    torsoGroup.add(idCard);

    // Technical Backpack with LED Status Core & Antenna
    const packGeo = new THREE.BoxGeometry(0.44, 0.58, 0.26);
    const packMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.4 });
    const pack = new THREE.Mesh(packGeo, packMat);
    pack.position.set(0, 1.1, -0.28);
    pack.castShadow = true;
    torsoGroup.add(pack);

    // Antenna on backpack
    const antMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.45, 8),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 })
    );
    antMesh.position.set(0.16, 1.55, -0.32);
    torsoGroup.add(antMesh);

    // Glowing Heartbeat Core on backpack
    const ledMat = new THREE.MeshStandardMaterial({ 
      color: 0x10b981, 
      emissive: 0x10b981, 
      emissiveIntensity: 1.6 
    });
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), ledMat);
    led.position.set(0, 1.1, -0.42);
    torsoGroup.add(led);

    // Dynamic Chest Spotlight Flashlight
    const flashlight = new THREE.SpotLight(0xfffbeb, flashlightOn ? 2.5 : 0, 32, Math.PI / 5, 0.35);
    flashlight.position.set(0, 1.25, 0.35);
    flashlight.target.position.set(0, 0.5, 8);
    flashlight.castShadow = true;
    torsoGroup.add(flashlight);
    torsoGroup.add(flashlight.target);
    playerFlashlightRef.current = flashlight;

    playerGroup.add(torsoGroup);

    // Head Group: High-Detail Sculpted Inventor Face, Hair, Goggles, Smile & Eyes
    const headGroup = new THREE.Group();
    headGroupRef.current = headGroup;
    headGroup.position.y = 1.75;

    // Dedicated Face Fill Light (ensures Inventor face is always bright, illuminated and crystal clear)
    const faceLight = new THREE.PointLight(0xfff7ed, 1.5, 4.5);
    faceLight.position.set(0, 0.15, 0.85);
    headGroup.add(faceLight);

    // Sculpted Head Mesh with Smooth Skin Tone
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfbd2a4, roughness: 0.45, metalness: 0.05 });
    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 24), skinMat);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // Sculpted Chin Contour
    const chin = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), skinMat);
    chin.scale.set(1.1, 0.85, 1.2);
    chin.position.set(0, -0.22, 0.16);
    headGroup.add(chin);

    // Warm Rosy Cheeks (Blush)
    const cheekMat = new THREE.MeshStandardMaterial({ color: 0xf87171, roughness: 0.5 });
    const lCheek = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), cheekMat);
    lCheek.position.set(-0.16, -0.06, 0.23);
    headGroup.add(lCheek);
    const rCheek = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), cheekMat);
    rCheek.position.set(0.16, -0.06, 0.23);
    headGroup.add(rCheek);

    // Sculpted Left & Right Ears
    const lEar = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.022, 8, 16), skinMat);
    lEar.rotation.y = Math.PI / 2;
    lEar.position.set(-0.30, 0.02, 0.02);
    headGroup.add(lEar);
    const rEar = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.022, 8, 16), skinMat);
    rEar.rotation.y = Math.PI / 2;
    rEar.position.set(0.30, 0.02, 0.02);
    headGroup.add(rEar);

    // Sculpted Nose with Bridge and Tip
    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.09, 8), skinMat);
    nose.rotation.x = Math.PI / 2.1;
    nose.position.set(0, -0.01, 0.32);
    headGroup.add(nose);

    // Detailed Expressive Eyes with Pupils and Specular Highlights
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const irisMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x090d16 });
    const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyelidMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });

    // Left Eye
    const lEyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.062, 16, 16), eyeWhiteMat);
    lEyeWhite.scale.set(1, 0.9, 0.6);
    lEyeWhite.position.set(-0.105, 0.05, 0.275);
    headGroup.add(lEyeWhite);

    const lIris = new THREE.Mesh(new THREE.SphereGeometry(0.038, 14, 14), irisMat);
    lIris.position.set(-0.105, 0.05, 0.312);
    headGroup.add(lIris);

    const lPupil = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 10), pupilMat);
    lPupil.position.set(-0.105, 0.05, 0.33);
    headGroup.add(lPupil);

    const lGlint = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 8), glintMat);
    lGlint.position.set(-0.095, 0.065, 0.338);
    headGroup.add(lGlint);

    const lEyelid = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.018, 0.03), eyelidMat);
    lEyelid.position.set(-0.105, 0.09, 0.29);
    headGroup.add(lEyelid);

    // Right Eye
    const rEyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.062, 16, 16), eyeWhiteMat);
    rEyeWhite.scale.set(1, 0.9, 0.6);
    rEyeWhite.position.set(0.105, 0.05, 0.275);
    headGroup.add(rEyeWhite);

    const rIris = new THREE.Mesh(new THREE.SphereGeometry(0.038, 14, 14), irisMat);
    rIris.position.set(0.105, 0.05, 0.312);
    headGroup.add(rIris);

    const rPupil = new THREE.Mesh(new THREE.SphereGeometry(0.02, 10, 10), pupilMat);
    rPupil.position.set(0.105, 0.05, 0.33);
    headGroup.add(rPupil);

    const rGlint = new THREE.Mesh(new THREE.SphereGeometry(0.01, 8, 8), glintMat);
    rGlint.position.set(0.115, 0.065, 0.338);
    headGroup.add(rGlint);

    const rEyelid = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.018, 0.03), eyelidMat);
    rEyelid.position.set(0.105, 0.09, 0.29);
    headGroup.add(rEyelid);

    // Expressive Arched Eyebrows
    const browMat = new THREE.MeshBasicMaterial({ color: 0x271a15 });
    const lBrow = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.022, 0.02), browMat);
    lBrow.position.set(-0.105, 0.12, 0.285);
    lBrow.rotation.z = 0.08;
    headGroup.add(lBrow);

    const rBrow = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.022, 0.02), browMat);
    rBrow.position.set(0.105, 0.12, 0.285);
    rBrow.rotation.z = -0.08;
    headGroup.add(rBrow);

    // Smiling Confident Mouth with Lips and Teeth Line
    const lipMat = new THREE.MeshStandardMaterial({ color: 0xbe123c, roughness: 0.35 });
    const teethMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const mouthInnerMat = new THREE.MeshBasicMaterial({ color: 0x4c0519 });

    const mouthMesh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.04), mouthInnerMat);
    mouthMesh.position.set(0, -0.13, 0.295);
    headGroup.add(mouthMesh);

    const teethMesh = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.015, 0.02), teethMat);
    teethMesh.position.set(0, -0.125, 0.305);
    headGroup.add(teethMesh);

    const upperLip = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.016, 0.03), lipMat);
    upperLip.position.set(0, -0.115, 0.30);
    headGroup.add(upperLip);

    const lowerLip = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.02, 0.035), lipMat);
    lowerLip.position.set(0, -0.145, 0.295);
    headGroup.add(lowerLip);

    // Sculpted Hair Cap & Bangs
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.75 });
    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.315, 18, 18, 0, Math.PI * 2, 0, Math.PI / 2.1), hairMat);
    hairCap.position.y = 0.03;
    headGroup.add(hairCap);

    // Front Side-swept Hair Bangs (clear of eyes)
    const bangs = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.11, 0.08), hairMat);
    bangs.rotation.z = -0.1;
    bangs.position.set(-0.04, 0.21, 0.27);
    headGroup.add(bangs);

    // Sideburns framing the face cleanly
    const lSideburn = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.06), hairMat);
    lSideburn.position.set(-0.29, 0.04, 0.10);
    headGroup.add(lSideburn);
    const rSideburn = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.14, 0.06), hairMat);
    rSideburn.position.set(0.29, 0.04, 0.10);
    headGroup.add(rSideburn);

    // Inventor Brass Goggles resting neatly on Forehead/Crown
    const goggleFrameMat = new THREE.MeshStandardMaterial({ 
      color: 0xd97706, // Brass frame
      metalness: 0.85, 
      roughness: 0.2 
    });
    const goggleLensMat = new THREE.MeshStandardMaterial({ 
      color: 0x38bdf8, 
      roughness: 0.05, 
      metalness: 0.9, 
      transparent: true, 
      opacity: 0.75 
    });

    const lGoggle = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.05, 16), goggleFrameMat);
    lGoggle.rotation.x = Math.PI / 2.3;
    lGoggle.position.set(-0.11, 0.26, 0.21);
    headGroup.add(lGoggle);

    const lLens = new THREE.Mesh(new THREE.CircleGeometry(0.07, 16), goggleLensMat);
    lLens.rotation.x = -Math.PI / 10;
    lLens.position.set(-0.11, 0.26, 0.24);
    headGroup.add(lLens);

    const rGoggle = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.05, 16), goggleFrameMat);
    rGoggle.rotation.x = Math.PI / 2.3;
    rGoggle.position.set(0.11, 0.26, 0.21);
    headGroup.add(rGoggle);

    const rLens = new THREE.Mesh(new THREE.CircleGeometry(0.07, 16), goggleLensMat);
    rLens.rotation.x = -Math.PI / 10;
    rLens.position.set(0.11, 0.26, 0.24);
    headGroup.add(rLens);

    // Brass goggle bridge
    const goggleBridge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.02), goggleFrameMat);
    goggleBridge.position.set(0, 0.26, 0.22);
    headGroup.add(goggleBridge);

    // Goggle Leather Strap wrapping around head
    const strap = new THREE.Mesh(
      new THREE.TorusGeometry(0.31, 0.025, 8, 20),
      new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.8 })
    );
    strap.rotation.x = Math.PI / 2.2;
    strap.position.y = 0.25;
    headGroup.add(strap);

    playerGroup.add(headGroup);

    // Articulated Legs with Knee Guards and Lugged Boots
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.3 });
    const kneeGuardMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.7, roughness: 0.3 });

    // Left Leg
    const leftLegGroup = new THREE.Group();
    const lUpperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.6, 10), pantsMat);
    lUpperLeg.position.y = 0.35;
    lUpperLeg.castShadow = true;
    leftLegGroup.add(lUpperLeg);

    const lKnee = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.1), kneeGuardMat);
    lKnee.position.set(0, 0.3, 0.09);
    leftLegGroup.add(lKnee);

    const lBoot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 0.34), bootMat);
    lBoot.position.set(0, 0.09, 0.07);
    lBoot.castShadow = true;
    leftLegGroup.add(lBoot);

    leftLegGroup.position.set(-0.18, 0, 0);
    leftLegRef.current = leftLegGroup;
    playerGroup.add(leftLegGroup);

    // Right Leg
    const rightLegGroup = new THREE.Group();
    const rUpperLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.6, 10), pantsMat);
    rUpperLeg.position.y = 0.35;
    rUpperLeg.castShadow = true;
    rightLegGroup.add(rUpperLeg);

    const rKnee = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.1), kneeGuardMat);
    rKnee.position.set(0, 0.3, 0.09);
    rightLegGroup.add(rKnee);

    const rBoot = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.18, 0.34), bootMat);
    rBoot.position.set(0, 0.09, 0.07);
    rBoot.castShadow = true;
    rightLegGroup.add(rBoot);

    rightLegGroup.position.set(0.18, 0, 0);
    rightLegRef.current = rightLegGroup;
    playerGroup.add(rightLegGroup);

    // Left Arm with Glove
    const sleeveMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 });
    const gloveMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });

    const leftArmGroup = new THREE.Group();
    const lSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.55, 10), sleeveMat);
    lSleeve.position.y = -0.25;
    lSleeve.castShadow = true;
    leftArmGroup.add(lSleeve);

    const lHand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.1), gloveMat);
    lHand.position.y = -0.56;
    leftArmGroup.add(lHand);
    leftArmGroup.position.set(-0.48, 1.4, 0);
    leftArmRef.current = leftArmGroup;
    playerGroup.add(leftArmGroup);

    // Right Arm with Glove & In-Hand Diagnostic Multi-Tool Scanner
    const rightArmGroup = new THREE.Group();
    const rSleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.08, 0.55, 10), sleeveMat);
    rSleeve.position.y = -0.25;
    rSleeve.castShadow = true;
    rightArmGroup.add(rSleeve);

    const rHand = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.1), gloveMat);
    rHand.position.y = -0.56;
    rightArmGroup.add(rHand);

    // Holographic Diagnostic Multi-Tool in Right Hand
    const toolGroup = new THREE.Group();
    const toolBody = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.24, 0.08), 
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.2 })
    );
    const toolScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(0.09, 0.16), 
      new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
    );
    toolScreen.position.z = 0.045;
    toolGroup.add(toolBody);
    toolGroup.add(toolScreen);

    // Glowing Laser Probe Tip
    const probeTip = new THREE.Mesh(
      new THREE.ConeGeometry(0.03, 0.08, 8),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 1.5 })
    );
    probeTip.position.y = 0.16;
    toolGroup.add(probeTip);

    toolGroup.position.set(0, -0.65, 0.12);
    toolGroup.rotation.x = 0.4;
    rightArmGroup.add(toolGroup);
    scannerToolRef.current = toolGroup;

    rightArmGroup.position.set(0.48, 1.4, 0);
    rightArmRef.current = rightArmGroup;
    playerGroup.add(rightArmGroup);

    // Ground Contact Shadow
    const shadowGeo = new THREE.CircleGeometry(0.55, 24);
    const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45 });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.02;
    playerGroup.add(shadow);

    playerGroup.position.set(0, 0, 0);
    scene.add(playerGroup);

    // 3. Build Realistic 3D Realms
    buildRealisticRealm(scene, currentConcept);

    // 4. Real-Time Physics & Animation Loop
    let walkCycle = 0;
    let stepSoundTimer = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Current Movement Input
      let moveX = 0;
      let moveZ = 0;
      let isAutoMoving = false;

      if (keysPressed.current['w'] || keysPressed.current['arrowup']) moveZ -= 1;
      if (keysPressed.current['s'] || keysPressed.current['arrowdown']) moveZ += 1;
      if (keysPressed.current['a'] || keysPressed.current['arrowleft']) moveX -= 1;
      if (keysPressed.current['d'] || keysPressed.current['arrowright']) moveX += 1;

      if (isTouchMoving) {
        moveX += joystickVector.current.x;
        moveZ += joystickVector.current.y;
      }

      // On-screen D-Pad input
      if (dpadMovement.current.x !== 0 || dpadMovement.current.z !== 0) {
        moveX += dpadMovement.current.x;
        moveZ += dpadMovement.current.z;
      }

      // If manual keys or dpad are used, cancel click-to-move target
      if (Math.abs(moveX) > 0.05 || Math.abs(moveZ) > 0.05) {
        targetMovePosRef.current = null;
        pendingActionRef.current = null;
      } else if (targetMovePosRef.current && playerGroupRef.current) {
        // Automatic walk to clicked ground or NPC
        const pPos = playerGroupRef.current.position;
        const dx = targetMovePosRef.current.x - pPos.x;
        const dz = targetMovePosRef.current.z - pPos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist > 0.45) {
          moveX = dx;
          moveZ = dz;
          isAutoMoving = true;
        } else {
          targetMovePosRef.current = null;
          if (pendingActionRef.current) {
            const act = pendingActionRef.current;
            pendingActionRef.current = null;
            act();
          }
        }
      }

      // Animate Destination Click Marker (Pulse & Fade)
      if (clickMarkerMeshRef.current) {
        const marker = clickMarkerMeshRef.current;
        const age = (Date.now() - (marker.userData.created || 0)) / 1000;
        if (age < 0.85) {
          marker.scale.set(1.0 + age * 0.9, 1.0 + age * 0.9, 1.0);
          marker.material.opacity = Math.max(0, 0.95 - age * 1.1);
        } else {
          if (sceneRef.current) sceneRef.current.remove(marker);
          clickMarkerMeshRef.current = null;
        }
      }

      const inputLen = Math.sqrt(moveX * moveX + moveZ * moveZ);
      const isMoving = inputLen > 0.05;
      const effectiveSpeed = (isSprinting ? 0.28 : 0.16);

      // Character Physics & Movement
      if (playerGroupRef.current) {
        // Jumping & Gravity
        playerVelocityYRef.current -= 0.016;
        playerGroupRef.current.position.y += playerVelocityYRef.current;
        if (playerGroupRef.current.position.y <= 0) {
          playerGroupRef.current.position.y = 0;
          playerVelocityYRef.current = 0;
          isGroundedRef.current = true;
        }

        if (isMoving) {
          idleTimerRef.current = 0;
          const normX = moveX / inputLen;
          const normZ = moveZ / inputLen;

          // For click-to-move, normX/normZ are in world space; for keys, they relate to camera orbit
          const angle = isAutoMoving 
            ? Math.atan2(normX, normZ) 
            : Math.atan2(normX, normZ) + orbitAngleRef.current;

          const speedVectorX = Math.sin(angle) * effectiveSpeed;
          const speedVectorZ = Math.cos(angle) * effectiveSpeed;

          playerGroupRef.current.position.x += speedVectorX;
          playerGroupRef.current.position.z += speedVectorZ;

          // Bounds clamp
          playerGroupRef.current.position.x = Math.max(-28, Math.min(28, playerGroupRef.current.position.x));
          playerGroupRef.current.position.z = Math.max(-28, Math.min(28, playerGroupRef.current.position.z));

          // Smooth character facing
          playerRotationRef.current = THREE.MathUtils.lerp(playerRotationRef.current, angle, 0.22);
          playerGroupRef.current.rotation.y = playerRotationRef.current;

          // Running Tilt / Lean into turn
          const turnDiff = angle - playerRotationRef.current;
          playerGroupRef.current.rotation.z = THREE.MathUtils.lerp(playerGroupRef.current.rotation.z, -turnDiff * 0.4, 0.1);

          // Animate realistic walking / running stride
          const cycleSpeed = isSprinting ? 18 : 12;
          walkCycle += delta * cycleSpeed;
          const strideAmp = isSprinting ? 0.85 : 0.6;

          if (leftLegRef.current && rightLegRef.current && leftArmRef.current && rightArmRef.current) {
            leftLegRef.current.rotation.x = Math.sin(walkCycle) * strideAmp;
            rightLegRef.current.rotation.x = -Math.sin(walkCycle) * strideAmp;
            leftArmRef.current.rotation.x = -Math.sin(walkCycle) * (strideAmp * 0.75);
            rightArmRef.current.rotation.x = Math.sin(walkCycle) * (strideAmp * 0.75);
          }

          // Footstep audio
          stepSoundTimer += delta * (isSprinting ? 2.8 : 2.0);
          if (stepSoundTimer >= 1.0) {
            soundFx.playFootstep();
            stepSoundTimer = 0;
          }
        } else {
          // Standing Idle: Subtle breathing & Inventor Idle gestures
          idleTimerRef.current += delta;
          playerGroupRef.current.rotation.z = THREE.MathUtils.lerp(playerGroupRef.current.rotation.z, 0, 0.1);

          if (torsoGroupRef.current) {
            torsoGroupRef.current.position.y = Math.sin(time * 2.5) * 0.02; // breathing
          }

          if (leftLegRef.current && rightLegRef.current && leftArmRef.current && rightArmRef.current) {
            leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, 0.15);
            rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, 0.15);

            // After 3s of standing still: inventor inspects tool
            if (idleTimerRef.current > 3.0) {
              rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -0.65, 0.08);
              leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -0.3, 0.08);
            } else {
              leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.15);
              rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.15);
            }
          }
        }

        // Update player coordinates for HUD radar
        const roundedX = Math.round(playerGroupRef.current.position.x);
        const roundedZ = Math.round(playerGroupRef.current.position.z);
        if (playerCoordRef.current.x !== roundedX || playerCoordRef.current.z !== roundedZ) {
          const nextCoord = { x: roundedX, z: roundedZ };
          playerCoordRef.current = nextCoord;
          setPlayerCoord(nextCoord);
        }

        // Camera Follow Modes (Read from cameraModeRef for zero scene rebuilds)
        if (cameraRef.current) {
          const currentCamMode = cameraModeRef.current;
          const isFaceCam = currentCamMode === 'face';
          const baseCamDist = currentCamMode === 'tactical' ? 14 : currentCamMode === 'fps' ? 0.25 : isFaceCam ? 3.8 : Math.max(5.5, 8.5 * Math.cos(orbitPitchRef.current * 0.35));
          const camDist = baseCamDist * (currentCamMode === 'fps' ? 1 : zoomFactorRef.current);
          const camHeight = currentCamMode === 'tactical' ? 11 : currentCamMode === 'fps' ? 1.75 : isFaceCam ? 1.85 : Math.max(2.4, 4.6 * Math.sin(orbitPitchRef.current));

          let angle = orbitAngleRef.current;
          if (isFaceCam) {
            // Front view framing the inventor's face and expression clearly with the realm behind
            angle = playerRotationRef.current + 0.12;
          }

          const offsetX = Math.sin(angle) * camDist;
          const offsetZ = Math.cos(angle) * camDist;

          const targetCamPos = new THREE.Vector3(
            playerGroupRef.current.position.x + offsetX,
            playerGroupRef.current.position.y + camHeight,
            playerGroupRef.current.position.z + offsetZ
          );

          cameraRef.current.position.lerp(targetCamPos, 0.14);
          cameraRef.current.lookAt(
            playerGroupRef.current.position.x,
            playerGroupRef.current.position.y + (isFaceCam ? 1.7 : currentCamMode === 'fps' ? 1.75 : 1.4),
            playerGroupRef.current.position.z
          );
        }
      }

      // Dynamic Realm Animations
      // 1. Wind Turbine Blades
      if (windTurbineBladesRef.current) {
        windTurbineBladesRef.current.rotation.z += 0.025;
      }

      // 2. Animated Water Spray Particles
      if (waterSprayParticlesRef.current) {
        const positions = waterSprayParticlesRef.current.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] -= 0.04;
          if (positions[i + 1] <= 0.05) {
            positions[i + 1] = 2.4;
            positions[i] = 8 + (Math.random() - 0.5) * 2.2;
            positions[i + 2] = 6 + (Math.random() - 0.5) * 2.2;
          }
        }
        waterSprayParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // 3. Sweeping Security Laser Beams (Trade Secret Vault)
      for (const laser of laserBeamsRef.current) {
        laser.mesh.position.x += laser.speed * laser.direction;
        laser.light.position.x = laser.mesh.position.x;
        if (laser.mesh.position.x >= laser.maxX || laser.mesh.position.x <= laser.minX) {
          laser.direction *= -1;
        }

        // Check if player hits laser beam
        if (playerGroupRef.current) {
          const p = playerGroupRef.current.position;
          const distZ = Math.abs(p.z - laser.zPos);
          const distX = Math.abs(p.x - laser.mesh.position.x);
          if (distZ < 1.0 && distX < 2.5) {
            soundFx.playAlarm();
            showToast('⚠️ Security Laser Triggered Time your movement!');
          }
        }
      }

      // 4. Moving Pedestrian NPCs (Brand City Boulevard)
      for (const npc of movingNPCsRef.current) {
        const target = npc.waypoints[npc.currentWaypointIdx];
        const dir = target.clone().sub(npc.group.position);
        const dist = dir.length();
        if (dist < 0.4) {
          npc.currentWaypointIdx = (npc.currentWaypointIdx + 1) % npc.waypoints.length;
        } else {
          dir.normalize();
          npc.group.position.addScaledVector(dir, npc.speed);
          npc.group.rotation.y = Math.atan2(dir.x, dir.z);
          npc.walkCycle += 0.12;
          if (npc.legs.length === 2) {
            npc.legs[0].rotation.x = Math.sin(npc.walkCycle) * 0.45;
            npc.legs[1].rotation.x = -Math.sin(npc.walkCycle) * 0.45;
          }
        }
      }

      // 5. Blinking Alarm Light
      if (alarmLightRef.current) {
        alarmLightRef.current.intensity = 1.2 + Math.sin(time * 6) * 1.0;
      }

      // 6. Rotating Concentric Academic Beacon Rings
      for (const ring of beaconRingsRef.current) {
        ring.rotation.z += 0.03;
      }

      // Proximity to Interactables
      if (playerGroupRef.current) {
        const pPos = playerGroupRef.current.position;
        let closest= null;
        let minD = Infinity;

        for (const item of interactablesRef.current) {
          const d = pPos.distanceTo(item.position);
          if (d <= item.radius && d < minD) {
            minD = d;
            closest = item;
          }
        }

        nearestInteractableRef.current = closest;
        if (closest) {
          setActivePrompt(`[E] ${closest.prompt}`);
          if (headGroupRef.current) {
            headGroupRef.current.lookAt(closest.position.x, closest.position.y + 1.2, closest.position.z);
          }
        } else {
          setActivePrompt(null);
          if (headGroupRef.current) {
            headGroupRef.current.rotation.set(0, 0, 0);
          }
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      if (container && renderer && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
    };
  }, [currentConcept]);

  const switchRealm = (concept) => {
    soundFx.playClick();
    setCurrentConcept(concept);
    setDialogueModal(null);
    setMissionCompleteCelebration(false);
    if (onSwitchRealm) {
      onSwitchRealm(concept);
    }
  };

  // ==========================================
  // REALM 1: PATENT LAB — THE SMART IRRIGATION CHALLENGE
  // ==========================================
  const buildRealisticPatentFarm = (scene) => {
    scene.background = new THREE.Color(0x38bdf8);
    scene.fog = new THREE.FogExp2(0x38bdf8, 0.014);

    setQuestTitle('Patent Lab: The Smart Irrigation Challenge');
    setQuestObjective('Help Farmer Ramesh stop wasting water. Find a soil sensor, a small computer, and an automatic valve, then connect and test the machine.');
    setQuestProgress({ current: 0, total: 5 });

    // Sunlight & Sky
    const hemiLight = new THREE.HemisphereLight(0xffedd5, 0x14532d, 0.7);
    scene.add(hemiLight);

    const sun = new THREE.DirectionalLight(0xfffbeb, 1.4);
    sun.position.set(25, 40, 20);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 120;
    sun.shadow.bias = -0.0005;
    scene.add(sun);

    // Realistic Soil / Grass Ground
    const groundGeo = new THREE.PlaneGeometry(70, 70);
    const groundMat = new THREE.MeshStandardMaterial({ 
      map: createSoilGrassCanvas(), 
      roughness: 0.85, 
      metalness: 0.1 
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Barn Workshop Building
    const barnGroup = new THREE.Group();
    const barnWallMat = new THREE.MeshStandardMaterial({ map: createWoodPlankCanvas(), roughness: 0.7 });
    const barnWalls = new THREE.Mesh(new THREE.BoxGeometry(14, 7, 10), barnWallMat);
    barnWalls.position.set(0, 3.5, 0);
    barnWalls.castShadow = true;
    barnWalls.receiveShadow = true;
    barnGroup.add(barnWalls);

    const roofGeo = new THREE.ConeGeometry(9.5, 3.5, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.4 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, 8.2, 0);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    barnGroup.add(roof);

    barnGroup.position.set(-14, 0, -12);
    scene.add(barnGroup);

    // Wind Turbine
    const turbineGroup = new THREE.Group();
    const towerMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.9, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.4 })
    );
    towerMesh.position.y = 8;
    towerMesh.castShadow = true;
    turbineGroup.add(towerMesh);

    const nacelle = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 1.2, 2.5),
      new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4 })
    );
    nacelle.position.set(0, 16, 0.4);
    turbineGroup.add(nacelle);

    const bladesGroup = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 7.5, 0.08),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
      );
      blade.position.y = 3.6;
      const pivot = new THREE.Group();
      pivot.rotation.z = (i * Math.PI * 2) / 3;
      pivot.add(blade);
      bladesGroup.add(pivot);
    }
    bladesGroup.position.set(0, 16, 1.7);
    turbineGroup.add(bladesGroup);
    windTurbineBladesRef.current = bladesGroup;

    turbineGroup.position.set(18, 0, -14);
    scene.add(turbineGroup);

    // Farm Tractor
    const tractorGroup = new THREE.Group();
    const chassis = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.2, 3.8),
      new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4 })
    );
    chassis.position.y = 1.0;
    tractorGroup.add(chassis);

    const cab = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 1.6, 1.8),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 })
    );
    cab.position.set(0, 2.2, -0.6);
    tractorGroup.add(cab);

    const bigWheelGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.5, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
    const rWheel1 = new THREE.Mesh(bigWheelGeo, wheelMat);
    rWheel1.rotation.z = Math.PI / 2;
    rWheel1.position.set(-1.4, 0.9, -1.0);
    tractorGroup.add(rWheel1);
    const rWheel2 = new THREE.Mesh(bigWheelGeo, wheelMat);
    rWheel2.rotation.z = Math.PI / 2;
    rWheel2.position.set(1.4, 0.9, -1.0);
    tractorGroup.add(rWheel2);

    tractorGroup.position.set(-18, 0, 8);
    tractorGroup.rotation.y = 0.5;
    scene.add(tractorGroup);

    // Crops
    for (let rx = 4; rx <= 12; rx += 2) {
      for (let rz = 2; rz <= 12; rz += 2) {
        const crop = new THREE.Mesh(
          new THREE.ConeGeometry(0.4, 1.2, 8),
          new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.6 })
        );
        crop.position.set(rx, 0.6, rz);
        crop.castShadow = true;
        scene.add(crop);
      }
    }

    // Leaking Sprinkler Rig
    const sprinklerGroup = new THREE.Group();
    const pipeMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.2 });
    const pipeMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2.5, 12), pipeMat);
    pipeMesh.position.y = 1.25;
    pipeMesh.castShadow = true;
    sprinklerGroup.add(pipeMesh);

    const glassSection = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.8, 12),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7, roughness: 0.1 })
    );
    glassSection.position.y = 1.4;
    sprinklerGroup.add(glassSection);
    waterPipeSectionRef.current = glassSection;

    sprinklerGroup.position.set(8, 0, 6);
    scene.add(sprinklerGroup);

    // Water Spray Particles
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = 8 + (Math.random() - 0.5) * 2.5;
      positions[i * 3 + 1] = 0.1 + Math.random() * 2.4;
      positions[i * 3 + 2] = 6 + (Math.random() - 0.5) * 2.5;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0xbae6fd, size: 0.18, transparent: true, opacity: 0.8 });
    const waterParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(waterParticles);
    waterSprayParticlesRef.current = waterParticles;

    // Flooded Mud Puddle
    const puddleGeo = new THREE.CircleGeometry(4.5, 32);
    const puddleMat = new THREE.MeshStandardMaterial({ 
      color: 0x0284c7, 
      roughness: 0.05, 
      metalness: 0.8,
      transparent: true,
      opacity: 0.8 
    });
    const puddle = new THREE.Mesh(puddleGeo, puddleMat);
    puddle.rotation.x = -Math.PI / 2;
    puddle.position.set(8, 0.03, 6);
    scene.add(puddle);

    // NPC: Realistic Farmer Ramesh with Straw Hat & Flannel
    createRealisticNPC(scene, 3, 0, -4, 'Farmer Ramesh', '🧑‍🌾', 0x9a3412, () => {
      soundFx.playClick();
      setDialogueModal({
        speaker: 'Farmer Ramesh',
        avatar: '🧑‍🌾',
        title: 'Agricultural Over-Irrigation Crisis',
        text: 'Our old timer pumps water on a schedule—even after it rains. The soil gets too wet, the crops suffer, and our reservoir is shrinking. What could help?',
        choices: [
          {
            label: 'Option A: Buy a bigger water tank.',
            response: 'A bigger tank holds more water, but the timer would still waste it. We need to fix how the watering machine works.'
          },
          {
            label: 'Option B: Build a soil sensor that waters only when needed.',
            response: 'Exactly! The sensor checks the soil, a small computer decides what to do, and a valve controls the water. A patent can protect a new working invention like this—not just its name or an idea. Now find the three parts near the workshop.',
            onPick: () => {
              realmStateRef.current.patent.farmerSpoke = true;
              setQuestObjective('Find three parts near the barn: a soil sensor, a small computer, and an automatic water valve.');
              setQuestProgress({ current: 1, total: 5 });
              showToast('✓ Mission Started Collect the 3 components.');
            }
          }
        ]
      });
    });

    // 3D Pickups
    createRealisticPickup(scene, -8, 0.4, -6, 'Soil Moisture Probe', '🌱', 0x10b981, () => {
      soundFx.playPickup();
      realmStateRef.current.patent.sensorCollected = true;
      showToast('✓ Capacitive Soil Probe collected!');
      checkPatentParts();
    });

    createRealisticPickup(scene, -14, 0.4, -2, 'Microcontroller Logic Unit', '🧠', 0x0284c7, () => {
      soundFx.playPickup();
      realmStateRef.current.patent.mcuCollected = true;
      showToast('✓ Microcontroller Logic Board collected!');
      checkPatentParts();
    });

    createRealisticPickup(scene, -10, 0.4, 4, 'Solenoid Water Valve', '🚰', 0xf59e0b, () => {
      soundFx.playPickup();
      realmStateRef.current.patent.valveCollected = true;
      showToast('✓ Brass Solenoid Valve collected!');
      checkPatentParts();
    });

    // 3D Assembly Workbench Table
    const benchGroup = new THREE.Group();
    const benchTable = new THREE.Mesh(
      new THREE.BoxGeometry(4.5, 0.9, 3.2), 
      new THREE.MeshStandardMaterial({ map: createWoodPlankCanvas(), roughness: 0.6 })
    );
    benchTable.position.y = 0.45;
    benchTable.castShadow = true;
    benchGroup.add(benchTable);

    const screenMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 0.05, 1.2), 
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.9 })
    );
    screenMesh.position.set(0, 0.92, 0);
    benchGroup.add(screenMesh);

    benchGroup.position.set(-6, 0, 8);
    scene.add(benchGroup);

    addInteractable({
      id: 'patent_bench',
      name: 'Invention Workbench',
      prompt: 'Open Interactive Circuit Wiring Workbench',
      mesh: benchGroup,
      position: new THREE.Vector3(-6, 0.5, 8),
      radius: 3.5,
      concept: 'patent',
      action: () => {
        const p = realmStateRef.current.patent;
        if (!p.sensorCollected || !p.mcuCollected || !p.valveCollected) {
          soundFx.playInvestigate();
          const missingParts = [
            !p.sensorCollected && 'Soil Moisture Probe (-8, -6)',
            !p.mcuCollected && 'Computer Chip (-14, -2)',
            !p.valveCollected && 'Auto Water Tap (-10, 4)'
          ].filter(Boolean);
          setDialogueModal({
            speaker: 'Invention Workbench',
            avatar: '⚙️',
            title: 'Collect the Parts First',
            text: `Find these glowing parts near the barn: ${missingParts.join(', ')}. Walk close and press E or Interact to collect each one, then return to build your machine.`
          });
          return;
        }

        // Open Hands-On Interactive Wiring Board
        soundFx.playClick();
        setCircuitModal(true);
      }
    });

    // Live Soil Testing Interactive Bed
    addInteractable({
      id: 'soil_testing_bed',
      name: 'Interactive Soil Bed',
      prompt: 'Open Real-Time Soil Telemetry Simulator',
      mesh: sprinklerGroup,
      position: new THREE.Vector3(8, 0, 6),
      radius: 4.2,
      concept: 'patent',
      action: () => {
        const p = realmStateRef.current.patent;
        if (!p.assembled) {
          showToast('Assemble and wire the proto the workbench (-6, 8) first!');
          return;
        }

        soundFx.playClick();
        setTestingBedModal(true);
      }
    });

    // NPC: Patent Examiner Dr. Elena Vance
    createRealisticNPC(scene, 14, 0, -8, 'Dr. Elena Vance', '👩‍⚖️', 0x9333ea, () => {
      soundFx.playClick();
      const p = realmStateRef.current.patent;
      if (!p.assembled || !p.testedWetDry) {
        setDialogueModal({
          speaker: 'Dr. Elena Vance',
          avatar: '👩‍⚖️',
          title: 'Enablement & Practical Utility Required',
          text: 'Under patent statutes, an idea alone without an enabled practical working embodiment cannot be patented You must assemble and test the physical machine before filing claims.'
        });
        return;
      }

      // Open Interactive Patent Claims Drafter
      setPatentClaimsModal(true);
    });

    // In-World Easy Points Station
    createEasyPointsPedestal(scene, -2, 0, 8, 'patent');

    // Weatherproof learning board that explains the working invention at a glance.
    const patentBoard = new THREE.Group();
    const boardPostMaterial = new THREE.MeshStandardMaterial({ color: 0x713f12, roughness: 0.7 });
    for (const postX of [-2.1, 2.1]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.16, 3.1, 12), boardPostMaterial);
      post.position.set(postX, 1.55, 0);
      post.castShadow = true;
      patentBoard.add(post);
    }
    const boardFrame = new THREE.Mesh(
      new THREE.BoxGeometry(5.3, 2.5, 0.24),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.35, metalness: 0.55 })
    );
    boardFrame.position.y = 2.55;
    boardFrame.castShadow = true;
    patentBoard.add(boardFrame);
    const boardFace = new THREE.Mesh(
      new THREE.PlaneGeometry(5.05, 2.25),
      new THREE.MeshBasicMaterial({
        map: createLearningDisplayTexture({
          title: 'Smart Irrigation',
          subtitle: 'A sensor helps water crops only when needed',
          icon: '💡',
          accent: '#d97706',
          scene: 'invention'
        })
      })
    );
    boardFace.position.set(0, 2.55, 0.13);
    patentBoard.add(boardFace);
    patentBoard.position.set(-1, 0, -10);
    scene.add(patentBoard);
  };

  const checkPatentParts = () => {
    const p = realmStateRef.current.patent;
    const count = [p.sensorCollected, p.mcuCollected, p.valveCollected].filter(Boolean).length;
    if (count === 3) {
      setQuestObjective('You found all three parts! Go to the workbench at (-6, 8) and connect the sensor, computer, and valve.');
      setQuestProgress({ current: 2, total: 5 });
    }
  };

  // ==========================================
  // REALM 2: CREATOR STUDIO — COPYRIGHT PROTECTION
  // ==========================================
  const buildRealisticCopyrightStudio = (scene) => {
    scene.background = new THREE.Color(0x1e3a5f);
    scene.fog = new THREE.FogExp2(0x1e3a5f, 0.012);

    setQuestTitle('Creator Studio: Protect Creative Work');
    setQuestObjective('Meet Artist Luna, fix your original character on the digital canvas, inspect the festival billboard with the loupe scanner, and inaugurate the gallery!');
    setQuestProgress({ current: 0, total: 5 });

    const amb = new THREE.AmbientLight(0xe0e7ff, 1.05);
    scene.add(amb);
    scene.add(new THREE.HemisphereLight(0xf8fafc, 0x475569, 0.8));
    const spot = new THREE.SpotLight(0xa855f7, 2.5, 45, Math.PI / 4, 0.4);
    spot.position.set(0, 16, 0);
    spot.castShadow = true;
    scene.add(spot);

    // Hardwood Parquet Studio Floor
    const floorGeo = new THREE.PlaneGeometry(65, 65);
    const floorMat = new THREE.MeshStandardMaterial({ 
      map: createWoodPlankCanvas(), 
      roughness: 0.35, 
      metalness: 0.25 
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Neon Architectural Beams
    for (let z = -20; z <= 20; z += 10) {
      const beamGeo = new THREE.BoxGeometry(24, 0.25, 0.25);
      const beamMat = new THREE.MeshStandardMaterial({ color: 0x818cf8, emissive: 0x6366f1, emissiveIntensity: 1.2 });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(0, 7.5, z);
      scene.add(beam);
    }

    // Framed Artworks on Exhibition Walls
    const artPositions = [
      { x: -10, z: -18, c: '#db2777', title: 'Original Art', subtitle: 'Creative work belongs to its creator', icon: '🎨', scene: 'art' },
      { x: 10, z: -18, c: '#0891b2', title: 'Music & Sound', subtitle: 'Original songs and recordings', icon: '🎵', scene: 'icon' },
      { x: -16, z: 0, c: '#059669', title: 'New Inventions', subtitle: 'Useful machines solve real problems', icon: '⚙️', scene: 'invention' },
      { x: 16, z: 0, c: '#d97706', title: 'Creator Rights', subtitle: 'Ask permission before copying', icon: '©', scene: 'icon' }
    ];
    artPositions.forEach((ap) => {
      const artwork = new THREE.Group();
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(4.2, 3.2, 0.28),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.45, metalness: 0.18 })
      );
      frame.position.y = 3.2;
      frame.castShadow = true;
      artwork.add(frame);
      const canvas = new THREE.Mesh(
        new THREE.PlaneGeometry(3.8, 2.8),
        new THREE.MeshBasicMaterial({
          map: createLearningDisplayTexture({
            title: ap.title,
            subtitle: ap.subtitle,
            icon: ap.icon,
            accent: ap.c,
            scene: ap.scene
          })
        })
      );
      canvas.position.set(0, 3.2, 0.151);
      artwork.add(canvas);
      artwork.position.set(ap.x, 0, ap.z);
      scene.add(artwork);

      const frameSpot = new THREE.SpotLight(ap.c, 1.2, 12, Math.PI / 6);
      frameSpot.position.set(ap.x, 6, ap.z + 1.5);
      frameSpot.target = artwork;
      scene.add(frameSpot);
    });

    // DJ Synthesizer & Audio Desk
    const synthDesk = new THREE.Mesh(
      new THREE.BoxGeometry(4.2, 1.1, 1.8),
      new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.7, roughness: 0.3 })
    );
    synthDesk.position.set(-12, 0.55, 10);
    scene.add(synthDesk);

    // Glowing Equalizer LEDs
    for (let eq = -1.6; eq <= 1.6; eq += 0.4) {
      const eqBar = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.6, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 0.9 })
      );
      eqBar.position.set(-12 + eq, 1.3, 10);
      scene.add(eqBar);
    }

    // NPC: Artist Luna with Beret & Palette
    createRealisticNPC(scene, 0, 0, -4, 'Artist Luna', '👩‍🎨', 0xdb2777, () => {
      soundFx.playClick();
      setDialogueModal({
        speaker: 'Artist Luna',
        avatar: '👩‍🎨',
        title: 'Unauthorized Festival Reproduction',
        text: 'Hello Inventor I spent months illustrating my character "Solar Lynx", but CyberPulse Club copied my exact linework onto $50,000 festival posters without license or payment How does copyright work here?',
        choices: [
          {
            label: 'Option A: Did you register it at the patent office first?',
            response: 'Patents protect technical inventions, not artistic expressions Creative works are protected under Copyright.'
          },
          {
            label: 'Option B: Copyright is automatically created as soon as it is fixed in a tangible medium!',
            response: 'Spot on Under the Berne Convention, copyright protection is immediate upon fixation. Step to the Digital Easel at (0, -14) to finalize fixation and mint your timestamped certificate!',
            onPick: () => {
              realmStateRef.current.copyright.lunaSpoke = true;
              setQuestObjective('Step to the Holographic Easel at (0, -14) to fix the artwork into a tangible medium.');
              setQuestProgress({ current: 1, total: 5 });
            }
          }
        ]
      });
    });

    // Holographic Tangible Easel
    const easelGroup = new THREE.Group();
    const easelFrame = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 3.6, 0.35),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.32, metalness: 0.65 })
    );
    easelFrame.position.y = 2.8;
    easelGroup.add(easelFrame);
    const easelCanvas = new THREE.Mesh(
      new THREE.PlaneGeometry(4.8, 3.2),
      new THREE.MeshBasicMaterial({
        map: createLearningDisplayTexture({
          title: 'Creator Canvas',
          subtitle: 'Save original artwork to establish its creation',
          icon: '🎨',
          accent: '#0284c7',
          scene: 'art'
        })
      })
    );
    easelCanvas.position.set(0, 2.8, 0.19);
    easelGroup.add(easelCanvas);
    easelGroup.position.set(0, 0, -14);
    scene.add(easelGroup);

    addInteractable({
      id: 'holographic_easel',
      name: 'Digital Creator Easel',
      prompt: 'Open Interactive Creative Canvas & Mint Fixation',
      mesh: easelGroup,
      position: new THREE.Vector3(0, 0, -14),
      radius: 3.8,
      concept: 'copyright',
      action: () => {
        soundFx.playClick();
        setCopyrightCanvasModal(true);
      }
    });

    // Commercial Festival Billboard
    const boardGroup = new THREE.Group();
    const board = new THREE.Mesh(
      new THREE.BoxGeometry(6.8, 4.6, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.38, metalness: 0.5 })
    );
    board.position.y = 2.8;
    boardGroup.add(board);
    const poster = new THREE.Mesh(
      new THREE.PlaneGeometry(6.35, 4.15),
      new THREE.MeshBasicMaterial({
        map: createLearningDisplayTexture({
          title: 'Summer Arts Festival',
          subtitle: 'A community celebration of music, art, and ideas',
          icon: '🎉',
          accent: '#db2777',
          scene: 'billboard'
        })
      })
    );
    poster.position.set(0, 2.8, 0.27);
    boardGroup.add(poster);
    boardGroup.position.set(12, 0, 6);
    scene.add(boardGroup);

    addInteractable({
      id: 'festival_billboard',
      name: 'Festival Billboard',
      prompt: 'Open Optical Loupe Infringement Scanner',
      mesh: boardGroup,
      position: new THREE.Vector3(12, 0, 6),
      radius: 3.8,
      concept: 'copyright',
      action: () => {
        soundFx.playClick();
        setInfringementLoupeModal(true);
      }
    });

    // NPC: Promoter Marcus
    createRealisticNPC(scene, 16, 0, 6, 'Promoter Marcus', '👔', 0xd97706, () => {
      soundFx.playClick();
      setDialogueModal({
        speaker: 'Promoter Marcus',
        avatar: '👔',
        title: 'Cease-and-Desist Settlement',
        text: 'Wait You have timestamped cryptographic fixation proof and verified vector overlap? Under copyright law, commercial reproduction without a license carries heavy statutory damages. We pull down all posters immediately and sign an official Commercial Licensing Agreement with $15,000 upfront + 10% royalties for Luna!',
        actionLabel: 'Sign Licensing & Curate Gallery',
        onAction: () => {
          soundFx.playSuccess();
          realmStateRef.current.copyright.promoterConfronted = true;
          setQuestObjective('Walk to the Gallery Master Switch at (0, 10) to light up the exhibition.');
          setQuestProgress({ current: 4, total: 5 });
          setDialogueModal(null);
        }
      });
    });

    // Master Gallery Switch Station
    const switchStation = new THREE.Mesh(
      new THREE.CylinderGeometry(0.8, 0.9, 1.4, 16),
      new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.6 })
    );
    switchStation.position.set(0, 0.7, 10);
    scene.add(switchStation);

    addInteractable({
      id: 'gallery_switch',
      name: 'Gallery Master Switch',
      prompt: 'Inaugurate Grand Copyright Exhibition',
      mesh: switchStation,
      position: new THREE.Vector3(0, 0, 10),
      radius: 3.5,
      concept: 'copyright',
      action: () => {
        const c = realmStateRef.current.copyright;
        if (!c.artworkFixed || !c.promoterConfronted) {
          showToast('Fix artwork and confront the promoter first!');
          return;
        }

        soundFx.playLevelUp();
        confetti({ particleCount: 100, spread: 90 });
        setDialogueModal({
          speaker: 'Curator Helena',
          avatar: '🏛️',
          title: 'Copyright Sovereign Honors Conferred',
          text: 'Congratulations You demonstrated that original creative expression vests automatically upon fixation, defended exclusive reproduction rights against unauthorized commercial exploitation, and negotiated a lawful copyright license!',
          actionLabel: 'Claim Creator Honors',
          onAction: () => {
            setDialogueModal(null);
            setQuestProgress({ current: 5, total: 5 });
            setMissionCompleteCelebration(true);
            onCompleteMission(250, 60, 3, 'copyright');
          }
        });
      }
    });

    // In-World Easy Points Station
    createEasyPointsPedestal(scene, -6, 0, 2, 'copyright');
  };

  // ==========================================
  // REALM 3: BRAND CITY — TRADEMARK DISTINCTIVENESS
  // ==========================================
  const buildRealisticTrademarkCity = (scene) => {
    scene.background = new THREE.Color(0x1e3a5f);
    scene.fog = new THREE.FogExp2(0x1e3a5f, 0.012);

    setQuestTitle('Brand City: Build a Distinctive Brand');
    setQuestObjective('Walk Market Street, talk to customer Sarah, formulate an inherently distinctive mark on the Abercrombie spectrum, and deploy the neon storefront!');
    setQuestProgress({ current: 0, total: 5 });

    const amb = new THREE.AmbientLight(0xf1f5f9, 1.05);
    scene.add(amb);
    scene.add(new THREE.HemisphereLight(0xf8fafc, 0x475569, 0.75));
    const streetLight = new THREE.DirectionalLight(0xfef08a, 1.3);
    streetLight.position.set(15, 30, 15);
    streetLight.castShadow = true;
    scene.add(streetLight);

    // Street & Sidewalks
    const streetGeo = new THREE.PlaneGeometry(65, 65);
    const streetMat = new THREE.MeshStandardMaterial({ 
      map: createCobblestoneCanvas(), 
      roughness: 0.8 
    });
    const street = new THREE.Mesh(streetGeo, streetMat);
    street.rotation.x = -Math.PI / 2;
    street.receiveShadow = true;
    scene.add(street);

    // Center Yellow Dashes
    for (let z = -28; z <= 28; z += 4) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 2), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
      dash.rotation.x = -Math.PI / 2;
      dash.position.set(0, 0.02, z);
      scene.add(dash);
    }

    // Street Lamps
    for (const lx of [-6, 6]) {
      for (const lz of [-16, 0, 16]) {
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.14, 5, 10),
          new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 })
        );
        post.position.set(lx, 2.5, lz);
        scene.add(post);

        const bulb = new THREE.PointLight(0xfef08a, 1.2, 10);
        bulb.position.set(lx, 5.1, lz);
        scene.add(bulb);
      }
    }

    // Priya's Storefront
    const priyaShop = new THREE.Mesh(
      new THREE.BoxGeometry(8, 6, 6), 
      new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.4 })
    );
    priyaShop.position.set(-10, 3, -12);
    priyaShop.castShadow = true;
    scene.add(priyaShop);
    priyaStorefrontRef.current = priyaShop;

    const awning = new THREE.Mesh(
      new THREE.BoxGeometry(8.2, 0.4, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x047857 })
    );
    awning.position.set(-10, 3.8, -8.9);
    scene.add(awning);
    priyaNeonSignRef.current = awning;

    // Copycat Storefront
    const copycatShop = new THREE.Mesh(
      new THREE.BoxGeometry(8, 6, 6), 
      new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.4 })
    );
    copycatShop.position.set(10, 3, -12);
    copycatShop.castShadow = true;
    scene.add(copycatShop);

    // Moving Pedestrians
    const npcsData = [
      {
        color: 0x0284c7,
        waypoints: [new THREE.Vector3(-4, 0, -15), new THREE.Vector3(-4, 0, 15), new THREE.Vector3(-4, 0, -15)],
        speed: 0.04
      },
      {
        color: 0xf59e0b,
        waypoints: [new THREE.Vector3(4, 0, 15), new THREE.Vector3(4, 0, -15), new THREE.Vector3(4, 0, 15)],
        speed: 0.035
      }
    ];

    npcsData.forEach(nd => {
      const npcGrp = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.28, 0.9, 12),
        new THREE.MeshStandardMaterial({ color: nd.color })
      );
      body.position.y = 0.9;
      npcGrp.add(body);
      const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.24, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0xfbd2a4 })
      );
      head.position.y = 1.5;
      npcGrp.add(head);

      const lLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.5, 8), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
      lLeg.position.set(-0.15, 0.25, 0);
      npcGrp.add(lLeg);
      const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.5, 8), new THREE.MeshStandardMaterial({ color: 0x1e293b }));
      rLeg.position.set(0.15, 0.25, 0);
      npcGrp.add(rLeg);

      npcGrp.position.copy(nd.waypoints[0]);
      scene.add(npcGrp);

      movingNPCsRef.current.push({
        group: npcGrp,
        waypoints: nd.waypoints,
        currentWaypointIdx: 1,
        speed: nd.speed,
        legs: [lLeg, rLeg],
        walkCycle: 0
      });
    });

    // NPC: Customer Sarah
    createRealisticNPC(scene, -3, 0, -4, 'Customer Sarah', '👩‍💼', 0x0284c7, () => {
      soundFx.playClick();
      setDialogueModal({
        speaker: 'Customer Sarah',
        avatar: '👩‍💼',
        title: 'Consumer Origin Confusion',
        text: 'I wanted Priya\'s fresh craft juice, but I walked under the generic green sign into the copycat shop by mistake The juice was sour. Customers cannot distinguish these identical names What can Priya do?',
        choices: [
          {
            label: 'Option A: Call it "Juice" with a copyright logo.',
            response: 'Copyright does not protect short names or brand identifiers And "Juice" is generic—anyone is allowed to use it.'
          },
          {
            label: 'Option B: Design an inherently distinctive trademark on the Abercrombie spectrum!',
            response: 'Brilliant A trademark identifies the commercial source of goods. Head to the Brand Spectrum Lab at (0, 10) to choose a coined, distinctive mark!',
            onPick: () => {
              realmStateRef.current.trademark.sarahSpoke = true;
              setQuestObjective('Head to the Abercrombie Brand Spectrum Lab at (0, 10) to choose a distinctive coined mark.');
              setQuestProgress({ current: 1, total: 5 });
            }
          }
        ]
      });
    });

    // Abercrombie Brand Spectrum Lab Kiosk
    const labMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 1.6, 1.6, 16), 
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.4 })
    );
    labMesh.position.set(0, 0.8, 10);
    labMesh.castShadow = true;
    scene.add(labMesh);

    addInteractable({
      id: 'brand_lab',
      name: 'Brand Spectrum Lab',
      prompt: 'Open Abercrombie Brand Spectrum Analyzer',
      mesh: labMesh,
      position: new THREE.Vector3(0, 0, 10),
      radius: 3.5,
      concept: 'trademark',
      action: () => {
        soundFx.playClick();
        setBrandSpectrumModal(true);
      }
    });

    // Grand Brand City Gateway Neon Arch
    const archGrp = new THREE.Group();
    const archP1 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 9, 0.9), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 }));
    archP1.position.set(-8.5, 4.5, 20);
    archGrp.add(archP1);
    const archP2 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 9, 0.9), new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 }));
    archP2.position.set(8.5, 4.5, 20);
    archGrp.add(archP2);
    const archBeam = new THREE.Mesh(new THREE.BoxGeometry(18, 1.4, 1.2), new THREE.MeshStandardMaterial({ color: 0x059669, emissive: 0x10b981, emissiveIntensity: 0.9 }));
    archBeam.position.set(0, 8.6, 20);
    archGrp.add(archBeam);
    const archLight = new THREE.PointLight(0x34d399, 1.5, 14);
    archLight.position.set(0, 7.5, 20);
    archGrp.add(archLight);
    scene.add(archGrp);

    // Commercial High-Rise Skyline Buildings Flanking Avenue
    const towerData = [
      { x: -18, z: -6, h: 22, w: 9, d: 8, color: 0x0f172a },
      { x: 18, z: -6, h: 26, w: 9, d: 8, color: 0x1e1b4b },
      { x: -18, z: 8, h: 18, w: 9, d: 8, color: 0x064e3b },
      { x: 18, z: 8, h: 20, w: 9, d: 8, color: 0x1e293b }
    ];
    towerData.forEach(td => {
      const tower = new THREE.Mesh(
        new THREE.BoxGeometry(td.w, td.h, td.d),
        new THREE.MeshStandardMaterial({ color: td.color, roughness: 0.2, metalness: 0.7 })
      );
      tower.position.set(td.x, td.h / 2, td.z);
      tower.castShadow = true;
      scene.add(tower);

      // Lit Windows on Tower Face
      for (let wy = 2; wy < td.h - 2; wy += 3.5) {
        for (let wz = td.z - 2.5; wz <= td.z + 2.5; wz += 2.5) {
          const win = new THREE.Mesh(
            new THREE.PlaneGeometry(1.2, 1.6),
            new THREE.MeshBasicMaterial({ color: wy % 2 === 0 ? 0xfef08a : 0x38bdf8 })
          );
          win.position.set(td.x > 0 ? td.x - td.w / 2 - 0.05 : td.x + td.w / 2 + 0.05, wy, wz);
          win.rotation.y = td.x > 0 ? -Math.PI / 2 : Math.PI / 2;
          scene.add(win);
        }
      }
    });

    // Interactive Trademark Clearance Registry & Counterfeit Scanner Kiosk
    const registryKiosk = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.4, 2.0, 16),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.6 })
    );
    registryKiosk.position.set(6, 1.0, 4);
    registryKiosk.castShadow = true;
    scene.add(registryKiosk);

    const kioskBeacon = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 12, 12),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 1.5 })
    );
    kioskBeacon.position.set(6, 2.3, 4);
    scene.add(kioskBeacon);

    addInteractable({
      id: 'trademark_registry_kiosk',
      name: 'Trademark Clearance Registry & Counterfeit Scanner',
      prompt: 'Scan Trademark Database & Check Confusing Similarity',
      mesh: registryKiosk,
      position: new THREE.Vector3(6, 0, 4),
      radius: 3.5,
      concept: 'trademark',
      action: () => {
        soundFx.playSuccess();
        confetti({ particleCount: 30, spread: 50 });
        showToast('🔍 Trademark Database: CitroVibe™ cleared 0% phonetical or visual conflict.');
      }
    });

    // NPC: Merchant Leo (Market Dispute Encounter)
    createRealisticNPC(scene, -4, 0, 8, 'Merchant Leo', '🏪', 0xef4444, () => {
      soundFx.playClick();
      setDialogueModal({
        speaker: 'Merchant Leo',
        avatar: '🏪',
        title: 'Trademark Infringement Dispute',
        text: 'I wanted to sell juice using Priya\'s exact green sign Can I do that if I just call my store "Good Juice"?',
        choices: [
          {
            label: 'No, generic terms like "Juice" can\'t be monopolized, but copycat logos cause likelihood of confusion!',
            response: 'Spot on Trademark law strictly protects against consumer deception. Copycat logos and trade dress cause likelihood of confusion!'
          }
        ]
      });
    });

    // Storefront Renovation Spot
    addInteractable({
      id: 'storefront_renovation',
      name: 'Storefront Renovation Site',
      prompt: 'Mount CitroVibe™ Neon Storefront',
      mesh: priyaShop,
      position: new THREE.Vector3(-10, 0, -8),
      radius: 4.5,
      concept: 'trademark',
      action: () => {
        const t = realmStateRef.current.trademark;
        if (!t.brandDesigned) {
          showToast('Formulate the brand at the Spectrum Lab (0, 10) first!');
          return;
        }

        soundFx.playSuccess();
        t.storefrontRenovated = true;
        t.confusionEliminated = true;
        setConfusionPercent(0);

        if (priyaStorefrontRef.current) {
          priyaStorefrontRef.current.material = new THREE.MeshStandardMaterial({ 
            color: 0xf97316, 
            emissive: 0xea580c, 
            emissiveIntensity: 0.5, 
            roughness: 0.3 
          });
        }
        if (priyaNeonSignRef.current) {
          priyaNeonSignRef.current.material = new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: 0x0284c7,
            emissiveIntensity: 1.2
          });
        }

        // Add 3D Golden Registered Mark Floating Above Store
        const circleRGroup = new THREE.Group();
        const rim = new THREE.Mesh(
          new THREE.TorusGeometry(1.2, 0.12, 12, 24),
          new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xeab308, emissiveIntensity: 1.0 })
        );
        circleRGroup.add(rim);
        circleRGroup.position.set(-10, 7.5, -9);
        scene.add(circleRGroup);

        showToast('⚡ Storefront physically updated to CitroVibe™ with Registered ® Status!');
        setQuestObjective('Brand deployed Talk to Advocate Meera at (12, 8) to secure trademark registration.');
        setQuestProgress({ current: 3, total: 5 });
      }
    });

    // NPC: Advocate Meera
    createRealisticNPC(scene, 12, 0, 8, 'Advocate Meera', '👩‍⚖️', 0x10b981, () => {
      soundFx.playClick();
      const t = realmStateRef.current.trademark;
      if (!t.storefrontRenovated) {
        setDialogueModal({
          speaker: 'Advocate Meera',
          avatar: '👩‍⚖️',
          title: 'Commercial Distinctiveness in Use',
          text: 'To register a trademark, your mark must be used in commerce and distinguish your goods from competitors without likelihood of confusion. Mount the distinctive storefront at (-10, -8) first!'
        });
        return;
      }

      setDialogueModal({
        speaker: 'Advocate Meera',
        avatar: '👩‍⚖️',
        title: 'Federal Trademark Registration Granted (®)',
        text: 'Consumer confusion has dropped to 0% Consumers unambiguously identify CitroVibe™ as Priya\'s craft juice. We transition your symbol from ™ (intent-to-use / common law) to the registered circle-R (®), granting nationwide priority and 10-year perpetual renewals!',
        actionLabel: 'Claim Brand Guardian Honors',
        onAction: () => {
          soundFx.playLevelUp();
          confetti({ particleCount: 100, spread: 90 });
          setDialogueModal(null);
          setQuestProgress({ current: 5, total: 5 });
          setMissionCompleteCelebration(true);
          onCompleteMission(250, 60, 3, 'trademark');
        }
      });
    });

    // In-World Easy Points Station
    createEasyPointsPedestal(scene, 0, 0, -2, 'trademark');
  };

  // ==========================================
  // REALM 4: THE SECRET VAULT — TRADE SECRET SECURITY
  // ==========================================
  const buildRealisticSecretVault = (scene) => {
    scene.background = new THREE.Color(0x1e3a5f);
    scene.fog = new THREE.FogExp2(0x1e3a5f, 0.012);

    setQuestTitle('The Secret Vault: Protect Confidential Information');
    setQuestObjective('Audit facility vulnerabilities, lock chemical formula cabinets, configure RBAC permissions, and repel a cyber espionage breach!');
    setQuestProgress({ current: 0, total: 5 });

    const amb = new THREE.AmbientLight(0xcbd5e1, 1.05);
    scene.add(amb);
    scene.add(new THREE.HemisphereLight(0xf8fafc, 0x475569, 0.9));
    const fillLight = new THREE.DirectionalLight(0xbfdbfe, 1.1);
    fillLight.position.set(12, 22, 10);
    scene.add(fillLight);

    const alarmLight = new THREE.PointLight(0xef4444, 1.5, 40);
    alarmLight.position.set(0, 7, 0);
    scene.add(alarmLight);
    alarmLightRef.current = alarmLight;

    // Sci-Fi Metallic Floor Plates
    const floorGeo = new THREE.PlaneGeometry(65, 65);
    const floorMat = new THREE.MeshStandardMaterial({ 
      map: createSciFiMetalFloorCanvas(), 
      roughness: 0.3, 
      metalness: 0.7 
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Server Racks
    for (let rx = -14; rx <= 14; rx += 7) {
      const rack = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 5, 3.5), 
        new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.4, metalness: 0.8 })
      );
      rack.position.set(rx, 2.5, -12);
      rack.castShadow = true;
      scene.add(rack);

      for (let ledY = 1.0; ledY <= 4.0; ledY += 0.8) {
        const led = new THREE.Mesh(
          new THREE.SphereGeometry(0.06, 8, 8),
          new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x10b981, emissiveIntensity: 1.5 })
        );
        led.position.set(rx + 0.95, ledY, -11.8);
        scene.add(led);
      }
    }

    // Moving Red Security Lasers Tripwires
    const laser1Geo = new THREE.CylinderGeometry(0.04, 0.04, 5, 8);
    const laserMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 2.0 });
    const laser1Mesh = new THREE.Mesh(laser1Geo, laserMat);
    laser1Mesh.rotation.z = Math.PI / 2;
    laser1Mesh.position.set(-4, 1.2, -4);
    scene.add(laser1Mesh);

    const laser1Light = new THREE.PointLight(0xef4444, 1.2, 6);
    laser1Light.position.set(-4, 1.2, -4);
    scene.add(laser1Light);

    laserBeamsRef.current.push({
      mesh: laser1Mesh,
      light: laser1Light,
      minX: -8,
      maxX: 8,
      speed: 0.05,
      direction: 1,
      zPos: -4
    });

    // Secondary Criss-Crossing Security Laser Beam
    const laser2Geo = new THREE.CylinderGeometry(0.04, 0.04, 5, 8);
    const laser2Mesh = new THREE.Mesh(laser2Geo, laserMat);
    laser2Mesh.rotation.z = Math.PI / 2;
    laser2Mesh.position.set(4, 1.2, 4);
    scene.add(laser2Mesh);
    const laser2Light = new THREE.PointLight(0xef4444, 1.2, 6);
    laser2Light.position.set(4, 1.2, 4);
    scene.add(laser2Light);

    laserBeamsRef.current.push({
      mesh: laser2Mesh,
      light: laser2Light,
      minX: -8,
      maxX: 8,
      speed: 0.04,
      direction: -1,
      zPos: 4
    });

    // Massive Reinforced Blast Vault Door at Back Wall
    const vaultDoorGroup = new THREE.Group();
    const doorRim = new THREE.Mesh(
      new THREE.TorusGeometry(3.6, 0.45, 16, 32),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 })
    );
    vaultDoorGroup.add(doorRim);
    const doorCore = new THREE.Mesh(
      new THREE.CylinderGeometry(3.4, 3.4, 0.6, 32),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.95, roughness: 0.3 })
    );
    doorCore.rotation.x = Math.PI / 2;
    vaultDoorGroup.add(doorCore);
    const wheelHandle = new THREE.Mesh(
      new THREE.TorusGeometry(1.2, 0.15, 12, 24),
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 })
    );
    wheelHandle.position.z = 0.4;
    vaultDoorGroup.add(wheelHandle);
    vaultDoorGroup.position.set(0, 3.8, -17);
    scene.add(vaultDoorGroup);

    // Interactive Biometric Iris & Handprint Scanner Pedestal
    const biometricScanner = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.8, 1.8, 16),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, emissive: 0x0369a1, emissiveIntensity: 0.8 })
    );
    biometricScanner.position.set(-4, 0.9, 6);
    scene.add(biometricScanner);

    addInteractable({
      id: 'biometric_scanner',
      name: 'Biometric Iris & Handprint Scanner',
      prompt: 'Authenticate Authorized Personnel Clearance',
      mesh: biometricScanner,
      position: new THREE.Vector3(-4, 0, 6),
      radius: 3.2,
      concept: 'trade_secret',
      action: () => {
        soundFx.playSuccess();
        confetti({ particleCount: 35, spread: 60 });
        showToast('✓ Biometric Clearance Confirmed: Security Level 5 Granted!');
      }
    });

    // Interactive NDA & DTSA Trade Secret Classification Station
    const ndaStation = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.8, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x4f46e5, metalness: 0.7 })
    );
    ndaStation.position.set(4, 0.9, 6);
    scene.add(ndaStation);

    addInteractable({
      id: 'nda_station',
      name: 'NDA & DTSA Confidentiality Archive',
      prompt: 'Review Non-Disclosure Agreements & Secrecy Standards',
      mesh: ndaStation,
      position: new THREE.Vector3(4, 0, 6),
      radius: 3.2,
      concept: 'trade_secret',
      action: () => {
        soundFx.playClick();
        setDialogueModal({
          speaker: 'Vault Security Terminal',
          avatar: '🔒',
          title: 'Statutory Trade Secret Checklist (DTSA)',
          text: 'Under the Defend Trade Secrets Act (DTSA), 3 criteria are strictly required: (1) Information is secret (not generally known), (2) Derives economic value from being secret, and (3) Subject to active reasonable precautions (NDAs, 2FA, biometric locks, encryption).',
          choices: [
            {
              label: 'Enforce All Confidentiality Measures',
              response: 'Confirmed All third-party visitors and engineers must execute NDAs before entering the vault.'
            }
          ]
        });
      }
    });

    // Vulnerability 1: Formula Cabinet
    const cab = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 2.6, 1.4), 
      new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 })
    );
    cab.position.set(-8, 1.3, 0);
    cab.castShadow = true;
    scene.add(cab);

    addInteractable({
      id: 'unlocked_cabinet',
      name: 'Confidential Polymer Cabinet',
      prompt: 'Open Interactive Biometric Keypad',
      mesh: cab,
      position: new THREE.Vector3(-8, 0, 0),
      radius: 3.2,
      concept: 'trade_secret',
      action: () => {
        soundFx.playClick();
        setVaultKeypadModal(true);
      }
    });

    // Vulnerability 2: Unattended Synthesis Workstation
    const term = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 1.6, 1.8), 
      new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 })
    );
    term.position.set(8, 0.8, 0);
    term.castShadow = true;
    scene.add(term);

    addInteractable({
      id: 'open_terminal',
      name: 'Unattended Polymer Terminal',
      prompt: 'Enforce 2FA Auto-Lockout Policy',
      mesh: term,
      position: new THREE.Vector3(8, 0, 0),
      radius: 3.2,
      concept: 'trade_secret',
      action: () => {
        soundFx.playSuccess();
        realmStateRef.current.trade_secret.terminalSecured = true;
        term.material = new THREE.MeshStandardMaterial({ color: 0x10b981 });
        showToast('✓ 2FA Screen timeout and encryption enforced!');
        checkVaultVulnerabilities();
      }
    });

    // Master Firewall Air-Gap Console
    const consoleMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.8, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8 })
    );
    consoleMesh.position.set(0, 0.9, -14);
    scene.add(consoleMesh);

    addInteractable({
      id: 'firewall_console',
      name: 'Master Air-Gap Console',
      prompt: 'Open Air-Gap Emergency Killswitch Console',
      mesh: consoleMesh,
      position: new THREE.Vector3(0, 0, -14),
      radius: 3.5,
      concept: 'trade_secret',
      action: () => {
        soundFx.playClick();
        setFirewallLockdownModal(true);
      }
    });

    // NPC: Chief IP Counsel Rajiv
    createRealisticNPC(scene, 0, 0, 10, 'Counsel Rajiv', '👨‍💼', 0x0284c7, () => {
      soundFx.playClick();
      const ts = realmStateRef.current.trade_secret;
      if (!ts.cabinetLocked || !ts.terminalSecured || !ts.intrusionRepelled) {
        setDialogueModal({
          speaker: 'Counsel Rajiv',
          avatar: '👨‍💼',
          title: 'Reasonable Efforts Required by Law',
          text: 'Under the Defend Trade Secrets Act (DTSA) and UTSA, trade secret protection is LEGALLY FORFEITED if the owner fails to maintain active reasonable precautions You must enter the PIN to lock the cabinet (-8, 0), secure the terminal (8, 0), and isolate the firewall console (0, -14).'
        });
        return;
      }

      setDialogueModal({
        speaker: 'Counsel Rajiv',
        avatar: '👨‍💼',
        title: 'Master Vault Certified Impenetrable',
        text: 'All 3 legal prongs established: (1) Secret information not generally known, (2) Independent economic value derived from secrecy, and (3) Active reasonable security precautions enforced. In case of commercial espionage, we have immediate federal standing for emergency injunctions and trade secret damages!',
        actionLabel: 'Certify Master Vault Protocol',
        onAction: () => {
          soundFx.playLevelUp();
          confetti({ particleCount: 100, spread: 90 });
          setDialogueModal(null);
          setQuestProgress({ current: 5, total: 5 });
          setMissionCompleteCelebration(true);
          onCompleteMission(250, 60, 3, 'trade_secret');
        }
      });
    });

    // In-World Easy Points Station
    createEasyPointsPedestal(scene, -2, 0, 4, 'trade_secret');
  };

  const checkVaultVulnerabilities = () => {
    const ts = realmStateRef.current.trade_secret;
    const count = [ts.cabinetLocked, ts.terminalSecured].filter(Boolean).length;
    if (count === 2) {
      setQuestObjective('Physical perimeter secure Rushing alarm detected: activate the Air-Gap Console at (0, -14).');
      setQuestProgress({ current: 3, total: 5 });
    }
  };

  // ==========================================
  // REALM 5: ORIGINALITY ACADEMY — PLAGIARISM INVESTIGATION
  // ==========================================
  const buildRealisticAcademyQuad = (scene) => {
    scene.background = new THREE.Color(0x0c4a6e);
    scene.fog = new THREE.FogExp2(0x0c4a6e, 0.015);

    setQuestTitle('Originality Academy: The Plagiarism Investigation');
    setQuestObjective('Talk to Student Jordan, retrieve Dr. Lin\'s journal from library archives, open the synthesis workbench to rewrite text ethically, and fire the Integrity Beacon!');
    setQuestProgress({ current: 0, total: 5 });

    const amb = new THREE.AmbientLight(0xf0fdf4, 0.8);
    scene.add(amb);
    const sun = new THREE.DirectionalLight(0x7dd3fc, 1.3);
    sun.position.set(-15, 30, 15);
    sun.castShadow = true;
    scene.add(sun);

    // Quad Cobblestone
    const quadGeo = new THREE.PlaneGeometry(65, 65);
    const quadMat = new THREE.MeshStandardMaterial({ 
      map: createCobblestoneCanvas(), 
      roughness: 0.7 
    });
    const quad = new THREE.Mesh(quadGeo, quadMat);
    quad.rotation.x = -Math.PI / 2;
    quad.receiveShadow = true;
    scene.add(quad);

    // Marble Columns
    for (let cx = -16; cx <= 16; cx += 8) {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.65, 8, 20), 
        new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 })
      );
      col.position.set(cx, 4, -14);
      col.castShadow = true;
      scene.add(col);
    }

    // Pediment
    const pediment = new THREE.Mesh(
      new THREE.BoxGeometry(36, 1.6, 3.5),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 })
    );
    pediment.position.set(0, 8.5, -14);
    scene.add(pediment);

    // NPC: Student Jordan
    createRealisticNPC(scene, 0, 0, -4, 'Student Jordan', '🧑‍🎓', 0xf59e0b, () => {
      soundFx.playClick();
      setDialogueModal({
        speaker: 'Student Jordan',
        avatar: '🧑‍🎓',
        title: 'Similarity Index Alarm: 78%',
        text: 'My biology paper was flagged at 78% similarity I was rushed and copied whole paragraphs directly from Dr. Lin\'s 2021 journal paper. Is this plagiarism or copyright infringement?',
        choices: [
          {
            label: 'Option A: It is copyright infringement because Dr. Lin loses money.',
            response: 'Not necessarily Plagiarism is an ethical trust violation in scholarship (claiming another’s thoughts as your own), whereas copyright is an economic property infringement.'
          },
          {
            label: 'Option B: It is academic plagiarism We need to synthesize in our own voice and attribute properly.',
            response: 'Exactly right Retrieve Dr. Lin\'s 2021 manuscript from the Library Archives at (-10, -8), then step to the Synthesis Plinth at (10, -6) to ethically revise!',
            onPick: () => {
              realmStateRef.current.plagiarism.jordanSpoke = true;
              setQuestObjective('Retrieve Dr. Lin\'s 2021 Journal Manuscript from the Library Archives at (-10, -8).');
              setQuestProgress({ current: 1, total: 5 });
            }
          }
        ]
      });
    });

    // Primary Source Manuscript Pickup
    createRealisticPickup(scene, -10, 0.4, -8, 'Dr. Lin (2021) Journal', '📑', 0x0284c7, () => {
      soundFx.playPickup();
      realmStateRef.current.plagiarism.sourceFound = true;
      showToast('✓ Primary source retrieved Walk to the Authorial Synthesis Plinth at (10, -6).');
      setQuestObjective('Step to the Authorial Synthesis Plinth at (10, -6) to rewrite the text in Jordan\'s authentic voice.');
      setQuestProgress({ current: 2, total: 5 });
    });

    // Authorial Synthesis & Comparator Plinth
    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(1.4, 1.6, 1.4, 16), 
      new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.3, metalness: 0.3 })
    );
    plinth.position.set(10, 0.7, -6);
    plinth.castShadow = true;
    scene.add(plinth);

    addInteractable({
      id: 'synthesis_plinth',
      name: 'Authorial Synthesis Plinth',
      prompt: 'Open Interactive Text Paraphrase & Citation Workbench',
      mesh: plinth,
      position: new THREE.Vector3(10, 0, -6),
      radius: 3.5,
      concept: 'plagiarism',
      action: () => {
        soundFx.playClick();
        setPlagiarismWorkbenchModal(true);
      }
    });

    // Central Academic Honor Monument Obelisk
    const obeliskGroup = new THREE.Group();
    const obeliskBase = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.9, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 })
    );
    obeliskBase.position.y = 0.45;
    obeliskGroup.add(obeliskBase);
    const obeliskSpire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.8, 4.2, 4),
      new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.25 })
    );
    obeliskSpire.position.y = 2.9;
    obeliskSpire.rotation.y = Math.PI / 4;
    obeliskGroup.add(obeliskSpire);
    obeliskGroup.position.set(0, 0, 0);
    scene.add(obeliskGroup);

    addInteractable({
      id: 'honor_monument',
      name: 'Academic Honor Monument',
      prompt: 'Read Honor Code: Plagiarism vs Copyright Law',
      mesh: obeliskGroup,
      position: new THREE.Vector3(0, 0, 0),
      radius: 3.5,
      concept: 'plagiarism',
      action: () => {
        soundFx.playClick();
        setDialogueModal({
          speaker: 'Honor Code Monument',
          avatar: '🏛️',
          title: 'The Great Distinction: Plagiarism vs Copyright',
          text: 'Plagiarism is an ETHICAL violation of academic honesty (taking credit for another person’s thoughts). Copyright is an ECONOMIC property monopoly. You can plagiarize public-domain works like Shakespeare (no copyright exists, but it\'s 100% plagiarism in school), and you can infringe copyright without plagiarizing (printing art with attribution but no commercial license).',
          choices: [
            {
              label: 'Commit to Highest Scholarly Ethics',
              response: 'Integrity upheld Quote what is verbatim, synthesize in your own voice, and cite your sources!'
            }
          ]
        });
      }
    });

    // Campus Park Study Benches & Lanterns
    for (const bx of [-6, 6]) {
      const bench = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.4, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 })
      );
      bench.position.set(bx, 0.3, 2);
      scene.add(bench);

      const lamp = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.12, 4.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 })
      );
      lamp.position.set(bx, 2.25, 5);
      scene.add(lamp);

      const light = new THREE.PointLight(0xfde047, 1.0, 8);
      light.position.set(bx, 4.6, 5);
      scene.add(light);
    }

    // Academic Integrity Beacon (Concentric Gyroscopic Rings)
    const beaconGroup = new THREE.Group();
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 20, 20), 
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 1.4 })
    );
    beaconGroup.add(core);

    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.08, 12, 32), 
      new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xeab308, emissiveIntensity: 1.0 })
    );
    beaconGroup.add(ring1);
    beaconRingsRef.current.push(ring1);

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(2.1, 0.08, 12, 32),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 1.0 })
    );
    ring2.rotation.x = Math.PI / 3;
    beaconGroup.add(ring2);
    beaconRingsRef.current.push(ring2);

    beaconGroup.position.set(0, 2.8, 10);
    scene.add(beaconGroup);

    addInteractable({
      id: 'academic_beacon',
      name: 'Academic Integrity Beacon',
      prompt: 'Fire Academic Integrity Beacon',
      mesh: beaconGroup,
      position: new THREE.Vector3(0, 0, 10),
      radius: 3.8,
      concept: 'plagiarism',
      action: () => {
        const p = realmStateRef.current.plagiarism;
        if (!p.passagesRewritten) {
          showToast('Synthesize the text at the Plinth (10, -6) first!');
          return;
        }

        soundFx.playLevelUp();
        confetti({ particleCount: 100, spread: 90 });
        setDialogueModal({
          speaker: 'Teacher Ms. Clara',
          avatar: '👩‍🏫',
          title: 'Academic Submission Cleared: 4% Similarity',
          text: 'Masterful scholarly integrity You proved that plagiarism is an ethical violation of academic honesty, resolved through genuine intellectual synthesis and formal attribution. Highest honors awarded!',
          actionLabel: 'Claim Originality Honors',
          onAction: () => {
            setDialogueModal(null);
            setQuestProgress({ current: 5, total: 5 });
            setMissionCompleteCelebration(true);
            onCompleteMission(250, 60, 3, 'plagiarism');
          }
        });
      }
    });

    // In-World Easy Points Station
    createEasyPointsPedestal(scene, 0, 0, 4, 'plagiarism');
  };

  // Dedicated 3D Portals connecting Patent, Plagiarism, Copyright, Trademark, Trade Secret
  const buildTeleportPortals = (scene, activeConcept) => {
    const portalTargets = [
      { id: 'patent', title: 'Patent Lab', subtitle: 'Inventions & Tech', icon: '💡', color: 0xf59e0b },
      { id: 'plagiarism', title: 'Originality Academy', subtitle: 'Academic Honesty', icon: '🎓', color: 0x0284c7 },
      { id: 'copyright', title: 'Copyright Studio', subtitle: 'Art & Music', icon: '🎨', color: 0x9333ea },
      { id: 'trademark', title: 'Trademark City', subtitle: 'Brands & Logos', icon: '🛡️', color: 0x10b981 },
      { id: 'trade_secret', title: 'Trade Secrets Vault', subtitle: 'Confidential Formulas', icon: '🔒', color: 0xe11d48 }
    ];

    const portalGroup = new THREE.Group();
    portalGroup.name = 'teleport_portals_cluster';

    // Position the other 4 destination portals along the southern boundary of the world (z = 22)
    const otherPortals = portalTargets.filter(p => p.id !== activeConcept);

    otherPortals.forEach((target, index) => {
      const spacing = 7.5;
      const startX = -((otherPortals.length - 1) * spacing) / 2;
      const posX = startX + index * spacing;
      const posZ = 22;

      const singlePortal = new THREE.Group();
      singlePortal.position.set(posX, 0, posZ);

      // Glowing Pedestal Base
      const baseGeo = new THREE.CylinderGeometry(1.5, 1.8, 0.35, 20);
      const baseMat = new THREE.MeshStandardMaterial({ 
        color: 0x0f172a, 
        roughness: 0.4, 
        metalness: 0.6 
      });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.175;
      base.receiveShadow = true;
      singlePortal.add(base);

      // Outer Portal Ring
      const ringGeo = new THREE.TorusGeometry(1.35, 0.12, 16, 32);
      const ringMat = new THREE.MeshStandardMaterial({ 
        color: target.color, 
        emissive: target.color, 
        emissiveIntensity: 0.7,
        roughness: 0.2, 
        metalness: 0.8 
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 1.6;
      singlePortal.add(ring);

      // Energetic Portal Disc
      const discGeo = new THREE.CircleGeometry(1.22, 24);
      const discMat = new THREE.MeshBasicMaterial({ 
        color: target.color, 
        transparent: true, 
        opacity: 0.8, 
        side: THREE.DoubleSide 
      });
      const disc = new THREE.Mesh(discGeo, discMat);
      disc.position.y = 1.6;
      singlePortal.add(disc);

      // Light beam
      const beamLight = new THREE.PointLight(target.color, 2.2, 8);
      beamLight.position.set(0, 1.8, 0.4);
      singlePortal.add(beamLight);

      // Floating Banner Plaque above portal
      const plaqueCanvas = document.createElement('canvas');
      plaqueCanvas.width = 256;
      plaqueCanvas.height = 96;
      const ctx = plaqueCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#071526';
        ctx.beginPath();
        ctx.roundRect(4, 4, 248, 88, 16);
        ctx.fill();
        ctx.lineWidth = 6;
        ctx.strokeStyle = `#${target.color.toString(16).padStart(6, '0')}`;
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 26px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${target.icon} ${target.title}`, 128, 42);
        ctx.fillStyle = '#fde047';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText(target.subtitle, 128, 72);
      }
      const plaqueTexture = new THREE.CanvasTexture(plaqueCanvas);
      const plaqueMat = new THREE.MeshBasicMaterial({ map: plaqueTexture, transparent: true });
      const plaque = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.9), plaqueMat);
      plaque.position.set(0, 3.25, 0);
      singlePortal.add(plaque);

      portalGroup.add(singlePortal);

      // Register interactable trigger for cursor click and proximity E key
      interactablesRef.current.push({
        id: `portal_${target.id}`,
        name: `${target.title} Portal`,
        prompt: `Teleport to 3D ${target.title} (${target.icon})`,
        mesh: singlePortal,
        position: new THREE.Vector3(posX, 0, posZ),
        radius: 2.4,
        concept: target.id,
        action: () => {
          soundFx.playLevelUp();
          showToast(`🌀 Teleporting to ${target.title} in 3D!`);
          switchRealm(target.id);
        }
      });
    });

    scene.add(portalGroup);
  };

  // Switch between 5 3D Realms
  const buildRealisticRealm = (scene, concept) => {
    switch (concept) {
      case 'patent':
        buildRealisticPatentFarm(scene);
        break;
      case 'copyright':
        buildRealisticCopyrightStudio(scene);
        break;
      case 'trademark':
        buildRealisticTrademarkCity(scene);
        break;
      case 'trade_secret':
        buildRealisticSecretVault(scene);
        break;
      case 'plagiarism':
        buildRealisticAcademyQuad(scene);
        break;
    }
    // Add 3D In-World Teleport Portals connecting all 5 IP topics
    buildTeleportPortals(scene, concept);
  };

  // Helper: Create Realistic 3D NPC Character
  const createRealisticNPC = (
    scene, x, y, z, name, avatar, colorHex, 
    onInteract
  ) => {
    const npcGroup = new THREE.Group();
    
    // Body & Outfit
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.38, 0.32, 1.0, 16),
      new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.5, metalness: 0.2 })
    );
    body.position.y = 1.0;
    body.castShadow = true;
    npcGroup.add(body);

    // Head
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.4 })
    );
    head.position.y = 1.7;
    head.castShadow = true;
    npcGroup.add(head);

    // Floating Interaction Beacon Ring
    const ringGeo = new THREE.RingGeometry(0.35, 0.5, 20);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 2.4;
    npcGroup.add(ring);

    npcGroup.position.set(x, y, z);
    scene.add(npcGroup);

    addInteractable({
      id: `npc_${name}`,
      name,
      prompt: `Talk to ${name}`,
      mesh: npcGroup,
      position: new THREE.Vector3(x, y, z),
      radius: 3.2,
      concept: currentConcept,
      action: onInteract
    });
  };

  // Helper: Create Floating 3D Collectible Item
  const createRealisticPickup = (
    scene, x, y, z, name, icon, colorHex,
    onPickup
  ) => {
    const itemGroup = new THREE.Group();
    const cardFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.25, 1.55, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.6 })
    );
    cardFrame.position.y = 1.0;
    cardFrame.castShadow = true;
    itemGroup.add(cardFrame);

    const cardFace = new THREE.Mesh(
      new THREE.PlaneGeometry(1.12, 1.42),
      new THREE.MeshBasicMaterial({
        map: createLearningDisplayTexture({
          title: name,
          subtitle: 'Collect this invention part',
          icon,
          accent: `#${colorHex.toString(16).padStart(6, '0')}`,
          scene: 'icon'
        })
      })
    );
    cardFace.position.set(0, 1.0, 0.086);
    itemGroup.add(cardFace);

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.6, 0.72, 0.22, 24),
      new THREE.MeshStandardMaterial({ color: colorHex, emissive: colorHex, emissiveIntensity: 0.18, roughness: 0.45, metalness: 0.45 })
    );
    base.position.y = 0.11;
    itemGroup.add(base);

    itemGroup.position.set(x, y, z);
    scene.add(itemGroup);

    addInteractable({
      id: `pickup_${name}`,
      name,
      prompt: `Pick up ${name}`,
      mesh: itemGroup,
      position: new THREE.Vector3(x, y, z),
      radius: 2.8,
      concept: currentConcept,
      action: () => {
        scene.remove(itemGroup);
        interactablesRef.current = interactablesRef.current.filter(i => i.id !== `pickup_${name}`);
        onPickup();
      }
    });
  };

  const addInteractable = (obj) => {
    interactablesRef.current.push(obj);
  };

  // Helper: Create Floating 3D Easy Points Pedestal Station
  const createEasyPointsPedestal = (
    scene, x, y, z,
    concept
  ) => {
    const beaconGroup = new THREE.Group();
    
    // Cylindrical glowing pedestal base
    const baseGeo = new THREE.CylinderGeometry(0.7, 0.9, 0.9, 16);
    const baseMat = new THREE.MeshStandardMaterial({ 
      color: 0x1e293b, 
      roughness: 0.3, 
      metalness: 0.6 
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.45;
    base.castShadow = true;
    base.receiveShadow = true;
    beaconGroup.add(base);

    // Glowing accent ring
    const ringMat = new THREE.MeshStandardMaterial({ 
      color: 0xfbbf24, 
      emissive: 0xf59e0b, 
      emissiveIntensity: 1.2 
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.08, 12, 24), ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.9;
    beaconGroup.add(ring);

    // Floating rotating crystal / lightbulb orb on top
    const orbGeo = new THREE.OctahedronGeometry(0.45, 0);
    const orbMat = new THREE.MeshStandardMaterial({ 
      color: 0xfde047, 
      emissive: 0xf59e0b, 
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.8
    });
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.y = 1.6;
    beaconGroup.add(orb);

    // Point Light for ambient glow
    const pLight = new THREE.PointLight(0xfbbf24, 1.2, 6);
    pLight.position.y = 1.7;
    beaconGroup.add(pLight);

    beaconGroup.position.set(x, y, z);
    scene.add(beaconGroup);

    addInteractable({
      id: `easypoints_${concept}`,
      name: `${EASY_POINTS[concept].title.split(':')[0]} Easy Points Station`,
      prompt: `Review ${EASY_POINTS[concept].title.split(':')[0]} Easy Points (+25 XP)`,
      mesh: beaconGroup,
      position: new THREE.Vector3(x, y, z),
      radius: 3.5,
      concept,
      action: () => {
        soundFx.playLevelUp();
        setEasyConceptTab(concept);
        setShowEasyPointsModal(true);
        onCompleteMission(25, 10, 0, concept);
        showToast(`💡 ${concept.toUpperCase().replace('_', ' ')} Easy Points unlocked +25 XP earned.`);
      }
    });
  };

  return (
    <div 
      className="relative w-full h-full flex-1 min-h-[560px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onWheel={handleWheel}
    >
      {/* 3D WebGL Canvas */}
      <div 
        ref={containerRef} 
        className={`w-full h-full ${
          cursorStyle === 'grabbing'
            ? 'cursor-grabbing'
            : cursorStyle === 'pointer'
            ? 'cursor-pointer'
            : cursorStyle === 'crosshair'
            ? 'cursor-crosshair'
            : 'cursor-grab'
        }`} 
      />

      {/* Floating Cursor Hover Badge in 3D Game Field */}
      {hoveredObject && !isOrbitingRef.current && !isModalOpen && (
        <div 
          className="pointer-events-none absolute z-40 transform -translate-x-1/2 -translate-y-full mb-3 px-3 py-1.5 rounded-xl bg-[#0e2038] border-2 border-amber-400 text-white text-xs font-black shadow-2xl flex items-center gap-2 backdrop-blur-md transition-all animate-in fade-in"
          style={{ left: hoveredObject.screenPos.x, top: hoveredObject.screenPos.y }}
        >
          <span className="text-amber-400 text-sm">📍</span>
          <span>{hoveredObject.name}</span>
          <span className="text-[10px] text-amber-200 font-bold bg-amber-500/20 px-1.5 py-0.5 rounded-md border border-amber-400/40">
            {hoveredObject.actionDesc}
          </span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. TOP-LEFT: NAVIGATION, REALM TABS & ACTION SHORTCUTS */}
      {/* ============================================================== */}
      <div className="absolute top-3 left-3 z-30 flex items-center gap-2 pointer-events-auto max-w-[calc(100vw-22rem)] overflow-x-auto pb-1 scrollbar-none">
        {onBack && (
          <button
            onClick={() => { soundFx.playClick(); onBack(); }}
            className="p-2 rounded-xl bg-slate-900/95 hover:bg-slate-800 text-slate-200 border border-slate-700/80 backdrop-blur-md transition-all shadow-lg cursor-pointer shrink-0"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        {/* Active Individual Game Identity Badge with Adventure Logo */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/95 border border-sky-800/80 backdrop-blur-md shadow-lg shrink-0">
          <IPQuestBadge size={28} />
          <span className="text-base">{EASY_POINTS[currentConcept].icon}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-black text-white">{EASY_POINTS[currentConcept].title.split(':')[0]}</span>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase">
              3D Adventure
            </span>
          </div>
        </div>

        {/* Camera View Switcher */}
        <button
          onClick={() => {
            soundFx.playClick();
            setCameraMode(curr => curr === 'follow' ? 'face' : curr === 'face' ? 'tactical' : curr === 'tactical' ? 'fps' : 'follow');
          }}
          className="px-2.5 py-1.5 rounded-xl bg-blue-950/95 border-2 border-sky-400/60 text-sky-100 hover:text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-md shadow-lg cursor-pointer shrink-0"
          title="Toggle Camera View [V]"
        >
          <Video className="w-3.5 h-3.5 text-amber-400" />
          <span className="capitalize hidden xl:inline">{cameraMode === 'face' ? 'Face Cam' : `${cameraMode} Cam`}</span>
        </button>

        {/* Flashlight */}
        <button
          onClick={() => {
            soundFx.playClick();
            setFlashlightOn(curr => {
              const next = !curr;
              if (playerFlashlightRef.current) playerFlashlightRef.current.intensity = next ? 2.5 : 0;
              return next;
            });
          }}
          className={`p-2 rounded-xl border-2 backdrop-blur-md transition-all shadow-lg cursor-pointer shrink-0 ${
            flashlightOn 
              ? 'bg-amber-400 text-slate-950 border-yellow-200 font-bold shadow-amber-400/40' 
              : 'bg-blue-950/95 text-sky-200 border-sky-400/60 hover:text-white'
          }`}
          title="Toggle Flashlight [F]"
        >
          <Flashlight className="w-3.5 h-3.5" />
        </button>

        {/* Field Kit */}
        <button
          onClick={() => {
            soundFx.playClick();
            setShowBackpack(curr => !curr);
          }}
          className="px-2.5 py-1.5 rounded-xl bg-blue-950/95 border-2 border-amber-400/80 text-amber-300 hover:text-amber-200 text-xs font-black flex items-center gap-1.5 backdrop-blur-md shadow-lg cursor-pointer shrink-0 hover:scale-105 transition-all"
          title="Open Field Kit & IP Passport [B]"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden xl:inline">Kit [B]</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 2. TOP-RIGHT: DEDICATED QUEST STEPS CARD (Adventure Gold & Royal Blue) */}
      {/* ============================================================== */}
      <div className="absolute top-3 right-3 z-30 w-80 max-w-[calc(100vw-2rem)] pointer-events-auto">
        <div className="bg-[#0b1b46] border-3 border-amber-400 rounded-3xl p-3.5 shadow-2xl shadow-blue-950/60 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400"></span>
              </span>
              <span className="text-sm font-black text-amber-200 tracking-wider uppercase drop-shadow-sm">
                Step {questProgress.current + 1} of {questProgress.total}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setQuizModalConcept(currentConcept);
                  setShowQuizModal(true);
                }}
                className="p-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white border border-violet-300 shadow-sm cursor-pointer"
                title="Open topic quiz"
                aria-label="Open topic quiz"
              >
                <Trophy className="w-4 h-4 text-amber-300" />
              </button>
              <span className="text-[11px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 border border-yellow-200 shadow-sm">
                {currentConcept.toUpperCase()}
              </span>
              <button
                onClick={() => setShowRealmEasyCard(curr => !curr)}
                className={`p-1.5 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                  showRealmEasyCard 
                    ? 'bg-amber-400 text-slate-950 border-yellow-200 shadow-md' 
                    : 'bg-blue-950 text-amber-300 border-amber-400/50 hover:bg-blue-900'
                }`}
                title="Toggle Realm Study Guide"
              >
                💡
              </button>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-blue-950/90 border-2 border-sky-400/40 shadow-inner">
            <p className="text-sm text-white font-extrabold leading-relaxed drop-shadow-sm">
              {questObjective || 'Explore the realm and speak with the local mentor.'}
            </p>
          </div>
          {currentConcept === 'patent' && (
            <div className="rounded-xl border border-emerald-300/40 bg-emerald-950/70 px-2.5 py-2 text-[11px] leading-relaxed text-emerald-50">
              <span className="font-black uppercase tracking-wide text-emerald-300">Patent idea: </span>
              A patent can protect how a new working invention solves a problem—not just its name or a thought.
            </div>
          )}

          {/* Current Step Target Location, Live Distance & Quick Teleport */}
          {(() => {
            const currentStepTarget = REALM_STEPS[currentConcept]?.[questProgress.current];
            const targetDistance = currentStepTarget
              ? Math.round(Math.hypot(playerCoord.x - currentStepTarget.targetCoords.x, playerCoord.z - currentStepTarget.targetCoords.z))
              : 0;

            return currentStepTarget ? (
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-950 border border-sky-300 text-xs">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-base shrink-0">{currentStepTarget.badgeIcon}</span>
                  <div className="truncate">
                    <div className="font-bold text-white truncate text-xs">{currentStepTarget.targetName}</div>
                    <div className="text-[11px] text-amber-200 font-mono font-semibold">
                      📍 {targetDistance}m away ({currentStepTarget.targetLocation})
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (playerGroupRef.current && currentStepTarget) {
                      soundFx.playSuccess();
                      playerGroupRef.current.position.set(currentStepTarget.targetCoords.x, 0, currentStepTarget.targetCoords.z + 2);
                      targetMovePosRef.current = null;
                      const nextCoord = { x: Math.round(currentStepTarget.targetCoords.x), z: Math.round(currentStepTarget.targetCoords.z + 2) };
                      playerCoordRef.current = nextCoord;
                      setPlayerCoord(nextCoord);
                      showToast(`⚡ Teleported to ${currentStepTarget.targetName}!`);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 hover:from-yellow-200 hover:to-amber-300 text-slate-950 font-black text-[11px] shadow-md shadow-amber-500/30 border border-yellow-100 flex items-center gap-1 shrink-0 cursor-pointer transition-all hover:scale-105"
                  title="Instant Teleport to Goal"
                >
                  <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                  <span>Teleport</span>
                </button>
              </div>
            ) : null;
          })()}

          {/* Completed steps are hidden; only show Next Step */}
          {questProgress.current + 1 < questProgress.total ? (
            <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[10px]">
              <span className="text-slate-300 italic">✓ Prior steps cleared</span>
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <span>➔ Next:</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono">
                  Step {questProgress.current + 2}
                </span>
              </div>
            </div>
          ) : (
            <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[11px] text-emerald-400 font-bold">
              <span>🏆 Final Objective!</span>
              <button
                onClick={() => {
                  soundFx.playClick();
                  setQuizModalConcept(currentConcept);
                  setShowQuizModal(true);
                }}
                className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 cursor-pointer text-[10px]"
              >
                Attend Quiz ➔
              </button>
            </div>
          )}

          {/* Quick Option to switch to 2D Lab if student finds 3D controls tricky */}
          {onSwitchTo2D && (
            <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px]">
              <span className="text-slate-200">Finding 3D movement tricky?</span>
              <button
                onClick={() => {
                  soundFx.playClick();
                  onSwitchTo2D(currentConcept);
                }}
                className="px-2 py-0.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 font-bold cursor-pointer transition-all"
              >
                🎮 Play 2D Lab
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. BOTTOM-RIGHT: REAL-TIME RADAR & TELEMETRY */}
      {/* ============================================================== */}
      <div className="absolute bottom-3 right-3 z-20 flex flex-col items-end gap-2 pointer-events-auto">
        {/* Live In-World Telemetry Badge */}
        {currentConcept === 'patent' && (
          <div className="px-2.5 py-1 rounded-xl bg-slate-900/95 border border-amber-500/50 backdrop-blur-md text-[11px] shadow-lg flex items-center gap-2">
            <span className="text-amber-400 font-bold">Soil: {patentSoilMoisture}%</span>
            <span className="text-slate-500">•</span>
            <span className={`font-bold ${patentValveOpen ? 'text-cyan-400' : 'text-emerald-400'}`}>
              Valve: {patentValveOpen ? 'OPEN' : 'CLOSED'}
            </span>
          </div>
        )}

        {currentConcept === 'trademark' && (
          <div className="px-2.5 py-1 rounded-xl bg-slate-900/95 border border-emerald-500/50 backdrop-blur-md text-[11px] shadow-lg flex items-center gap-2">
            <span className="text-emerald-400 font-bold">Confusion: {confusionPercent}%</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">{confusionPercent === 0 ? 'Distinct' : 'Infringing'}</span>
          </div>
        )}

        {currentConcept === 'plagiarism' && (
          <div className="px-2.5 py-1 rounded-xl bg-slate-900/95 border border-cyan-500/50 backdrop-blur-md text-[11px] shadow-lg flex items-center gap-2">
            <span className="text-cyan-400 font-bold">Similarity: {similarityScore}%</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">{similarityScore <= 10 ? 'Ethical' : 'Plagiarized'}</span>
          </div>
        )}

        {/* Real-Time Radar Minimap */}
        <div className="w-18 h-18 rounded-2xl bg-slate-900/95 border border-slate-700/80 relative overflow-hidden flex flex-col items-center justify-center backdrop-blur-md shadow-xl">
          <div className="absolute inset-1 rounded-xl border border-slate-800/80 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-md animate-pulse" />
            <div className="absolute w-12 h-12 rounded-full border border-slate-700/40 pointer-events-none" />
          </div>
          <span className="absolute bottom-1 text-[8px] text-slate-400 font-mono tabular-nums">
            {playerCoord.x},{playerCoord.z}
          </span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. BOTTOM-LEFT: STUDENT INVENTOR FACE CARD & CONTROLS */}
      {/* ============================================================== */}
      <div className="absolute top-16 left-3 z-20 flex flex-col sm:flex-row items-start sm:items-center gap-2 pointer-events-auto">
        {/* Student Inventor Face Card */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-slate-900/95 border border-amber-400/80 backdrop-blur-md shadow-xl">
          <div className="relative w-9 h-9 rounded-full bg-gradient-to-b from-sky-400 to-indigo-600 border-2 border-amber-400 overflow-hidden shadow-inner flex items-center justify-center shrink-0">
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
              <path d="M 28 85 L 50 76 L 72 85 Z" fill="#0369a1" />
              <rect x="47" y="78" width="6" height="12" fill="#d97706" />
            </svg>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900 shadow-sm" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white leading-none">Student Inventor</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-400 text-slate-950">Active</span>
            </div>
            <button
              onClick={() => {
                soundFx.playClick();
                setCameraMode(curr => curr === 'face' ? 'follow' : 'face');
              }}
              className={`text-[10px] font-bold flex items-center gap-1 mt-0.5 transition-colors cursor-pointer ${
                cameraMode === 'face' ? 'text-amber-400 underline' : 'text-slate-400 hover:text-amber-300'
              }`}
              title="Toggle Face Camera View [V]"
            >
              <Video className="w-2.5 h-2.5" />
              <span>{cameraMode === 'face' ? 'Face Cam Active [V]' : 'Face View [V]'}</span>
            </button>
          </div>
        </div>

        {/* Controls Hint */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[10px] text-slate-400 backdrop-blur-sm">
          <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">WASD</kbd> Move</span>
          <span>•</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">Space</kbd> Jump</span>
          <span>•</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">E</kbd> Interact</span>
          <span>•</span>
          <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-mono">Drag</kbd> Orbit</span>
        </div>
      </div>

      {/* Floating 3D Interaction Prompt */}
      {activePrompt && !isModalOpen && (
        <div className="absolute bottom-44 left-4 z-20 pointer-events-auto">
          <button
            onClick={() => {
              if (nearestInteractableRef.current) {
                soundFx.playClick();
                nearestInteractableRef.current.action();
              }
            }}
            className="px-7 py-3 rounded-full bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 hover:from-yellow-200 hover:to-amber-300 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-2xl shadow-amber-400/50 flex items-center gap-2.5 animate-bounce cursor-pointer border-3 border-white ring-4 ring-amber-400/40"
          >
            <Sparkles className="w-4 h-4" />
            <span>{activePrompt}</span>
          </button>
        </div>
      )}

      {/* ON-SCREEN ACTIVE REALM EASY POINTS CARD */}
      {showRealmEasyCard ? (
        <div className="absolute top-[185px] left-4 z-30 w-[calc(100%-2rem)] max-w-xs bg-slate-900/95 border-2 border-amber-400/80 rounded-2xl p-3 backdrop-blur-md shadow-2xl animate-fade-in pointer-events-auto">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="text-lg">{EASY_POINTS[currentConcept].icon}</span>
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 block">Student Easy Guide</span>
                <h4 className="text-xs font-black text-white leading-tight truncate">{EASY_POINTS[currentConcept].title}</h4>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setEasyConceptTab(currentConcept);
                  setShowEasyPointsModal(true);
                }}
                className="px-2 py-0.5 rounded-md bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-[10px] font-bold border border-amber-400/40 cursor-pointer"
                title="View All 5 Concepts"
              >
                All 5
              </button>
              <button
                onClick={() => setShowRealmEasyCard(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
                title="Minimize Guide"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <p className="text-[10px] text-slate-200 mb-2 leading-relaxed">
            {EASY_POINTS[currentConcept].simpleDefinition}
          </p>

          <div className="space-y-1 mb-2">
            {EASY_POINTS[currentConcept].points.map((pt, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[10px] bg-slate-800/80 p-1.5 rounded-lg border border-slate-750">
                <span className="text-xs shrink-0">{pt.icon}</span>
                <div className="leading-tight">
                  <strong className="text-amber-300">{pt.title}: </strong>
                  <span className="text-slate-300">{pt.description}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-1.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-[9px] text-amber-200 font-semibold leading-tight flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
            <span>{EASY_POINTS[currentConcept].goldenRule}</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pt-2">
            <button
              onClick={() => {
                soundFx.playClick();
                setEasyConceptTab(currentConcept);
                setShowEasyPointsModal(true);
              }}
              className="py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-[10px] rounded-lg transition-all cursor-pointer text-center shadow-md flex items-center justify-center gap-1"
            >
              <span>Easy Guide</span>
            </button>
            <button
              onClick={() => {
                soundFx.playClick();
                setQuizModalConcept(currentConcept);
                setShowQuizModal(true);
              }}
              className="py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-black text-[10px] rounded-lg transition-all cursor-pointer text-center shadow-md flex items-center justify-center gap-1"
            >
              <Trophy className="w-3 h-3 text-amber-300" />
              <span>Attend Quiz</span>
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowRealmEasyCard(true)}
          className="hidden sm:flex absolute top-32 left-4 z-20 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-amber-400/60 text-amber-300 text-xs font-bold shadow-lg backdrop-blur-md cursor-pointer pointer-events-auto items-center gap-1.5"
        >
          <span>💡 Show Easy Guide</span>
        </button>
      )}

      {/* Mobile Floating Easy Points Launcher */}
      <button
        onClick={() => {
          soundFx.playClick();
          setEasyConceptTab(currentConcept);
          setShowEasyPointsModal(true);
        }}
        className="sm:hidden absolute top-32 left-4 z-30 px-3 py-1.5 rounded-xl bg-slate-900/95 border border-amber-400 text-amber-300 text-xs font-bold shadow-lg backdrop-blur-md cursor-pointer pointer-events-auto flex items-center gap-1.5"
      >
        <span>💡 Easy Points</span>
      </button>

      {/* ============================================================== */}
      {/* 4. UNIVERSAL ON-SCREEN CONTROLS & D-PAD (Desktop + Touch Devices) */}
      {/* ============================================================== */}
      {showTouchControls && (
        <div className="absolute bottom-4 left-4 z-20 pointer-events-auto flex items-end gap-3 select-none">
          {/* Virtual D-Pad / Movement Pad */}
          <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-2xl flex flex-col items-center">
            {/* Up / Forward */}
            <button
              onMouseDown={() => { dpadMovement.current = { x: 0, z: -1 }; }}
              onMouseUp={() => { dpadMovement.current = { x: 0, z: 0 }; }}
              onMouseLeave={() => { dpadMovement.current = { x: 0, z: 0 }; }}
              onTouchStart={() => { dpadMovement.current = { x: 0, z: -1 }; }}
              onTouchEnd={() => { dpadMovement.current = { x: 0, z: 0 }; }}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-amber-400 active:text-slate-950 text-white font-bold flex items-center justify-center text-base border border-slate-700 shadow-md transition-colors cursor-pointer"
              title="Move Forward [W / ↑]"
            >
              ▲
            </button>

            {/* Left / Center Sprint / Right */}
            <div className="flex items-center gap-1.5 my-1">
              <button
                onMouseDown={() => { dpadMovement.current = { x: -1, z: 0 }; }}
                onMouseUp={() => { dpadMovement.current = { x: 0, z: 0 }; }}
                onMouseLeave={() => { dpadMovement.current = { x: 0, z: 0 }; }}
                onTouchStart={() => { dpadMovement.current = { x: -1, z: 0 }; }}
                onTouchEnd={() => { dpadMovement.current = { x: 0, z: 0 }; }}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-amber-400 active:text-slate-950 text-white font-bold flex items-center justify-center text-base border border-slate-700 shadow-md transition-colors cursor-pointer"
                title="Move Left [A / ←]"
              >
                ◀
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setIsSprinting(curr => !curr);
                }}
                className={`w-10 h-10 rounded-xl font-bold flex flex-col items-center justify-center text-[10px] border shadow-md transition-all cursor-pointer ${
                  isSprinting 
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-amber-400/30' 
                    : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
                title="Toggle Sprint [Shift]"
              >
                <span>⚡</span>
                <span className="text-[8px] leading-none uppercase">Run</span>
              </button>

              <button
                onMouseDown={() => { dpadMovement.current = { x: 1, z: 0 }; }}
                onMouseUp={() => { dpadMovement.current = { x: 0, z: 0 }; }}
                onMouseLeave={() => { dpadMovement.current = { x: 0, z: 0 }; }}
                onTouchStart={() => { dpadMovement.current = { x: 1, z: 0 }; }}
                onTouchEnd={() => { dpadMovement.current = { x: 0, z: 0 }; }}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-amber-400 active:text-slate-950 text-white font-bold flex items-center justify-center text-base border border-slate-700 shadow-md transition-colors cursor-pointer"
                title="Move Right [D / →]"
              >
                ▶
              </button>
            </div>

            {/* Down / Backward */}
            <button
              onMouseDown={() => { dpadMovement.current = { x: 0, z: 1 }; }}
              onMouseUp={() => { dpadMovement.current = { x: 0, z: 0 }; }}
              onMouseLeave={() => { dpadMovement.current = { x: 0, z: 0 }; }}
              onTouchStart={() => { dpadMovement.current = { x: 0, z: 1 }; }}
              onTouchEnd={() => { dpadMovement.current = { x: 0, z: 0 }; }}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-amber-400 active:text-slate-950 text-white font-bold flex items-center justify-center text-base border border-slate-700 shadow-md transition-colors cursor-pointer"
              title="Move Backward [S / ↓]"
            >
              ▼
            </button>
          </div>

          {/* Jump & Quick Action Pills */}
          <div className="flex flex-col gap-1.5 pb-1">
            <button
              onClick={() => {
                if (isGroundedRef.current) {
                  soundFx.playJump();
                  playerVelocityYRef.current = 0.28;
                  isGroundedRef.current = false;
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-amber-400 active:text-slate-950 text-white font-bold text-xs border border-slate-700 shadow-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Jump [Space]"
            >
              <span>🦘</span>
              <span>Jump</span>
            </button>

            {nearestInteractableRef.current && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  nearestInteractableRef.current?.action();
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs border border-amber-300 shadow-lg shadow-amber-400/20 flex items-center gap-1.5 animate-pulse transition-all cursor-pointer"
                title="Interact with nearest NPC or object [E]"
              >
                <span>✨</span>
                <span>Interact</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* ALL 5 CONCEPTS EASY POINTS MASTER GUIDE MODAL */}
      {/* ============================================================== */}
      {showEasyPointsModal && (
        <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center text-2xl shadow-inner border border-amber-400/30">
                  💡
                </div>
                <div>
                  <h3 className="text-xl font-black text-white font-display">Student Easy Points: All 5 IP Concepts</h3>
                  <p className="text-xs text-slate-400">Clear rules, everyday examples, and quick self-tests for school students</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEasyPointsModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 5 Topic Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
              {[
                { id: 'patent', label: 'Patent', icon: '💡' },
                { id: 'copyright', label: 'Copyright', icon: '🎨' },
                { id: 'trademark', label: 'Trademark', icon: '™️' },
                { id: 'trade_secret', label: 'Trade Secret', icon: '🔐' },
                { id: 'plagiarism', label: 'Plagiarism', icon: '📚' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundFx.playClick();
                    setEasyConceptTab(tab.id);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    easyConceptTab === tab.id
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Selected Topic Content */}
            {(() => {
              const info = EASY_POINTS[easyConceptTab];
              return (
                <div className="space-y-4 animate-fade-in">
                  {/* Title & Tagline Banner */}
                  <div className={`p-4 rounded-2xl border bg-slate-850 ${info.badgeColor} space-y-1`}>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{info.icon}</span>
                      <h4 className="text-lg font-black text-white">{info.title}</h4>
                    </div>
                    <p className="text-xs text-slate-200 font-medium leading-relaxed">
                      {info.simpleDefinition}
                    </p>
                    <div className="text-[11px] text-amber-300 font-semibold pt-1">
                      {info.tagline}
                    </div>
                  </div>

                  {/* 3 Core Points Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {info.points.map((pt, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{pt.icon}</span>
                          <h5 className="font-bold text-xs text-white">{pt.title}</h5>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {pt.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Real-World Example & Golden Rule */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-800 border border-slate-700">
                      <div className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                        <Star className="w-4 h-4" />
                        <span>Real-World Everyday Example</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{info.realWorldExample}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/40">
                      <div className="font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>The Golden Rule to Remember</span>
                      </div>
                      <p className="text-amber-200 leading-relaxed font-medium">{info.goldenRule}</p>
                    </div>
                  </div>

                  {/* Do vs Don't Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-200 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Correct Action (DO)</span>
                      </div>
                      <p className="leading-relaxed">{info.dosAndDonts.do}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-200 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-rose-300">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span>Common Student Mistake (DON'T)</span>
                      </div>
                      <p className="leading-relaxed">{info.dosAndDonts.dont}</p>
                    </div>
                  </div>

                  {/* Interactive Student Mastery Checklist */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Easy Points Mastery Checklist (Tap to Master)
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-amber-300">
                        {info.checklist.filter((_, idx) => masteredChecklist[`${easyConceptTab}_${idx}`]).length}/{info.checklist.length} Mastered
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {info.checklist.map((item, idx) => {
                        const isDone = Boolean(masteredChecklist[`${easyConceptTab}_${idx}`]);
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              soundFx.playClick();
                              setMasteredChecklist(prev => {
                                const nextVal = !prev[`${easyConceptTab}_${idx}`];
                                const updated = { ...prev, [`${easyConceptTab}_${idx}`]: nextVal };
                                if (nextVal) {
                                  soundFx.playSuccess();
                                  showToast(`✓ Mastered: Point ${idx + 1}!`);
                                  // Check if all 3 are completed
                                  const allDone = info.checklist.every((_, cIdx) => 
                                    cIdx === idx ? nextVal : updated[`${easyConceptTab}_${cIdx}`]
                                  );
                                  if (allDone) {
                                    soundFx.playLevelUp();
                                    confetti({ particleCount: 70, spread: 80 });
                                    showToast(`🏆 All 3 ${info.title.split(':')[0]} Easy Points mastered +15 XP`);
                                  }
                                }
                                return updated;
                              });
                            }}
                            className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-start gap-2.5 ${
                              isDone 
                                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200' 
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                              isDone ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600'
                            }`}>
                              {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                            </div>
                            <span className="leading-snug">{item}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Interactive Quick Practice Check */}
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-white">
                        <HelpCircle className="w-4 h-4 text-amber-400" />
                        <span>Quick Check: {info.quickCheck.question}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">1-Tap Self Test</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {info.quickCheck.options.map((opt, optIdx) => {
                        const isChosen = quizAnswered[easyConceptTab] === optIdx;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => {
                              soundFx.playClick();
                              setQuizAnswered(q => ({ ...q, [easyConceptTab]: optIdx }));
                              if (opt.correct) {
                                soundFx.playSuccess();
                                confetti({ particleCount: 50, spread: 60 });
                              }
                            }}
                            className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                              isChosen
                                ? opt.correct 
                                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200' 
                                  : 'bg-rose-950/60 border-rose-500 text-rose-200'
                                : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                            }`}
                          >
                            <div className="font-bold">{opt.text}</div>
                            {isChosen && (
                              <div className="text-[11px] mt-1 font-medium opacity-90">
                                {opt.correct ? '✓ ' : '❌ '}{opt.explanation}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Quick 5-Concept Comparison Table */}
            <div className="border-t border-slate-800 pt-4 space-y-2">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Side-By-Side Quick Comparison:</h5>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-[11px] text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Topic</th>
                      <th className="p-2.5">What it Protects</th>
                      <th className="p-2.5">How Long</th>
                      <th className="p-2.5">Registration Required?</th>
                      <th className="p-2.5">Everyday Example</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-amber-400">💡 Patent</td>
                      <td className="p-2.5">How machines & tools work</td>
                      <td className="p-2.5">20 Years</td>
                      <td className="p-2.5 text-amber-300">Yes (Government Grant)</td>
                      <td className="p-2.5">Dyson Vacuum, Smart Irrigation</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-indigo-400">🎨 Copyright</td>
                      <td className="p-2.5">Creative art, music, code</td>
                      <td className="p-2.5">Life + 70 Years</td>
                      <td className="p-2.5 text-emerald-400">No (Automatic upon creation)</td>
                      <td className="p-2.5">Harry Potter, Luna's Artwork</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-emerald-400">™️ Trademark</td>
                      <td className="p-2.5">Brand logos, names, slogans</td>
                      <td className="p-2.5">Forever (renew every 10y)</td>
                      <td className="p-2.5 text-amber-300">Common Law ™ / Registered ®</td>
                      <td className="p-2.5">Nike Swoosh, CitroVibe™</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-rose-400">🔐 Trade Secret</td>
                      <td className="p-2.5">Confidential formulas & recipes</td>
                      <td className="p-2.5">Forever (until leaked)</td>
                      <td className="p-2.5 text-emerald-400">No (Must take reasonable security)</td>
                      <td className="p-2.5">Coca-Cola Recipe, Polymer Catalyst</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-cyan-400">📚 Plagiarism</td>
                      <td className="p-2.5">Academic honesty & attribution</td>
                      <td className="p-2.5">Lifelong academic trust</td>
                      <td className="p-2.5 text-slate-400">Ethical standard in school</td>
                      <td className="p-2.5">Citing Dr. Lin (2021) vs Copying</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setShowEasyPointsModal(false);
                  setQuizModalConcept(easyConceptTab);
                  setShowQuizModal(true);
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-black text-xs transition-all cursor-pointer shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
              >
                <Trophy className="w-4 h-4 text-amber-300" />
                <span>Attend {easyConceptTab.toUpperCase().replace('_', ' ')} Quiz (Continuous Path) ➔</span>
              </button>

              <button
                onClick={() => setShowEasyPointsModal(false)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-lg shadow-amber-400/20"
              >
                Back to 3D Game World
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* HANDS-ON INTERACTIVE STUDENT WORKBENCHES & SIMULATION MODALS */}
      {/* ============================================================== */}

      {/* 1. PATENT LAB: INTERACTIVE CIRCUIT WIRING WORKBENCH */}
      {circuitModal && (
        <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Proto Wiring Board</h3>
                  <p className="text-xs text-slate-400">Click each circuit trace to connect the hardware components</p>
                </div>
              </div>
              <button 
                onClick={() => setCircuitModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Wiring Pin 1: Probe to MCU */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  setCircuitWires(w => ({ ...w, probe: !w.probe }));
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex items-start gap-3 ${
                  circuitWires.probe 
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200' 
                    : 'bg-slate-800/60 border-slate-700 hover:border-amber-400 text-slate-300'
                }`}
              >
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${circuitWires.probe ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700'}`}>
                  {circuitWires.probe ? '✓' : '1'}
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Wire 1: Soil Moisture Sensor Cable</div>
                  <div className="text-xs text-slate-400">Sends soil dryness readings from the ground to the smart computer chip</div>
                </div>
              </button>

              {/* Wiring Pin 2: MCU to Solenoid Relay */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  setCircuitWires(w => ({ ...w, mcu: !w.mcu }));
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex items-start gap-3 ${
                  circuitWires.mcu 
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200' 
                    : 'bg-slate-800/60 border-slate-700 hover:border-amber-400 text-slate-300'
                }`}
              >
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${circuitWires.mcu ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700'}`}>
                  {circuitWires.mcu ? '✓' : '2'}
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Wire 2: Water Valve Control Switch</div>
                  <div className="text-xs text-slate-400">Signals the valve to open when soil is dry, and close when soil is moist</div>
                </div>
              </button>

              {/* Wiring Pin 3: Solenoid Valve Power Loop */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  setCircuitWires(w => ({ ...w, valve: !w.valve }));
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex items-start gap-3 ${
                  circuitWires.valve 
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200' 
                    : 'bg-slate-800/60 border-slate-700 hover:border-amber-400 text-slate-300'
                }`}
              >
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${circuitWires.valve ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700'}`}>
                  {circuitWires.valve ? '✓' : '3'}
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Wire 3: Water Pipe Sprinkler Valve</div>
                  <div className="text-xs text-slate-400">Powers the mechanical valve to release or shut off water flow</div>
                </div>
              </button>

              {/* Wiring Pin 4: Common Ground & VCC */}
              <button
                onClick={() => {
                  soundFx.playClick();
                  setCircuitWires(w => ({ ...w, power: !w.power }));
                }}
                className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer flex items-start gap-3 ${
                  circuitWires.power 
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200' 
                    : 'bg-slate-800/60 border-slate-700 hover:border-amber-400 text-slate-300'
                }`}
              >
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold ${circuitWires.power ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700'}`}>
                  {circuitWires.power ? '✓' : '4'}
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Wire 4: Rechargeable Battery Pack</div>
                  <div className="text-xs text-slate-400">Powers the whole invention so it operates autonomously on the farm</div>
                </div>
              </button>
            </div>

            {/* Circuit Validation Bar */}
            <div className="p-3 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Wiring Connections:</span>
                <span className="text-xs font-bold text-amber-400">
                  {Object.values(circuitWires).filter(Boolean).length}/4 Connected
                </span>
              </div>
              {Object.values(circuitWires).every(Boolean) ? (
                <button
                  onClick={() => {
                    soundFx.playSuccess();
                    realmStateRef.current.patent.circuitWired = true;
                    realmStateRef.current.patent.assembled = true;
                    setPatentAutoEnabled(true);
                    setCircuitModal(false);
                    setQuestObjective('The machine is built! Test it at (8, 6) and see how it responds when the soil is wet or dry.');
                    setQuestProgress({ current: 3, total: 5 });
                    showToast('⚡ Circuit fully operational & enabled!');
                  }}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Energize Working Machine</span>
                </button>
              ) : (
                <span className="text-xs text-slate-500 italic">Connect all 4 circuit traces above</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. PATENT LAB: INTERACTIVE REAL-TIME SOIL SIMULATOR */}
      {testingBedModal && (
        <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-cyan-400 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-400/20 text-cyan-400 flex items-center justify-center">
                  <Droplets className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Live Soil & Water Feedback Simulator</h3>
                  <p className="text-xs text-slate-400">Adjust the soil conditions to observe autonomous valve response in 3D</p>
                </div>
              </div>
              <button 
                onClick={() => setTestingBedModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slider */}
            <div className="space-y-2 bg-slate-800/80 p-4 rounded-xl border border-slate-700">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300 font-bold">Soil Moisture Sensor Probe:</span>
                <span className="text-cyan-400 font-mono font-bold text-base">{patentSoilMoisture}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                value={patentSoilMoisture}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setPatentSoilMoisture(val);
                  if (val < 40) {
                    setPatentValveOpen(true);
                    if (waterSprayParticlesRef.current) waterSprayParticlesRef.current.visible = true;
                  } else {
                    setPatentValveOpen(false);
                    if (waterSprayParticlesRef.current) waterSprayParticlesRef.current.visible = false;
                  }
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>0% Bone Dry (Crop Wilting)</span>
                <span>Threshold: 40%</span>
                <span>100% Waterlogged (Root Rot)</span>
              </div>
            </div>

            {/* Autonomous Action Telemetry */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className={`p-3.5 rounded-xl border ${patentValveOpen ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200' : 'bg-slate-800 border-slate-700 text-slate-300'}`}>
                <div className="font-bold mb-1">Solenoid Valve Actuation</div>
                <div className="text-sm font-extrabold">{patentValveOpen ? 'OPEN (Spraying)' : 'CLOSED (Halted)'}</div>
                <div className="text-[10px] text-slate-400 mt-1">Autonomous decision made by MCU logic controller</div>
              </div>

              <div className="p-3.5 rounded-xl border bg-slate-800 border-slate-700 text-slate-300">
                <div className="font-bold mb-1">Water Conserved</div>
                <div className="text-sm font-extrabold text-emerald-400">{patentValveOpen ? '95 gal/hr' : '555 gal/hr SAVED!'}</div>
                <div className="text-[10px] text-slate-400 mt-1">Prevents 82% of farm over-irrigation waste</div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  soundFx.playSuccess();
                  realmStateRef.current.patent.testedWetDry = true;
                  setTestingBedModal(false);
                  setQuestObjective('Your test worked! Tell Dr. Elena at (14, -8) how your invention solves the farm’s water problem.');
                  setQuestProgress({ current: 4, total: 5 });
                  showToast('✓ Technical feedback verified in action!');
                }}
                className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
              >
                Log Test Data & Report to Dr. Elena
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. PATENT LAB: PATENT CLAIMS DRAFTER WITH DR. ELENA */}
      {patentClaimsModal && (
        <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-purple-400 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-12 h-12 rounded-xl bg-purple-400/20 text-purple-400 flex items-center justify-center text-2xl">
                👩‍⚖️
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Dr. Elena Vance — Patent Claim Examination</h3>
                <p className="text-xs text-purple-300">Choose the description that legally qualifies for a 20-year patent grant!</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              To get a patent, you must describe a <strong>real working machine or tool</strong> that solves a physical problem. Which of these three choices qualifies for a patent?
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  soundFx.playInvestigate();
                  showToast('❌ Brand names are Trademarks, not Patents!');
                }}
                className="w-full p-3.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:border-rose-400 text-left text-xs text-slate-200 cursor-pointer"
              >
                <strong className="text-rose-400">Choice 1:</strong> "The cool brand name 'AquaFlow' for our farm's bottled water."
                <div className="text-[10px] text-slate-400 mt-0.5">Examiner feedback: Brand names and logos belong to Trademarks, not Patents!</div>
              </button>

              <button
                onClick={() => {
                  soundFx.playInvestigate();
                  showToast('❌ Thoughts alone cannot be patented until built!');
                }}
                className="w-full p-3.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:border-rose-400 text-left text-xs text-slate-200 cursor-pointer"
              >
                <strong className="text-rose-400">Choice 2:</strong> "The daydream thought that farmers dislike wasting water."
                <div className="text-[10px] text-slate-400 mt-0.5">Examiner feedback: Raw thoughts and wishes cannot be patented until you build a real machine!</div>
              </button>

              <button
                onClick={() => {
                  soundFx.playLevelUp();
                  confetti({ particleCount: 100, spread: 90 });
                  realmStateRef.current.patent.claimsApproved = true;
                  setPatentClaimsModal(false);
                  setQuestProgress({ current: 5, total: 5 });
                  setMissionCompleteCelebration(true);
                  onCompleteMission(250, 60, 3, 'patent');
                }}
                className="w-full p-3.5 rounded-xl border-2 border-emerald-500 bg-emerald-950/30 hover:bg-emerald-950/50 text-left text-xs text-emerald-100 cursor-pointer"
              >
                <strong className="text-emerald-400">Choice 3 (Approved):</strong> "An automatic watering machine made with a soil moisture sensor probe, a computer brain chip, and an electric water valve that stops water waste!"
                <div className="text-[10px] text-emerald-300 mt-0.5">Examiner feedback: ✓ Brand new, inventive, and a real working machine 20-Year Patent Granted!</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. COPYRIGHT STUDIO: DIGITAL CREATIVE CANVAS & FIXATION MINTING */}
      {copyrightCanvasModal && (
        <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-indigo-400 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-400/20 text-indigo-400 flex items-center justify-center">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Creative Easel & Fixation Certificate</h3>
                  <p className="text-xs text-slate-400">Fix your creative expression into a tangible medium of expression</p>
                </div>
              </div>
              <button 
                onClick={() => setCopyrightCanvasModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Author Name Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Creator / Author Name:</label>
              <input
                type="text"
                value={studentCreatorName}
                onChange={(e) => setStudentCreatorName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:border-indigo-400 outline-none"
                placeholder="Enter your name"
              />
            </div>

            {/* License Terms Selection */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300">Choose Rights & Licensing:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'arr', label: 'All Rights Reserved (©)', desc: 'Exclusive commercial & reproduction rights' },
                  { id: 'cc-by', label: 'Creative Commons (CC-BY)', desc: 'Free sharing with mandatory attribution' },
                  { id: 'pd', label: 'Public Domain (CC0)', desc: 'Dedicated to the public with no restrictions' }
                ].map(lic => (
                  <button
                    key={lic.id}
                    onClick={() => { soundFx.playClick(); setChosenLicense(lic.id); }}
                    className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                      chosenLicense === lic.id ? 'bg-indigo-950/60 border-indigo-400 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="font-bold">{lic.label}</div>
                    <div className="text-[10px] opacity-75 mt-0.5">{lic.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mint Fixation Button */}
            <button
              onClick={() => {
                soundFx.playSuccess();
                realmStateRef.current.copyright.artworkFixed = true;
                setCopyrightCanvasModal(false);
                setQuestObjective('Artwork saved Inspect the unauthorized festival billboard at (12, 6) using your magnifying scanner.');
                setQuestProgress({ current: 2, total: 5 });
                showToast(`✓ © 2026 ${studentCreatorName}: Your artwork is automatically protected!`);
              }}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Save & Protect Artwork (Automatic Copyright Created)</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. COPYRIGHT STUDIO: OPTICAL INFRINGEMENT LOUPE SCANNER */}
      {infringementLoupeModal && (
        <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-400 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-400/20 text-rose-400 flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Magnifying Scanner: Spot the Copycat Art!</h3>
                  <p className="text-xs text-slate-400">Tap all 3 clues proving the promoter copied Luna’s drawing without permission</p>
                </div>
              </div>
              <button 
                onClick={() => setInfringementLoupeModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => { soundFx.playClick(); setDetectedVectors(v => ({ ...v, v1: true })); }}
                className={`w-full p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                  detectedVectors.v1 ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <div>
                  <div className="font-bold">Clue 1: Stolen "Solar Lynx" Character Drawing</div>
                  <div className="text-[10px] text-slate-400">The billboard drawing is a direct trace of Luna's original sketch!</div>
                </div>
                <span>{detectedVectors.v1 ? '✓ Confirmed' : 'Scan'}</span>
              </button>

              <button
                onClick={() => { soundFx.playClick(); setDetectedVectors(v => ({ ...v, v2: true })); }}
                className={`w-full p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                  detectedVectors.v2 ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <div>
                  <div className="font-bold">Clue 2: Selling for Commercial Profit</div>
                  <div className="text-[10px] text-slate-400">The promoter is selling festival tickets using Luna's drawing to make money!</div>
                </div>
                <span>{detectedVectors.v2 ? '✓ Confirmed' : 'Scan'}</span>
              </button>

              <button
                onClick={() => { soundFx.playClick(); setDetectedVectors(v => ({ ...v, v3: true })); }}
                className={`w-full p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center justify-between ${
                  detectedVectors.v3 ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <div>
                  <div className="font-bold">Clue 3: Zero Written Permission & No Royalties</div>
                  <div className="text-[10px] text-slate-400">The promoter never asked Luna or signed an official license agreement!</div>
                </div>
                <span>{detectedVectors.v3 ? '✓ Confirmed' : 'Scan'}</span>
              </button>
            </div>

            {Object.values(detectedVectors).every(Boolean) ? (
              <button
                onClick={() => {
                  soundFx.playSuccess();
                  realmStateRef.current.copyright.vectorsFound = true;
                  setInfringementLoupeModal(false);
                  setQuestObjective('All 3 clues gathered Talk to Promoter Marcus at (16, 6) to demand licensing settlement.');
                  setQuestProgress({ current: 3, total: 5 });
                }}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
              >
                Demand Licensing & Confront Promoter
              </button>
            ) : (
              <div className="text-center text-xs text-slate-500 italic">Scan all 3 clues above</div>
            )}
          </div>
        </div>
      )}

      {/* 6. BRAND CITY: BRAND STRENGTH SPECTRUM LAB */}
      {brandSpectrumModal && (
        <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-400 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-400 flex items-center justify-center">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Brand Strength Lab: Pick the Strongest Brand!</h3>
                  <p className="text-xs text-slate-400">See why made-up words like CitroVibe™ beat plain words like "Juice" every time!</p>
                </div>
              </div>
              <button 
                onClick={() => setBrandSpectrumModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Abercrombie Tiers */}
            <div className="space-y-2">
              {[
                { id: 'generic', name: '"Juice"', tier: 'Common Word (0% Power)', confusion: 90, desc: 'Everyday common noun. Everyone needs this word to describe juice, so no one can own it!' },
                { id: 'descriptive', name: '"Sweet Citrus"', tier: 'Just Describing (Weak)', confusion: 55, desc: 'Just describes the taste. Very hard to protect against competitors.' },
                { id: 'suggestive', name: '"SunSqueeze"', tier: 'Clever Hint (Medium)', confusion: 25, desc: 'Hints at fresh fruit and sunshine in an imaginative way.' },
                { id: 'fanciful', name: '"CitroVibe™"', tier: 'Invented Word (100% Superhero Power)', confusion: 0, desc: 'A 100% brand new coined word Zero copycat confusion Maximum legal strength!' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    soundFx.playClick();
                    setBrandSelected(item.name);
                    setBrandTier(item.id);
                    setConfusionPercent(item.confusion);
                  }}
                  className={`w-full p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                    brandTier === item.id ? 'bg-emerald-950/60 border-emerald-400 text-white' : 'bg-slate-800/60 border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-amber-300">{item.name}</span>
                    <span className="text-[11px] font-mono">{item.tier}</span>
                  </div>
                  <div className="text-[11px] opacity-80 mt-1">{item.desc}</div>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                soundFx.playSuccess();
                realmStateRef.current.trademark.brandDesigned = true;
                setBrandSpectrumModal(false);
                setQuestObjective('Brand chosen Walk to Priya\'s storefront at (-10, -8) to install the new neon sign.');
                setQuestProgress({ current: 2, total: 5 });
                showToast(`✓ Selected superhero coined brand: ${brandSelected}!`);
              }}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
            >
              Choose CitroVibe™ & Install Store Sign
            </button>
          </div>
        </div>
      )}

      {/* 7. TRADE SECRET: BIOMETRIC KEYPAD & RBAC ACCESS CONTROL */}
      {vaultKeypadModal && (
        <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-rose-500 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">Formula Vault Biometric PIN</h3>
              </div>
              <button 
                onClick={() => setVaultKeypadModal(false)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
              <div className="text-[11px] text-slate-400 uppercase tracking-widest">Master Passcode [Hint: 9042]</div>
              <div className="text-2xl font-mono tracking-widest text-emerald-400 mt-1">
                {keypadInput.padEnd(4, '•')}
              </div>
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'ENT'].map(btn => (
                <button
                  key={btn}
                  onClick={() => {
                    soundFx.playClick();
                    if (btn === 'C') {
                      setKeypadInput('');
                    } else if (btn === 'ENT') {
                      if (keypadInput === '9042') {
                        soundFx.playSuccess();
                        realmStateRef.current.trade_secret.cabinetLocked = true;
                        setVaultKeypadModal(false);
                        showToast('✓ Confidential polymer formulas locked in biometric safe!');
                        checkVaultVulnerabilities();
                      } else {
                        soundFx.playAlarm();
                        showToast('❌ Incorrect PIN. Hint: 9042');
                      }
                    } else {
                      if (keypadInput.length < 4) setKeypadInput(prev => prev + btn);
                    }
                  }}
                  className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-sm border border-slate-700 cursor-pointer"
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 8. TRADE SECRET: FIREWALL AIR-GAP KILLSWITCH */}
      {firewallLockdownModal && (
        <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-red-500 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-500 flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-400">Cyber Hacker Intrusion Detected!</h3>
                <p className="text-xs text-slate-400">A sneaky hacker is trying to copy the lab's secret recipe formula!</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => { soundFx.playClick(); setFirewallNodes(n => ({ ...n, n1: true })); }}
                className={`w-full p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex justify-between ${
                  firewallNodes.n1 ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <span>Step 1: Cancel Hacker Login Access</span>
                <span>{firewallNodes.n1 ? '✓ Access Blocked' : 'Block Hacker'}</span>
              </button>

              <button
                onClick={() => { soundFx.playClick(); setFirewallNodes(n => ({ ...n, n2: true })); }}
                className={`w-full p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex justify-between ${
                  firewallNodes.n2 ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <span>Step 2: Password-Lock the Formula Drive</span>
                <span>{firewallNodes.n2 ? '✓ Drive Locked' : 'Lock Drive'}</span>
              </button>

              <button
                onClick={() => { soundFx.playClick(); setFirewallNodes(n => ({ ...n, n3: true })); }}
                className={`w-full p-3 rounded-xl border text-left text-xs transition-all cursor-pointer flex justify-between ${
                  firewallNodes.n3 ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <span>Step 3: Pull Emergency Disconnect Cable</span>
                <span>{firewallNodes.n3 ? '✓ Disconnected' : 'Pull Cable'}</span>
              </button>
            </div>

            {Object.values(firewallNodes).every(Boolean) ? (
              <button
                onClick={() => {
                  soundFx.playSuccess();
                  realmStateRef.current.trade_secret.intrusionRepelled = true;
                  setFirewallLockdownModal(false);
                  setQuestObjective('Hacker blocked Report to Chief Rajiv at (0, 10) to certify the master vault.');
                  setQuestProgress({ current: 4, total: 5 });
                  showToast('🛡️ Hacker blocked Secret formula is 100% safe.');
                }}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
              >
                Block Hacker & Lock Safe
              </button>
            ) : (
              <div className="text-center text-xs text-slate-500 italic">Complete all 3 defense steps above</div>
            )}
          </div>
        </div>
      )}

      {/* 9. PLAGIARISM: INTERACTIVE ESSAY REWRITE & CITATION WORKBENCH */}
      {plagiarismWorkbenchModal && (
        <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-cyan-400 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-400/20 text-cyan-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">School Essay Fixer: Learn to Paraphrase & Cite!</h3>
                  <p className="text-xs text-slate-400">Help Jordan rewrite copied parts in his own voice and cite Dr. Lin!</p>
                </div>
              </div>
              <button 
                onClick={() => setPlagiarismWorkbenchModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Similarity Meter */}
            <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
              <span className="text-xs text-slate-300 font-bold">Teacher Plagiarism Detector:</span>
              <span className={`text-base font-mono font-bold ${similarityScore <= 10 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {similarityScore}% {similarityScore <= 10 ? '✓ (Clean & Honest)' : '⚠️ (High Copied Text)'}
              </span>
            </div>

            {/* 3 Passages to Fix */}
            <div className="space-y-2.5 text-xs">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setFixedPassages(p => ({ ...p, p1: true }));
                  setSimilarityScore(48);
                }}
                className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  fixedPassages.p1 ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-bold mb-1">Passage 1: Copied sentence from Dr. Lin's introduction</div>
                <div className="text-[11px] opacity-80">
                  {fixedPassages.p1 ? '✓ Rewritten in Jordan\'s own words: "Coral reefs are suffering because ocean water is getting too hot."' : '❌ Tap to explain in your own words (Paraphrase)'}
                </div>
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setFixedPassages(p => ({ ...p, p2: true }));
                  setSimilarityScore(22);
                }}
                className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  fixedPassages.p2 ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-bold mb-1">Passage 2: Scientific coined term "Symbiodiniaceae expulsion"</div>
                <div className="text-[11px] opacity-80">
                  {fixedPassages.p2 ? '✓ Formatted with quotation marks: "...what marine biologists call \\"Symbiodiniaceae expulsion\\"..."' : '❌ Tap to put exact special words in quotation marks ("...")'}
                </div>
              </button>

              <button
                onClick={() => {
                  soundFx.playClick();
                  setFixedPassages(p => ({ ...p, p3: true }));
                  setSimilarityScore(4);
                }}
                className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  fixedPassages.p3 ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200' : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <div className="font-bold mb-1">Passage 3: Missing author credit for the book</div>
                <div className="text-[11px] opacity-80">
                  {fixedPassages.p3 ? '✓ Added author citation: (Lin, 2021) with full book name in the bibliography!' : '❌ Tap to add author citation: (Lin, 2021)'}
                </div>
              </button>
            </div>

            {Object.values(fixedPassages).every(Boolean) ? (
              <button
                onClick={() => {
                  soundFx.playSuccess();
                  realmStateRef.current.plagiarism.passagesRewritten = true;
                  realmStateRef.current.plagiarism.citationsAdded = true;
                  setPlagiarismWorkbenchModal(false);
                  setQuestObjective('Essay cleared (4% similarity) Walk to the Academic Integrity Beacon at (0, 10).');
                  setQuestProgress({ current: 4, total: 5 });
                  showToast('✓ Honest scholarship established Plagiarism dropped to 4%.');
                }}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
              >
                Save 100% Honest Essay (4% Similarity Score)
              </button>
            ) : (
              <div className="text-center text-xs text-slate-500 italic">Fix all 3 passages above to get below 10%</div>
            )}
          </div>
        </div>
      )}

      {/* 10. STUDENT INVENTOR BACKPACK & IP PASSPORT DRAWER */}
      {showBackpack && (
        <div className="absolute inset-0 z-40 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Guardian Field Kit & IP Passport</h3>
                  <p className="text-xs text-slate-400">Inventory tools, earned passport stamps, and concept summary</p>
                </div>
              </div>
              <button 
                onClick={() => setShowBackpack(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Passport Stamps */}
            <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
              {[
                { name: 'Patent', icon: '💡', active: stats.completedMissions.includes('patent') || realmStateRef.current.patent.claimsApproved },
                { name: 'Copyright', icon: '🎨', active: stats.completedMissions.includes('copyright') || realmStateRef.current.copyright.artworkFixed },
                { name: 'Trademark', icon: '™️', active: stats.completedMissions.includes('trademark') || realmStateRef.current.trademark.storefrontRenovated },
                { name: 'Trade Secret', icon: '🔐', active: stats.completedMissions.includes('trade_secret') || realmStateRef.current.trade_secret.intrusionRepelled },
                { name: 'Originality', icon: '📚', active: stats.completedMissions.includes('plagiarism') || realmStateRef.current.plagiarism.passagesRewritten }
              ].map(st => (
                <div key={st.name} className={`p-3 rounded-xl border ${st.active ? 'bg-amber-950/40 border-amber-400 text-amber-300' : 'bg-slate-800/40 border-slate-800 text-slate-600'}`}>
                  <div className="text-2xl mb-1">{st.icon}</div>
                  <div className="font-bold">{st.name}</div>
                  <div className="text-[9px] mt-0.5">{st.active ? 'STAMPED' : 'LOCKED'}</div>
                </div>
              ))}
            </div>

            {/* Inventor Tools Equipped */}
            <div className="space-y-2 bg-slate-800/60 p-4 rounded-xl border border-slate-700 text-xs">
              <div className="font-bold text-white">Equipped Inventor Tools:</div>
              <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px]">
                <div>• Optical Diagnostic Multi-Tool Scanner</div>
                <div>• Capacitive Soil Moisture Telemetry Probe</div>
                <div>• High-Candela Directional Flashlight (F)</div>
                <div>• Cryptographic Fixation Timestamp Seal</div>
                <div>• Abercrombie Trademark Spectrum Analyzer</div>
                <div>• Turnitin-Compatible Scholarly Comparator</div>
              </div>
            </div>

            {/* Quick 5 Concept Comparison Card */}
            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-400">Easy Concept Reference Guide:</span>
                <button
                  onClick={() => {
                    setShowBackpack(false);
                    setShowEasyPointsModal(true);
                  }}
                  className="text-[11px] font-bold text-amber-300 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Open Full 5-Topic Master Guide</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="grid grid-cols-5 gap-1.5 text-[10px] text-center text-slate-400">
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <strong className="text-amber-400 block">Patent</strong>
                  <span>How things work (20 yrs)</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <strong className="text-indigo-400 block">Copyright</strong>
                  <span>Creative art (Life+70y)</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <strong className="text-emerald-400 block">Trademark</strong>
                  <span>Brand logos & names (Forever)</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <strong className="text-rose-400 block">Trade Secret</strong>
                  <span>Secret recipes & formulas</span>
                </div>
                <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                  <strong className="text-cyan-400 block">Plagiarism</strong>
                  <span>Ethical honesty & citation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* In-Game NPC Dialogue Modal with Student Choice System */}
      {dialogueModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in pointer-events-auto">
          <div role="dialog" aria-modal="true" aria-labelledby="npc-dialogue-title" className="bg-slate-900 border-2 border-amber-400/80 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-13 h-13 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-3xl shadow-inner shrink-0">
                  {dialogueModal.avatar}
                </div>
                <div>
                  <h3 id="npc-dialogue-title" className="font-bold text-white text-base leading-tight">{dialogueModal.speaker}</h3>
                  <span className="text-xs text-amber-400 font-semibold">{dialogueModal.title}</span>
                </div>
              </div>

              {/* Student Inventor (You) Clear Face Avatar Display */}
              <div className="flex items-center gap-2 pl-3 border-l border-slate-800 shrink-0">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-white">Student Inventor</div>
                  <div className="text-[10px] text-amber-400 font-medium">Clear Face Active</div>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-b from-sky-400 to-indigo-600 border-2 border-amber-400 overflow-hidden p-0.5 shadow-md shrink-0">
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
              </div>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {dialogueModal.text}
            </p>

            {/* Interactive Dialogue Choices */}
            {dialogueModal.choices && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Choose your response:</div>
                {dialogueModal.choices.map((c, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      soundFx.playClick();
                      if (c.onPick) c.onPick();
                      setDialogueModal(prev => prev ? {
                        ...prev,
                        text: c.response, choices: null,
                        actionLabel: 'Proceed',
                        onAction: () => setDialogueModal(null)
                      } : null);
                    }}
                    className="w-full p-3 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-amber-400 text-left text-xs font-medium text-slate-200 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { soundFx.playClick(); setDialogueModal(null); }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
              {dialogueModal.actionLabel && dialogueModal.onAction && (
                <button
                  onClick={dialogueModal.onAction}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-lg shadow-amber-400/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{dialogueModal.actionLabel}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mission Complete Celebration Overlay with Official IP Quest Badge */}
      {missionCompleteCelebration && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-blue-950/85 backdrop-blur-md animate-fade-in pointer-events-auto">
          <div className="bg-gradient-to-b from-[#183d94] via-[#102766] to-[#0c1c48] border-4 border-amber-400 rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl shadow-blue-950/80">
            <div className="flex justify-center">
              <IPQuestBadge size={88} className="shadow-2xl animate-bounce" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-amber-300 block drop-shadow-sm">
                3D Realm Mastery Achieved
              </span>
              <h2 className="text-2xl font-black text-white mt-1 drop-shadow-md">
                {currentConcept.toUpperCase().replace('_', ' ')} MISSION COMPLETE
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-sky-100 leading-relaxed font-semibold">
              You mastered the scenario through real-time 3D exploration and practical engineering actions +250 XP, 🪙 ₹60 coins, and 3 Stars awarded to your profile.
            </p>
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={() => {
                  soundFx.playClick();
                  setMissionCompleteCelebration(false);
                  setQuizModalConcept(currentConcept);
                  setShowQuizModal(true);
                }}
                className="w-full py-3.5 rounded-2xl text-xs font-black bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 hover:from-yellow-200 hover:to-amber-300 text-slate-950 shadow-xl shadow-amber-400/40 cursor-pointer flex items-center justify-center gap-2 border-2 border-yellow-100 hover:scale-105 transition-all"
              >
                <Trophy className="w-4 h-4 text-slate-950" />
                <span>Attend {currentConcept.toUpperCase().replace('_', ' ')} Certification Quiz ➔</span>
              </button>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setMissionCompleteCelebration(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-blue-950 hover:bg-blue-900 text-sky-200 border-2 border-sky-400/50 cursor-pointer"
                >
                  Keep Exploring 3D
                </button>
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setMissionCompleteCelebration(false);
                    const realmOrder= ['patent', 'copyright', 'trademark', 'trade_secret', 'plagiarism'];
                    const nextIdx = (realmOrder.indexOf(currentConcept) + 1) % realmOrder.length;
                    switchRealm(realmOrder[nextIdx]);
                  }}
                  className="flex-1 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 cursor-pointer shadow-md border border-emerald-100"
                >
                  Explore Next Game ➔
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Module Quizzes Modal with Continuous Next-Quiz Chain */}
      <ModuleQuizModal
        isOpen={showQuizModal}
        initialConcept={quizModalConcept}
        onClose={() => setShowQuizModal(false)}
        onCompleteQuiz={(c, score, total, xp) => {
          onCompleteMission(xp, 30, 1, c);
        }}
        onJumpToRealm={(c) => {
          switchRealm(c);
        }}
      />

      {/* Toast Notification */}
      {notification && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 px-5 py-2.5 rounded-xl bg-slate-900/95 border border-emerald-500/80 text-emerald-300 text-xs font-bold shadow-2xl backdrop-blur-md animate-fade-in pointer-events-none flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}
    </div>
  );
};
