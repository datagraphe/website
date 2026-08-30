# Datagraphe — MVP éditorial

Site statique Astro pour `datagraphe.com`, conçu pour accueillir des tests et comparatifs de logiciels documentés.

## Développement local

Prérequis : Node.js 20 ou plus récent.

```bash
npm install
npm run dev
```

Le serveur local indique l’URL de prévisualisation. Pour produire la version statique :

```bash
npm run build
```

Les fichiers publiables sont générés dans `dist/`.

## Déploiement Cloudflare Pages

1. Créez un dépôt GitHub vide pour le projet.
2. Poussez l’ensemble du dossier dans ce dépôt.
3. Dans Cloudflare, ouvrez **Workers & Pages**, puis créez une application **Pages**.
4. Connectez le dépôt GitHub.
5. Utilisez `npm run build` comme commande de build.
6. Utilisez `dist` comme répertoire de sortie.
7. Déployez, puis ajoutez `datagraphe.com` dans **Custom domains**.
8. Ajoutez également `www.datagraphe.com`.
9. Conservez `https://datagraphe.com` comme URL canonique (déjà configurée dans Astro).
10. Créez une règle de redirection permanente `www.datagraphe.com/*` vers `https://datagraphe.com/$1`.
11. Vérifiez que HTTPS est actif sur les deux noms de domaine.

### Commande de publication locale

Le dépôt contient une commande qui synchronise le projet local, lance tous les
contrôles, crée un commit, pousse `main` sur GitHub puis attend que le
déploiement automatique Cloudflare Pages soit réellement disponible.

Installez la commande une seule fois depuis la racine du projet :

```bash
npm run install:publish-command
```

Si l'installateur le demande, ajoutez `~/.local/bin` au `PATH`, puis publiez
depuis n'importe quel dossier :

```bash
datagraphe-publish "Décrire les modifications"
```

La commande demande une confirmation avant le commit et la publication. Pour
une exécution non interactive :

```bash
datagraphe-publish --yes "Décrire les modifications"
```

Les captures du dossier `artifacts/` ne sont pas ajoutées automatiquement au
commit. Cloudflare Pages reste alimenté par l'intégration GitHub déjà active ;
aucune deuxième publication concurrente avec Wrangler n'est lancée.

## Contenu et données

La structure source de Jibble se trouve dans `src/content/software/jibble.json`. Les champs non vérifiés restent vides ou à `null`. Ne publiez pas de score, tarif, preuve ou verdict sans importer les données consolidées du dossier de test réel.

## Assets de marque

Les fichiers PNG actuels sont des maquettes temporaires créées pour le MVP. Remplacez-les par les fichiers officiels suivants dès qu’ils sont disponibles, sans les redessiner :

- `public/brand/datagraphe-logo.png`
- `public/brand/datagraphe-icon.png`
- `public/brand/favicon.png`

Mettez ensuite à jour les références dans `BaseLayout.astro`, `Header.astro` et `Footer.astro`.

## Avant publication

- Compléter les mentions légales avec les données réelles de l’éditeur.
- Ajouter une adresse de contact réelle.
- Faire valider la politique de confidentialité.
- Remplacer les assets temporaires par le logo officiel.
- Importer uniquement les résultats Jibble dont les preuves sont consolidées.
