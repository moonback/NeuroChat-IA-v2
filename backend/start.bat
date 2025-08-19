@echo off
echo ========================================
echo    NeuroChat Backend - Demarrage
echo ========================================
echo.

REM Vérifier si Node.js est installé
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERREUR: Node.js n'est pas installe ou pas dans le PATH
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

REM Vérifier si les dépendances sont installées
if not exist "node_modules" (
    echo Installation des dependances...
    npm install
    if %errorlevel% neq 0 (
        echo ERREUR: Echec de l'installation des dependances
        pause
        exit /b 1
    )
)

REM Créer le fichier .env s'il n'existe pas
if not exist ".env" (
    echo Creation du fichier .env...
    copy "env.example" ".env"
    echo.
    echo ATTENTION: Veuillez configurer le fichier .env avec vos parametres
    echo.
)

REM Démarrer le serveur
echo Demarrage du serveur NeuroChat...
echo.
echo URL: http://localhost:3001
echo API: http://localhost:3001/api
echo Sante: http://localhost:3001/health
echo.
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.

npm run dev

pause
