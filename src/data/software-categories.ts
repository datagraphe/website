import type { Locale } from '@/i18n/config';

export interface SoftwareCategory {
  id: string;
  slug: string;
  label_fr: string;
  label_en: string;
  label_de: string;
  label_it: string;
  label_es: string;
  description: string;
  icon: string;
  sort_order: number;
}

export const softwareCategories: SoftwareCategory[] = [
  {id:'all',slug:'tous-les-logiciels',label_fr:'Tous les logiciels',label_en:'All software',label_de:'Alle Software',label_it:'Tutti i software',label_es:'Todo el software',description:'Tous les logiciels réellement étudiés par Datagraphe.',icon:'grid',sort_order:0},
  {id:'time-tracking-attendance',slug:'gestion-du-temps',label_fr:'Gestion du temps & présence',label_en:'Time tracking & attendance',label_de:'Zeiterfassung & Anwesenheit',label_it:'Rilevazione presenze e orari',label_es:'Control horario y asistencia',description:'Suivi du temps, pointage, feuilles de temps et présence.',icon:'clock',sort_order:10},
  {id:'crm-sales',slug:'crm',label_fr:'CRM & ventes',label_en:'CRM & sales',label_de:'CRM & Vertrieb',label_it:'CRM & vendite',label_es:'CRM & ventas',description:'Gestion des prospects, clients et cycles de vente.',icon:'users',sort_order:20},
  {id:'billing-accounting',slug:'facturation-comptabilite',label_fr:'Facturation & comptabilité',label_en:'Billing & accounting',label_de:'Fakturierung & Buchhaltung',label_it:'Fatturazione & contabilità',label_es:'Facturación & contabilidad',description:'Facturation, dépenses, paiements et comptabilité.',icon:'receipt',sort_order:30},
  {id:'project-management',slug:'gestion-de-projet',label_fr:'Gestion de projet',label_en:'Project management',label_de:'Projektmanagement',label_it:'Gestione progetti',label_es:'Gestión de proyectos',description:'Planification, tâches, ressources et suivi de projets.',icon:'check-square',sort_order:40},
  {id:'hr-recruiting',slug:'rh-recrutement',label_fr:'RH & recrutement',label_en:'HR & recruiting',label_de:'Personal & Recruiting',label_it:'HR & selezione',label_es:'RR. HH. & selección',description:'Ressources humaines, recrutement et gestion des talents.',icon:'badge',sort_order:50},
  {id:'marketing',slug:'marketing',label_fr:'Marketing',label_en:'Marketing',label_de:'Marketing',label_it:'Marketing',label_es:'Marketing',description:'Acquisition, campagnes et automatisation marketing.',icon:'megaphone',sort_order:60},
  {id:'ecommerce',slug:'e-commerce',label_fr:'E-commerce',label_en:'E-commerce',label_de:'E-Commerce',label_it:'E-commerce',label_es:'Comercio electrónico',description:'Boutiques en ligne, catalogues et paiements.',icon:'cart',sort_order:70},
  {id:'customer-service',slug:'service-client',label_fr:'Service client',label_en:'Customer service',label_de:'Kundenservice',label_it:'Servizio clienti',label_es:'Atención al cliente',description:'Support, tickets et relation client.',icon:'headphones',sort_order:80},
  {id:'collaboration-productivity',slug:'collaboration-productivite',label_fr:'Collaboration & productivité',label_en:'Collaboration & productivity',label_de:'Zusammenarbeit & Produktivität',label_it:'Collaborazione & produttività',label_es:'Colaboración & productividad',description:'Communication, documentation et organisation du travail.',icon:'layers',sort_order:90},
  {id:'scheduling-booking',slug:'planning-reservation',label_fr:'Planning & réservation',label_en:'Scheduling & booking',label_de:'Planung & Buchung',label_it:'Pianificazione & prenotazioni',label_es:'Planificación & reservas',description:'Prise de rendez-vous, planning et réservations.',icon:'calendar',sort_order:100},
  {id:'erp-business',slug:'erp-gestion-entreprise',label_fr:'ERP & gestion d’entreprise',label_en:'ERP & business management',label_de:'ERP & Unternehmensführung',label_it:'ERP & gestione aziendale',label_es:'ERP & gestión empresarial',description:'Pilotage intégré des processus d’entreprise.',icon:'building',sort_order:110},
  {id:'inventory-logistics',slug:'stocks-logistique',label_fr:'Stocks & logistique',label_en:'Inventory & logistics',label_de:'Bestand & Logistik',label_it:'Magazzino & logistica',label_es:'Inventario & logística',description:'Stocks, approvisionnement, expédition et logistique.',icon:'package',sort_order:120},
  {id:'cybersecurity',slug:'cybersecurite',label_fr:'Cybersécurité',label_en:'Cybersecurity',label_de:'Cybersicherheit',label_it:'Sicurezza informatica',label_es:'Ciberseguridad',description:'Protection des accès, données et systèmes.',icon:'shield',sort_order:130},
  {id:'automation-integration',slug:'automatisation-integration',label_fr:'Automatisation & intégration',label_en:'Automation & integration',label_de:'Automatisierung & Integration',label_it:'Automazione & integrazione',label_es:'Automatización & integración',description:'Connexion des outils et automatisation des processus.',icon:'workflow',sort_order:140},
  {id:'content-creation',slug:'creation-contenu',label_fr:'Création de contenu',label_en:'Content creation',label_de:'Content-Erstellung',label_it:'Creazione di contenuti',label_es:'Creación de contenido',description:'Production et gestion de contenus numériques.',icon:'pen',sort_order:150},
  {id:'analytics-reporting',slug:'analytics-reporting',label_fr:'Analytics & reporting',label_en:'Analytics & reporting',label_de:'Analytics & Reporting',label_it:'Analytics & reporting',label_es:'Analítica & informes',description:'Analyse de données, tableaux de bord et rapports.',icon:'chart',sort_order:160},
  {id:'other-business',slug:'autres-logiciels-metier',label_fr:'Autres logiciels métier',label_en:'Other business software',label_de:'Weitere Unternehmenssoftware',label_it:'Altri software aziendali',label_es:'Otro software empresarial',description:'Logiciels spécialisés pour des besoins métier précis.',icon:'briefcase',sort_order:170},
];

export function categoryLabel(category: SoftwareCategory, locale: Locale) {
  return category[`label_${locale}` as const];
}

export const categoryById = new Map(softwareCategories.map((category) => [category.id, category]));
