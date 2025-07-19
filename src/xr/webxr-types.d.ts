// Types WebXR pour TypeScript
declare global {
  interface Navigator {
    xr?: XRSystem;
  }

  interface XRSystem {
    isSessionSupported(mode: XRSessionMode): Promise<boolean>;
    requestSession(mode: XRSessionMode, options?: XRSessionInit): Promise<XRSession>;
  }

  interface XRSession extends EventTarget {
    requestReferenceSpace(type: XRReferenceSpaceType): Promise<XRReferenceSpace>;
    requestAnimationFrame(callback: XRFrameRequestCallback): number;
    end(): void;
    inputSources: XRInputSource[];
  }

  interface XRFrame {
    session: XRSession;
    getPose(space: XRSpace, baseSpace: XRReferenceSpace): XRPose | null;
  }

  interface XRPose {
    transform: XRRigidTransform;
  }

  interface XRRigidTransform {
    position: DOMPointReadOnly;
    orientation: DOMPointReadOnly;
  }

  interface XRReferenceSpace extends XRSpace {
    getOffsetReferenceSpace(originOffset: XRRigidTransform): XRReferenceSpace;
  }

  interface XRSpace {}

  interface XRInputSource {
    handedness: XRHandedness;
    gripSpace?: XRSpace;
    buttons: XRInputSourceButton[];
    axes: number[];
  }

  interface XRInputSourceButton {
    pressed: boolean;
    touched: boolean;
    value: number;
  }

  type XRSessionMode = 'inline' | 'immersive-vr' | 'immersive-ar';
  type XRReferenceSpaceType = 'viewer' | 'local' | 'local-floor' | 'bounded-floor' | 'unbounded';
  type XRHandedness = 'none' | 'left' | 'right';

  interface XRSessionInit {
    optionalFeatures?: string[];
    requiredFeatures?: string[];
  }

  type XRFrameRequestCallback = (time: number, frame: XRFrame) => void;
}

export {}; 