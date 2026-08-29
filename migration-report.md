# Datagraphe multilingual migration report

Date: 2026-08-29

## Architecture

- One Astro project
- One Git repository
- One Cloudflare Pages deployment
- Five prefixed locales: `fr`, `en`, `de`, `it`, `es`
- One factual Jibble source: `src/data/software/jibble.json`
- One shared route manifest: `src/i18n/routes.ts`
- Localized editorial catalogs: `src/i18n/fr.ts`, `en.ts`, `de.ts`, `it.ts`, `es.ts`

## URL matrix

Every locale exposes the following 15 routes. Replace `{locale}` with `fr`, `en`, `de`, `it` or `es`:

- `/{locale}/`
- `/{locale}/tests/`
- `/{locale}/tests/jibble/`
- `/{locale}/comparatifs/` — temporary `noindex`
- `/{locale}/methodologie/`
- `/{locale}/services/`
- `/{locale}/services/integration-logiciels/`
- `/{locale}/services/tests-regression/`
- `/{locale}/services/controle-migration/`
- `/{locale}/services/surveillance-logiciel/`
- `/{locale}/a-propos/`
- `/{locale}/contact/` — temporary `noindex`
- `/{locale}/transparence/`
- `/{locale}/confidentialite/`
- `/{locale}/mentions-legales/`

Counts: 15 FR + 15 EN + 15 DE + 15 IT + 15 ES = 75 localized URLs, including 65 indexable URLs.

## Permanent redirects

- `https://www.datagraphe.com/*` → `https://datagraphe.com/:splat`
- `/` → `/fr/`
- `/tests/` → `/fr/tests/`
- `/tests/jibble/` → `/fr/tests/jibble/`
- `/comparatifs/` → `/fr/comparatifs/`
- `/methodologie/` → `/fr/methodologie/`
- `/services/` → `/fr/services/`
- `/services/integration-logiciels/` → `/fr/services/integration-logiciels/`
- `/services/tests-regression/` → `/fr/services/tests-regression/`
- `/services/controle-migration/` → `/fr/services/controle-migration/`
- `/services/surveillance-logiciel/` → `/fr/services/surveillance-logiciel/`
- `/a-propos/` → `/fr/a-propos/`
- `/contact/` → `/fr/contact/`
- `/transparence/` → `/fr/transparence/`
- `/confidentialite/` → `/fr/confidentialite/`
- `/mentions-legales/` → `/fr/mentions-legales/`
- `/categories/` → `/fr/`
- `/categories/gestion-du-temps/` → `/fr/tests/jibble/`

All rules are 301 redirects. There is no IP-, country- or browser-language redirect.

## SEO and quality checks

- Successful production build: 93 static files/routes, including 75 localized pages
- Localized pages crawled: 75
- Missing localized pages: 0
- Missing/broken hreflang: 0
- Missing/wrong canonical: 0
- Missing/duplicate title: 0
- Missing descriptions: 0
- Broken localized internal links: 0
- Broken images: 0
- Invalid JSON-LD blocks: 0 out of 150
- Redirect configuration errors: 0
- French-marker leaks outside FR: 0
- Responsive overflow across 25 locale/viewport combinations: 0

Detailed reports: `i18n-audit.md`, `multilingual-seo-audit.md`, `audits/responsive-audit.md`.

## Sitemap and Search Console

Submit `https://datagraphe.com/sitemap-index.xml`. It references the five locale sitemaps and excludes temporary `noindex` pages.
