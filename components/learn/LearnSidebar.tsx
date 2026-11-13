import Link from 'next/link';
import { LEARN_MODULES, type LearnModule } from '@/lib/learn';
import ModuleIcon from '@/components/learn/ModuleIcon';

type LearnSidebarProps = {
  activeSlug: string;
};

export default function LearnSidebar({ activeSlug }: LearnSidebarProps) {
  return (
    <aside className="learn-sidebar w-full lg:w-72">
      <div className="glass-card p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Modules</p>
        <nav aria-label="Learn modules" className="mt-4 flex flex-col gap-2">
          {LEARN_MODULES.map((module: LearnModule) => {
            const isActive = activeSlug === module.slug || activeSlug === module.key;

            return (
              <Link
                key={module.slug}
                href={`/learn/${module.slug}`}
                  className={`flex items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                  isActive
                    ? 'border-brand-200 bg-brand-50 text-brand-900 shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-brand-200 hover:bg-brand-50/50'
                }`}
              >
                <span className={`learn-sidebar-icon flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm ${isActive ? 'text-brand-700' : 'text-slate-600'}`} aria-hidden="true">
                  <ModuleIcon moduleKey={module.key} className="h-[18px] w-[18px]" />
                </span>
                <span>{module.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
