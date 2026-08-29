export type PageKind = 'home' | 'standard' | 'jibble';

export interface RouteDefinition {
  path: string;
  key: string;
  kind: PageKind;
  indexable: boolean;
}

export const routes: RouteDefinition[] = [
  { path: '', key: 'home', kind: 'home', indexable: true },
  { path: 'tests', key: 'tests', kind: 'standard', indexable: true },
  { path: 'tests/jibble', key: 'jibble', kind: 'jibble', indexable: true },
  { path: 'comparatifs', key: 'comparatifs', kind: 'standard', indexable: false },
  { path: 'methodologie', key: 'methodologie', kind: 'standard', indexable: true },
  { path: 'services', key: 'services', kind: 'standard', indexable: true },
  { path: 'services/integration-logiciels', key: 'integration', kind: 'standard', indexable: true },
  { path: 'services/tests-regression', key: 'regression', kind: 'standard', indexable: true },
  { path: 'services/controle-migration', key: 'migration', kind: 'standard', indexable: true },
  { path: 'services/surveillance-logiciel', key: 'monitoring', kind: 'standard', indexable: true },
  { path: 'a-propos', key: 'about', kind: 'standard', indexable: true },
  { path: 'contact', key: 'contact', kind: 'standard', indexable: false },
  { path: 'transparence', key: 'transparency', kind: 'standard', indexable: true },
  { path: 'confidentialite', key: 'privacy', kind: 'standard', indexable: true },
  { path: 'mentions-legales', key: 'legal', kind: 'standard', indexable: true },
];

export const routeByPath = new Map(routes.map((route) => [route.path, route]));
