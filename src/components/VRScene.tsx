import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { XR, VRButton, createXRStore } from "@react-three/xr";
import { Box, Text, Plane } from "@react-three/drei";

// Affiche un message sur un panneau 3D
function MessagePanel({ text, y, isUser }: { text: string; y: number; isUser: boolean }) {
  // Couleur selon l'auteur
  const bgColor = isUser ? '#2563eb' : '#111827';
  const textColor = isUser ? '#fff' : '#fbbf24';
  return (
    <group position={[0, y, -2]}>
      <Plane args={[1.8, 0.28]}>
        <meshStandardMaterial color={bgColor} transparent opacity={0.85} />
      </Plane>
      {/* Bord arrondi et ombre (simulée par un plan plus large et flou) */}
      <Plane args={[1.9, 0.32]} position={[0, 0, -0.01]}>
        <meshStandardMaterial color="#000" transparent opacity={0.18} />
      </Plane>
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.13}
        color={textColor}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.6}
        outlineColor="#000"
        outlineWidth={0.008}
      >
        {text}
      </Text>
    </group>
  );
}

// Microphone 3D interactif
function MicroButton3D({ onClick, isDictating }: { onClick: () => void; isDictating: boolean }) {
  const meshRef = useRef<any>();
  useFrame(() => {
    if (meshRef.current && isDictating) {
      meshRef.current.rotation.y += 0.04;
    }
  });
  return (
    <group position={[0.8, 0.6, -2]}>
      <Box
        ref={meshRef}
        args={[0.18, 0.18, 0.18]}
        onClick={onClick}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={isDictating ? "#e53935" : "#2196f3"} />
      </Box>
      <Text
        position={[0, 0.15, 0]}
        fontSize={0.07}
        color={isDictating ? "#e53935" : "#2196f3"}
        anchorX="center"
        anchorY="bottom"
      >
        {isDictating ? "Parle..." : "Micro"}
      </Text>
    </group>
  );
}

// Bouton 3D toggle micro
function ToggleMicroButton3D({ isActive, onToggle }: { isActive: boolean; onToggle: () => void }) {
  const meshRef = useRef<any>();
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.z = isActive ? Math.sin(Date.now() * 0.003) * 0.15 : 0;
    }
  });
  return (
    <group position={[-0.8, 0.6, -2]}>
      <Box
        ref={meshRef}
        args={[0.18, 0.18, 0.18]}
        onClick={onToggle}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={isActive ? "#43a047" : "#757575"} />
      </Box>
      <Text
        position={[0, 0.15, 0]}
        fontSize={0.07}
        color={isActive ? "#43a047" : "#757575"}
        anchorX="center"
        anchorY="bottom"
      >
        {isActive ? "Micro ON" : "Micro OFF"}
      </Text>
    </group>
  );
}

// Clavier virtuel 3D (démo visuelle, pas de logique de saisie complète)
function VirtualKeyboard3D({ visible, onKey, onClose }: { visible: boolean; onKey: (k: string) => void; onClose: () => void }) {
  if (!visible) return null;
  const keys = [
    ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
    ['W', 'X', 'C', 'V', 'B', 'N', '⌫', '⏎']
  ];
  return (
    <group position={[0, -0.2, -1.7]}>
      <Plane args={[2.2, 0.9]}>
        <meshStandardMaterial color="#222" transparent opacity={0.92} />
      </Plane>
      {keys.map((row, y) => row.map((k, x) => (
        <group key={k} position={[-0.95 + x * 0.22, 0.35 - y * 0.32, 0.01]}>
          <Box args={[0.18, 0.18, 0.08]} onClick={() => onKey(k)}>
            <meshStandardMaterial color="#374151" />
          </Box>
          <Text position={[0, 0, 0.06]} fontSize={0.09} color="#fff" anchorX="center" anchorY="middle">{k}</Text>
        </group>
      )))}
      {/* Bouton fermer */}
      <group position={[1, 0.4, 0.02]}>
        <Box args={[0.22, 0.18, 0.08]} onClick={onClose}>
          <meshStandardMaterial color="#e53935" />
        </Box>
        <Text position={[0, 0, 0.06]} fontSize={0.08} color="#fff" anchorX="center" anchorY="middle">Fermer</Text>
      </group>
    </group>
  );
}

export default function VRScene({ messages = [], onDictate, transcript = '', isDictating = false, onSend }: {
  messages?: { id: string; text: string; isUser: boolean }[];
  onDictate?: () => void;
  transcript?: string;
  isDictating?: boolean;
  onSend?: (text: string) => void;
}) {
  const [clicked, setClicked] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [keyboardInput, setKeyboardInput] = useState('');
  const xrStore = useMemo(() => createXRStore(), []);

  // Afficher les 5 derniers messages (du plus ancien au plus récent)
  const lastMessages = messages.slice(-5);

  // Animation feedback sur bouton envoyer
  const [sendAnim, setSendAnim] = useState(false);
  const handleSend = (text: string) => {
    setSendAnim(true);
    setTimeout(() => setSendAnim(false), 300);
    onSend && onSend(text);
    setKeyboardInput('');
    setShowKeyboard(false);
  };

  // Gestion clavier virtuel (démo)
  const handleKey = (k: string) => {
    if (k === '⌫') setKeyboardInput(s => s.slice(0, -1));
    else if (k === '⏎') handleSend(keyboardInput);
    else setKeyboardInput(s => s + k);
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <VRButton store={xrStore} />
      <Canvas shadows camera={{ position: [0, 1.6, 2], fov: 70 }}>
        <XR store={xrStore}>
          <ambientLight intensity={0.7} />
          <pointLight position={[10, 10, 10]} />
          {/* Affichage des messages */}
          {lastMessages.map((msg, i) => (
            <MessagePanel key={msg.id} text={(msg.isUser ? '👤 ' : '🤖 ') + msg.text} y={1.3 - 0.3 * (lastMessages.length - 1 - i)} isUser={msg.isUser} />
          ))}
          {/* Affichage de la dictée en cours */}
          {isDictating && transcript && (
            <MessagePanel text={"🗣️ " + transcript} y={0.5} isUser={true} />
          )}
          {/* Micro 3D (dictée) */}
          <MicroButton3D onClick={onDictate || (() => {})} isDictating={isDictating} />
          {/* Toggle micro ON/OFF */}
          <ToggleMicroButton3D isActive={isDictating} onToggle={onDictate || (() => {})} />
          {/* Bouton envoyer (si dictée en cours) */}
          {isDictating && transcript && (
            <group position={[0.8, 0.3, -2]}>
              <Box args={[0.18, 0.12, 0.12]} onClick={() => { setSendAnim(true); setTimeout(() => setSendAnim(false), 300); onSend && onSend(transcript); }} scale={sendAnim ? [1.2, 1.2, 1.2] : [1, 1, 1]}>
                <meshStandardMaterial color="#4caf50" />
              </Box>
              <Text position={[0, 0.11, 0]} fontSize={0.06} color="#4caf50" anchorX="center" anchorY="bottom">Envoyer</Text>
            </group>
          )}
          {/* Bouton clavier virtuel */}
          <group position={[0, -0.1, -2]}>
            <Box args={[0.22, 0.12, 0.12]} onClick={() => setShowKeyboard(s => !s)}>
              <meshStandardMaterial color="#fbbf24" />
            </Box>
            <Text position={[0, 0.11, 0]} fontSize={0.06} color="#fbbf24" anchorX="center" anchorY="bottom">Clavier</Text>
          </group>
          {/* Clavier virtuel 3D */}
          <VirtualKeyboard3D visible={showKeyboard} onKey={handleKey} onClose={() => setShowKeyboard(false)} />
          {/* Affichage du texte clavier en cours */}
          {showKeyboard && (
            <MessagePanel text={keyboardInput || ' '} y={-0.55} isUser={true} />
          )}
        </XR>
      </Canvas>
    </div>
  );
} 