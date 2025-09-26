# 🔗 Fonctionnalité GitHub pour Gemini

## Vue d'ensemble

Cette fonctionnalité permet d'intégrer des fichiers GitHub directement dans le contexte de Gemini pour l'analyse de code et la génération de réponses contextuelles. Vous pouvez sélectionner des fichiers depuis n'importe quel repository GitHub public et les analyser avec l'IA.

## Fonctionnalités

### ✨ Accès aux fichiers GitHub
- **Navigation intuitive** : Parcourez les dossiers et fichiers d'un repository GitHub
- **Sélection multiple** : Ajoutez plusieurs fichiers au contexte d'analyse
- **Prévisualisation** : Visualisez le contenu des fichiers avant l'analyse
- **Gestion des types** : Support automatique des différents langages de programmation

### 🎯 Intégration avec Gemini
- **Contexte automatique** : Les fichiers sélectionnés sont automatiquement inclus dans le contexte de Gemini
- **Analyse intelligente** : Gemini peut analyser le code, expliquer les fonctionnalités, et répondre aux questions
- **Formatage optimisé** : Le contenu est formaté de manière optimale pour l'analyse IA

### 🔒 Sécurité et modes
- **Mode Privé** : Interface adaptée avec gradients rouges/violets
- **Mode Enfant** : Interface adaptée avec gradients roses/oranges
- **Mode Normal** : Interface standard avec gradients bleus/indigos

## Comment utiliser

### 1. Accéder à la fonctionnalité
- Cliquez sur le bouton **GitHub** dans le menu principal
- Ou utilisez le menu hamburger sur mobile

### 2. Saisir l'URL GitHub
- Entrez l'URL complète du repository GitHub
- Exemples d'URLs supportées :
  - `https://github.com/owner/repository`
  - `https://github.com/owner/repository/tree/branch`
  - `https://github.com/owner/repository/tree/branch/path/to/folder`

### 3. Naviguer dans les fichiers
- Cliquez sur les dossiers pour les ouvrir
- Cliquez sur **"Analyser"** pour ajouter un fichier au contexte
- Utilisez **"Ouvrir"** pour voir le fichier sur GitHub

### 4. Gérer les fichiers sélectionnés
- Visualisez tous les fichiers sélectionnés dans la sidebar
- Cliquez sur **"Voir"** pour prévisualiser le contenu
- Cliquez sur **"X"** pour retirer un fichier
- Utilisez **"Tout effacer"** pour retirer tous les fichiers

## Types de fichiers supportés

### ✅ Fichiers recommandés
- **Code source** : `.js`, `.ts`, `.py`, `.java`, `.cpp`, `.go`, etc.
- **Configuration** : `.json`, `.yaml`, `.toml`, `.ini`, etc.
- **Documentation** : `.md`, `.txt`, `.rst`, etc.
- **Styles** : `.css`, `.scss`, `.less`, etc.

### ⚠️ Limitations
- **Taille maximale** : 1MB par fichier
- **Fichiers binaires** : Non supportés (`.exe`, `.dll`, `.so`, etc.)
- **Repositories privés** : Non supportés (API GitHub publique uniquement)

## Exemples d'utilisation

### Analyse de code
```
"Peux-tu analyser cette fonction et m'expliquer ce qu'elle fait ?"
```

### Recherche de bugs
```
"Y a-t-il des problèmes potentiels dans ce code ?"
```

### Optimisation
```
"Comment puis-je améliorer les performances de cette fonction ?"
```

### Documentation
```
"Peux-tu générer de la documentation pour cette API ?"
```

## Architecture technique

### Composants principaux
- **`GitHubAccessModal`** : Interface de sélection des fichiers
- **`GitHubFilesSidebar`** : Affichage des fichiers sélectionnés
- **`githubService`** : Service d'intégration avec l'API GitHub

### Services
- **API GitHub** : Récupération des fichiers et métadonnées
- **Intégration Gemini** : Injection du contexte dans les prompts
- **Gestion d'état** : Suivi des fichiers sélectionnés

### Sécurité
- **Validation des URLs** : Vérification du format GitHub
- **Limitation de taille** : Protection contre les fichiers trop volumineux
- **Sanitisation** : Nettoyage du contenu avant affichage

## Dépannage

### Problèmes courants

#### "URL GitHub invalide"
- Vérifiez que l'URL commence par `https://github.com/`
- Assurez-vous que le repository existe et est public

#### "Erreur lors du chargement"
- Vérifiez votre connexion internet
- Le repository pourrait être privé ou supprimé

#### "Fichier trop volumineux"
- Sélectionnez des fichiers plus petits (< 1MB)
- Utilisez des fichiers de configuration ou de documentation

### Support
- Consultez la documentation GitHub API
- Vérifiez les logs de la console pour plus de détails

## Évolutions futures

### Fonctionnalités prévues
- **Recherche dans le code** : Recherche de fonctions, classes, etc.
- **Analyse de dépendances** : Détection des imports et relations
- **Génération de tests** : Création automatique de tests unitaires
- **Refactoring suggéré** : Propositions d'amélioration du code

### Améliorations techniques
- **Cache local** : Mise en cache des fichiers fréquemment utilisés
- **Support Git** : Intégration avec les branches et commits
- **Webhooks** : Mise à jour automatique des fichiers modifiés
