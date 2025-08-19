#!/bin/bash

echo "========================================"
echo "    NeuroChat Backend - Démarrage"
echo "========================================"
echo

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "ERREUR: Node.js n'est pas installé ou pas dans le PATH"
    echo "Veuillez installer Node.js depuis https://nodejs.org/"
    exit 1
fi

# Vérifier si les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo "Installation des dépendances..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERREUR: Échec de l'installation des dépendances"
        exit 1
    fi
fi

# Créer le fichier .env s'il n'existe pas
if [ ! -f ".env" ]; then
    echo "Création du fichier .env..."
    cp "env.example" ".env"
    echo
    echo "ATTENTION: Veuillez configurer le fichier .env avec vos paramètres"
    echo
fi

# Rendre le script exécutable
chmod +x start.sh

# Démarrer le serveur
echo "Démarrage du serveur NeuroChat..."
echo
echo "URL: http://localhost:3001"
echo "API: http://localhost:3001/api"
echo "Santé: http://localhost:3001/health"
echo
echo "Appuyez sur Ctrl+C pour arrêter le serveur"
echo

npm run dev
