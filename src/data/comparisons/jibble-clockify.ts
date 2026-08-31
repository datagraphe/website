export const comparisonFreshness = {
  lastTest: '31 août 2026',
  jibbleObservations: '27 et 31 août 2026',
  clockifyObservations: '30 et 31 août 2026',
  previousTest: null,
  changeDetected: null,
} as const;

export const comparisonScenarios = [
  { scenario:'Créer un espace de travail', jibble:'Création observée avec succès.', clockify:'Création observée avec succès.', conclusion:'Aucune différence importante identifiée dans ce scénario.', proof:'verified' },
  { scenario:'Créer un groupe', jibble:'Groupe créé pendant le test.', clockify:'Groupe créé pendant le test.', conclusion:'Résultat comparable dans le scénario testé.', proof:'verified' },
  { scenario:'Démarrer et arrêter le minuteur', jibble:'Cycle du minuteur exécuté.', clockify:'Cycle du minuteur exécuté.', conclusion:'Aucun avantage clair observé.', proof:'verified' },
  { scenario:'Mettre en pause puis reprendre', jibble:'Pause et reprise observées.', clockify:'Pause et reprise observées.', conclusion:'Aucun avantage clair observé.', proof:'verified' },
  { scenario:'Saisir une durée manuellement', jibble:'Saisie manuelle observée.', clockify:'Saisie manuelle observée.', conclusion:'Résultat comparable dans notre protocole.', proof:'verified' },
  { scenario:'Modifier une entrée', jibble:'Modification avec justification et historique d’audit.', clockify:'Modification de l’entrée observée.', conclusion:'Même besoin couvert, approche d’audit différente.', proof:'verified' },
  { scenario:'Supprimer une entrée', jibble:'Entrée retirée des temps actifs; trace « Supprimé » conservée.', clockify:'Ligne retirée après confirmation.', conclusion:'Suppression confirmée après rechargement dans les deux outils.', proof:'verified' },
  { scenario:'Consulter la feuille hebdomadaire', jibble:'Feuille hebdomadaire observée.', clockify:'Feuille hebdomadaire observée.', conclusion:'Aucune différence importante identifiée.', proof:'verified' },
  { scenario:'Créer un client', jibble:'Client créé pendant le test.', clockify:'Client créé pendant le test.', conclusion:'Résultat comparable dans le scénario testé.', proof:'verified' },
  { scenario:'Créer un projet', jibble:'Projet créé pendant le test.', clockify:'Projet créé pendant le test.', conclusion:'Résultat comparable dans le scénario testé.', proof:'verified' },
  { scenario:'Ventiler une journée de 9 heures', jibble:'8 h normales et 1 h supplémentaire affichées.', clockify:'9 h enregistrées sans ventilation quotidienne 8 h + 1 h observée.', conclusion:'Jibble a fourni une ventilation plus complète dans ce réglage précis.', proof:'qualified' },
  { scenario:'Exporter en CSV', jibble:'Export lisible, orienté temps et heures supplémentaires.', clockify:'Export lisible, orienté projet, client et données économiques.', conclusion:'Deux exports valides, structurés différemment.', proof:'verified' },
  { scenario:'Exporter en XLSX', jibble:'Classeur OOXML valide.', clockify:'Classeur OOXML valide.', conclusion:'Deux exports valides, structurés différemment.', proof:'verified' },
] as const;

export const publicLimitations = [
  'L’ajout réel de membres et les invitations n’ont pas été comparés jusqu’au bout.',
  'Les permissions et rôles détaillés restent insuffisamment documentés.',
  'Le verrouillage d’une période terminée reste à tester.',
  'Les affectations, tarifs et budgets de projet ne permettent pas encore une conclusion fiable.',
  'Le GPS, le kiosque et le fonctionnement hors ligne ne sont pas départagés.',
  'Ce comparatif ne constitue pas une comparaison tarifaire complète.',
] as const;

export const buyerContexts = [
  { title:'Suivi basique du temps', status:'supported', text:'Minuteur, pause, reprise, saisie manuelle et feuille hebdomadaire ont donné des résultats comparables dans nos scénarios.' },
  { title:'Correction manuelle', status:'supported', text:'Les deux outils ont permis de modifier et supprimer une entrée; Jibble a montré un historique d’audit plus explicite.' },
  { title:'Exports', status:'supported', text:'Les CSV et XLSX des deux logiciels étaient valides, avec des structures différentes.' },
  { title:'Indépendant', status:'limited', text:'Les fonctions de base sont documentées, mais les offres et prix ne sont pas assez comparables pour une recommandation globale.' },
  { title:'Heures supplémentaires', status:'limited', text:'Jibble a ventilé 8 h + 1 h dans notre scénario de 9 h; la conclusion dépend des réglages et du contexte testés.' },
  { title:'Équipes et projets', status:'limited', text:'Groupes, clients et projets ont été créés, mais permissions, affectations, tarifs et budgets restent à départager.' },
] as const;

export const insufficientBuyerContexts = [
  'Petite équipe avec gouvernance et permissions avancées',
  'Agence nécessitant tarifs, budgets et affectations',
  'Validation et verrouillage des feuilles de temps',
  'Usage terrain avec GPS, kiosque ou mode hors ligne',
] as const;
