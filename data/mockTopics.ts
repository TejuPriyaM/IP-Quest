export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type AccentCategory = 'blue' | 'orange' | 'green' | 'pink' | 'purple';
export type TopicIcon = 'book' | 'lightbulb' | 'shield' | 'copy' | 'sparkles';

export type Topic = {
  id: string;
  title: string;
  slug: string;
  description: string;
  educationalSummary: string;
  icon: TopicIcon;
  difficulty: DifficultyLevel;
  progress: number;
  lessonCount: number;
  xpReward: number;
  accentCategory: AccentCategory;
};

export const topics: Topic[] = [
  {
    id: 'copyright',
    title: 'Copyright',
    slug: 'copyright',
    description: 'Protects original creative work such as writing, art, music, and digital content.',
    educationalSummary:
      'Students learn how creators are recognised, how sharing work responsibly matters, and why attribution and permission help protect originality.',
    icon: 'book',
    difficulty: 'Beginner',
    progress: 72,
    lessonCount: 4,
    xpReward: 120,
    accentCategory: 'blue',
  },
  {
    id: 'patents',
    title: 'Patents',
    slug: 'patents',
    description: 'Protects inventions and useful new ideas that solve real-world problems.',
    educationalSummary:
      'This topic introduces how inventions are different from ideas, why patents matter for innovation, and how new solutions can be protected ethically.',
    icon: 'lightbulb',
    difficulty: 'Intermediate',
    progress: 48,
    lessonCount: 5,
    xpReward: 150,
    accentCategory: 'orange',
  },
  {
    id: 'trademarks',
    title: 'Trademarks',
    slug: 'trademarks',
    description: 'Protects names, logos, and brand symbols that help people recognise a product.',
    educationalSummary:
      'Learners explore how brands build trust, why logos matter, and how trademarks help businesses and customers recognise quality.',
    icon: 'shield',
    difficulty: 'Beginner',
    progress: 63,
    lessonCount: 4,
    xpReward: 110,
    accentCategory: 'green',
  },
  {
    id: 'plagiarism',
    title: 'Plagiarism',
    slug: 'plagiarism',
    description: 'Awareness topic about originality, copying, attribution, and respectful content use.',
    educationalSummary:
      'This topic helps students understand why copying someone else’s work without credit is harmful, and how to give credit and create original ideas responsibly.',
    icon: 'copy',
    difficulty: 'Intermediate',
    progress: 58,
    lessonCount: 3,
    xpReward: 130,
    accentCategory: 'pink',
  },
  {
    id: 'innovation-design',
    title: 'Innovation & Design',
    slug: 'innovation-design',
    description: 'Explores how creativity, design thinking, and problem-solving turn ideas into real value.',
    educationalSummary:
      'Students discover how new ideas are shaped, tested, and improved through creativity and thoughtful design while respecting the rights of others.',
    icon: 'sparkles',
    difficulty: 'Advanced',
    progress: 41,
    lessonCount: 5,
    xpReward: 170,
    accentCategory: 'purple',
  },
];
