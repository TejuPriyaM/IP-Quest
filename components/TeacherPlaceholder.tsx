import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';

type TeacherPlaceholderProps = {
  title: string;
  description: string;
};

export default function TeacherPlaceholder({ title, description }: TeacherPlaceholderProps) {
  return (
    <AuthGuard allowedRoles={['teacher']}>
      <main className="section-shell py-10 sm:py-14">
        <section className="glass-card max-w-3xl p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Teacher workspace</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{title}</h1>
          <p className="mt-4 text-base leading-7 text-slate-600">{description}</p>
          <p className="mt-4 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-900">This feature is coming next. The workspace will be available here in a future update.</p>
          <Link href="/teacher" className="btn-primary mt-6">Back to Teacher Dashboard</Link>
        </section>
      </main>
    </AuthGuard>
  );
}