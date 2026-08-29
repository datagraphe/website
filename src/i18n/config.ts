export const locales = ['fr', 'en', 'de', 'it', 'es'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fr';

export const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English',
  de: 'Deutsch',
  it: 'Italiano',
  es: 'Español',
};

export const localeTags: Record<Locale, string> = {
  fr: 'fr-FR',
  en: 'en',
  de: 'de-DE',
  it: 'it-IT',
  es: 'es-ES',
};

export const ogLocales: Record<Locale, string> = {
  fr: 'fr_FR',
  en: 'en_US',
  de: 'de_DE',
  it: 'it_IT',
  es: 'es_ES',
};

export function localizedPath(locale: Locale, route = '') {
  const clean = route.replace(/^\/+|\/+$/g, '');
  return `/${locale}/${clean ? `${clean}/` : ''}`;
}
