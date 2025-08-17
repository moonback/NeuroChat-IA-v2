import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db, closeDatabase, initializeDatabase } from '../db/index.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigrations() {
  try {
    console.log('🔄 Initialisation de la base de données...');
    await initializeDatabase();
    
    console.log('🔄 Démarrage des migrations de base de données...');
    
    const migrationsFolder = join(__dirname, '../../drizzle');
    
    await migrate(db, migrationsFolder);
    
    console.log('✅ Migrations terminées avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors des migrations:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
    console.log('🔒 Connexion à la base de données fermée.');
  }
}

// Exécuter les migrations si ce script est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

export { runMigrations };