#!/usr/bin/env bash

set -Eeuo pipefail

SCRIPT_SOURCE="${BASH_SOURCE[0]}"
while [[ -L "$SCRIPT_SOURCE" ]]; do
  SCRIPT_DIR="$(cd -P "$(dirname "$SCRIPT_SOURCE")" && pwd)"
  SCRIPT_SOURCE="$(readlink "$SCRIPT_SOURCE")"
  [[ "$SCRIPT_SOURCE" != /* ]] && SCRIPT_SOURCE="$SCRIPT_DIR/$SCRIPT_SOURCE"
done
SCRIPT_DIR="$(cd -P "$(dirname "$SCRIPT_SOURCE")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
BRANCH="main"
REMOTE="origin"
LIVE_MARKER_URL="${DATAGRAPHE_LIVE_MARKER_URL:-https://datagraphe.com/deploy-version.txt}"
ASSUME_YES=false
COMMIT_MESSAGE=""

usage() {
  cat <<'EOF'
Publie Datagraphe en local, sur GitHub puis sur Cloudflare Pages.

Usage :
  datagraphe-publish "Message du commit"
  datagraphe-publish --yes "Message du commit"

Options :
  -y, --yes   Ne pas demander de confirmation avant la publication
  -h, --help  Afficher cette aide
EOF
}

while (($#)); do
  case "$1" in
    -y|--yes) ASSUME_YES=true ;;
    -h|--help) usage; exit 0 ;;
    *)
      if [[ -n "$COMMIT_MESSAGE" ]]; then
        echo "Erreur : fournissez le message de commit entre guillemets." >&2
        exit 2
      fi
      COMMIT_MESSAGE="$1"
      ;;
  esac
  shift
done

if [[ -z "$COMMIT_MESSAGE" ]]; then
  COMMIT_MESSAGE="Publier le site Datagraphe $(date '+%Y-%m-%d %H:%M')"
fi

for command_name in git node npm curl; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Erreur : la commande '$command_name' est absente." >&2
    exit 1
  fi
done

cd "$PROJECT_DIR"

if [[ ! -d .git ]]; then
  echo "Erreur : $PROJECT_DIR n'est pas un dépôt Git." >&2
  exit 1
fi

CURRENT_BRANCH="$(git branch --show-current)"
if [[ "$CURRENT_BRANCH" != "$BRANCH" ]]; then
  echo "Erreur : branche actuelle '$CURRENT_BRANCH'. Placez-vous sur '$BRANCH'." >&2
  exit 1
fi

if ! git remote get-url "$REMOTE" >/dev/null 2>&1; then
  echo "Erreur : le dépôt distant '$REMOTE' est absent." >&2
  exit 1
fi

echo "1/6 — Synchronisation avec GitHub"
git pull --rebase --autostash "$REMOTE" "$BRANCH"

echo "2/6 — Installation reproductible des dépendances"
if ! npm ci; then
  echo "npm ci n'a pas pu remplacer node_modules proprement."
  echo "Réparation des dépendances à partir du fichier package-lock.json…"
  npm install --no-audit --no-fund
fi

RELEASE_ID="$(date -u '+%Y%m%dT%H%M%SZ')"
printf '%s\n' "$RELEASE_ID" > public/deploy-version.txt

echo "3/6 — Vérification et construction locale"
npm run build

echo "4/6 — Modifications qui seront publiées"
git status --short -- . ':(exclude)artifacts/**'

if [[ "$ASSUME_YES" != true ]]; then
  printf "Publier ces modifications sur GitHub et Cloudflare ? [o/N] "
  read -r answer
  case "$answer" in
    o|O|oui|OUI|y|Y|yes|YES) ;;
    *) echo "Publication annulée."; exit 0 ;;
  esac
fi

echo "5/6 — Commit et envoi vers GitHub"
git add -A -- . ':(exclude)artifacts/**'
git commit -m "$COMMIT_MESSAGE"
git push "$REMOTE" "$BRANCH"

echo "6/6 — Attente du déploiement automatique Cloudflare Pages"
for attempt in $(seq 1 36); do
  LIVE_RELEASE="$(curl --location --fail --silent --show-error --max-time 10 "$LIVE_MARKER_URL?check=$RELEASE_ID" 2>/dev/null || true)"
  if [[ "$LIVE_RELEASE" == "$RELEASE_ID" ]]; then
    echo "Publication terminée."
    echo "GitHub    : https://github.com/datagraphe/website"
    echo "Cloudflare: https://datagraphe.com"
    echo "Version   : $RELEASE_ID"
    exit 0
  fi
  printf '.'
  sleep 5
done

echo
echo "GitHub a bien reçu le commit, mais Cloudflare n'a pas encore exposé la version $RELEASE_ID." >&2
echo "Vérifiez Workers & Pages > website > Déploiements dans Cloudflare." >&2
exit 1
