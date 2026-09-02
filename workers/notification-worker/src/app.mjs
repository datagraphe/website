import { NotificationEngine } from './engine.mjs';
import { consumeUnsubscribeToken } from './tokens.mjs';

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const html = (body, status = 200) => new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'", 'x-content-type-options': 'nosniff' } });
const internalAuthorized = (request, env) => Boolean(env.INTERNAL_API_TOKEN) && request.headers.get('authorization') === `Bearer ${env.INTERNAL_API_TOKEN}`;
const escapeAttribute = (value) => String(value).replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

export function createNotificationApp({ repository, provider, recipientResolver, config }) {
  const engine = new NotificationEngine({ repository, provider, recipientResolver, config });
  return async (request, env = {}) => {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api\/notifications/, '').replace(/\/+$/, '') || '/';
    if (request.method === 'GET' && path === '/health') return json({ status: 'ok', mode: config.mode, emailProvider: provider.name });
    if (request.method === 'GET' && path === '/unsubscribe') {
      const token = url.searchParams.get('token') ?? '';
      if (!/^[A-Za-z0-9_-]{40,200}$/.test(token)) return html('<!doctype html><html lang="fr"><meta charset="utf-8"><title>Lien invalide — Datagraphe</title><main><h1>Lien invalide</h1><p>Ce lien de désabonnement est invalide ou incomplet.</p></main></html>', 400);
      return html(`<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Confirmer le désabonnement — Datagraphe</title><style>body{font-family:system-ui,sans-serif;color:#07152d;background:#f6f8fc;margin:0}main{max-width:38rem;margin:12vh auto;padding:2rem;background:#fff;border:1px solid #dbe2ec;border-radius:1rem}button{background:#ff6b00;color:#fff;border:0;border-radius:.65rem;padding:.85rem 1.1rem;font-weight:700;cursor:pointer}</style><main><h1>Ne plus suivre ce logiciel ?</h1><p>Confirmez pour arrêter uniquement ce suivi. Vos autres suivis restent inchangés.</p><form method="post" action="/api/notifications/unsubscribe/"><input type="hidden" name="token" value="${escapeAttribute(token)}"><button type="submit">Confirmer le désabonnement</button></form></main></html>`);
    }
    if (request.method === 'POST' && path === '/unsubscribe') {
      const contentType = request.headers.get('content-type') ?? '';
      const body = contentType.includes('application/json') ? await request.json().catch(() => ({})) : Object.fromEntries(await request.formData().catch(() => new FormData()));
      const result = await consumeUnsubscribeToken(repository, body.token);
      if (contentType.includes('application/json')) return json(result, result.ok ? 200 : 400);
      return html(`<!doctype html><html lang="fr"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${result.ok ? 'Suivi désactivé' : 'Lien invalide'} — Datagraphe</title><main><h1>${result.ok ? 'Suivi désactivé' : 'Impossible de désactiver le suivi'}</h1><p>${result.ok ? 'Ce suivi a bien été désactivé. Vos autres suivis restent inchangés.' : 'Ce lien a expiré ou a déjà été utilisé.'}</p><p><a href="https://datagraphe.com/fr/mon-compte/suivis/">Gérer mes suivis</a></p></main></html>`, result.ok ? 200 : 400);
    }
    if (request.method === 'POST' && path === '/webhooks/email') {
      const rawBody = await request.text();
      const sandboxSignature = request.headers.get('x-sandbox-signature');
      if (!await provider.verifyWebhook({ signature: sandboxSignature, headers: request.headers, body: rawBody })) return json({ error: 'INVALID_WEBHOOK_SIGNATURE' }, 401);
      const body = JSON.parse(rawBody);
      const providerEventId = request.headers.get('svix-id') || body.event_id;
      const eventType = ({ 'email.delivered': 'DELIVERED', 'email.bounced': 'HARD_BOUNCE', 'email.complained': 'COMPLAINT', 'email.failed': 'FAILED' })[body.type] || body.type;
      const notificationId = body.notification_id || await repository.findNotificationIdByProviderMessageId(body.data?.email_id);
      if (!providerEventId || !notificationId) return json({ accepted: true, correlated: false }, 202);
      const recorded = await repository.recordDeliveryEvent({ notificationId, providerEventType: eventType, providerEventId, occurredAt: body.created_at || body.occurred_at || new Date().toISOString(), safeSummary: eventType });
      if (recorded.inserted && ['HARD_BOUNCE', 'COMPLAINT'].includes(eventType)) await repository.disableEmailForNotification(notificationId, eventType, providerEventId);
      return json({ accepted: true, duplicate: !recorded.inserted });
    }
    if (!internalAuthorized(request, env)) return json({ error: 'NOT_FOUND' }, 404);
    if (request.method === 'POST' && path === '/internal/events') return json(await engine.enqueueEvents(await request.json()));
    if (request.method === 'POST' && path === '/internal/process') return json(await engine.processReady());
    return json({ error: 'NOT_FOUND' }, 404);
  };
}
