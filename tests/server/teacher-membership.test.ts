import { describe, expect, it } from 'vitest';
import { POST } from '@/app/api/teachers/membership/route';

describe('public teacher membership provisioning', () => {
  it('refuses requests that try to add the caller to the trusted teacher group', async () => {
    const request = new Request('http://localhost/api/teachers/membership', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'attacker-user', role: 'teacher' }),
    });

    const response = await POST(request);

    expect(response.status).toBe(403);
  });
});
