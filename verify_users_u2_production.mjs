import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname);
const reportsDir = path.resolve(root, '..', 'datagraphe-users-u2-production');
const u2bDir = path.resolve(root, '..', 'datagraphe-users-u2b');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const report = (file) => JSON.parse(fs.readFileSync(path.join(reportsDir, file), 'utf8'));
const u2b = (file) => JSON.parse(fs.readFileSync(path.join(u2bDir, file), 'utf8'));

const activation = report('U2_PRODUCTION_ACTIVATION.json');
const queue = report('U2_PRODUCTION_QUEUE_AUDIT.json');
const security = report('U2_PRODUCTION_SECURITY_AUDIT.json');
const preferences = report('U2_PRODUCTION_PREFERENCES_AUDIT.json');
const deliverability = report('U2_PRODUCTION_DELIVERABILITY_AUDIT.json');
const consistency = report('U2_PRODUCTION_CONSISTENCY.json');
const gate = u2b('U2B_REAL_USER_ACTIVATION_GATE.json');
const wrangler = read('workers/notification-worker/wrangler.jsonc');
const constants = read('workers/notification-worker/src/constants.mjs');
const engine = read('workers/notification-worker/src/engine.mjs');
const templates = read('workers/notification-worker/src/templates.mjs');

const controls = {
  U2B_GATE_READY: gate.gate === 'READY',
  NO_SYNTHETIC_PENDING_EVENTS: queue.synthetic_events_pending === 0,
  NO_SYNTHETIC_PENDING_NOTIFICATIONS: queue.synthetic_notifications_pending === 0,
  DOMAIN_VERIFIED: deliverability.domain_verified === true,
  SPF_PASS: deliverability.spf === 'PASS',
  DKIM_PASS: deliverability.dkim === 'PASS',
  DMARC_ACCEPTABLE: deliverability.dmarc !== 'FAIL',
  NOTIFICATION_MODE_LIVE: activation.notification_mode === 'live-users' && /"NOTIFICATION_MODE": "live-users"/.test(wrangler),
  EVENT_GATE_ENFORCED: security.event_gate_enforced === true,
  DATAGRAPHE_COVERAGE_CHANGE_EXCLUDED: security.datagraphe_coverage_change_excluded === true && constants.includes('DATAGRAPHE_COVERAGE_CHANGE'),
  PREFERENCES_ENFORCED: preferences.preferences_enforced === true && engine.includes('preferences.email_enabled'),
  UNSUBSCRIBED_EXCLUDED: preferences.unsubscribed_excluded === true,
  GLOBAL_EMAIL_DISABLE_ENFORCED: preferences.global_email_disable_enforced === true,
  DEDUPE_PASS: queue.dedupe === 'PASS',
  AGGREGATION_PASS: queue.aggregation === 'PASS',
  RATE_LIMIT_PASS: queue.rate_limit === 'PASS',
  WEBHOOKS_PASS: security.webhooks === 'PASS',
  NO_AFFILIATE_EMAIL_LINKS: security.affiliate_email_links === 0 && !/href=[^>]*affili/i.test(templates),
  NO_PII_LOGGING: security.pii_logging === 0,
  NO_SECRET_EXPOSED: security.secrets_exposed === 0,
  NO_UNEXPECTED_EMAIL_SENT: queue.unexpected_emails_sent === 0,
  D1_TEMPORAL_UNCHANGED: consistency.d1_temporal_modified === false,
  R2_UNCHANGED: consistency.r2_modified === false,
  PUBLIC_DATASET_UNCHANGED: consistency.public_dataset_modified === false
};

for (const [name, passed] of Object.entries(controls)) assert.equal(passed, true, `${name} failed`);
assert.deepEqual(activation.enabled_event_types.sort(), ['NEW_TEST_PUBLISHED', 'VERIFIED_SOFTWARE_CHANGE'].sort());
assert.equal(activation.unexpected_emails_sent, 0);
assert.equal(preferences.follow_unfollow_regression, 'PASS');
assert.equal(preferences.account_preferences_regression, 'PASS');
assert.equal(deliverability.open_tracking, 'OFF');
assert.equal(deliverability.click_tracking, 'OFF');
assert.match(wrangler, /"crons": \["\*\/5 \* \* \* \*"\]/);

const passed = Object.values(controls).filter(Boolean).length;
console.log(JSON.stringify({ status: 'PASS', controls_pass: passed, controls_total: Object.keys(controls).length, controls }, null, 2));
