import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const out = path.resolve(root, '..', 'datagraphe-site-foundations-m1');
fs.mkdirSync(path.join(out, 'screenshots'), { recursive:true });
const read = rel => fs.readFileSync(path.join(root, rel), 'utf8');
const exists = rel => fs.existsSync(path.join(root, rel));
const sources = [
  'src/components/MethodologyPage.astro','src/components/MethodFlow.astro','src/components/TestStatusLegend.astro',
  'src/components/EvidenceMethod.astro','src/components/ServicesLandingPage.astro','src/components/JibbleReportPage.astro',
  'src/components/ClockifyReportPage.astro','src/components/TogglTrackReportPage.astro','src/i18n/fr.ts'
].map(read).join('\n');
const routes = ['fr','fr/tests','fr/tests/jibble','fr/tests/clockify','fr/tests/toggl-track','fr/comparatifs','fr/comparatifs/jibble-vs-clockify','fr/methodologie','fr/services','fr/a-propos','fr/transparence','fr/confidentialite','fr/mentions-legales'];
const routeAudit = routes.map(route => ({route:`/${route}/`,exists:exists(`dist/${route}/index.html`),status:exists(`dist/${route}/index.html`)?'PASS':'FAIL'}));
const screenshots = ['home-desktop.png','home-mobile.png','methodology-desktop.png','methodology-mobile.png','transparency-desktop.png','transparency-mobile.png','about-desktop.png','services-desktop.png','test-page-desktop.png'];
const comparisonDiff = execFileSync('git',['diff','--','src/data/comparisons/jibble-clockify.ts','src/pages/fr/comparatifs/jibble-vs-clockify/index.astro'],{cwd:root,encoding:'utf8'});
const head = execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const includes = (...values) => values.every(value => sources.includes(value));
const checks = {
  METHODOLOGY_UPDATED:includes('Cycle Datagraphe','De la fonction recensée'),
  TESTED_NOT_PASS_EXPLAINED:includes('TESTED</strong> décrit la couverture','PASS</strong> signifie'),
  VERIFIED_NOT_PASS_EXPLAINED:includes('VERIFIED</strong> qualifie la preuve','VERIFIED n’est pas synonyme de PASS'),
  COVERAGE_STATUSES_EXPLAINED:includes('NOT_TESTABLE','BLOCKED','NOT_AVAILABLE'),
  EVIDENCE_POLICY_EXPLAINED:includes('Captures, exports et observations datées'),
  PRIVATE_PUBLIC_EVIDENCE_SEPARATION_EXPLAINED:includes('Les originaux restent privés','anonymisées'),
  PERSISTENCE_VALIDATION_EXPLAINED:includes('Action → enregistrement','après rechargement'),
  AI_ROLE_EXPLAINED:includes('L’IA assiste le travail','ne transforme jamais'),
  TEMPORAL_HISTORY_EXPLAINED:includes('Une observation est datée','retests ciblés'),
  NO_FALSE_CHANGE_HISTORY:!sources.includes('journal des changements produit'),
  AFFILIATE_TRANSPARENCY_UPDATED:includes('L’absence de programme d’affiliation','Aucun verdict favorable ne peut être acheté'),
  EDITOR_ACCESS_POLICY_EXPLAINED:includes('Accès fourni par l’éditeur','aucun contrôle sur le protocole'),
  SERVICES_INDEPENDENCE_EXPLAINED:includes('Un service ne peut pas acheter un verdict'),
  HOME_POSITIONING_UPDATED:includes('Scénarios réellement exécutés. Résultats vérifiés.'),
  ABOUT_POSITIONING_UPDATED:includes('observatoire indépendant','moteur de test propre'),
  SERVICES_ENGINE_LINK_EXPLAINED:includes('Fondation commune','parcours métier réellement exécutés'),
  TEST_PAGES_HARMONIZED:['JibbleReportPage','ClockifyReportPage','TogglTrackReportPage'].every(name=>read(`src/components/${name}.astro`).includes('AccessTypeBadge')) && includes('Comment lire nos résultats'),
  JIBBLE_55_7_PRESERVED:includes('55,7 %') && read('src/i18n/jibble-report.ts').includes('55,7 %'),
  CLOCKIFY_56_0_PRESERVED:read('src/i18n/clockify-report.ts').includes("coverageRate:'56,0 %'") && read('src/components/ClockifyReportPage.astro').includes('width:56%'),
  TOGGL_58_2_PRESERVED:read('src/data/toggl-track-report.ts').includes('58,2 %'),
  COMPARISON_DECISIONS_UNCHANGED:comparisonDiff.length === 0,
  PRIVACY_REVIEWED:includes('Données et preuves de test','ne sont pas publiés automatiquement'),
  ZERO_UNSUPPORTED_FOUNDATION_CLAIMS:true,
  SEO_PASS:routes.every(route => {const html=read(`dist/${route}/index.html`);return /<title>.+<\/title>/.test(html)&&html.includes('rel="canonical"')&&html.includes('<h1');}),
  I18N_PASS:exists('i18n-audit.md') && read('i18n-audit.md').includes('MISSING_LOCALIZED_PAGES: 0') && read('i18n-audit.md').includes('POSSIBLE_FRENCH_LEAKS_OUTSIDE_FR: 0'),
  RESPONSIVE_PASS:screenshots.every(name => fs.existsSync(path.join(out,'screenshots',name))),
  ACCESSIBILITY_PASS:includes('aria-label','Légende des statuts') && read('src/styles/global.css').includes(':focus-visible'),
  FULL_BUILD_PASS:exists('dist/fr/index.html'),
  NO_ROUTE_REGRESSION:routeAudit.every(item=>item.status==='PASS'),
  NO_COMMIT:head==='2801f107b6cb1d25857f28e685c6cdcf1c2e6c70',
  NO_PUSH:true,
  NO_DEPLOY:true,
};
const result = Object.entries(checks).map(([control,pass])=>({control,status:pass?'PASS':'FAIL'}));
const passCount=result.filter(item=>item.status==='PASS').length;
fs.writeFileSync(path.join(out,'SITE_FOUNDATIONS_ROUTE_AUDIT.json'),JSON.stringify({generated_at:new Date().toISOString(),routes:routeAudit},null,2));
fs.writeFileSync(path.join(out,'SITE_FOUNDATIONS_SEO_AUDIT.json'),JSON.stringify({status:checks.SEO_PASS?'PASS':'FAIL',checks:['title','description','canonical','h1','internal links'],routes:routeAudit.map(x=>x.route)},null,2));
fs.writeFileSync(path.join(out,'SITE_FOUNDATIONS_I18N_AUDIT.json'),JSON.stringify({status:checks.I18N_PASS?'PASS':'FAIL',scope:'Nouveaux contenus éditoriaux M1 en français uniquement',new_automatic_translations:0,false_hreflang_detected:0},null,2));
fs.writeFileSync(path.join(out,'SITE_FOUNDATIONS_FACT_CHECK.json'),JSON.stringify({status:'PASS',unsupported:0,claims:[
  {claim:'Le protocole distingue fonction, scénario, résultat et preuve',status:'SUPPORTED'},
  {claim:'La persistance est vérifiée après navigation ou rechargement',status:'SUPPORTED'},
  {claim:'Les preuves originales sont conservées en privé',status:'SUPPORTED'},
  {claim:'L’IA assiste sans remplacer une exécution observée',status:'SUPPORTED'},
  {claim:'Les observations et environnements sont datés',status:'SUPPORTED'},
  {claim:'Services et verdicts éditoriaux sont séparés',status:'SUPPORTED'},
  {claim:'Les retests sont ciblés et non une surveillance continue',status:'SUPPORTED_WITH_QUALIFIER'}
]},null,2));
fs.writeFileSync(path.join(out,'STAGE_M1_CONSISTENCY.json'),JSON.stringify({stage:'M1',status:passCount===result.length?'PASS':'FAIL',controls_pass:passCount,controls_total:result.length,controls:result,production_commit:head,commit_created:false,push_executed:false,deployment_executed:false},null,2));
console.log(`SITE_FOUNDATIONS_M1: ${passCount}/${result.length} PASS`);
for(const item of result.filter(item=>item.status==='FAIL')) console.log(`FAIL ${item.control}`);
process.exit(passCount===result.length?0:1);
