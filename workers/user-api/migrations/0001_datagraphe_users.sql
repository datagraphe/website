PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY,
  clerk_user_id TEXT NOT NULL UNIQUE,
  primary_email TEXT,
  locale TEXT NOT NULL DEFAULT 'fr',
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','DELETION_REQUESTED','DELETED')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  subscription_type TEXT NOT NULL CHECK (subscription_type IN ('DATAGRAPHE','SOFTWARE','CATEGORY','COMPARISON')),
  target_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','PAUSED','UNSUBSCRIBED')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (user_id, subscription_type, target_key)
);

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id TEXT PRIMARY KEY REFERENCES app_users(id) ON DELETE CASCADE,
  email_enabled INTEGER NOT NULL DEFAULT 1 CHECK (email_enabled IN (0,1)),
  new_tests INTEGER NOT NULL DEFAULT 1 CHECK (new_tests IN (0,1)),
  verified_changes INTEGER NOT NULL DEFAULT 1 CHECK (verified_changes IN (0,1)),
  new_comparisons INTEGER NOT NULL DEFAULT 1 CHECK (new_comparisons IN (0,1)),
  datagraphe_news INTEGER NOT NULL DEFAULT 0 CHECK (datagraphe_news IN (0,1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS notification_log (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  event_id TEXT,
  subscription_id TEXT REFERENCES user_subscriptions(id) ON DELETE SET NULL,
  channel TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  sent_at TEXT,
  provider_message_id TEXT,
  error_code TEXT
);

CREATE TABLE IF NOT EXISTS user_consents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('GRANTED','WITHDRAWN')),
  source TEXT NOT NULL,
  policy_version TEXT NOT NULL,
  recorded_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status
  ON user_subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_target
  ON user_subscriptions(subscription_type, target_key, status);
CREATE INDEX IF NOT EXISTS idx_notification_log_user_created
  ON notification_log(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_user_consents_user_type
  ON user_consents(user_id, consent_type, recorded_at);

PRAGMA optimize;
