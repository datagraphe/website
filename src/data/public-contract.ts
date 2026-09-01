import jibble from '@/generated/public-data/software/jibble.json';
import clockify from '@/generated/public-data/software/clockify.json';
import togglTrack from '@/generated/public-data/software/toggl-track.json';
import jibbleClockify from '@/generated/public-data/comparisons/jibble-vs-clockify.json';
import manifest from '@/generated/public-data/PUBLIC_BUILD_MANIFEST.json';

export const dataSource = import.meta.env.DATA_SOURCE ?? 'legacy';
if (!['legacy','public-dataset'].includes(dataSource)) throw new Error(`Unsupported DATA_SOURCE: ${dataSource}`);
export const usingPublicDataset = dataSource === 'public-dataset';

const datasets = { jibble, clockify, 'toggl-track': togglTrack } as const;
if (usingPublicDataset) {
  for (const [slug,data] of Object.entries(datasets)) {
    if (data.public_schema_version !== '1.1') throw new Error(`${slug}: PUBLIC_DATA_SCHEMA 1.1 required`);
    if (data.active_locales.join(',') !== 'fr') throw new Error(`${slug}: only approved FR localization is allowed`);
  }
  if (jibbleClockify.public_schema_version !== '1.1' || jibbleClockify.dimensions.length !== 18) throw new Error('Comparison contract 1.1 with 18 decisions required');
  if (manifest.public_data_schema !== '1.1') throw new Error('PUBLIC_BUILD_MANIFEST schema mismatch');
}

export const publicSoftware = datasets;
export const publicComparison = jibbleClockify;
export const publicBuildManifest = manifest;
