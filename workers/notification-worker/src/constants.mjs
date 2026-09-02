export const NOTIFICATION_TYPES = Object.freeze({
  NEW_TEST: 'NEW_TEST_PUBLISHED',
  VERIFIED_CHANGE: 'VERIFIED_SOFTWARE_CHANGE'
});

export const ALLOWED_CHANGE_SUBTYPES = new Set([
  'FEATURE_CHANGED',
  'PLAN_GATING_CHANGED',
  'PRICE_CHANGED',
  'TEST_RESULT_CHANGED',
  'LANGUAGE_CHANGED'
]);

export const EXCLUDED_EVENT_TYPES = new Set([
  'OBSERVATION_SCOPE_EXPANDED',
  'DATAGRAPHE_COVERAGE_CHANGE'
]);

export const PUBLIC_STATUSES = new Set(['PUBLISHABLE', 'PUBLISHED']);
export const VERIFIED_STATUSES = new Set(['VERIFIED', 'CONFIRMED']);
export const TRANSIENT_PROVIDER_CODES = new Set([408, 429, 500, 502, 503, 504]);

export const DEFAULT_CONFIG = Object.freeze({
  mode: 'sandbox',
  locale: 'fr',
  maxAttempts: 4,
  maxEmailsPerUserPerDay: 5,
  aggregationWindowMinutes: 60,
  staleProcessingMinutes: 15,
  unsubscribeTtlDays: 30,
  siteOrigin: 'https://datagraphe.com',
  from: 'Datagraphe <notifications@mail.datagraphe.com>',
  replyTo: 'contact@datagraphe.com',
  allowedRecipientEmails: []
});
