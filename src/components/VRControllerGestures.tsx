import React from 'react';
import { Entity } from 'aframe-react';

interface VRControllerGesturesProps {
  onGestureTrigger: (gesture: string) => void;
  position?: string;
}

export const VRControllerGestures: React.FC<VRControllerGesturesProps> = ({
  onGestureTrigger,
  position = "0 1 -1"
}) => {
  const gestures = [
    { id: 'thumbsUp', icon: '👍', label: 'Pouce en l\'air', color: '#10b981' },
    { id: 'thumbsDown', icon: '👎', label: 'Pouce en bas', color: '#ef4444' },
    { id: 'wave', icon: '👋', label: 'Salut', color: '#f59e0b' },
    { id: 'clap', icon: '👏', label: 'Applaudir', color: '#ec4899' },
    { id: 'point', icon: '👆', label: 'Pointer', color: '#3b82f6' },
    { id: 'grab', icon: '✊', label: 'Saisir', color: '#8b5cf6' }
  ];

  return (
    <Entity position={position}>
      {/* Titre */}
      <Entity
        position="0 0.8 0"
        text={{
          value: 'GESTES VR',
          color: 'white',
          width: 1.5,
          align: 'center',
          font: 'kelsonsans'
        }}
      />

      {/* Grille de gestes */}
      {gestures.map((gesture, index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        const x = (col - 1) * 0.8;
        const y = 0.2 - (row * 0.6);

        return (
          <Entity
            key={gesture.id}
            position={`${x} ${y} 0`}
            geometry="primitive: plane; width: 0.6; height: 0.4"
            material={`color: ${gesture.color}; transparent: true; opacity: 0.8`}
            click={() => onGestureTrigger(gesture.id)}
            animation__hover={{
              property: 'scale',
              from: '1 1 1',
              to: '1.1 1.1 1.1',
              startEvents: 'mouseenter',
              pauseEvents: 'mouseleave'
            }}
            class="gesture-button"
          >
            {/* Icône du geste */}
            <Entity
              position="0 0.1 0.01"
              text={{
                value: gesture.icon,
                color: 'white',
                width: 0.4,
                align: 'center',
                font: 'kelsonsans'
              }}
            />

            {/* Label du geste */}
            <Entity
              position="0 -0.15 0.01"
              text={{
                value: gesture.label,
                color: 'white',
                width: 0.5,
                align: 'center',
                font: 'kelsonsans'
              }}
            />
          </Entity>
        );
      })}

      {/* Instructions */}
      <Entity
        position="0 -1.2 0"
        text={{
          value: 'Cliquez sur un geste pour l\'exécuter',
          color: '#9ca3af',
          width: 2,
          align: 'center',
          font: 'kelsonsans'
        }}
      />
    </Entity>
  );
}; 