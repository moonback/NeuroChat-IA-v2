# 🧠 Suggestions Contextuelles - Guide d'utilisation

## 🎯 Vue d'ensemble

NeuroChat intègre maintenant un système de suggestions de réponses **intelligentes et contextuelles** qui s'adapte automatiquement à :
- Le contenu du message LLM
- L'historique de conversation
- Vos préférences personnelles

## ✨ Fonctionnalités principales

### 🔄 Suggestions adaptatives
Les suggestions changent selon le type de contenu détecté :

| Type de contenu | Exemples de suggestions |
|-----------------|------------------------|
| **Code & programmation** | "Explique ce code ligne par ligne", "Comment optimiser ?" |
| **Explications** | "Donne un exemple concret", "Quels sont les avantages ?" |
| **Recommandations** | "Pourquoi cette approche ?", "Quelles alternatives ?" |
| **Problèmes** | "Comment résoudre ?", "Étapes détaillées ?" |
| **Listes & énumérations** | "Détaille le plus important", "Lequel en priorité ?" |

### 🧩 Contexte conversationnel
- Analyse des **10 derniers messages** pour comprendre le fil de discussion
- Suggestions qui s'enchaînent logiquement avec l'historique
- Évite les répétitions et propose des angles nouveaux

### 🎨 Personnalisation
Configurez les suggestions selon vos préférences :

#### Niveau de détail
- **Basique** : Questions simples et directes
- **Détaillé** : Questions approfondies avec exemples
- **Expert** : Questions techniques avancées

#### Style d'interaction
- **Formel** : Ton professionnel et structuré
- **Décontracté** : Ton amical et conversationnel  
- **Concis** : Suggestions courtes et efficaces

## 🚀 Comment utiliser

### 1. Activation/Désactivation
- **Desktop** : Cliquez sur l'icône ✨ dans le header
- **Mobile** : Menu hamburger → icône ✨ "Suggestions"

### 2. Configuration
- **Desktop** : Menu hamburger → Paramètres → "Suggestions"
- **Mobile** : Menu hamburger → Paramètres → "Suggestions"

### 3. Utilisation des suggestions
1. Après chaque réponse du LLM, des suggestions apparaissent automatiquement
2. Cliquez sur une suggestion pour l'envoyer immédiatement
3. Utilisez le bouton 🔄 pour générer de nouvelles suggestions
4. Fermez avec ✕ si vous préférez écrire manuellement

## 🎛️ Paramètres avancés

### Types de suggestions générées
- **❓ Questions** : Pour approfondir un sujet
- **💡 Clarifications** : Pour préciser des points flous
- **🔗 Suivi** : Pour explorer des aspects connexes
- **⚡ Actions** : Pour passer à l'implémentation
- **💖 Appréciations** : Pour confirmer ou remercier

### Cache intelligent
- Les suggestions sont mises en cache pour éviter les recalculs
- Cache invalidé toutes les 5 minutes
- Optimisé pour la performance

## 📱 Interface responsive

### Desktop
- Suggestions affichées en grille 2 colonnes
- Badges de catégorie visibles
- Boutons de contrôle complets

### Mobile  
- Mode compact avec une colonne
- Interface optimisée pour le tactile
- Boutons dimensionnés pour les doigts

## 🔧 Cas d'usage recommandés

### Pour l'apprentissage
- Niveau : **Détaillé**
- Style : **Décontracté**
- → Favorise les exemples et explications

### Pour le travail professionnel
- Niveau : **Expert**  
- Style : **Formel**
- → Focus sur l'efficacité et la précision

### Pour la découverte rapide
- Niveau : **Basique**
- Style : **Concis**
- → Questions directes et réponses courtes

## 🚫 Limitations

- Désactivé en **mode enfant** pour la sécurité
- Désactivé en **mode privé** si spécifié
- Cache limité à 50 entrées maximum
- Analyse limitée aux 100 premiers caractères pour la clé de cache

## 🔮 Fonctionnalités futures

- **IA générative** : Suggestions créées par LLM selon le contexte
- **Apprentissage** : Suggestions qui s'adaptent à vos habitudes
- **Suggestions collaborative** : Partage de patterns entre utilisateurs
- **Templates personnalisés** : Créez vos propres modèles de suggestions

---

💡 **Astuce** : Les suggestions sont d'autant plus pertinentes que la conversation est riche en contexte. N'hésitez pas à poser des questions détaillées pour obtenir des suggestions plus précises !
