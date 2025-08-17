import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import fs from 'fs';

const db = new sqlite3.Database('./database.sqlite');
const run = promisify(db.run.bind(db));
const all = promisify(db.all.bind(db));

async function debugDatabase() {
  try {
    console.log('🔍 Checking database tables...');
    
    // Check if tables exist
    const tables = await all("SELECT name FROM sqlite_master WHERE type='table';");
    console.log('📋 Existing tables:', tables.map(t => t.name));
    
    if (tables.length === 0) {
      console.log('⚠️  No tables found. Applying migration manually...');
      
      // Read and apply migration
      const migrationSQL = fs.readFileSync('./drizzle/0000_marvelous_master_chief.sql', 'utf8');
      const statements = migrationSQL.split('--> statement-breakpoint');
      
      for (const statement of statements) {
        const cleanStatement = statement.trim();
        if (cleanStatement) {
          console.log('🔄 Executing:', cleanStatement.substring(0, 50) + '...');
          await run(cleanStatement);
        }
      }
      
      console.log('✅ Migration applied successfully!');
      
      // Check tables again
      const newTables = await all("SELECT name FROM sqlite_master WHERE type='table';");
      console.log('📋 Tables after migration:', newTables.map(t => t.name));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    db.close();
  }
}

debugDatabase();