import { getClerk } from './clerk-client';
import { safeReturnTo, USER_ROUTES, withQuery } from '@/lib/user-routes.mjs';

function canonicalAuthDestination(rawHref: string, returnTo: string) {
  try {
    const url = new URL(rawHref, location.origin);
    if (url.origin !== location.origin) return null;
    const path = url.pathname.replace(/\/$/, '');
    if (path === USER_ROUTES.signIn.slice(0, -1)) return withQuery(USER_ROUTES.signIn, { returnTo });
    if (path === USER_ROUTES.signUp.slice(0, -1)) return withQuery(USER_ROUTES.signUp, { returnTo });
  } catch {
    return null;
  }
  return null;
}

function enforceCanonicalClerkLinks(mount: HTMLElement, returnTo: string) {
  const update = () => {
    for (const link of mount.querySelectorAll<HTMLAnchorElement>('a[href]')) {
      const destination = canonicalAuthDestination(link.href, returnTo);
      if (destination && link.getAttribute('href') !== destination) link.setAttribute('href', destination);
    }
  };

  mount.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href]');
    if (!link) return;
    const destination = canonicalAuthDestination(link.href, returnTo);
    if (!destination) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    location.assign(destination);
  }, true);

  new MutationObserver(update).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });
  queueMicrotask(update);
  window.setTimeout(update, 100);
  window.setTimeout(update, 1000);
}

export async function initAuthPage() {
  const root = document.querySelector<HTMLElement>('[data-auth-page]');
  if (!root) return;
  const mode = root.dataset.authPage;
  const returnTo = safeReturnTo(new URLSearchParams(location.search).get('returnTo'));
  const mount = root.querySelector<HTMLDivElement>('[data-clerk-auth-mount]');
  const status = root.querySelector<HTMLElement>('[data-auth-status]');
  const switchLink = root.querySelector<HTMLAnchorElement>('[data-auth-switch]');
  if (switchLink) switchLink.href = withQuery(mode === 'signup' ? USER_ROUTES.signIn : USER_ROUTES.signUp, { returnTo });
  try {
    const clerk = await getClerk();
    if (!clerk || !mount) {
      if (status) status.textContent = 'La configuration Clerk de développement doit être ajoutée localement pour activer ce formulaire.';
      return;
    }
    if (clerk.user) { location.replace(returnTo); return; }
    status?.setAttribute('hidden', '');
    const options = mode === 'signup'
      ? { signInUrl: withQuery(USER_ROUTES.signIn, { returnTo }), forceRedirectUrl: returnTo, appearance: { elements: { footerAction: { display: 'none' } } } }
      : { signUpUrl: withQuery(USER_ROUTES.signUp, { returnTo }), forceRedirectUrl: returnTo, appearance: { elements: { footerAction: { display: 'none' } } } };
    if (mode === 'signup') clerk.mountSignUp(mount, options);
    else clerk.mountSignIn(mount, options);
    enforceCanonicalClerkLinks(mount, returnTo);
  } catch (error) {
    console.error('Clerk authentication mount failed', error);
    if (status) {
      status.removeAttribute('hidden');
      status.textContent = 'Impossible de charger l’authentification. Réessayez plus tard.';
    }
  }
}
