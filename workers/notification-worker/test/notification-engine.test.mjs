import assert from 'node:assert/strict';
import test from 'node:test';
import { createNotificationApp } from '../src/app.mjs';
import { NotificationEngine } from '../src/engine.mjs';
import { MockEmailProvider, ProviderError, ResendEmailProvider } from '../src/email-provider.mjs';
import { notificationEligibility } from '../src/event-gate.mjs';
import { InMemoryNotificationRepository } from '../src/repository.mjs';
import { issueUnsubscribeToken, consumeUnsubscribeToken } from '../src/tokens.mjs';
import { renderNotificationEmail } from '../src/templates.mjs';

const now = new Date('2026-09-02T10:00:00.000Z');
const user = { id: 'usr_test', clerk_user_id: 'clerk_synthetic', primary_email: 'controlled-test@invalid.example', status: 'ACTIVE', locale: 'fr' };
const defaults = { email_enabled: 1, new_tests: 1, verified_changes: 1, new_comparisons: 0, datagraphe_news: 1 };
const subscription = (overrides = {}) => ({ id: 'sub_jibble', user_id: user.id, subscription_type: 'SOFTWARE', target_key: 'jibble', status: 'ACTIVE', ...overrides });
const event = (overrides = {}) => ({
  event_id: 'EVENT-TEST-002', event_version: '1', event_type: 'VERIFIED_SOFTWARE_CHANGE', change_subtype: 'FEATURE_CHANGED',
  software_id: 'SW-JIBBLE', software_slug: 'jibble', software_name: 'Jibble', summary: 'Le résultat de la fonction a changé après vérification.',
  verified_at: '2026-09-02T09:40:00.000Z', public_url: 'https://datagraphe.com/fr/tests/jibble/', verification_status: 'VERIFIED',
  public_status: 'PUBLISHABLE', locale: 'fr', ...overrides
});
const repository = (options = {}) => new InMemoryNotificationRepository({ users: options.users ?? [user], subscriptions: options.subscriptions ?? [subscription()], preferences: options.preferences ?? [{ user_id: user.id, ...defaults }] });
const resolver = async () => ({ email: user.primary_email, current: true });

test('event gate accepts only verified public V1 events and excludes coverage changes', () => {
  assert.equal(notificationEligibility(event()).eligible, true);
  assert.equal(notificationEligibility(event({ verification_status: 'PENDING' })).reason, 'EVENT_NOT_VERIFIED');
  assert.equal(notificationEligibility(event({ public_status: 'PRIVATE' })).reason, 'EVENT_NOT_PUBLIC');
  assert.equal(notificationEligibility(event({ classification: 'DATAGRAPHE_COVERAGE_CHANGE' })).reason, 'DATAGRAPHE_COVERAGE_ONLY');
  assert.equal(notificationEligibility(event({ public_url: 'http://localhost:4321/fr/tests/jibble/' })).reason, 'PUBLIC_URL_INVALID');
});

test('verified software change matches active software follow and current preferences', async () => {
  const repo = repository();
  const engine = new NotificationEngine({ repository: repo, provider: new MockEmailProvider(), recipientResolver: resolver });
  const result = await engine.enqueueEvents([event()], now);
  assert.equal(result.inserted, 1);
  assert.equal(repo.queue.size, 1);
});

test('new test matches Datagraphe/news but category matching stays disabled in U2A', async () => {
  const repo = repository({ subscriptions: [subscription({ id: 'sub_news', subscription_type: 'DATAGRAPHE', target_key: 'news' }), subscription({ id: 'sub_category', subscription_type: 'CATEGORY', target_key: 'time-tracking' })] });
  const engine = new NotificationEngine({ repository: repo, provider: new MockEmailProvider(), recipientResolver: resolver });
  const newTest = event({ event_id: 'EVENT-TEST-001', event_type: 'NEW_TEST_PUBLISHED', change_subtype: undefined, software_slug: 'toggl-track', software_name: 'Toggl Track', published_at: '2026-09-02T09:45:00.000Z', verified_at: undefined, public_url: 'https://datagraphe.com/fr/tests/toggl-track/', public_metrics: { total_features: 61, coverage_rate: 58.2 } });
  const result = await engine.enqueueEvents([newTest], now);
  assert.equal(result.inserted, 1);
  assert.equal([...repo.queue.values()][0].subscriptionId, 'sub_news');
});

test('synthetic new-test and verified-change flows each create one queue row, one sandbox email and one log', async () => {
  const scenarios = [
    {
      subscriptions: [subscription()],
      input: event()
    },
    {
      subscriptions: [subscription({ id: 'sub_news', subscription_type: 'DATAGRAPHE', target_key: 'news' })],
      input: event({ event_id: 'EVENT-TEST-001', event_type: 'NEW_TEST_PUBLISHED', change_subtype: undefined, software_slug: 'toggl-track', software_name: 'Toggl Track', published_at: '2026-09-02T09:45:00.000Z', verified_at: undefined, public_url: 'https://datagraphe.com/fr/tests/toggl-track/', public_metrics: { total_features: 61, coverage_rate: 58.2 } })
    }
  ];
  for (const scenario of scenarios) {
    const repo = repository({ subscriptions: scenario.subscriptions });
    const provider = new MockEmailProvider();
    const engine = new NotificationEngine({ repository: repo, provider, recipientResolver: resolver });
    assert.equal((await engine.enqueueEvents([scenario.input], now)).inserted, 1);
    assert.equal((await engine.processReady(now)).sent, 1);
    assert.equal(repo.queue.size, 1);
    assert.equal(provider.messages.length, 1);
    assert.equal(repo.logs.length, 1);
  }
});

test('non-followers, disabled preferences, disabled email, unsubscribed and inactive users receive nothing', async () => {
  for (const scenario of [
    { subscriptions: [subscription({ target_key: 'clockify' })] },
    { preferences: [{ user_id: user.id, ...defaults, verified_changes: 0 }] },
    { preferences: [{ user_id: user.id, ...defaults, email_enabled: 0 }] },
    { subscriptions: [subscription({ status: 'UNSUBSCRIBED' })] },
    { users: [{ ...user, status: 'DELETION_REQUESTED' }] }
  ]) {
    const repo = repository(scenario);
    const engine = new NotificationEngine({ repository: repo, provider: new MockEmailProvider(), recipientResolver: resolver });
    assert.equal((await engine.enqueueEvents([event()], now)).inserted, 0);
  }
});

test('duplicate processing is idempotent', async () => {
  const repo = repository();
  const engine = new NotificationEngine({ repository: repo, provider: new MockEmailProvider(), recipientResolver: resolver });
  assert.equal((await engine.enqueueEvents([event()], now)).inserted, 1);
  assert.equal((await engine.enqueueEvents([event()], now)).inserted, 0);
  assert.equal(repo.queue.size, 1);
});

test('three verified changes in one window aggregate into one multipart email', async () => {
  const repo = repository();
  const provider = new MockEmailProvider();
  const engine = new NotificationEngine({ repository: repo, provider, recipientResolver: resolver });
  const events = [1, 2, 3].map((value) => event({ event_id: `EVENT-AGG-00${value}`, summary: `Changement vérifié ${value}.`, verified_at: `2026-09-02T09:${40 + value}:00.000Z` }));
  assert.equal((await engine.enqueueEvents(events, now)).inserted, 1);
  const processed = await engine.processReady(now);
  assert.equal(processed.sent, 1);
  assert.equal(provider.messages.length, 1);
  assert.match(provider.messages[0].subject, /3 changements vérifiés/);
  assert.match(provider.messages[0].html, /<!doctype html>/i);
  assert.match(provider.messages[0].text, /Gérer mes suivis/);
});

test('temporary provider failure retries then succeeds', async () => {
  const repo = repository();
  const provider = new MockEmailProvider([{ error: 'temporary', status: 500, code: 'PROVIDER_500' }, {}]);
  const engine = new NotificationEngine({ repository: repo, provider, recipientResolver: resolver });
  await engine.enqueueEvents([event()], now);
  const first = await engine.processReady(now);
  assert.equal(first.retried, 1);
  const second = await engine.processReady(new Date('2026-09-02T10:05:00.000Z'));
  assert.equal(second.sent, 1);
  assert.equal(repo.logs.length, 1);
});

test('hard failure is permanent and never retries indefinitely', async () => {
  const repo = repository();
  const provider = new MockEmailProvider([new ProviderError('invalid recipient', { status: 422, permanent: true, code: 'INVALID_RECIPIENT' })]);
  const engine = new NotificationEngine({ repository: repo, provider, recipientResolver: resolver });
  await engine.enqueueEvents([event()], now);
  assert.equal((await engine.processReady(now)).failed, 1);
  assert.equal((await engine.processReady(new Date('2026-09-02T11:00:00.000Z'))).claimed, 0);
});

test('opaque one-time unsubscribe token disables only its subscription', async () => {
  const repo = repository();
  const token = await issueUnsubscribeToken(repo, { userId: user.id, subscriptionId: 'sub_jibble', now });
  assert.ok(token.length >= 40);
  assert.equal(token.includes(user.id), false);
  assert.equal(token.includes('sub_jibble'), false);
  assert.deepEqual(await consumeUnsubscribeToken(repo, token, now), { ok: true, subscriptionId: 'sub_jibble' });
  assert.equal(repo.subscriptions.get('sub_jibble').status, 'UNSUBSCRIBED');
  assert.equal((await consumeUnsubscribeToken(repo, token, now)).ok, false);
});

test('email unsubscribe link requires explicit confirmation before the one-time POST', async () => {
  const repo = repository();
  const provider = new MockEmailProvider();
  const token = await issueUnsubscribeToken(repo, { userId: user.id, subscriptionId: 'sub_jibble', now });
  const app = createNotificationApp({ repository: repo, provider, recipientResolver: resolver, config: { mode: 'sandbox' } });
  const confirmation = await app(new Request(`https://worker.invalid/unsubscribe/?token=${encodeURIComponent(token)}`));
  assert.equal(confirmation.status, 200);
  assert.match(await confirmation.text(), /Confirmer le désabonnement/);
  assert.equal(repo.subscriptions.get('sub_jibble').status, 'ACTIVE');
  const form = new FormData();
  form.set('token', token);
  const result = await app(new Request('https://worker.invalid/unsubscribe/', { method: 'POST', body: form }));
  assert.equal(result.status, 200);
  assert.equal(repo.subscriptions.get('sub_jibble').status, 'UNSUBSCRIBED');
});

test('template uses only public Datagraphe URLs, validated content, no affiliate link and no tracking pixel', () => {
  const queue = { notificationType: 'VERIFIED_SOFTWARE_CHANGE', payload: { events: [event()] } };
  const rendered = renderNotificationEmail({ queue, unsubscribeToken: 'opaque-token-value' });
  assert.match(rendered.html, /https:\/\/datagraphe\.com\//g);
  assert.doesNotMatch(rendered.html, /localhost|pages\.dev|r2_key|affiliate|utm_|tracking/i);
  assert.match(rendered.text, /Ne plus suivre/);
});

test('internal trigger is closed, health is safe and webhook signature is enforced', async () => {
  const repo = repository();
  const provider = new MockEmailProvider();
  const app = createNotificationApp({ repository: repo, provider, recipientResolver: resolver, config: { mode: 'sandbox' } });
  assert.equal((await app(new Request('https://worker.invalid/health'))).status, 200);
  assert.equal((await app(new Request('https://worker.invalid/internal/events', { method: 'POST', body: '[]' }), { INTERNAL_API_TOKEN: 'secret' })).status, 404);
  assert.equal((await app(new Request('https://worker.invalid/webhooks/email', { method: 'POST', body: '{}' }))).status, 401);
});

test('hard bounce and complaint event processing is replay-safe and globally disables email', async () => {
  const repo = repository();
  const provider = new MockEmailProvider();
  const engine = new NotificationEngine({ repository: repo, provider, recipientResolver: resolver });
  await engine.enqueueEvents([event()], now);
  await engine.processReady(now);
  const notificationId = [...repo.queue.keys()][0];
  const app = createNotificationApp({ repository: repo, provider, recipientResolver: resolver, config: { mode: 'sandbox' } });
  const body = JSON.stringify({ notification_id: notificationId, type: 'HARD_BOUNCE', event_id: 'provider-event-1', occurred_at: now.toISOString() });
  const request = () => new Request('https://worker.invalid/webhooks/email', { method: 'POST', headers: { 'x-sandbox-signature': 'sandbox-signature' }, body });
  assert.equal((await app(request())).status, 200);
  assert.equal((await app(request())).status, 200);
  assert.equal(repo.preferences.get(user.id).email_enabled, 0);
  assert.equal(repo.deliveryEvents.size, 1);
});

test('current recipient must be resolved immediately before send', async () => {
  const repo = repository();
  const engine = new NotificationEngine({ repository: repo, provider: new MockEmailProvider(), recipientResolver: async () => ({ email: user.primary_email, current: false }) });
  await engine.enqueueEvents([event()], now);
  assert.equal((await engine.processReady(now)).failed, 1);
});

test('test-recipient-only rejects every address outside the explicit allowlist', async () => {
  const repo = repository();
  const engine = new NotificationEngine({ repository: repo, provider: new MockEmailProvider(), recipientResolver: resolver, config: { mode: 'test-recipient-only', allowedRecipientEmails: ['another@invalid.example'] } });
  const result = await engine.enqueueEvents([event()], now);
  assert.equal(result.inserted, 0);
  assert.equal(result.skipped[0].reason, 'TEST_ALLOWLIST_FILTER');
});

test('test-recipient-only permits only the exact allowlisted current address', async () => {
  const repo = repository();
  const provider = new MockEmailProvider();
  const engine = new NotificationEngine({ repository: repo, provider, recipientResolver: resolver, config: { mode: 'test-recipient-only', allowedRecipientEmails: [user.primary_email] } });
  assert.equal((await engine.enqueueEvents([event()], now)).inserted, 1);
  assert.equal((await engine.processReady(now)).sent, 1);
});

test('live-users enforces subscription and preferences without requiring the test allowlist', async () => {
  const repo = repository();
  const provider = new MockEmailProvider();
  const engine = new NotificationEngine({ repository: repo, provider, recipientResolver: resolver, config: { mode: 'live-users', allowedRecipientEmails: [] } });
  assert.equal((await engine.enqueueEvents([event()], now)).inserted, 1);
  assert.equal((await engine.processReady(now)).sent, 1);
});

test('Resend adapter sends multipart content and classifies hard API failures', async () => {
  const calls = [];
  const provider = new ResendEmailProvider({ apiKey: 're_test_only', fetchImpl: async (_url, options) => { calls.push(JSON.parse(options.body)); return new Response(JSON.stringify({ id: 'resend-message-1' }), { status: 200 }); } });
  const sent = await provider.sendTransactionalEmail({ from: 'Datagraphe <notifications@mail.datagraphe.com>', to: user.primary_email, replyTo: 'contact@datagraphe.com', subject: 'Test', html: '<p>Test</p>', text: 'Test', headers: {} });
  assert.equal(sent.providerMessageId, 'resend-message-1');
  assert.equal(calls[0].to[0], user.primary_email);
  assert.equal(calls[0].html, '<p>Test</p>');
  assert.equal(calls[0].text, 'Test');
  const rejected = new ResendEmailProvider({ apiKey: 're_test_only', fetchImpl: async () => new Response('{}', { status: 422 }) });
  await assert.rejects(() => rejected.sendTransactionalEmail({}), (error) => error.permanent === true && error.code === 'RESEND_422');
});

test('Resend webhook verification validates Svix signature and timestamp', async () => {
  const secretBytes = new TextEncoder().encode('test-only-secret');
  const secret = `whsec_${btoa(String.fromCharCode(...secretBytes))}`;
  const provider = new ResendEmailProvider({ apiKey: 're_test_only', webhookSecret: secret, fetchImpl: fetch });
  const id = 'msg_test';
  const timestamp = String(Math.floor(now.getTime() / 1000));
  const body = JSON.stringify({ type: 'email.delivered' });
  const key = await crypto.subtle.importKey('raw', secretBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const bytes = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${id}.${timestamp}.${body}`)));
  const signature = `v1,${btoa(String.fromCharCode(...bytes))}`;
  const headers = new Headers({ 'svix-id': id, 'svix-timestamp': timestamp, 'svix-signature': signature });
  assert.equal(await provider.verifyWebhook({ headers, body, now: now.getTime() }), true);
  assert.equal(await provider.verifyWebhook({ headers: new Headers({ ...Object.fromEntries(headers), 'svix-signature': 'v1,invalid' }), body, now: now.getTime() }), false);
});
