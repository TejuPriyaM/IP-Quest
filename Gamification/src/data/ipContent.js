
export const IP_COLLECTIBLE_CARDS= [
  {
    id: 'card_patent',
    concept: 'patent',
    title: 'Patent Shield',
    subtitle: 'Protects New Inventions & How Things Work',
    icon: 'Lightbulb',
    color: 'from-amber-500 to-orange-600',
    badge: 'Patent Pioneer',
    layer1Definition: 'A patent gives an inventor the exclusive right to make, use, and sell a brand new machine, tool, or technical process for 20 years.',
    layer2Example: 'If you invent a foldable solar bicycle motor with a special gear system, a patent stops others from copying your working mechanism.',
    layer3DeepDive: 'Ideas alone in your head cannot be patented until they are built into a real working machine To get a patent, the invention must be: 1. Brand New (never shown before), 2. Not Obvious (creative trick), and 3. Useful (solves a real problem).',
    unlocked: true,
    funFact: 'The first patent ever granted was in 1421 in Italy to an architect who invented a special water crane to carry heavy marble stones!'
  },
  {
    id: 'card_copyright',
    concept: 'copyright',
    title: 'Copyright Quill',
    subtitle: 'Protects Creative Art, Music & Stories',
    icon: 'Feather',
    color: 'from-indigo-500 to-purple-600',
    badge: 'Creative Author',
    layer1Definition: 'Copyright automatically protects your original creative works (drawings, comic books, songs, videos, and game code) the very second you make them!',
    layer2Example: 'When you draw an original superhero comic or record a song on your phone, you instantly own the copyright. Nobody can print or sell it without your permission!',
    layer3DeepDive: 'Copyright protects the way an idea is expressed, NOT the general idea itself For example, anyone can write a story about magic wizards, but nobody can copy the exact characters or words from Harry Potter. Also: saying "credits to the artist" does NOT give you permission to sell their art!',
    unlocked: false,
    funFact: 'In most countries, your copyright lasts for your entire lifetime PLUS 70 extra years after you pass away!'
  },
  {
    id: 'card_trademark',
    concept: 'trademark',
    title: 'Trademark Crest',
    subtitle: 'Protects Brand Names & Logos',
    icon: 'ShieldCheck',
    color: 'from-emerald-500 to-teal-600',
    badge: 'Brand Guardian',
    layer1Definition: 'A trademark is a special brand name, logo, or slogan that tells shoppers who made the product so they never get tricked by copycats.',
    layer2Example: 'The Nike Swoosh logo and the name "Apple" on computers help you instantly recognize authentic products on store shelves.',
    layer3DeepDive: 'Trademarks prevent customer confusion. Made-up invented words (like "Kodak" or "CitroVibe™") have the strongest legal power Common dictionary words (like "Water" or "Fresh") cannot be owned by one company for general items.',
    unlocked: false,
    funFact: 'Trademarks can last forever As long as the company keeps using the logo in their business and renews it every 10 years, it never expires!'
  },
  {
    id: 'card_trade_secret',
    concept: 'trade_secret',
    title: 'Secret Vault Lock',
    subtitle: 'Protects Secret Recipes & Formulas',
    icon: 'Lock',
    color: 'from-rose-500 to-pink-600',
    badge: 'Secret Keeper',
    layer1Definition: 'A trade secret is valuable business knowledge (like a secret recipe or special code) that stays protected because it is kept strictly hidden!',
    layer2Example: 'The world-famous Coca-Cola soda recipe or KFC 11 herbs and spices formula, locked in high-security bank vaults with secret passwords.',
    layer3DeepDive: 'Unlike patents where you publish your blueprints openly to the world, trade secrets stay hidden. You MUST keep it locked with passwords, safes, and promises (NDAs). If you post it online or leave it on a cafeteria table, you lose legal protection forever!',
    unlocked: false,
    funFact: 'The formula for WD-40 spray has never been patented; it has stayed a locked trade secret in a bank vault since 1953!'
  },
  {
    id: 'card_plagiarism',
    concept: 'plagiarism',
    title: 'Originality Beacon',
    subtitle: 'Academic Honesty & Giving Credit',
    icon: 'GraduationCap',
    color: 'from-cyan-500 to-blue-600',
    badge: 'Honesty Champion',
    layer1Definition: 'Plagiarism is copying someone else’s words, research, or ideas and pretending you wrote them yourself without giving proper credit.',
    layer2Example: 'Copying two paragraphs from Wikipedia into your school science report without quotation marks or naming the author.',
    layer3DeepDive: 'Plagiarism is an honesty rule in school and writing (which can get you an F or detention). To avoid it, follow the 3 Golden Rules: 1. Put it in your own words (Paraphrase), 2. Put exact copied words in quotation marks ("..."), and 3. Always name the source (Author & Year)!',
    unlocked: false,
    funFact: 'The word "plagiarism" comes from an ancient Latin word that meant "kidnapper" In school writing, it means kidnapping someone else’s words!'
  }
];

export const STORY_CHAPTERS= [
  {
    id: 'ch1',
    chapterNumber: 1,
    title: 'The Missing Invention',
    region: 'patent',
    villain: 'Gear-Grifter',
    premise: 'Farmer Ramesh and Professor Nova built a smart solar irrigation prototype, but sneaky Gear-Grifter wants to copy the machine parts before they file a patent!',
    objective: 'Collect the 3 machine parts, assemble the working proto the workbench, test the water valve, and get official patent protection.',
    completed: false,
    rewardXP: 100,
    rewardBadge: 'Patent Pioneer'
  },
  {
    id: 'ch2',
    chapterNumber: 2,
    title: 'The Stolen Artwork',
    region: 'copyright',
    villain: 'Sample-Snatcher',
    premise: 'Artist Luna drew an amazing "Solar Lynx" digital poster, but a festival promoter copied her artwork onto concert billboards without asking or paying royalties!',
    objective: 'Save the artwork on the digital easel, scan the unauthorized festival billboard, and teach the promoter that credit is not a free pass to sell art.',
    completed: false,
    rewardXP: 100,
    rewardBadge: 'Creative Author'
  },
  {
    id: 'ch3',
    chapterNumber: 3,
    title: 'The Confusing Copycat Shop',
    region: 'trademark',
    villain: 'CopyCat Drinks',
    premise: 'Shoppers on Market Street are confused A copycat stall is selling sour juice using a name almost identical to Priya’s famous juice bar.',
    objective: 'Invent a 100% unique coined brand name ("CitroVibe™"), install the glowing storefront marquee, and register the official trademark.',
    completed: false,
    rewardXP: 100,
    rewardBadge: 'Brand Guardian'
  },
  {
    id: 'ch4',
    chapterNumber: 4,
    title: 'The Secret Vault Break-In',
    region: 'trade_secret',
    villain: 'Data-Drifter',
    premise: 'A sneaky cyber spy is trying to hack into the laboratory server to steal the top-secret eco-energy drink formula!',
    objective: 'Lock the formula in the biometric safe with code 9042, set auto-lock on the computer, and pull the emergency killswitch to block the hack.',
    completed: false,
    rewardXP: 100,
    rewardBadge: 'Secret Keeper'
  },
  {
    id: 'ch5',
    chapterNumber: 5,
    title: 'The Mystery School Essay',
    region: 'plagiarism',
    villain: 'Echo-Author',
    premise: 'Student Jordan’s science fair project was flagged for 78% copied text because sentences were copied straight from Dr. Lin’s research paper!',
    objective: 'Find the original book in the library, rewrite the 3 passages in Jordan’s own words, add quotation marks and author citations, and fire the Integrity Beacon.',
    completed: false,
    rewardXP: 100,
    rewardBadge: 'Honesty Champion'
  },
  {
    id: 'ch6',
    chapterNumber: 6,
    title: 'The Grand IP Finale: Super Shield',
    region: 'all',
    villain: 'The Copy Cats Syndicate',
    premise: 'The ultimate test A young student startup is launching a solar eco-scooter. The syndicate attacks all 5 fronts at once!',
    objective: 'Defend the scooter motor with a Patent, the logo with a Trademark, the app with Copyright, the battery formula with a Trade Secret, and cite your sources!',
    completed: false,
    rewardXP: 250,
    rewardBadge: 'Master IP Guardian'
  }
];

export const LOCKER_ITEMS= [
  {
    id: 'item_1',
    name: 'Smart Ocean Trash-Scooping Robot',
    icon: 'Cpu',
    description: 'A physical floating robot with self-cleaning spinning blades that scoop plastic out of rivers and lakes.',
    correctConcept: 'patent',
    explanation: 'Working physical machines and engineering tools that solve real problems are protected by Patents (for 20 years)!',
    hint: 'Is this an artistic drawing or a physical working machine?'
  },
  {
    id: 'item_2',
    name: 'Superhero Comic Book & Original Drawings',
    icon: 'BookOpen',
    description: 'A 40-page hand-drawn comic book with original characters, storyline, and artwork created by high school students.',
    correctConcept: 'copyright',
    explanation: 'Original creative art, drawings, and stories are automatically protected by Copyright the moment you create them!',
    hint: 'This is creative artistic storytelling and drawing.'
  },
  {
    id: 'item_3',
    name: '"VoltStride" Lightning Bolt Shoe Logo',
    icon: 'Tag',
    description: 'A bright lightning logo and brand name stamped on sneakers so shoppers know the official maker.',
    correctConcept: 'trademark',
    explanation: 'Brand names, symbols, and logos are Trademarks. They stop copycats from confusing shoppers in stores!',
    hint: 'Shoppers look at this on the box to know who made the sneaker.'
  },
  {
    id: 'item_4',
    name: 'Top-Secret 11-Spice Crispy Fry Recipe',
    icon: 'FileLock',
    description: 'A famous restaurant recipe locked in a heavy steel safe, known by only 2 head chefs who signed secrecy promises.',
    correctConcept: 'trade_secret',
    explanation: 'Secret recipes and formulas kept strictly locked and private are protected as Trade Secrets!',
    hint: 'This secret recipe is never published or registered publicly.'
  },
  {
    id: 'item_5',
    name: 'Copied History Essay with No Author Credit',
    icon: 'FileText',
    description: 'A student copied two paragraphs word-for-word from an online encyclopedia and submitted it as their own school homework.',
    correctConcept: 'plagiarism',
    explanation: 'Copying someone else’s writing or ideas without quotes or author credit is Plagiarism (an honesty rule in school)!',
    hint: 'This is copying someone else’s school writing without giving them credit.'
  },
  {
    id: 'item_6',
    name: 'Magnetic Anti-Gravity Roller Coaster Brake',
    icon: 'Wrench',
    description: 'A newly engineered physical apparatus that uses magnets to stop speeding roller coasters smoothly.',
    correctConcept: 'patent',
    explanation: 'Physical mechanical devices and engineered hardware fall under Patent protection!',
    hint: 'Think about physical machines and engineering technology.'
  },
  {
    id: 'item_7',
    name: '"PureGlow" Organic Soap Brand Slogan',
    icon: 'Sparkles',
    description: 'The catchy advertising slogan: "Cleanse the Earth, Glow with Care™" printed on retail soap boxes.',
    correctConcept: 'trademark',
    explanation: 'Catchy marketing slogans and brand names tied to commercial products are protected as Trademarks!',
    hint: 'It identifies the commercial brand in store advertisements.'
  },
  {
    id: 'item_8',
    name: 'Confidential Video Game Matchmaking Code',
    icon: 'ShieldAlert',
    description: 'A game studio’s top-secret player ranking code, stored in encrypted internal servers with password protection.',
    correctConcept: 'trade_secret',
    explanation: 'Valuable software formulas kept secret inside the company to stay ahead of competitors are Trade Secrets!',
    hint: 'Kept private and password-locked to give the business a competitive advantage.'
  }
];

export const DAILY_CHALLENGES= [
  {
    id: 'daily_1',
    dateStr: '2026-10-10',
    title: 'The Homework Mystery',
    scenario: 'Alex copied three paragraphs from an online encyclopedia, swapped two words with synonyms, and submitted it for his history homework without naming the source or author.',
    question: 'What issue did Alex commit in this school assignment?',
    options: [
      {
        id: 'opt_1',
        text: 'Patent Infringement',
        concept: 'patent',
        isCorrect: false,
        explanation: 'Patents protect mechanical machines and tools, not written history homework essays.'
      },
      {
        id: 'opt_2',
        text: 'Plagiarism',
        concept: 'plagiarism',
        isCorrect: true,
        explanation: 'Correct Copying another person’s writing without quotation marks and citation is plagiarism.'
      },
      {
        id: 'opt_3',
        text: 'Trademark Infringement',
        concept: 'trademark',
        isCorrect: false,
        explanation: 'Trademarks protect commercial brand names and logos in stores.'
      },
      {
        id: 'opt_4',
        text: 'Trade Secret Leak',
        concept: 'trade_secret',
        isCorrect: false,
        explanation: 'The encyclopedia article was public on the internet, not confidential secret information.'
      }
    ],
    xpReward: 35
  },
  {
    id: 'daily_2',
    dateStr: '2026-10-11',
    title: 'The Copycat Soda Can',
    scenario: 'A new soda company bottles a fizzy drink and calls it "Koka-Kooler" with a wavy white script logo on a bright red can, looking almost identical to Coca-Cola.',
    question: 'Which intellectual property is being violated here?',
    options: [
      {
        id: 'opt_a',
        text: 'Patent',
        concept: 'patent',
        isCorrect: false,
        explanation: 'Patents protect mechanical or chemical inventions, not brand appearance.'
      },
      {
        id: 'opt_b',
        text: 'Trademark',
        concept: 'trademark',
        isCorrect: true,
        explanation: 'Spot on Trademarks protect brand names, logos, and packaging appearance so shoppers are not confused!'
      },
      {
        id: 'opt_c',
        text: 'Trade Secret',
        concept: 'trade_secret',
        isCorrect: false,
        explanation: 'The name and can design are displayed in public stores, not locked in a secret safe.'
      },
      {
        id: 'opt_d',
        text: 'Plagiarism',
        concept: 'plagiarism',
        isCorrect: false,
        explanation: 'Plagiarism is an academic honesty rule for school writing, not commercial store branding.'
      }
    ],
    xpReward: 35
  }
];

export const DETECTIVE_CASES= [
  {
    id: 'case_smart_bottle',
    title: 'Case 01: HydroNova Smart Water Bottle',
    companyName: 'AquaPulse Labs',
    productName: 'HydroNova 3000',
    storyLead: 'High school students invented an eco water bottle that cleans itself, tracks water drinking, and syncs to a phone app. Match each part with the right protection before launch!',
    clues: [
      {
        id: 'clue_mechanism',
        label: 'Self-Spinning UV Water-Cleaning Filter',
        description: 'A physical mechanical filter inside the cap that cleans water using spinning water pressure.',
        correctConcept: 'patent',
        explanation: 'A working physical machine mechanism that solves a problem is protected by a Patent (for 20 years)!',
        hint: 'Is this a logo, a song, or a working physical machine?'
      },
      {
        id: 'clue_brand',
        label: '"AquaPulse" Brand Name & Wave Logo',
        description: 'The cool wave logo and brand name stamped on the bottle so shoppers know who made it.',
        correctConcept: 'trademark',
        explanation: 'Brand names and logos are Trademarks so shoppers can easily identify the real maker.',
        hint: 'Shoppers look at this on the shelf to recognize the authentic brand.'
      },
      {
        id: 'clue_promo',
        label: 'Animated Cartoon Commercial & Original Song',
        description: 'A 2-minute original animated cartoon story and music track created for YouTube.',
        correctConcept: 'copyright',
        explanation: 'Original creative artwork, animations, and recorded songs are protected by Copyright!',
        hint: 'Creative artistic expression in music and video.'
      },
      {
        id: 'clue_formula',
        label: 'Secret Mineral Filter Recipe',
        description: 'The exact secret recipe of natural minerals baked inside the filter, locked in a digital safe.',
        correctConcept: 'trade_secret',
        explanation: 'Secret recipes and formulas kept strictly locked and private are Trade Secrets!',
        hint: 'A secret formula kept locked up and never revealed.'
      },
      {
        id: 'clue_paper',
        label: 'Science Poster with Copied Medical Sentences',
        description: 'The students pasted three sentences from a university science paper without putting quotes or naming the doctor.',
        correctConcept: 'plagiarism',
        explanation: 'Copying someone else’s research without quotation marks and author credit is Plagiarism.',
        hint: 'School honesty rule: using another person’s writing without giving them credit.'
      }
    ]
  },
  {
    id: 'case_eco_drone',
    title: 'Case 02: AeroSeed Tree-Planting Drone',
    companyName: 'SkyForest Tech',
    productName: 'AeroSeed X1',
    storyLead: 'A student robotics club built a flying drone that plants seeds in burned forests. Help them sort out their intellectual property!',
    clues: [
      {
        id: 'clue_drone_mech',
        label: 'Seed-Shooting Spring Valve Mechanism',
        description: 'A newly engineered mechanical valve that shoots seed pods safely into soil from the air.',
        correctConcept: 'patent',
        explanation: 'An engineered physical tool and mechanical device is protected by a Patent!',
        hint: 'Physical machine parts and mechanism.'
      },
      {
        id: 'clue_drone_mark',
        label: '"SkyForest" Brand Name & Green Leaf Logo',
        description: 'The registered brand name and leaf emblem printed on the drone wings and box.',
        correctConcept: 'trademark',
        explanation: 'Names and logos that identify who made the product are Trademarks!',
        hint: 'Tells customers who built the drone.'
      },
      {
        id: 'clue_drone_app',
        label: 'Drone Pilot Mobile App Code & Screen Art',
        description: 'The original computer code and custom digital graphics created for the tablet controller app.',
        correctConcept: 'copyright',
        explanation: 'Original software code and digital artwork are protected by Copyright!',
        hint: 'Creative computer code and visual drawings.'
      },
      {
        id: 'clue_drone_soil_data',
        label: 'Secret Seed-Growing Nutrient Gel Formula',
        description: 'A secret organic gel formula that keeps seeds moist in heat, locked in a password safe.',
        correctConcept: 'trade_secret',
        explanation: 'Valuable formulas kept secret to protect the business are Trade Secrets!',
        hint: 'A secret formula not disclosed to the public.'
      },
      {
        id: 'clue_drone_report',
        label: 'Grant Paper Using Teacher’s Satellite Map with No Credit',
        description: 'The team copied a professor’s satellite fire map into their funding paper without asking or citing.',
        correctConcept: 'plagiarism',
        explanation: 'Using another person’s work or map without citation is Plagiarism.',
        hint: 'Failing to credit the author who made the map.'
      }
    ]
  }
];
