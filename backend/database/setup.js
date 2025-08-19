import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '..', 'data', 'neurochat.db');

// ========================================================================================
// CONFIGURATION DE LA BASE DE DONNÉES
// ========================================================================================

let db;

/**
 * Initialise la connexion à la base de données
 */
function getDatabase() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Erreur de connexion à la base de données:', err.message);
        throw err;
      }
      console.log('✅ Connexion à la base de données SQLite établie');
      
      // Activer les contraintes de clés étrangères
      db.run('PRAGMA foreign_keys = ON');
      
      // Activer le mode WAL pour de meilleures performances
      db.run('PRAGMA journal_mode = WAL');
      
      // Optimiser la base de données
      db.run('PRAGMA optimize');
    });
  }
  return db;
}

/**
 * Crée les tables de la base de données
 */
async function createTables() {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    
    // Table des utilisateurs
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        encryption_key_hash VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME,
        is_active BOOLEAN DEFAULT 1,
        preferences TEXT
      )
    `;
    
    // Table des conversations
    const createConversationsTable = `
      CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        workspace_id VARCHAR(100) DEFAULT 'default',
        child_mode BOOLEAN DEFAULT 0,
        private_mode BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        message_count INTEGER DEFAULT 0,
        tags TEXT,
        metadata TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    
    // Table des messages
    const createMessagesTable = `
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        conversation_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        is_user BOOLEAN NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        message_order INTEGER NOT NULL,
        metadata TEXT,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
      )
    `;
    
    // Table des embeddings pour recherche sémantique
    const createEmbeddingsTable = `
      CREATE TABLE IF NOT EXISTS message_embeddings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message_id INTEGER NOT NULL,
        embedding_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
      )
    `;
    
    // Table des sessions utilisateur
    const createSessionsTable = `
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        user_agent TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;
    
    // Table des statistiques d'utilisation
    const createStatsTable = `
      CREATE TABLE IF NOT EXISTS usage_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date DATE NOT NULL,
        messages_sent INTEGER DEFAULT 0,
        messages_received INTEGER DEFAULT 0,
        conversations_created INTEGER DEFAULT 0,
        total_tokens INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, date)
      )
    `;
    
    // Création des tables dans l'ordre (dépendances)
    const tables = [
      { name: 'users', sql: createUsersTable },
      { name: 'conversations', sql: createConversationsTable },
      { name: 'messages', sql: createMessagesTable },
      { name: 'message_embeddings', sql: createEmbeddingsTable },
      { name: 'user_sessions', sql: createSessionsTable },
      { name: 'usage_stats', sql: createStatsTable }
    ];
    
    let completed = 0;
    const totalTables = tables.length;
    
    tables.forEach(({ name, sql }) => {
      database.run(sql, (err) => {
        if (err) {
          console.error(`❌ Erreur création table ${name}:`, err.message);
          reject(err);
          return;
        }
        
        completed++;
        console.log(`✅ Table ${name} créée/vérifiée`);
        
        if (completed === totalTables) {
          resolve();
        }
      });
    });
  });
}

/**
 * Crée un utilisateur administrateur par défaut
 */
async function createDefaultAdmin() {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    
    // Vérifier si l'admin existe déjà
    database.get('SELECT id FROM users WHERE username = ?', ['admin'], (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      
      if (row) {
        console.log('ℹ️ Utilisateur admin déjà existant');
        resolve();
        return;
      }
      
      // Créer l'admin par défaut
      const defaultPassword = 'admin123';
      const saltRounds = 12;
      
      bcrypt.hash(defaultPassword, saltRounds, (err, hash) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Clé de chiffrement par défaut (à changer en production)
        const defaultEncryptionKey = 'default_encryption_key_change_in_production';
        bcrypt.hash(defaultEncryptionKey, saltRounds, (err, encryptionHash) => {
          if (err) {
            reject(err);
            return;
          }
          
          const insertAdmin = `
            INSERT INTO users (username, email, password_hash, encryption_key_hash, preferences)
            VALUES (?, ?, ?, ?, ?)
          `;
          
          const preferences = JSON.stringify({
            theme: 'dark',
            language: 'fr',
            autoRagEnabled: true,
            autoWebEnabled: false,
            ttsEnabled: false
          });
          
          database.run(insertAdmin, [
            'admin',
            'admin@neurochat.local',
            hash,
            encryptionHash,
            preferences
          ], function(err) {
            if (err) {
              reject(err);
              return;
            }
            
            console.log('✅ Utilisateur admin créé avec succès');
            console.log('⚠️  ATTENTION: Changez le mot de passe par défaut en production!');
            resolve();
          });
        });
      });
    });
  });
}

/**
 * Crée les index pour optimiser les performances
 */
async function createIndexes() {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_conversations_workspace_id ON conversations(workspace_id)',
      'CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at)',
      'CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)',
      'CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp)',
      'CREATE INDEX IF NOT EXISTS idx_messages_order ON messages(conversation_id, message_order)',
      'CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token)',
      'CREATE INDEX IF NOT EXISTS idx_stats_user_date ON usage_stats(user_id, date)'
    ];
    
    let completed = 0;
    const totalIndexes = indexes.length;
    
    indexes.forEach((sql, index) => {
      database.run(sql, (err) => {
        if (err) {
          console.error(`❌ Erreur création index ${index}:`, err.message);
          reject(err);
          return;
        }
        
        completed++;
        if (completed === totalIndexes) {
          console.log('✅ Index de performance créés');
          resolve();
        }
      });
    });
  });
}

/**
 * Fonction principale d'initialisation
 */
export async function setupDatabase() {
  try {
    console.log('🗄️ Initialisation de la base de données...');
    
    // Créer le dossier data s'il n'existe pas
    const fs = await import('fs');
    const dataDir = join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
      console.log('📁 Dossier data créé');
    }
    
    // Créer les tables
    await createTables();
    
    // Créer les index
    await createIndexes();
    
    // Créer l'utilisateur admin par défaut
    await createDefaultAdmin();
    
    console.log('✅ Base de données initialisée avec succès');
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
}

/**
 * Ferme la connexion à la base de données
 */
export function closeDatabase() {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('❌ Erreur fermeture base de données:', err.message);
      } else {
        console.log('✅ Connexion à la base de données fermée');
      }
    });
  }
}

// Export de la fonction getDatabase pour utilisation dans d'autres modules
export { getDatabase };
