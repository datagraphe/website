PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS notification_queue (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  source_event_ids TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  subscription_id TEXT REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('NEW_TEST_PUBLISHED','VERIFIED_SOFTWARE_CHANGE')),
  channel TEXT NOT NULL DEFAULT 'EMAIL' CHECK (channel = 'EMAIL'),
  locale TEXT NOT NULL DEFAULT 'fr' CHECK (locale = 'fr'),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PROCESSING','SENT','FAILED','CANCELLED','SKIPPED')),
  scheduled_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  processing_started_at TEXT,
  sent_at TEXT,
  failed_at TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  provider_message_id TEXT,
  last_error TEXT,
  dedupe_key TEXT NOT NULL UNIQUE,
  template_key TEXT NOT NULL,
  template_version INTEGER NOT NULL DEFAULT 1,
  payload_json TEXT NOT NULL,
  processing_token TEXT
);

CREATE TABLE IF NOT EXISTS email_delivery_events (
  id TEXT PRIMARY KEY,
  notification_id TEXT NOT NULL REFERENCES notification_queue(id) ON DELETE CASCADE,
  provider_event_type TEXT NOT NULL,
  provider_event_id TEXT NOT NULL UNIQUE,
  occurred_at TEXT NOT NULL,
  payload_safe_summary TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS unsubscribe_tokens (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  subscription_id TEXT NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  scope TEXT NOT NULL DEFAULT 'UNSUBSCRIBE_SUBSCRIPTION' CHECK (scope = 'UNSUBSCRIBE_SUBSCRIPTION'),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  consumed_at TEXT
);

CREATE TABLE IF NOT EXISTS notification_email_status (
  user_id TEXT PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','HARD_BOUNCED','COMPLAINT')),
  updated_at TEXT NOT NULL,
  provider_event_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_notification_queue_ready
  ON notification_queue(status, scheduled_at, created_at);
CREATE INDEX IF NOT EXISTS idx_notification_queue_user_sent
  ON notification_queue(user_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_notification_queue_processing
  ON notification_queue(status, processing_started_at);
CREATE INDEX IF NOT EXISTS idx_email_delivery_notification
  ON email_delivery_events(notification_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_unsubscribe_expiry
  ON unsubscribe_tokens(expires_at, consumed_at);

PRAGMA optimize;
