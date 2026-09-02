import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { canonicalInternalNavigation, safeReturnTo, USER_ROUTES, withQuery } from '../src/lib/user-routes.mjs';

const root = path.resolve(import.meta.dirname, '..');

test('TRAILING_SLASH_AUTH_ROUTES', () => {
  assert.deepEqual(Object.values(USER_ROUTES), [
    '/fr/connexion/',
    '/fr/inscription/',
    '/fr/mon-compte/',
    '/fr/mon-compte/suivis/',
    '/fr/mon-compte/preferences/'
  ]);
  assert.equal(withQuery(USER_ROUTES.signUp, { returnTo: USER_ROUTES.account }), '/fr/inscription/?returnTo=%2Ffr%2Fmon-compte%2F');
  assert.equal(withQuery(USER_ROUTES.signIn, { returnTo: USER_ROUTES.account }), '/fr/connexion/?returnTo=%2Ffr%2Fmon-compte%2F');
});

test('returnTo paths are canonicalized with their final slash', () => {
  assert.equal(safeReturnTo('/fr/mon-compte'), '/fr/mon-compte/');
  assert.equal(safeReturnTo('/fr/tests/jibble'), '/fr/tests/jibble/');
  assert.equal(safeReturnTo('/fr/tests/jibble/?source=follow'), '/fr/tests/jibble/?source=follow');
  assert.equal(canonicalInternalNavigation('/fr/inscription#/verify-email-address'), '/fr/inscription/#/verify-email-address');
});

test('open redirects and out-of-scope paths are rejected', () => {
  for (const value of ['https://evil.example/fr/', '//evil.example/fr/', '/\\evil.example', '/fr/services/', 'javascript:alert(1)']) {
    assert.equal(safeReturnTo(value), USER_ROUTES.account);
  }
});

test('source does not contain a user route with query before the final slash', () => {
  const files = [
    'src/components/AccountPage.astro',
    'src/components/AuthPage.astro',
    'src/scripts/account-pages.ts',
    'src/scripts/auth-pages.ts',
    'src/scripts/clerk-client.ts',
    'src/scripts/follow-buttons.ts',
    'src/components/AccountNav.astro'
  ];
  const source = files.map((file) => fs.readFileSync(path.join(root, file), 'utf8')).join('\n');
  assert.doesNotMatch(source, /\/fr\/(?:connexion|inscription|mon-compte(?:\/(?:suivis|preferences))?)\?/);
});
