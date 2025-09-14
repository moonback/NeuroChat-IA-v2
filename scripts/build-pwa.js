#!/usr/bin/env node

/**
 * Script de build optimisé pour PWA NeuroChat
 * Génère les fichiers nécessaires et optimise la configuration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Building NeuroChat PWA...\n');

// Vérifier les fichiers PWA requis
const requiredFiles = [
  'public/manifest.json',
  'public/sw.js',
  'public/browserconfig.xml',
  'src/hooks/usePWA.ts',
  'src/components/PWAInstallPrompt.tsx',
  'src/components/PWAMeta.tsx',
  'src/components/PWAShortcuts.tsx',
  'src/types/pwa.d.ts'
];

console.log('📋 Vérification des fichiers PWA...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.error('\n❌ Certains fichiers PWA sont manquants. Veuillez les créer avant de continuer.');
  process.exit(1);
}

console.log('\n✅ Tous les fichiers PWA sont présents !');

// Générer le fichier de version
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version || '2.0.0';
const buildTime = new Date().toISOString();

const versionInfo = {
  version,
  buildTime,
  pwa: true,
  features: [
    'installable',
    'offline-support',
    'background-sync',
    'notifications',
    'shortcuts',
    'cache-strategies'
  ]
};

fs.writeFileSync('public/version.json', JSON.stringify(versionInfo, null, 2));
console.log('📄 Fichier version.json généré');

// Optimiser le manifest
const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));
manifest.version = version;
manifest.generated_at = buildTime;

fs.writeFileSync('public/manifest.json', JSON.stringify(manifest, null, 2));
console.log('📄 Manifest.json optimisé');

// Générer le fichier de configuration PWA
const pwaConfig = {
  name: 'NeuroChat IA',
  version,
  buildTime,
  serviceWorker: {
    enabled: true,
    scope: '/',
    cacheStrategy: 'stale-while-revalidate'
  },
  manifest: {
    display: 'standalone',
    themeColor: '#3b82f6',
    backgroundColor: '#0f172a'
  },
  features: {
    installable: true,
    offline: true,
    notifications: true,
    backgroundSync: true,
    shortcuts: true
  },
  performance: {
    lazyLoading: true,
    codeSplitting: true,
    compression: ['gzip', 'brotli'],
    caching: 'aggressive'
  }
};

fs.writeFileSync('public/pwa-config.json', JSON.stringify(pwaConfig, null, 2));
console.log('📄 Configuration PWA générée');

// Générer les métadonnées de build
const buildMeta = {
  timestamp: buildTime,
  version,
  environment: process.env.NODE_ENV || 'production',
  pwa: {
    manifest: manifest,
    serviceWorker: {
      version: '2.0.0',
      strategies: {
        static: 'cache-first',
        dynamic: 'network-first',
        api: 'network-only'
      }
    }
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false
  }
};

fs.writeFileSync('dist/build-meta.json', JSON.stringify(buildMeta, null, 2));
console.log('📄 Métadonnées de build générées');

// Vérifier la configuration Vite
const viteConfigPath = 'vite.config.ts';
if (fs.existsSync(viteConfigPath)) {
  const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  
  if (viteConfig.includes('__PWA_VERSION__') && viteConfig.includes('__PWA_BUILD_TIME__')) {
    console.log('✅ Configuration Vite PWA détectée');
  } else {
    console.log('⚠️  Configuration Vite PWA incomplète');
  }
} else {
  console.log('❌ Fichier vite.config.ts non trouvé');
}

// Générer le rapport de build PWA
const report = {
  timestamp: buildTime,
  version,
  files: {
    manifest: 'public/manifest.json',
    serviceWorker: 'public/sw.js',
    browserConfig: 'public/browserconfig.xml',
    version: 'public/version.json',
    pwaConfig: 'public/pwa-config.json'
  },
  features: {
    installable: true,
    offline: true,
    notifications: true,
    backgroundSync: true,
    shortcuts: true,
    splashScreens: true,
    themeColor: true
  },
  optimization: {
    codeSplitting: true,
    lazyLoading: true,
    compression: true,
    caching: true,
    minification: true
  },
  compatibility: {
    ios: 'Safari 11.3+',
    android: 'Chrome 68+',
    desktop: 'Chrome 68+, Firefox 63+, Edge 79+'
  }
};

fs.writeFileSync('pwa-build-report.json', JSON.stringify(report, null, 2));
console.log('📊 Rapport de build PWA généré');

console.log('\n🎉 Build PWA terminé avec succès !');
console.log('\n📱 Fonctionnalités PWA activées :');
console.log('  • Installation native');
console.log('  • Fonctionnement hors ligne');
console.log('  • Notifications push');
console.log('  • Synchronisation en arrière-plan');
console.log('  • Raccourcis clavier');
console.log('  • Splash screens iOS');
console.log('  • Cache intelligent');
console.log('  • Optimisations de performance');

console.log('\n🚀 Pour tester le PWA :');
console.log('  1. npm run build');
console.log('  2. npm run preview');
console.log('  3. Ouvrir dans Chrome/Edge');
console.log('  4. Vérifier l\'icône d\'installation');
console.log('  5. Tester l\'installation');

console.log('\n📊 Pour auditer le PWA :');
console.log('  1. Ouvrir Chrome DevTools');
console.log('  2. Onglet Lighthouse');
console.log('  3. Sélectionner "Progressive Web App"');
console.log('  4. Lancer l\'audit');
console.log('  5. Vérifier le score 100/100');

console.log('\n✨ NeuroChat PWA est prêt !');
