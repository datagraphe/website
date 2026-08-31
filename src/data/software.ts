import type { Locale } from '@/i18n/config';

export type CatalogStatus = 'TESTED' | 'PARTIAL' | 'UPDATING';

export interface SoftwareTest {
  id: string;
  slug: string;
  name: string;
  category: string;
  tags: string[];
  tested: boolean;
  catalog_status: CatalogStatus;
  test_date: string | null;
  updated_date: string | null;
  score: number | null;
  test_url: string;
  summary: Record<Locale, string>;
  status: string;
  features: Array<{claim_id:string;key:string;status:string;evidence:unknown[]}>;
  advantages: unknown[];
  limitations: unknown[];
  pricing: unknown;
  affiliate_url: string | null;
  alternatives: string[];
  available_locales?: Locale[];
}

const modules = import.meta.glob<SoftwareTest>('./software/*.json', { eager: true, import: 'default' });

export const testedSoftware = Object.values(modules)
  .filter((software) => software.tested)
  .sort((a, b) => a.name.localeCompare(b.name));

export function testedSoftwareForLocale(locale: Locale) {
  return testedSoftware.filter((software) => !software.available_locales || software.available_locales.includes(locale));
}

export function softwareTestPath(software: SoftwareTest) {
  return software.test_url.replace(/^\/+|\/+$/g, '');
}
