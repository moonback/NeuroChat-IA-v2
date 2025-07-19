import React from 'react';
import { Entity } from 'aframe-react';

interface VRGestureIndicatorProps {
  gestureState: {
    isPointing: boolean;
    isGrabbing: boolean;
    isThumbsUp: boolean;
    isThumbsDown: boolean;
    isWaving: boolean;
    isClapping: boolean;
  };
  position?: string;
}

export const VRGestureIndicator: React.FC<VRGestureIndicatorProps> = ({
  gestureState,
  position = "0 2 -2"
}) => {
  const getActiveGesture = () => {
    if (gestureState.isPointing) return 'pointing';
    if (gestureState.isGrabbing) return 'grabbing';
    if (gestureState.isThumbsUp) return 'thumbsUp';
    if (gestureState.isThumbsDown) return 'thumbsDown';
    if (gestureState.isWaving) return 'waving';
    if (gestureState.isClapping) return 'clapping';
    return null;
  };

  const getGestureIcon = (gesture: string) => {
    switch (gesture) {
      case 'pointing':
        return '👆';
      case 'grabbing':
        return '✊';
      case 'thumbsUp':
        return '👍';
      case 'thumbsDown':
        return '👎';
      case 'waving':
        return '👋';
      case 'clapping':
        return '👏';
      default:
        return '🤖';
    }
  };

  const getGestureColor = (gesture: string) => {
    switch (gesture) {
      case 'pointing':
        return '#3b82f6';
      case 'grabbing':
        return '#8b5cf6';
      case 'thumbsUp':
        return '#10b981';
      case 'thumbsDown':
        return '#ef4444';
      case 'waving':
        return '#f59e0b';
      case 'clapping':
        return '#ec4899';
      default:
        return '#6b7280';
    }
  };

  const activeGesture = getActiveGesture();

  if (!activeGesture) return null;

  return (
    <Entity
      position={position}
      geometry="primitive: plane; width: 1; height: 1"
      material={`color: ${getGestureColor(activeGesture)}; transparent: true; opacity: 0.9`}
      animation={{
        property: 'scale',
        from: '0.5 0.5 0.5',
        to: '1.2 1.2 1.2',
        dur: 500,
        loop: true,
        dir: 'alternate'
      }}
    >
      {/* Icône du geste */}
      <Entity
        position="0 0 0.01"
        text={{
          value: getGestureIcon(activeGesture),
          color: 'white',
          width: 0.8,
          align: 'center',
          font: 'kelsonsans'
        }}
      />

      {/* Nom du geste */}
      <Entity
        position="0 -0.6 0.01"
        text={{
          value: activeGesture,
          color: 'white',
          width: 0.8,
          align: 'center',
          font: 'kelsonsans'
        }}
      />

      {/* Effet de particules */}
      <Entity
        position="0 0.5 0"
        geometry="primitive: sphere; radius: 0.05"
        material={`color: ${getGestureColor(activeGesture)}; transparent: true; opacity: 0.6`}
        animation={{
          property: 'scale',
          from: '0.1 0.1 0.1',
          to: '3 3 3',
          dur: 1000,
          loop: true
        }}
      />
    </Entity>
  );
}; 