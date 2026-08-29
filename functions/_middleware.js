const supportedLocales = new Set(['fr', 'en', 'de', 'it', 'es']);

const legacyFrenchPaths = new Map([
  ['/tests/', '/fr/tests/'],
  ['/tests/jibble/', '/fr/tests/jibble/'],
  ['/comparatifs/', '/fr/comparatifs/'],
  ['/methodologie/', '/fr/methodologie/'],
  ['/services/', '/fr/services/'],
  ['/services/integration-logiciels/', '/fr/services/integration-logiciels/'],
  ['/services/tests-regression/', '/fr/services/tests-regression/'],
  ['/services/controle-migration/', '/fr/services/controle-migration/'],
  ['/services/surveillance-logiciel/', '/fr/services/surveillance-logiciel/'],
  ['/a-propos/', '/fr/a-propos/'],
  ['/contact/', '/fr/contact/'],
  ['/transparence/', '/fr/transparence/'],
  ['/confidentialite/', '/fr/confidentialite/'],
  ['/mentions-legales/', '/fr/mentions-legales/'],
  ['/categories/', '/fr/'],
  ['/categories/gestion-du-temps/', '/fr/tests/jibble/'],
]);

function cookieLocale(request) {
  const cookie = request.headers.get('Cookie') ?? '';
  const value = cookie.match(/(?:^|;\s*)datagraphe_locale=([^;]+)/)?.[1]?.toLowerCase();
  return supportedLocales.has(value) ? value : null;
}

function browserLocale(request) {
  const preferences = (request.headers.get('Accept-Language') ?? '')
    .split(',')
    .map((entry, order) => {
      const [tag, ...parameters] = entry.trim().toLowerCase().split(';');
      const quality = Number(parameters.find((item) => item.trim().startsWith('q='))?.split('=')[1] ?? 1);
      return { locale: tag.split('-')[0], quality: Number.isFinite(quality) ? quality : 0, order };
    })
    .filter(({ locale, quality }) => supportedLocales.has(locale) && quality > 0)
    .sort((a, b) => b.quality - a.quality || a.order - b.order);

  return preferences[0]?.locale ?? 'fr';
}

function preferredLocale(request) {
  return cookieLocale(request) ?? browserLocale(request);
}

function temporaryLanguageRedirect(url) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: url.toString(),
      'Cache-Control': 'private, no-store',
      Vary: 'Accept-Language, Cookie',
    },
  });
}

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.pathname === '/') {
    url.hostname = 'datagraphe.com';
    url.pathname = `/${preferredLocale(context.request)}/`;
    return temporaryLanguageRedirect(url);
  }

  if (url.hostname === 'www.datagraphe.com') {
    url.hostname = 'datagraphe.com';
    url.pathname = legacyFrenchPaths.get(url.pathname) ?? url.pathname;
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
