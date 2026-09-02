export const USER_ROUTES = Object.freeze({
  signIn: '/fr/connexion/',
  signUp: '/fr/inscription/',
  account: '/fr/mon-compte/',
  follows: '/fr/mon-compte/suivis/',
  preferences: '/fr/mon-compte/preferences/'
});

const internalOrigin = 'https://datagraphe.internal';
const allowedReturnPath = /^\/fr\/(?:$|tests(?:\/|$)|comparatifs(?:\/|$)|mon-compte(?:\/|$))/;
const allowedNavigationPath = /^\/fr\/(?:$|connexion(?:\/|$)|inscription(?:\/|$)|tests(?:\/|$)|comparatifs(?:\/|$)|mon-compte(?:\/|$))/;

export function withQuery(route, parameters = {}) {
  if (typeof route !== 'string' || !route.startsWith('/') || route.startsWith('//') || !route.endsWith('/')) {
    throw new TypeError('A canonical internal route ending with / is required.');
  }
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(parameters)) {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
  }
  const suffix = query.toString();
  return suffix ? `${route}?${suffix}` : route;
}

export function safeReturnTo(value, fallback = USER_ROUTES.account) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;
  try {
    const parsed = new URL(value, internalOrigin);
    if (parsed.origin !== internalOrigin || !allowedReturnPath.test(parsed.pathname)) return fallback;
    const pathname = parsed.pathname.endsWith('/') ? parsed.pathname : `${parsed.pathname}/`;
    return `${pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}

export function canonicalInternalNavigation(value, fallback = USER_ROUTES.account) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;
  try {
    const parsed = new URL(value, internalOrigin);
    if (parsed.origin !== internalOrigin || !allowedNavigationPath.test(parsed.pathname)) return fallback;
    const pathname = parsed.pathname.endsWith('/') ? parsed.pathname : `${parsed.pathname}/`;
    return `${pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
