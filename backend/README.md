# ☁️ NeuroChat Backend - Mémoire Internet

Ce backend permet de stocker et synchroniser toutes les conversations de NeuroChat sur internet, offrant une mémoire persistante et accessible depuis n'importe quel appareil.

## 🚀 Fonctionnalités

- **Authentification sécurisée** avec JWT et bcrypt
- **Stockage des conversations** avec SQLite
- **API REST complète** pour la gestion des conversations
- **Recherche sémantique** dans l'historique
- **Synchronisation bidirectionnelle** avec le frontend
- **Sécurité renforcée** avec rate limiting et validation
- **Statistiques d'utilisation** détaillées

## 🏗️ Architecture

```
Backend/
├── server.js              # Serveur Express principal
├── database/
│   └── setup.js          # Configuration et initialisation de la DB
├── middleware/
│   └── auth.js           # Authentification JWT
├── routes/
│   ├── auth.js           # Routes d'authentification
│   └── conversations.js  # Routes des conversations
├── data/                 # Base de données SQLite
└── uploads/              # Fichiers uploadés par utilisateur
```

## 📋 Prérequis

- **Node.js 18+** (recommandé)
- **npm** ou **yarn**
- **Port 3001** disponible

## 🛠️ Installation

### 1. Cloner le projet
```bash
cd backend
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration
```bash
# Copier le fichier d'exemple
cp env.example .env

# Éditer le fichier .env avec vos paramètres
nano .env  # ou votre éditeur préféré
```

### 4. Variables d'environnement importantes
```env
# Port du serveur
PORT=3001

# URL du frontend (pour CORS)
FRONTEND_URL=http://localhost:5173

# Clé secrète JWT (CHANGEZ EN PRODUCTION !)
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Mode d'environnement
NODE_ENV=development
```

## 🚀 Démarrage

### Windows
```bash
# Double-cliquer sur start.bat
# Ou en ligne de commande :
start.bat
```

### Linux/Mac
```bash
# Rendre le script exécutable
chmod +x start.sh

# Démarrer
./start.sh
```

### Manuel
```bash
# Mode développement (avec nodemon)
npm run dev

# Mode production
npm start

# Initialiser la base de données
npm run setup-db
```

## 📊 Base de données

La base de données SQLite est automatiquement créée au premier démarrage avec :

- **Table users** : Comptes utilisateurs
- **Table conversations** : Conversations stockées
- **Table messages** : Messages individuels
- **Table message_embeddings** : Embeddings pour recherche sémantique
- **Table user_sessions** : Sessions utilisateur
- **Table usage_stats** : Statistiques d'utilisation

### Utilisateur par défaut
- **Username** : `admin`
- **Password** : `admin123`
- **Email** : `admin@neurochat.local`

⚠️ **IMPORTANT** : Changez ces identifiants en production !

## 🔐 API Endpoints

### Authentification
```
POST /api/auth/login          # Connexion
POST /api/auth/register       # Inscription
POST /api/auth/logout         # Déconnexion
GET  /api/auth/me            # Profil utilisateur
POST /api/auth/refresh       # Renouvellement token
```

### Conversations
```
GET    /api/conversations              # Lister les conversations
GET    /api/conversations/:id          # Récupérer une conversation
POST   /api/conversations              # Créer une conversation
PUT    /api/conversations/:id          # Modifier une conversation
DELETE /api/conversations/:id          # Supprimer une conversation
POST   /api/conversations/:id/messages # Ajouter un message
GET    /api/conversations/search/semantic # Recherche sémantique
GET    /api/conversations/stats/summary   # Statistiques
```

### Santé
```
GET /health                  # Statut du serveur
```

## 🔒 Sécurité

- **JWT** avec expiration automatique
- **bcrypt** pour le hashage des mots de passe
- **Rate limiting** anti-spam
- **Validation** des entrées utilisateur
- **CORS** configuré pour le frontend
- **Helmet** pour la protection des en-têtes

## 📱 Intégration Frontend

Le frontend NeuroChat peut maintenant se connecter à ce backend via le service `cloudSync.ts` :

```typescript
import cloudSyncService from '../services/cloudSync';

// Connexion
await cloudSyncService.getAuthManager().login(username, password);

// Créer une conversation
await cloudSyncService.createConversation({
  title: "Ma conversation",
  workspace_id: "default"
});

// Synchroniser
await cloudSyncService.syncConversations(localConversations);
```

## 🧪 Tests

### Test de l'API
```bash
# Vérifier la santé du serveur
curl http://localhost:3001/health

# Tester l'authentification
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Test de la base de données
```bash
# Se connecter à SQLite
sqlite3 data/neurochat.db

# Lister les tables
.tables

# Vérifier les utilisateurs
SELECT * FROM users;
```

## 🚨 Dépannage

### Port déjà utilisé
```bash
# Vérifier les processus sur le port 3001
netstat -ano | findstr :3001  # Windows
lsof -i :3001                 # Linux/Mac

# Changer le port dans .env
PORT=3002
```

### Erreur de base de données
```bash
# Supprimer et recréer la base
rm data/neurochat.db
npm run setup-db
```

### Erreur de dépendances
```bash
# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install
```

## 📈 Production

### Variables d'environnement
```env
NODE_ENV=production
JWT_SECRET=your_very_long_random_secret_key
FRONTEND_URL=https://yourdomain.com
PORT=3001
```

### Process Manager (PM2)
```bash
# Installer PM2
npm install -g pm2

# Démarrer en production
pm2 start server.js --name "neurochat-backend"

# Surveiller
pm2 monit

# Logs
pm2 logs neurochat-backend
```

### Reverse Proxy (Nginx)
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

- **Issues GitHub** : [Créer une issue](https://github.com/your-repo/issues)
- **Documentation** : Voir les fichiers README et la documentation du code
- **Communauté** : Rejoignez notre Discord/Slack

---

**NeuroChat Backend** - Mémoire Internet pour vos conversations IA 🧠☁️
