import targets from '../../../src/data/follow-targets.json' with { type: 'json' };

const types = new Set(['DATAGRAPHE', 'SOFTWARE', 'CATEGORY', 'COMPARISON']);
const keys = new Set(targets.map((target) => `${target.type}:${target.key}`));

export function normalizeTarget(input) {
  const type = String(input?.subscription_type ?? '').toUpperCase();
  const key = String(input?.target_key ?? '').toLowerCase().trim();
  if (!types.has(type) || !/^[a-z0-9-]{1,80}$/.test(key) || !keys.has(`${type}:${key}`)) return null;
  return { subscription_type: type, target_key: key };
}

export function targetExists(type, key) {
  return keys.has(`${type}:${key}`);
}

export { targets };
