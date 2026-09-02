import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const migration = fs.readFileSync(path.join(root, 'user-api/migrations/0002_notification_engine.sql'), 'utf8');
const wrangler = fs.readFileSync(path.join(root, 'notification-worker/wrangler.jsonc'), 'utf8');

test('notification migration is additive and has required status, dedupe and delivery tables', () => {
  assert.match(migration, /CREATE TABLE IF NOT EXISTS notification_queue/);
  assert.match(migration, /dedupe_key TEXT NOT NULL UNIQUE/);
  assert.match(migration, /PENDING.*PROCESSING.*SENT.*FAILED.*CANCELLED.*SKIPPED/s);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS email_delivery_events/);
  assert.match(migration, /provider_event_id TEXT NOT NULL UNIQUE/);
  assert.match(migration, /CREATE TABLE IF NOT EXISTS unsubscribe_tokens/);
  assert.doesNotMatch(migration, /DROP TABLE|ALTER TABLE events|UPDATE events|DELETE FROM events/i);
});

test('notification worker has no R2 binding and production mode processes the queue at a prudent interval', () => {
  assert.match(wrangler, /"NOTIFICATION_MODE": "live-users"/);
  assert.match(wrangler, /"crons": \["\*\/5 \* \* \* \*"\]/);
  assert.doesNotMatch(wrangler, /r2_buckets|bucket_name/i);
  assert.match(wrangler, /datagraphe-temporal/);
  assert.match(wrangler, /43ffd601-2e6b-43d2-9046-448a931d2726/);
});
