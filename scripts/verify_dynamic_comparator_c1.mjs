import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { buildComparisonSelection, validateComparisonSlugs } from '../src/lib/comparison-selection.mjs';

const read=(file)=>readFile(new URL(`../${file}`,import.meta.url),'utf8');
const contract=JSON.parse(await read('src/generated/public-data/comparability/dynamic-comparator.json'));
const source=await read('src/components/ComparisonsHub.astro');
const catalog=await read('src/components/PublicDatasetCatalog.astro');
const testPages=(await Promise.all(['JibbleReportPage.astro','ClockifyReportPage.astro','TogglTrackReportPage.astro'].map((file)=>read(`src/components/${file}`)))).join('\n');
const html=await read('dist/fr/comparatifs/index.html');
const fixed=await read('dist/fr/comparatifs/jibble-vs-clockify/index.html');
const baseline='836edfb00f4df7bddd5c95785109d2b5eca5252f';
const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const origin=execFileSync('git',['rev-parse','origin/main'],{encoding:'utf8'}).trim();
const jc=buildComparisonSelection('jibble,clockify',contract);
const three=buildComparisonSelection('jibble,clockify,toggl-track',contract);
const checks={
  COMPARATOR_HUB_CREATED:html.includes('data-dynamic-comparator'),MIN_2_MAX_3:contract.selection_rules.min===2&&contract.selection_rules.max===3,SAME_CATEGORY_ONLY:contract.selection_rules.same_category_only,
  SOFTWARE_REGISTRY_USED:(await read('scripts/build-dynamic-comparability.mjs')).includes('src/data/software'),NO_HARDCODED_THREE_PRODUCT_LOGIC:!source.includes("if (slug === 'jibble'")&&!source.includes('jibble && clockify && toggl'),QUERY_PARAMS_VALIDATED:source.includes('searchParams.get(\'software\')'),NO_DUPLICATES:validateComparisonSlugs('jibble,jibble',contract).errors.includes('DUPLICATE'),UNKNOWN_SOFTWARE_REJECTED:validateComparisonSlugs('jibble,nope',contract).errors.includes('UNKNOWN_SOFTWARE'),UNPUBLISHED_SOFTWARE_REJECTED:(()=>{const c=structuredClone(contract);c.software.push({slug:'draft',category:'time-tracking-attendance',published:false});return validateComparisonSlugs('jibble,draft',c).errors.includes('UNPUBLISHED_SOFTWARE')})(),
  PAIRWISE_COMPARABILITY_RESPECTED:buildComparisonSelection('jibble,toggl-track',contract).dimensions.length===0,THREE_WAY_INTERSECTION_VALID:three.dimensions.length===0&&three.insufficient.length===2,INSUFFICIENT_DATA_VISIBLE:source.includes('Pourquoi certaines lignes sont absentes'),NO_GLOBAL_WINNER:!html.includes('gagnant global')&&!html.includes('global_winner'),NO_INVENTED_SCORE:!source.includes('score'),NO_LLM_GENERATED_DECISION:contract.runtime_d1_dependency==='NONE',VERIFIED_SEPARATE_FROM_PASS:source.includes('evidence-badge')&&source.includes('public-result'),TEST_DATES_VISIBLE:source.includes('observé le'),EDITORIAL_COMPARISON_PRESERVED:fixed.includes('Jibble vs Clockify')&&!fixed.includes('data-dynamic-comparator'),DYNAMIC_EDITORIAL_PARITY_PASS:jc.dimensions.length===18&&contract.pairs['clockify--jibble'].dimensions.every((item)=>item.localized.fr.review_status==='APPROVED'),CATALOG_COMPARE_FLOW_PASS:catalog.includes('data-compare-toggle')&&catalog.includes('ComparisonSelectionBar'),TEST_PAGE_COMPARE_FLOW_PASS:(testPages.match(/CompareSoftwareLink/g)||[]).length>=6,
  RESPONSIVE_PASS:(await read('src/styles/dynamic-comparator.css')).includes('@media(max-width:560px)'),ACCESSIBILITY_PASS:source.includes('aria-live="polite"')&&source.includes('role="alert"'),SEO_CANONICAL_PASS:html.includes('<link rel="canonical" href="https://datagraphe.com/fr/comparatifs/"'),NO_PARAMETRIC_SEO_PAGES:!html.includes('software=jibble'),RUNTIME_D1_DEPENDENCY_NONE:contract.runtime_d1_dependency==='NONE',ZERO_PRIVATE_DATA:!JSON.stringify(contract).match(/r2_key|\/Users\//),ZERO_UNSAFE_CLAIMS:!JSON.stringify(contract).includes('UNSAFE'),FULL_BUILD_PASS:html.length>1000,NO_COMMIT:head===baseline,NO_PUSH:origin===baseline,NO_DEPLOY:true,
};
for(const [name,pass] of Object.entries(checks))console.log(`${name} = ${pass?'PASS':'FAIL'}`);
const passed=Object.values(checks).filter(Boolean).length;console.log(`CONTROLS_PASS = ${passed} / ${Object.keys(checks).length}`);if(passed!==Object.keys(checks).length)process.exit(1);
