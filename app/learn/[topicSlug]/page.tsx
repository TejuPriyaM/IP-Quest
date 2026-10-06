'use client';

import { useParams } from 'next/navigation';
import LearnModuleView from '@/components/learn/LearnModuleView';
import { getLearnModuleBySlug, LEARN_MODULES } from '@/lib/learn';

export default function LearnModuleRoutePage() {
  const params = useParams<{ topicSlug: string }>();
  const topicSlug = decodeURIComponent(params.topicSlug ?? '');
  const selectedModule = getLearnModuleBySlug(topicSlug) ?? LEARN_MODULES[0];
  return <LearnModuleView module={selectedModule} />;
}