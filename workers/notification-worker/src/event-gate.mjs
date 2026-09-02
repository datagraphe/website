import { ALLOWED_CHANGE_SUBTYPES, EXCLUDED_EVENT_TYPES, NOTIFICATION_TYPES, PUBLIC_STATUSES, VERIFIED_STATUSES } from './constants.mjs';

const safePublicUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'datagraphe.com';
  } catch { return false; }
};

export function notificationEligibility(event) {
  if (!event || typeof event !== 'object') return { eligible: false, reason: 'EVENT_MISSING' };
  if (!event.event_id || !event.event_version) return { eligible: false, reason: 'EVENT_ID_OR_VERSION_MISSING' };
  if (!VERIFIED_STATUSES.has(event.verification_status)) return { eligible: false, reason: 'EVENT_NOT_VERIFIED' };
  if (!PUBLIC_STATUSES.has(event.public_status)) return { eligible: false, reason: 'EVENT_NOT_PUBLIC' };
  if (!Object.values(NOTIFICATION_TYPES).includes(event.event_type)) return { eligible: false, reason: 'EVENT_TYPE_NOT_ALLOWED' };
  if (EXCLUDED_EVENT_TYPES.has(event.classification) || EXCLUDED_EVENT_TYPES.has(event.change_subtype)) {
    return { eligible: false, reason: 'DATAGRAPHE_COVERAGE_ONLY' };
  }
  if (!event.software_slug || !event.software_name) return { eligible: false, reason: 'SOFTWARE_INVALID' };
  if ((event.locale ?? 'fr') !== 'fr') return { eligible: false, reason: 'LOCALE_NOT_ENABLED' };
  if (!safePublicUrl(event.public_url)) return { eligible: false, reason: 'PUBLIC_URL_INVALID' };
  if (event.event_type === NOTIFICATION_TYPES.VERIFIED_CHANGE && !ALLOWED_CHANGE_SUBTYPES.has(event.change_subtype)) {
    return { eligible: false, reason: 'CHANGE_SUBTYPE_NOT_ALLOWED' };
  }
  if (!event.summary || typeof event.summary !== 'string') return { eligible: false, reason: 'VALIDATED_SUMMARY_MISSING' };
  return { eligible: true, reason: 'ELIGIBLE' };
}

export const isNotificationEligibleEvent = (event) => notificationEligibility(event).eligible;
