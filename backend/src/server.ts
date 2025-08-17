import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Routes
import discussionsRouter from './routes/discussions.js';
import memoryRouter from './routes/memory.js';
import ragRouter from './routes/rag.js';
import settingsRouter from './routes/settings.js';

// Services
import { MigrationService } from './services/migrationService.js';
import { db, closeDatabase, initializeDatabase } from './db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Initialize database
await initializeDatabase();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Configuration CORS
const corsOptions = {
  origin: NODE_ENV === 'production' 
    ? ['http://localhost:3000', 'http://localhost:5173'] // Ajuster selon vos domaines de production
    : true, // Permettre toutes les origines en développement
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 100 : 1000, // Plus restrictif en production
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting spécifique pour les uploads
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'production' ? 10 : 50,
  message: {
    error: 'Trop d\'uploads depuis cette IP, veuillez réessayer plus tard.',
  },
});

// Middlewares globaux
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Nécessaire pour certaines fonctionnalités frontend
}));
app.use(cors(corsOptions));
app.use(compression());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Créer le dossier uploads s'il n'existe pas
const uploadsDir = join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware de logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
    database: 'connected',
  });
});

// API Info
app.get('/api', (req, res) => {
  res.json({
    name: 'NeuroChat Database API',
    version: '1.0.0',
    description: 'API pour la gestion des données NeuroChat',
    endpoints: {
      discussions: '/api/discussions',
      memory: '/api/memory',
      rag: '/api/rag',
      settings: '/api/settings',
    },
    documentation: '/api/docs',
  });
});

// Documentation simple
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'NeuroChat Database API Documentation',
    version: '1.0.0',
    endpoints: {
      discussions: {
        'GET /api/discussions/:workspaceId': 'Récupérer les discussions',
        'POST /api/discussions': 'Créer une discussion',
        'PUT /api/discussions/:discussionId': 'Mettre à jour une discussion',
        'DELETE /api/discussions/:discussionId': 'Supprimer une discussion',
        'GET /api/discussions/:discussionId/messages': 'Récupérer les messages',
        'POST /api/discussions/:discussionId/messages': 'Ajouter un message',
      },
      memory: {
        'GET /api/memory/:workspaceId': 'Récupérer la mémoire',
        'POST /api/memory': 'Ajouter un élément de mémoire',
        'PUT /api/memory/:memoryId': 'Mettre à jour un élément',
        'DELETE /api/memory/:memoryId': 'Supprimer un élément',
        'POST /api/memory/:workspaceId/search': 'Rechercher dans la mémoire',
      },
      rag: {
        'GET /api/rag/:workspaceId': 'Récupérer les documents RAG',
        'POST /api/rag/upload': 'Uploader un document',
        'POST /api/rag': 'Créer un document texte',
        'PUT /api/rag/:documentId': 'Mettre à jour un document',
        'DELETE /api/rag/:documentId': 'Supprimer un document',
        'POST /api/rag/:workspaceId/search': 'Rechercher dans les documents',
      },
      settings: {
        'GET /api/settings/:workspaceId': 'Récupérer les paramètres',
        'POST /api/settings': 'Créer un paramètre',
        'PUT /api/settings/:workspaceId/:key': 'Mettre à jour un paramètre',
        'DELETE /api/settings/:workspaceId/:key': 'Supprimer un paramètre',
        'GET /api/settings/:workspaceId/presets': 'Récupérer les presets',
      },
    },
  });
});

// Routes API
app.use('/api/discussions', discussionsRouter);
app.use('/api/memory', memoryRouter);
app.use('/api/rag', uploadLimiter, ragRouter); // Rate limiting spécial pour RAG (uploads)
app.use('/api/settings', settingsRouter);

// Route de migration
app.post('/api/migrate', async (req, res) => {
  try {
    const { localStorageData, workspaceId } = req.body;
    
    if (!localStorageData || !workspaceId) {
      return res.status(400).json({
        error: 'localStorageData et workspaceId sont requis',
      });
    }
    
    const migrationService = new MigrationService();
    const result = await migrationService.migrateFromLocalStorage(
      localStorageData
    );
    
    res.json({
      success: true,
      migrated: result,
      message: 'Migration terminée avec succès',
    });
  } catch (error) {
    console.error('Erreur migration:', error);
    res.status(500).json({
      error: 'Erreur lors de la migration',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
});

// Route de validation de migration
app.post('/api/migrate/validate', async (req, res) => {
  try {
    const { workspaceId } = req.body;
    
    if (!workspaceId) {
      return res.status(400).json({
        error: 'workspaceId est requis',
      });
    }
    
    const migrationService = new MigrationService();
    const validation = await migrationService.validateMigration();
    
    res.json({
      valid: validation.isValid,
      details: validation,
    });
  } catch (error) {
    console.error('Erreur validation migration:', error);
    res.status(500).json({
      error: 'Erreur lors de la validation',
      details: error instanceof Error ? error.message : 'Erreur inconnue',
    });
  }
});

// Middleware de gestion d'erreurs
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erreur serveur:', err);
  
  // Erreur de validation Multer
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'Fichier trop volumineux',
      maxSize: '10MB',
    });
  }
  
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Type de fichier non autorisé',
    });
  }
  
  // Erreur de parsing JSON
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'JSON invalide',
    });
  }
  
  // Erreur générique
  res.status(err.status || 500).json({
    error: NODE_ENV === 'production' 
      ? 'Erreur serveur interne'
      : err.message || 'Erreur inconnue',
    ...(NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// Route 404
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method,
  });
});

// Gestion propre de l'arrêt du serveur
process.on('SIGINT', async () => {
  console.log('\n🛑 Arrêt du serveur en cours...');
  
  try {
    await closeDatabase();
    console.log('✅ Base de données fermée proprement');
  } catch (error) {
    console.error('❌ Erreur fermeture base de données:', error);
  }
  
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Signal SIGTERM reçu, arrêt du serveur...');
  
  try {
    await closeDatabase();
    console.log('✅ Base de données fermée proprement');
  } catch (error) {
    console.error('❌ Erreur fermeture base de données:', error);
  }
  
  process.exit(0);
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('❌ Erreur non capturée:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesse rejetée non gérée:', reason);
  console.error('Promesse:', promise);
  process.exit(1);
});

// Démarrage du serveur
const server = app.listen(PORT, () => {
  console.log(`\n🚀 Serveur NeuroChat Database API démarré`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🌍 Environnement: ${NODE_ENV}`);
  console.log(`📚 Documentation: http://localhost:${PORT}/api/docs`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log(`\n📋 Endpoints disponibles:`);
  console.log(`   • Discussions: http://localhost:${PORT}/api/discussions`);
  console.log(`   • Mémoire: http://localhost:${PORT}/api/memory`);
  console.log(`   • Documents RAG: http://localhost:${PORT}/api/rag`);
  console.log(`   • Paramètres: http://localhost:${PORT}/api/settings`);
  console.log(`   • Migration: http://localhost:${PORT}/api/migrate`);
  console.log(`\n✨ Prêt à recevoir des requêtes!\n`);
});

// Configuration du timeout
server.timeout = 30000; // 30 secondes

export default app;