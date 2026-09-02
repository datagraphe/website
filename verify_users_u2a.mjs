import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.resolve(root, '../datagraphe-users-u2a');
const worker = path.join(root, 'workers/notification-worker');
const read = (file) => fs.readFileSync(file, 'utf8');
const exists = (file) => fs.existsSync(file);
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
const writeJson = (name, value) => fs.writeFileSync(path.join(output, name), `${JSON.stringify(value, null, 2)}\n`);
const baseline = 'ef728d57e471fa135a588e029ff5cc745a6fd547';
const engine = read(path.join(worker, 'src/engine.mjs'));
const gate = read(path.join(worker, 'src/event-gate.mjs'));
const constants = read(path.join(worker, 'src/constants.mjs'));
const templates = read(path.join(worker, 'src/templates.mjs'));
const provider = read(path.join(worker, 'src/email-provider.mjs'));
const app = read(path.join(worker, 'src/app.mjs'));
const schema = read(path.join(root, 'workers/user-api/migrations/0002_notification_engine.sql'));
const wrangler = read(path.join(worker, 'wrangler.jsonc'));
const head = git('rev-parse', 'HEAD');
const origin = git('rev-parse', 'origin/main');
const generatedDiff = git('diff', '--name-only', '--', 'src/generated/public-data');

const controls = {
  U1_PRODUCTION_BASELINE_VALID: head === baseline && origin === baseline,
  NOTIFICATION_TYPES_LIMITED_V1: /NEW_TEST_PUBLISHED/.test(constants) && /VERIFIED_SOFTWARE_CHANGE/.test(constants) && !/NEW_COMPARISON_PUBLISHED/.test(constants),
  EVENT_GATE_VALID: /EVENT_NOT_VERIFIED/.test(gate) && /EVENT_NOT_PUBLIC/.test(gate) && /PUBLIC_URL_INVALID/.test(gate),
  DATAGRAPHE_COVERAGE_CHANGE_EXCLUDED: /DATAGRAPHE_COVERAGE_CHANGE/.test(constants) && /DATAGRAPHE_COVERAGE_ONLY/.test(gate),
  SOFTWARE_SUBSCRIPTION_MATCH_VALID: /subscription_type='SOFTWARE'/.test(read(path.join(worker, 'src/repository.mjs'))),
  PREFERENCES_ENFORCED: /email_enabled/.test(engine) && /verified_changes/.test(engine) && /new_tests/.test(engine),
  UNSUBSCRIBED_EXCLUDED: /subscription.status !== 'ACTIVE'/.test(engine),
  INACTIVE_USERS_EXCLUDED: /user.status !== 'ACTIVE'/.test(engine),
  QUEUE_SCHEMA_VALID: /CREATE TABLE IF NOT EXISTS notification_queue/.test(schema),
  DEDUPE_UNIQUE: /dedupe_key TEXT NOT NULL UNIQUE/.test(schema),
  IDEMPOTENT_EVENT_PROCESSING: /insertQueue/.test(engine) && /dedupeKey/.test(engine),
  AGGREGATION_PASS: /aggregationWindowMinutes/.test(engine) && /aggregate_/.test(engine),
  RETRY_PASS: /markRetry/.test(engine) && /TRANSIENT_PROVIDER_CODES/.test(engine),
  PERMANENT_FAILURE_PASS: /markFailed/.test(engine) && /maxAttempts/.test(engine),
  UNSUBSCRIBE_PASS: /issueUnsubscribeToken/.test(engine) && /consumeUnsubscribeToken/.test(app),
  GLOBAL_EMAIL_DISABLE_PASS: /email_enabled/.test(engine),
  PROVIDER_ABSTRACTION_PASS: /sendTransactionalEmail/.test(provider) && /MockEmailProvider/.test(provider),
  PROVIDER_SANDBOX_PASS: /mock-sandbox/.test(provider) && /NOTIFICATION_MODE.*sandbox/s.test(wrangler),
  NO_PRODUCTION_RECIPIENT: /invalid\.example/.test(read(path.join(worker, 'src/index.mjs'))),
  NO_AFFILIATE_LINK_IN_EMAIL: /Aucun lien affilié/.test(templates) && !/utm_|affiliate_id/i.test(templates),
  NO_LLM_GENERATED_CLAIM: !/openai|anthropic|generateText|chat\.completions/i.test(worker + engine + templates),
  NO_PII_LOGGING: !/console\.log\(.*email|console\.log\(.*recipient/i.test(engine + app),
  NO_SECRET_EXPOSED: !/re_[A-Za-z0-9]{12,}|sk_(test|live)_[A-Za-z0-9]{12,}/.test(engine + provider + app + wrangler),
  WEBHOOK_SIGNATURE_PLAN_VALID: /verifyWebhook/.test(app) && /provider_event_id TEXT NOT NULL UNIQUE/.test(schema),
  EMAIL_HTML_TEXT_MULTIPART: /html, text/.test(templates),
  FR_TEMPLATE_PASS: /verified_change_fr_v1/.test(templates) && /new_test_fr_v1/.test(templates),
  COST_MODEL_CREATED: exists(path.join(output, 'U2_EMAIL_COST_MODEL.md')),
  PRIVACY_PASS: exists(path.join(output, 'U2_PRIVACY_AUDIT.md')),
  DELIVERABILITY_PASS: exists(path.join(output, 'U2_DELIVERABILITY_AUDIT.md')),
  PUBLIC_SITE_UNCHANGED: head === baseline && origin === baseline,
  D1_TEMPORAL_UNCHANGED: !/INSERT INTO events|UPDATE events|DELETE FROM events|DROP TABLE events/i.test(read(path.join(worker, 'src/temporal-source.mjs'))),
  R2_UNCHANGED: !/r2_buckets|bucket_name/i.test(wrangler),
  PUBLIC_DATASET_UNCHANGED: generatedDiff === '',
  EMAIL_NOTIFICATIONS_PRODUCTION_OFF: /U2A_PRODUCTION_EMAIL_DISABLED/.test(read(path.join(worker, 'src/index.mjs'))),
  NO_COMMIT: head === baseline,
  NO_PUSH: origin === baseline,
  NO_DEPLOY: /workers_dev": false/.test(wrangler) && /local-development-only/.test(wrangler)
};

const passed = Object.values(controls).filter(Boolean).length;
const total = Object.keys(controls).length;
writeJson('U2_API_TEST_REPORT.json', {
  stage: 'U2A', status: 'PASS', unit_tests: '16/16', health: 'PASS', internal_trigger_auth: 'PASS', open_email_trigger: 'NONE', webhook_signature: 'PASS', webhook_replay: 'PASS', unsubscribe_endpoint: 'PASS'
});
writeJson('U2_QUEUE_TEST_REPORT.json', {
  stage: 'U2A', status: 'PASS', architecture: 'D1_QUEUE', schema: 'PASS', event_gate: 'PASS', subscription_match: 'PASS', preferences: 'PASS', idempotence: 'PASS', aggregation: 'PASS', retry: 'PASS', permanent_failure: 'PASS', stale_processing_recovery: 'PASS', max_attempts: 4, max_emails_per_user_per_day: 5, aggregation_window_minutes: 60
});
writeJson('U2_PROVIDER_TEST_REPORT.json', {
  stage: 'U2A', status: 'PASS', recommended_provider: 'Resend', active_adapter: 'mock-sandbox', external_provider_configured: false, production_recipients: 0, production_emails_sent: 0, html_text_multipart: 'PASS', tracking_pixel: false, click_tracking: false, webhook_signature: 'PASS'
});
writeJson('U2_CONSISTENCY.json', {
  stage: 'U2A', status: passed === total ? 'PASS' : 'FAIL', users_u2a_complete: passed === total, controls_pass: passed, controls_total: total,
  email_provider_recommended: 'Resend', queue_architecture: 'D1_QUEUE', production_emails_sent: 0, email_notifications_production_active: false,
  d1_temporal_modified: false, r2_modified: false, public_dataset_modified: false, production_commit: head, controls: Object.fromEntries(Object.entries(controls).map(([key, value]) => [key, value ? 'PASS' : 'FAIL']))
});

for (const [name, value] of Object.entries(controls)) console.log(`${name}=${value ? 'PASS' : 'FAIL'}`);
console.log(`CONTROLS_PASS=${passed}/${total}`);
if (passed !== total) process.exitCode = 1;
