'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createCurrentUserJWT, getCurrentProfile, type UserRole } from '@/lib/auth';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

function greeting(role: UserRole): ChatMessage {
  return {
    role: 'assistant',
    content: role === 'teacher'
      ? 'I can help draft clear IP lessons, examples, stories, and original questions.'
      : 'Ask me about patents, copyright, trademarks, trade secrets, or plagiarism.',
  };
}

export default function ChatbotWidget() {
  const pathname = usePathname();
  const [role, setRole] = useState<UserRole | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const activeRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    let active = true;
    activeRequest.current?.abort();
    activeRequest.current = null;
    setIsLoading(true);
    setIsSending(false);
    setError('');
    setMessages([]);
    getCurrentProfile()
      .then((currentProfile) => {
        if (!active) return;
        const currentRole = currentProfile?.role ?? null;
        setRole(currentRole);
        setMessages(currentRole ? [greeting(currentRole)] : []);
      })
      .catch(() => {
        if (!active) return;
        setRole(null);
        setMessages([]);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
      activeRequest.current?.abort();
      activeRequest.current = null;
    };
  }, [pathname]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !role || isSending) return;

    const userMessage: ChatMessage = { role: 'user', content };
    const nextMessages = [...messages.slice(-7), userMessage];
    setMessages(nextMessages);
    setDraft('');
    setError('');
    setIsSending(true);
    const controller = new AbortController();
    activeRequest.current = controller;

    try {
      const jwt = await createCurrentUserJWT();
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages, contextPath: pathname || '/' }),
        signal: controller.signal,
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message = typeof payload === 'object' && payload !== null && 'error' in payload && typeof payload.error === 'string'
          ? payload.error
          : 'The assistant is unavailable right now. Please try again.';
        throw new Error(message);
      }
      if (typeof payload !== 'object' || payload === null || !('message' in payload) || typeof payload.message !== 'string') {
        throw new Error('The assistant returned an invalid response. Please try again.');
      }
      setMessages((current) => [...current, { role: 'assistant', content: payload.message as string }]);
    } catch (submitError) {
      if (!controller.signal.aborted) {
        setError(submitError instanceof Error ? submitError.message : 'The assistant is unavailable right now. Please try again.');
      }
    } finally {
      if (activeRequest.current === controller) {
        activeRequest.current = null;
        setIsSending(false);
      }
    }
  }

  if (isLoading || !role) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 sm:bottom-6 sm:right-6">
      {isOpen && (
        <section
          role="dialog"
          aria-modal="false"
          aria-labelledby="ip-quest-chat-title"
          className="mb-3 flex max-h-[min(34rem,75vh)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          style={{ width: 'min(25rem, calc(100vw - 2rem))' }}
        >
          <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <h2 id="ip-quest-chat-title" className="font-bold text-slate-900">IP Quest Assistant</h2>
              <p className="text-xs text-slate-500">{role === 'teacher' ? 'Teacher workspace' : 'Student learning'}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              title="Close chat"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                <path fillRule="evenodd" d="M4.22 4.22a.75.75 0 011.06 0L10 8.94l4.72-4.72a.75.75 0 111.06 1.06L11.06 10l4.72 4.72a.75.75 0 11-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 11-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
            </button>
          </header>

          <div className="min-h-32 flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite" aria-relevant="additions text">
            {messages.map((message, index) => (
              <p
                key={`${index}-${message.role}`}
                className={`max-w-[90%] whitespace-pre-wrap rounded-xl px-3 py-2 text-sm leading-6 ${message.role === 'user' ? 'ml-auto bg-brand-600 text-white' : 'bg-slate-100 text-slate-800'}`}
              >
                {message.content}
              </p>
            ))}
            {isSending && <p className="text-sm text-slate-500" role="status">Thinking...</p>}
            {error && <p className="rounded-lg bg-rose-50 p-2 text-sm text-rose-700" role="alert">{error}</p>}
          </div>

          <form onSubmit={handleSubmit} className="border-t border-slate-200 p-3">
            <label htmlFor="ip-quest-chat-input" className="sr-only">Message the IP Quest assistant</label>
            <div className="flex items-end gap-2">
              <textarea
                id="ip-quest-chat-input"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                maxLength={1500}
                rows={2}
                placeholder="Ask a question..."
                className="min-h-12 flex-1 resize-y rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
              />
              <button
                type="submit"
                disabled={!draft.trim() || isSending}
                aria-label="Send message"
                title="Send message"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                  <path d="M2.94 2.94a.75.75 0 01.79-.18l13 5a.75.75 0 010 1.4l-13 5A.75.75 0 012.5 13.5v-3.1l7.25-.4-7.25-.4V6.5a.75.75 0 01.44-.68V2.94z" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">Chat resets when you change pages.</p>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? 'Close IP Quest Assistant' : 'Open IP Quest Assistant'}
        aria-expanded={isOpen}
        title="IP Quest Assistant"
        className="ml-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-white shadow-lg transition hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 9h10M7 13h6m-7 7 2.2-3.3A8 8 0 114 14.2L3 20z" />
        </svg>
      </button>
    </div>
  );
}
