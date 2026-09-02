import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.join(root, 'dist');
const accountRoutes = [
  'fr/connexion/index.html',
  'fr/inscription/index.html',
  'fr/mon-compte/index.html',
  'fr/mon-compte/suivis/index.html',
  'fr/mon-compte/preferences/index.html'
];

for (const route of accountRoutes) {
  const html = fs.readFileSync(path.join(dist, route), 'utf8');
  assert.match(html, /<meta name="robots" content="noindex, follow"/);
}

const sitemap = fs.readFileSync(path.join(dist, 'sitemap-fr.xml'), 'utf8');
for (const route of ['/fr/connexion/', '/fr/inscription/', '/fr/mon-compte/']) assert.doesNotMatch(sitemap, new RegExp(route.replaceAll('/', '\\/')));

const htmlFiles = [];
const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
  const file = path.join(directory, entry.name);
  if (entry.isDirectory()) walk(file);
  else if (entry.name.endsWith('.html')) htmlFiles.push(file);
});
walk(dist);
const html = htmlFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
assert.doesNotMatch(html, /user_[A-Za-z0-9]{8,}|sub_[A-Za-z0-9-]{8,}|sk_(?:test|live)_|Bearer\s+[A-Za-z0-9._-]{16,}/);
assert.doesNotMatch(html, /[A-Z0-9._%+-]+@(?!example\.)[A-Z0-9.-]+\.[A-Z]{2,}/i);
console.log('ACCOUNT_ROUTES_NOINDEX = PASS');
console.log('SITEMAP_PASS = PASS');
console.log('NO_PII_STATIC_HTML = PASS');
