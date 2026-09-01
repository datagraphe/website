# Plan de dépréciation des données legacy

## État après A3-PROD

- La source de production par défaut est `public-dataset`.
- Le contrat public statique utilise `PUBLIC_DATA_SCHEMA 1.1`.
- Les sources métier legacy restent présentes et inchangées pour permettre un rollback rapide.
- Aucun accès D1 ou R2 n'est effectué par le site à l'exécution.

## Rollback

Construire le site avec `DATA_SOURCE=legacy npm run build`, puis republier le commit de rollback selon la procédure de publication contrôlée.

## Fenêtre de sécurité

Conserver les sources legacy pendant au moins deux cycles complets de publication et de reconstruction validés. Ne lancer leur suppression que dans une étape distincte `A4-LEGACY-CLEANUP`, après autorisation humaine et vérification d'un rollback reproductible.
