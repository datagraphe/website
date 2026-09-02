import { NOTIFICATION_TYPES } from './constants.mjs';

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
const publicLink = (value) => {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.hostname !== 'datagraphe.com') throw new Error('EMAIL_LINK_NOT_PUBLIC');
  return url.toString();
};

const shell = ({ heading, intro, bodyHtml, bodyText, ctaLabel, ctaUrl, manageUrl, unsubscribeUrl }) => {
  const safeCta = publicLink(ctaUrl);
  const safeManage = publicLink(manageUrl);
  const safeUnsubscribe = publicLink(unsubscribeUrl);
  const text = `${intro}\n\n${bodyText}\n\n${ctaLabel}: ${safeCta}\n\nGérer mes suivis: ${safeManage}\nNe plus suivre ce logiciel: ${safeUnsubscribe}\n\nDatagraphe`;
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(heading)}</title></head><body style="margin:0;background:#f4f7fb;color:#07142d;font-family:Arial,sans-serif"><main style="max-width:640px;margin:auto;background:#fff;padding:32px"><p style="color:#f36a16;font-weight:700">DATAGRAPHE</p><h1 style="font-size:28px;line-height:1.2">${escapeHtml(heading)}</h1><p>${escapeHtml(intro)}</p>${bodyHtml}<p><a href="${escapeHtml(safeCta)}" style="display:inline-block;background:#f36a16;color:#fff;padding:12px 18px;border-radius:10px;text-decoration:none;font-weight:700">${escapeHtml(ctaLabel)}</a></p><hr style="border:0;border-top:1px solid #dce3ed;margin:28px 0"><p style="font-size:14px"><a href="${escapeHtml(safeManage)}">Gérer mes suivis</a><br><a href="${escapeHtml(safeUnsubscribe)}">Ne plus suivre ce logiciel</a></p><p style="font-size:13px;color:#5b6880">Vous recevez cet email à la suite d’un suivi explicitement activé sur Datagraphe. Aucun lien affilié n’est inclus.</p></main></body></html>`;
  return { html, text };
};

export function renderNotificationEmail({ queue, unsubscribeToken }) {
  const events = queue.payload.events;
  const first = events[0];
  const manageUrl = 'https://datagraphe.com/fr/mon-compte/suivis/';
  const unsubscribeUrl = `https://datagraphe.com/api/notifications/unsubscribe/?token=${encodeURIComponent(unsubscribeToken)}`;
  if (queue.notificationType === NOTIFICATION_TYPES.NEW_TEST) {
    const metrics = first.public_metrics;
    const metricsText = metrics ? `${metrics.total_features} fonctionnalités recensées — ${metrics.coverage_rate} % de couverture.` : 'Le dossier public contient les résultats et limites vérifiés.';
    return {
      subject: `Nouveau test Datagraphe : ${first.software_name}`,
      templateKey: 'new_test_fr_v1',
      templateVersion: 1,
      ...shell({ heading: `Nouveau test : ${first.software_name}`, intro: 'Un nouveau test est disponible sur Datagraphe.', bodyHtml: `<p>${escapeHtml(metricsText)}</p>`, bodyText: metricsText, ctaLabel: 'Voir le test', ctaUrl: first.public_url, manageUrl, unsubscribeUrl })
    };
  }
  const count = events.length;
  const heading = count > 1 ? `${count} changements vérifiés sur ${first.software_name}` : `${first.software_name} a changé`;
  const details = events.map((event) => `<li>${escapeHtml(event.summary)} — vérifié le ${escapeHtml(event.verified_at)}</li>`).join('');
  const detailText = events.map((event) => `- ${event.summary} — vérifié le ${event.verified_at}`).join('\n');
  return {
    subject: count > 1 ? `${count} changements vérifiés sur ${first.software_name} — Datagraphe` : `${first.software_name} a changé — changement vérifié par Datagraphe`,
    templateKey: 'verified_change_fr_v1',
    templateVersion: 1,
    ...shell({ heading, intro: `Vous suivez ${first.software_name} sur Datagraphe.`, bodyHtml: `<p>Nous avons vérifié ${count > 1 ? 'les changements suivants' : 'un nouveau changement'} :</p><ul>${details}</ul>`, bodyText: `Nous avons vérifié ${count > 1 ? 'les changements suivants' : 'un nouveau changement'} :\n${detailText}`, ctaLabel: 'Voir le détail', ctaUrl: first.public_url, manageUrl, unsubscribeUrl })
  };
}
