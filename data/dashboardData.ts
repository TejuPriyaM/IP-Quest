export type DashboardCardData = {
  title: string;
  value: string;
  change: string;
  tone: 'blue' | 'green' | 'amber' | 'violet';
};

export type ActivityItem = {
  id: string;
  label: string;
  detail: string;
  time: string;
};

export const dashboardCards: DashboardCardData[] = [
  { title: 'Learning progress', value: '68%', change: '+12% this week', tone: 'blue' },
  { title: 'Points earned', value: '420 XP', change: '+80 XP', tone: 'green' },
  { title: 'Streak', value: '6 days', change: 'Keep going', tone: 'amber' },
];

export const recentActivities: ActivityItem[] = [
  { id: 'a1', label: 'Completed copyright quiz', detail: 'Scored 9/10', time: 'Today' },
  { id: 'a2', label: 'Reviewed trademarks lesson', detail: '2 new examples studied', time: 'Yesterday' },
  { id: 'a3', label: 'Unlocked badge', detail: 'Creative Explorer', time: '2 days ago' },
];

export const recommendedTopic = {
  title: 'Patents',
  summary: 'Dive into how new inventions can be protected and recognised.',
};
