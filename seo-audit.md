# Audit SEO — Datagraphe.com

Date de l’audit : 28 août 2026  
Périmètre : build statique Astro local, 18 pages HTML générées.

## Synthèse chiffrée

| Indicateur | Résultat |
|---|---:|
| TOTAL_URLS | 18 |
| INDEXABLE_URLS | 15 |
| NOINDEX_URLS | 3 |
| BROKEN_INTERNAL_LINKS | 0 |
| BROKEN_EXTERNAL_LINKS | 0 |
| DUPLICATE_TITLES | 0 |
| DUPLICATE_DESCRIPTIONS | 0 |
| MISSING_H1 | 0 |
| MISSING_META_DESCRIPTION | 0 |
| MISSING_CANONICAL | 0 |
| LIGHTHOUSE_RESULTS | NOT_RUN — Chrome local inaccessible à Lighthouse dans l’environnement d’audit |

Le build produit 18 pages sans erreur. Les routes principales testées localement répondent en HTTP 200 et une URL inexistante répond en HTTP 404.

## Indexabilité

### INDEXABLE

- `/`
- `/a-propos/`
- `/categories/`
- `/categories/gestion-du-temps/`
- `/confidentialite/`
- `/mentions-legales/`
- `/methodologie/`
- `/services/`
- `/services/controle-migration/`
- `/services/integration-logiciels/`
- `/services/surveillance-logiciel/`
- `/services/tests-regression/`
- `/tests/`
- `/tests/jibble/`
- `/transparence/`

### NOINDEX_TEMPORARY

- `/comparatifs/` : aucun comparatif complet publié.
- `/contact/` : formulaire et coordonnées définitives non activés.
- `/404/` : page d’erreur.

Les trois URLs `noindex` sont exclues du sitemap XML. Les previews `*.pages.dev` reçoivent un en-tête `X-Robots-Tag: noindex` via Cloudflare Pages afin d’éviter une duplication du domaine canonique.

## Corrections réalisées

- Une page 404 réelle est générée ; Cloudflare ne traite donc plus le site comme une application monopage de secours.
- Les URLs utilisent toutes le domaine canonique `https://datagraphe.com` et un trailing slash cohérent.
- Chaque page possède exactement un H1, un title unique, une description unique et un canonical auto-référent.
- Les métadonnées OpenGraph et Twitter comprennent title, description, URL, image et texte alternatif.
- Les données structurées globales contiennent `Organization` et `WebSite`.
- Les pages Services utilisent `Service` et la page Jibble utilise `SoftwareApplication`, sans fausse note `Review`.
- Les fils d’Ariane visibles génèrent `BreadcrumbList`.
- L’architecture `/categories/` et `/categories/gestion-du-temps/` est créée avec un contenu utile.
- La page Jibble relie sa catégorie, la méthodologie, les tests et la transparence.
- Les futures pages d’alternatives et de comparatifs ne sont pas créées tant qu’un contenu vérifié n’est pas disponible.
- Deux liens externes utiles renvoient vers la documentation officielle Jibble ; ils sont accessibles et ne portent pas de `nofollow` artificiel.
- Aucun lien affilié n’est actuellement rendu. Tout futur lien affilié devra utiliser `rel="sponsored"`.
- Les assets Astro fingerprintés reçoivent un cache navigateur long ; les fichiers de marque gardent une durée courte pour faciliter leur mise à jour.
- Des en-têtes de sécurité légers sont préparés pour Cloudflare Pages.

## Responsive et accessibilité

Le CSS contient des adaptations desktop, tablette et mobile, notamment à 900 px et 620 px : navigation mobile, grilles Services, cartes, colonnes de contenu et footer. Les CTA ont une surface tactile suffisante, les images ont des dimensions explicites et le logo du header ne crée pas de décalage de mise en page.

La matrice visuelle demandée à 375, 430, 768, 1024 et 1440 px n’a pas pu être automatisée dans cet environnement : le navigateur local n’était pas accessible au moteur Lighthouse. Cette vérification doit être exécutée après déploiement avec Chrome DevTools ou PageSpeed Insights. Aucun score Lighthouse n’est inventé.

Limite de performance connue : le logo officiel PNG pèse environ 1,08 Mo. Il est conservé sans transformation conformément à la consigne de marque. Une version officielle optimisée, fournie par le propriétaire de la marque, améliorerait le transfert initial sans modifier l’identité.

## Redirections et domaine canonique

À confirmer dans Cloudflare après déploiement :

- `http://datagraphe.com/*` → `https://datagraphe.com/*` ;
- `https://www.datagraphe.com/*` → `https://datagraphe.com/*` en 301 ;
- éventuellement `https://<projet>.pages.dev/*` → `https://datagraphe.com/*` en 301.

Les redirections et le canonical peuvent être combinés comme signaux de consolidation. Référence : [Google — spécifier une URL canonique](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).

## Google Search Console

1. Ouvrir [Google Search Console](https://search.google.com/search-console/).
2. Ajouter une propriété de type **Domaine** avec `datagraphe.com`, sans protocole ni `www`.
3. Copier l’enregistrement TXT fourni par Google.
4. Dans Cloudflare, ouvrir **DNS → Records → Add record**, choisir `TXT`, nom `@`, puis coller la valeur Google.
5. Revenir dans Search Console et lancer la validation. Une propriété Domaine couvre les protocoles et sous-domaines. [Documentation officielle](https://support.google.com/webmasters/answer/34592?hl=fr)
6. Dans **Sitemaps**, soumettre `https://datagraphe.com/sitemap-index.xml`. [Documentation officielle](https://support.google.com/webmasters/answer/7451001?hl=fr)
7. Dans **Inspection de l’URL**, inspecter puis demander l’indexation de `https://datagraphe.com/`.
8. Répéter pour `https://datagraphe.com/tests/jibble/`. Une demande n’est pas une garantie d’indexation. [Documentation officielle](https://support.google.com/webmasters/answer/9012289?hl=fr)
9. Surveiller **Indexation → Pages**, **Expérience → Signaux Web essentiels** et les améliorations détectées.
10. Pour les mises à jour nombreuses, privilégier le sitemap ; ne pas utiliser l’Indexing API pour ces pages normales.

## Bing Webmaster Tools

1. Ouvrir [Bing Webmaster Tools](https://www.bing.com/webmasters/).
2. Importer la propriété depuis Google Search Console ou ajouter `https://datagraphe.com` et valider la propriété.
3. Ouvrir **Sitemaps**.
4. Soumettre `https://datagraphe.com/sitemap-index.xml`.
5. Contrôler ensuite le statut de traitement et le nombre d’URLs découvertes. [Documentation Bing](https://www.bing.com/webmasters/help/sitemaps-3b5cf6ed)

## Contrôles à refaire après déploiement

- Lighthouse mobile et desktop sur la home, `/tests/jibble/` et `/services/`.
- Matrice visuelle aux cinq largeurs demandées.
- Redirections HTTPS, `www` et `pages.dev`.
- En-têtes Cloudflare réellement servis.
- Rich Results Test sur Jibble et deux pages Services.
- Validation du sitemap depuis l’extérieur.
- Core Web Vitals réels après collecte de données utilisateurs.

## Fichiers créés ou modifiés pendant cette passe

- `astro.config.mjs`
- `public/_headers`
- `src/components/Breadcrumb.astro`
- `src/components/CategoryCard.astro`
- `src/components/Footer.astro`
- `src/components/Header.astro`
- `src/layouts/BaseLayout.astro`
- `src/pages/404.astro`
- `src/pages/categories/index.astro`
- `src/pages/categories/gestion-du-temps.astro`
- `src/pages/comparatifs/index.astro`
- `src/pages/contact.astro`
- `src/pages/index.astro`
- `src/pages/tests/jibble/index.astro`
- suppression de `src/components/Footer 2.astro`
- suppression de `src/layouts/BaseLayout 2.astro`
- `seo-audit.md`
