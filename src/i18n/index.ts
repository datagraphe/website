import { fr } from './fr';
import { en } from './en';
import { de } from './de';
import { it } from './it';
import { es } from './es';
import type { Locale } from './config';
import type { LocaleContent } from './types';

export const translations: Record<Locale, LocaleContent> = { fr, en, de, it, es };
export const t = (locale: Locale): LocaleContent => translations[locale];
