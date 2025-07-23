import React, { useRef, useState, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { XR, VRButton, createXRStore } from "@react-three/xr";
import { Box, Text, Plane } from "@react-three/drei";

// Affiche un message sur un panneau 3D
function MessagePanel({ text, y }: { text: string; y: number }) {
  return (
    <group position={[0, y, -2]}>
      <Plane args={[1.8, 0.25]}>
        <meshStandardMaterial color="#222" transparent opacity={0.7} />
      </Plane>
      <Text
        position={[0, 0, 0.01]}
        fontSize={0.12}
        color="#fff"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.7}
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

export default function VRScene({ messages = [], onDictate, transcript = '', isDictating = false, onSend }: {
  messages?: { id: string; text: string; isUser: boolean }[];
  onDictate?: () => void;
  transcript?: string;
  isDictating?: boolean;
  onSend?: (text: string) => void;
}) {
  const [clicked, setClicked] = useState(false);
  const xrStore = useMemo(() => createXRStore(), []);

  // Afficher les 5 derniers messages (du plus ancien au plus récent)
  const lastMessages = messages.slice(-5);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <VRButton store={xrStore} />
      <Canvas shadows camera={{ position: [0, 1.6, 2], fov: 70 }}>
        <XR store={xrStore}>
          <ambientLight intensity={0.7} />
          <pointLight position={[10, 10, 10]} />
          {/* Affichage des messages */}
          {lastMessages.map((msg, i) => (
            <MessagePanel key={msg.id} text={(msg.isUser ? '👤 ' : '🤖 ') + msg.text} y={1.3 - 0.3 * (lastMessages.length - 1 - i)} />
          ))}
          {/* Affichage de la dictée en cours */}
          {isDictating && transcript && (
            <MessagePanel text={"🗣️ " + transcript} y={0.5} />
          )}
          {/* Micro 3D */}
          <MicroButton3D onClick={onDictate || (() => {})} isDictating={isDictating} />
          {/* Bouton envoyer (si dictée en cours) */}
          {isDictating && transcript && (
            <group position={[0.8, 0.3, -2]}>
              <Box args={[0.18, 0.12, 0.12]} onClick={() => onSend && onSend(transcript)}>
                <meshStandardMaterial color="#4caf50" />
              </Box>
              <Text position={[0, 0.11, 0]} fontSize={0.06} color="#4caf50" anchorX="center" anchorY="bottom">Envoyer</Text>
            </group>
          )}
        </XR>
      </Canvas>
    </div>
  );
} 