import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { setupDatabase } from './database/setup.js';
import conversationRoutes from './routes/conversations.js';
import authRoutes from './routes/auth.js';
import { authenticateToken } from './middleware/auth.js';

// Configuration des variables d'environnement
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ========================================================================================
// CONFIGURATION DE SÉCURITÉ
// ========================================================================================

// Protection contre les attaques courantes
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Configuration CORS sécurisée
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Limitation du taux de requêtes (anti-spam)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite par IP
  message: {
    error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ========================================================================================
// MIDDLEWARE
// ========================================================================================

// Compression des réponses
app.use(compression());

// Logging des requêtes
app.use(morgan('combined'));

// Parsing des corps de requête
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========================================================================================
// ROUTES PUBLIQUES
// ========================================================================================

// Route de santé
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'NeuroChat Backend API',
    version: '1.0.0'
  });
});

// Routes d'authentification (publiques)
app.use('/api/auth', authRoutes);

// ========================================================================================
// ROUTES PROTÉGÉES
// ========================================================================================

// Middleware d'authentification pour toutes les routes protégées
app.use('/api/conversations', authenticateToken, conversationRoutes);

// ========================================================================================
// GESTION DES ERREURS
// ========================================================================================

// Gestion des routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.originalUrl,
    method: req.method
  });
});

// Gestionnaire d'erreurs global
app.use((error, req, res, next) => {
  console.error('Erreur serveur:', error);
  
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Erreur interne du serveur';
  
  res.status(statusCode).json({
    error: message,
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
});

// ========================================================================================
// DÉMARRAGE DU SERVEUR
// ========================================================================================

async function startServer() {
  try {
    // Initialisation de la base de données
    await setupDatabase();
    console.log('✅ Base de données initialisée avec succès');
    
    // Démarrage du serveur
    app.listen(PORT, () => {
      console.log(`🚀 Serveur NeuroChat démarré sur le port ${PORT}`);
      console.log(`📊 Interface de santé: http://localhost:${PORT}/health`);
      console.log(`🔐 API sécurisée: http://localhost:${PORT}/api/`);
    });
  } catch (error) {
    console.error('❌ Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
}

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
  console.log('🛑 Arrêt gracieux du serveur...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Arrêt gracieux du serveur...');
  process.exit(0);
});

startServer();
