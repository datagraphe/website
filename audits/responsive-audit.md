# Responsive and interaction audit

Date: 2026-08-29

## Coverage

- Locales: `fr`, `en`, `de`, `it`, `es`
- Viewports: 375, 430, 768, 1024 and 1440 px
- Pages checked visually: the five home pages and the German Jibble page
- Total locale/viewport combinations checked: 25

## Results

- Horizontal overflow: 0
- Incorrect `<html lang>` values: 0
- Missing localized home H1: 0
- German button, title or navigation overflow: 0
- Mobile menu available at 375, 430 and 768 px: yes
- Desktop navigation available at 1024 and 1440 px: yes
- Language links keyboard-focusable: 5/5
- Language links with explicit accessible label: 5/5
- Current locale exposed with `aria-current="page"`: yes
- Equivalent route preserved by language selector: yes (`/de/tests/jibble/` links to `/en/tests/jibble/`, not `/en/`)

## Captures

- `screenshots/fr-home.png`
- `screenshots/en-home.png`
- `screenshots/de-home.png`
- `screenshots/it-home.png`
- `screenshots/es-home.png`
- `screenshots/language-selector-desktop.png`
- `screenshots/de-mobile-375-closed.png`
- `screenshots/de-mobile-375.png` (mobile menu open)

## Lighthouse note

The command-line Lighthouse runner could not connect to its isolated Chrome process in this workspace. No score is asserted or fabricated. Build-time SEO checks, structured-data parsing, link crawling, image checks and browser-based responsive/accessibility checks were completed independently.
