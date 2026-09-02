import { DEFAULT_CONFIG, NOTIFICATION_TYPES, TRANSIENT_PROVIDER_CODES } from './constants.mjs';
import { notificationEligibility } from './event-gate.mjs';
import { sendTransactionalEmail } from './email-provider.mjs';
import { issueUnsubscribeToken } from './tokens.mjs';
import { renderNotificationEmail } from './templates.mjs';

const encoder = new TextEncoder();
const hex = (bytes) => [...new Uint8Array(bytes)].map((value) => value.toString(16).padStart(2, '0')).join('');
const digest = async (value) => hex(await crypto.subtle.digest('SHA-256', encoder.encode(value)));
const plusMinutes = (iso, minutes) => new Date(new Date(iso).getTime() + minutes * 60000).toISOString();

const preferenceAllows = ({ event, user, subscription, preferences, emailStatus }) => {
  if (!user || user.status !== 'ACTIVE') return false;
  if (!subscription || subscription.status !== 'ACTIVE') return false;
  if (!preferences || Number(preferences.email_enabled) !== 1) return false;
  if (emailStatus !== 'ACTIVE') return false;
  if (event.event_type === NOTIFICATION_TYPES.VERIFIED_CHANGE) return Number(preferences.verified_changes) === 1;
  return Number(preferences.new_tests) === 1;
};

const safeEvent = (event) => ({
  event_id: event.event_id,
  event_version: event.event_version,
  event_type: event.event_type,
  change_subtype: event.change_subtype,
  software_slug: event.software_slug,
  software_name: event.software_name,
  summary: event.summary,
  verified_at: event.verified_at,
  published_at: event.published_at,
  public_url: event.public_url,
  public_metrics: event.public_metrics,
  locale: 'fr'
});

export class NotificationEngine {
  constructor({ repository, provider, recipientResolver, config = {} }) {
    this.repository = repository;
    this.provider = provider;
    this.recipientResolver = recipientResolver;
    this.config = { ...DEFAULT_CONFIG, ...config };
    if (!['sandbox', 'test-recipient-only', 'live-users'].includes(this.config.mode)) throw new Error('NOTIFICATION_MODE_INVALID');
  }

  async enqueueEvents(events, now = new Date()) {
    const candidates = [];
    const skipped = [];
    for (const event of events) {
      const gate = notificationEligibility(event);
      if (!gate.eligible) { skipped.push({ eventId: event?.event_id, reason: gate.reason }); continue; }
      for (const match of await this.repository.listMatchingSubscriptions(event)) {
        if (!preferenceAllows({ event, ...match })) { skipped.push({ eventId: event.event_id, userId: match.user?.id, reason: 'PREFERENCE_OR_STATUS_FILTER' }); continue; }
        if (this.config.mode === 'test-recipient-only' && !this.config.allowedRecipientEmails.includes(String(match.user?.primary_email ?? '').toLowerCase())) {
          skipped.push({ eventId: event.event_id, userId: match.user?.id, reason: 'TEST_ALLOWLIST_FILTER' }); continue;
        }
        candidates.push({ event, ...match });
      }
    }
    const groups = new Map();
    for (const candidate of candidates) {
      const bucketMs = this.config.aggregationWindowMinutes * 60000;
      const eventTime = new Date(candidate.event.verified_at ?? candidate.event.published_at).getTime();
      const bucket = Math.floor(eventTime / bucketMs);
      const key = `${candidate.user.id}|${candidate.subscription.id}|${candidate.event.event_type}|${candidate.event.software_slug}|${bucket}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(candidate);
    }
    let inserted = 0;
    for (const group of groups.values()) {
      const eventsForRow = group.map((item) => item.event).sort((a, b) => a.event_id.localeCompare(b.event_id));
      const sourceEventIds = eventsForRow.map((event) => event.event_id);
      const aggregateEventId = sourceEventIds.length === 1 ? sourceEventIds[0] : `aggregate_${await digest(sourceEventIds.join('|'))}`;
      const first = group[0];
      const dedupeKey = await digest(`${first.user.id}|${aggregateEventId}|${first.event.event_type}|EMAIL`);
      const templateKey = first.event.event_type === NOTIFICATION_TYPES.NEW_TEST ? 'new_test_fr_v1' : 'verified_change_fr_v1';
      const result = await this.repository.insertQueue({ eventId: aggregateEventId, sourceEventIds, userId: first.user.id, subscriptionId: first.subscription.id, notificationType: first.event.event_type, locale: 'fr', scheduledAt: now.toISOString(), dedupeKey, templateKey, payload: { events: eventsForRow.map(safeEvent) } });
      if (result.inserted) inserted++;
    }
    return { eligibleEvents: events.length - skipped.filter((row) => !row.userId).length, candidates: candidates.length, inserted, skipped };
  }

  async processReady(now = new Date()) {
    const nowIso = now.toISOString();
    const staleCutoff = new Date(now.getTime() - this.config.staleProcessingMinutes * 60000).toISOString();
    const recovered = await this.repository.recoverStale(staleCutoff, nowIso);
    const rows = await this.repository.claimReady(nowIso);
    const result = { claimed: rows.length, sent: 0, retried: 0, failed: 0, skipped: 0, recovered };
    for (const row of rows) {
      const since = new Date(now.getTime() - 86400000).toISOString();
      if (await this.repository.countSentForUserSince(row.userId, since) >= this.config.maxEmailsPerUserPerDay) {
        await this.repository.markFailed(row.id, { failedAt: nowIso, error: 'DAILY_RATE_LIMIT' }); result.skipped++; continue;
      }
      try {
        const recipient = await this.recipientResolver(row.userId);
        if (!recipient?.email || recipient.current !== true) throw Object.assign(new Error('CURRENT_EMAIL_UNAVAILABLE'), { permanent: true, code: 'CURRENT_EMAIL_UNAVAILABLE', status: 422 });
        const unsubscribeToken = await issueUnsubscribeToken(this.repository, { userId: row.userId, subscriptionId: row.subscriptionId, ttlDays: this.config.unsubscribeTtlDays, now });
        const rendered = renderNotificationEmail({ queue: row, unsubscribeToken });
        if (this.config.mode === 'test-recipient-only' && !this.config.allowedRecipientEmails.includes(String(recipient.email).toLowerCase())) {
          await this.repository.markSkipped(row.id, { skippedAt: nowIso, error: 'TEST_ALLOWLIST_FILTER' }); result.skipped++; continue;
        }
        const response = await sendTransactionalEmail(this.provider, { to: recipient.email, from: this.config.from, replyTo: this.config.replyTo, subject: rendered.subject, html: rendered.html, text: rendered.text, headers: { 'List-Unsubscribe': `<https://datagraphe.com/api/notifications/unsubscribe/?token=${encodeURIComponent(unsubscribeToken)}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }, templateKey: rendered.templateKey, templateVersion: rendered.templateVersion });
        await this.repository.markSent(row.id, response.providerMessageId, nowIso);
        await this.repository.appendNotificationLog({ userId: row.userId, eventId: row.eventId, subscriptionId: row.subscriptionId, status: 'SENT', sentAt: nowIso, providerMessageId: response.providerMessageId });
        result.sent++;
      } catch (error) {
        const transient = !error.permanent && TRANSIENT_PROVIDER_CODES.has(Number(error.status ?? 500));
        if (transient && row.attemptCount < this.config.maxAttempts) {
          await this.repository.markRetry(row.id, { scheduledAt: plusMinutes(nowIso, Math.min(30, 2 ** row.attemptCount)), error: error.code ?? 'TRANSIENT_PROVIDER_FAILURE' });
          result.retried++;
        } else {
          await this.repository.markFailed(row.id, { failedAt: nowIso, error: error.code ?? 'PERMANENT_PROVIDER_FAILURE' });
          result.failed++;
        }
      }
    }
    return result;
  }
}
