export const pairKey = (a, b) => [a, b].sort().join('--');

const familyRules = [
  ['exports', /^(export|data)\./],
  ['reports', /^(report|dashboard)\./],
  ['projects', /^(project|client|task)\./],
  ['team', /^(team|leave)\./],
  ['planning', /^schedule\./],
  ['time', /^(time_tracking|time_entry|timesheet|calendar|overtime)\./],
];

export const featureFamily = (key) => familyRules.find(([, pattern]) => pattern.test(key))?.[0] ?? 'others';

export function validateComparisonSlugs(raw, contract) {
  const requested = Array.isArray(raw) ? raw : String(raw ?? '').split(',');
  const slugs = requested.map((slug) => slug.trim()).filter(Boolean);
  const errors = [];
  if (slugs.length > contract.selection_rules.max) errors.push('MAX_THREE');
  if (new Set(slugs).size !== slugs.length) errors.push('DUPLICATE');
  const known = new Map(contract.software.map((software) => [software.slug, software]));
  if (slugs.some((slug) => !known.has(slug))) errors.push('UNKNOWN_SOFTWARE');
  if (slugs.some((slug) => known.has(slug) && !known.get(slug).published)) errors.push('UNPUBLISHED_SOFTWARE');
  const categories = new Set(slugs.map((slug) => known.get(slug)?.category).filter(Boolean));
  if (categories.size > 1) errors.push('DIFFERENT_CATEGORY');
  return { valid: errors.length === 0, slugs: errors.length ? [] : slugs, errors };
}

export function buildComparisonSelection(raw, contract) {
  const validation = validateComparisonSlugs(raw, contract);
  const slugs = validation.slugs;
  const selected = slugs.map((slug) => contract.software.find((software) => software.slug === slug));
  if (!validation.valid || slugs.length < contract.selection_rules.min) {
    return { ...validation, selected, active: false, dimensions: [], insufficient: [] };
  }
  const requiredPairs = [];
  for (let i = 0; i < slugs.length; i += 1) for (let j = i + 1; j < slugs.length; j += 1) requiredPairs.push(contract.pairs[pairKey(slugs[i], slugs[j])]);
  const certifiedPairs = requiredPairs.filter((pair) => pair?.certification === 'PAIRWISE_CERTIFIED');
  let dimensions = certifiedPairs[0]?.dimensions ?? [];
  if (slugs.length === 3) {
    dimensions = requiredPairs.every((pair) => pair?.certification === 'PAIRWISE_CERTIFIED')
      ? dimensions.filter((dimension) => requiredPairs.every((pair) => pair.dimensions.some((item) => item.canonical_feature_key === dimension.canonical_feature_key)))
      : [];
  }
  dimensions = dimensions.map((dimension) => ({ ...dimension, family: featureFamily(dimension.canonical_feature_key) }));
  const missingPairs = requiredPairs.filter((pair) => pair?.certification !== 'PAIRWISE_CERTIFIED');
  const insufficient = missingPairs.map((pair) => ({
    software: pair?.software ?? [],
    reason: 'Aucune certification comparative pair-à-pair n’est encore publiée.',
    candidate_count: pair?.candidate_dimensions_without_pairwise_certification?.length ?? 0,
  }));
  const dates = selected.map((software) => software.observed_at).filter(Boolean).sort();
  const spreadDays = dates.length > 1 ? Math.round((Date.parse(dates.at(-1)) - Date.parse(dates[0])) / 86400000) : 0;
  return {
    ...validation,
    selected,
    active: true,
    dimensions,
    insufficient,
    buyerContexts: slugs.length === 2 && certifiedPairs.length === 1 ? certifiedPairs[0].buyer_contexts : [],
    editorialPath: slugs.length === 2 && certifiedPairs.length === 1 ? certifiedPairs[0].editorial_path : null,
    dates,
    freshnessWarning: spreadDays >= 14,
    requiredPairs: requiredPairs.map((pair) => pair?.software ?? []),
  };
}
