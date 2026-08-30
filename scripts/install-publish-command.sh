#!/usr/bin/env bash

set -Eeuo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_SCRIPT="$PROJECT_DIR/scripts/publish-site.sh"
INSTALL_DIR="$HOME/.local/bin"
COMMAND_PATH="$INSTALL_DIR/datagraphe-publish"

mkdir -p "$INSTALL_DIR"
ln -sfn "$SOURCE_SCRIPT" "$COMMAND_PATH"
chmod +x "$SOURCE_SCRIPT" "$COMMAND_PATH"

echo "Commande installée : $COMMAND_PATH"

case ":$PATH:" in
  *":$INSTALL_DIR:"*) ;;
  *)
    echo
    echo "Ajoutez cette ligne à votre fichier ~/.zshrc :"
    echo 'export PATH="$HOME/.local/bin:$PATH"'
    echo
    echo "Puis exécutez : source ~/.zshrc"
    ;;
esac

echo
echo 'Utilisation : datagraphe-publish "Message du commit"'
