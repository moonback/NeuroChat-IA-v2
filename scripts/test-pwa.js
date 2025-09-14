#!/usr/bin/env node

/**
 * Script de test PWA pour NeuroChat
 * Vérifie que toutes les fonctionnalités PWA fonctionnent correctement
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing NeuroChat PWA...\n');

// Configuration des tests
const tests = [
  {
    name: 'Manifest JSON',
    file: 'public/manifest.json',
    validator: (content) => {
      try {
        const manifest = JSON.parse(content);
        const required = ['name', 'short_name', 'start_url', 'display', 'icons'];
        const missing = required.filter(field => !manifest[field]);
        
        if (missing.length > 0) {
          throw new Error(`Champs manquants: ${missing.join(', ')}`);
        }
        
        if (!manifest.icons || manifest.icons.length === 0) {
          throw new Error('Aucune icône définie');
        }
        
        return true;
      } catch (error) {
        throw new Error(`Manifest invalide: ${error.message}`);
      }
    }
  },
  {
    name: 'Service Worker',
    file: 'public/sw.js',
    validator: (content) => {
      const required = [
        'addEventListener',
        'install',
        'activate',
        'fetch',
        'CACHE_NAME'
      ];
      
      const missing = required.filter(feature => !content.includes(feature));
      
      if (missing.length > 0) {
        throw new Error(`Fonctionnalités manquantes: ${missing.join(', ')}`);
      }
      
      return true;
    }
  },
  {
    name: 'Browser Config',
    file: 'public/browserconfig.xml',
    validator: (content) => {
      if (!content.includes('browserconfig') || !content.includes('msapplication')) {
        throw new Error('Configuration Microsoft invalide');
      }
      return true;
    }
  },
  {
    name: 'PWA Hook',
    file: 'src/hooks/usePWA.ts',
    validator: (content) => {
      const required = [
        'usePWA',
        'isInstallable',
        'isInstalled',
        'installApp',
        'updateApp'
      ];
      
      const missing = required.filter(feature => !content.includes(feature));
      
      if (missing.length > 0) {
        throw new Error(`Fonctionnalités manquantes: ${missing.join(', ')}`);
      }
      
      return true;
    }
  },
  {
    name: 'PWA Install Prompt',
    file: 'src/components/PWAInstallPrompt.tsx',
    validator: (content) => {
      const required = [
        'PWAInstallPrompt',
        'isInstallable',
        'isInstalled',
        'installApp'
      ];
      
      const missing = required.filter(feature => !content.includes(feature));
      
      if (missing.length > 0) {
        throw new Error(`Fonctionnalités manquantes: ${missing.join(', ')}`);
      }
      
      return true;
    }
  },
  {
    name: 'PWA Meta',
    file: 'src/components/PWAMeta.tsx',
    validator: (content) => {
      const required = [
        'PWAMeta',
        'usePWA',
        'document.title',
        'theme-color'
      ];
      
      const missing = required.filter(feature => !content.includes(feature));
      
      if (missing.length > 0) {
        throw new Error(`Fonctionnalités manquantes: ${missing.join(', ')}`);
      }
      
      return true;
    }
  },
  {
    name: 'PWA Shortcuts',
    file: 'src/components/PWAShortcuts.tsx',
    validator: (content) => {
      const required = [
        'PWAShortcuts',
        'keydown',
        'beforeinstallprompt',
        'serviceWorker'
      ];
      
      const missing = required.filter(feature => !content.includes(feature));
      
      if (missing.length > 0) {
        throw new Error(`Fonctionnalités manquantes: ${missing.join(', ')}`);
      }
      
      return true;
    }
  },
  {
    name: 'PWA Types',
    file: 'src/types/pwa.d.ts',
    validator: (content) => {
      const required = [
        'PWAState',
        'PWAActions',
        'UsePWAReturn',
        'BeforeInstallPromptEvent'
      ];
      
      const missing = required.filter(feature => !content.includes(feature));
      
      if (missing.length > 0) {
        throw new Error(`Types manquants: ${missing.join(', ')}`);
      }
      
      return true;
    }
  },
  {
    name: 'HTML Meta Tags',
    file: 'index.html',
    validator: (content) => {
      const required = [
        'manifest.json',
        'theme-color',
        'viewport',
        'apple-mobile-web-app',
        'preconnect'
      ];
      
      const missing = required.filter(feature => !content.includes(feature));
      
      if (missing.length > 0) {
        throw new Error(`Métadonnées manquantes: ${missing.join(', ')}`);
      }
      
      return true;
    }
  },
  {
    name: 'Vite Config PWA',
    file: 'vite.config.ts',
    validator: (content) => {
      const required = [
        '__PWA_VERSION__',
        '__PWA_BUILD_TIME__',
        'target: \'esnext\'',
        'minify: \'terser\''
      ];
      
      const missing = required.filter(feature => !content.includes(feature));
      
      if (missing.length > 0) {
        throw new Error(`Configuration manquante: ${missing.join(', ')}`);
      }
      
      return true;
    }
  }
];

// Fonction pour exécuter les tests
function runTests() {
  let passed = 0;
  let failed = 0;
  const results = [];

  console.log('🔍 Exécution des tests PWA...\n');

  tests.forEach(test => {
    try {
      if (!fs.existsSync(test.file)) {
        throw new Error(`Fichier non trouvé: ${test.file}`);
      }

      const content = fs.readFileSync(test.file, 'utf8');
      test.validator(content);
      
      console.log(`✅ ${test.name}`);
      passed++;
      results.push({ name: test.name, status: 'PASS', error: null });
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      failed++;
      results.push({ name: test.name, status: 'FAIL', error: error.message });
    }
  });

  console.log(`\n📊 Résultats des tests:`);
  console.log(`  ✅ Réussis: ${passed}`);
  console.log(`  ❌ Échoués: ${failed}`);
  console.log(`  📈 Taux de réussite: ${Math.round((passed / (passed + failed)) * 100)}%`);

  // Générer le rapport de test
  const report = {
    timestamp: new Date().toISOString(),
    total: tests.length,
    passed,
    failed,
    successRate: Math.round((passed / (passed + failed)) * 100),
    results
  };

  fs.writeFileSync('pwa-test-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Rapport de test généré: pwa-test-report.json');

  return { passed, failed, results };
}

// Fonction pour vérifier les bonnes pratiques PWA
function checkBestPractices() {
  console.log('\n🎯 Vérification des bonnes pratiques PWA...\n');

  const practices = [
    {
      name: 'HTTPS Ready',
      check: () => {
        // Vérifier que l'application est prête pour HTTPS
        const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
        return viteConfig.includes('https: false') || viteConfig.includes('https: true');
      }
    },
    {
      name: 'Compression Enabled',
      check: () => {
        const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
        return viteConfig.includes('compression') && viteConfig.includes('brotliCompress');
      }
    },
    {
      name: 'Code Splitting',
      check: () => {
        const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
        return viteConfig.includes('manualChunks');
      }
    },
    {
      name: 'Minification',
      check: () => {
        const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
        return viteConfig.includes('minify: \'terser\'');
      }
    },
    {
      name: 'Icons Present',
      check: () => {
        const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));
        return manifest.icons && manifest.icons.length > 0;
      }
    },
    {
      name: 'Theme Color Set',
      check: () => {
        const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));
        return manifest.theme_color && manifest.background_color;
      }
    },
    {
      name: 'Start URL Valid',
      check: () => {
        const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));
        return manifest.start_url === '/' || manifest.start_url.startsWith('/');
      }
    },
    {
      name: 'Display Mode Set',
      check: () => {
        const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));
        return ['standalone', 'fullscreen', 'minimal-ui'].includes(manifest.display);
      }
    }
  ];

  let practicesPassed = 0;
  practices.forEach(practice => {
    try {
      if (practice.check()) {
        console.log(`✅ ${practice.name}`);
        practicesPassed++;
      } else {
        console.log(`❌ ${practice.name}`);
      }
    } catch (error) {
      console.log(`❌ ${practice.name}: ${error.message}`);
    }
  });

  console.log(`\n📊 Bonnes pratiques: ${practicesPassed}/${practices.length}`);

  return practicesPassed;
}

// Fonction principale
function main() {
  const testResults = runTests();
  const practicesResults = checkBestPractices();

  console.log('\n🎉 Tests PWA terminés !');
  
  if (testResults.failed === 0) {
    console.log('✨ Tous les tests PWA ont réussi !');
  } else {
    console.log('⚠️  Certains tests PWA ont échoué. Vérifiez les erreurs ci-dessus.');
  }

  if (practicesResults >= 6) {
    console.log('🏆 Bonnes pratiques PWA respectées !');
  } else {
    console.log('📚 Améliorez les bonnes pratiques PWA pour une meilleure expérience.');
  }

  console.log('\n🚀 Pour tester l\'installation PWA :');
  console.log('  1. npm run build:pwa');
  console.log('  2. npm run preview');
  console.log('  3. Ouvrir dans Chrome/Edge');
  console.log('  4. Vérifier l\'icône d\'installation');

  console.log('\n📊 Pour auditer avec Lighthouse :');
  console.log('  1. npm run pwa:audit');
  console.log('  2. Ou utiliser Chrome DevTools > Lighthouse');

  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Exécuter les tests
main();
