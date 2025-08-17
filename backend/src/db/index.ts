import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chemin vers la base de données SQLite
const dbPath = path.join(__dirname, '../../database.sqlite');

// Créer la connexion à la base de données
const sqlite = new Database(dbPath);

// Fonction d'initialisation de la base de données
export async function initializeDatabase() {
  try {
    // Optimisations SQLite
    sqlite.pragma('journal_mode = WAL');
    sqlite.pragma('synchronous = NORMAL');
    sqlite.pragma('cache_size = 1000000');
    sqlite.pragma('foreign_keys = ON');
    sqlite.pragma('temp_store = MEMORY');
    console.log('✅ Base de données SQLite initialisée avec succès');
  } catch (error) {
    console.error('❌ Erreur initialisation base de données:', error);
    throw error;
  }
}

// Créer l'instance Drizzle avec better-sqlite3
export const db = drizzle(sqlite, { schema });

// Fonction pour fermer la base de données proprement
export async function closeDatabase() {
  return new Promise<void>((resolve, reject) => {
    sqlite.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}