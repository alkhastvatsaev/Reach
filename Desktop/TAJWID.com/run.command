#!/bin/bash
# Se placer dans le dossier où se trouve ce fichier (le dossier du projet)
cd "$(dirname "$0")"

echo "============================================="
echo "   Démarrage de TAJWID AI (Next.js)          "
echo "============================================="

# Tuer tout processus fantôme qui bloquerait le port 8000
echo "[1/3] Nettoyage du port 8000..."
lsof -ti:8000 | xargs kill -9 2>/dev/null

# Lancement du serveur
echo "[2/3] Lancement du serveur Next.js..."
echo "Le terminal va rester ouvert. Pour arrêter, fermez simplement cette fenêtre."
echo "[3/3] Vous pouvez ouvrir l'application sur : http://localhost:8000"
echo "============================================="

# On lance la commande de dev Next.js sur le port 8000
npm run dev -- -p 8000
