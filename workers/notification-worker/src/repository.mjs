const iso = () => new Date().toISOString();
const rowId = (prefix) => `${prefix}_${crypto.randomUUID()}`;

export class InMemoryNotificationRepository {
  constructor({ users = [], subscriptions = [], preferences = [] } = {}) {
    this.users = new Map(users.map((row) => [row.id, { status: 'ACTIVE', locale: 'fr', ...row }]));
    this.subscriptions = new Map(subscriptions.map((row) => [row.id, { status: 'ACTIVE', ...row }]));
    this.preferences = new Map(preferences.map((row) => [row.user_id, { email_enabled: 1, new_tests: 1, verified_changes: 1, new_comparisons: 0, datagraphe_news: 0, ...row }]));
    this.queue = new Map();
    this.queueByDedupe = new Map();
    this.logs = [];
    this.deliveryEvents = new Map();
    this.unsubscribeTokens = new Map();
    this.emailStatus = new Map();
    this.metrics = { queued: 0, sent: 0, failed: 0, skipped: 0, deduplicated: 0, hard_bounces: 0, complaints: 0 };
  }

  async listMatchingSubscriptions(event) {
    const matches = [];
    for (const subscription of this.subscriptions.values()) {
      const softwareMatch = event.event_type === 'VERIFIED_SOFTWARE_CHANGE' && subscription.subscription_type === 'SOFTWARE' && subscription.target_key === event.software_slug;
      const datagrapheMatch = event.event_type === 'NEW_TEST_PUBLISHED' && subscription.subscription_type === 'DATAGRAPHE' && subscription.target_key === 'news';
      if (!softwareMatch && !datagrapheMatch) continue;
      const user = this.users.get(subscription.user_id);
      const preferences = this.preferences.get(subscription.user_id);
      matches.push({ subscription, user, preferences, emailStatus: this.emailStatus.get(subscription.user_id)?.status ?? 'ACTIVE' });
    }
    return matches;
  }

  async insertQueue(row) {
    if (this.queueByDedupe.has(row.dedupeKey)) {
      this.metrics.deduplicated++;
      return { inserted: false, row: this.queue.get(this.queueByDedupe.get(row.dedupeKey)) };
    }
    const stored = { id: rowId('nq'), status: 'PENDING', attemptCount: 0, createdAt: iso(), ...row };
    this.queue.set(stored.id, stored);
    this.queueByDedupe.set(stored.dedupeKey, stored.id);
    this.metrics.queued++;
    return { inserted: true, row: stored };
  }

  async claimReady(now, limit = 25) {
    const ready = [...this.queue.values()].filter((row) => row.status === 'PENDING' && row.scheduledAt <= now).slice(0, limit);
    for (const row of ready) {
      row.status = 'PROCESSING';
      row.processingStartedAt = now;
      row.processingToken = crypto.randomUUID();
      row.attemptCount++;
    }
    return ready.map((row) => structuredClone(row));
  }

  async markSent(id, providerMessageId, sentAt) {
    const row = this.queue.get(id);
    if (!row || row.status !== 'PROCESSING') return false;
    Object.assign(row, { status: 'SENT', providerMessageId, sentAt, processingToken: null });
    this.metrics.sent++;
    return true;
  }

  async markRetry(id, { scheduledAt, error }) {
    const row = this.queue.get(id);
    Object.assign(row, { status: 'PENDING', scheduledAt, lastError: error, processingStartedAt: null, processingToken: null });
  }

  async markFailed(id, { failedAt, error }) {
    const row = this.queue.get(id);
    Object.assign(row, { status: 'FAILED', failedAt, lastError: error, processingToken: null });
    this.metrics.failed++;
  }
  async markSkipped(id, { skippedAt, error }) {
    const row = this.queue.get(id);
    Object.assign(row, { status: 'SKIPPED', failedAt: skippedAt, lastError: error, processingToken: null });
    this.metrics.skipped++;
  }

  async appendNotificationLog(row) { this.logs.push({ id: rowId('log'), created_at: iso(), ...row }); }
  async countSentForUserSince(userId, since) { return [...this.queue.values()].filter((row) => row.userId === userId && row.status === 'SENT' && row.sentAt >= since).length; }
  async recoverStale(cutoff, now) {
    let recovered = 0;
    for (const row of this.queue.values()) if (row.status === 'PROCESSING' && row.processingStartedAt < cutoff) {
      Object.assign(row, { status: 'PENDING', scheduledAt: now, processingStartedAt: null, processingToken: null, lastError: 'STALE_PROCESSING_RECOVERED' });
      recovered++;
    }
    return recovered;
  }

  async storeUnsubscribeToken(row) { this.unsubscribeTokens.set(row.tokenHash, { ...row, consumedAt: null }); }
  async consumeUnsubscribeToken(tokenHash, now) {
    const token = this.unsubscribeTokens.get(tokenHash);
    if (!token || token.consumedAt || token.expiresAt <= now) return { ok: false, reason: 'TOKEN_INVALID_OR_EXPIRED' };
    const subscription = this.subscriptions.get(token.subscriptionId);
    if (!subscription || subscription.user_id !== token.userId) return { ok: false, reason: 'SUBSCRIPTION_NOT_FOUND' };
    subscription.status = 'UNSUBSCRIBED';
    token.consumedAt = now;
    return { ok: true, subscriptionId: subscription.id };
  }

  async recordDeliveryEvent({ notificationId, providerEventType, providerEventId, occurredAt, safeSummary }) {
    if (this.deliveryEvents.has(providerEventId)) return { inserted: false };
    this.deliveryEvents.set(providerEventId, { notificationId, providerEventType, providerEventId, occurredAt, safeSummary });
    return { inserted: true };
  }
  async findNotificationIdByProviderMessageId(providerMessageId) { return [...this.queue.values()].find((row) => row.providerMessageId === providerMessageId)?.id ?? null; }

  async disableEmailForNotification(notificationId, reason, providerEventId) {
    const row = this.queue.get(notificationId);
    if (!row) return false;
    const status = reason === 'COMPLAINT' ? 'COMPLAINT' : 'HARD_BOUNCED';
    this.emailStatus.set(row.userId, { status, providerEventId, updatedAt: iso() });
    const preferences = this.preferences.get(row.userId);
    if (preferences) preferences.email_enabled = 0;
    if (status === 'COMPLAINT') this.metrics.complaints++; else this.metrics.hard_bounces++;
    return true;
  }
}

export class D1NotificationRepository {
  constructor(db) { this.db = db; }

  async listMatchingSubscriptions(event) {
    const result = await this.db.prepare(`SELECT s.id AS subscription_id,s.user_id,s.subscription_type,s.target_key,s.status AS subscription_status,
      u.clerk_user_id,u.primary_email,u.locale,u.status AS user_status,
      p.email_enabled,p.new_tests,p.verified_changes,p.datagraphe_news,
      COALESCE(es.status,'ACTIVE') AS email_status
      FROM user_subscriptions s JOIN app_users u ON u.id=s.user_id
      JOIN notification_preferences p ON p.user_id=u.id
      LEFT JOIN notification_email_status es ON es.user_id=u.id
      WHERE s.status='ACTIVE' AND ((?='VERIFIED_SOFTWARE_CHANGE' AND s.subscription_type='SOFTWARE' AND s.target_key=?)
        OR (?='NEW_TEST_PUBLISHED' AND s.subscription_type='DATAGRAPHE' AND s.target_key='news'))`)
      .bind(event.event_type, event.software_slug, event.event_type).all();
    return (result.results ?? []).map((row) => ({
      subscription: { id: row.subscription_id, user_id: row.user_id, subscription_type: row.subscription_type, target_key: row.target_key, status: row.subscription_status },
      user: { id: row.user_id, clerk_user_id: row.clerk_user_id, primary_email: row.primary_email, locale: row.locale, status: row.user_status },
      preferences: row,
      emailStatus: row.email_status
    }));
  }

  async insertQueue(row) {
    const id = rowId('nq');
    const result = await this.db.prepare(`INSERT OR IGNORE INTO notification_queue
      (id,event_id,source_event_ids,user_id,subscription_id,notification_type,channel,locale,status,scheduled_at,created_at,dedupe_key,template_key,template_version,payload_json)
      VALUES(?,?,?,?,?,?, 'EMAIL','fr','PENDING',?,?,?,?,1,?)`)
      .bind(id, row.eventId, JSON.stringify(row.sourceEventIds), row.userId, row.subscriptionId, row.notificationType, row.scheduledAt, iso(), row.dedupeKey, row.templateKey, JSON.stringify(row.payload)).run();
    return { inserted: Number(result.meta?.changes ?? 0) === 1, row: { id, ...row } };
  }

  async claimReady(now, limit = 25) {
    const candidates = await this.db.prepare(`SELECT * FROM notification_queue WHERE status='PENDING' AND scheduled_at<=? ORDER BY scheduled_at,created_at LIMIT ?`).bind(now, limit).all();
    const claimed = [];
    for (const row of candidates.results ?? []) {
      const token = crypto.randomUUID();
      const result = await this.db.prepare(`UPDATE notification_queue SET status='PROCESSING',processing_started_at=?,processing_token=?,attempt_count=attempt_count+1 WHERE id=? AND status='PENDING'`).bind(now, token, row.id).run();
      if (Number(result.meta?.changes ?? 0) === 1) claimed.push({ id: row.id, eventId: row.event_id, sourceEventIds: JSON.parse(row.source_event_ids), userId: row.user_id, subscriptionId: row.subscription_id, notificationType: row.notification_type, scheduledAt: row.scheduled_at, attemptCount: Number(row.attempt_count) + 1, templateKey: row.template_key, payload: JSON.parse(row.payload_json), processingToken: token });
    }
    return claimed;
  }

  async markSent(id, providerMessageId, sentAt) { const result = await this.db.prepare(`UPDATE notification_queue SET status='SENT',provider_message_id=?,sent_at=?,processing_token=NULL WHERE id=? AND status='PROCESSING'`).bind(providerMessageId, sentAt, id).run(); return Number(result.meta?.changes ?? 0) === 1; }
  async markRetry(id, { scheduledAt, error }) { await this.db.prepare(`UPDATE notification_queue SET status='PENDING',scheduled_at=?,last_error=?,processing_started_at=NULL,processing_token=NULL WHERE id=?`).bind(scheduledAt, error, id).run(); }
  async markFailed(id, { failedAt, error }) { await this.db.prepare(`UPDATE notification_queue SET status='FAILED',failed_at=?,last_error=?,processing_token=NULL WHERE id=?`).bind(failedAt, error, id).run(); }
  async markSkipped(id, { skippedAt, error }) { await this.db.prepare(`UPDATE notification_queue SET status='SKIPPED',failed_at=?,last_error=?,processing_token=NULL WHERE id=?`).bind(skippedAt, error, id).run(); }
  async appendNotificationLog(row) { await this.db.prepare(`INSERT INTO notification_log(id,user_id,event_id,subscription_id,channel,status,created_at,sent_at,provider_message_id,error_code) VALUES(?,?,?,?,?,?,?,?,?,NULL)`).bind(rowId('log'), row.userId, row.eventId, row.subscriptionId, 'EMAIL', row.status, iso(), row.sentAt, row.providerMessageId).run(); }
  async countSentForUserSince(userId, since) { const row = await this.db.prepare(`SELECT COUNT(*) AS total FROM notification_queue WHERE user_id=? AND status='SENT' AND sent_at>=?`).bind(userId, since).first(); return Number(row?.total ?? 0); }
  async recoverStale(cutoff, now) { const result = await this.db.prepare(`UPDATE notification_queue SET status='PENDING',scheduled_at=?,processing_started_at=NULL,processing_token=NULL,last_error='STALE_PROCESSING_RECOVERED' WHERE status='PROCESSING' AND processing_started_at<?`).bind(now, cutoff).run(); return Number(result.meta?.changes ?? 0); }
  async storeUnsubscribeToken(row) { await this.db.prepare(`INSERT INTO unsubscribe_tokens(token_hash,user_id,subscription_id,scope,expires_at,created_at) VALUES(?,?,?,'UNSUBSCRIBE_SUBSCRIPTION',?,?)`).bind(row.tokenHash, row.userId, row.subscriptionId, row.expiresAt, row.createdAt).run(); }
  async consumeUnsubscribeToken(tokenHash, now) {
    const token = await this.db.prepare(`SELECT * FROM unsubscribe_tokens WHERE token_hash=? AND consumed_at IS NULL AND expires_at>?`).bind(tokenHash, now).first();
    if (!token) return { ok: false, reason: 'TOKEN_INVALID_OR_EXPIRED' };
    await this.db.batch([
      this.db.prepare(`UPDATE user_subscriptions SET status='UNSUBSCRIBED',updated_at=? WHERE id=? AND user_id=?`).bind(now, token.subscription_id, token.user_id),
      this.db.prepare(`UPDATE unsubscribe_tokens SET consumed_at=? WHERE token_hash=? AND consumed_at IS NULL`).bind(now, tokenHash)
    ]);
    return { ok: true, subscriptionId: token.subscription_id };
  }

  async recordDeliveryEvent({ notificationId, providerEventType, providerEventId, occurredAt, safeSummary }) {
    const result = await this.db.prepare(`INSERT OR IGNORE INTO email_delivery_events(id,notification_id,provider_event_type,provider_event_id,occurred_at,payload_safe_summary,created_at) VALUES(?,?,?,?,?,?,?)`)
      .bind(rowId('delivery'), notificationId, providerEventType, providerEventId, occurredAt, safeSummary, iso()).run();
    return { inserted: Number(result.meta?.changes ?? 0) === 1 };
  }

  async findNotificationIdByProviderMessageId(providerMessageId) {
    if (!providerMessageId) return null;
    const row = await this.db.prepare(`SELECT id FROM notification_queue WHERE provider_message_id=?`).bind(providerMessageId).first();
    return row?.id ?? null;
  }

  async disableEmailForNotification(notificationId, reason, providerEventId) {
    const queue = await this.db.prepare(`SELECT user_id FROM notification_queue WHERE id=?`).bind(notificationId).first();
    if (!queue) return false;
    const status = reason === 'COMPLAINT' ? 'COMPLAINT' : 'HARD_BOUNCED';
    const timestamp = iso();
    await this.db.batch([
      this.db.prepare(`INSERT INTO notification_email_status(user_id,status,updated_at,provider_event_id) VALUES(?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET status=excluded.status,updated_at=excluded.updated_at,provider_event_id=excluded.provider_event_id`).bind(queue.user_id, status, timestamp, providerEventId),
      this.db.prepare(`UPDATE notification_preferences SET email_enabled=0,updated_at=? WHERE user_id=?`).bind(timestamp, queue.user_id)
    ]);
    return true;
  }
}
