import React, { useEffect, useRef, useState } from 'react';
import { Entity, Scene } from 'aframe-react';
import 'aframe';
import 'aframe-extras';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  imageUrl?: string;
}

interface VRChatSceneProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  selectedPersonality: string;
  onExitVR: () => void;
}

export const VRChatScene: React.FC<VRChatSceneProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onExitVR
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const sceneRef = useRef<any>(null);

  useEffect(() => {
    // Initialiser A-Frame si nécessaire
    if (typeof window !== 'undefined' && !(window as any).AFRAME) {
      console.log('A-Frame non détecté, chargement...');
    }
  }, []);

  const handleSendMessage = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // Ici vous pouvez intégrer la reconnaissance vocale
  };

  const getMessageColor = (isUser: boolean) => {
    return isUser ? '#3b82f6' : '#10b981';
  };


  return (
    <div className="vr-scene-container">
      <Scene
        ref={sceneRef}
        embedded
        vr-mode-ui="enabled: true"
        renderer="antialias: true; colorManagement: true"
        background="color: #1a1a1a"
        environment="preset: forest; groundTexture: none; groundColor: #2a2a2a; skyType: atmosphere; skyColor: #1a1a1a"
        fog="type: exponential; color: #1a1a1a; density: 0.01"
      >
        {/* Caméra VR */}
        <Entity
          id="camera"
          position="0 1.6 0"
          camera
          look-controls
          wasd-controls
          cursor="rayOrigin: mouse"
        >
          {/* Curseur pour interagir */}
          <Entity
            position="0 0 -1"
            geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
            material="color: white; shader: flat"
            cursor="fuse: false"
            animation__click="property: scale; startEvents: click; easing: easeInCubic; dur: 150; from: 0.1 0.1 0.1; to: 1 1 1"
            animation__fusing="property: scale; startEvents: fusing; easing: easeInCubic; dur: 1500; from: 1 1 1; to: 0.1 0.1 0.1"
            animation__mouseleave="property: scale; startEvents: mouseleave; easing: easeInCubic; dur: 500; to: 1 1 1"
          />
        </Entity>

        {/* Interface de chat flottante */}
        <Entity
          position="0 1.5 -2"
          geometry="primitive: plane; width: 3; height: 2"
          material="color: rgba(0,0,0,0.8); transparent: true"
          class="chat-interface"
        >
          {/* Zone de messages */}
          <Entity
            position="0 0.5 0.01"
            geometry="primitive: plane; width: 2.8; height: 1.5"
            material="color: rgba(255,255,255,0.1); transparent: true"
            class="messages-container"
          >
            {/* Messages */}
            {messages.slice(-10).map((message, index) => (
              <Entity
                key={message.id}
                position={`${message.isUser ? 0.8 : -0.8} ${0.6 - (index * 0.15)} 0.02`}
                geometry="primitive: plane; width: 1.4; height: 0.12"
                material={`color: ${getMessageColor(message.isUser)}; transparent: true; opacity: 0.9`}
                text={{
                  value: message.text.length > 50 ? message.text.substring(0, 50) + '...' : message.text,
                  color: 'white',
                  width: 1.3,
                  align: message.isUser ? 'right' : 'left',
                  font: 'kelsonsans'
                }}
                animation__appear={{
                  property: 'scale',
                  from: '0 0 0',
                  to: '1 1 1',
                  dur: 500,
                  delay: index * 100
                }}
              />
            ))}
          </Entity>

          {/* Indicateur de chargement */}
          {isLoading && (
            <Entity
              position="0 -0.6 0.01"
              geometry="primitive: plane; width: 0.5; height: 0.1"
              material="color: #f59e0b; transparent: true"
              text={{
                value: 'IA réfléchit...',
                color: 'white',
                width: 0.4,
                align: 'center'
              }}
              animation__pulse={{
                property: 'opacity',
                from: 0.5,
                to: 1,
                dur: 1000,
                loop: true,
                dir: 'alternate'
              }}
            />
          )}
        </Entity>

        {/* Interface de saisie */}
        <Entity
          position="0 0.5 -1.5"
          geometry="primitive: plane; width: 2.5; height: 0.8"
          material="color: rgba(0,0,0,0.9); transparent: true"
          class="input-interface"
        >
          {/* Zone de texte */}
          <Entity
            position="0 0.1 0.01"
            geometry="primitive: plane; width: 1.8; height: 0.3"
            material="color: rgba(255,255,255,0.2); transparent: true"
            text={{
              value: inputText || 'Tapez votre message...',
              color: inputText ? 'white' : '#666',
              width: 1.7,
              align: 'left'
            }}
            class="text-input"
            click={() => {
              // Ouvrir un clavier virtuel ou activer la saisie vocale
              handleVoiceInput();
            }}
          />

          {/* Bouton d'envoi */}
          <Entity
            position="1.1 0.1 0.01"
            geometry="primitive: plane; width: 0.4; height: 0.3"
            material="color: #3b82f6; transparent: true"
            text={{
              value: 'Envoi',
              color: 'white',
              width: 0.3,
              align: 'center'
            }}
            class="send-button"
            click={handleSendMessage}
            animation__hover={{
              property: 'scale',
              from: '1 1 1',
              to: '1.1 1.1 1.1',
              startEvents: 'mouseenter',
              pauseEvents: 'mouseleave'
            }}
          />

          {/* Bouton vocal */}
          <Entity
            position="-1.1 0.1 0.01"
            geometry="primitive: plane; width: 0.4; height: 0.3"
            material={`color: ${isListening ? '#ef4444' : '#10b981'}; transparent: true`}
            text={{
              value: isListening ? 'Stop' : 'Mic',
              color: 'white',
              width: 0.3,
              align: 'center'
            }}
            class="voice-button"
            click={handleVoiceInput}
            animation__pulse={isListening ? {
              property: 'scale',
              from: '1 1 1',
              to: '1.2 1.2 1.2',
              dur: 500,
              loop: true,
              dir: 'alternate'
            } : {}}
          />
        </Entity>

        {/* Bouton de sortie VR */}
        <Entity
          position="1.5 1.5 -1"
          geometry="primitive: plane; width: 0.3; height: 0.3"
          material="color: #ef4444; transparent: true"
          text={{
            value: 'X',
            color: 'white',
            width: 0.2,
            align: 'center'
          }}
          class="exit-button"
          click={onExitVR}
          animation__hover={{
            property: 'scale',
            from: '1 1 1',
            to: '1.2 1.2 1.2',
            startEvents: 'mouseenter',
            pauseEvents: 'mouseleave'
          }}
        />

        {/* Environnement décoratif */}
        <Entity
          position="0 0 -10"
          geometry="primitive: sphere; radius: 50"
          material="color: #1a1a1a; side: back; transparent: true; opacity: 0.3"
          class="sky-sphere"
        />

        {/* Particules flottantes */}
        {Array.from({ length: 20 }).map((_, i) => (
          <Entity
            key={i}
            position={`${(Math.random() - 0.5) * 10} ${Math.random() * 5} ${(Math.random() - 0.5) * 10}`}
            geometry="primitive: sphere; radius: 0.02"
            material="color: #3b82f6; transparent: true; opacity: 0.6"
            animation__float={{
              property: 'position',
              from: `${(Math.random() - 0.5) * 10} ${Math.random() * 5} ${(Math.random() - 0.5) * 10}`,
              to: `${(Math.random() - 0.5) * 10} ${Math.random() * 5 + 2} ${(Math.random() - 0.5) * 10}`,
              dur: 3000 + Math.random() * 2000,
              loop: true,
              dir: 'alternate'
            }}
          />
        ))}
      </Scene>
    </div>
  );
}; 