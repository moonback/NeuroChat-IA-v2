import React, { useRef, useState } from 'react';
import { Entity } from 'aframe-react';

interface VRAvatarProps {
  personality: string;
  isSpeaking: boolean;
  isThinking: boolean;
  position: string;
  scale?: string;
  onAvatarClick?: () => void;
}

export const VRAvatar: React.FC<VRAvatarProps> = ({
  personality,
  isSpeaking,
  isThinking,
  position,
  scale = "1 1 1",
  onAvatarClick
}) => {
  const avatarRef = useRef<any>(null);
  const [] = useState('neutral');
  const [, setIsHovered] = useState(false);

  // Expressions selon la personnalité
  const getAvatarStyle = () => {
    const styles = {
      'assistant': {
        color: '#3b82f6',
        shape: 'sphere',
        material: 'shader: flat; color: #3b82f6; transparent: true; opacity: 0.9'
      },
      'creative': {
        color: '#8b5cf6',
        shape: 'octahedron',
        material: 'shader: flat; color: #8b5cf6; transparent: true; opacity: 0.9'
      },
      'analytical': {
        color: '#10b981',
        shape: 'box',
        material: 'shader: flat; color: #10b981; transparent: true; opacity: 0.9'
      },
      'friendly': {
        color: '#f59e0b',
        shape: 'sphere',
        material: 'shader: flat; color: #f59e0b; transparent: true; opacity: 0.9'
      },
      'professional': {
        color: '#6b7280',
        shape: 'cylinder',
        material: 'shader: flat; color: #6b7280; transparent: true; opacity: 0.9'
      }
    };
    return styles[personality as keyof typeof styles] || styles.assistant;
  };

  const getExpressionAnimation = () => {
    if (isSpeaking) {
      return {
        property: 'scale',
        from: '1 1 1',
        to: '1.1 1.1 1.1',
        dur: 500,
        loop: true,
        dir: 'alternate'
      };
    }
    if (isThinking) {
      return {
        property: 'rotation',
        from: '0 0 0',
        to: '0 360 0',
        dur: 3000,
        loop: true
      };
    }
    return null;
  };

  const getParticleEffect = () => {
    if (isSpeaking) {
      return (
        <Entity
          position="0 0.5 0"
          geometry="primitive: sphere; radius: 0.1"
          material="color: #3b82f6; transparent: true; opacity: 0.6"
          animation={{
            property: 'scale',
            from: '0.1 0.1 0.1',
            to: '2 2 2',
            dur: 1000,
            loop: true
          }}
        />
      );
    }
    return null;
  };

  const avatarStyle = getAvatarStyle();
  const expressionAnimation = getExpressionAnimation();

  return (
    <Entity
      ref={avatarRef}
      position={position}
      scale={scale}
      geometry={`primitive: ${avatarStyle.shape}; radius: 0.3`}
      material={avatarStyle.material}
      animation={expressionAnimation}
      click={onAvatarClick}
      class="vr-avatar"
      mouseenter={() => setIsHovered(true)}
      mouseleave={() => setIsHovered(false)}
      animation__hover={{
        property: 'scale',
        from: scale,
        to: `${parseFloat(scale.split(' ')[0]) * 1.1} ${parseFloat(scale.split(' ')[1]) * 1.1} ${parseFloat(scale.split(' ')[2]) * 1.1}`,
        startEvents: 'mouseenter',
        pauseEvents: 'mouseleave'
      }}
    >
      {/* Effet de particules quand l'IA parle */}
      {getParticleEffect()}

      {/* Indicateur d'état */}
      <Entity
        position="0 0.6 0"
        geometry="primitive: ring; radiusInner: 0.05; radiusOuter: 0.08"
        material={`color: ${isSpeaking ? '#ef4444' : isThinking ? '#f59e0b' : '#10b981'}; transparent: true; opacity: 0.8`}
        animation={{
          property: 'scale',
          from: '0.8 0.8 0.8',
          to: '1.2 1.2 1.2',
          dur: 1000,
          loop: true,
          dir: 'alternate'
        }}
      />

      {/* Nom de la personnalité */}
      <Entity
        position="0 -0.6 0"
        text={{
          value: personality,
          color: 'white',
          width: 1,
          align: 'center',
          font: 'kelsonsans'
        }}
      />

      {/* Effet de halo */}
      <Entity
        position="0 0 0"
        geometry="primitive: sphere; radius: 0.4"
        material="color: transparent; transparent: true; opacity: 0.1"
        animation={{
          property: 'scale',
          from: '0.8 0.8 0.8',
          to: '1.5 1.5 1.5',
          dur: 2000,
          loop: true,
          dir: 'alternate'
        }}
      />
    </Entity>
  );
}; 