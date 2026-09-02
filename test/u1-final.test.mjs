import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('MY_FOLLOWS_PAGE_GROUPS', () => {
  const source = read('src/scripts/account-pages.ts');
  for (const label of ['Logiciels', 'Catégories', 'Comparatifs', 'Datagraphe']) assert.match(source, new RegExp(`title: '${label}'`));
  assert.match(source, /data-unfollow-id/);
  assert.match(source, /follow-status/);
  assert.match(source, /item\.status === 'PAUSED' \? 'Suspendu'/);
  assert.match(source, /created_at/);
  assert.match(source, /Vous ne suivez encore aucun logiciel/);
});

test('PRIVACY_AND_CONSENT_COPY', () => {
  const source = read('src/i18n/fr.ts');
  for (const label of ['Compte utilisateur', 'Clerk agit comme prestataire', 'Suppression du compte', 'identifiant Clerk']) assert.match(source, new RegExp(label));
  assert.match(source, /Suivre l’actualité Datagraphe et consentir à une newsletter générale sont des choix distincts/);
  assert.match(source, /n’influence jamais nos tests, nos résultats ou nos liens affiliés/);
  assert.doesNotMatch(source, /Le site statique ne comporte ni compte utilisateur/);
});

test('CSP_IS_RESTRICTED_AND_CLERK_COMPATIBLE', () => {
  const source = read('public/_headers');
  assert.match(source, /Content-Security-Policy:/);
  assert.match(source, /https:\/\/\*\.clerk\.accounts\.dev/);
  assert.match(source, /https:\/\/challenges\.cloudflare\.com/);
  assert.match(source, /object-src 'none'/);
  assert.match(source, /base-uri 'self'/);
  assert.doesNotMatch(source, /(?:default-src|script-src|connect-src) \*/);
});

test('AUTH_BACKEND_DERIVES_IDENTITY_FROM_CLERK_TOKEN', () => {
  const auth = read('workers/user-api/src/auth.mjs');
  const app = read('workers/user-api/src/app.mjs');
  assert.match(auth, /authenticateRequest/);
  assert.match(auth, /authorizedParties/);
  assert.match(auth, /acceptsToken: 'session_token'/);
  assert.match(auth, /auth\.userId/);
  assert.doesNotMatch(app, /body\?\.user_id|body\.user_id/);
});

test('COOKIE_AUDIT_AND_NOTIFICATION_COPY', () => {
  const cookie = read('U1_COOKIE_AUDIT.md');
  const account = read('src/scripts/account-pages.ts');
  assert.match(cookie, /datagraphe_follow_intent_v1/);
  assert.match(cookie, /aucun cookie publicitaire/i);
  assert.match(account, /Les alertes email sont disponibles pour les nouveaux tests et les changements logiciels vérifiés/);
  assert.doesNotMatch(account, /L’envoi des alertes sera activé prochainement/);
  assert.doesNotMatch(account, /email métier|\bU1\b|\bU2\b/);
});
