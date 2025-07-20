// Types pour WebXR et React Three XR
declare module '@react-three/xr' {
  import { ReactNode } from 'react';
  import { Object3D } from 'three';

  export interface XRProps {
    children?: ReactNode;
    store: XRStore;
    foveation?: number;
    frameRate?: number;
    referenceSpace?: XRReferenceSpaceType;
    onSessionStart?: () => void;
    onSessionEnd?: () => void;
  }

  export interface XRStore {
    enterVR(): Promise<void>;
    enterAR(): Promise<void>;
    exitXR(): Promise<void>;
  }

  export function XR(props: XRProps): JSX.Element;
  export function createXRStore(): XRStore;
  export function useXR(): {
    session: XRSession | null;
    isPresenting: boolean;
    player: Object3D;
    controllers: Object3D[];
    hands: Object3D[];
  };
}

// Types WebXR natifs
export interface WebXRCapabilities {
  supportsVR: boolean;
  supportsAR: boolean;
  supportsMixedReality: boolean;
}

export type WebXRMode = 'vr' | 'ar' | 'mixed-reality';

export interface WebXRSessionConfig {
  mode: WebXRMode;
  features?: string[];
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface WebXRChatProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  webXRMode: WebXRMode;
}

// Extension des types Navigator pour WebXR
declare global {
  interface Navigator {
    xr?: {
      isSessionSupported: (mode: string) => Promise<boolean>;
      requestSession: (mode: string, options?: any) => Promise<XRSession>;
    };
  }

  interface XRSession {
    enabledFeatures?: string[];
    end(): Promise<void>;
    requestReferenceSpace(type: XRReferenceSpaceType): Promise<XRReferenceSpace>;
    requestAnimationFrame(callback: XRFrameRequestCallback): number;
    addEventListener(type: string, listener: EventListener): void;
    removeEventListener(type: string, listener: EventListener): void;
  }

  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}