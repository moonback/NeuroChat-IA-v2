import React, { useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { XR, createXRStore, useXR } from '@react-three/xr';
import { Text, Box, Sphere, Plane } from '@react-three/drei';
import * as THREE from 'three';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface WebXRChatContainerProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

// Composant pour afficher les messages en 3D
const MessageBubble3D: React.FC<{ message: Message; position: [number, number, number] }> = ({ 
  message, 
  position 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  return (
    <group position={position}>
      {/* Bulle de message */}
      <Box
        ref={meshRef}
        args={[2, 0.5, 0.1]}
        position={[0, 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={message.isUser ? '#3b82f6' : '#6b7280'} 
          transparent
          opacity={hovered ? 0.9 : 0.7}
        />
      </Box>
      
      {/* Texte du message */}
      <Text
        position={[0, 0, 0.06]}
        fontSize={0.1}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.8}
        textAlign="center"
      >
        {message.text.length > 100 ? message.text.substring(0, 100) + '...' : message.text}
      </Text>
      
      {/* Indicateur utilisateur/IA */}
      <Sphere
        args={[0.05]}
        position={[0.9, 0.2, 0.06]}
      >
        <meshStandardMaterial color={message.isUser ? '#10b981' : '#f59e0b'} />
      </Sphere>
    </group>
  );
};

// Composant pour l'interface de chat en réalité mixte
const MixedRealityChatInterface: React.FC<WebXRChatContainerProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading 
}) => {
  const { session } = useXR();
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(false);

  // Initialiser la détection de plans WebXR
  useEffect(() => {
    if (session && session.enabledFeatures?.includes('plane-detection')) {
      console.log('Session WebXR avec détection de plans active');
    }
  }, [session]);

  // Gérer l'entrée vocale en VR
  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        onSendMessage(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Erreur de reconnaissance vocale:', event.error);
      };

      recognition.start();
    }
  };

  return (
    <>
      {/* Éclairage pour la scène 3D */}
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <directionalLight position={[0, 5, 5]} intensity={1} />

      {/* Les contrôleurs et mains sont maintenant ajoutés automatiquement par XR */}

      {/* Interface de chat flottante */}
      <group position={[0, 1.5, -2]}>
        {/* Panneau principal */}
        <Plane args={[3, 4]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color="#1f2937" 
            transparent 
            opacity={0.9} 
          />
        </Plane>

        {/* Titre */}
        <Text
          position={[0, 1.7, 0.01]}
          fontSize={0.2}
          color="#3b82f6"
          anchorX="center"
          anchorY="middle"
        >
          NeuroChat IA - Réalité Mixte
        </Text>

        {/* Messages */}
        {messages.slice(-5).map((message, index) => (
          <MessageBubble3D
            key={message.id}
            message={message}
            position={[0, 1 - (index * 0.6), 0.01]}
          />
        ))}

        {/* Indicateur de chargement */}
        {isLoading && (
          <group position={[0, -1.5, 0.01]}>
            <Sphere args={[0.05]}>
              <meshStandardMaterial color="#f59e0b" />
            </Sphere>
            <Text
              position={[0.2, 0, 0]}
              fontSize={0.08}
              color="#f59e0b"
              anchorX="left"
              anchorY="middle"
            >
              IA en train de réfléchir...
            </Text>
          </group>
        )}

        {/* Bouton d'entrée vocale */}
        <Box
          args={[0.5, 0.2, 0.05]}
          position={[-0.7, -1.8, 0.01]}
          onClick={handleVoiceInput}
        >
          <meshStandardMaterial color="#10b981" />
        </Box>
        <Text
          position={[-0.7, -1.8, 0.06]}
          fontSize={0.06}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          🎤 Parler
        </Text>

        {/* Bouton clavier virtuel */}
        <Box
          args={[0.5, 0.2, 0.05]}
          position={[0.7, -1.8, 0.01]}
          onClick={() => setShowVirtualKeyboard(!showVirtualKeyboard)}
        >
          <meshStandardMaterial color="#6366f1" />
        </Box>
        <Text
          position={[0.7, -1.8, 0.06]}
          fontSize={0.06}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          ⌨️ Clavier
        </Text>
      </group>

      {/* Clavier virtuel (si activé) */}
      {showVirtualKeyboard && (
        <group position={[0, 0.5, -1.5]}>
          <Plane args={[2, 1]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#374151" transparent opacity={0.9} />
          </Plane>
          <Text
            position={[0, 0, 0.01]}
            fontSize={0.08}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            Clavier virtuel (à implémenter)
          </Text>
        </group>
      )}

      {/* Ancres pour placer des éléments dans l'espace réel */}
      <group>
        {/* Ici, nous pourrions ajouter des éléments ancrés aux surfaces détectées */}
      </group>
    </>
  );
};

// Créer le store XR
const xrStore = createXRStore();

// Composant principal WebXR Chat Container
export const WebXRChatContainer: React.FC<WebXRChatContainerProps> = (props) => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* Boutons pour entrer en VR/AR */}
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        left: '20px', 
        zIndex: 1000,
        display: 'flex',
        gap: '10px'
      }}>
        <button 
          onClick={() => xrStore.enterVR()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Entrer en VR
        </button>
        <button 
          onClick={() => xrStore.enterAR()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Entrer en AR
        </button>
      </div>

      <Canvas>
        <XR store={xrStore}>
          <MixedRealityChatInterface 
            messages={props.messages}
            onSendMessage={props.onSendMessage}
            isLoading={props.isLoading}
          />
        </XR>
      </Canvas>
    </div>
  );
};