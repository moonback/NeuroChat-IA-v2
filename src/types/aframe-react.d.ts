declare module 'aframe-react' {
  import React from 'react';

  export interface EntityProps {
    [key: string]: any;
  }

  export interface SceneProps {
    [key: string]: any;
  }

  export const Entity: React.FC<EntityProps>;
  export const Scene: React.FC<SceneProps>;
}

declare module 'aframe' {
  const aframe: any;
  export default aframe;
} 