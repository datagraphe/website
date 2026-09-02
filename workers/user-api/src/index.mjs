import { authenticateClerkRequest } from './auth.mjs';
import { createUserApi, MemoryRateLimiter } from './app.mjs';
import { D1UserRepository } from './repository.mjs';

const limiter = new MemoryRateLimiter(30, 60_000);

export default {
  async fetch(request, env) {
    const allowedOrigins = String(env.AUTHORIZED_PARTIES ?? 'https://datagraphe.com').split(',').map((value) => value.trim()).filter(Boolean);
    const repository = new D1UserRepository(env.USER_DB);
    return createUserApi({
      authenticate: (incoming) => authenticateClerkRequest(incoming, env, allowedOrigins),
      repository,
      allowedOrigins,
      rateLimiter: limiter
    })(request);
  }
};
