# NeuroChat Database Backend

Backend Node.js avec SQLite pour la gestion des données persistantes de NeuroChat.

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn

### Installation des dépendances

```bash
cd backend
npm install
```

## 🗄️ Base de données

### Génération des migrations

```bash
npm run db:generate
```

### Application des migrations

```bash
npm run db:migrate
```

### Visualisation de la base de données (Drizzle Studio)

```bash
npm run db:studio
```

## 🏃‍♂️ Démarrage

### Mode développement

```bash
npm run dev
```

### Mode production

```bash
npm run build
npm start
```

## 📚 API Endpoints

### Discussions
- `GET /api/discussions/:workspaceId` - Récupérer les discussions
- `POST /api/discussions` - Créer une discussion
- `PUT /api/discussions/:discussionId` - Mettre à jour une discussion
- `DELETE /api/discussions/:discussionId` - Supprimer une discussion
- `GET /api/discussions/:discussionId/messages` - Récupérer les messages
- `POST /api/discussions/:discussionId/messages` - Ajouter un message

### Mémoire utilisateur
- `GET /api/memory/:workspaceId` - Récupérer la mémoire
- `POST /api/memory` - Ajouter un élément de mémoire
- `PUT /api/memory/:memoryId` - Mettre à jour un élément
- `DELETE /api/memory/:memoryId` - Supprimer un élément
- `POST /api/memory/:workspaceId/search` - Rechercher dans la mémoire

### Documents RAG
- `GET /api/rag/:workspaceId` - Récupérer les documents RAG
- `POST /api/rag/upload` - Uploader un document
- `POST /api/rag` - Créer un document texte
- `PUT /api/rag/:documentId` - Mettre à jour un document
- `DELETE /api/rag/:documentId` - Supprimer un document
- `POST /api/rag/:workspaceId/search` - Rechercher dans les documents

### Paramètres utilisateur
- `GET /api/settings/:workspaceId` - Récupérer les paramètres
- `POST /api/settings` - Créer un paramètre
- `PUT /api/settings/:workspaceId/:key` - Mettre à jour un paramètre
- `DELETE /api/settings/:workspaceId/:key` - Supprimer un paramètre
- `GET /api/settings/:workspaceId/presets` - Récupérer les presets

### Migration
- `POST /api/migrate` - Migrer les données depuis localStorage
- `POST /api/migrate/validate` - Valider une migration

## 🔧 Configuration

### Variables d'environnement

Créer un fichier `.env` dans le dossier `backend` :

```env
# Port du serveur
PORT=3001

# Environnement
NODE_ENV=development

# Base de données
DATABASE_URL=./database.sqlite

# CORS (optionnel, pour la production)
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

## 📁 Structure du projet

```
backend/
├── src/
│   ├── db/
│   │   ├── index.ts          # Configuration base de données
│   │   └── schema.ts         # Schéma Drizzle
│   ├── routes/
│   │   ├── discussions.ts    # Routes discussions
│   │   ├── memory.ts         # Routes mémoire
│   │   ├── rag.ts           # Routes documents RAG
│   │   └── settings.ts       # Routes paramètres
│   ├── services/
│   │   └── migrationService.ts # Service de migration
│   ├── scripts/
│   │   └── migrate.ts        # Script de migration DB
│   └── server.ts             # Serveur Express
├── drizzle/                  # Migrations générées
├── uploads/                  # Fichiers uploadés
├── database.sqlite           # Base de données SQLite
├── package.json
├── drizzle.config.ts
└── README.md
```

## 🔄 Migration depuis localStorage

Le backend inclut un service de migration pour transférer les données existantes de `localStorage` vers la base de données SQLite.

### Utilisation depuis le frontend

```typescript
// Récupérer les données localStorage
const localStorageData = {
  discussions: localStorage.getItem('neurochat_discussions'),
  memory: localStorage.getItem('neurochat_user_memory_v1'),
  ragDocuments: localStorage.getItem('rag_user_docs'),
  // ... autres données
};

// Envoyer au backend pour migration
const response = await fetch('/api/migrate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    localStorageData,
    workspaceId: 'your-workspace-id'
  })
});
```

## 🛡️ Sécurité

- Rate limiting configuré (100 req/15min en production)
- Helmet.js pour les headers de sécurité
- CORS configuré
- Validation des données avec Zod
- Gestion sécurisée des uploads de fichiers

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:3001/health
```

### Documentation API

```bash
curl http://localhost:3001/api/docs
```

## 🐛 Débogage

### Logs

Les logs incluent :
- Requêtes HTTP avec timestamp
- Erreurs de base de données
- Erreurs de validation
- Erreurs de migration

### Base de données

Utiliser Drizzle Studio pour explorer la base de données :

```bash
npm run db:studio
```

## 🚀 Déploiement

### Build de production

```bash
npm run build
```

### Démarrage en production

```bash
NODE_ENV=production npm start
```

### Docker (optionnel)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.