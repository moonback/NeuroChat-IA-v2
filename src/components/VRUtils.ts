// Utilitaires pour le mode VR
import * as THREE from 'three';

export interface VRSupportInfo {
  isSupported: boolean;
  browser: string;
  hasVR: boolean;
  hasAR: boolean;
  error?: string;
  deviceInfo?: {
    vendor?: string;
    model?: string;
    version?: string;
  };
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

      // Vérifier le support des sessions inline (pour les casques VR)
      try {
        const hasInline = await navigator.xr.isSessionSupported('inline');
        if (hasInline) {
          info.hasVR = true; // Si inline est supporté, VR est probablement supporté
        }
      } catch (error) {
        console.warn('Erreur lors de la vérification du support inline:', error);
      }

      info.isSupported = info.hasVR || info.hasAR;
      
      // Récupérer les informations sur le dispositif VR si disponible
      if (info.isSupported) {
        try {
          const session = await navigator.xr.requestSession('inline');
          if (session && session.inputSources) {
            info.deviceInfo = {
              vendor: 'WebXR Device',
              model: 'VR Headset',
              version: '1.0'
            };
          }
          session.end();
        } catch (error) {
          // Ignorer les erreurs de session, c'est normal
        }
      }
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
  } else if (userAgent.includes('Opera')) {
    return 'Opera';
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
  private maxLogSize = 100;

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
    
    // Limiter la taille du log
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(-this.maxLogSize);
    }
    
    console.error(errorMessage);
  }

  getErrorLog(): string[] {
    return [...this.errorLog];
  }

  clearErrorLog(): void {
    this.errorLog = [];
  }

  getLastError(): string | null {
    return this.errorLog.length > 0 ? this.errorLog[this.errorLog.length - 1] : null;
  }
}

/**
 * Optimisations de performance pour VR
 */
export class VRPerformanceOptimizer {
  private static instance: VRPerformanceOptimizer;
  private frameRate = 60;
  private lastFrameTime = 0;
  private frameCount = 0;
  private lastFPSUpdate = 0;
  private currentFPS = 60;

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
      this.updateFPS(currentTime);
    } else {
      requestAnimationFrame(() => this.optimizeFrameRate(callback));
    }
  }

  /**
   * Met à jour le calcul FPS
   */
  private updateFPS(currentTime: number): void {
    this.frameCount++;
    
    if (currentTime - this.lastFPSUpdate >= 1000) {
      this.currentFPS = this.frameCount;
      this.frameCount = 0;
      this.lastFPSUpdate = currentTime;
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
      console.warn('Performance VR faible, qualité réduite');
    } else if (fps > 55) {
      // Augmenter la qualité
      renderer.setPixelRatio(window.devicePixelRatio);
      this.frameRate = 60;
    }
  }

  getCurrentFPS(): number {
    return this.currentFPS;
  }

  /**
   * Vérifie si les performances sont acceptables
   */
  isPerformanceAcceptable(): boolean {
    return this.currentFPS >= 30;
  }
}

/**
 * Gestionnaire d'animations VR
 */
export class VRAnimationManager {
  private animations: Map<string, () => void> = new Map();
  private isRunning = false;
  private animationId: number | null = null;

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
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  private animate(): void {
    if (!this.isRunning) return;

    // Exécuter toutes les animations
    this.animations.forEach(animation => {
      try {
        animation();
      } catch (error) {
        console.error('Erreur dans l\'animation VR:', error);
      }
    });
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }

  /**
   * Vérifie si une animation spécifique est active
   */
  hasAnimation(id: string): boolean {
    return this.animations.has(id);
  }

  /**
   * Obtient le nombre d'animations actives
   */
  getAnimationCount(): number {
    return this.animations.size;
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
    (button as any).isPressed = false;
    
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
    raycaster.setFromCamera(mouse, raycaster.camera as THREE.Camera);
    const intersects = raycaster.intersectObject(object);
    return intersects.length > 0;
  }

  /**
   * Crée un contrôleur VR avec retour haptique
   */
  static createVRController(
    scene: THREE.Scene,
    position: THREE.Vector3,
    onTrigger: () => void
  ): THREE.Group {
    const controller = new THREE.Group();
    
    // Géométrie du contrôleur
    const geometry = new THREE.CylinderGeometry(0.02, 0.02, 0.2);
    const material = new THREE.MeshBasicMaterial({ color: 0x666666 });
    const mesh = new THREE.Mesh(geometry, material);
    
    controller.add(mesh);
    controller.position.copy(position);
    
    // Ajouter l'interactivité
    (controller as any).onTrigger = onTrigger;
    (controller as any).isInteractive = true;
    
    scene.add(controller);
    return controller;
  }
}

/**
 * Gestionnaire d'audio spatialisé
 */
export class VRAudioManager {
  private audioContext: AudioContext | null = null;
  private sources: Map<string, AudioBufferSourceNode> = new Map();
  private listener: THREE.Object3D | null = null;

  async initialize(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Démarrer le contexte audio si nécessaire
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de l\'audio:', error);
    }
  }

  /**
   * Définit l'auditeur pour l'audio spatialisé
   */
  setListener(listener: THREE.Object3D): void {
    this.listener = listener;
  }

  async playSpatialAudio(
    audioBuffer: ArrayBuffer,
    position: THREE.Vector3,
    listener?: THREE.Object3D
  ): Promise<void> {
    if (!this.audioContext) {
      console.warn('Contexte audio non initialisé');
      return;
    }

    const targetListener = listener || this.listener;
    if (!targetListener) {
      console.warn('Aucun auditeur défini pour l\'audio spatialisé');
      return;
    }

    try {
      const buffer = await this.audioContext.decodeAudioData(audioBuffer);
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      // Calculer la distance pour l'audio spatialisé
      const distance = position.distanceTo(targetListener.position);
      const volume = Math.max(0, 1 - distance / 10); // Volume diminue avec la distance
      gainNode.gain.value = volume;
      
      source.start();
      const sourceId = Date.now().toString();
      this.sources.set(sourceId, source);
      
      source.onended = () => {
        this.sources.delete(sourceId);
      };
    } catch (error) {
      console.error('Erreur lors de la lecture audio:', error);
    }
  }

  /**
   * Joue un son de notification
   */
  async playNotificationSound(): Promise<void> {
    if (!this.audioContext) return;

    try {
      // Créer un son de notification simple
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.2);
    } catch (error) {
      console.error('Erreur lors de la lecture du son de notification:', error);
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

  /**
   * Vérifie si l'audio est supporté
   */
  isAudioSupported(): boolean {
    return this.audioContext !== null && this.audioContext.state === 'running';
  }
}

/**
 * Utilitaires pour la gestion des sessions VR
 */
export class VRSessionManager {
  private currentSession: XRSession | null = null;
  private onSessionStart?: () => void;
  private onSessionEnd?: () => void;

  /**
   * Démarre une session VR
   */
  async startVRSession(): Promise<boolean> {
    try {
      if (!('xr' in navigator && navigator.xr)) {
        throw new Error('WebXR non supporté');
      }

      const isSupported = await navigator.xr.isSessionSupported('immersive-vr');
      if (!isSupported) {
        throw new Error('VR non supporté par ce dispositif');
      }

      const session = await navigator.xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor']
      });

      this.currentSession = session;
      
      session.addEventListener('end', () => {
        this.currentSession = null;
        this.onSessionEnd?.();
      });

      this.onSessionStart?.();
      return true;
    } catch (error) {
      console.error('Erreur lors du démarrage de la session VR:', error);
      return false;
    }
  }

  /**
   * Termine la session VR actuelle
   */
  endVRSession(): void {
    if (this.currentSession) {
      this.currentSession.end();
      this.currentSession = null;
    }
  }

  /**
   * Vérifie si une session VR est active
   */
  isSessionActive(): boolean {
    return this.currentSession !== null;
  }

  /**
   * Définit les callbacks pour les événements de session
   */
  setSessionCallbacks(onStart?: () => void, onEnd?: () => void): void {
    this.onSessionStart = onStart;
    this.onSessionEnd = onEnd;
  }
} 