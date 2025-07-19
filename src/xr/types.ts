// Types pour WebXR et VR
export interface XRSession {
  isVR: boolean;
  isAR: boolean;
  isImmersive: boolean;
}

export interface VRController {
  id: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  buttons: VRButton[];
  axes: number[];
}

export interface VRButton {
  pressed: boolean;
  touched: boolean;
  value: number;
}

export interface VRMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  position?: { x: number; y: number; z: number };
  scale?: { x: number; y: number; z: number };
}

export interface VRSceneConfig {
  backgroundColor: string;
  ambientLight: { intensity: number; color: string };
  directionalLight: { intensity: number; color: string; position: { x: number; y: number; z: number } };
}

export interface VRAudioConfig {
  enabled: boolean;
  volume: number;
  spatialAudio: boolean;
  feedbackSounds: boolean;
}

export interface VRUISettings {
  messageDistance: number;
  messageScale: number;
  avatarScale: number;
  panelDistance: number;
  controllerSensitivity: number;
} 