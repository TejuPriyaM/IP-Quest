export type DashboardTone = 'blue' | 'green' | 'amber' | 'violet';

export type DashboardCardData = {
  title: string;
  value: string;
  supportingText: string;
  icon: string;
  tone: DashboardTone;
};

export type ActivityItem = {
  id: string;
  label: string;
  detail: string;
  time: string;
  icon: string;
  tone: DashboardTone;
};

export type Achievement = {
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
};

export const dashboardCards: DashboardCardData[] = [
  { title: 'Total XP', value: '420 XP', supportingText: '+80 XP this week', icon: 'XP', tone: 'blue' },
  { title: 'Current level', value: 'Level 4', supportingText: '80 XP to level 5', icon: '4', tone: 'violet' },
  { title: 'Topics completed', value: '3 of 5', supportingText: 'Two topics to go', icon: '✓', tone: 'green' },
  { title: 'Learning streak', value: '6 days', supportingText: 'Best streak: 9 days', icon: '⚡', tone: 'amber' },
];

export const recentActivities: ActivityItem[] = [
  { id: 'a1', label: 'Completed a copyright lesson', detail: 'Creative work and ownership', time: 'Today', icon: '✓', tone: 'green' },
  { id: 'a2', label: 'Earned 40 XP', detail: 'Copyright quiz score: 9/10', time: 'Yesterday', icon: 'XP', tone: 'blue' },
  { id: 'a3', label: 'Started a patents lesson', detail: 'How inventions get protected', time: '2 days ago', icon: '✦', tone: 'violet' },
  { id: 'a4', label: 'Completed a learning challenge', detail: 'Originality detective', time: '4 days ago', icon: '★', tone: 'amber' },
];

export const achievements: Achievement[] = [
  { title: 'First Lesson', description: 'Complete your first lesson', icon: '1', unlocked: true },
  { title: 'Quiz Starter', description: 'Finish your first quiz', icon: '?', unlocked: true },
  { title: 'IP Explorer', description: 'Explore all five topics', icon: '✦', unlocked: false },
  { title: 'Innovation Thinker', description: 'Complete Innovation & Design', icon: '↗', unlocked: false },
];

export const recommendedTopic = {
  title: 'Patents',
  summary: 'Dive into how new inventions can be protected and recognised.',
  progress: 42,
  lessons: '2 of 5 lessons',
  icon: '💡',
};

export const overallProgress = {
  percentage: 68,
  completedLessons: 17,
  totalLessons: 25,
};
