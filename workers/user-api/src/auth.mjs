import { createClerkClient } from '@clerk/backend';

export async function authenticateClerkRequest(request, env, authorizedParties) {
  if (!env.CLERK_PUBLISHABLE_KEY || !env.CLERK_SECRET_KEY) throw new Error('CLERK_CONFIGURATION_MISSING');
  const clerk = createClerkClient({ publishableKey: env.CLERK_PUBLISHABLE_KEY, secretKey: env.CLERK_SECRET_KEY });
  const state = await clerk.authenticateRequest(request, {
    acceptsToken: 'session_token',
    authorizedParties,
    ...(env.CLERK_JWT_KEY ? { jwtKey: env.CLERK_JWT_KEY } : {})
  });
  if (!state.isAuthenticated) return null;
  const auth = state.toAuth();
  if (!auth.userId) return null;
  const clerkUser = await clerk.users.getUser(auth.userId);
  const primary = clerkUser.emailAddresses.find((item) => item.id === clerkUser.primaryEmailAddressId);
  return { clerkUserId: auth.userId, email: primary?.emailAddress ?? null, locale: 'fr' };
}
