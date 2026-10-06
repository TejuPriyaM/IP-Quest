'use client';

import LearnModuleView from '@/components/learn/LearnModuleView';
import { getLearnModuleBySlug, LEARN_MODULES } from '@/lib/learn';

export default function LearnPage() {
  const selectedModule = getLearnModuleBySlug('patent') ?? LEARN_MODULES[0];

  return <LearnModuleView module={selectedModule} />;
}
