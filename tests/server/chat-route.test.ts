import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ generateChatReply: vi.fn() }));

vi.mock('@/lib/server/chat', () => {
  class MockChatError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
    }
  }
  return { ChatError: MockChatError, generateChatReply: mocks.generateChatReply };
});

import { POST } from '@/app/api/chat/route';
import { ChatError } from '@/lib/server/chat';

function post(body: string, headers: Record<string, string> = {}) {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body,
  });
}

describe('chat API route', () => {
  it('rejects unauthenticated requests before calling chat service', async () => {
    const response = await POST(post('{}'));

    expect(response.status).toBe(401);
    expect(mocks.generateChatReply).not.toHaveBeenCalled();
  });

  it('rejects malformed JSON', async () => {
    const response = await POST(post('{invalid', { Authorization: 'Bearer student-jwt' }));

    expect(response.status).toBe(400);
    expect(mocks.generateChatReply).not.toHaveBeenCalled();
  });

  it('rejects oversized bodies before processing them', async () => {
    const response = await POST(post('{}', {
      Authorization: 'Bearer student-jwt',
      'Content-Length': '12001',
    }));

    expect(response.status).toBe(413);
    expect(mocks.generateChatReply).not.toHaveBeenCalled();
  });

  it('passes the bearer JWT and parsed body to server authorization', async () => {
    mocks.generateChatReply.mockResolvedValue({ message: 'Hello.' });
    const body = { messages: [{ role: 'user', content: 'Hi' }], contextPath: '/learn', role: 'teacher', userId: 'spoofed' };

    const response = await POST(post(JSON.stringify(body), { Authorization: 'Bearer student-jwt' }));

    expect(response.status).toBe(200);
    expect(mocks.generateChatReply).toHaveBeenCalledWith('student-jwt', body);
  });

  it('maps safe chat errors to HTTP status codes', async () => {
    mocks.generateChatReply.mockRejectedValue(new ChatError('Approved access required.', 403));

    const response = await POST(post('{}', { Authorization: 'Bearer student-jwt' }));

    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({ error: 'Approved access required.' });
    expect(response.headers.get('Cache-Control')).toBe('no-store');
  });
});
