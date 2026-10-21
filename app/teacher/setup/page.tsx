import Link from 'next/link';

export default function TeacherSetupPage() {
  return (
    <main className="section-shell flex min-h-[70vh] items-center justify-center py-12 sm:py-16">
      <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-soft sm:p-9" aria-labelledby="teacher-setup-heading">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">Teacher workspace</p>
        <h1 id="teacher-setup-heading" className="mt-3 text-3xl font-black tracking-tight text-slate-950">Teacher access is not active</h1>
        <p className="mt-4 leading-7 text-slate-600">
          This account does not have server-managed Teachers team membership. A profile role by itself cannot grant access to teacher tools.
          New Teacher registrations are enrolled automatically when the account profile is created.
        </p>
        <Link href="/" className="btn-secondary mt-6">Return home</Link>
      </section>
    </main>
  );
}
