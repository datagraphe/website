import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('HOME_MY_FOLLOWS_NAV_ONLY', () => {
  const component = read('src/components/HomeFollowsCta.astro');
  assert.match(component, /href=\{USER_ROUTES\.follows\}/);
  assert.match(component, /withQuery\(USER_ROUTES\.signUp, \{ returnTo: USER_ROUTES\.follows \}\)/);
  assert.doesNotMatch(component, /FollowButton|data-follow-button|authenticatedFetch|subscriptions/);
});

test('GLOBAL_FOLLOW_CONTROL_SEPARATE', () => {
  const home = read('src/pages/[lang]/[...path].astro');
  const account = read('src/components/AccountPage.astro');
  assert.match(home, /<HomeFollowsCta\/>/);
  assert.doesNotMatch(home, /targetKey="news"/);
  assert.match(account, /Suivre l’actualité Datagraphe/);
  assert.match(account, /type="DATAGRAPHE" targetKey="news"/);
});

test('FOLLOW_BUTTONS_AND_MY_FOLLOWS_ACTIONS', () => {
  const software = read('src/components/PublicDatasetSoftwareReport.astro');
  const followScript = read('src/scripts/follow-buttons.ts');
  const accountScript = read('src/scripts/account-pages.ts');
  assert.match(software, /label=\{`Suivre \$\{software\}`\}/);
  assert.match(followScript, /dataset\.subscriptionId/);
  assert.match(followScript, /method: 'DELETE'/);
  assert.match(followScript, /Ne plus suivre/);
  assert.match(accountScript, /data-unfollow-id/);
  assert.match(accountScript, /method: 'DELETE'/);
});

test('public user copy contains no internal phase labels', () => {
  const files = [
    'src/components/HomeFollowsCta.astro',
    'src/components/AuthPage.astro',
    'src/components/AccountPage.astro',
    'src/scripts/account-pages.ts',
    'src/components/PublicDatasetSoftwareReport.astro'
  ];
  const source = files.map(read).join('\n');
  assert.doesNotMatch(source, /\b(?:U1|U2|P1|A1|A2|A3)\b|\bStage\b|email métier|notifications U1|phase U1|\bTODO\b|\bdebug\b/i);
});
