import { normalizeTarget } from './targets.mjs';

const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers }
});

const booleanPreferenceKeys = new Set(['email_enabled', 'new_tests', 'verified_changes', 'new_comparisons', 'datagraphe_news']);

export class MemoryRateLimiter {
  constructor(limit = 30, windowMs = 60_000) { this.limit = limit; this.windowMs = windowMs; this.hits = new Map(); }
  take(key) {
    const timestamp = Date.now();
    const entry = this.hits.get(key);
    if (!entry || timestamp - entry.startedAt >= this.windowMs) { this.hits.set(key, { startedAt: timestamp, count: 1 }); return true; }
    if (entry.count >= this.limit) return false;
    entry.count += 1;
    return true;
  }
}

function corsHeaders(origin, allowedOrigins) {
  if (!origin || !allowedOrigins.includes(origin)) return {};
  return { 'access-control-allow-origin': origin, vary: 'Origin', 'access-control-allow-credentials': 'true' };
}

async function parseBody(request) {
  const length = Number(request.headers.get('content-length') ?? 0);
  if (length > 8192) throw new Error('PAYLOAD_TOO_LARGE');
  return request.json();
}

export function createUserApi({ authenticate, repository, allowedOrigins, rateLimiter = new MemoryRateLimiter() }) {
  return async function handle(request) {
    const url = new URL(request.url);
    const origin = request.headers.get('origin');
    const cors = corsHeaders(origin, allowedOrigins);
    if (request.method === 'OPTIONS') {
      if (!origin || !allowedOrigins.includes(origin)) return json({ error: 'ORIGIN_FORBIDDEN' }, 403);
      return new Response(null, { status: 204, headers: { ...cors, 'access-control-allow-methods': 'GET,POST,PATCH,DELETE,OPTIONS', 'access-control-allow-headers': 'authorization,content-type' } });
    }

    let identity;
    try { identity = await authenticate(request); }
    catch { return json({ error: 'AUTH_CONFIGURATION_ERROR' }, 503, cors); }
    if (!identity) return json({ error: 'UNAUTHENTICATED' }, 401, cors);

    const mutative = ['POST', 'PATCH', 'DELETE'].includes(request.method);
    if (mutative && (!origin || !allowedOrigins.includes(origin))) return json({ error: 'ORIGIN_FORBIDDEN' }, 403, cors);
    if (mutative && !rateLimiter.take(identity.clerkUserId)) return json({ error: 'RATE_LIMITED' }, 429, cors);

    const user = await repository.upsertUser(identity);
    const path = url.pathname.replace(/\/+$/, '');

    try {
      if (request.method === 'GET' && path === '/api/user/me') return json({ user: await repository.getMe(user.id) }, 200, cors);
      if (request.method === 'GET' && path === '/api/user/subscriptions') return json({ subscriptions: await repository.listSubscriptions(user.id) }, 200, cors);
      if (request.method === 'POST' && path === '/api/user/subscriptions') {
        const target = normalizeTarget(await parseBody(request));
        if (!target) return json({ error: 'INVALID_TARGET' }, 400, cors);
        return json({ subscription: await repository.follow(user.id, target) }, 200, cors);
      }
      const deletionMatch = path.match(/^\/api\/user\/subscriptions\/([A-Za-z0-9_-]{1,120})$/);
      if (request.method === 'DELETE' && deletionMatch) {
        const removed = await repository.unfollow(user.id, deletionMatch[1]);
        return removed ? json({ status: 'UNSUBSCRIBED' }, 200, cors) : json({ error: 'NOT_FOUND' }, 404, cors);
      }
      if (request.method === 'PATCH' && path === '/api/user/preferences') {
        const body = await parseBody(request);
        if (!body || typeof body !== 'object' || Object.keys(body).some((key) => !booleanPreferenceKeys.has(key) || typeof body[key] !== 'boolean')) return json({ error: 'INVALID_PREFERENCES' }, 400, cors);
        return json({ preferences: await repository.updatePreferences(user.id, body) }, 200, cors);
      }
      if (request.method === 'POST' && path === '/api/user/account/delete-request') {
        const body = await parseBody(request);
        if (body?.confirmation !== 'SUPPRIMER MON COMPTE DATAGRAPHE') return json({ error: 'CONFIRMATION_REQUIRED' }, 400, cors);
        return json(await repository.requestDeletion(user.id), 202, cors);
      }
      return json({ error: 'NOT_FOUND' }, 404, cors);
    } catch (error) {
      if (error?.message === 'PAYLOAD_TOO_LARGE') return json({ error: 'PAYLOAD_TOO_LARGE' }, 413, cors);
      return json({ error: 'INTERNAL_ERROR' }, 500, cors);
    }
  };
}
