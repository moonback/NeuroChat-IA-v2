import jwt from 'jsonwebtoken';
import { getDatabase } from '../database/setup.js';

const JWT_SECRET = process.env.JWT_SECRET || 'neurochat_jwt_secret_change_in_production';

// ========================================================================================
// MIDDLEWARE D'AUTHENTIFICATION
// ========================================================================================

/**
 * Middleware pour vérifier le token JWT
 */
export function authenticateToken(req, res, next) {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({
        error: 'Token d\'authentification manquant',
        code: 'MISSING_TOKEN'
      });
    }
    
    // Vérifier et décoder le token
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            error: 'Token expiré',
            code: 'TOKEN_EXPIRED'
          });
        }
        if (err.name === 'JsonWebTokenError') {
          return res.status(401).json({
            error: 'Token invalide',
            code: 'INVALID_TOKEN'
          });
        }
        return res.status(401).json({
          error: 'Erreur de validation du token',
          code: 'TOKEN_VALIDATION_ERROR'
        });
      }
      
      try {
        // Vérifier que l'utilisateur existe toujours en base
        const database = getDatabase();
        const user = await new Promise((resolve, reject) => {
          database.get(
            'SELECT id, username, email, is_active FROM users WHERE id = ? AND is_active = 1',
            [decoded.userId],
            (err, row) => {
              if (err) reject(err);
              else resolve(row);
            }
          );
        });
        
        if (!user) {
          return res.status(401).json({
            error: 'Utilisateur non trouvé ou désactivé',
            code: 'USER_NOT_FOUND'
          });
        }
        
        // Vérifier que la session est toujours valide
        const session = await new Promise((resolve, reject) => {
          database.get(
            'SELECT id FROM user_sessions WHERE user_id = ? AND session_token = ? AND expires_at > datetime("now")',
            [decoded.userId, token],
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
        
        // Mettre à jour l'activité de la session
        database.run(
          'UPDATE user_sessions SET last_activity = datetime("now") WHERE id = ?',
          [session.id]
        );
        
        // Ajouter les informations utilisateur à la requête
        req.user = {
          id: user.id,
          username: user.username,
          email: user.email
        };
        
        next();
        
      } catch (dbError) {
        console.error('Erreur base de données lors de l\'authentification:', dbError);
        return res.status(500).json({
          error: 'Erreur interne du serveur',
          code: 'INTERNAL_ERROR'
        });
      }
    });
    
  } catch (error) {
    console.error('Erreur middleware d\'authentification:', error);
    return res.status(500).json({
      error: 'Erreur interne du serveur',
      code: 'INTERNAL_ERROR'
    });
  }
}

/**
 * Middleware optionnel pour récupérer l'utilisateur si connecté
 */
export function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      req.user = null;
      return next();
    }
    
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        req.user = null;
        return next();
      }
      
      try {
        const database = getDatabase();
        const user = await new Promise((resolve, reject) => {
          database.get(
            'SELECT id, username, email FROM users WHERE id = ? AND is_active = 1',
            [decoded.userId],
            (err, row) => {
              if (err) reject(err);
              else resolve(row);
            }
          );
        });
        
        if (user) {
          req.user = {
            id: user.id,
            username: user.username,
            email: user.email
          };
        } else {
          req.user = null;
        }
        
        next();
        
      } catch (dbError) {
        req.user = null;
        next();
      }
    });
    
  } catch (error) {
    req.user = null;
    next();
  }
}

/**
 * Middleware pour vérifier les permissions administrateur
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentification requise',
      code: 'AUTH_REQUIRED'
    });
  }
  
  // Vérifier si l'utilisateur est admin (username = 'admin')
  if (req.user.username !== 'admin') {
    return res.status(403).json({
      error: 'Permissions administrateur requises',
      code: 'ADMIN_REQUIRED'
    });
  }
  
  next();
}

/**
 * Middleware pour vérifier la propriété des ressources
 */
export function requireOwnership(resourceType) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentification requise',
        code: 'AUTH_REQUIRED'
      });
    }
    
    try {
      const database = getDatabase();
      let resource;
      
      switch (resourceType) {
        case 'conversation':
          resource = await new Promise((resolve, reject) => {
            database.get(
              'SELECT user_id FROM conversations WHERE id = ?',
              [req.params.conversationId || req.params.id],
              (err, row) => {
                if (err) reject(err);
                else resolve(row);
              }
            );
          });
          break;
          
        case 'message':
          resource = await new Promise((resolve, reject) => {
            database.get(
              'SELECT c.user_id FROM messages m JOIN conversations c ON m.conversation_id = c.id WHERE m.id = ?',
              [req.params.messageId || req.params.id],
              (err, row) => {
                if (err) reject(err);
                else resolve(row);
              }
            );
          });
          break;
          
        default:
          return res.status(400).json({
            error: 'Type de ressource non supporté',
            code: 'UNSUPPORTED_RESOURCE_TYPE'
          });
      }
      
      if (!resource) {
        return res.status(404).json({
          error: 'Ressource non trouvée',
          code: 'RESOURCE_NOT_FOUND'
        });
      }
      
      if (resource.user_id !== req.user.id && req.user.username !== 'admin') {
        return res.status(403).json({
          error: 'Accès non autorisé à cette ressource',
          code: 'ACCESS_DENIED'
        });
      }
      
      next();
      
    } catch (error) {
      console.error('Erreur vérification propriété:', error);
      return res.status(500).json({
        error: 'Erreur interne du serveur',
        code: 'INTERNAL_ERROR'
      });
    }
  };
}
