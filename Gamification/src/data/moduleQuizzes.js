

export const MODULE_QUIZZES= {
  patent: {
    concept: 'patent',
    title: 'Patent Lab Student Quiz',
    topicName: 'Patents & Inventions',
    subtitle: 'Learn how brand-new machines and gadgets get 20 years of protection!',
    badge: '💡 Inventions & Machines',
    color: 'amber',
    borderColor: 'border-amber-500',
    bgGradient: 'from-amber-500/20 to-orange-500/20',
    nextQuizConcept: 'copyright',
    nextQuizTitle: 'Creator Studio: Copyright Student Quiz',
    questions: [
      {
        id: 'pat_q1',
        question: 'What are the 3 golden rules for an invention to get a patent?',
        scenario: 'A student builds a smart sensor that automatically turns off water taps when a bucket is full.',
        options: [
          {
            id: 'p1_a',
            text: '1. Brand New in the world, 2. A creative trick (not obvious), 3. A real working machine',
            isCorrect: true,
            explanation: 'Awesome To get a patent, an invention must be completely new, clever (not an obvious tweak), and actually work in real life!'
          },
          {
            id: 'p1_b',
            text: 'It must have a catchy brand name, a cute mascot, and a high price tag',
            isCorrect: false,
            explanation: 'Not quite Brand names and mascots belong to Trademarks, not Patents.'
          },
          {
            id: 'p1_c',
            text: 'It must be an artistic drawing with lots of bright colors',
            isCorrect: false,
            explanation: 'Drawings and art are protected by Copyright, not Patents.'
          },
          {
            id: 'p1_d',
            text: 'It must be kept a 100% secret forever and never shown to anyone',
            isCorrect: false,
            explanation: 'That describes a Trade Secret Patents require you to share blueprints with the public.'
          }
        ]
      },
      {
        id: 'pat_q2',
        question: 'Can you get a patent for just an idea inside your head?',
        scenario: 'Maya says: "I have an idea for a flying car, but I have not drawn blueprints or built any machine parts yet."',
        options: [
          {
            id: 'p2_a',
            text: 'No An idea alone cannot be patented until you design and build a real working machine',
            isCorrect: true,
            explanation: 'Correct Ideas alone are not patentable. You must describe or build a concrete, working machine or process.'
          },
          {
            id: 'p2_b',
            text: 'Yes Any cool thought you have can be patented right away.',
            isCorrect: false,
            explanation: 'No, daydreaming or pure ideas cannot be patented. You have to explain how to actually build it.'
          },
          {
            id: 'p2_c',
            text: 'Yes, but only if you write your idea down in a school notebook.',
            isCorrect: false,
            explanation: 'Writing an idea in a notebook does not make it a patentable machine.'
          },
          {
            id: 'p2_d',
            text: 'Only scientists over 40 years old can get patents.',
            isCorrect: false,
            explanation: 'Anyone of any age (even kids and students) can get a patent if they invent a new working device!'
          }
        ]
      },
      {
        id: 'pat_q3',
        question: 'How long does a patent protect an invention?',
        scenario: 'A high school robotics club invents a new solar trash-picker robot and gets a patent granted in 2026.',
        options: [
          {
            id: 'p3_a',
            text: '20 years from the official filing date',
            isCorrect: true,
            explanation: 'Spot on A patent gives the inventor 20 years of exclusive rights. After that, anyone can build it to help the world!'
          },
          {
            id: 'p3_b',
            text: 'Forever, until the end of time',
            isCorrect: false,
            explanation: 'Nope Only Trademarks and Trade Secrets can last forever. Patents expire after 20 years.'
          },
          {
            id: 'p3_c',
            text: 'Your whole lifetime plus 70 years',
            isCorrect: false,
            explanation: 'That is the rule for Copyright on art and music, not Patents!'
          },
          {
            id: 'p3_d',
            text: 'Exactly 1 school term (6 months)',
            isCorrect: false,
            explanation: 'Patents give you 20 years to produce and sell your invention!'
          }
        ]
      },
      {
        id: 'pat_q4',
        question: 'What is the "patent deal" between the inventor and the world?',
        scenario: 'In exchange for getting 20 years where nobody can copy your machine, what must you do?',
        options: [
          {
            id: 'p4_a',
            text: 'Share the clear instructions and blueprints publicly so other inventors can learn from it',
            isCorrect: true,
            explanation: 'Exactly right Society gives you 20 years of protection, and in return, you publish the blueprints so human science moves forward.'
          },
          {
            id: 'p4_b',
            text: 'Lock the machine in a steel bank vault and hide the key',
            isCorrect: false,
            explanation: 'That is what you do with a Trade Secret, not a Patent!'
          },
          {
            id: 'p4_c',
            text: 'Give away the machines for free to all your classmates',
            isCorrect: false,
            explanation: 'You are allowed to sell your patented invention to make money!'
          },
          {
            id: 'p4_d',
            text: 'Change the invention every year or you lose it',
            isCorrect: false,
            explanation: 'The patent protects your specific invention design for the full 20 years.'
          }
        ]
      }
    ]
  },
  copyright: {
    concept: 'copyright',
    title: 'Creator Studio Student Quiz',
    topicName: 'Copyright & Creative Art',
    subtitle: 'Learn how your drawings, comic books, songs, and games are protected!',
    badge: '🎨 Drawings, Songs & Stories',
    color: 'purple',
    borderColor: 'border-purple-500',
    bgGradient: 'from-purple-500/20 to-indigo-500/20',
    nextQuizConcept: 'trademark',
    nextQuizTitle: 'Brand City: Trademark Student Quiz',
    questions: [
      {
        id: 'cpr_q1',
        question: 'When does copyright protection start for your original drawing or song?',
        scenario: 'An art student finishes drawing a digital superhero comic on their tablet at night.',
        options: [
          {
            id: 'c1_a',
            text: 'The exact second you draw, write, record, or save your creation!',
            isCorrect: true,
            explanation: 'Bingo Copyright is automatic The second your original art is drawn on paper or saved on a screen, you own the copyright.'
          },
          {
            id: 'c1_b',
            text: 'Only after you pay $500 to a government lawyer',
            isCorrect: false,
            explanation: 'Copyright is free and automatic the moment you create your work No fee is required.'
          },
          {
            id: 'c1_c',
            text: 'Only when you get 1,000 likes on social media',
            isCorrect: false,
            explanation: 'Popularity does not matter. Even a drawing in your private sketchbook is protected!'
          },
          {
            id: 'c1_d',
            text: 'Only after an art teacher rates it an A+',
            isCorrect: false,
            explanation: 'Copyright protects all original creative works, regardless of grades or ratings!'
          }
        ]
      },
      {
        id: 'cpr_q2',
        question: 'Does copyright protect general story ideas, or your specific expression?',
        scenario: 'Author Sarah writes a novel about a young wizard who attends a magic school.',
        options: [
          {
            id: 'c2_a',
            text: 'It protects Sarah’s specific words and drawings, NOT the general idea of magic schools',
            isCorrect: true,
            explanation: 'Yes Anyone can write a story about magic schools, but nobody can copy Sarah’s exact words or specific Harry Potter characters!'
          },
          {
            id: 'c2_b',
            text: 'Sarah now owns all stories about magic schools forever, and nobody else can write one.',
            isCorrect: false,
            explanation: 'No one can own a general idea Anyone is free to create their own wizard adventure.'
          },
          {
            id: 'c2_c',
            text: 'Anyone can copy Sarah’s exact paragraphs as long as they change the character’s name.',
            isCorrect: false,
            explanation: 'Copying someone’s exact creative sentences is copyright infringement!'
          },
          {
            id: 'c2_d',
            text: 'Copyright only protects cartoon video games, not books.',
            isCorrect: false,
            explanation: 'Copyright protects books, music, paintings, videos, computer code, and games!'
          }
        ]
      },
      {
        id: 'cpr_q3',
        question: 'Does saying "Credit to the artist" let you print and sell festival t-shirts?',
        scenario: 'A club promoter prints 500 festival t-shirts using Luna’s "Solar Lynx" drawing and writes "Art by Luna" at the bottom.',
        options: [
          {
            id: 'c3_a',
            text: 'No Giving credit is NOT a license. You must get Luna’s permission and pay her royalties!',
            isCorrect: true,
            explanation: 'Crucial lesson Tagging an artist or saying "credit to owner" does NOT give you the right to copy or sell their work without permission!'
          },
          {
            id: 'c3_b',
            text: 'Yes, as long as you tag her on Instagram it is completely legal.',
            isCorrect: false,
            explanation: 'False Social media tagging does not replace legal permission or licensing fees.'
          },
          {
            id: 'c3_c',
            text: 'Yes, because anyone can print anything found on Google Images.',
            isCorrect: false,
            explanation: 'Google Images is a search engine, not a free store Most images are protected by copyright.'
          },
          {
            id: 'c3_d',
            text: 'Only if the t-shirts are sold at a school fair.',
            isCorrect: false,
            explanation: 'Selling another person\'s artwork commercially without permission is copyright infringement.'
          }
        ]
      },
      {
        id: 'cpr_q4',
        question: 'How long does copyright usually last for an individual artist?',
        scenario: 'A music student writes and records an original acoustic song in 2026.',
        options: [
          {
            id: 'c4_a',
            text: 'The creator’s entire lifetime plus 70 years after they pass away',
            isCorrect: true,
            explanation: 'That’s right In most countries, copyright lasts for the creator’s whole life plus 70 extra years so their family benefits!'
          },
          {
            id: 'c4_b',
            text: 'Only 20 years, just like a patent',
            isCorrect: false,
            explanation: 'Patents last 20 years, but Copyright lasts for your whole lifetime plus 70 years!'
          },
          {
            id: 'c4_c',
            text: 'Exactly 30 days after posting online',
            isCorrect: false,
            explanation: 'Copyright lasts for generations, not just 30 days!'
          },
          {
            id: 'c4_d',
            text: 'It expires as soon as you graduate school',
            isCorrect: false,
            explanation: 'Works you make in school remain protected for your entire life plus 70 years!'
          }
        ]
      }
    ]
  },
  trademark: {
    concept: 'trademark',
    title: 'Brand City Student Quiz',
    topicName: 'Trademarks & Brand Identity',
    subtitle: 'Learn how brand names, cool logos, and slogans stop copycat confusion!',
    badge: '🏷️ Brand Names & Logos',
    color: 'emerald',
    borderColor: 'border-emerald-500',
    bgGradient: 'from-emerald-500/20 to-teal-500/20',
    nextQuizConcept: 'trade_secret',
    nextQuizTitle: 'Secret Vault: Trade Secret Student Quiz',
    questions: [
      {
        id: 'tm_q1',
        question: 'What is the main superpower of a trademark?',
        scenario: 'A sports shoe brand stamps a distinctive swoosh logo on the side of their sneakers.',
        options: [
          {
            id: 't1_a',
            text: 'To show shoppers who made the item so they never get tricked by fake copycats',
            isCorrect: true,
            explanation: 'Spot on Trademarks protect shoppers from being fooled and protect brands by proving who made the product.'
          },
          {
            id: 't1_b',
            text: 'To stop other people from tying their shoes with laces',
            isCorrect: false,
            explanation: 'Mechanical functions are protected by Patents, not Trademarks!'
          },
          {
            id: 't1_c',
            text: 'To hide the rubber shoe recipe inside a locked safe',
            isCorrect: false,
            explanation: 'Keeping recipes secret is a Trade Secret!'
          },
          {
            id: 't1_d',
            text: 'To own the everyday dictionary word "Sneakers" so nobody else can say it',
            isCorrect: false,
            explanation: 'Common everyday words like "Sneakers" can never be owned by one company.'
          }
        ]
      },
      {
        id: 'tm_q2',
        question: 'Which brand name has the STRONGEST legal superpower?',
        scenario: 'Priya is choosing a name for her juice bar: "Juice", "Fresh Juice", or "CitroVibe™".',
        options: [
          {
            id: 't2_a',
            text: 'Invented, made-up coined words like "CitroVibe™" or "Kodak"',
            isCorrect: true,
            explanation: 'Exactly Made-up invented words (coined words) have 100% superhero legal strength because nobody else needs that word to describe their juice!'
          },
          {
            id: 't2_b',
            text: 'Everyday common words like calling a juice shop "Juice"',
            isCorrect: false,
            explanation: 'Generic words ("Juice") have 0% protection because all juice sellers need that word!'
          },
          {
            id: 't2_c',
            text: 'Any name that uses the color blue',
            isCorrect: false,
            explanation: 'Colors alone do not make a name distinctive—invented words do!'
          },
          {
            id: 't2_d',
            text: 'The longest name in the dictionary',
            isCorrect: false,
            explanation: 'Length does not matter; uniqueness and creativity do!'
          }
        ]
      },
      {
        id: 'tm_q3',
        question: 'What is the difference between ™ and the circle-R symbol (®)?',
        scenario: 'A company prints ™ on their juice bottles at first, then changes to ® after government approval.',
        options: [
          {
            id: 't3_a',
            text: '™ means "I claim this brand name!"; ® means "Officially Registered by the Government!"',
            isCorrect: true,
            explanation: 'Correct ™ can be used right away by anyone claiming a brand. But you can ONLY use ® after the government officially approves your registered trademark!'
          },
          {
            id: 't3_b',
            text: '™ is for video games; ® is for food and drinks',
            isCorrect: false,
            explanation: 'Both can be used on any product or service.'
          },
          {
            id: 't3_c',
            text: '™ means free; ® means you have to pay a fine',
            isCorrect: false,
            explanation: 'No fines involved ® just proves official government registration.'
          },
          {
            id: 't3_d',
            text: 'They mean the exact same thing with no difference at all',
            isCorrect: false,
            explanation: 'Using ® without official government approval is against the law!'
          }
        ]
      },
      {
        id: 'tm_q4',
        question: 'How long can a registered trademark last?',
        scenario: 'A candy company has used their registered swirl logo since 1920 and renews it every 10 years.',
        options: [
          {
            id: 't4_a',
            text: 'Forever As long as the company keeps using it in business and renews it every 10 years',
            isCorrect: true,
            explanation: 'Super Unlike patents (20 years) and copyright (life + 70 years), trademarks can last forever as long as the brand is still active!'
          },
          {
            id: 't4_b',
            text: 'Strictly 20 years, then anyone can copy it',
            isCorrect: false,
            explanation: '20 years is the limit for Patents, not Trademarks!'
          },
          {
            id: 't4_c',
            text: 'Only 1 year before expiring',
            isCorrect: false,
            explanation: 'Trademarks last 10 years at a time and can be renewed indefinitely!'
          },
          {
            id: 't4_d',
            text: 'Until the original owner retires',
            isCorrect: false,
            explanation: 'Companies can pass trademarks on to new owners for centuries!'
          }
        ]
      }
    ]
  },
  trade_secret: {
    concept: 'trade_secret',
    title: 'Secret Vault Student Quiz',
    topicName: 'Trade Secrets & Hidden Formulas',
    subtitle: 'Learn how secret recipes, formulas, and code stay protected without paperwork!',
    badge: '🔐 Secret Recipes & Formulas',
    color: 'rose',
    borderColor: 'border-rose-500',
    bgGradient: 'from-rose-500/20 to-red-500/20',
    nextQuizConcept: 'plagiarism',
    nextQuizTitle: 'Originality Academy: Plagiarism Student Quiz',
    questions: [
      {
        id: 'ts_q1',
        question: 'What makes something a Trade Secret?',
        scenario: 'A family bakery has a secret chocolate cookie recipe that makes them more popular than all rival bakeries.',
        options: [
          {
            id: 't1_a',
            text: 'It gives the business a special advantage AND is kept strictly secret behind locks or passwords',
            isCorrect: true,
            explanation: 'Bingo A trade secret must be valuable, not known to the public, and actively protected with security measures!'
          },
          {
            id: 't1_b',
            text: 'It must be printed on huge billboards across the city',
            isCorrect: false,
            explanation: 'Printing it on a billboard destroys the secret completely!'
          },
          {
            id: 't1_c',
            text: 'It must be sent to the government patent office for everyone to read',
            isCorrect: false,
            explanation: 'That is a Patent Trade secrets are never published publicly.'
          },
          {
            id: 't1_d',
            text: 'It only applies to robots and computers, never to food recipes',
            isCorrect: false,
            explanation: 'Famous food recipes (like Coca-Cola and KFC) are classic trade secrets!'
          }
        ]
      },
      {
        id: 'ts_q2',
        question: 'What happens if a company leaves its secret recipe on a cafeteria table without a password?',
        scenario: 'An engineer leaves a paper with the secret formula on a public coffee shop table.',
        options: [
          {
            id: 't2_a',
            text: 'They lose legal trade secret protection because they failed to take reasonable security precautions!',
            isCorrect: true,
            explanation: 'True If you don\'t take reasonable steps to lock it up (passwords, safes, NDAs), a court will say you lost your trade secret rights forever!'
          },
          {
            id: 't2_b',
            text: 'The government automatically turns it into a patent.',
            isCorrect: false,
            explanation: 'Patents require formal applications, not careless mistakes!'
          },
          {
            id: 't2_c',
            text: 'The paper automatically bursts into flames.',
            isCorrect: false,
            explanation: 'No magic here You just lose your legal rights.'
          },
          {
            id: 't2_d',
            text: 'It automatically turns into a trademark.',
            isCorrect: false,
            explanation: 'Trademarks are public brand names, not lost papers.'
          }
        ]
      },
      {
        id: 'ts_q3',
        question: 'If a competitor buys a soda from the grocery store and figures out the ingredients in a science lab, is that legal?',
        scenario: 'A rival scientist buys a legal can of drink and uses chemistry to make a similar soda.',
        options: [
          {
            id: 't3_a',
            text: 'Yes Legal "Reverse Engineering" and independent figuring-out are 100% allowed under trade secret rules',
            isCorrect: true,
            explanation: 'Correct Trade secrets protect against theft, spying, and hacking. But if someone buys your product legally and figures it out on their own, trade secret law cannot stop them!'
          },
          {
            id: 't3_b',
            text: 'No, looking at any soda with a microscope is illegal.',
            isCorrect: false,
            explanation: 'Science and analysis of legally bought items are completely lawful!'
          },
          {
            id: 't3_c',
            text: 'Only if they get permission from the police first.',
            isCorrect: false,
            explanation: 'Reverse engineering does not need police permission.'
          },
          {
            id: 't3_d',
            text: 'No, because all sodas have mandatory 100-year patents.',
            isCorrect: false,
            explanation: 'Sodas are protected as trade secrets precisely so they never have to publish their recipes!'
          }
        ]
      },
      {
        id: 'ts_q4',
        question: 'Why did Coca-Cola choose a Trade Secret instead of a Patent for its recipe in 1886?',
        scenario: 'In 1886, the inventors decided whether to patent their soda syrup or lock it in a vault.',
        options: [
          {
            id: 't4_a',
            text: 'A patent would have expired in 20 years (in 1906), but a trade secret has kept the recipe secret for over 135 years!',
            isCorrect: true,
            explanation: 'Brilliant If they patented it, the whole world could copy the recipe after 1906. By keeping it a secret, they still have exclusive control today!'
          },
          {
            id: 't4_b',
            text: 'Because patents were illegal back then',
            isCorrect: false,
            explanation: 'Patents have existed for centuries!'
          },
          {
            id: 't4_c',
            text: 'Because trade secrets cost $1,000,000 to register',
            isCorrect: false,
            explanation: 'Trade secrets cost $0 to register—you don\'t register them at all, you just keep them secret!'
          },
          {
            id: 't4_d',
            text: 'Because sugar was forbidden in patents',
            isCorrect: false,
            explanation: 'Food recipes can be patented if new, but they expire after 20 years.'
          }
        ]
      }
    ]
  },
  plagiarism: {
    concept: 'plagiarism',
    title: 'Originality Academy Student Quiz',
    topicName: 'Plagiarism & Academic Honesty',
    subtitle: 'Learn how to write awesome school projects, avoid copying, and cite your sources!',
    badge: '✍️ Honest Writing & Citation',
    color: 'cyan',
    borderColor: 'border-cyan-500',
    bgGradient: 'from-cyan-500/20 to-blue-500/20',
    nextQuizConcept: 'patent',
    nextQuizTitle: 'Patent Lab Student Quiz (Cycle Complete)',
    questions: [
      {
        id: 'plg_q1',
        question: 'What is the main difference between Plagiarism and Copyright Infringement?',
        scenario: 'A student copies a poem written 400 years ago by William Shakespeare and submits it as their own school homework.',
        options: [
          {
            id: 'p1_a',
            text: 'Plagiarism is breaking an HONESTY rule in school; Copyright is breaking a property law in business',
            isCorrect: true,
            explanation: 'Perfect Shakespeare’s poem is free to use (no copyright law broken), but lying to your teacher that you wrote it is 100% Plagiarism!'
          },
          {
            id: 'p1_b',
            text: 'There is no difference; both put students in jail.',
            isCorrect: false,
            explanation: 'Plagiarism is a school/ethical rule, not a crime with jail time!'
          },
          {
            id: 'p1_c',
            text: 'Plagiarism is only for movie directors, copyright is for homework.',
            isCorrect: false,
            explanation: 'Plagiarism is for homework and school writing; copyright is for creative works.'
          },
          {
            id: 'p1_d',
            text: 'Plagiarism means your homework was too long.',
            isCorrect: false,
            explanation: 'Plagiarism specifically means pretending someone else\'s words or ideas are your own.'
          }
        ]
      },
      {
        id: 'plg_q2',
        question: 'What is "Patchwriting" and why is it still considered plagiarism?',
        scenario: 'Jordan copies a paragraph from an encyclopedia, uses a thesaurus to swap 2 words with synonyms, but leaves the rest unchanged without naming the author.',
        options: [
          {
            id: 'p2_a',
            text: 'Just swapping 2 words is still copying You must rewrite the idea in your own voice AND name the source',
            isCorrect: true,
            explanation: 'Spot on Lazy word-swapping is called patchwriting. Real learning means understanding the idea, explaining it in your own words, and giving credit!'
          },
          {
            id: 'p2_b',
            text: 'It is a clever trick recommended by all school teachers.',
            isCorrect: false,
            explanation: 'Teachers and plagiarism checkers spot word-swapping instantly!'
          },
          {
            id: 'p2_c',
            text: 'It is a special way to fix computer bugs in video games.',
            isCorrect: false,
            explanation: 'In school writing, patchwriting is lazy copying with synonyms.'
          },
          {
            id: 'p2_d',
            text: 'It automatically gives your essay an A+ grade.',
            isCorrect: false,
            explanation: 'It can get your essay flagged and graded F for dishonesty!'
          }
        ]
      },
      {
        id: 'plg_q3',
        question: 'What is the correct way to use another author\'s exact sentence in your essay?',
        scenario: 'You want to include a great 10-word sentence from Dr. Lin’s science book in your report.',
        options: [
          {
            id: 'p3_a',
            text: 'Put the sentence in quotation marks ("...") AND write the author\'s name and year (Lin, 2021)',
            isCorrect: true,
            explanation: 'A+ answer Quotation marks show they are someone else\'s exact words, and the citation gives credit to the smart author who wrote them!'
          },
          {
            id: 'p3_b',
            text: 'Change the font color to light grey so the teacher cannot see it',
            isCorrect: false,
            explanation: 'Trying to hide text is cheating and will get you caught!'
          },
          {
            id: 'p3_c',
            text: 'Remove the quotation marks and say you thought of it first',
            isCorrect: false,
            explanation: 'That is the very definition of plagiarism!'
          },
          {
            id: 'p3_d',
            text: 'Write the author’s name in invisible ink',
            isCorrect: false,
            explanation: 'Always proudly celebrate your sources with clear citations!'
          }
        ]
      },
      {
        id: 'plg_q4',
        question: 'What are the 3 easy steps to make any school project 100% original and honest?',
        scenario: 'You are writing a science project on solar energy using books and online articles.',
        options: [
          {
            id: 'p4_a',
            text: '1. Explain in your own words, 2. Put direct quotes in quotes ("..."), 3. Always cite who made it!',
            isCorrect: true,
            explanation: 'Hooray Follow these 3 golden rules and you will always be a champion of academic honesty!'
          },
          {
            id: 'p4_b',
            text: '1. Copy from 5 different websites so no one notices',
            isCorrect: false,
            explanation: 'Copying from multiple places is still copying!'
          },
          {
            id: 'p4_c',
            text: '1. Have your older brother write the whole essay',
            isCorrect: false,
            explanation: 'Having someone else do your work is academic dishonesty.'
          },
          {
            id: 'p4_d',
            text: '1. Never read any books so you have zero ideas',
            isCorrect: false,
            explanation: 'Reading books is great Just be honest and cite where you learned the facts.'
          }
        ]
      }
    ]
  }
};
