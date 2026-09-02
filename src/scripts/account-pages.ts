import targets from '@/data/follow-targets.json';
import { authenticatedFetch, getClerk } from './clerk-client';

const targetMap = new Map(targets.map((target) => [`${target.type}:${target.key}`, target]));
const escape = (value: unknown) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]!);
const followGroups = [
  { type: 'SOFTWARE', title: 'Logiciels', empty: 'Vous ne suivez encore aucun logiciel.' },
  { type: 'CATEGORY', title: 'Catégories', empty: 'Vous ne suivez encore aucune catégorie.' },
  { type: 'COMPARISON', title: 'Comparatifs', empty: 'Vous ne suivez encore aucun comparatif.' },
  { type: 'DATAGRAPHE', title: 'Datagraphe', empty: 'Vous ne suivez pas encore l’actualité Datagraphe.' }
] as const;

async function loadJson(path: string, init?: RequestInit) {
  const response = await authenticatedFetch(path, init);
  if (!response.ok) throw new Error((await response.json()).error ?? 'API_ERROR');
  return response.json();
}

export async function initAccountPage() {
  const root = document.querySelector<HTMLElement>('[data-account-page]');
  if (!root) return;
  const signedOut = root.querySelector<HTMLElement>('[data-account-signed-out]');
  const loading = root.querySelector<HTMLElement>('[data-account-loading]');
  const content = root.querySelector<HTMLElement>('[data-account-content]');
  const globalFollow = root.querySelector<HTMLElement>('[data-global-follow]');
  try {
    const clerk = await getClerk();
    if (!clerk?.user) { loading?.setAttribute('hidden', ''); signedOut?.removeAttribute('hidden'); return; }
    const mode = root.dataset.accountPage;
    const me = (await loadJson('/api/user/me/')).user;
    if (!content) return;
    if (mode === 'overview') {
      content.innerHTML = `<div class="account-summary"><div><span>Adresse email</span><strong>${escape(me.primary_email || clerk.user.primaryEmailAddress?.emailAddress || 'Non disponible')}</strong></div><div><span>Langue</span><strong>${escape(me.locale || 'fr')}</strong></div><div><span>Logiciels suivis</span><strong>${Number(me.counts?.SOFTWARE || 0)}</strong></div><div><span>Catégories suivies</span><strong>${Number(me.counts?.CATEGORY || 0)}</strong></div><div><span>Comparatifs suivis</span><strong>${Number(me.counts?.COMPARISON || 0)}</strong></div></div><div class="account-actions"><button class="button secondary" type="button" data-manage-identity>Gérer mon identité</button><button class="button secondary" type="button" data-sign-out>Se déconnecter</button></div><form class="account-delete" data-delete-request><h2>Supprimer mon espace Datagraphe</h2><p>Cette demande suspend vos suivis. Elle ne supprime jamais les observations produit.</p><label for="delete-confirmation">Pour confirmer, saisissez <strong>SUPPRIMER MON COMPTE DATAGRAPHE</strong></label><input id="delete-confirmation" name="confirmation" autocomplete="off" required/><button class="button secondary" type="submit">Demander la suppression</button><p role="status" data-delete-status></p></form>`;
      content.querySelector<HTMLButtonElement>('[data-manage-identity]')?.addEventListener('click', () => clerk.openUserProfile());
      content.querySelector<HTMLButtonElement>('[data-sign-out]')?.addEventListener('click', () => clerk.signOut({ redirectUrl: '/fr/' }));
      const deleteForm = content.querySelector<HTMLFormElement>('[data-delete-request]');
      deleteForm?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const confirmation = new FormData(deleteForm).get('confirmation');
        const status = deleteForm.querySelector<HTMLElement>('[data-delete-status]');
        try {
          await loadJson('/api/user/account/delete-request/', { method: 'POST', body: JSON.stringify({ confirmation }) });
          if (status) status.textContent = 'Demande enregistrée. Vos suivis sont suspendus.';
        } catch (error) {
          if (status) status.textContent = String(error).includes('CONFIRMATION_REQUIRED') ? 'La phrase de confirmation est incorrecte.' : 'Impossible d’enregistrer la demande.';
        }
      });
    } else if (mode === 'follows') {
      const subscriptions = (await loadJson('/api/user/subscriptions/')).subscriptions;
      content.innerHTML = `${subscriptions.length ? '' : '<div class="account-empty account-empty-summary"><h2>Aucun suivi pour le moment</h2><p>Choisissez les logiciels, catégories ou comparatifs que vous souhaitez retrouver ici.</p><a class="button primary" href="/fr/tests/">Explorer les logiciels</a></div>'}<div class="follow-groups">${followGroups.map((group) => {
        const items = subscriptions.filter((item: any) => item.subscription_type === group.type);
        return `<section class="follow-group" data-follow-group="${group.type}"><div class="follow-group-head"><h2>${group.title}</h2><span>${items.length} suivi${items.length > 1 ? 's' : ''}</span></div><div class="follow-list">${items.map((item: any) => {
          const target = targetMap.get(`${item.subscription_type}:${item.target_key}`);
          const statusLabel = item.status === 'ACTIVE' ? 'Actif' : item.status === 'PAUSED' ? 'Suspendu' : 'Inactif';
          return `<article><div><span class="follow-status" data-follow-status="${escape(item.status)}">${statusLabel}</span><h3>${escape(target?.label || 'Suivi indisponible')}</h3><p>Ajouté le ${escape(new Date(item.created_at).toLocaleDateString('fr-FR'))}</p></div><button class="button secondary" data-unfollow-id="${escape(item.id)}" type="button">Retirer</button></article>`;
        }).join('')}</div><p class="follow-group-empty" ${items.length ? 'hidden' : ''}>${group.empty}</p></section>`;
      }).join('')}</div>`;
      content.querySelectorAll<HTMLButtonElement>('[data-unfollow-id]').forEach((button) => button.addEventListener('click', async () => {
        button.disabled = true;
        try {
          await loadJson(`/api/user/subscriptions/${encodeURIComponent(button.dataset.unfollowId!)}/`, { method: 'DELETE' });
          const group = button.closest<HTMLElement>('[data-follow-group]');
          button.closest('article')?.remove();
          const remaining = group?.querySelectorAll('.follow-list article').length ?? 0;
          const count = group?.querySelector<HTMLElement>('.follow-group-head span');
          const empty = group?.querySelector<HTMLElement>('.follow-group-empty');
          if (count) count.textContent = `${remaining} suivi${remaining > 1 ? 's' : ''}`;
          if (!remaining) empty?.removeAttribute('hidden');
        }
        catch { button.disabled = false; button.textContent = 'Réessayer'; }
      }));
    } else if (mode === 'preferences') {
      const preferences = me.preferences;
      content.innerHTML = `<form class="preferences-form" data-preferences-form><p class="account-notice">Choisissez les sujets pour lesquels vous souhaitez être notifié. L’envoi des alertes sera activé prochainement.</p>${[
        ['email_enabled','Emails activés'],['new_tests','Nouveaux tests'],['verified_changes','Changements vérifiés'],['new_comparisons','Nouveaux comparatifs'],['datagraphe_news','Actualité Datagraphe']
      ].map(([key, label]) => `<label><span>${label}</span><input type="checkbox" name="${key}" ${Number(preferences[key]) ? 'checked' : ''}/></label>`).join('')}<button class="button primary" type="submit">Enregistrer</button><p role="status" data-preferences-status></p></form>`;
      const form = content.querySelector<HTMLFormElement>('[data-preferences-form]');
      form?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const status = form.querySelector<HTMLElement>('[data-preferences-status]');
        const payload = Object.fromEntries([...form.querySelectorAll<HTMLInputElement>('input[type=checkbox]')].map((input) => [input.name, input.checked]));
        try { await loadJson('/api/user/preferences/', { method: 'PATCH', body: JSON.stringify(payload) }); if (status) status.textContent = 'Préférences enregistrées.'; }
        catch { if (status) status.textContent = 'Impossible d’enregistrer. Réessayez.'; }
      });
    }
    loading?.setAttribute('hidden', '');
    content.removeAttribute('hidden');
    globalFollow?.removeAttribute('hidden');
  } catch {
    if (loading) loading.textContent = 'Impossible de charger cet espace. Vérifiez la configuration locale de l’API.';
  }
}
