import type { Clerk } from '@clerk/clerk-js';
import { frFR } from '@clerk/localizations/fr-FR';
import { canonicalInternalNavigation, USER_ROUTES } from '@/lib/user-routes.mjs';

let clerkPromise: Promise<Clerk | null> | undefined;
type ClerkUI = NonNullable<NonNullable<Parameters<Clerk['load']>[0]>['ui']>['ClerkUI'];
let clerkUiPromise: Promise<ClerkUI> | undefined;

declare global {
  interface Window { __internal_ClerkUICtor?: ClerkUI }
}

export function getClerk() {
  if (!clerkPromise) clerkPromise = loadClerk();
  return clerkPromise;
}

async function loadClerk() {
  const publishableKey = import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) return null;
  const clerkUi = await loadClerkUi(publishableKey);
  const { Clerk } = await import('@clerk/clerk-js');
  const clerk = new Clerk(publishableKey);
  await clerk.load({
    ui: { ClerkUI: clerkUi },
    localization: frFR,
    signInUrl: USER_ROUTES.signIn,
    signUpUrl: USER_ROUTES.signUp,
    afterSignOutUrl: '/fr/',
    routerPush: (to, metadata) => navigateWithCanonicalSlash(to, false, metadata?.windowNavigate),
    routerReplace: (to, metadata) => navigateWithCanonicalSlash(to, true, metadata?.windowNavigate),
    appearance: {
      variables: { colorPrimary: '#f36f21', colorText: '#071326', borderRadius: '0.85rem' }
    }
  });
  return clerk;
}

function navigateWithCanonicalSlash(to: string, replace: boolean, windowNavigate?: (to: URL | string) => void) {
  const destination = new URL(to, location.origin);
  if (destination.origin !== location.origin) {
    if (windowNavigate) windowNavigate(destination);
    else location.assign(destination.href);
    return;
  }
  const canonical = canonicalInternalNavigation(`${destination.pathname}${destination.search}${destination.hash}`);
  if (replace) location.replace(canonical);
  else location.assign(canonical);
}

function loadClerkUi(publishableKey: string): Promise<ClerkUI> {
  if (clerkUiPromise) return clerkUiPromise;
  clerkUiPromise = new Promise((resolve, reject) => {
    if (window.__internal_ClerkUICtor) { resolve(window.__internal_ClerkUICtor); return; }
    try {
      const encodedDomain = publishableKey.split('_')[2];
      const clerkDomain = encodedDomain ? atob(encodedDomain).slice(0, -1) : '';
      if (!/^[a-z0-9.-]+$/i.test(clerkDomain)) throw new Error('INVALID_CLERK_FRONTEND_API');
      const script = document.createElement('script');
      script.src = `https://${clerkDomain}/npm/@clerk/ui@1/dist/ui.browser.js`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.addEventListener('load', () => window.__internal_ClerkUICtor ? resolve(window.__internal_ClerkUICtor) : reject(new Error('CLERK_UI_MISSING')));
      script.addEventListener('error', () => reject(new Error('CLERK_UI_LOAD_FAILED')));
      document.head.append(script);
    } catch (error) { reject(error); }
  });
  return clerkUiPromise;
}

export async function authenticatedFetch(path: string, init: RequestInit = {}) {
  const clerk = await getClerk();
  const token = await clerk?.session?.getToken();
  if (!token) throw new Error('UNAUTHENTICATED');
  return fetch(path, {
    ...init,
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', ...(init.headers ?? {}) },
    credentials: 'include'
  });
}
