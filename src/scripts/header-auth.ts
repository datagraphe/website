import { getClerk } from './clerk-client';

export async function initHeaderAuth() {
  const root = document.querySelector<HTMLElement>('[data-account-nav]');
  if (!root) return;
  try {
    const clerk = await getClerk();
    root.dataset.authReady = 'true';
    const signedOut = root.querySelector<HTMLElement>('[data-auth-signed-out]');
    const signedIn = root.querySelector<HTMLElement>('[data-auth-signed-in]');
    if (clerk?.user) {
      signedOut?.setAttribute('hidden', '');
      signedIn?.removeAttribute('hidden');
      const button = root.querySelector<HTMLDivElement>('[data-clerk-user-button]');
      if (button) clerk.mountUserButton(button);
    } else {
      signedIn?.setAttribute('hidden', '');
      signedOut?.removeAttribute('hidden');
    }
  } catch {
    root.dataset.authError = 'true';
    root.querySelector<HTMLElement>('[data-auth-signed-out]')?.removeAttribute('hidden');
  }
}
