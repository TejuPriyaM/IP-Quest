import Link from 'next/link';
import { LEARN_MODULES, type LearnModule } from '@/lib/learn';

type LearnSidebarProps = {
  activeSlug: string;
};

export default function LearnSidebar({ activeSlug }: LearnSidebarProps) {
  return (
    <aside className="w-full lg:w-72">
      <div className="rounded-[28px] border border-slate-200 bg-white/80 p-4 shadow-soft backdrop-blur-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Modules</p>
        <nav aria-label="Learn modules" className="mt-4 flex flex-col gap-2">
          {LEARN_MODULES.map((module: LearnModule) => {
            const isActive = activeSlug === module.slug || activeSlug === module.key;

            return (
              <Link
                key={module.slug}
                href={`/learn/${module.slug}`}
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${
                  isActive
                    ? 'border-brand-200 bg-brand-50 text-brand-900 shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-brand-200 hover:bg-brand-50/50'
                }`}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-lg shadow-sm" aria-hidden="true">
                  {module.icon}
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
