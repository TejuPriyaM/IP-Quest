import AuthGuard from '@/components/AuthGuard';

export default function AdminPage() {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <main className="section-shell py-10 sm:py-14">
        <section className="rounded-3xl bg-slate-950 p-8 text-white shadow-soft sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-300">Admin hub</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Keep IP Quest running smoothly.</h1>
          <p className="mt-4 max-w-2xl text-slate-300">Your administration workspace is ready for platform oversight and account management.</p>
        </section>
      </main>
    </AuthGuard>
  );
}