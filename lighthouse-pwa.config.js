/**
 * Configuration Lighthouse pour l'audit PWA de NeuroChat
 */

module.exports = {
  extends: 'lighthouse:default',
  settings: {
    onlyAudits: [
      // PWA Audits
      'installable-manifest',
      'service-worker',
      'splash-screen',
      'themed-omnibox',
      'content-width',
      'viewport',
      'apple-touch-icon',
      'maskable-icon',
      'offline-start-url',
      'works-offline',
      'redirects-http',
      'is-on-https',
      'uses-http2',
      'uses-passive-event-listeners',
      
      // Performance Audits
      'first-contentful-paint',
      'largest-contentful-paint',
      'first-meaningful-paint',
      'speed-index',
      'cumulative-layout-shift',
      'total-blocking-time',
      'max-potential-fid',
      'interactive',
      
      // Accessibility Audits
      'color-contrast',
      'image-alt',
      'label',
      'link-name',
      'list',
      'listitem',
      'heading-order',
      'html-has-lang',
      'html-lang-valid',
      'meta-viewport',
      'object-alt',
      'tabindex',
      'td-headers-attr',
      'th-has-data-cells',
      'valid-lang',
      
      // Best Practices Audits
      'is-on-https',
      'uses-https',
      'no-vulnerable-libraries',
      'no-document-write',
      'external-anchors-use-rel-noopener',
      'geolocation-on-start',
      'notification-on-start',
      'no-mixed-content',
      'deprecations',
      'password-inputs-can-be-pasted-into',
      'image-aspect-ratio',
      'offscreen-images',
      'render-blocking-resources',
      'unused-css-rules',
      'unused-javascript',
      'efficient-animated-content',
      'preload-lcp-image',
      'uses-text-compression',
      'uses-responsive-images',
      'uses-optimized-images',
      'uses-webp-images',
      'uses-rel-preconnect',
      'uses-rel-preload',
      'font-display',
      'unminified-css',
      'unminified-javascript',
      'minified-css',
      'minified-javascript',
      'uses-long-cache-ttl',
      'total-byte-weight',
      'uses-http2',
      'uses-passive-event-listeners'
    ],
    
    // Configuration spécifique PWA
    throttlingMethod: 'simulate',
    throttling: {
      rttMs: 40,
      throughputKbps: 10240,
      cpuSlowdownMultiplier: 1,
      requestLatencyMs: 0,
      downloadThroughputKbps: 0,
      uploadThroughputKbps: 0
    },
    
    // Configuration des audits
    skipAudits: [
      'canonical',
      'robots-txt',
      'structured-data'
    ],
    
    // Configuration des catégories
    categories: {
      pwa: {
        weight: 1,
        auditRefs: [
          { id: 'installable-manifest', weight: 1 },
          { id: 'service-worker', weight: 1 },
          { id: 'splash-screen', weight: 1 },
          { id: 'themed-omnibox', weight: 1 },
          { id: 'content-width', weight: 1 },
          { id: 'viewport', weight: 1 },
          { id: 'apple-touch-icon', weight: 1 },
          { id: 'maskable-icon', weight: 1 },
          { id: 'offline-start-url', weight: 1 },
          { id: 'works-offline', weight: 1 },
          { id: 'redirects-http', weight: 1 },
          { id: 'is-on-https', weight: 1 },
          { id: 'uses-http2', weight: 1 },
          { id: 'uses-passive-event-listeners', weight: 1 }
        ]
      },
      performance: {
        weight: 0.3,
        auditRefs: [
          { id: 'first-contentful-paint', weight: 1 },
          { id: 'largest-contentful-paint', weight: 1 },
          { id: 'first-meaningful-paint', weight: 1 },
          { id: 'speed-index', weight: 1 },
          { id: 'cumulative-layout-shift', weight: 1 },
          { id: 'total-blocking-time', weight: 1 },
          { id: 'max-potential-fid', weight: 1 },
          { id: 'interactive', weight: 1 }
        ]
      },
      accessibility: {
        weight: 0.2,
        auditRefs: [
          { id: 'color-contrast', weight: 1 },
          { id: 'image-alt', weight: 1 },
          { id: 'label', weight: 1 },
          { id: 'link-name', weight: 1 },
          { id: 'list', weight: 1 },
          { id: 'listitem', weight: 1 },
          { id: 'heading-order', weight: 1 },
          { id: 'html-has-lang', weight: 1 },
          { id: 'html-lang-valid', weight: 1 },
          { id: 'meta-viewport', weight: 1 },
          { id: 'object-alt', weight: 1 },
          { id: 'tabindex', weight: 1 },
          { id: 'td-headers-attr', weight: 1 },
          { id: 'th-has-data-cells', weight: 1 },
          { id: 'valid-lang', weight: 1 }
        ]
      },
      'best-practices': {
        weight: 0.2,
        auditRefs: [
          { id: 'is-on-https', weight: 1 },
          { id: 'uses-https', weight: 1 },
          { id: 'no-vulnerable-libraries', weight: 1 },
          { id: 'no-document-write', weight: 1 },
          { id: 'external-anchors-use-rel-noopener', weight: 1 },
          { id: 'geolocation-on-start', weight: 1 },
          { id: 'notification-on-start', weight: 1 },
          { id: 'no-mixed-content', weight: 1 },
          { id: 'deprecations', weight: 1 },
          { id: 'password-inputs-can-be-pasted-into', weight: 1 },
          { id: 'image-aspect-ratio', weight: 1 },
          { id: 'offscreen-images', weight: 1 },
          { id: 'render-blocking-resources', weight: 1 },
          { id: 'unused-css-rules', weight: 1 },
          { id: 'unused-javascript', weight: 1 },
          { id: 'efficient-animated-content', weight: 1 },
          { id: 'preload-lcp-image', weight: 1 },
          { id: 'uses-text-compression', weight: 1 },
          { id: 'uses-responsive-images', weight: 1 },
          { id: 'uses-optimized-images', weight: 1 },
          { id: 'uses-webp-images', weight: 1 },
          { id: 'uses-rel-preconnect', weight: 1 },
          { id: 'uses-rel-preload', weight: 1 },
          { id: 'font-display', weight: 1 },
          { id: 'unminified-css', weight: 1 },
          { id: 'unminified-javascript', weight: 1 },
          { id: 'minified-css', weight: 1 },
          { id: 'minified-javascript', weight: 1 },
          { id: 'uses-long-cache-ttl', weight: 1 },
          { id: 'total-byte-weight', weight: 1 },
          { id: 'uses-http2', weight: 1 },
          { id: 'uses-passive-event-listeners', weight: 1 }
        ]
      }
    }
  }
};
