import test from 'node:test';
import assert from 'node:assert/strict';
import { createUserApi } from '../src/app.mjs';
import { normalizeTarget } from '../src/targets.mjs';

class MemoryRepository {
  constructor() { this.users = new Map(); this.subscriptions = []; this.preferences = new Map(); }
  async upsertUser(identity) {
    let user = [...this.users.values()].find((item) => item.clerk_user_id === identity.clerkUserId);
    if (!user) {
      user = { id: `usr_${this.users.size + 1}`, clerk_user_id: identity.clerkUserId, primary_email: identity.email, locale: identity.locale, status: 'ACTIVE', created_at: '2026-09-02T00:00:00Z' };
      this.users.set(user.id, user);
      this.preferences.set(user.id, { email_enabled: 1, new_tests: 1, verified_changes: 1, new_comparisons: 1, datagraphe_news: 0 });
    } else user.primary_email = identity.email;
    return user;
  }
  async getMe(userId) {
    const user = this.users.get(userId);
    const counts = {};
    this.subscriptions.filter((item) => item.user_id === userId && item.status === 'ACTIVE').forEach((item) => { counts[item.subscription_type] = (counts[item.subscription_type] ?? 0) + 1; });
    return { ...user, counts, preferences: await this.getPreferences(userId) };
  }
  async listSubscriptions(userId) { return this.subscriptions.filter((item) => item.user_id === userId && item.status !== 'UNSUBSCRIBED'); }
  async follow(userId, target) {
    let item = this.subscriptions.find((row) => row.user_id === userId && row.subscription_type === target.subscription_type && row.target_key === target.target_key);
    if (!item) {
      item = { id: `sub_${this.subscriptions.length + 1}`, user_id: userId, ...target, status: 'ACTIVE', created_at: '2026-09-02T00:00:00Z' };
      this.subscriptions.push(item);
    } else item.status = 'ACTIVE';
    return item;
  }
  async unfollow(userId, subscriptionId) {
    const item = this.subscriptions.find((row) => row.id === subscriptionId && row.user_id === userId && row.status !== 'UNSUBSCRIBED');
    if (!item) return false;
    item.status = 'UNSUBSCRIBED';
    return true;
  }
  async getPreferences(userId) { return this.preferences.get(userId); }
  async updatePreferences(userId, input) {
    const next = { ...this.preferences.get(userId), ...Object.fromEntries(Object.entries(input).map(([key, value]) => [key, Number(value)])) };
    this.preferences.set(userId, next);
    return next;
  }
  async requestDeletion(userId) {
    this.users.get(userId).status = 'DELETION_REQUESTED';
    this.subscriptions.filter((item) => item.user_id === userId && item.status === 'ACTIVE').forEach((item) => { item.status = 'PAUSED'; });
    return { status: 'DELETION_REQUESTED', irreversible: false };
  }
}

const origin = 'http://127.0.0.1:4324';
const repo = new MemoryRepository();
const identities = {
  a: { clerkUserId: 'user_a', email: 'a@example.test', locale: 'fr' },
  b: { clerkUserId: 'user_b', email: 'b@example.test', locale: 'fr' }
};
const appFor = (identity) => createUserApi({ authenticate: async () => identity, repository: repo, allowedOrigins: [origin] });
const request = (path, options = {}) => new Request(`http://worker.test${path}`, { ...options, headers: { origin, 'content-type': 'application/json', ...(options.headers ?? {}) } });
const body = async (response) => response.json();

test('target registry accepts only known targets', () => {
  assert.deepEqual(normalizeTarget({ subscription_type: 'software', target_key: 'jibble' }), { subscription_type: 'SOFTWARE', target_key: 'jibble' });
  assert.equal(normalizeTarget({ subscription_type: 'SOFTWARE', target_key: 'arbitrary' }), null);
});

test('unauthenticated request is rejected', async () => {
  const app = createUserApi({ authenticate: async () => null, repository: repo, allowedOrigins: [origin] });
  assert.equal((await app(request('/api/user/me'))).status, 401);
});

test('invalid target is rejected server-side', async () => {
  const response = await appFor(identities.a)(request('/api/user/subscriptions', { method: 'POST', body: JSON.stringify({ subscription_type: 'SOFTWARE', target_key: 'unknown' }) }));
  assert.equal(response.status, 400);
  assert.equal((await body(response)).error, 'INVALID_TARGET');
});

test('duplicate follow is idempotent and ignores a forged user_id', async () => {
  const app = appFor(identities.a);
  const payload = JSON.stringify({ subscription_type: 'SOFTWARE', target_key: 'jibble', user_id: 'usr_victim' });
  const first = await body(await app(request('/api/user/subscriptions', { method: 'POST', body: payload })));
  const second = await body(await app(request('/api/user/subscriptions', { method: 'POST', body: payload })));
  assert.equal(first.subscription.id, second.subscription.id);
  assert.equal(repo.subscriptions.filter((item) => item.target_key === 'jibble').length, 1);
  assert.equal(first.subscription.user_id, 'usr_1');
});

test('all requested target types can be followed', async () => {
  const app = appFor(identities.a);
  for (const target of [
    { subscription_type: 'CATEGORY', target_key: 'time-tracking' },
    { subscription_type: 'COMPARISON', target_key: 'jibble-vs-clockify' },
    { subscription_type: 'DATAGRAPHE', target_key: 'news' }
  ]) {
    assert.equal((await app(request('/api/user/subscriptions', { method: 'POST', body: JSON.stringify(target) }))).status, 200);
  }
});

test('IDOR deletion cannot affect another user subscription', async () => {
  const appB = appFor(identities.b);
  const created = await body(await appB(request('/api/user/subscriptions', { method: 'POST', body: JSON.stringify({ subscription_type: 'SOFTWARE', target_key: 'clockify' }) })));
  const attack = await appFor(identities.a)(request(`/api/user/subscriptions/${created.subscription.id}`, { method: 'DELETE' }));
  assert.equal(attack.status, 404);
  assert.equal(repo.subscriptions.find((item) => item.id === created.subscription.id).status, 'ACTIVE');
});

test('user A cannot read user B subscriptions', async () => {
  const subscriptionsA = await body(await appFor(identities.a)(request('/api/user/subscriptions')));
  const subscriptionsB = await body(await appFor(identities.b)(request('/api/user/subscriptions')));
  assert.equal(subscriptionsA.subscriptions.some((item) => item.target_key === 'clockify'), false);
  assert.equal(subscriptionsB.subscriptions.some((item) => item.target_key === 'clockify'), true);
});

test('a forged user ID cannot modify another user preferences', async () => {
  const before = await repo.getPreferences('usr_2');
  const response = await appFor(identities.a)(request('/api/user/preferences', {
    method: 'PATCH',
    body: JSON.stringify({ datagraphe_news: true, user_id: 'usr_2' })
  }));
  assert.equal(response.status, 400);
  assert.deepEqual(await repo.getPreferences('usr_2'), before);
});

test('owner can unfollow', async () => {
  const item = repo.subscriptions.find((row) => row.user_id === 'usr_1' && row.target_key === 'jibble');
  const response = await appFor(identities.a)(request(`/api/user/subscriptions/${item.id}`, { method: 'DELETE' }));
  assert.equal(response.status, 200);
  assert.equal(item.status, 'UNSUBSCRIBED');
});

test('preferences accept booleans and reject unknown fields', async () => {
  const app = appFor(identities.a);
  const updated = await app(request('/api/user/preferences', { method: 'PATCH', body: JSON.stringify({ datagraphe_news: true, email_enabled: false }) }));
  assert.equal(updated.status, 200);
  assert.equal((await body(updated)).preferences.datagraphe_news, 1);
  assert.equal((await app(request('/api/user/preferences', { method: 'PATCH', body: JSON.stringify({ admin: true }) }))).status, 400);
});

test('mutations reject an untrusted origin', async () => {
  const untrusted = request('/api/user/subscriptions', { method: 'POST', body: JSON.stringify({ subscription_type: 'SOFTWARE', target_key: 'jibble' }), headers: { origin: 'https://evil.example' } });
  assert.equal((await appFor(identities.a)(untrusted)).status, 403);
});

test('account deletion requires explicit phrase and remains reversible', async () => {
  const app = appFor(identities.a);
  assert.equal((await app(request('/api/user/account/delete-request', { method: 'POST', body: JSON.stringify({ confirmation: 'oui' }) }))).status, 400);
  const accepted = await app(request('/api/user/account/delete-request', { method: 'POST', body: JSON.stringify({ confirmation: 'SUPPRIMER MON COMPTE DATAGRAPHE' }) }));
  assert.equal(accepted.status, 202);
  assert.equal((await body(accepted)).irreversible, false);
});
