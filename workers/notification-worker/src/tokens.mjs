const encoder = new TextEncoder();
const hex = (bytes) => [...new Uint8Array(bytes)].map((value) => value.toString(16).padStart(2, '0')).join('');

export async function hashOpaqueToken(token) {
  return hex(await crypto.subtle.digest('SHA-256', encoder.encode(token)));
}

export async function issueUnsubscribeToken(repository, { userId, subscriptionId, ttlDays = 30, now = new Date() }) {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const token = btoa(String.fromCharCode(...bytes)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
  const tokenHash = await hashOpaqueToken(token);
  const expiresAt = new Date(now.getTime() + ttlDays * 86400000).toISOString();
  await repository.storeUnsubscribeToken({ tokenHash, userId, subscriptionId, expiresAt, createdAt: now.toISOString() });
  return token;
}

export async function consumeUnsubscribeToken(repository, token, now = new Date()) {
  if (!token || token.length < 40) return { ok: false, reason: 'TOKEN_INVALID' };
  const tokenHash = await hashOpaqueToken(token);
  return repository.consumeUnsubscribeToken(tokenHash, now.toISOString());
}
