// Types pour PWA (Progressive Web App)

declare global {
  interface Window {
    // Service Worker
    serviceWorker?: ServiceWorkerContainer;
    
    // PWA Installation
    deferredPrompt?: BeforeInstallPromptEvent;
    
    // PWA Standalone
    standalone?: boolean;
    
    // PWA Meta
    __PWA_VERSION__?: string;
    __PWA_BUILD_TIME__?: string;
  }

  // Event d'installation PWA
  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
  }

  // Event d'installation d'application
  interface AppInstalledEvent extends Event {
    platform: string;
  }

  // Service Worker Message
  interface ServiceWorkerMessageEvent extends MessageEvent {
    data: {
      type: string;
      payload?: any;
    };
  }

  // PWA Display Mode
  type DisplayMode = 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';

  // PWA Installability
  interface PWAInstallability {
    isInstallable: boolean;
    isInstalled: boolean;
    canInstall: boolean;
    installPrompt?: BeforeInstallPromptEvent;
  }

  // PWA Cache
  interface PWACache {
    name: string;
    version: string;
    size: number;
    lastUpdated: Date;
  }

  // PWA Notification
  interface PWANotification {
    title: string;
    body?: string;
    icon?: string;
    badge?: string;
    tag?: string;
    data?: any;
    actions?: Array<{
      action: string;
      title: string;
      icon?: string;
    }>;
  }

  // PWA Shortcut
  interface PWAShortcut {
    name: string;
    short_name: string;
    description: string;
    url: string;
    icons?: Array<{
      src: string;
      sizes: string;
      type?: string;
    }>;
  }

  // PWA Manifest
  interface PWAManifest {
    name: string;
    short_name: string;
    description: string;
    start_url: string;
    display: DisplayMode;
    background_color: string;
    theme_color: string;
    orientation?: 'portrait' | 'landscape' | 'any';
    scope: string;
    lang?: string;
    dir?: 'ltr' | 'rtl' | 'auto';
    categories?: string[];
    icons: Array<{
      src: string;
      sizes: string;
      type: string;
      purpose?: 'any' | 'maskable' | 'monochrome';
    }>;
    screenshots?: Array<{
      src: string;
      sizes: string;
      type: string;
      form_factor?: 'narrow' | 'wide';
      label?: string;
    }>;
    shortcuts?: PWAShortcut[];
    related_applications?: Array<{
      platform: string;
      url: string;
      id?: string;
    }>;
    prefer_related_applications?: boolean;
    edge_side_panel?: {
      preferred_width: number;
    };
    launch_handler?: {
      client_mode: 'focus-existing' | 'navigate-existing' | 'navigate-new';
    };
  }

  // PWA State
  interface PWAState {
    isInstallable: boolean;
    isInstalled: boolean;
    isOnline: boolean;
    isUpdateAvailable: boolean;
    installPrompt: BeforeInstallPromptEvent | null;
    registration: ServiceWorkerRegistration | null;
    displayMode: DisplayMode;
    isStandalone: boolean;
  }

  // PWA Actions
  interface PWAActions {
    installApp: () => Promise<void>;
    updateApp: () => void;
    clearCache: () => Promise<void>;
    prefetchResources: (resources: string[]) => Promise<void>;
    triggerBackgroundSync: () => Promise<void>;
    requestNotificationPermission: () => Promise<boolean>;
    showNotification: (title: string, options?: NotificationOptions) => void;
  }

  // PWA Hook Return Type
  type UsePWAReturn = PWAState & PWAActions;

  // PWA Event Handlers
  interface PWAEventHandlers {
    onInstall?: () => void;
    onUpdate?: () => void;
    onOnline?: () => void;
    onOffline?: () => void;
    onNotificationClick?: (event: NotificationEvent) => void;
    onNotificationClose?: (event: NotificationEvent) => void;
  }

  // PWA Configuration
  interface PWAConfig {
    name: string;
    shortName: string;
    description: string;
    themeColor: string;
    backgroundColor: string;
    displayMode: DisplayMode;
    orientation: 'portrait' | 'landscape' | 'any';
    scope: string;
    startUrl: string;
    icons: Array<{
      src: string;
      sizes: string;
      type: string;
      purpose?: 'any' | 'maskable' | 'monochrome';
    }>;
    shortcuts?: PWAShortcut[];
    categories?: string[];
    lang?: string;
    dir?: 'ltr' | 'rtl' | 'auto';
  }

  // PWA Service Worker Events
  interface ServiceWorkerEvents {
    install: (event: ExtendableEvent) => void;
    activate: (event: ExtendableEvent) => void;
    fetch: (event: FetchEvent) => void;
    message: (event: ExtendableMessageEvent) => void;
    sync: (event: SyncEvent) => void;
    push: (event: PushEvent) => void;
    notificationclick: (event: NotificationEvent) => void;
    notificationclose: (event: NotificationEvent) => void;
  }

  // PWA Cache Strategies
  type CacheStrategy = 'cacheFirst' | 'networkFirst' | 'networkOnly' | 'staleWhileRevalidate';

  // PWA Cache Configuration
  interface PWACacheConfig {
    staticCache: string;
    dynamicCache: string;
    staticAssets: string[];
    dynamicPatterns: RegExp[];
    strategies: Record<string, CacheStrategy>;
  }

  // PWA Performance Metrics
  interface PWAPerformanceMetrics {
    installTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    firstInputDelay: number;
    cumulativeLayoutShift: number;
    timeToInteractive: number;
  }

  // PWA Analytics
  interface PWAAnalytics {
    trackInstall: () => void;
    trackUpdate: () => void;
    trackError: (error: Error) => void;
    trackPerformance: (metrics: PWAPerformanceMetrics) => void;
    trackUsage: (feature: string) => void;
  }
}

export {};
