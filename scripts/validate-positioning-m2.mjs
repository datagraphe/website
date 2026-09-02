import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = path.resolve(import.meta.dirname, '..');
const read = (route) => fs.readFileSync(path.join(root, 'dist', route, 'index.html'), 'utf8');
const text = (html) => html.replace(/<!--[\s\S]*?-->/g, ' ').replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ').replace(/&[a-z]+;|&#\d+;/gi, ' ').replace(/\s+/g, ' ');

const pages = {
  home: text(read('fr')),
  about: text(read('fr/a-propos')),
  methodology: text(read('fr/methodologie')),
  services: text(read('fr/services')),
  transparency: text(read('fr/transparence')),
  jibble: text(read('fr/tests/jibble')),
  clockify: text(read('fr/tests/clockify')),
  toggl: text(read('fr/tests/toggl-track')),
  comparison: text(read('fr/comparatifs/jibble-vs-clockify')),
};

const publicPositioning = [pages.home, pages.about, pages.methodology, pages.services, pages.transparency].join(' ');
const baselineCommit = '1b19b6b801d6a607e235df972f3e8dd3207430d6';
const headCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const originMain = execFileSync('git', ['rev-parse', 'origin/main'], { cwd: root, encoding: 'utf8' }).trim();
const responsiveCss = fs.readFileSync(path.join(root, 'src/styles/positioning-m2.css'), 'utf8');
const controls = {
  HOME_MEMORY_POSITIONING_PRESENT: pages.home.includes('Plus qu’un test') && pages.home.includes('mémoire vérifiable des logiciels'),
  ABOUT_LEARNING_ASSET_PRESENT: pages.about.includes('Ce que nous voulons posséder') && pages.about.includes('L’historique, lui, se construit avec le temps'),
  METHODOLOGY_TEMPORAL_LOOP_PRESENT: pages.methodology.includes('Un test est une référence pour le suivant') && pages.methodology.includes('amélioration de notre protocole'),
  METHODOLOGY_AI_NOT_SOURCE_OF_TRUTH: pages.methodology.includes('Le modèle d’IA n’est pas la source de vérité'),
  SERVICES_BACKGROUND_ENGINE_POSITIONING: pages.services.includes('contrôles en arrière-plan') && pages.services.includes('nécessite l’attention du client'),
  SERVICES_NO_EXTRA_DASHBOARD_OVERCLAIM: pages.services.includes('n’est pas de créer un dashboard supplémentaire'),
  TRANSPARENCY_MODEL_INDEPENDENCE: pages.transparency.includes('Notre indépendance ne dépend pas d’un fournisseur d’IA'),
  NO_INTERNAL_ARCHITECTURE_DISCLOSED: !/\bD1\b|\bR2\b|schéma de base|logique exacte de diff|heuristique|ontologie|auto-réparation|métriques internes de coût|architecture détaillée/i.test(publicPositioning),
  NO_FALSE_LONGITUDINAL_CLAIMS: !/historique longitudinal profond|centaines de logiciels déjà suivis/i.test(publicPositioning),
  NO_FALSE_CONTINUOUS_MONITORING: !/surveillance permanente|surveille en continu|suivi permanent de chaque logiciel/i.test(publicPositioning),
  NO_AI_PROVIDER_DEPENDENCY_CLAIM: pages.transparency.includes('peut changer de modèle ou de fournisseur'),
  NO_TEST_RESULTS_CHANGED: pages.jibble.includes('55,7 %') && pages.clockify.includes('56,0 %') && pages.toggl.includes('58,2 %'),
  NO_COMPARISON_RESULTS_CHANGED: pages.comparison.includes('18 décisions') || pages.comparison.includes('18 scénarios'),
  ZERO_UNSUPPORTED_CLAIMS: !/plateforme révolutionnaire|IA qui teste automatiquement tous les logiciels|autonome à 100 %|AI-first|disruptif/i.test(publicPositioning),
  BUILD_PASS: fs.existsSync(path.join(root, 'dist/fr/index.html')) && fs.existsSync(path.join(root, 'dist/fr/services/index.html')),
  ROUTES_PASS: Object.values(pages).every((value) => value.length > 200),
  RESPONSIVE_PASS: responsiveCss.includes('@media(max-width:900px)') && responsiveCss.includes('@media(max-width:620px)'),
  NO_COMMIT: headCommit === baselineCommit,
  NO_PUSH: originMain === baselineCommit,
  NO_DEPLOY: process.env.M2_DEPLOY_EXECUTED !== '1',
};

const failed = Object.entries(controls).filter(([, value]) => !value).map(([name]) => name);
console.log(JSON.stringify({ controls, pass: Object.keys(controls).length - failed.length, total: Object.keys(controls).length, failed }, null, 2));
if (failed.length) process.exit(1);
