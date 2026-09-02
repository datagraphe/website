# Audit des cookies et sessions utilisateur

## Périmètre

Cet audit couvre l’authentification Clerk en environnement de développement, l’espace « Mes suivis » et l’API utilisateur Datagraphe.

## Cookies et stockage observés

- Clerk gère les éléments de session strictement nécessaires à l’inscription, la connexion et la déconnexion. Leur nom et leur durée peuvent évoluer avec le SDK Clerk ; Datagraphe ne les lit pas directement.
- Le navigateur conserve uniquement une intention de suivi temporaire dans `sessionStorage` sous la clé `datagraphe_follow_intent_v1`. Cette valeur contient un type et une clé de cible publics, jamais un email, un identifiant Clerk ou un jeton.
- Datagraphe n’ajoute aucun cookie publicitaire, de profilage ou de newsletter.
- L’API utilisateur reçoit le jeton Clerk dans l’en-tête `Authorization` et n’écrit aucun jeton dans le HTML statique, les analytics ou la base D1.

## Séparation des consentements

Le suivi d’un logiciel, d’une catégorie ou d’un comparatif ne vaut pas consentement à une newsletter générale. Le suivi de l’actualité Datagraphe et les préférences de notification restent des choix séparés.

## Conclusion

Les éléments de session Clerk sont nécessaires à l’authentification. Aucun cookie non essentiel Datagraphe n’est activé dans ce périmètre.
