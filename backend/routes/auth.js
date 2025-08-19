import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../database/setup.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'neurochat_jwt_secret_change_in_production';

// ========================================================================================
// ROUTES D'AUTHENTIFICATION
// ========================================================================================

/**
 * POST /api/auth/login
 * Connexion utilisateur
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validation des données
    if (!username || !password) {
      return res.status(400).json({
        error: 'Nom d\'utilisateur et mot de passe requis',
        code: 'MISSING_CREDENTIALS'
      });
    }
    
    const database = getDatabase();
    
    // Rechercher l'utilisateur
    const user = await new Promise((resolve, reject) => {
      database.get(
        'SELECT id, username, email, password_hash, is_active FROM users WHERE username = ? OR email = ?',
        [username, username],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    if (!user) {
      return res.status(401).json({
        error: 'Identifiants invalides',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    if (!user.is_active) {
      return res.status(401).json({
        error: 'Compte désactivé',
        code: 'ACCOUNT_DISABLED'
      });
    }
    
    // Vérifier le mot de passe
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Identifiants invalides',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Générer le token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Créer une session en base
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 jours
    
    await new Promise((resolve, reject) => {
      database.run(
        `INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?)`,
        [
          user.id,
          token,
          expiresAt.toISOString(),
          req.ip || req.connection.remoteAddress,
          req.get('User-Agent') || 'Unknown'
        ],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    // Mettre à jour la dernière connexion
    database.run(
      'UPDATE users SET last_login = datetime("now") WHERE id = ?',
      [user.id]
    );
    
    // Réponse avec le token et les infos utilisateur
    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        expiresAt: expiresAt.toISOString()
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;
    
    // Validation des données
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({
        error: 'Tous les champs sont requis',
        code: 'MISSING_FIELDS'
      });
    }
    
    if (password !== confirmPassword) {
      return res.status(400).json({
        error: 'Les mots de passe ne correspondent pas',
        code: 'PASSWORD_MISMATCH'
      });
    }
    
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Le mot de passe doit contenir au moins 8 caractères',
        code: 'PASSWORD_TOO_SHORT'
      });
    }
    
    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({
        error: 'Le nom d\'utilisateur doit contenir entre 3 et 50 caractères',
        code: 'USERNAME_INVALID_LENGTH'
      });
    }
    
    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Format d\'email invalide',
        code: 'INVALID_EMAIL'
      });
    }
    
    const database = getDatabase();
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await new Promise((resolve, reject) => {
      database.get(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [username, email],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    if (existingUser) {
      return res.status(409).json({
        error: 'Un utilisateur avec ce nom ou cet email existe déjà',
        code: 'USER_ALREADY_EXISTS'
      });
    }
    
    // Hasher le mot de passe
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Générer une clé de chiffrement unique
    const encryptionKey = `encryption_key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const encryptionKeyHash = await bcrypt.hash(encryptionKey, saltRounds);
    
    // Préférences par défaut
    const defaultPreferences = {
      theme: 'dark',
      language: 'fr',
      autoRagEnabled: true,
      autoWebEnabled: false,
      ttsEnabled: false
    };
    
    // Créer l'utilisateur
    const result = await new Promise((resolve, reject) => {
      database.run(
        `INSERT INTO users (username, email, password_hash, encryption_key_hash, preferences)
         VALUES (?, ?, ?, ?, ?)`,
        [
          username,
          email,
          passwordHash,
          encryptionKeyHash,
          JSON.stringify(defaultPreferences)
        ],
        function(err) {
          if (err) reject(err);
          else resolve({ id: this.lastID });
        }
      );
    });
    
    // Créer le dossier uploads pour l'utilisateur
    const fs = await import('fs');
    const uploadsDir = `./uploads/${result.id}`;
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: {
        id: result.id,
        username,
        email
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /api/auth/logout
 * Déconnexion utilisateur
 */
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      const database = getDatabase();
      
      // Supprimer la session
      await new Promise((resolve, reject) => {
        database.run(
          'DELETE FROM user_sessions WHERE session_token = ?',
          [token],
          function(err) {
            if (err) reject(err);
            else resolve();
          }
        );
      });
    }
    
    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
    
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/auth/me
 * Récupérer les informations de l'utilisateur connecté
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        error: 'Token d\'authentification manquant',
        code: 'MISSING_TOKEN'
      });
    }
    
    // Vérifier le token
    const decoded = jwt.verify(token, JWT_SECRET);
    const database = getDatabase();
    
    // Récupérer les informations utilisateur
    const user = await new Promise((resolve, reject) => {
      database.get(
        'SELECT id, username, email, created_at, last_login, preferences FROM users WHERE id = ? AND is_active = 1',
        [decoded.userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    if (!user) {
      return res.status(401).json({
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Parser les préférences
    let preferences = {};
    try {
      preferences = JSON.parse(user.preferences || '{}');
    } catch (e) {
      preferences = {};
    }
    
    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at,
        last_login: user.last_login,
        preferences
      }
    });
    
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token invalide ou expiré',
        code: 'INVALID_TOKEN'
      });
    }
    
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

/**
 * POST /api/auth/refresh
 * Renouveler le token JWT
 */
router.post('/refresh', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        error: 'Token d\'authentification manquant',
        code: 'MISSING_TOKEN'
      });
    }
    
    const database = getDatabase();
    
    // Vérifier que la session existe et n'est pas expirée
    const session = await new Promise((resolve, reject) => {
      database.get(
        'SELECT user_id FROM user_sessions WHERE session_token = ? AND expires_at > datetime("now")',
        [token],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    if (!session) {
      return res.status(401).json({
        error: 'Session expirée ou invalide',
        code: 'SESSION_EXPIRED'
      });
    }
    
    // Récupérer les informations utilisateur
    const user = await new Promise((resolve, reject) => {
      database.get(
        'SELECT id, username, email FROM users WHERE id = ? AND is_active = 1',
        [session.user_id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
    
    if (!user) {
      return res.status(401).json({
        error: 'Utilisateur non trouvé',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Générer un nouveau token
    const newToken = jwt.sign(
      { 
        userId: user.id, 
        username: user.username,
        email: user.email 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Mettre à jour la session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    await new Promise((resolve, reject) => {
      database.run(
        'UPDATE user_sessions SET session_token = ?, expires_at = ? WHERE session_token = ?',
        [newToken, expiresAt.toISOString(), token],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
    
    res.json({
      success: true,
      message: 'Token renouvelé avec succès',
      data: {
        token: newToken,
        expiresAt: expiresAt.toISOString()
      }
    });
    
  } catch (error) {
    console.error('Erreur lors du renouvellement du token:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
});

export default router;
