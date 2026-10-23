'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import LevelQuiz from '@/components/LevelQuiz';
import QuizRunner from '@/components/QuizRunner';
import LessonAssessment from '@/components/learn/LessonAssessment';
import AnimationVideo from '@/components/learn/AnimationVideo';
import LearnSidebar from '@/components/learn/LearnSidebar';
import TechnicalAnimation from '@/components/learn/TechnicalAnimation';
import { getCurrentProfile, type UserRole } from '@/lib/auth';
import { listLessonsByTopic, type Lesson } from '@/lib/lessons';
import { getLearnTopicForModule, type LearnModule } from '@/lib/learn';
import { listTopics, type TopicRow } from '@/lib/topics';

type LearnModuleViewProps = {
  module: LearnModule;
};

function SectionCard({ title, children, primary = false }: { title: string; children: ReactNode; primary?: boolean }) {
  return (
    <section className={`rounded-2xl border border-slate-200 shadow-soft ${primary ? 'bg-slate-50 p-6 sm:p-8' : 'bg-white p-5 sm:p-6'}`}>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

const SECTION_TABS = ['Story', 'Technical', 'Animation / Visual', 'Flash Cards', 'Quiz', 'Assessment'] as const;
type SectionTab = (typeof SECTION_TABS)[number];

function getModuleStory(module: LearnModule) {
  const stories: Record<string, {
    introduction: string;
    story: string[];
    connection: string[];
    moral: string;
    keyPoints: string[];
    summary: string;
  }> = {
    patent: {
      introduction: 'Meet Maya, who spots a small classroom problem and decides to design something useful. Her experience shows how an invention grows through testing, and why an idea alone is not the same as having a patent.',
      story: [
        'Every afternoon, Maya packed up her books and found pencils under her desk. Her ruler had rolled into the aisle, and a marker had left a blue line across her notebook. “I wish my desk had a safe place for all these things,” she sighed. Her teacher, Mr. Lee, suggested that she look closely at the problem before trying to solve it. Maya watched what happened during class and noticed that round pencils rolled whenever someone bumped the desk.',
        'At home, Maya sketched a holder with several small spaces. She called her first version Desk Dock. She made it from a cardboard tube, a cereal box, and tape. The pencils stayed upright, but the whole holder tipped over when Maya put in her heavy ruler. The next day, she brought it to school and asked two classmates to test it. One said, “My eraser falls into the big space and gets lost.” The other noticed that the holder slid when the desk shook.',
        'Maya did not give up or pretend the first version was perfect. She wrote down what went wrong. At home she made the base wider, added a low section for an eraser, and divided the tall section into separate pencil spaces. She used scrap cardboard to make a small raised edge that stopped the holder from sliding. Then she tested it with different supplies, moved it gently, and checked whether each item stayed where it belonged. A second classroom test went much better. Her classmates could find their things quickly, and the holder stayed steady.',
        'Mr. Lee invited Maya to show Desk Dock at the school invention afternoon. Maya explained the problem, showed her first sketch, and described how each test helped her improve the design. A student asked, “Does that mean you have a patent now?” Maya was not sure. Mr. Lee explained that making an invention does not automatically give someone a patent. A patent is a kind of legal protection connected to inventions that meet the relevant legal requirements. An inventor may be able to seek that protection by making a patent application, but an application must be considered and protection is not guaranteed.',
        'Maya learned that a patent is not simply a prize for having an idea. The invention and the application have to meet rules that can depend on where and how a person applies. Inventors often get help from knowledgeable adults when they want to understand that process. Maya and her family decided to keep her sketches and notes about the tests, and to ask an adult what steps would make sense before sharing more details outside school.',
        'At the invention afternoon, Maya demonstrated the improved Desk Dock and explained that she was its inventor. Her teacher asked whether the class could make a few holders for the shared supply table. Maya was happy to discuss it with her family and teacher. She understood that she had created and improved an invention, but she did not claim she already had a patent. She left with a useful design, careful notes, and a new question to explore with an adult.'
      ],
      connection: [
        'Maya noticed a problem and created Desk Dock to solve it. That makes her an inventor, and Desk Dock is her invention. Testing helped her find weaknesses and improve the design.',
        'A patent may protect a qualifying invention, but having an idea or building a first model does not automatically mean a person has a patent. An inventor may seek protection through a patent application, and the invention must meet applicable legal requirements. Maya has not been promised or granted a patent in this story.'
      ],
      moral: 'A useful invention can take many tests to improve. A patent is a possible form of protection for a qualifying invention, not an automatic reward for having an idea.',
      keyPoints: [
        'An invention is a created solution or product, not just a thought.',
        'An inventor develops an invention and may improve it through testing.',
        'A patent is connected to inventions that meet legal requirements.',
        'An idea or model does not automatically mean someone has a patent.',
        'An inventor may seek protection by making a patent application.',
        'Patent protection is not guaranteed; the application and requirements matter.'
      ],
      summary: 'Maya designed and improved a pencil holder by testing it. Her invention could potentially be considered for patent protection only if it meets the relevant legal requirements and an application process is followed. An idea alone is not a patent.'
    },
    copyright: {
      introduction: 'Sam loves making comics and music. When a friend wants to share his work, Sam learns how creators can be credited and how people can share creative work thoughtfully.',
      story: [
        'Sam filled the edges of his school notebooks with drawings. One weekend, he decided to make a comic called The Lantern Club. It was about three friends who found a tiny lantern in a park and used it to help a lost puppy get home. Sam drew the characters, made speech bubbles, and planned each page himself. He also wrote a short tune for the moment the friends found the puppy. He tapped the rhythm on a jar, then recorded the song on a tablet.',
        'On Monday, Sam showed the comic and song to his friend Nia. “The ending is funny,” she said. “Could I send all the pages to our class chat? Everyone would like it.” Sam was pleased that she enjoyed his work, but he paused. He wanted classmates to see the comic, and he also wanted them to know who had drawn it. Nia had not meant to be unkind; she simply had not thought about what sharing someone else’s work involved.',
        'Sam suggested that they ask their teacher, Ms. Patel, how to share it. She explained that a comic, its drawings, and an original song are examples of creative expression. The person who makes a creative work is its creator. Copyright is a form of protection that may apply to original creative works under the rules where the work is made. It is about the way creative ideas are expressed, such as Sam’s particular drawings, words, and music, rather than owning the general idea of friends helping a puppy.',
        'Ms. Patel also explained that copyright does not mean nobody can ever use anyone else’s work. Some uses may be allowed, and rules can depend on the situation. But when someone wants to copy or share a creator’s work, permission may matter. It is also important to give appropriate credit. Credit tells people who made the work, but credit by itself does not always replace permission when permission is needed.',
        'Nia asked Sam what he would feel comfortable with. Sam agreed that she could share one page in the class chat if she kept his name with it and did not edit the drawing to make it seem like someone else had made it. They decided to ask before sharing the whole comic or the song outside the class. Sam made a small title page that said “The Lantern Club, comic and song by Sam Rivera.” Nia included that credit when she shared the approved page.',
        'A few classmates asked Sam how he made the lantern glow in his picture. He showed them the coloured pencils he used and talked about his song. One classmate asked if she could use the tune in a video for a school project. Sam said he would like to hear more about the project first, and they checked with Ms. Patel about what permissions were needed. Sam learned that responsible sharing starts with respect, a clear question, and honest credit. Nia learned that asking first can make sharing kinder and clearer for everyone.'
      ],
      connection: [
        'Sam created an original comic, drawings, and music. Those are examples of creative expression, and Sam is their creator. Copyright is connected to original creative works, while the exact rules for using them can depend on the circumstances.',
        'Nia asked before sharing and kept Sam’s name with the page. Permission may matter when sharing someone else’s work, and credit helps identify its creator. Giving credit is important, but it does not automatically mean every use is allowed.'
      ],
      moral: 'Respect creative work by recognizing its creator, giving appropriate credit, and asking before sharing or reusing it when permission may be needed.',
      keyPoints: [
        'A creator makes an original work, such as a comic, drawing, song, or video.',
        'Copyright is connected to original creative expression.',
        'A general idea is different from the particular way someone expresses it.',
        'Responsible sharing may mean asking for permission first.',
        'Give appropriate credit so people know who created the work.',
        'Credit is valuable, but it does not always replace permission.',
        'Copyright does not mean that every use of another person’s work is forbidden.'
      ],
      summary: 'Sam made an original comic and song, and Nia asked before sharing a page. Their choices showed how copyright relates to creative expression and why permission and credit help people share respectfully.'
    },
    trademark: {
      introduction: 'When Lina visits her family’s neighbourhood bakery, she notices how its name and bright logo help customers find it. The visit helps her understand what a trademark identifies.',
      story: [
        'Lina loved visiting the little bakery on Maple Street with her cousin Ben. The bakery belonged to Ben’s family, the Parkers. Before they opened it, the family had talked about what to call it. They chose “Sunrise Crumbs” because they baked early each morning and liked making warm rolls. Lina’s aunt designed a bright yellow sun above a simple green wheat stalk. The family put the name and logo on the shop sign, paper bags, and menu.',
        'One Saturday, Lina and Ben helped set out napkins for a neighbourhood breakfast. Customers came through the door and greeted the bakers by name. A man pointed to the yellow sun on a bag and said, “I saw this mark on your window and knew I had found the same bakery my daughter likes.” Lina noticed that he did not need to see the ovens or meet the family first. The name and logo helped him recognize which bakery was offering the bread and service.',
        'On the walk home, Lina started looking at other shops. The bookshop had a name on its awning, the bicycle repair shop had a gear-shaped sign, and the flower stall used a small red bird. “Do all these pictures mean the same thing?” she asked. Ben said that each business chose ways for customers to recognize it. Some used names, some used logos or symbols, and some used a combination. A mark can help identify the source or brand connected with goods or services.',
        'The next week, the bakery hosted a children’s drawing table. Lina drew a sun wearing an apron and asked whether the bakery should replace its logo. Aunt Jo thanked her and explained that the logo was already becoming familiar to customers. “A brand is the identity people recognize,” she said. “Our name and mark help people tell that our bread and bakery service come from us.” The family kept Lina’s drawing for a future activity, but used the same Sunrise Crumbs name and logo on the shop materials so people would recognize them consistently.',
        'A customer then asked if the bakery’s logo was an invention like a new oven. Aunt Jo explained the difference. A patent is associated with a qualifying invention. A trademark is associated with a mark that identifies the source or brand of goods or services. The logo did not describe how to build an oven or bake bread; it helped customers recognize the bakery. A business may use a distinctive name, logo, or symbol as part of its brand, though legal protection depends on relevant rules and circumstances.',
        'At the end of the morning, Lina watched a family follow the Sunrise Crumbs sign into the shop. They bought rolls and thanked the bakers. Lina understood why the bakery cared about using its name and bright logo clearly: the marks made it easier for customers to recognize the source of the goods and service they wanted. The bakery’s mark and a patent did different jobs, and now Lina could explain the difference to Ben.'
      ],
      connection: [
        'Sunrise Crumbs used a name and logo that customers began to recognize. Those marks helped customers identify the source or brand connected with the bakery’s goods and services.',
        'A trademark is associated with identifying a source or brand. A patent, by contrast, is associated with a qualifying invention. The bakery logo identifies the bakery; it is not a patent for a new invention.'
      ],
      moral: 'A distinctive name, logo, or symbol can help people recognize which business provides a good or service; that is different from protecting an invention.',
      keyPoints: [
        'A trademark is a mark associated with a source or brand.',
        'A mark can be a name, logo, symbol, or combination of these.',
        'Businesses use distinctive marks to help customers recognize them.',
        'Marks can identify the source of goods or services.',
        'A brand is the identity customers come to recognize.',
        'A trademark and a patent do different jobs.',
        'A patent is associated with a qualifying invention, not a business logo.'
      ],
      summary: 'Lina saw customers recognize Sunrise Crumbs by its name and bright logo. The marks identified the bakery as the source of its goods and services, while a patent relates to a qualifying invention.'
    },
    'trade-secret': {
      introduction: 'At a neighbourhood market, Kai helps his family’s small drink business prepare its popular fizzy berry drink. He learns why valuable business information sometimes needs to stay confidential.',
      story: [
        'Kai’s family ran a small drink stand called Berry Bubble at the Saturday market. His aunt Rosa mixed fruit drinks, and his uncle Dev handled the fizzy water and cups. Their berry drink had a bright taste that customers remembered. The exact recipe included the amounts and order for mixing several ingredients. Aunt Rosa had developed it with the family over many tries, and the recipe helped Berry Bubble stand out from other stalls.',
        'Because the recipe was valuable to the business, the family treated it as confidential business information. They kept the written recipe in a locked drawer at their shop. Only Aunt Rosa, Uncle Dev, and one trained worker could open it. The worker learned how to handle the recipe carefully and not leave copies on the counter. The family did not put the recipe on the public menu; customers could still read the drink’s name and ingredients the business chose to share.',
        'Kai helped by checking cups and greeting customers, but he did not need to know every measurement. Aunt Rosa explained, “We only share the recipe with people who need it for their work. We keep it in one safe place and remind everyone that it is private.” These steps did not make it impossible for the information to be lost, but limiting access and storing it securely helped the family take reasonable care of it.',
        'One busy afternoon, a visitor named Max tried the drink and smiled. “This is delicious! Could you send me the exact recipe? I want to make it for my club,” he asked. Kai felt awkward. He wanted to be friendly, but he knew the recipe was private. He answered politely, “I can tell you the drink is made with berries and fizz, but the family keeps the full recipe confidential. You could ask Aunt Rosa about a different recipe she is happy to share.” Max understood and asked Aunt Rosa which ingredients were listed publicly.',
        'Later, Kai wondered why the family did not apply for a patent instead. Aunt Rosa explained that a trade secret is valuable information a business works to keep secret. Secrecy is important: if the information becomes public, it may no longer have the same value as a secret. A business can use reasonable steps such as limited access and secure storage to protect confidential information. A patent is different. It is associated with a qualifying invention and involves an application process; it is not simply a secret recipe kept locked away.',
        'The family reviewed who needed access to the recipe and checked that the drawer was locked after each market day. They also taught the trained worker how to protect the information and what to do if a copy went missing. Kai helped put away the tablet that held the business’s order list, which was also kept private. The next Saturday, Berry Bubble served its popular drink again. Kai felt proud that he could welcome customers warmly while respecting information the family had chosen to keep confidential.'
      ],
      connection: [
        'Berry Bubble’s recipe had business value, so the family kept it confidential, limited who could access it, stored it securely, and taught trusted workers how to handle it. Those are examples of steps used to protect a trade secret.',
        'A trade secret depends on valuable information being kept secret. If it is made public, the business may lose the advantage secrecy gave it. A patent is different: it concerns a qualifying invention and requires an application process. Neither kind of protection is a guarantee that information can never be copied or lost.'
      ],
      moral: 'Valuable confidential business information needs careful handling: share it only with people who need it and take reasonable steps to keep it secret.',
      keyPoints: [
        'A trade secret is valuable confidential business information.',
        'Secrecy is central: information that is public is no longer a secret.',
        'Businesses can limit access to people who need the information.',
        'Secure storage and careful handling are useful protective steps.',
        'Trusted workers should learn how to handle confidential information.',
        'A trade secret and a patent are different kinds of protection.',
        'A patent involves an application for a qualifying invention; a trade secret depends on secrecy.'
      ],
      summary: 'Kai’s family protected its popular drink recipe by keeping it confidential and limiting access. The story shows that a trade secret depends on secrecy, unlike a patent, which involves an application for a qualifying invention.'
    },
    plagiarism: {
      introduction: 'Ava is preparing a school report and finds helpful facts in a book and an online source. She learns how to use those sources honestly while making the report her own.',
      story: [
        'Ava’s class had a science assignment: explain how bees help gardens. She found a library book with a clear explanation and a trustworthy garden website with a diagram. Ava was excited to discover so much useful information, but she also worried about finishing on time. She copied two sentences from the book and one from the website into her document. Then she changed the title and added her name at the top. She did not write down where the sentences had come from.',
        'The next morning, Ava read the report to her teacher, Mr. Chen. He noticed that some sentences sounded very different from Ava’s usual writing. He did not scold her or take away the assignment. Instead, he asked, “Can you tell me what these sentences mean?” Ava could explain the main idea, but she could not remember which details came from which source. Mr. Chen said that using another person’s words or ideas without properly acknowledging the source can be plagiarism. It is an academic honesty problem because the work makes it look as if the borrowed material came from the student.',
        'Ava felt embarrassed, but Mr. Chen explained that making a mistake could be a chance to learn. He showed her a simple process. First, read a source and make sure you understand the idea. Next, look away from the source and explain the idea in your own words. That is paraphrasing. A paraphrase still needs a citation because the information came from a source. If you want to use the exact words, keep them inside quotation marks and identify the source. A citation helps a reader find out where the information came from.',
        'Ava started again with the book. She read a paragraph, closed the book, and wrote: “Bees carry pollen between flowers, which helps many garden plants make seeds.” She checked that her version kept the meaning but used her own wording. Then she wrote down the book’s title and author. For the website, she recorded its title and the organization that made it, along with the date she visited it, following the citation format her teacher had provided.',
        'Ava also chose one short sentence from the website that she wanted to quote exactly. She placed quotation marks around it and added a citation beside it. For the rest of the report, she explained what she had learned in her own way and added a small drawing she made herself. She checked every fact against her sources and made sure each borrowed idea had a citation. Her report now showed both her understanding and where she had learned the information.',
        'When Ava handed in the revised report, Mr. Chen thanked her for taking responsibility and asked her to explain how she had used the sources. Ava could describe the difference between copying, paraphrasing, quoting, and giving a citation. She understood that the goal was not to avoid books or websites; sources help people learn. The important part was to be honest about which ideas came from others and to contribute her own thinking too. Ava left class ready to use the same careful habits on her next assignment.'
      ],
      connection: [
        'Ava first copied sentences without identifying their sources, which made it look as though those words were hers. Her teacher helped her understand, paraphrase, quote carefully, and add citations.',
        'Plagiarism concerns failing to properly acknowledge another person’s words or ideas in school or other work. It is an academic honesty concept, not one of the five types of intellectual property rights. Citation, quotation, and paraphrasing help show what came from sources and what Ava contributed herself.'
      ],
      moral: 'Use sources to learn, but be honest about where words and ideas came from: understand them, write in your own words, and cite or quote them clearly.',
      keyPoints: [
        'A source is where information, words, or ideas came from.',
        'Plagiarism is using another person’s words or ideas without proper acknowledgement.',
        'Paraphrasing means explaining a source’s idea in your own words; it still needs a citation.',
        'Use quotation marks and a citation when including an exact quotation.',
        'Citations help readers identify and find sources.',
        'Original schoolwork combines your understanding with honest credit to sources.',
        'Plagiarism is an academic honesty concept, not one of the five types of IP rights.'
      ],
      summary: 'Ava revised copied sentences by understanding the sources, paraphrasing, quoting where needed, and citing her information. Her story demonstrates academic honesty and makes clear that plagiarism is not an intellectual property right.'
    }
  };

  return stories[module.key] ?? stories.patent;
}

type TechnicalContent = {
  definition: string;
  steps: string[];
  example: string;
  purpose: string;
  keyPoints: string[];
  questions: { question: string; answer: string }[];
  terms: { term: string; definition: string }[];
};

function getModuleTechnical(module: LearnModule): TechnicalContent {
  const teachings: Record<string, TechnicalContent> = {
    patent: {
      definition: 'A patent is legal protection that may be given to an invention that meets relevant requirements. It can give the inventor certain rights for a limited time, depending on the law.',
      steps: [
        'Create and describe a possible invention that solves a problem.',
        'Check whether it may meet the requirements, such as being new and useful. An idea alone is not enough.',
        'An inventor may submit a patent application to the relevant office.',
        'The application is reviewed under the applicable rules. A patent is not automatic or guaranteed.',
      ],
      example: 'A student designs a new toy mechanism that makes a toy move in a different way. The student and family can learn whether it meets the requirements and whether to apply for a patent.',
      purpose: 'Patent protection can recognize inventors and encourage them to share details of qualifying inventions. It is useful when someone has developed a new product or process and wants to seek legal protection for it.',
      keyPoints: [
        'Patents are for qualifying inventions, not every idea.',
        'The invention must meet legal requirements, which can vary by place.',
        'An application must be reviewed; having an idea does not mean a patent has been granted.',
        'Patent protection lasts for a limited period under applicable law.',
        'Invention, novelty, usefulness, and public notice are important ideas to understand.',
      ],
      questions: [
        { question: 'Who can seek a patent?', answer: 'An inventor may apply, sometimes with help from an adult or a patent professional. The rules depend on where they apply.' },
        { question: 'Does every new idea get a patent?', answer: 'No. The invention and application must meet the relevant legal requirements.' },
        { question: 'How long does a patent last?', answer: 'Patent protection is limited in time. The length depends on applicable law.' },
      ],
      terms: [
        { term: 'Invention', definition: 'A product or process created to solve a problem in a new way.' },
        { term: 'Inventor', definition: 'A person who creates an invention.' },
        { term: 'Patent application', definition: 'A request asking an official office to consider patent protection.' },
        { term: 'Novelty', definition: 'The idea that an invention must be new under the relevant rules.' },
        { term: 'Prior art', definition: 'Earlier knowledge or inventions used when checking whether an invention is new.' },
      ],
    },
    copyright: {
      definition: 'Copyright is legal protection for original creative expression, such as a story, drawing, song, or video. It helps identify and protect the creator’s work under applicable rules.',
      steps: [
        'A creator makes an original creative work, such as a poem, picture, or recording.',
        'Keep a copy or record that shows what was created and when.',
        'Before copying or sharing someone else’s work, check whether permission is needed and give appropriate credit.',
        'Some uses may be allowed without permission, depending on the situation and applicable rules.',
      ],
      example: 'A student writes an original poem for class. A friend who wants to post the poem online asks first and keeps the student’s name with it.',
      purpose: 'Copyright helps creators receive recognition and control certain uses of their creative work. It is useful for writing, art, music, films, and other original expression.',
      keyPoints: [
        'Copyright relates to original expression, not ownership of a general idea.',
        'Stories, drawings, songs, and videos can be creative works.',
        'Permission may matter when someone copies or shares a work.',
        'Credit helps people know who created a work, but credit does not always replace permission.',
        'Copyright does not mean every use of another person’s work is forbidden.',
      ],
      questions: [
        { question: 'Who is the creator?', answer: 'The creator is the person who made the original work.' },
        { question: 'Can I ever use someone else’s work?', answer: 'Sometimes. Some uses may be allowed, while others may need permission. Check the rules and ask when unsure.' },
        { question: 'Is giving credit always enough?', answer: 'No. Credit is important, but permission may also be needed.' },
      ],
      terms: [
        { term: 'Creator', definition: 'A person who makes an original creative work.' },
        { term: 'Original work', definition: 'A creative work made by its creator, rather than copied from someone else.' },
        { term: 'Permission', definition: 'Agreement from the right person to use a work in a particular way.' },
        { term: 'Credit', definition: 'Naming the person who created the work.' },
        { term: 'Creative expression', definition: 'The particular words, pictures, sounds, or other form used to share an idea.' },
      ],
    },
    trademark: {
      definition: 'A trademark is a name, logo, symbol, or other mark that helps people recognize the source or brand of goods or services.',
      steps: [
        'A business chooses a name, logo, or symbol to help people recognize its goods or services.',
        'The business uses the mark consistently so customers can connect it with that source.',
        'A business may seek trademark protection under local rules, where available.',
        'Customers use the mark to tell one source or brand from another.',
      ],
      example: 'A school lunch company uses a distinctive green apple logo on its lunch boxes. Students and families can recognize which company made the lunches.',
      purpose: 'Trademarks help customers identify where goods or services come from. Businesses use them to build recognition and help customers distinguish their brand from others.',
      keyPoints: [
        'A mark identifies a source or brand; it does not protect how a product works.',
        'Marks can include names, logos, and symbols.',
        'Distinctive marks are easier for customers to recognize.',
        'Trademarks relate to goods or services offered by a source.',
        'A trademark differs from a patent, which relates to a qualifying invention.',
      ],
      questions: [
        { question: 'Can a trademark be a picture or symbol?', answer: 'Yes. A logo or symbol can be a mark that helps identify a brand.' },
        { question: 'Does a trademark protect an invention?', answer: 'No. A trademark helps identify a source or brand. Patents relate to qualifying inventions.' },
        { question: 'Why do businesses use distinctive marks?', answer: 'Distinctive marks help customers recognize and tell brands apart.' },
      ],
      terms: [
        { term: 'Trademark', definition: 'A mark used to identify the source or brand of goods or services.' },
        { term: 'Brand', definition: 'The identity people recognize when they see a business’s goods or services.' },
        { term: 'Logo', definition: 'A picture or design used to identify a business or brand.' },
        { term: 'Goods and services', definition: 'Products a business sells and services it provides.' },
        { term: 'Distinctive', definition: 'Different enough to be recognized and told apart from others.' },
      ],
    },
    'trade-secret': {
      definition: 'A trade secret is valuable business information that is not generally known and is kept confidential. Its protection depends on the business taking reasonable steps to keep it secret.',
      steps: [
        'Identify information that has business value because it is not widely known.',
        'Limit access to people who need the information for their work.',
        'Use sensible safeguards, such as secure storage and clear instructions for trusted workers.',
        'Keep reviewing access and handling so the information does not become public.',
      ],
      example: 'A bakery keeps its special cake recipe in a secure place and shares it only with the workers who need it to bake the cakes.',
      purpose: 'Keeping valuable information confidential can help a business maintain an advantage. This can be useful for recipes, methods, customer information, or other private business knowledge.',
      keyPoints: [
        'The information must have value and be kept secret.',
        'Limited access and secure storage are examples of reasonable protective steps.',
        'If the information becomes public, it may lose its value as a secret.',
        'A trade secret does not use the same process as a patent application.',
        'A patent concerns qualifying inventions; a trade secret depends on secrecy.',
      ],
      questions: [
        { question: 'What makes information a trade secret?', answer: 'It has business value, is not generally known, and is handled as confidential information.' },
        { question: 'What if the secret is shared publicly?', answer: 'It may no longer be secret, so the business could lose the advantage it provided.' },
        { question: 'Is a trade secret the same as a patent?', answer: 'No. A patent involves an application for a qualifying invention; a trade secret depends on keeping valuable information confidential.' },
      ],
      terms: [
        { term: 'Confidential', definition: 'Meant to be kept private and shared only with approved people.' },
        { term: 'Business information', definition: 'Knowledge or details used by a business, such as a recipe or process.' },
        { term: 'Limited access', definition: 'Allowing only people who need information to see or use it.' },
        { term: 'Reasonable steps', definition: 'Practical actions taken to help keep information secret.' },
        { term: 'Competitive advantage', definition: 'Something that helps a business do better than other businesses.' },
      ],
    },
    plagiarism: {
      definition: 'Plagiarism is using another person’s words or ideas without properly acknowledging the source. It is an academic honesty concept, not one of the five types of intellectual property rights.',
      steps: [
        'Write down where each useful fact, idea, or quotation came from.',
        'Read and understand the information, then explain it in your own words when paraphrasing.',
        'Add a citation for borrowed ideas, including paraphrases.',
        'Put quotation marks around exact words and cite the source.',
        'Check your work against your sources and follow your teacher’s citation instructions.',
      ],
      example: 'A student finds a useful paragraph on a website. Instead of copying it as their own, they explain the idea in their own words and cite the website; if they use an exact sentence, they add quotation marks and a citation.',
      purpose: 'Learning to avoid plagiarism helps students be honest about what they learned from others and what they contributed themselves. It also gives readers a way to find the sources.',
      keyPoints: [
        'Plagiarism concerns missing credit for someone else’s words or ideas.',
        'Paraphrasing means explaining an idea in your own words, but it still needs a citation.',
        'Use quotation marks and a citation for exact words.',
        'Keep track of sources while researching so credit is accurate.',
        'Plagiarism is an academic honesty concept, not an IP right.',
      ],
      questions: [
        { question: 'Does a paraphrase need a citation?', answer: 'Yes. The wording is yours, but the idea came from a source.' },
        { question: 'What if I copy only one sentence?', answer: 'Exact words should be marked as a quotation and credited to the source.' },
        { question: 'What should I do if I am unsure how to cite?', answer: 'Check your teacher’s instructions or ask for help before submitting your work.' },
      ],
      terms: [
        { term: 'Source', definition: 'The place where information, words, or ideas came from.' },
        { term: 'Citation', definition: 'A note that identifies a source used in your work.' },
        { term: 'Paraphrase', definition: 'An explanation of a source’s idea written in your own words.' },
        { term: 'Quotation', definition: 'The exact words from a source, marked with quotation marks.' },
        { term: 'Academic honesty', definition: 'Being truthful about your own work and the sources you used.' },
      ],
    },
  };

  return teachings[module.key] ?? teachings.patent;
}

type AnimationStoryData = {
  characters: { icon: string; name: string }[];
  situation: string;
  problem: string;
  issueTitle: string;
  issue: string;
  solutionSteps: string[];
  outcome: string;
};

function getModuleAnimationStory(module: LearnModule): AnimationStoryData {
  const stories: Record<string, AnimationStoryData> = {
    patent: {
      characters: [
        { icon: '🧑‍🔧', name: 'Maya, inventor' },
        { icon: '🧑‍💼', name: 'A seller' },
        { icon: '💧', name: 'Drop-Saver device' },
      ],
      situation: 'Maya notices that her family uses more water than needed to rinse vegetables. She designs and tests Drop-Saver, a small device that slows the flow while still rinsing well. At a school fair, another seller sees it and starts offering a very similar device.',
      problem: 'Someone may be copying Maya’s invention and selling it. An idea alone does not give Maya a patent or automatic control over every similar product.',
      issueTitle: 'Patent',
      issue: 'A patent may protect a qualifying invention. Maya needs to understand the requirements and application process; protection is not automatic.',
      solutionSteps: [
        'Create and test the water-saving device, noting how it works and what makes it useful.',
        'Keep clear sketches, dates, and test notes about the design.',
        'Before sharing more details, ask a trusted adult or qualified professional about the relevant rules.',
        'If appropriate, submit a patent application describing the invention.',
        'Wait for the application to be reviewed. Patent rights apply only if protection is granted, under the applicable law.',
      ],
      outcome: 'Maya understands her options and has documented the design. If a patent is granted, she can use the rights it provides according to the applicable law; neither filing nor protection is guaranteed.',
    },
    copyright: {
      characters: [
        { icon: '🎨', name: 'Sam, artist' },
        { icon: '📱', name: 'Video-sharing site' },
        { icon: '👀', name: 'Classmates' },
      ],
      situation: 'Sam creates an original animated song video for a class project, drawing the scenes and recording the music himself. A classmate downloads it and uploads it to a public page under their own name.',
      problem: 'The copy leaves out Sam’s name and makes it look as if someone else created the video. Sam is worried that viewers will not know where the original came from.',
      issueTitle: 'Copyright',
      issue: 'Copyright is relevant because Sam made an original creative work. The rules can depend on the situation, but copying and uploading it as someone else’s work raises a concern.',
      solutionSteps: [
        'Save the original project files, dated drafts, and a copy of the video as evidence of creation.',
        'Record where and when the copied upload appeared without arguing with the uploader.',
        'Ask a trusted adult to help contact the person or platform and explain the concern.',
        'Use the platform’s reporting process or seek appropriate advice if the issue continues.',
        'Share the original with clear creator credit, and ask before reusing other people’s work.',
      ],
      outcome: 'Sam can identify himself as the creator and take suitable steps to address the upload. He may assert rights or seek remedies where applicable; the result depends on the facts and relevant rules.',
    },
    trademark: {
      characters: [
        { icon: '🧵', name: 'Nina, maker' },
        { icon: '🏷️', name: 'Bright Thread brand' },
        { icon: '🛍️', name: 'Customers' },
      ],
      situation: 'Nina starts a small business selling handmade pencil cases. She chooses the name Bright Thread and draws a colorful button-and-needle logo. Customers begin recognizing her products by that name and mark.',
      problem: 'Another shop starts using a name and logo that look confusingly similar. Customers message Nina asking if the shops are connected.',
      issueTitle: 'Trademark',
      issue: 'A trademark helps customers identify the source or brand of goods and services. Nina’s name and logo may be relevant marks; a trademark is different from a patent for an invention.',
      solutionSteps: [
        'Choose a distinctive name and logo that customers can tell apart from other brands.',
        'Check for similar names and marks in the places and markets where the business plans to operate.',
        'Use Bright Thread consistently on product labels, packaging, and shop pages.',
        'Keep examples showing how and when the mark is used.',
        'Ask a qualified adviser whether applying to register the mark is appropriate under local rules.',
      ],
      outcome: 'Nina helps customers recognize the real Bright Thread shop. If applicable requirements are met, she can rely on the trademark rights available to her; registration and outcomes depend on local law.',
    },
    'trade-secret': {
      characters: [
        { icon: '🥣', name: 'Ari, shop owner' },
        { icon: '🧑‍🍳', name: 'Lee, worker' },
        { icon: '📋', name: 'Family recipe' },
      ],
      situation: 'Ari’s small snack shop has a special spice mix that customers love. The recipe is valuable to the business, so only a few workers need to know it. One worker, Lee, sends the recipe to a friend at a competing shop.',
      problem: 'The recipe may spread beyond the people who need it. If valuable information becomes public, the shop may lose the advantage of keeping it secret.',
      issueTitle: 'Trade Secret',
      issue: 'A trade secret is valuable business information kept confidential through reasonable steps. Unlike a patent, it depends on secrecy and does not use the same application process.',
      solutionSteps: [
        'Identify which recipe details and methods are confidential and valuable.',
        'Limit access to workers who need the information for their jobs.',
        'Use secure storage and clear handling rules; confidentiality agreements may be appropriate.',
        'If information is shared, act promptly to limit further spread, keep records, and get qualified advice.',
        'Review safeguards regularly. Protection depends on the information remaining secret and meeting applicable requirements.',
      ],
      outcome: 'Ari improves the shop’s safeguards and responds to the disclosure. If the information still qualifies as a trade secret and the required steps were taken, protection may apply; public disclosure can weaken or end that protection.',
    },
    plagiarism: {
      characters: [
        { icon: '📚', name: 'Ava, student' },
        { icon: '📝', name: 'Research notes' },
        { icon: '👩‍🏫', name: 'Teacher' },
      ],
      situation: 'Ava finds another student’s assignment posted online while researching a class project. She copies several sentences into her own work and submits it without naming the source.',
      problem: 'The assignment makes the copied words and ideas look like Ava’s own. The original student is not credited, and the work is not academically honest.',
      issueTitle: 'Plagiarism / Academic Honesty',
      issue: 'Plagiarism is failing to properly acknowledge another person’s words or ideas. It is an academic honesty issue, not one of the five types of intellectual property rights.',
      solutionSteps: [
        'Use sources to learn about the topic, and write down where each useful idea came from.',
        'Close the source and explain what you learned in your own words.',
        'Cite the source when you paraphrase someone else’s idea.',
        'Put quotation marks around exact words and include a citation.',
        'Review the assignment instructions and submit work that shows your own understanding.',
      ],
      outcome: 'Ava rewrites her project in her own words, quotes only where useful, and cites the sources she used. Her teacher can see both Ava’s learning and the contributions of other writers.',
    },
  };

  return stories[module.key] ?? stories.patent;
}

function AnimationStory({ story }: { story: AnimationStoryData }) {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (activeStep >= story.solutionSteps.length - 1) {
        setIsPlaying(false);
        return;
      }

      setActiveStep(activeStep + 1);
    }, 2200);

    return () => window.clearTimeout(timer);
  }, [activeStep, isPlaying, story.solutionSteps.length]);

  return (
    <div className="space-y-4">
      <SectionCard title="🎬 The Story" primary>
        <div className="flex flex-wrap gap-3">
          {story.characters.map((character) => (
            <div key={character.name} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
              <span className="text-xl" aria-hidden="true">{character.icon}</span>
              <span>{character.name}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm leading-7 text-slate-600">{story.situation}</p>
      </SectionCard>

      <SectionCard title="⚠️ The Problem">
        <div className="flex items-start gap-3 text-sm leading-7 text-slate-600">
          <span className="text-2xl" aria-hidden="true">⚠️</span>
          <p>{story.problem}</p>
        </div>
      </SectionCard>

      <SectionCard title="🔍 Identify the IP Issue">
        <p className="text-sm leading-7 text-slate-600">
          <strong className="text-slate-900">IP Issue: {story.issueTitle}.</strong> {story.issue}
        </p>
      </SectionCard>

      <SectionCard title="💡 How to Solve It">
        <ol className="space-y-2">
          {story.solutionSteps.map((step, index) => (
            <li key={step} aria-current={activeStep === index ? 'step' : undefined} className={`flex items-start gap-3 rounded-xl border p-3 transition-colors duration-500 ${activeStep === index ? 'border-brand-300 bg-brand-50' : 'border-transparent bg-white/70'}`}>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors duration-500 ${activeStep === index ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {index + 1}
              </span>
              <p className="pt-1 text-sm leading-6 text-slate-700">{step}</p>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="button" className="btn-secondary px-4 py-2" disabled={activeStep === 0} onClick={() => setActiveStep((step) => Math.max(0, step - 1))}>
            Previous
          </button>
          <button
            type="button"
            className="btn-primary px-4 py-2"
            onClick={() => {
              if (activeStep === story.solutionSteps.length - 1) {
                setActiveStep(0);
              }
              setIsPlaying((playing) => !playing);
            }}
          >
            {isPlaying ? 'Pause animation' : 'Play animation'}
          </button>
          <button type="button" className="btn-secondary px-4 py-2" disabled={activeStep === story.solutionSteps.length - 1} onClick={() => setActiveStep((step) => Math.min(story.solutionSteps.length - 1, step + 1))}>
            Next
          </button>
          <span aria-live="polite" className="text-sm text-slate-500">Step {activeStep + 1} of {story.solutionSteps.length}</span>
        </div>
      </SectionCard>

      <SectionCard title="✅ Final Outcome">
        <p className="text-sm leading-7 text-slate-600">{story.outcome}</p>
      </SectionCard>
    </div>
  );
}

const FLASH_CARDS: Record<string, Array<{ front: string; back: string }>> = {
  patent: [
    { front: 'What is a patent?', back: 'A patent is legal protection that may be granted for an invention that meets the relevant rules.' },
    { front: 'What is an invention?', back: 'A product or process someone has created to solve a problem or do something in a new way.' },
    { front: 'Does having an idea mean you have a patent?', back: 'No. An idea alone is not a patent. The invention must meet legal requirements and go through an application process.' },
    { front: 'What does an inventor do?', back: 'An inventor creates an invention and may test and improve it. The inventor can explore applying for a patent.' },
    { front: 'What is a patent application?', back: 'It is a request asking the relevant office to consider whether an invention qualifies for patent protection.' },
    { front: 'Scenario: You build a new lunchbox latch. Is it automatically patented?', back: 'No. Building it does not automatically give it a patent. An application must be considered under the relevant rules.' },
    { front: 'What does “new” mean in patent discussions?', back: 'Novelty means the invention must be new under the applicable rules. Earlier inventions or knowledge may be considered.' },
    { front: 'What might a patent protect: a solution or just a sketch?', back: 'It may protect a qualifying invention, not merely a general idea. The application explains the invention in detail.' },
    { front: 'Common mistake: Is every useful product patentable?', back: 'No. Usefulness alone is not enough; an invention and its application must meet all relevant legal requirements.' },
    { front: 'How is a patent different from a trade secret?', back: 'A patent involves applying for protection and sharing information as required. A trade secret depends on keeping valuable information confidential.' },
  ],
  copyright: [
    { front: 'What does copyright relate to?', back: 'Original creative expression, such as a story, drawing, song, photograph, or video.' },
    { front: 'Who is a creator?', back: 'The person who makes an original creative work.' },
    { front: 'Does copyright protect a general idea for a story?', back: 'Copyright generally relates to how an idea is expressed, not the general idea itself.' },
    { front: 'Scenario: A classmate wants to post your song. What is a good first step?', back: 'Ask about the intended use and check whether permission is needed. Keep appropriate creator credit with the song.' },
    { front: 'What does “permission” mean?', back: 'Agreement from the person with the right to allow a particular use of a work.' },
    { front: 'Is giving credit always enough to use a work?', back: 'No. Credit identifies the creator, but permission may also be needed.' },
    { front: 'Can a photograph be a creative work?', back: 'Yes. An original photograph is an example of creative expression.' },
    { front: 'What is a common copyright mistake?', back: 'Assuming that anything online is free to copy or share. Check the rules and ask when unsure.' },
    { front: 'Does copyright mean nobody may ever use a work?', back: 'No. Some uses may be allowed, depending on the situation and applicable rules.' },
    { front: 'What is one respectful way to share a friend’s drawing?', back: 'Ask first when permission may be needed, and identify your friend as the creator.' },
  ],
  trademark: [
    { front: 'What is a trademark?', back: 'A mark that helps people recognize the source or brand of goods or services.' },
    { front: 'What forms can a trademark take?', back: 'It may be a name, logo, symbol, or another distinctive mark.' },
    { front: 'What does a trademark help customers do?', back: 'Recognize a brand and tell its goods or services apart from others.' },
    { front: 'Scenario: A green apple logo appears on lunch boxes. What might it identify?', back: 'It can help customers recognize which company provides those goods or services.' },
    { front: 'What is a logo?', back: 'A picture or design used to identify a business, product, or brand.' },
    { front: 'How is a trademark different from a patent?', back: 'A trademark identifies a brand or source. A patent relates to a qualifying invention.' },
    { front: 'What does “distinctive” mean for a mark?', back: 'It is recognizable and helps distinguish one source or brand from another.' },
    { front: 'Common mistake: Does a trademark protect how a machine works?', back: 'No. A trademark identifies a source or brand; a patent may relate to how a qualifying invention works.' },
    { front: 'What are goods and services?', back: 'Goods are products; services are activities or help provided by a business.' },
    { front: 'Why might a business use the same mark on its sign and packaging?', back: 'Consistent use helps customers connect the mark with that business and its goods or services.' },
  ],
  'trade-secret': [
    { front: 'What is a trade secret?', back: 'Valuable business information that is not generally known and is kept confidential.' },
    { front: 'Why does secrecy matter?', back: 'The information’s value as a trade secret depends on it remaining secret.' },
    { front: 'What is an example of a possible trade secret?', back: 'A special recipe or business process kept confidential because it gives the business value.' },
    { front: 'Scenario: Who should see a confidential recipe at work?', back: 'Only people who need it for their work should have access.' },
    { front: 'Name one way to help protect confidential business information.', back: 'Limit access, store it securely, and teach trusted workers how to handle it.' },
    { front: 'What does “confidential” mean?', back: 'Private information that should only be shared with approved people.' },
    { front: 'What could happen if a secret recipe is posted publicly?', back: 'It may stop being secret, and the business could lose the advantage it provided.' },
    { front: 'Common mistake: Is writing “secret” on a paper enough?', back: 'Not by itself. A business should take reasonable steps, such as limiting access and using secure storage.' },
    { front: 'How is a trade secret different from a patent?', back: 'A trade secret depends on confidentiality. A patent involves an application for a qualifying invention.' },
    { front: 'Should every worker receive every company password?', back: 'No. Access should be limited to people who need the information for their role.' },
  ],
  plagiarism: [
    { front: 'What is plagiarism?', back: 'Using someone else’s words or ideas without properly acknowledging the source.' },
    { front: 'What is a source?', back: 'A place or person you got information, words, images, or ideas from.' },
    { front: 'What is paraphrasing?', back: 'Explaining a source’s idea in your own words. You still need to cite the source.' },
    { front: 'Scenario: You copy one sentence into a report. What should you do?', back: 'Use quotation marks around the exact words and cite the source, following your teacher’s instructions.' },
    { front: 'What does a citation do?', back: 'It gives information that helps readers identify and find the source you used.' },
    { front: 'Does changing a few words remove the need to cite?', back: 'No. If the idea came from a source, acknowledge it even when you paraphrase.' },
    { front: 'What is a direct quotation?', back: 'The exact words from a source, usually marked with quotation marks and a citation.' },
    { front: 'Common mistake: Is a fact from a website automatically your own?', back: 'No. If you learned it from a source, cite it according to the required format.' },
    { front: 'How can you paraphrase carefully?', back: 'Understand the source, look away, explain the idea in your own words, then check accuracy and cite it.' },
    { front: 'Is plagiarism one of the five IP rights?', back: 'No. Plagiarism is an academic honesty issue. It is about acknowledging other people’s work.' },
  ],
};

function FlashCards({ module }: { module: LearnModule }) {
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const cards = FLASH_CARDS[module.key] ?? FLASH_CARDS.patent;

  if (cards.length === 0) {
    return <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Flash cards will be available soon.</p>;
  }

  const currentCard = cards[cardIndex];

  return (
    <div className="w-full space-y-5">
      <section className="overflow-hidden rounded-[28px] border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-amber-50 p-4 shadow-sm sm:p-6 lg:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-slate-800">{module.icon} {module.title} revision</p>
            <p aria-live="polite" className="mt-1 text-sm font-medium text-slate-500">Card {cardIndex + 1} / {cards.length}</p>
          </div>
          <span className="rounded-full border border-white bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm">
            {isFlipped ? 'Answer revealed' : 'Tap card to reveal'}
          </span>
        </div>
        <div className="[perspective:1200px]">
          <button
            type="button"
            aria-label={`${isFlipped ? 'Answer' : 'Question'}: ${isFlipped ? currentCard.back : currentCard.front}. Activate to ${isFlipped ? 'show question' : 'reveal answer'}.`}
            aria-pressed={isFlipped}
            onClick={() => setIsFlipped((value) => !value)}
            className="group block min-h-[300px] w-full rounded-[24px] text-left focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300 sm:min-h-[340px] lg:min-h-[360px]"
          >
            <span className={`relative flex min-h-[300px] w-full transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none sm:min-h-[340px] lg:min-h-[360px] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
              <span className="absolute inset-0 flex min-h-full flex-col justify-between rounded-[24px] border border-white/80 bg-gradient-to-br from-white via-white to-sky-50 p-6 shadow-[0_16px_40px_-20px_rgba(15,23,42,0.35)] transition-shadow group-hover:shadow-[0_22px_48px_-20px_rgba(15,23,42,0.4)] [backface-visibility:hidden] sm:p-9 lg:p-12">
                <span className="flex items-center justify-between gap-4">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-2xl" aria-hidden="true">❔</span>
                  <span className="text-xs font-bold uppercase text-sky-700">Question</span>
                </span>
                <span className="py-6 text-2xl font-bold leading-snug text-slate-900 sm:text-3xl sm:leading-snug">{currentCard.front}</span>
                <span className="text-sm font-semibold text-slate-500">Click or tap to reveal the answer <span aria-hidden="true">↗</span></span>
              </span>
              <span className="absolute inset-0 flex min-h-full flex-col justify-between rounded-[24px] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-lime-50 p-6 shadow-[0_16px_40px_-20px_rgba(15,23,42,0.35)] [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-9 lg:p-12">
                <span className="flex items-center justify-between gap-4">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-2xl" aria-hidden="true">✓</span>
                  <span className="text-xs font-bold uppercase text-emerald-700">Answer</span>
                </span>
                <span className="py-6 text-xl font-semibold leading-relaxed text-slate-800 sm:text-2xl">{currentCard.back}</span>
                <span className="text-sm font-semibold text-slate-500">Click or tap to return to the question</span>
              </span>
            </span>
          </button>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            setCardIndex((index) => (index === 0 ? cards.length - 1 : index - 1));
            setIsFlipped(false);
          }}
          className="btn-secondary min-h-11 min-w-28"
        >
          ← Previous
        </button>
        <button
          type="button"
          onClick={() => {
            setCardIndex((index) => (index + 1) % cards.length);
            setIsFlipped(false);
          }}
          className="btn-primary min-h-11 min-w-28"
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default function LearnModuleView({ module }: LearnModuleViewProps) {
  const [topics, setTopics] = useState<TopicRow[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionTab>('Story');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [hasResolvedRole, setHasResolvedRole] = useState(false);
  const [teacherQuizActive, setTeacherQuizActive] = useState(false);

  useEffect(() => {
    setTeacherQuizActive(false);
  }, [module.key]);

  useEffect(() => {
    let isActive = true;

    getCurrentProfile()
      .then((currentProfile) => {
        if (!isActive) return;
        setUserRole(currentProfile?.role ?? null);
        setHasResolvedRole(true);
      })
      .catch(() => {
        if (!isActive) return;
        setUserRole(null);
        setHasResolvedRole(true);
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;

    async function loadData() {
      try {
        const topicRows = await listTopics();

        if (!isActive) {
          return;
        }

        const nextTopic = getLearnTopicForModule(topicRows, module);
        setTopics(topicRows);

        if (!nextTopic) {
          setLessons([]);
          setIsLoading(false);
          return;
        }

        const nextLessons = await listLessonsByTopic(nextTopic.$id);
        const publishedLessons = nextLessons.filter((lesson) => lesson.topic_id === nextTopic.$id && lesson.is_published === true).sort((first, second) => first.order_index - second.order_index);

        setLessons(publishedLessons);
      } catch {
        setLessons([]);
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadData();

    return () => {
      isActive = false;
    };
  }, [module]);

  const storyLessons = lessons.slice(0, Math.max(1, Math.ceil(lessons.length / 2)));
  const technicalLessons = lessons.slice(Math.max(1, Math.ceil(lessons.length / 2)));
  const activeTopic = getLearnTopicForModule(topics, module);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'Story': {
        const story = getModuleStory(module);

        return (
          <div className="space-y-4">
            <SectionCard title="Story" primary>
              <div className="space-y-3 text-sm leading-7 text-slate-600">
                <div>
                  <h4 className="font-semibold text-slate-800">Introduction</h4>
                  <p className="mt-1">{story.introduction}</p>
                </div>
                {story.story.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
              {storyLessons.length > 0 && (
                <div className="mt-5 space-y-4 border-t border-slate-200 pt-4">
                  {storyLessons.map((lesson) => (
                    <div key={lesson.$id}>
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="font-semibold text-slate-900">{lesson.title}</h4>
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{lesson.estimated_minutes} min</span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">{lesson.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard title="How This Connects to the Concept">
              <div className="space-y-3 text-sm leading-7 text-slate-600">
                {story.connection.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Moral / Lesson">
              <p className="text-sm leading-7 text-slate-600">{story.moral}</p>
            </SectionCard>

            <SectionCard title="Key Points">
              <ul className="list-disc space-y-1 pl-5 text-sm leading-7 text-slate-600">
                {story.keyPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard title="Summary">
              <p className="text-sm leading-7 text-slate-600">{story.summary}</p>
            </SectionCard>
          </div>
        );
      }
      case 'Technical': {
        const technical = getModuleTechnical(module);

        return (
          <div className="space-y-4">
            <SectionCard title="What is it?" primary>
              <p className="text-sm leading-7 text-slate-600">{technical.definition}</p>
            </SectionCard>

            <SectionCard title="How does it work?">
              <ol className="list-decimal space-y-2 pl-5 text-sm leading-7 text-slate-600">
                {technical.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </SectionCard>

            <SectionCard title="Example">
              <p className="text-sm leading-7 text-slate-600">{technical.example}</p>
            </SectionCard>

            <SectionCard title="Why is it used?">
              <p className="text-sm leading-7 text-slate-600">{technical.purpose}</p>
            </SectionCard>

            <SectionCard title="Key Things to Know">
              <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600">
                {technical.keyPoints.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              {technicalLessons.length > 0 && (
                <div className="mt-5 space-y-4 border-t border-slate-200 pt-4">
                  {technicalLessons.map((lesson) => (
                    <div key={lesson.$id}>
                      <div className="flex items-center justify-between gap-3">
                        <h4 className="font-semibold text-slate-900">{lesson.title}</h4>
                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{lesson.estimated_minutes} min</span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600">{lesson.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

            <SectionCard title="Common Questions">
              <div className="space-y-4">
                {technical.questions.map(({ question, answer }) => (
                  <div key={question}>
                    <h4 className="font-semibold text-slate-900">Q: {question}</h4>
                    <p className="mt-1 text-sm leading-7 text-slate-600">A: {answer}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Important Terms">
              <dl className="grid gap-3 text-sm leading-6 sm:grid-cols-2">
                {technical.terms.map(({ term, definition }) => (
                  <div key={term}>
                    <dt className="font-semibold text-slate-900">{term}</dt>
                    <dd className="text-slate-600">{definition}</dd>
                  </div>
                ))}
              </dl>
            </SectionCard>
          </div>
        );
      }
      case 'Animation / Visual': {
        const story = getModuleAnimationStory(module);

        return (
          <div className="space-y-6">
            <AnimationStory key={module.key} story={story} />
            <TechnicalAnimation moduleKey={module.key} moduleTitle={module.title} />
            <AnimationVideo />
          </div>
        );
      }
      case 'Flash Cards':
        return <FlashCards key={module.key} module={module} />;
      case 'Quiz':
        if (!hasResolvedRole) {
          return <p className="glass-card p-6 text-sm text-slate-500" role="status">Checking your account...</p>;
        }
        if (userRole === 'teacher') {
          return (
            <SectionCard title="Teacher Quiz Management" primary>
              <p className="text-sm leading-6 text-slate-600">Manage this module&apos;s published quiz questions, create new questions, or edit existing ones.</p>
              <a href={activeTopic ? `/teacher/questions?topicId=${encodeURIComponent(activeTopic.$id)}&from=learn` : '/teacher/questions?from=learn'} className="btn-primary mt-5 inline-flex">Open question manager</a>
            </SectionCard>
          );
        }
        if (userRole !== 'student') {
          return (
            <SectionCard title="Student account required" primary>
              <p className="text-sm leading-6 text-slate-600">Sign in with a Student account to take this quiz.</p>
              <Link href="/login" className="btn-primary mt-5 inline-flex">Log in</Link>
            </SectionCard>
          );
        }
        if (!activeTopic) {
          return <p className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Quiz is not available yet for this module.</p>;
        }

        if (teacherQuizActive) {
          return (
            <QuizRunner
              key={`${activeTopic.$id}-teacher`}
              topic={{
                id: activeTopic.$id,
                title: activeTopic.title,
                description: activeTopic.description,
                difficulty: activeTopic.difficulty,
              }}
              mode="teacher"
              onExit={() => setTeacherQuizActive(false)}
            />
          );
        }

        return (
          <LevelQuiz
            key={activeTopic.$id}
            topic={{
              id: activeTopic.$id,
              title: activeTopic.title,
              description: activeTopic.description,
              difficulty: activeTopic.difficulty,
            }}
            onTeacherQuiz={() => setTeacherQuizActive(true)}
          />
        );
      case 'Assessment':
        if (!hasResolvedRole) {
          return <p className="glass-card p-6 text-sm text-slate-500" role="status">Checking your account...</p>;
        }
        if (userRole === 'teacher') {
          return (
            <SectionCard title="Teacher Assessment Management" primary>
              <p className="text-sm leading-6 text-slate-600">Manage assessment questions by topic and lesson, or create a new assessment question.</p>
              <a href={activeTopic ? `/teacher/assessment?topicId=${encodeURIComponent(activeTopic.$id)}&from=learn` : '/teacher/assessment?from=learn'} className="btn-primary mt-5 inline-flex">Open assessment manager</a>
            </SectionCard>
          );
        }
        if (userRole !== 'student') {
          return (
            <SectionCard title="Student account required" primary>
              <p className="text-sm leading-6 text-slate-600">Sign in with a Student account to take this assessment.</p>
              <Link href="/login" className="btn-primary mt-5 inline-flex">Log in</Link>
            </SectionCard>
          );
        }
        return activeTopic ? <LessonAssessment topic={{ id: activeTopic.$id, title: activeTopic.title }} /> : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-lg font-bold text-slate-900">Assessment coming soon</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">This module does not have a topic available for assessments yet.</p>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <main className="section-shell py-10 sm:py-14">
        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <LearnSidebar activeSlug={module.slug} />
          <div className="glass-card p-6 text-sm text-slate-500" aria-busy="true">Loading {module.title} learning content...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="section-shell py-10 sm:py-14">
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <LearnSidebar activeSlug={module.slug} />

        <div className="min-w-0 space-y-6">
          <section className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-brand-50 via-white to-indigo-50 p-6 shadow-soft sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Learning module</p>
                <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{module.title}</h1>
              </div>
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-sm" aria-hidden="true">
                {module.icon}
              </span>
            </div>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{module.description}</p>
          </section>

          <div className="space-y-6">
            <section className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-soft sm:p-5">
              <div className="overflow-x-auto pb-1">
                <nav className="flex min-w-max gap-2" aria-label="Learning section navigation">
                  {SECTION_TABS.map((section) => {
                    const isActive = activeSection === section;

                    return (
                      <button
                        key={section}
                        type="button"
                        onClick={() => setActiveSection(section)}
                        className={`whitespace-nowrap rounded-xl border px-3 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                          isActive
                            ? 'border-brand-200 bg-brand-600 text-white shadow-sm'
                            : 'border-slate-200 bg-slate-100 text-slate-700 hover:border-brand-200 hover:bg-brand-50'
                        }`}
                      >
                        {section}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">{activeSection}</p>
                <div className="mt-4">{renderActiveSection()}</div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
