import { createNotificationApp } from './app.mjs';
import { MockEmailProvider, ResendEmailProvider } from './email-provider.mjs';
import { NotificationEngine } from './engine.mjs';
import { D1NotificationRepository } from './repository.mjs';

const runtime = (env) => {
  if (!['sandbox', 'test-recipient-only', 'live-users'].includes(env.NOTIFICATION_MODE)) throw new Error('NOTIFICATION_MODE_INVALID');
  const repository = new D1NotificationRepository(env.USER_DB);
  const sandbox = env.NOTIFICATION_MODE === 'sandbox';
  const provider = sandbox ? new MockEmailProvider() : new ResendEmailProvider({ apiKey: env.RESEND_API_KEY, webhookSecret: env.RESEND_WEBHOOK_SECRET });
  const recipientResolver = sandbox
    ? async () => ({ email: 'sandbox-recipient@invalid.example', current: true })
    : async (userId) => {
      const row = await env.USER_DB.prepare(`SELECT primary_email,status FROM app_users WHERE id=?`).bind(userId).first();
      return { email: row?.primary_email, current: row?.status === 'ACTIVE' };
    };
  const allowlist = env.NOTIFICATION_MODE === 'test-recipient-only' ? String(env.TEST_EMAIL_ALLOWLIST ?? '').split(',').map((value) => value.trim().toLowerCase()).filter(Boolean) : [];
  if (env.NOTIFICATION_MODE === 'test-recipient-only' && allowlist.length === 0) throw new Error('TEST_EMAIL_ALLOWLIST_REQUIRED');
  const config = { mode: env.NOTIFICATION_MODE, allowedRecipientEmails: allowlist, from: env.EMAIL_FROM, replyTo: env.EMAIL_REPLY_TO, maxAttempts: Number(env.MAX_ATTEMPTS ?? 4), maxEmailsPerUserPerDay: Number(env.MAX_EMAILS_PER_USER_PER_DAY ?? 5), aggregationWindowMinutes: Number(env.AGGREGATION_WINDOW_MINUTES ?? 60) };
  return { app: createNotificationApp({ repository, provider, recipientResolver, config }), engine: new NotificationEngine({ repository, provider, recipientResolver, config }) };
};

export default {
  fetch(request, env) { return runtime(env).app(request, env); },
  async scheduled(_controller, env) { await runtime(env).engine.processReady(); }
};
