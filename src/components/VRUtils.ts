// Utilitaires pour le mode VR

export interface VRSupportInfo {
  isSupported: boolean;
  browser: string;
  hasVR: boolean;
  hasAR: boolean;
  error?: string;
}

/**
 * Vérifie le support VR/AR du navigateur
 */
export async function checkVRSupport(): Promise<VRSupportInfo> {
  const info: VRSupportInfo = {
    isSupported: false,
    browser: getBrowserInfo(),
    hasVR: false,
    hasAR: false
  };

  try {
    // Vérifier le support WebXR
    if ('xr' in navigator && navigator.xr) {
      // Vérifier le support VR
      try {
        info.hasVR = await navigator.xr.isSessionSupported('immersive-vr');
      } catch (error) {
        console.warn('Erreur lors de la vérification du support VR:', error);
      }

      // Vérifier le support AR
      try {
        info.hasAR = await navigator.xr.isSessionSupported('immersive-ar');
      } catch (error) {
        console.warn('Erreur lors de la vérification du support AR:', error);
      }

      info.isSupported = info.hasVR || info.hasAR;
    } else {
      info.error = 'WebXR non supporté par ce navigateur';
    }
  } catch (error) {
    info.error = `Erreur lors de la vérification: ${error}`;
  }

  return info;
}

/**
 * Détecte le navigateur utilisé
 */
function getBrowserInfo(): string {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Chrome')) {
    return 'Chrome';
  } else if (userAgent.includes('Edge')) {
    return 'Edge';
  } else if (userAgent.includes('Firefox')) {
    return 'Firefox';
  } else if (userAgent.includes('Safari')) {
    return 'Safari';
  } else {
    return 'Inconnu';
  }
}

/**
 * Gestionnaire d'erreurs VR
 */
export class VRErrorHandler {
  private static instance: VRErrorHandler;
  private errorLog: string[] = [];

  static getInstance(): VRErrorHandler {
    if (!VRErrorHandler.instance) {
      VRErrorHandler.instance = new VRErrorHandler();
    }
    return VRErrorHandler.instance;
  }

  logError(error: string, context?: string): void {
    const timestamp = new Date().toISOString();
    const errorMessage = `[${timestamp}] ${context ? `[${context}] ` : ''}${error}`;
    this.errorLog.push(errorMessage);
    console.error(errorMessage);
  }

  getErrorLog(): string[] {
    return [...this.errorLog];
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }
}

/**
 * Optimisations de performance pour VR
 */
export class VRPerformanceOptimizer {
  private static instance: VRPerformanceOptimizer;
  private frameRate = 60;
  private lastFrameTime = 0;

  static getInstance(): VRPerformanceOptimizer {
    if (!VRPerformanceOptimizer.instance) {
      VRPerformanceOptimizer.instance = new VRPerformanceOptimizer();
    }
    return VRPerformanceOptimizer.instance;
  }

  /**
   * Optimise le rendu pour maintenir 60 FPS
   */
  optimizeFrameRate(callback: () => void): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    const targetFrameTime = 1000 / this.frameRate;

    if (deltaTime >= targetFrameTime) {
      callback();
      this.lastFrameTime = currentTime;
    } else {
      requestAnimationFrame(() => this.optimizeFrameRate(callback));
    }
  }

  /**
   * Ajuste la qualité graphique selon les performances
   */
  adjustQuality(renderer: THREE.WebGLRenderer, scene: THREE.Scene): void {
    const fps = this.getCurrentFPS();
    
    if (fps < 30) {
      // Réduire la qualité
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));
      this.frameRate = 45;
    } else if (fps > 55) {
      // Augmenter la qualité
      renderer.setPixelRatio(window.devicePixelRatio);
      this.frameRate = 60;
    }
  }

  private getCurrentFPS(): number {
    // Implémentation simplifiée du calcul FPS
    return 60; // Valeur par défaut
  }
}

/**
 * Gestionnaire d'animations VR
 */
export class VRAnimationManager {
  private animations: Map<string, () => void> = new Map();
  private isRunning = false;

  addAnimation(id: string, animation: () => void): void {
    this.animations.set(id, animation);
  }

  removeAnimation(id: string): void {
    this.animations.delete(id);
  }

  start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.animate();
  }

  stop(): void {
    this.isRunning = false;
  }

  private animate(): void {
    if (!this.isRunning) return;

    // Exécuter toutes les animations
    this.animations.forEach(animation => animation());
    
    requestAnimationFrame(() => this.animate());
  }
}

/**
 * Utilitaires pour les contrôles VR
 */
export class VRControls {
  /**
   * Crée un bouton 3D interactif
   */
  static createButton(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    onClick: () => void
  ): THREE.Mesh {
    const button = new THREE.Mesh(geometry, material);
    
    // Ajouter des propriétés pour l'interactivité
    (button as any).isInteractive = true;
    (button as any).onClick = onClick;
    
    return button;
  }

  /**
   * Vérifie si un objet est cliqué
   */
  static isClicked(
    object: THREE.Object3D,
    raycaster: THREE.Raycaster,
    mouse: THREE.Vector2
  ): boolean {
    raycaster.setFromCamera(mouse, raycaster.camera);
    const intersects = raycaster.intersectObject(object);
    return intersects.length > 0;
  }
}

/**
 * Gestionnaire d'audio spatialisé
 */
export class VRAudioManager {
  private audioContext: AudioContext | null = null;
  private sources: Map<string, AudioBufferSourceNode> = new Map();

  async initialize(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'audio:', error);
    }
  }

  async playSpatialAudio(
    audioBuffer: ArrayBuffer,
    position: THREE.Vector3,
    listener: THREE.Object3D
  ): Promise<void> {
    if (!this.audioContext) return;

    try {
      const buffer = await this.audioContext.decodeAudioData(audioBuffer);
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Calculer la distance pour l'audio spatialisé
      const distance = position.distanceTo(listener.position);
      const volume = Math.max(0, 1 - distance / 10); // Volume diminue avec la distance
      gainNode.gain.value = volume;
      
      source.start();
      this.sources.set(source.id || Date.now().toString(), source);
      
      source.onended = () => {
        this.sources.delete(source.id || '');
      };
    } catch (error) {
      console.error('Erreur lors de la lecture audio:', error);
    }
  }

  stopAllAudio(): void {
    this.sources.forEach(source => {
      try {
        source.stop();
      } catch (error) {
        console.warn('Erreur lors de l\'arrêt audio:', error);
      }
    });
    this.sources.clear();
  }
} 