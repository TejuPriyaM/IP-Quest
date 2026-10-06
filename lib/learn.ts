import type { TopicRow } from '@/lib/topics';

export type LearnModule = {
  key: string;
  title: string;
  slug: string;
  icon: string;
  description: string;
  aliases: string[];
};

export const LEARN_MODULES: LearnModule[] = [
  {
    key: 'patent',
    title: 'Patent',
    slug: 'patent',
    icon: '🧠',
    description: 'Explore how new ideas and inventions can be protected and shared responsibly.',
    aliases: ['patent', 'patents'],
  },
  {
    key: 'copyright',
    title: 'Copyright',
    slug: 'copyright',
    icon: '©️',
    description: 'Learn how original stories, art, music, and creative work are protected.',
    aliases: ['copyright', 'copyrights'],
  },
  {
    key: 'trademark',
    title: 'Trademark',
    slug: 'trademark',
    icon: '™️',
    description: 'Discover how names, logos, and symbols help customers recognise a brand.',
    aliases: ['trademark', 'trademarks'],
  },
  {
    key: 'trade-secret',
    title: 'Trade Secret',
    slug: 'trade-secret',
    icon: '🔐',
    description: 'Understand how confidential business information can remain protected.',
    aliases: ['trade-secret', 'trade-secret', 'trade-secret', 'trade_secret', 'trade secret', 'trade-secrets'],
  },
  {
    key: 'plagiarism',
    title: 'Plagiarism',
    slug: 'plagiarism',
    icon: '📝',
    description: 'Learn how to respect original work, credit sources, and create honestly.',
    aliases: ['plagiarism', 'plagiarisms'],
  },
];

export function normalizeLearnKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getLearnModuleBySlug(input: string | null | undefined): LearnModule | undefined {
  const normalizedInput = normalizeLearnKey(input ?? '');

  if (!normalizedInput) {
    return undefined;
  }

  return LEARN_MODULES.find((module) => {
    const moduleKeys = [module.title, module.slug, ...module.aliases];
    return moduleKeys.some((value) => normalizeLearnKey(value) === normalizedInput);
  });
}

export function getLearnTopicForModule(topics: TopicRow[], module: LearnModule): TopicRow | undefined {
  const candidateKeys = new Set(
    [module.title, module.slug, ...module.aliases].map((value) => normalizeLearnKey(value)),
  );

  return topics.find((topic) => {
    const topicKeys = [topic.title, topic.slug];
    return topicKeys.some((value) => candidateKeys.has(normalizeLearnKey(value))); 
  });
}
