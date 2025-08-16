# Sidebar Sources Web - NeuroChat

## 🎯 Objectif

La sidebar Sources Web permet d'afficher, organiser et gérer toutes les sources web utilisées lors des recherches en ligne dans NeuroChat. Elle offre une interface complète pour suivre l'historique des sources consultées et accéder rapidement aux informations web pertinentes.

## ✨ Fonctionnalités Principales

### 🔍 **Affichage des Sources**
- **Sources actives** : Toutes les sources web utilisées dans la conversation courante
- **Informations complètes** : Titre, URL, extrait, domaine, timestamps
- **Indicateurs visuels** : Émojis par domaine, statuts visuels
- **Aperçu intégré** : Prévisualisation des extraits sans quitter l'interface

### ⭐ **Système de Favoris**
- **Marquage rapide** : Bouton étoile au survol pour marquer/démarquer
- **Filtrage par favoris** : Accès rapide aux sources importantes
- **Persistence** : Sauvegarde automatique des favoris entre sessions
- **Indicateurs** : Étoiles dorées pour les sources favorites

### 📊 **Statistiques et Analytics**
- **Comptage d'usage** : Suivi du nombre d'utilisations par source
- **Dernière utilisation** : Horodatage de la dernière consultation
- **Domaines populaires** : Identification des domaines les plus utilisés
- **Sources récentes** : Filtrage des sources consultées dans les dernières 24h

### 🔧 **Tri et Filtrage Avancés**

#### Options de Filtrage
- **Toutes** : Affichage complet de toutes les sources
- **Récentes (24h)** : Sources consultées dans les dernières 24 heures
- **Favoris** : Sources marquées comme importantes
- **Multi-domaines** : Sources provenant de domaines avec plusieurs résultats

#### Options de Tri
- **Plus récent** : Tri par timestamp (plus récent en premier)
- **Plus utilisé** : Tri par nombre d'utilisations (popularité)
- **Domaine** : Tri alphabétique par nom de domaine
- **Titre** : Tri alphabétique par titre de la source
- **Dernière utilisation** : Tri par date de dernière consultation

### 📄 **Pagination Intelligente**
- **Affichage configurable** : 5, 10, 20 ou 50 sources par page
- **Navigation intuitive** : Boutons précédent/suivant
- **Indicateurs de position** : "Page X/Y" et compteurs d'éléments
- **Adaptation automatique** : Réinitialisation lors des changements de filtres

### 🎨 **Interface Utilisateur**

#### Desktop (Sidebar)
- **Position** : Sidebar gauche rétractable
- **Poignée** : Onglet "Sources" pour déployer/rétracter
- **Expansion** : Contrôle manuel de l'état déployé/rétracté
- **Thème vert** : Couleurs distinctives (vert/émeraude) pour différencier du RAG

#### Mobile (Drawer)
- **Bouton flottant** : "Web" en bas à gauche de l'écran
- **Interface simplifiée** : Version adaptée pour écrans tactiles
- **Navigation tactile** : Boutons dimensionnés pour le touch
- **Fermeture intuitive** : Bouton X et gesture de fermeture

### 🌐 **Reconnaissance de Domaines**
```typescript
// Émojis automatiques par domaine
Wikipedia: 📚    GitHub: 💻    StackOverflow: ❓
YouTube: 📺     Reddit: 💬    News: 📰
Blog: ✍️       Autres: 🌐
```

### 💾 **Stockage et Persistence**

#### Clés de Stockage Local
```typescript
const LS_WEB_FAVORITES_KEY = 'web_sources_favorites';  // Favoris
const LS_WEB_STATS_KEY = 'web_sources_stats';          // Statistiques d'usage
```

#### Structure des Données
```typescript
interface WebSource {
  title: string;        // Titre de la page
  url: string;          // URL complète
  snippet?: string;     // Extrait de la page
  timestamp?: string;   // Date d'ajout (ISO)
  messageId?: string;   // ID du message associé
  domain?: string;      // Domaine extrait
  useCount?: number;    // Nombre d'utilisations
  lastUsed?: string;    // Dernière utilisation (ISO)
  favorite?: boolean;   // Statut favori
}
```

## 🚀 **Intégration dans l'Application**

### Activation
La sidebar s'active automatiquement lorsque :
- Le mode recherche web est activé (`webEnabled = true`)
- L'utilisateur n'est pas en mode enfant (`!modeEnfant`)
- Des sources web sont disponibles dans la conversation

### Tracking Automatique
```typescript
// Ajout automatique lors des recherches web
const newWebSources: WebSource[] = webResults.map(r => ({
  title: r.title,
  url: r.url,
  snippet: r.snippet,
  timestamp: new Date().toISOString(),
  messageId: message.id,
}));

setUsedWebSources(prev => {
  const existingUrls = new Set(prev.map(s => s.url));
  const uniqueNewSources = newWebSources.filter(s => !existingUrls.has(s.url));
  return [...prev, ...uniqueNewSources];
});
```

### Nettoyage des Sessions
```typescript
// Réinitialisation lors d'une nouvelle conversation
const handleNewDiscussion = () => {
  setMessages([]);
  setUsedRagDocs([]);
  setUsedWebSources([]); // ← Nettoyage des sources web
};
```

## 📱 **Responsive Design**

### Desktop (≥ lg)
- Sidebar fixe de 320px de largeur
- Position absolue à gauche de l'écran
- Animation de slide pour l'expansion/rétraction
- Contrôles complets (tri, filtrage, pagination)

### Mobile (< lg)
- Bouton flottant en bas à gauche
- Drawer modal plein écran
- Interface simplifiée mais complète
- Navigation tactile optimisée

## 🎨 **Thème et Couleurs**

### Palette Principale
- **Primaire** : Vert (`green-500`) et Émeraude (`emerald-500`)
- **Arrière-plans** : Dégradés verts subtils
- **Accents** : Jaune pour les favoris (`yellow-500`)
- **Bordures** : Vert clair pour les éléments actifs

### États Visuels
- **Normal** : Bordure gris clair
- **Hover** : Bordure verte avec ombre
- **Actif** : Arrière-plan dégradé vert
- **Favori** : Étoile jaune remplie

## 📈 **Performance et Optimisation**

### Optimisations Implémentées
- **useMemo** : Calculs de filtrage et tri mis en cache
- **useCallback** : Fonctions de gestion d'événements optimisées
- **Pagination** : Rendu limité aux éléments visibles
- **Lazy Loading** : Chargement différé des métadonnées

### Gestion Mémoire
- **Déduplication** : Évitement des doublons par URL
- **Nettoyage** : Suppression automatique lors des nouvelles conversations
- **Stockage optimisé** : Compression des données en localStorage

## 🔧 **Configuration et Paramètres**

### Paramètres par Défaut
```typescript
const DEFAULT_ITEMS_PER_PAGE = 10;
const DEFAULT_SORT = 'timestamp';
const DEFAULT_FILTER = 'all';
const RECENT_THRESHOLD_HOURS = 24;
```

### Personnalisation
- **Taille de page** : Configurable par l'utilisateur
- **Tri par défaut** : Modifiable selon les préférences
- **Filtres** : Mémorisation de l'état entre sessions
- **Favoris** : Gestion personnalisée par utilisateur

## 🧪 **Cas d'Usage**

### Recherche Académique
- **Filtrage par domaines** : Isoler Wikipedia, sources académiques
- **Tri par popularité** : Identifier les sources les plus référencées
- **Favoris** : Marquer les sources de référence importantes

### Veille Technologique
- **Sources récentes** : Focus sur l'actualité des dernières 24h
- **Domaines spécialisés** : GitHub, StackOverflow, blogs tech
- **Suivi d'usage** : Identifier les sources les plus consultées

### Recherche Générale
- **Tri chronologique** : Suivre l'évolution des recherches
- **Diversité des sources** : Filtrage multi-domaines
- **Accès rapide** : Favoris pour les sources fréquemment utilisées

## 🚨 **Limitations et Considérations**

### Limitations Techniques
- **Stockage local** : Limité par la capacité du navigateur
- **Pas de synchronisation** : Données locales uniquement
- **Dépendance API** : Nécessite un service de recherche web actif

### Considérations UX
- **Surcharge cognitive** : Pagination nécessaire pour de nombreuses sources
- **Espace écran** : Impact sur la largeur disponible pour le chat
- **Performance** : Ralentissement possible avec de très nombreuses sources

## 🔮 **Améliorations Futures**

### Fonctionnalités Envisagées
- **Groupement par conversation** : Organisation par sessions de chat
- **Export/Import** : Sauvegarde et partage des sources
- **Tags personnalisés** : Catégorisation libre par l'utilisateur
- **Recherche full-text** : Recherche dans le contenu des extraits
- **Synchronisation cloud** : Sauvegarde en ligne optionnelle

### Intégrations Possibles
- **Gestionnaires de signets** : Export vers navigateurs
- **Outils de recherche** : Intégration avec Zotero, Mendeley
- **APIs tierces** : Enrichissement automatique des métadonnées
- **IA de catégorisation** : Classification automatique des sources

---

*Documentation créée le : $(date)*
*Version NeuroChat : v2.0*
*Sidebar Sources Web : Version 1.0*
