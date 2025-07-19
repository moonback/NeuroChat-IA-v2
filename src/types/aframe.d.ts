declare module 'aframe-react' {
  import React from 'react';
  
  export interface EntityProps {
    [key: string]: any;
  }
  
  export interface SceneProps {
    [key: string]: any;
  }
  
  export const Entity: React.ComponentType<EntityProps>;
  export const Scene: React.ComponentType<SceneProps>;
}

declare global {
  interface Window {
    AFRAME: any;
  }
}

declare module 'aframe' {
  const aframe: any;
  export default aframe;
}

declare module 'aframe-extras' {
  const aframeExtras: any;
  export default aframeExtras;
} 