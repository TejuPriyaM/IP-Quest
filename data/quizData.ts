import type { DifficultyLevel } from '@/data/mockTopics';

export type QuizTopicId = 'copyright' | 'patents' | 'trademarks' | 'plagiarism' | 'innovation-design';

export type QuizQuestion = {
  id: string;
  topic: QuizTopicId;
  question: string;
  options: string[];
  correctOption: string;
  explanation: string;
  difficulty: DifficultyLevel;
};

export type QuizTopic = {
  id: QuizTopicId;
  name: string;
  description: string;
  difficulty: DifficultyLevel;
  questions: number;
  xpReward: number;
  accent: string;
  icon: string;
};

export const quizTopics: QuizTopic[] = [
  { id: 'copyright', name: 'Copyright', description: 'Explore how creative work is protected and shared responsibly.', difficulty: 'Beginner', questions: 3, xpReward: 60, accent: 'blue', icon: 'BOOK' },
  { id: 'patents', name: 'Patents', description: 'Discover how inventions can become protected innovations.', difficulty: 'Intermediate', questions: 2, xpReward: 50, accent: 'orange', icon: 'IDEA' },
  { id: 'trademarks', name: 'Trademarks', description: 'Learn how names, logos, and symbols help identify brands.', difficulty: 'Beginner', questions: 2, xpReward: 40, accent: 'green', icon: 'TM' },
  { id: 'plagiarism', name: 'Plagiarism', description: 'Practise recognising originality, attribution, and honest creation.', difficulty: 'Intermediate', questions: 2, xpReward: 50, accent: 'pink', icon: 'COPY' },
  { id: 'innovation-design', name: 'Innovation & Design', description: 'Think like a designer solving meaningful problems.', difficulty: 'Advanced', questions: 1, xpReward: 30, accent: 'purple', icon: 'SPARK' },
];

export const quizQuestions: QuizQuestion[] = [
  { id: 'copyright-1', topic: 'copyright', question: 'Which type of IP can protect an original song or story?', options: ['Patent', 'Copyright', 'Trademark', 'Trade secret'], correctOption: 'Copyright', explanation: 'Copyright protects original creative expression such as writing, music, art, and video.', difficulty: 'Beginner' },
  { id: 'copyright-2', topic: 'copyright', question: 'What is a thoughtful way to use someone else\'s artwork in a school project?', options: ['Remove the artist\'s name', 'Claim you made it', 'Give credit and check permission', 'Share it without context'], correctOption: 'Give credit and check permission', explanation: 'Attribution and permission help respect the creator\'s work and rights.', difficulty: 'Beginner' },
  { id: 'copyright-3', topic: 'copyright', question: 'Which item is most likely protected by copyright?', options: ['A brand slogan only', 'A new machine mechanism', 'A student\'s original poem', 'A company registration number'], correctOption: 'A student\'s original poem', explanation: 'An original poem is creative expression and can receive copyright protection.', difficulty: 'Beginner' },
  { id: 'patents-1', topic: 'patents', question: 'What do patents generally protect?', options: ['New inventions', 'Favourite colours', 'School uniforms', 'Every business idea'], correctOption: 'New inventions', explanation: 'Patents can protect qualifying inventions and useful technical solutions.', difficulty: 'Intermediate' },
  { id: 'patents-2', topic: 'patents', question: 'Why might an inventor apply for a patent?', options: ['To hide every idea forever', 'To protect a qualifying invention', 'To copyright a song', 'To rename a product'], correctOption: 'To protect a qualifying invention', explanation: 'A patent can give an inventor rights over a qualifying invention for a limited period.', difficulty: 'Intermediate' },
  { id: 'trademarks-1', topic: 'trademarks', question: 'What helps customers recognise a particular brand?', options: ['A trademark', 'A patent number', 'A private diary', 'A homework grade'], correctOption: 'A trademark', explanation: 'Names, logos, and symbols can act as trademarks that distinguish a brand.', difficulty: 'Beginner' },
  { id: 'trademarks-2', topic: 'trademarks', question: 'Which could be used as a trademark?', options: ['A brand logo', 'A secret invention process', 'A science experiment result', 'A copied paragraph'], correctOption: 'A brand logo', explanation: 'A distinctive logo can help identify the source of goods or services.', difficulty: 'Beginner' },
  { id: 'plagiarism-1', topic: 'plagiarism', question: 'What is plagiarism?', options: ['Creating an original idea', 'Using someone\'s work without proper credit', 'Improving your draft', 'Asking for feedback'], correctOption: 'Using someone\'s work without proper credit', explanation: 'Plagiarism presents another person\'s work or ideas as your own without appropriate credit.', difficulty: 'Intermediate' },
  { id: 'plagiarism-2', topic: 'plagiarism', question: 'What is the best first step when using a source in your assignment?', options: ['Copy it exactly', 'Record the source and plan a citation', 'Delete the author\'s name', 'Change one word'], correctOption: 'Record the source and plan a citation', explanation: 'Tracking sources makes it easier to credit ideas accurately and write in your own words.', difficulty: 'Intermediate' },
  { id: 'innovation-1', topic: 'innovation-design', question: 'What is a useful part of design thinking?', options: ['Ignoring the problem', 'Testing and improving ideas', 'Copying the first solution', 'Avoiding feedback'], correctOption: 'Testing and improving ideas', explanation: 'Design thinking uses feedback and iteration to develop better solutions.', difficulty: 'Advanced' },
];

export const getQuestionsForTopic = (topicId: QuizTopicId) => quizQuestions.filter((question) => question.topic === topicId);
