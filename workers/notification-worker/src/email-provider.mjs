export class ProviderError extends Error {
  constructor(message, { status = 500, permanent = false, code = 'PROVIDER_ERROR' } = {}) {
    super(message);
    this.name = 'ProviderError';
    this.status = status;
    this.permanent = permanent;
    this.code = code;
  }
}

export class MockEmailProvider {
  constructor(outcomes = []) {
    this.name = 'mock-sandbox';
    this.outcomes = [...outcomes];
    this.messages = [];
  }

  async sendTransactionalEmail(message) {
    const outcome = this.outcomes.shift();
    if (outcome instanceof Error) throw outcome;
    if (outcome?.error) throw new ProviderError(outcome.error, outcome);
    const providerMessageId = `sandbox_${String(this.messages.length + 1).padStart(4, '0')}`;
    this.messages.push({ ...message, to: '[sandbox-recipient]' });
    return { providerMessageId, sandbox: true };
  }

  async verifyWebhook({ signature, expected = 'sandbox-signature' }) {
    return Boolean(signature) && signature === expected;
  }
}

const encoder = new TextEncoder();
const decodeBase64 = (value) => Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
const equalBytes = (left, right) => left.length === right.length && left.reduce((result, value, index) => result | (value ^ right[index]), 0) === 0;

export class ResendEmailProvider {
  constructor({ apiKey, webhookSecret, fetchImpl = (...args) => globalThis.fetch(...args) }) {
    if (!apiKey) throw new Error('RESEND_API_KEY_REQUIRED');
    this.name = 'resend';
    this.apiKey = apiKey;
    this.webhookSecret = webhookSecret;
    this.fetchImpl = fetchImpl;
  }

  async sendTransactionalEmail(message) {
    const response = await this.fetchImpl('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${this.apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({ from: message.from, to: [message.to], reply_to: message.replyTo, subject: message.subject, html: message.html, text: message.text, headers: message.headers })
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.id) {
      const status = Number(response.status || 500);
      const permanent = status >= 400 && status < 500 && ![408, 429].includes(status);
      throw new ProviderError('Resend rejected the message', { status, permanent, code: `RESEND_${status}` });
    }
    return { providerMessageId: body.id, sandbox: false };
  }

  async verifyWebhook({ headers, body, now = Date.now() }) {
    const id = headers?.get('svix-id');
    const timestamp = headers?.get('svix-timestamp');
    const signatureHeader = headers?.get('svix-signature');
    if (!this.webhookSecret || !id || !timestamp || !signatureHeader || Math.abs(now / 1000 - Number(timestamp)) > 300) return false;
    try {
      const rawSecret = this.webhookSecret.startsWith('whsec_') ? this.webhookSecret.slice(6) : this.webhookSecret;
      const key = await crypto.subtle.importKey('raw', decodeBase64(rawSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
      const expected = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(`${id}.${timestamp}.${body}`)));
      return signatureHeader.split(/\s+/).some((entry) => {
        const encoded = entry.startsWith('v1,') ? entry.slice(3) : '';
        return encoded ? equalBytes(expected, decodeBase64(encoded)) : false;
      });
    } catch {
      return false;
    }
  }
}

export async function sendTransactionalEmail(provider, message) {
  if (!provider || typeof provider.sendTransactionalEmail !== 'function') throw new Error('EMAIL_PROVIDER_INVALID');
  return provider.sendTransactionalEmail(message);
}
