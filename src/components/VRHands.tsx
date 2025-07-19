import React from 'react';
import { Entity } from 'aframe-react';

interface VRHandsProps {
  leftHandPosition?: string;
  rightHandPosition?: string;
  isLeftHandVisible?: boolean;
  isRightHandVisible?: boolean;
  leftHandGesture?: string;
  rightHandGesture?: string;
}

export const VRHands: React.FC<VRHandsProps> = ({
  leftHandPosition = "0 0 0",
  rightHandPosition = "0 0 0",
  isLeftHandVisible = false,
  isRightHandVisible = false,
  leftHandGesture = 'neutral',
  rightHandGesture = 'neutral'
}) => {
  const getHandGeometry = (gesture: string) => {
    switch (gesture) {
      case 'point':
        return 'primitive: sphere; radius: 0.02';
      case 'grab':
        return 'primitive: sphere; radius: 0.03';
      case 'thumbsUp':
        return 'primitive: cylinder; radius: 0.02; height: 0.1';
      case 'thumbsDown':
        return 'primitive: cylinder; radius: 0.02; height: 0.1';
      case 'wave':
        return 'primitive: box; width: 0.05; height: 0.05; depth: 0.05';
      case 'clap':
        return 'primitive: sphere; radius: 0.04';
      default:
        return 'primitive: sphere; radius: 0.025';
    }
  };

  const getHandColor = (gesture: string) => {
    switch (gesture) {
      case 'point':
        return '#3b82f6';
      case 'grab':
        return '#8b5cf6';
      case 'thumbsUp':
        return '#10b981';
      case 'thumbsDown':
        return '#ef4444';
      case 'wave':
        return '#f59e0b';
      case 'clap':
        return '#ec4899';
      default:
        return '#6b7280';
    }
  };

  const getHandAnimation = (gesture: string) => {
    switch (gesture) {
      case 'wave':
        return {
          property: 'rotation',
          from: '0 0 0',
          to: '0 0 45',
          dur: 500,
          loop: true,
          dir: 'alternate'
        };
      case 'clap':
        return {
          property: 'scale',
          from: '1 1 1',
          to: '1.2 1.2 1.2',
          dur: 200,
          loop: true,
          dir: 'alternate'
        };
      default:
        return null;
    }
  };

  return (
    <>
      {/* Main gauche */}
      {isLeftHandVisible && (
        <Entity
          position={leftHandPosition}
          geometry={getHandGeometry(leftHandGesture)}
          material={`color: ${getHandColor(leftHandGesture)}; transparent: true; opacity: 0.8`}
          animation={getHandAnimation(leftHandGesture)}
          class="vr-hand left-hand"
        >
          {/* Effet de particules pour la main */}
          <Entity
            position="0 0 0"
            geometry="primitive: sphere; radius: 0.05"
            material={`color: ${getHandColor(leftHandGesture)}; transparent: true; opacity: 0.3`}
            animation={{
              property: 'scale',
              from: '0.5 0.5 0.5',
              to: '2 2 2',
              dur: 1000,
              loop: true
            }}
          />
        </Entity>
      )}

      {/* Main droite */}
      {isRightHandVisible && (
        <Entity
          position={rightHandPosition}
          geometry={getHandGeometry(rightHandGesture)}
          material={`color: ${getHandColor(rightHandGesture)}; transparent: true; opacity: 0.8`}
          animation={getHandAnimation(rightHandGesture)}
          class="vr-hand right-hand"
        >
          {/* Effet de particules pour la main */}
          <Entity
            position="0 0 0"
            geometry="primitive: sphere; radius: 0.05"
            material={`color: ${getHandColor(rightHandGesture)}; transparent: true; opacity: 0.3`}
            animation={{
              property: 'scale',
              from: '0.5 0.5 0.5',
              to: '2 2 2',
              dur: 1000,
              loop: true
            }}
          />
        </Entity>
      )}

      {/* Ligne de connexion entre les mains (pour les gestes à deux mains) */}
      {isLeftHandVisible && isRightHandVisible && (
        <Entity
          position={`${leftHandPosition} ${rightHandPosition}`}
          geometry="primitive: cylinder; radius: 0.005; height: 0.1"
          material="color: #3b82f6; transparent: true; opacity: 0.5"
          class="hand-connection"
        />
      )}
    </>
  );
}; 