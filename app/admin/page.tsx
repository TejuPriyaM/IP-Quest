'use client';

import { useEffect, useState } from 'react';
import AuthGuard from '@/components/AuthGuard';
import { createCurrentUserJWT } from '@/lib/auth';

type AssignmentStatus = 'pending' | 'approved' | 'rejected' | 'revoked';
type Assignment = {
  assignmentId: string;
  teacherId: string;
  studentId: string;
  teacherEmail: string | null;
  studentEmail: string | null;
  status: AssignmentStatus;
  requestedAt: string | null;
  reviewedAt: string | null;
};

type AssignmentDecision = 'approve' | 'reject' | 'revoke';

export default function AdminPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actingId, setActingId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let isActive = true;

    async function loadAssignments() {
      setIsLoading(true);
      setError('');
      try {
        const jwt = await createCurrentUserJWT();
        const response = await fetch('/api/admin/teacher-assignments', {
          headers: { Authorization: `Bearer ${jwt}` },
        });
        const payload: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          const message = typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
            ? payload.error
            : 'Unable to load assignment requests.';
          throw new Error(message);
        }
        if (isActive) setAssignments((payload as { assignments: Assignment[] }).assignments);
      } catch (loadError) {
        if (isActive) setError(loadError instanceof Error ? loadError.message : 'Unable to load assignment requests.');
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    void loadAssignments();
    return () => { isActive = false; };
  }, []);

  async function decide(assignmentId: string, decision: AssignmentDecision) {
    setActingId(assignmentId);
    setError('');
    setNotice('');
    try {
      const jwt = await createCurrentUserJWT();
      const response = await fetch('/api/admin/teacher-assignments', {
        method: 'POST',
        headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId, decision }),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message = typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
          ? payload.error
          : 'Unable to update the assignment.';
        throw new Error(message);
      }
      const result = payload as { status: AssignmentStatus };
      setAssignments((current) => current.map((assignment) =>
        assignment.assignmentId === assignmentId ? { ...assignment, status: result.status } : assignment,
      ));
      setNotice(`Assignment ${result.status}.`);
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : 'Unable to update the assignment.');
    } finally {
      setActingId('');
    }
  }

  return (
    <AuthGuard allowedRoles={['admin']}>
      <main className="section-shell py-10 sm:py-14">
        <section className="rounded-3xl bg-slate-950 p-8 text-white shadow-soft sm:p-10">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-amber-300">Admin hub</p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Keep IP Quest running smoothly.</h1>
          <p className="mt-4 max-w-2xl text-slate-300">Your administration workspace is ready for platform oversight and account management.</p>
        </section>

        <section className="mt-8" aria-labelledby="teacher-assignments-heading">
          <div className="border-b border-slate-200 pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Access review</p>
            <h2 id="teacher-assignments-heading" className="mt-1 text-2xl font-bold text-slate-900">Teacher-student assignments</h2>
          </div>
          {error && <p role="alert" className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error}</p>}
          {notice && <p role="status" className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}
          {isLoading ? <p className="mt-4 text-sm text-slate-600">Loading assignments...</p> : assignments.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600">No assignment requests.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-3 pr-4 font-semibold">Teacher</th>
                    <th className="px-3 py-3 font-semibold">Student</th>
                    <th className="px-3 py-3 font-semibold">Status</th>
                    <th className="px-3 py-3 font-semibold">Requested</th>
                    <th className="px-3 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((assignment) => (
                    <tr key={assignment.assignmentId} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pr-4 text-slate-800">{assignment.teacherEmail ?? assignment.teacherId}</td>
                      <td className="px-3 py-3 text-slate-800">{assignment.studentEmail ?? assignment.studentId}</td>
                      <td className="px-3 py-3 capitalize text-slate-700">{assignment.status}</td>
                      <td className="px-3 py-3 text-slate-600">{assignment.requestedAt ? new Date(assignment.requestedAt).toLocaleDateString() : 'Unknown'}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-2">
                          {assignment.status === 'pending' && (
                            <>
                              <button type="button" disabled={actingId === assignment.assignmentId} onClick={() => void decide(assignment.assignmentId, 'approve')} className="btn-primary px-3 py-2 text-sm disabled:opacity-60">Approve</button>
                              <button type="button" disabled={actingId === assignment.assignmentId} onClick={() => void decide(assignment.assignmentId, 'reject')} className="btn-secondary px-3 py-2 text-sm disabled:opacity-60">Reject</button>
                            </>
                          )}
                          {assignment.status === 'approved' && (
                            <button type="button" disabled={actingId === assignment.assignmentId} onClick={() => void decide(assignment.assignmentId, 'revoke')} className="btn-secondary px-3 py-2 text-sm disabled:opacity-60">Revoke</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </AuthGuard>
  );
}