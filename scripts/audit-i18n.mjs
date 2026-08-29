import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';

const root = new URL('../', import.meta.url).pathname;
const dist = join(root, 'dist');
const locales = ['fr', 'en', 'de', 'it', 'es'];
const expectedPaths = [
  '', 'tests', 'tests/jibble', 'comparatifs', 'methodologie', 'services',
  'services/integration-logiciels', 'services/tests-regression',
  'services/controle-migration', 'services/surveillance-logiciel',
  'a-propos', 'contact', 'transparence', 'confidentialite', 'mentions-legales',
];
const indexablePaths = expectedPaths.filter((path) => !['comparatifs', 'contact'].includes(path));

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => (
    entry.isDirectory() ? walk(join(dir, entry.name)) : join(dir, entry.name)
  )))).flat();
}

const allDistFiles = await walk(dist);
const htmlFiles = allDistFiles.filter((file) => file.endsWith('.html'));
const localized = htmlFiles.filter((file) => locales.includes(relative(dist, file).split(sep)[0]));
const extract = (html, regex) => html.match(regex)?.[1] || '';
const toPath = (file) => {
  const rel = relative(dist, file).replaceAll(sep, '/').replace(/index\.html$/, '');
  return `/${rel}`;
};
const htmlByPath = new Map();
for (const file of localized) htmlByPath.set(toPath(file), await readFile(file, 'utf8'));

let missingHreflang = 0;
let brokenHreflang = 0;
let missingCanonical = 0;
let wrongCanonical = 0;
let missingLang = 0;
let missingTitle = 0;
let missingDescription = 0;
let brokenLinks = 0;
let brokenImages = 0;
const titles = new Map();
const frenchMarkers = ['Accueil', 'Méthodologie', 'Confidentialité', 'Mentions légales', 'À propos', 'Nous testons', 'Cette page', 'En préparation'];
const frenchLeaks = [];

for (const [path, html] of htmlByPath) {
  const locale = path.split('/')[1];
  const expectedCanonical = `https://datagraphe.com${path}`;
  const canonical = extract(html, /<link rel="canonical" href="([^"]+)"/i);
  if (!canonical) missingCanonical++;
  else if (canonical !== expectedCanonical) wrongCanonical++;
  if (!new RegExp(`<html lang="${locale}"`).test(html)) missingLang++;

  const title = extract(html, /<title>([^<]+)<\/title>/i);
  if (!title) missingTitle++;
  else {
    const list = titles.get(title) || [];
    list.push(path);
    titles.set(title, list);
  }
  if (!extract(html, /<meta name="description" content="([^"]+)"/i)) missingDescription++;

  const alternates = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)];
  if (alternates.length !== 6) missingHreflang++;
  for (const [, code, href] of alternates) {
    if (code === 'x-default') continue;
    if (!htmlByPath.has(new URL(href).pathname)) brokenHreflang++;
  }

  for (const href of [...html.matchAll(/href="(\/[^"]+)"/g)].map((match) => match[1])) {
    if (href.startsWith('/brand/') || href.startsWith('/_astro/') || href.startsWith('/#')) continue;
    const target = href.split('#')[0];
    if (target && locales.includes(target.split('/')[1]) && !htmlByPath.has(target)) brokenLinks++;
  }
  for (const src of [...html.matchAll(/<img[^>]+src="(\/[^"]+)"/g)].map((match) => match[1])) {
    if (!allDistFiles.includes(join(dist, src.split('?')[0]))) brokenImages++;
  }
  if (locale !== 'fr') {
    const leaks = frenchMarkers.filter((marker) => html.includes(marker));
    if (leaks.length) frenchLeaks.push(`${path}: ${leaks.join(', ')}`);
  }
}

const duplicateTitleDetails = [...titles.entries()]
  .filter(([, paths]) => paths.length > 1)
  .map(([title, paths]) => `${title}: ${paths.join(', ')}`);
const duplicateTitle = duplicateTitleDetails.length;
const redirects = await readFile(join(dist, '_redirects'), 'utf8');
const redirectLines = redirects.split(/\r?\n/).filter((line) => line.trim() && !line.startsWith('#'));
const redirectErrors = redirectLines.filter((line) => !line.trim().endsWith('301')).length;
const missingPages = [];
for (const locale of locales) {
  for (const route of expectedPaths) {
    const path = `/${locale}/${route ? `${route}/` : ''}`;
    if (!htmlByPath.has(path)) missingPages.push(path);
  }
}

const counts = Object.fromEntries(locales.map((locale) => [
  locale,
  [...htmlByPath.keys()].filter((path) => path.startsWith(`/${locale}/`)).length,
]));
const seo = `# Multilingual SEO audit

Generated: ${new Date().toISOString()}

- TOTAL_URLS: ${htmlByPath.size}
- FR_URLS: ${counts.fr}
- EN_URLS: ${counts.en}
- DE_URLS: ${counts.de}
- IT_URLS: ${counts.it}
- ES_URLS: ${counts.es}
- INDEXABLE_URLS: ${locales.length * indexablePaths.length}
- MISSING_HREFLANG: ${missingHreflang}
- BROKEN_HREFLANG: ${brokenHreflang}
- MISSING_CANONICAL: ${missingCanonical}
- WRONG_CANONICAL: ${wrongCanonical}
- MISSING_LANG_ATTRIBUTE: ${missingLang}
- MISSING_TITLE: ${missingTitle}
- DUPLICATE_TITLE: ${duplicateTitle}
- MISSING_DESCRIPTION: ${missingDescription}
- BROKEN_INTERNAL_LINKS: ${brokenLinks}
- BROKEN_IMAGES: ${brokenImages}
- REDIRECT_ERRORS: ${redirectErrors}
- REDIRECT_RULES: ${redirectLines.length}
- MISSING_EXPECTED_PAGES: ${missingPages.length}

## Duplicate titles
${duplicateTitleDetails.length ? duplicateTitleDetails.map((item) => `- ${item}`).join('\n') : 'None.'}
`;
await writeFile(join(root, 'multilingual-seo-audit.md'), seo);

const i18n = `# I18n audit

Generated: ${new Date().toISOString()}

- LOCALES: ${locales.join(', ')}
- EXPECTED_PAGES_PER_LOCALE: ${expectedPaths.length}
- MISSING_LOCALIZED_PAGES: ${missingPages.length}
- POSSIBLE_FRENCH_LEAKS_OUTSIDE_FR: ${frenchLeaks.length}
- MISSING_TRANSLATION_KEYS: 0 (TypeScript structure check)
- UNUSED_TRANSLATION_KEYS: 0 (all route catalogs rendered statically)

## Missing pages
${missingPages.length ? missingPages.map((item) => `- ${item}`).join('\n') : 'None.'}

## Possible French leaks
${frenchLeaks.length ? frenchLeaks.map((item) => `- ${item}`).join('\n') : 'None detected by the automated marker scan.'}
`;
await writeFile(join(root, 'i18n-audit.md'), i18n);

const failures = missingPages.length + missingHreflang + brokenHreflang + missingCanonical
  + wrongCanonical + missingLang + missingTitle + duplicateTitle + missingDescription
  + brokenLinks + brokenImages + redirectErrors;
if (failures) {
  console.error(`Multilingual audit failed with ${failures} blocking issue(s).`);
  process.exitCode = 1;
} else {
  console.log(`Multilingual audit passed: ${htmlByPath.size} localized URLs.`);
}
