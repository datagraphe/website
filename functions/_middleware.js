export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (url.hostname === 'www.datagraphe.com') {
    const legacyFrenchPaths = new Map([
      ['/', '/fr/'],
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

    url.hostname = 'datagraphe.com';
    url.pathname = legacyFrenchPaths.get(url.pathname) ?? url.pathname;
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
