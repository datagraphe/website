import { authenticatedFetch, getClerk } from './clerk-client';
import { safeReturnTo, USER_ROUTES, withQuery } from '@/lib/user-routes.mjs';

const pendingKey = 'datagraphe_follow_intent_v1';
const allowedTypes = new Set(['DATAGRAPHE', 'SOFTWARE', 'CATEGORY', 'COMPARISON']);
const validIntent = (value: any) => value && allowedTypes.has(value.subscription_type) && /^[a-z0-9-]{1,80}$/.test(value.target_key);

async function follow(intent: { subscription_type: string; target_key: string }) {
  const response = await authenticatedFetch('/api/user/subscriptions/', { method: 'POST', body: JSON.stringify(intent) });
  if (!response.ok) throw new Error((await response.json()).error ?? 'FOLLOW_FAILED');
  return response.json();
}

async function listSubscriptions() {
  const response = await authenticatedFetch('/api/user/subscriptions/');
  if (!response.ok) throw new Error((await response.json()).error ?? 'LIST_FOLLOWS_FAILED');
  return (await response.json()).subscriptions as Array<{ id: string; subscription_type: string; target_key: string; status: string }>;
}

function setFollowed(button: HTMLButtonElement, subscriptionId: string) {
  button.dataset.state = 'followed';
  button.dataset.subscriptionId = subscriptionId;
  button.textContent = button.dataset.unfollowLabel ?? 'Ne plus suivre';
  button.setAttribute('aria-pressed', 'true');
  button.disabled = false;
}

function setNotFollowed(button: HTMLButtonElement) {
  button.dataset.state = 'idle';
  delete button.dataset.subscriptionId;
  button.textContent = button.dataset.followLabel ?? 'Suivre';
  button.setAttribute('aria-pressed', 'false');
  button.disabled = false;
}

export async function initFollowButtons() {
  const buttons = [...document.querySelectorAll<HTMLButtonElement>('[data-follow-button]')];
  if (!buttons.length) return;
  const clerk = await getClerk().catch(() => null);
  let subscriptions: Awaited<ReturnType<typeof listSubscriptions>> = [];
  if (clerk?.user) subscriptions = await listSubscriptions().catch(() => []);
  for (const button of buttons) {
    if (button.dataset.followInitialized === 'true') continue;
    button.dataset.followInitialized = 'true';
    const existing = subscriptions.find((item) => item.status === 'ACTIVE' && item.subscription_type === button.dataset.followType && item.target_key === button.dataset.followKey);
    if (existing) setFollowed(button, existing.id);
    else setNotFollowed(button);
    button.addEventListener('click', async () => {
      const intent = { subscription_type: button.dataset.followType ?? '', target_key: button.dataset.followKey ?? '' };
      if (!validIntent(intent)) return;
      if (!clerk?.user) {
        sessionStorage.setItem(pendingKey, JSON.stringify(intent));
        const returnTo = safeReturnTo(`${location.pathname}${location.search}`);
        location.assign(withQuery(USER_ROUTES.signIn, { returnTo }));
        return;
      }
      button.disabled = true;
      button.dataset.state = 'loading';
      const subscriptionId = button.dataset.subscriptionId;
      button.textContent = subscriptionId ? 'Retrait en cours…' : 'Ajout en cours…';
      try {
        if (subscriptionId) {
          const response = await authenticatedFetch(`/api/user/subscriptions/${encodeURIComponent(subscriptionId)}/`, { method: 'DELETE' });
          if (!response.ok) throw new Error((await response.json()).error ?? 'UNFOLLOW_FAILED');
          setNotFollowed(button);
        } else {
          const result = await follow(intent);
          setFollowed(button, result.subscription.id);
        }
      } catch {
        button.dataset.state = 'error';
        button.textContent = 'Réessayer';
        button.disabled = false;
      }
    });
  }
  if (clerk?.user) {
    try {
      const stored = sessionStorage.getItem(pendingKey);
      const intent = stored ? JSON.parse(stored) : null;
      if (validIntent(intent)) {
        const result = await follow(intent);
        sessionStorage.removeItem(pendingKey);
        const matching = buttons.find((button) => button.dataset.followType === intent.subscription_type && button.dataset.followKey === intent.target_key);
        if (matching) setFollowed(matching, result.subscription.id);
      }
    } catch { /* Keep the validated intent for a later retry. */ }
  }
}
