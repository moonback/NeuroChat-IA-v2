import React, { useEffect, useRef, useState } from 'react';
import { Entity, Scene } from 'aframe-react';
import 'aframe';

interface VRSceneProps {
  messages: Array<{
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
  }>;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  selectedPersonality: string;
}

export const VRScene: React.FC<VRSceneProps> = ({
  messages,
  onSendMessage,
  isLoading,
  selectedPersonality
}) => {
  const [inputText, setInputText] = useState('');
  const sceneRef = useRef<any>(null);

  useEffect(() => {
    // A-Frame est déjà importé via l'import en haut du fichier
    // Pas besoin d'initialisation supplémentaire
  }, []);

  const handleSendVRMessage = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendVRMessage();
    }
  };

  return (
    <div className="relative w-full h-screen">
      {/* Bouton de sortie VR */}
      <button
        onClick={() => window.history.back()}
        className="absolute top-4 right-4 z-50 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
      >
        ✕ Sortir VR
      </button>

      {/* Interface VR flottante */}
      <div className="absolute top-4 left-4 z-50 bg-black/50 backdrop-blur-lg rounded-lg p-4 text-white">
        <div className="text-sm">
          <p>Personnalité: {selectedPersonality}</p>
          <p>Messages: {messages.length}</p>
          {isLoading && <p className="text-yellow-400">IA en train de réfléchir...</p>}
        </div>
      </div>

      {/* Scène A-Frame */}
      <Scene
        ref={sceneRef}
        vr-mode-ui="enabled: true"
        embedded
        arjs="sourceType: webcam; debugUIEnabled: false;"
        renderer="colorManagement: true, physicallyCorrectLights"
        style={{ height: '100vh' }}
      >
        {/* Environnement */}
        <Entity
          geometry="primitive: plane; width: 100; height: 100"
          material="color: #1a1a2e; shader: flat"
          position="0 -2 0"
          rotation="-90 0 0"
        />

        {/* Ciel */}
        <Entity
          geometry="primitive: sphere; radius: 50"
          material="color: #0f0f23; shader: flat; side: back"
          position="0 0 0"
        />

        {/* Lumière ambiante */}
        <Entity
          light="type: ambient; color: #404040; intensity: 0.4"
        />

        {/* Lumière directionnelle */}
        <Entity
          light="type: directional; color: #ffffff; intensity: 0.8"
          position="0 10 5"
        />

        {/* Interface de chat flottante */}
        <Entity
          position="0 1.5 -3"
          scale="2 1.5 0.1"
        >
          {/* Panneau principal */}
          <Entity
            geometry="primitive: plane; width: 3; height: 2"
            material="color: #2a2a3e; opacity: 0.9; transparent: true"
            position="0 0 0"
          />

          {/* Zone de messages */}
          <Entity
            position="0 0.5 0.01"
            scale="0.9 0.6 1"
          >
            {messages.slice(-5).map((message, index) => (
              <Entity
                key={message.id}
                position={`0 ${-0.3 * index} 0.01`}
                scale="0.8 0.1 1"
              >
                <Entity
                  geometry="primitive: plane; width: 2.5; height: 0.2"
                  material={`color: ${message.isUser ? '#4a90e2' : '#50c878'}; opacity: 0.8; transparent: true`}
                  position="0 0 0"
                />
                <Entity
                  text={`value: ${message.text.substring(0, 50)}${message.text.length > 50 ? '...' : ''}; 
                         color: white; 
                         width: 2.4; 
                         align: left; 
                         font: roboto; 
                         fontSize: 0.05`}
                  position="-1.1 0 0.01"
                />
              </Entity>
            ))}
          </Entity>

          {/* Zone de saisie */}
          <Entity
            position="0 -0.7 0.01"
            scale="0.9 0.15 1"
          >
            <Entity
              geometry="primitive: plane; width: 2.5; height: 0.3"
              material="color: #3a3a4e; opacity: 0.9; transparent: true"
              position="0 0 0"
            />
            
            {/* Bouton d'envoi */}
            <Entity
              geometry="primitive: plane; width: 0.3; height: 0.2"
              material="color: #4a90e2; opacity: 0.9; transparent: true"
              position="1.1 0 0.01"
              class="clickable"
              events={{
                click: handleSendVRMessage
              }}
            >
              <Entity
                text="value: Envoyer; color: white; width: 0.25; align: center; fontSize: 0.04"
                position="0 0 0.01"
              />
            </Entity>
          </Entity>
        </Entity>

        {/* Avatar IA */}
        <Entity
          position="0 0 -2"
          scale="0.5 0.5 0.5"
        >
          <Entity
            geometry="primitive: sphere; radius: 0.3"
            material="color: #50c878; emissive: #50c878; emissiveIntensity: 0.2"
            position="0 1.5 0"
          />
          <Entity
            geometry="primitive: cylinder; radius: 0.1; height: 0.8"
            material="color: #50c878"
            position="0 1 0"
          />
          <Entity
            geometry="primitive: box; width: 0.6; height: 0.1; depth: 0.3"
            material="color: #50c878"
            position="0 0.6 0"
          />
        </Entity>

        {/* Contrôles VR */}
        <Entity
          camera
          look-controls="enabled: true"
          wasd-controls="enabled: true"
          position="0 1.6 0"
        >
          <Entity
            cursor="fuse: false; fuseTimeout: 500"
            position="0 0 -1"
            geometry="primitive: ring; radiusInner: 0.02; radiusOuter: 0.03"
            material="color: white; shader: flat"
          />
        </Entity>

        {/* Indicateur de chargement */}
        {isLoading && (
          <Entity
            position="0 2 -2"
            scale="0.5 0.5 0.5"
          >
            <Entity
              geometry="primitive: ring; radiusInner: 0.1; radiusOuter: 0.2"
              material="color: #ffd700; emissive: #ffd700; emissiveIntensity: 0.5"
              animation="property: rotation; to: 0 0 360; dur: 1000; loop: true"
            />
            <Entity
              text="value: IA réfléchit...; color: #ffd700; width: 1; align: center; fontSize: 0.08"
              position="0 -0.3 0"
            />
          </Entity>
        )}
      </Scene>

      {/* Interface de saisie pour non-VR */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 flex space-x-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Tapez votre message..."
          className="px-4 py-2 bg-black/50 backdrop-blur-lg text-white rounded-lg border border-white/20 focus:outline-none focus:border-blue-400"
          style={{ width: '300px' }}
        />
        <button
          onClick={handleSendVRMessage}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
}; 