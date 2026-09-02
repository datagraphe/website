import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderNotificationEmail } from '../src/templates.mjs';

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const output = path.resolve(site, '../datagraphe-users-u2a/previews');
fs.mkdirSync(output, { recursive: true });

const common = {
  event_version: '1',
  verification_status: 'VERIFIED',
  public_status: 'PUBLISHABLE',
  locale: 'fr'
};

const verified = renderNotificationEmail({
  unsubscribeToken: 'preview-opaque-token-not-a-secret',
  queue: {
    notificationType: 'VERIFIED_SOFTWARE_CHANGE',
    payload: { events: [{ ...common, event_id: 'EVENT-TEST-002', event_type: 'VERIFIED_SOFTWARE_CHANGE', change_subtype: 'FEATURE_CHANGED', software_slug: 'jibble', software_name: 'Jibble', summary: 'La disponibilité du réglage a changé après une nouvelle vérification.', verified_at: '2 septembre 2026', public_url: 'https://datagraphe.com/fr/tests/jibble/' }] }
  }
});

const newTest = renderNotificationEmail({
  unsubscribeToken: 'preview-opaque-token-not-a-secret',
  queue: {
    notificationType: 'NEW_TEST_PUBLISHED',
    payload: { events: [{ ...common, event_id: 'EVENT-TEST-001', event_type: 'NEW_TEST_PUBLISHED', software_slug: 'toggl-track', software_name: 'Toggl Track', summary: 'Le test Toggl Track est publié.', published_at: '2 septembre 2026', public_url: 'https://datagraphe.com/fr/tests/toggl-track/', public_metrics: { total_features: 61, coverage_rate: 58.2 } }] }
  }
});

fs.writeFileSync(path.join(output, 'verified-change-desktop.html'), verified.html);
fs.writeFileSync(path.join(output, 'verified-change.txt'), verified.text);
fs.writeFileSync(path.join(output, 'new-test-desktop.html'), newTest.html);
fs.writeFileSync(path.join(output, 'new-test.txt'), newTest.text);
console.log(`EMAIL_PREVIEWS_GENERATED=${output}`);
