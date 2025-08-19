#!/usr/bin/env node

/**
 * 🗄️ Script de configuration de la base de données - NeuroChat Backend
 * 
 * Ce script initialise la base de données SQLite avec toutes les tables nécessaires
 * et crée un utilisateur administrateur par défaut.
 */

import { setupDatabase } from '../database/setup.js';

console.log('🗄️ Initialisation de la base de données NeuroChat...\n');

try {
  await setupDatabase();
  console.log('\n✅ Base de données initialisée avec succès !');
  console.log('\n📋 Informations de connexion :');
  console.log('   - Username: admin');
  console.log('   - Password: admin123');
  console.log('   - ⚠️  ATTENTION: Changez ces identifiants en production !');
  console.log('\n🚀 Vous pouvez maintenant démarrer le serveur avec :');
  console.log('   npm run dev');
  
  process.exit(0);
} catch (error) {
  console.error('\n❌ Erreur lors de l\'initialisation :', error.message);
  process.exit(1);
}
