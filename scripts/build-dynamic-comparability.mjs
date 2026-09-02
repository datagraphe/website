import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const registryDir = path.join(root, 'src/data/software');
const publicSoftwareDir = path.join(root, 'src/generated/public-data/software');
const comparisonDir = path.join(root, 'src/generated/public-data/comparisons');
const outputPath = path.join(root, 'src/generated/public-data/comparability/dynamic-comparator.json');
const readJson = async (file) => JSON.parse(await readFile(file, 'utf8'));
const pairKey = (a, b) => [a, b].sort().join('--');

const registryFiles = (await readdir(registryDir)).filter((file) => file.endsWith('.json')).sort();
const registry = (await Promise.all(registryFiles.map((file) => readJson(path.join(registryDir, file)))))
  .filter((software) => software.tested && software.catalog_status === 'TESTED')
  .sort((a, b) => a.slug.localeCompare(b.slug));

const publicSoftware = Object.fromEntries(await Promise.all(registry.map(async (software) => [
  software.slug,
  await readJson(path.join(publicSoftwareDir, `${software.slug}.json`)),
])));

const comparisonFiles = (await readdir(comparisonDir)).filter((file) => file.endsWith('.json')).sort();
const comparisons = await Promise.all(comparisonFiles.map((file) => readJson(path.join(comparisonDir, file))));
const pairs = {};

for (const comparison of comparisons) {
  const a = comparison.software_a.slug;
  const b = comparison.software_b.slug;
  if (!publicSoftware[a] || !publicSoftware[b]) continue;
  pairs[pairKey(a, b)] = {
    software: [a, b].sort(),
    certification: 'PAIRWISE_CERTIFIED',
    last_verified_at: comparison.last_verified_at,
    publication_gate: comparison.publication_gate,
    editorial_path: `/fr/comparatifs/${comparison.comparison_id}/`,
    dimensions: comparison.dimensions.map((dimension) => ({
      canonical_feature_key: dimension.canonical_feature_key,
      family: null,
      certification_status: dimension.certification_status,
      decision: dimension.decision,
      results: dimension.results,
      evidence_level: dimension.certification_status === 'CERTIFIED_COMPARABLE' ? 'VERIFIED' : 'QUALIFIED',
      localized: dimension.localized,
    })),
    buyer_contexts: comparison.buyer_contexts,
  };
}

for (let i = 0; i < registry.length; i += 1) {
  for (let j = i + 1; j < registry.length; j += 1) {
    const a = registry[i].slug;
    const b = registry[j].slug;
    const key = pairKey(a, b);
    if (pairs[key]) continue;
    const aKeys = new Set(publicSoftware[a].features.map((feature) => feature.canonical_feature_key).filter(Boolean));
    const shared = [...new Set(publicSoftware[b].features.map((feature) => feature.canonical_feature_key).filter((key) => key && aKeys.has(key)))].sort();
    pairs[key] = {
      software: [a, b].sort(),
      certification: 'INSUFFICIENT_DATA',
      last_verified_at: null,
      publication_gate: 'NOT_PUBLISHABLE',
      editorial_path: null,
      dimensions: [],
      candidate_dimensions_without_pairwise_certification: shared,
      buyer_contexts: [],
    };
  }
}

const contract = {
  public_schema_version: '1.2',
  derived_from_public_schema: '1.1',
  locale: 'fr',
  runtime_d1_dependency: 'NONE',
  selection_rules: { min: 2, max: 3, same_category_only: true, pairwise_certification_required: true },
  software: registry.map((software) => ({
    slug: software.slug,
    name: software.name,
    category: software.category,
    published: software.tested && software.catalog_status === 'TESTED',
    test_path: `/fr/${software.test_url.replace(/^\/+|\/+$/g, '')}/`,
    observed_at: publicSoftware[software.slug].last_verified_at,
    coverage: publicSoftware[software.slug].test_summary.coverage_rate,
    public_status: publicSoftware[software.slug].software.publication_status,
    affiliate_url: software.affiliate_url,
  })),
  pairs,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(contract, null, 2)}\n`);
console.log(`Dynamic comparator contract: ${contract.software.length} software, ${Object.keys(pairs).length} pairs`);
