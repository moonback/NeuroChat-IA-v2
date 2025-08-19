# ☁️ Intégration Cloud - NeuroChat-IA-v2

## 🎯 Vue d'ensemble

Cette fonctionnalité permet de synchroniser toutes les conversations de NeuroChat avec un serveur cloud, offrant ainsi une "mémoire internet" persistante et accessible depuis n'importe quel appareil.

## 🏗️ Architecture

### Backend (Node.js/Express)
- **Serveur** : `backend/server.js`
- **Base de données** : SQLite avec tables pour utilisateurs, conversations et messages
- **Authentification** : JWT avec sessions sécurisées
- **API REST** : Gestion complète des conversations (CRUD)

### Frontend (React/TypeScript)
- **Service de synchronisation** : `src/services/cloudSync.ts`
- **Interface d'authentification** : `src/components/CloudAuthModal.tsx`
- **Indicateur de statut** : `src/components/CloudStatusIndicator.tsx`
- **Hook intégré** : `src/hooks/useDiscussions.ts` modifié pour la sync cloud

## 🚀 Installation et démarrage

### 1. Backend

```bash
cd backend
npm install
npm run setup-db  # Crée la base de données et l'utilisateur admin
npm run dev        # Démarre le serveur sur http://localhost:3001
```

**Utilisateur par défaut :**
- Username: `admin`
- Password: `admin123`
- ⚠️ **Changez ces identifiants en production !**

### 2. Frontend

```bash
# Créer le fichier .env
cp .env.example .env

# Configurer l'URL de l'API
VITE_CLOUD_API_URL=http://localhost:3001/api

# Démarrer l'application
npm run dev
```

## 🔐 Authentification

### Connexion
1. Cliquez sur l'icône ☁️ dans le header
2. Utilisez l'onglet "Connexion"
3. Entrez vos identifiants

### Inscription
1. Cliquez sur l'icône ☁️ dans le header
2. Utilisez l'onglet "Inscription"
3. Créez un nouveau compte

## ☁️ Synchronisation

### Automatique
- Les nouvelles conversations sont automatiquement synchronisées
- Synchronisation en arrière-plan toutes les 30 secondes
- Gestion des conflits et résolution automatique

### Manuelle
- Cliquez sur l'indicateur de statut cloud
- Utilisez le bouton "Synchroniser maintenant"
- Vérifiez le statut de la dernière synchronisation

## 🔍 Fonctionnalités

### Conversations
- ✅ Création et sauvegarde automatique
- ✅ Synchronisation bidirectionnelle
- ✅ Gestion des métadonnées (workspace, mode enfant, mode privé)
- ✅ Recherche sémantique (placeholder pour futures améliorations)

### Sécurité
- 🔐 Chiffrement AES-256 maintenu
- 🔐 JWT avec expiration automatique
- 🔐 Sessions sécurisées
- 🔐 Validation des permissions

### Performance
- 🚀 Cache local intelligent
- 🚀 Synchronisation incrémentale
- 🚀 Gestion hors ligne
- 🚀 Retry automatique en cas d'échec

## 📱 Interface utilisateur

### Header
- **Icône ☁️** : Ouvre le modal d'authentification
- **Indicateur de statut** : Affiche l'état de la connexion
- **Bouton de sync** : Synchronisation manuelle

### Modal d'authentification
- **Onglet Connexion** : Se connecter avec un compte existant
- **Onglet Inscription** : Créer un nouveau compte
- **Onglet Mon Compte** : Gérer le compte et la synchronisation

## 🔧 Configuration avancée

### Variables d'environnement

```bash
# Backend (.env)
PORT=3001
JWT_SECRET=your_super_secret_key
FRONTEND_URL=http://localhost:5173

# Frontend (.env)
VITE_CLOUD_API_URL=http://localhost:3001/api
VITE_DEBUG_MODE=true
```

### Configuration personnalisée

```typescript
// src/config/environment.ts
export const ENV_CONFIG = {
  CLOUD_API_URL: 'https://your-api.com/api',
  DEBUG_MODE: true,
  // ... autres options
};
```

## 🐛 Dépannage

### Problèmes courants

#### "Service cloud non disponible"
- Vérifiez que le backend est démarré
- Vérifiez l'URL de l'API dans `.env`
- Vérifiez la connectivité réseau

#### "Token expiré"
- Reconnectez-vous
- Le renouvellement automatique devrait se faire
- Vérifiez l'heure du système

#### "Erreur de synchronisation"
- Vérifiez les logs du backend
- Vérifiez la base de données
- Essayez une synchronisation manuelle

### Logs et debug

```typescript
// Activer le mode debug
VITE_DEBUG_MODE=true
VITE_LOG_LEVEL=debug

// Vérifier la console du navigateur
// Vérifier les logs du serveur backend
```

## 🔮 Évolutions futures

### Recherche sémantique
- [ ] Intégration des embeddings
- [ ] Recherche par similarité
- [ ] Indexation automatique

### Synchronisation avancée
- [ ] Gestion des conflits intelligente
- [ ] Synchronisation partielle
- [ ] Compression des données

### Fonctionnalités cloud
- [ ] Partage de conversations
- [ ] Collaboration en temps réel
- [ ] Sauvegarde automatique

## 📚 API Reference

### Endpoints principaux

```bash
# Authentification
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/me

# Conversations
GET    /api/conversations
POST   /api/conversations
GET    /api/conversations/:id
PUT    /api/conversations/:id
DELETE /api/conversations/:id

# Messages
POST /api/conversations/:id/messages

# Recherche
GET /api/conversations/search/semantic

# Statistiques
GET /api/conversations/stats/summary
```

### Modèles de données

```typescript
interface CloudConversation {
  id: number;
  title: string;
  workspace_id: string;
  child_mode: boolean;
  private_mode: boolean;
  created_at: string;
  updated_at: string;
  message_count: number;
  tags: string[];
  metadata: Record<string, any>;
}

interface CloudMessage {
  id: number;
  conversation_id: number;
  content: string;
  is_user: boolean;
  timestamp: string;
  message_order: number;
  metadata: Record<string, any>;
}
```

## 🤝 Contribution

Pour contribuer à cette fonctionnalité :

1. **Tests** : Testez la synchronisation sur différents appareils
2. **Performance** : Optimisez la synchronisation pour de gros volumes
3. **Sécurité** : Vérifiez la robustesse de l'authentification
4. **UX** : Améliorez l'interface utilisateur

## 📄 Licence

Cette fonctionnalité suit la même licence que NeuroChat-IA-v2.

---

**Note** : Cette fonctionnalité est en développement actif. Certaines fonctionnalités avancées (recherche sémantique, gestion des conflits) sont des placeholders pour les futures versions.
