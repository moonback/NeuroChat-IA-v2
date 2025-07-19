import React, { useRef, useEffect, useState } from 'react';
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

    // Ajouter un effet de brouillard pour la profondeur
    scene.fog = new THREE.Fog(config.backgroundColor, 5, 50);

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

    // Créer l'avatar IA (sphère pulsante avec effet holographique)
    const avatarGeometry = new THREE.SphereGeometry(0.3, 32, 32);
    const avatarMaterial = new THREE.MeshPhongMaterial({
      color: isLoading ? '#ff6b6b' : '#4ecdc4',
      transparent: true,
      opacity: 0.9,
      emissive: isLoading ? '#ff6b6b' : '#4ecdc4',
      emissiveIntensity: 0.3,
      shininess: 100
    });
    const avatar = new THREE.Mesh(avatarGeometry, avatarMaterial);
    avatar.position.set(0, 1.6, -uiSettings.avatarScale);
    avatar.castShadow = true;
    avatar.receiveShadow = true;
    avatarMeshRef.current = avatar;
    scene.add(avatar);

    // Ajouter un anneau holographique autour de l'avatar
    const ringGeometry = new THREE.RingGeometry(0.4, 0.5, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: isLoading ? '#ff6b6b' : '#4ecdc4',
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.set(0, 1.6, -uiSettings.avatarScale);
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);

    // Ajouter des particules flottantes autour de l'avatar
    const particleCount = 50;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;

      colors[i * 3] = isLoading ? 1 : 0.3;
      colors[i * 3 + 1] = isLoading ? 0.4 : 0.8;
      colors[i * 3 + 2] = isLoading ? 0.4 : 0.8;
    }

    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.6
    });

    const particleSystem = new THREE.Points(particles, particleMaterial);
    particleSystem.position.set(0, 1.6, -uiSettings.avatarScale);
    scene.add(particleSystem);

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

    // Créer le panneau de saisie avec effet holographique
    const panelGeometry = new THREE.PlaneGeometry(2.5, 1.2);
    const panelMaterial = new THREE.MeshBasicMaterial({
      color: '#ffffff',
      transparent: true,
      opacity: 0.15
    });
    const inputPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    inputPanel.position.set(0, 0.5, uiSettings.panelDistance);
    inputPanelRef.current = inputPanel;
    scene.add(inputPanel);

    // Ajouter une bordure holographique au panneau
    const borderGeometry = new THREE.EdgesGeometry(panelGeometry);
    const borderMaterial = new THREE.LineBasicMaterial({
      color: '#4ecdc4',
      transparent: true,
      opacity: 0.6
    });
    const border = new THREE.LineSegments(borderGeometry, borderMaterial);
    border.position.set(0, 0.5, uiSettings.panelDistance);
    scene.add(border);

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
      // Créer un canvas pour le texte avec design moderne
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = 1024;
      canvas.height = 256;
      
      // Créer un dégradé de fond
      const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
      if (message.isUser) {
        gradient.addColorStop(0, '#4ecdc4');
        gradient.addColorStop(1, '#44a08d');
      } else {
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(1, '#ee5a52');
      }
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Ajouter un effet de bordure
      context.strokeStyle = message.isUser ? '#ffffff' : '#ffffff';
      context.lineWidth = 4;
      context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
      
      // Ajouter le texte avec ombre
      context.shadowColor = 'rgba(0, 0, 0, 0.5)';
      context.shadowBlur = 4;
      context.shadowOffsetX = 2;
      context.shadowOffsetY = 2;
      context.fillStyle = '#ffffff';
      context.font = 'bold 32px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      
      // Wrapper le texte avec meilleure gestion
      const words = message.text.split(' ');
      const lines: string[] = [];
      let currentLine = '';
      
      words.forEach(word => {
        const testLine = currentLine + word + ' ';
        const metrics = context.measureText(testLine);
        if (metrics.width > canvas.width - 80) {
          lines.push(currentLine);
          currentLine = word + ' ';
        } else {
          currentLine = testLine;
        }
      });
      lines.push(currentLine);
      
      // Dessiner le texte avec espacement amélioré
      lines.forEach((line, lineIndex) => {
        context.fillText(line.trim(), canvas.width / 2, (canvas.height / 2) + (lineIndex - lines.length / 2) * 40);
      });
      
      // Ajouter un indicateur de type de message
      const indicator = message.isUser ? '👤' : '🤖';
      context.font = '24px Arial';
      context.fillText(indicator, 50, 50);
      
      // Créer la texture
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      
      // Créer la géométrie et le matériau avec effet holographique
      const messageGeometry = new THREE.PlaneGeometry(3, 0.8);
      const messageMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide
      });
      
      const messageMesh = new THREE.Mesh(messageGeometry, messageMaterial);
      
      // Positionner les messages en cercle avec effet de profondeur
      const angle = (index / messages.length) * Math.PI * 2;
      const radius = uiSettings.messageDistance + (index * 0.2); // Espacement progressif
      const height = 1.6 + Math.sin(angle * 2) * 0.3; // Variation de hauteur
      messageMesh.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );
      
      // Orienter vers l'utilisateur avec légère inclinaison
      messageMesh.lookAt(cameraRef.current!.position);
      messageMesh.rotateY(Math.sin(angle) * 0.1);
      
      // Ajouter une animation de flottement
      const time = Date.now() * 0.001;
      messageMesh.position.y += Math.sin(time + index) * 0.05;
      
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
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl hover:from-purple-600 hover:to-blue-700 transition-all duration-300 shadow-lg font-medium"
          >
            {isSupported ? '🥽 Démarrer VR' : '🎮 Mode VR Simulé'}
          </button>
        </div>
      )}
      
      {isVRMode && (
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleExitVR}
            className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg font-medium"
          >
            ❌ Quitter VR
          </button>
        </div>
      )}
      
      {/* Indicateur de statut VR */}
      {isVRMode && (
        <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-70 text-white px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isSessionActive ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`}></div>
            <span className="font-medium">
              {isSessionActive ? '🥽 Mode VR Actif' : '🎮 Mode VR Simulé'}
            </span>
          </div>
        </div>
      )}

      {/* Contrôles de test pour le mode VR simulé */}
      {isVRMode && !isSessionActive && (
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-black bg-opacity-70 text-white p-4 rounded-xl backdrop-blur-sm border border-white/20">
            <div className="text-sm mb-3 font-semibold">🎮 Contrôles VR :</div>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => onSendMessage('Test message VR')}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg"
              >
                🚀 Envoyer test
              </button>
              <button
                onClick={() => onSendMessage('Bonjour en VR')}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg text-sm hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg"
              >
                👋 Salutation
              </button>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-300">
              <span>📊 Messages : {messages.filter(m => m.text && m.text.trim()).length}</span>
              <span>🎯 Mode : Simulé</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 