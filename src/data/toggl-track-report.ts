export const togglTrackReport = {
  testedOn: '31 août 2026',
  metrics: { total: 61, tested: 26, partial: 19, notTestable: 7, blocked: 0, notAvailable: 9, coverage: '58,2 %' },
  verdict: {
    title: 'Un test solide pour le suivi du temps et le travail par projet, avec des limites terrain explicites.',
    text: 'Nos observations soutiennent l’usage de Toggl Track par les indépendants, consultants et équipes travaillant par projet. Le suivi simple du temps, les tarifs, les budgets, les groupes, les approbations, le verrouillage et l’export CSV ont été exécutés dans un environnement fictif. Les usages terrain restent insuffisamment documentés.'
  },
  testedScenarios: [
    ['Minuteur web', 'Démarrage, arrêt et persistance d’une entrée fictive.', 'TGL-V1-005 / TGL-V1-006'],
    ['Saisie et modification', 'Création manuelle puis modification persistante après rechargement.', 'TGL-V1-007'],
    ['Suppression', 'Suppression de l’entrée fictive autorisée, puis absence confirmée après rechargement.', 'TGL-V1-020 / 021 / 022'],
    ['Clients, projet et tâches', 'Clients fictifs, projet « Refonte site web » et quatre tâches créés.', 'TGL-V1-003 / TGL-V1-004'],
    ['Tarif et budget temps', 'Tarif fictif de 100 USD/h et estimation de 40 h validés après rechargement.', 'TGL-V1-015'],
    ['Groupe', 'Groupe fictif créé, second membre affecté et état confirmé après rechargement.', 'TGL-P1-EV-003'],
    ['Approbation', 'Feuille fictive soumise par un membre puis approuvée par le propriétaire.', 'TGL-P1-EV-005 / TGL-P1-EV-006'],
    ['Verrouillage', 'Après approbation, la mutation contrôlée a été refusée et le verrouillage a persisté.', 'TGL-P1-EV-006'],
    ['Export CSV', 'Fichier récupéré, ouvert, colonnes et valeurs contrôlées, puis hashé.', 'TGL-P1-EV-008'],
    ['Forfait projet', 'Forfait fictif de 1 234 USD configuré et persistant après navigation et rechargement.', 'TGL-P1-EV-010'],
    ['Journal d’audit', 'Journal consulté après les créations de clients, projet et tâches.', 'TGL-V1-014']
  ],
  strengths: [
    'Le cycle minuteur, la saisie manuelle, la modification et la suppression ont été exécutés.',
    'Les objets de travail — clients, projet et tâches — ont été créés dans un espace isolé.',
    'Les groupes, la soumission, l’approbation et le verrouillage ont été validés avec deux comptes autorisés.',
    'Le CSV du rapport résumé a été récupéré et contrôlé comme fichier, pas seulement déclenché dans l’interface.',
    'Le tarif, le budget temps et le forfait projet ont été vérifiés après rechargement.'
  ],
  limits: [
    'Terrain, GPS, géolocalisation, kiosque, mobile et fonctionnement hors ligne non vérifiés.',
    'API, SSO, applications complémentaires et certaines intégrations seulement observés ou non testés.',
    'Les formats XLSX et PDF n’ont pas été validés par le retest CSV.',
    'Le workflow d’équipe a porté sur un groupe, un second membre et une période hebdomadaire.',
    'Aucune facture réelle, aucun paiement et aucune intégration comptable n’ont été exécutés.',
    'Neuf fonctions restent inconclusives dans le corpus final.'
  ],
  buyerContexts: [
    ['Indépendant', 'SUPPORTED', 'Suivi du temps, saisie et rapports validés.'],
    ['Consultant', 'SUPPORTED', 'Clients, projet, tarif, budget, forfait et export CSV testés.'],
    ['Travail par projet', 'SUPPORTED', 'Projet, tâches, client, budget et tarif vérifiés.'],
    ['Suivi simple du temps', 'SUPPORTED', 'Minuteur, saisie, modification et suppression exécutés.'],
    ['Facturation au temps', 'SUPPORTED', 'Tarif et valeur des heures observés ; aucune facture réelle envoyée.'],
    ['Suivi budgétaire', 'SUPPORTED', 'Budget temps et forfait fictif persistants.'],
    ['Agence', 'SUPPORTED_WITH_LIMITATIONS', 'Groupe, approbation et verrouillage testés sur deux membres seulement.'],
    ['Petite équipe', 'SUPPORTED_WITH_LIMITATIONS', 'Workflow collaboratif validé sur un périmètre isolé réduit.'],
    ['Équipe terrain', 'INSUFFICIENT_DATA', 'Aucune recommandation : GPS, kiosque, mobile et hors ligne non vérifiés.']
  ],
  evidence: [
    ['TGL-P1-EV-003', 'Groupe et membre après rechargement'],
    ['TGL-P1-EV-006', 'Entrée approuvée et champs verrouillés'],
    ['TGL-P1-EV-010', 'Forfait fictif persistant'],
    ['TGL-P1-EV-007', 'Déclenchement du retest CSV']
  ],
  unsafeFragments: ['10 h 15 min', '1 025,42 USD', 'quatre entrées avec leurs horaires']
} as const;
