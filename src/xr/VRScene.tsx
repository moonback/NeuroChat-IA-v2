import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { VRMessage, VRSceneConfig, VRUISettings } from './types';
import { useWebXR } from './useWebXR';

interface VRSceneProps {
  messages: VRMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  config?: VRSceneConfig;
  uiSettings?: VRUISettings;
  onExitVR: () => void;
}

export const VRScene: React.FC<VRSceneProps> = ({
  messages,
  onSendMessage,
  isLoading,
  config = {
    backgroundColor: '#000011',
    ambientLight: { intensity: 0.3, color: '#ffffff' },
    directionalLight: { intensity: 0.8, color: '#ffffff', position: { x: 0, y: 10, z: 5 } }
  },
  uiSettings = {
    messageDistance: 3,
    messageScale: 1,
    avatarScale: 1.5,
    panelDistance: 2,
    controllerSensitivity: 1
  },
  onExitVR
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const messageMeshesRef = useRef<THREE.Mesh[]>([]);
  const avatarMeshRef = useRef<THREE.Mesh | null>(null);
  const inputPanelRef = useRef<THREE.Mesh | null>(null);
  
  const [isVRMode, setIsVRMode] = useState(false);
  const [userInput, setUserInput] = useState('');

  // Hook WebXR
  const { isSupported, isSessionActive, startSession, endSession, controllers } = useWebXR({
    onSessionStart: () => setIsVRMode(true),
    onSessionEnd: () => {
      setIsVRMode(false);
      onExitVR();
    },
    audioConfig: {
      enabled: true,
      volume: 0.7,
      spatialAudio: true,
      feedbackSounds: true
    },
    uiSettings
  });

  // Initialiser la scène Three.js
  useEffect(() => {
    if (!mountRef.current) return;

    // Créer la scène
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(config.backgroundColor);
    sceneRef.current = scene;

    // Créer la caméra
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 1.6, 0); // Hauteur moyenne des yeux
    cameraRef.current = camera;

    // Créer le renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Éclairage
    const ambientLight = new THREE.AmbientLight(
      config.ambientLight.color,
      config.ambientLight.intensity
    );
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(
      config.directionalLight.color,
      config.directionalLight.intensity
    );
    directionalLight.position.set(
      config.directionalLight.position.x,
      config.directionalLight.position.y,
      config.directionalLight.position.z
    );
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Créer l'avatar IA (sphère pulsante)
    const avatarGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const avatarMaterial = new THREE.MeshPhongMaterial({
      color: isLoading ? '#ff6b6b' : '#4ecdc4',
      transparent: true,
      opacity: 0.8,
      emissive: isLoading ? '#ff6b6b' : '#4ecdc4',
      emissiveIntensity: 0.2
    });
    const avatar = new THREE.Mesh(avatarGeometry, avatarMaterial);
    avatar.position.set(0, 1.6, -uiSettings.avatarScale);
    avatar.castShadow = true;
    avatar.receiveShadow = true;
    avatarMeshRef.current = avatar;
    scene.add(avatar);

    // Animation de pulsation pour l'avatar
    const animateAvatar = () => {
      if (avatarMeshRef.current) {
        const time = Date.now() * 0.001;
        const scale = 1 + Math.sin(time * 2) * 0.1;
        avatarMeshRef.current.scale.setScalar(scale);
        
        if (isLoading) {
          avatarMeshRef.current.rotation.y += 0.02;
        }
      }
    };

    // Créer le panneau de saisie
    const panelGeometry = new THREE.PlaneGeometry(2, 1);
    const panelMaterial = new THREE.MeshBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.1
    });
    const inputPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    inputPanel.position.set(0, 0.5, uiSettings.panelDistance);
    inputPanelRef.current = inputPanel;
    scene.add(inputPanel);

    // Fonction de rendu
    const animate = () => {
      requestAnimationFrame(animate);
      animateAvatar();
      renderer.render(scene, camera);
    };
    animate();

    // Gestion du redimensionnement
    const handleResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [config, uiSettings, isLoading]);

  // Mettre à jour les messages en VR
  useEffect(() => {
    if (!sceneRef.current || !cameraRef.current) return;
    
    console.log('Messages VR reçus:', messages.map(m => ({ id: m.id, text: m.text, isUser: m.isUser })));

    // Supprimer les anciens messages
    messageMeshesRef.current.forEach(mesh => {
      sceneRef.current!.remove(mesh);
    });
    messageMeshesRef.current = [];

    // Créer les nouveaux messages
    messages.filter(msg => msg.text && msg.text.trim()).forEach((message, index) => {
      // Créer un canvas pour le texte
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = 512;
      canvas.height = 128;
      
      // Configurer le contexte
      context.fillStyle = message.isUser ? '#4ecdc4' : '#ff6b6b';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Ajouter le texte
      context.fillStyle = '#ffffff';
      context.font = '24px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      
      // Wrapper le texte
      const words = message.text.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      
      words.forEach(word => {
        const testLine = currentLine + word + ' ';
        const metrics = context.measureText(testLine);
        if (metrics.width > canvas.width - 40) {
          lines.push(currentLine);
          currentLine = word + ' ';
        } else {
          currentLine = testLine;
        }
      });
      lines.push(currentLine);
      
      // Dessiner le texte
      lines.forEach((line, lineIndex) => {
        context.fillText(line.trim(), canvas.width / 2, (canvas.height / 2) + (lineIndex - lines.length / 2) * 30);
      });
      
      // Créer la texture
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      
      // Créer la géométrie et le matériau
      const messageGeometry = new THREE.PlaneGeometry(2, 0.5);
      const messageMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
      });
      
      const messageMesh = new THREE.Mesh(messageGeometry, messageMaterial);
      
      // Positionner les messages en cercle autour de l'utilisateur
      const angle = (index / messages.length) * Math.PI * 2;
      const radius = uiSettings.messageDistance;
      messageMesh.position.set(
        Math.cos(angle) * radius,
        1.6,
        Math.sin(angle) * radius
      );
      
      // Orienter vers l'utilisateur
      messageMesh.lookAt(cameraRef.current!.position);
      
      sceneRef.current!.add(messageMesh);
      messageMeshesRef.current.push(messageMesh);
    });
  }, [messages, uiSettings.messageDistance]);

  // Gestion des contrôleurs VR
  useEffect(() => {
    controllers.forEach(controller => {
      // Détecter les clics sur le panneau de saisie
      if (controller.buttons.some(btn => btn.pressed)) {
        const controllerPosition = new THREE.Vector3(
          controller.position.x,
          controller.position.y,
          controller.position.z
        );
        
        if (inputPanelRef.current) {
          const panelPosition = inputPanelRef.current.position;
          const distance = controllerPosition.distanceTo(panelPosition);
          
          if (distance < 1) {
            // Ouvrir la saisie vocale ou texte
            onSendMessage(userInput || 'Bonjour');
            setUserInput('');
          }
        }
      }
    });
  }, [controllers, userInput, onSendMessage]);

  // Démarrer la session VR
  const handleStartVR = async () => {
    if (isSupported) {
      const success = await startSession();
      if (!success) {
        console.error('Impossible de démarrer la session VR');
        // Fallback : mode VR simulé pour les tests
        setIsVRMode(true);
      }
    } else {
      // Mode VR simulé si WebXR n'est pas supporté
      console.log('WebXR non supporté, activation du mode VR simulé');
      setIsVRMode(true);
    }
  };

  // Arrêter la session VR
  const handleExitVR = () => {
    endSession();
  };

  return (
    <div className="relative w-full h-screen">
      {/* Interface VR */}
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Contrôles VR */}
      {!isVRMode && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleStartVR}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {isSupported ? 'Démarrer VR' : 'Mode VR Simulé'}
          </button>
        </div>
      )}
      
      {isVRMode && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleExitVR}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Quitter VR
          </button>
        </div>
      )}
      
      {/* Indicateur de statut VR */}
      {isVRMode && (
        <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
          {isSessionActive ? 'Mode VR actif' : 'Mode VR simulé'}
        </div>
      )}

      {/* Contrôles de test pour le mode VR simulé */}
      {isVRMode && !isSessionActive && (
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-black bg-opacity-50 text-white p-3 rounded">
            <div className="text-sm mb-2">Contrôles de test :</div>
            <button
              onClick={() => onSendMessage('Test message VR')}
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs mr-2"
            >
              Envoyer test
            </button>
            <button
              onClick={() => onSendMessage('Bonjour en VR')}
              className="px-3 py-1 bg-green-600 text-white rounded text-xs"
            >
              Salutation
            </button>
            <div className="text-xs mt-2 text-gray-300">
              Messages affichés : {messages.filter(m => m.text && m.text.trim()).length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 