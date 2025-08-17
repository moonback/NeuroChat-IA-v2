# Plan de Migration vers une Base de Données Persistante

## 🎯 Problématique Actuelle

L'application NeuroChat-IA-v2 utilise actuellement `localStorage` pour persister toutes les données :

### Limitations Identifiées

1. **Scalabilité limitée**
   - Limite de ~5-10MB par domaine selon les navigateurs
   - Performance dégradée avec de gros volumes de données
   - Pas de requêtes complexes possibles

2. **Portabilité des données**
   - Données liées au navigateur/appareil
   - Pas de synchronisation multi-appareils
   - Risque de perte lors du nettoyage du navigateur

3. **Sécurité**
   - Données accessibles côté client
   - Pas de chiffrement natif
   - Vulnérable aux attaques XSS

4. **Fonctionnalités limitées**
   - Pas de recherche full-text native
   - Pas de relations complexes entre données
   - Pas de sauvegarde automatique

### Données Actuellement Stockées

```typescript
// Discussions et historique
'ws:{workspaceId}:gemini_discussions'          // Historique des conversations
'ws:{workspaceId}:gemini_current_discussion'   // Discussion courante
'ws:{workspaceId}:gemini_presets'              // Presets de configuration

// Système de mémoire
'ws:{workspaceId}:neurochat_user_memory_v1'    // Faits de mémoire utilisateur

// Documents RAG
'ws:{workspaceId}:rag_user_docs'               // Documents utilisateur
'ws:{workspaceId}:rag_doc_stats'               // Statistiques d'usage
'ws:{workspaceId}:rag_doc_favorites'           // Documents favoris

// Configurations utilisateur
'llm_provider'                                 // Fournisseur LLM sélectionné
'auto_rag_enabled'                             // Activation auto RAG
'auto_web_enabled'                             // Activation auto Web
'auto_rag_keywords'                            // Mots-clés RAG
'auto_web_keywords'                            // Mots-clés Web
'mode_enfant'                                  // Mode enfant
'mode_enfant_pin'                              // PIN mode enfant
'mode_prive'                                   // Mode privé
'nc_active_workspace'                          // Workspace actif
```

## 🏗️ Architecture Recommandée

### Option 1: SQLite + Backend Node.js (Recommandée)

**Avantages:**
- Base de données locale, pas de serveur externe requis
- Performance excellente pour les données locales
- Support SQL complet avec relations
- Facilité de déploiement
- Sauvegarde simple (fichier unique)

**Stack technique:**
```json
{
  "backend": {
    "runtime": "Node.js + Express",
    "database": "SQLite + better-sqlite3",
    "orm": "Drizzle ORM",
    "validation": "Zod",
    "api": "REST + tRPC (optionnel)"
  },
  "frontend": {
    "client": "React + TanStack Query",
    "state": "Zustand (remplacement localStorage)"
  }
}
```

### Option 2: IndexedDB + Dexie.js (Alternative)

**Avantages:**
- Reste côté client
- Pas de backend requis
- Stockage plus important que localStorage
- API moderne avec Promises

**Inconvénients:**
- Toujours limité au navigateur
- Pas de synchronisation multi-appareils
- API plus complexe

## 📊 Schéma de Base de Données

### Tables Principales

```sql
-- Workspaces
CREATE TABLE workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Discussions
CREATE TABLE discussions (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  title TEXT NOT NULL,
  child_mode BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

-- Messages
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  discussion_id TEXT NOT NULL,
  content TEXT NOT NULL,
  is_user BOOLEAN NOT NULL,
  image_url TEXT,
  memory_facts_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (discussion_id) REFERENCES discussions(id)
);

-- Sources des messages (RAG/Web)
CREATE TABLE message_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  message_id TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT,
  type TEXT CHECK(type IN ('rag', 'web')) NOT NULL,
  FOREIGN KEY (message_id) REFERENCES messages(id)
);

-- Système de mémoire
CREATE TABLE memory_items (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT, -- JSON array
  importance INTEGER CHECK(importance BETWEEN 1 AND 5),
  source TEXT CHECK(source IN ('user', 'assistant', 'system')),
  origin_message_id TEXT,
  embedding BLOB, -- Stockage binaire des embeddings
  disabled BOOLEAN DEFAULT FALSE,
  evidence_count INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
  FOREIGN KEY (origin_message_id) REFERENCES messages(id)
);

-- Documents RAG
CREATE TABLE rag_documents (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  origin TEXT CHECK(origin IN ('folder', 'user')) NOT NULL,
  extension TEXT,
  file_size INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

-- Statistiques d'usage des documents
CREATE TABLE document_stats (
  document_id TEXT PRIMARY KEY,
  use_count INTEGER DEFAULT 0,
  last_used_at DATETIME,
  is_favorite BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (document_id) REFERENCES rag_documents(id)
);

-- Configurations utilisateur
CREATE TABLE user_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workspace_id TEXT,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workspace_id, key),
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);

-- Presets de configuration
CREATE TABLE configuration_presets (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  name TEXT NOT NULL,
  config TEXT NOT NULL, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id)
);
```

### Index pour Performance

```sql
-- Index pour les requêtes fréquentes
CREATE INDEX idx_discussions_workspace ON discussions(workspace_id);
CREATE INDEX idx_messages_discussion ON messages(discussion_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_memory_workspace ON memory_items(workspace_id);
CREATE INDEX idx_memory_disabled ON memory_items(disabled);
CREATE INDEX idx_memory_importance ON memory_items(importance);
CREATE INDEX idx_rag_docs_workspace ON rag_documents(workspace_id);
CREATE INDEX idx_settings_workspace_key ON user_settings(workspace_id, key);

-- Index full-text pour la recherche
CREATE VIRTUAL TABLE messages_fts USING fts5(
  content,
  content=messages,
  content_rowid=rowid
);

CREATE VIRTUAL TABLE memory_fts USING fts5(
  content,
  tags,
  content=memory_items,
  content_rowid=rowid
);

CREATE VIRTUAL TABLE documents_fts USING fts5(
  title,
  content,
  content=rag_documents,
  content_rowid=rowid
);
```

## 🚀 Plan de Migration

### Phase 1: Infrastructure Backend (Semaine 1-2)

1. **Setup du backend**
   ```bash
   # Créer le dossier backend
   mkdir backend
   cd backend
   npm init -y
   
   # Installer les dépendances
   npm install express cors helmet morgan compression
   npm install better-sqlite3 drizzle-orm drizzle-kit
   npm install zod @types/express
   npm install -D @types/node @types/better-sqlite3 tsx nodemon
   ```

2. **Configuration Drizzle ORM**
   ```typescript
   // backend/src/db/schema.ts
   import { sqliteTable, text, integer, blob, real } from 'drizzle-orm/sqlite-core';
   
   export const workspaces = sqliteTable('workspaces', {
     id: text('id').primaryKey(),
     name: text('name').notNull(),
     description: text('description'),
     createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
     updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
   });
   
   // ... autres tables
   ```

3. **API Routes**
   ```typescript
   // backend/src/routes/discussions.ts
   import { Router } from 'express';
   import { z } from 'zod';
   
   const router = Router();
   
   // GET /api/discussions/:workspaceId
   router.get('/:workspaceId', async (req, res) => {
     // Logique de récupération
   });
   
   // POST /api/discussions
   router.post('/', async (req, res) => {
     // Logique de création
   });
   
   export default router;
   ```

### Phase 2: Services de Migration (Semaine 2-3)

1. **Service de migration des données**
   ```typescript
   // src/services/migration.ts
   export class DataMigrationService {
     async migrateFromLocalStorage(): Promise<void> {
       // 1. Extraire toutes les données localStorage
       const localData = this.extractLocalStorageData();
       
       // 2. Transformer au format base de données
       const dbData = this.transformToDbFormat(localData);
       
       // 3. Insérer en base via API
       await this.insertToDatabase(dbData);
       
       // 4. Vérifier l'intégrité
       const isValid = await this.validateMigration();
       
       if (isValid) {
         // 5. Nettoyer localStorage (optionnel)
         this.cleanupLocalStorage();
       }
     }
   }
   ```

2. **Nouveaux services de données**
   ```typescript
   // src/services/api/discussions.ts
   export class DiscussionsService {
     async getDiscussions(workspaceId: string): Promise<Discussion[]> {
       const response = await fetch(`/api/discussions/${workspaceId}`);
       return response.json();
     }
     
     async createDiscussion(discussion: CreateDiscussionDto): Promise<Discussion> {
       const response = await fetch('/api/discussions', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(discussion)
       });
       return response.json();
     }
   }
   ```

### Phase 3: Refactoring Frontend (Semaine 3-4)

1. **Remplacement des hooks localStorage**
   ```typescript
   // Avant
   const [discussions, setDiscussions] = useState(() => {
     const saved = localStorage.getItem('discussions');
     return saved ? JSON.parse(saved) : [];
   });
   
   // Après
   const { data: discussions, isLoading } = useQuery({
     queryKey: ['discussions', workspaceId],
     queryFn: () => discussionsService.getDiscussions(workspaceId)
   });
   ```

2. **Store Zustand pour l'état global**
   ```typescript
   // src/stores/appStore.ts
   import { create } from 'zustand';
   
   interface AppState {
     currentWorkspace: string;
     isOnline: boolean;
     setCurrentWorkspace: (id: string) => void;
   }
   
   export const useAppStore = create<AppState>((set) => ({
     currentWorkspace: 'default',
     isOnline: navigator.onLine,
     setCurrentWorkspace: (id) => set({ currentWorkspace: id }),
   }));
   ```

### Phase 4: Fonctionnalités Avancées (Semaine 4-5)

1. **Recherche full-text**
   ```sql
   -- Recherche dans les messages
   SELECT m.*, d.title as discussion_title
   FROM messages_fts mf
   JOIN messages m ON m.rowid = mf.rowid
   JOIN discussions d ON d.id = m.discussion_id
   WHERE messages_fts MATCH ?
   ORDER BY rank;
   ```

2. **Synchronisation hors-ligne**
   ```typescript
   // Service Worker pour cache offline
   // Queue des mutations en attente
   // Synchronisation automatique au retour en ligne
   ```

3. **Sauvegarde et export**
   ```typescript
   // Export complet de workspace
   // Import depuis fichier de sauvegarde
   // Synchronisation cloud (optionnel)
   ```

## 📦 Dépendances à Ajouter

### Backend
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "compression": "^1.7.4",
    "better-sqlite3": "^9.2.2",
    "drizzle-orm": "^0.29.1",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "drizzle-kit": "^0.20.6",
    "tsx": "^4.6.2",
    "nodemon": "^3.0.2",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/better-sqlite3": "^7.6.8"
  }
}
```

### Frontend
```json
{
  "dependencies": {
    "@tanstack/react-query": "^5.17.0",
    "zustand": "^4.4.7",
    "axios": "^1.6.2"
  }
}
```

## 🔧 Configuration de Développement

### Scripts package.json
```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "vite",
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "cd backend && npm run build",
    "build:frontend": "tsc -b && vite build",
    "db:generate": "cd backend && drizzle-kit generate:sqlite",
    "db:migrate": "cd backend && npm run migrate",
    "db:studio": "cd backend && drizzle-kit studio"
  }
}
```

### Variables d'environnement
```env
# Backend (.env)
PORT=3001
DB_PATH=./data/neurochat.db
NODE_ENV=development

# Frontend (.env)
VITE_API_URL=http://localhost:3001/api
```

## 🎯 Bénéfices Attendus

### Performance
- ✅ **Requêtes optimisées** avec index SQL
- ✅ **Recherche full-text** native
- ✅ **Pagination** efficace
- ✅ **Cache intelligent** côté client

### Fonctionnalités
- ✅ **Relations complexes** entre données
- ✅ **Recherche avancée** multi-critères
- ✅ **Statistiques détaillées** d'usage
- ✅ **Sauvegarde/restauration** complète

### Scalabilité
- ✅ **Stockage illimité** (dans les limites du disque)
- ✅ **Multi-utilisateurs** (préparation)
- ✅ **Synchronisation** multi-appareils (future)
- ✅ **API extensible** pour nouvelles fonctionnalités

### Sécurité
- ✅ **Validation** stricte des données
- ✅ **Chiffrement** des données sensibles
- ✅ **Audit trail** des modifications
- ✅ **Sauvegarde** automatique

## 🚨 Considérations de Migration

### Compatibilité Descendante
- Maintenir le support localStorage en parallèle pendant la transition
- Migration progressive par workspace
- Rollback possible en cas de problème

### Gestion des Erreurs
- Validation des données avant migration
- Logs détaillés du processus
- Interface de monitoring de la migration

### Performance
- Migration en arrière-plan
- Indicateur de progression
- Pas de blocage de l'interface utilisateur

## 📅 Timeline Estimée

| Phase | Durée | Tâches Principales |
|-------|-------|-------------------|
| **Phase 1** | 1-2 semaines | Setup backend, schéma DB, API de base |
| **Phase 2** | 1-2 semaines | Services migration, transformation données |
| **Phase 3** | 1-2 semaines | Refactoring frontend, nouveaux hooks |
| **Phase 4** | 1 semaine | Fonctionnalités avancées, tests |
| **Phase 5** | 1 semaine | Documentation, déploiement |

**Total estimé: 5-8 semaines** selon la complexité et les ressources disponibles.

---

*Cette migration représente une évolution majeure qui transformera NeuroChat-IA-v2 d'une application web simple vers une solution robuste et scalable, prête pour de futures fonctionnalités avancées comme la synchronisation multi-appareils et la collaboration.*