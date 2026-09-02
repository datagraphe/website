import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const outputDir = path.resolve(root, '..', 'datagraphe-users-u2b');
const u2aDir = path.resolve(root, '..', 'datagraphe-users-u2a');
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(outputDir, name), 'utf8'));
const read = (name) => fs.readFileSync(path.join(outputDir, name), 'utf8');

const dns = readJson('U2B_DNS_AFTER.json');
const resend = readJson('U2B_RESEND_AUDIT.json');
const migration = readJson('U2B_D1_MIGRATION_AUDIT.json');
const worker = readJson('U2B_WORKER_AUDIT.json');
const queue = readJson('U2B_QUEUE_AUDIT.json');
const email = readJson('U2B_EMAIL_TEST_REPORT.json');
const webhook = readJson('U2B_WEBHOOK_AUDIT.json');
const deliverability = readJson('U2B_DELIVERABILITY_AUDIT.json');
const security = readJson('U2B_SECURITY_AUDIT.json');
const gate = readJson('U2B_REAL_USER_ACTIVATION_GATE.json');
const consistency = readJson('U2B_CONSISTENCY.json');
const privacy = read('U2B_PRIVACY_AUDIT.md');
const workerConfig = fs.readFileSync(path.join(root, 'workers/notification-worker/wrangler.jsonc'), 'utf8');
const workerSource = fs.readFileSync(path.join(root, 'workers/notification-worker/src/app.mjs'), 'utf8') + fs.readFileSync(path.join(root, 'workers/notification-worker/src/engine.mjs'), 'utf8');

const controls = {
  U2A_BASELINE_VALID: fs.existsSync(path.join(u2aDir, 'U2_ARCHITECTURE.md')) && fs.existsSync(path.join(u2aDir, 'U2_QUEUE_TEST_REPORT.json')),
  RESEND_CONFIGURED: resend.provider === 'Resend' && resend.test_messages_delivered === 3,
  RESEND_SECRET_PRIVATE: resend.api_key_stored_as_worker_secret === true && resend.api_key_exposed === false,
  DOMAIN_VERIFIED: dns.domain_verified_by_provider === true,
  SPF_VALID: dns.spf.status === 'PASS',
  DKIM_VALID: dns.dkim.status === 'PASS',
  DMARC_ACCEPTABLE: ['PASS', 'ACCEPTABLE'].includes(dns.dmarc.status),
  FROM_DOMAIN_VALID: resend.from_domain_valid === true,
  D1_MIGRATION_PASS: migration.status === 'PASS' && migration.migration_additive === true,
  NOTIFICATION_WORKER_DEPLOYED: worker.status === 'PASS' && Boolean(worker.version_id),
  HEALTH_CHECK_PASS: worker.health_status === 200 && worker.health_body_safe === true,
  D1_QUEUE_PASS: queue.status === 'PASS' && queue.sent_rows === 3 && queue.notification_log_rows === 3,
  TEST_ALLOWLIST_ACTIVE: worker.allowlist_secret_present === true && worker.notification_mode === 'test-recipient-only',
  REAL_USER_EMAILS_ZERO: email.real_user_emails_sent === 0 && consistency.real_user_emails_sent === 0,
  NEW_TEST_EMAIL_PASS: email.new_test_email === 'PASS',
  VERIFIED_CHANGE_EMAIL_PASS: email.verified_change_email === 'PASS',
  DEDUPE_PASS: queue.dedupe_replay_inserted === 0,
  PREFERENCES_PASS: queue.preference_disabled_inserted === 0,
  GLOBAL_DISABLE_PASS: queue.global_email_disabled_inserted === 0,
  UNSUBSCRIBE_PASS: /confirmation then one-time POST/.test(read('email-source-summary.txt')) && queue.temporary_subscriptions_remaining === 0,
  ONE_CLICK_UNSUBSCRIBE_PASS_OR_DOCUMENTED: workerSource.includes('List-Unsubscribe-Post') || fs.readFileSync(path.join(root, 'workers/notification-worker/src/engine.mjs'), 'utf8').includes('List-Unsubscribe-Post'),
  WEBHOOK_SIGNATURE_PASS: webhook.signature_validation === 'PASS' && webhook.invalid_signature_rejected === 'PASS',
  WEBHOOK_REPLAY_PASS: webhook.replay_protection === 'PASS' && webhook.duplicate_event_rows === 0,
  AGGREGATION_PASS: email.aggregation_email === 'PASS' && queue.aggregation_source_events === 3 && queue.aggregation_queue_item === 1,
  RATE_LIMIT_PASS: queue.rate_limit.status === 'PASS_UNIT' && queue.rate_limit.max_per_user_per_day === 5,
  NO_AFFILIATE_LINKS: email.affiliate_links === 0,
  OPEN_TRACKING_OFF: resend.open_tracking === false && deliverability.open_tracking === 'OFF',
  CLICK_TRACKING_OFF: resend.click_tracking === false && deliverability.click_tracking === 'OFF',
  NO_PII_LOGGING: security.pii_logged === 0 && !/console\.(log|warn|error)\s*\(/.test(workerSource),
  NO_SECRET_EXPOSED: security.secrets_exposed === 0 && !/(whsec_|re_[A-Za-z0-9]{20,}|Bearer\s+[A-Za-z0-9._-]{20,})/.test([workerConfig, workerSource, read('U2B_PRIVACY_AUDIT.md'), read('email-source-summary.txt')].join('\n')),
  PRIVACY_READY: privacy.includes('PRIVACY_READY = PASS'),
  PRODUCTION_SITE_REGRESSION_NONE: consistency.full_build === 'PASS' && consistency.production_site_regression_none === true,
  REAL_USER_GATE_CREATED: gate.gate === 'READY' && gate.live_user_notifications_authorized === false && gate.cron_enabled === false
};

const entries = Object.entries(controls);
const passed = entries.filter(([, value]) => value).length;
for (const [name, value] of entries) console.log(`${name}=${value ? 'PASS' : 'FAIL'}`);
console.log(`CONTROLS_PASS=${passed}/${entries.length}`);
console.log(`USERS_U2B_CONFIGURATION_COMPLETE=${passed === entries.length ? 'YES' : 'NO'}`);
if (passed !== entries.length) process.exitCode = 1;
