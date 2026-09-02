#!/usr/bin/env bash
set -euo pipefail

site_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
worker_dir="$site_root/workers/user-api"

echo "Configuration locale Clerk DEVELOPMENT (les valeurs restent masquées)."
read -r -s -p "Clé publiable DEVELOPMENT (pk_test_...) : " clerk_publishable
echo
read -r -s -p "Clé secrète DEVELOPMENT (sk_test_...) : " clerk_secret
echo

if [[ "$clerk_publishable" != pk_test_* ]]; then
  echo "Erreur : une clé publiable Clerk DEVELOPMENT pk_test_... est requise." >&2
  exit 1
fi
if [[ "$clerk_secret" != sk_test_* ]]; then
  echo "Erreur : une clé secrète Clerk DEVELOPMENT sk_test_... est requise." >&2
  exit 1
fi

umask 077
printf 'PUBLIC_CLERK_PUBLISHABLE_KEY=%s\n' "$clerk_publishable" > "$site_root/.env"
printf 'CLERK_PUBLISHABLE_KEY=%s\nCLERK_SECRET_KEY=%s\n' "$clerk_publishable" "$clerk_secret" > "$worker_dir/.dev.vars"
unset clerk_publishable clerk_secret

echo "Configuration locale enregistrée dans des fichiers ignorés par Git."
echo "Aucune clé n'a été affichée, commitée ou envoyée."
