import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface VRAnimationsProps {
  isListening: boolean;
  isLoading: boolean;
  isSpeaking: boolean;
}

export function VRAnimations({ isListening, isLoading, isSpeaking }: VRAnimationsProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const avatarRef = useRef<THREE.Group | null>(null);
  const animationRef = useRef<number | null>(null);
  const indicatorRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Initialiser Three.js
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Créer l'avatar
    const avatar = new THREE.Group();
    avatarRef.current = avatar;

    // Corps principal
    const bodyGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x4F46E5,
      shininess: 100
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.5;
    avatar.add(body);

    // Tête
    const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const headMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x4F46E5,
      shininess: 100
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.3;
    avatar.add(head);

    // Yeux
    const eyeGeometry = new THREE.SphereGeometry(0.03, 8, 8);
    const eyeMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.08, 1.35, 0.2);
    avatar.add(leftEye);
    
    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.08, 1.35, 0.2);
    avatar.add(rightEye);

    // Pupilles
    const pupilGeometry = new THREE.SphereGeometry(0.015, 8, 8);
    const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    
    const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    leftPupil.position.set(-0.08, 1.35, 0.22);
    avatar.add(leftPupil);
    
    const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
    rightPupil.position.set(0.08, 1.35, 0.22);
    avatar.add(rightPupil);

    // Indicateur de statut
    const indicatorGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const indicatorMaterial = new THREE.MeshBasicMaterial({ 
      color: isListening ? 0xEF4444 : isLoading ? 0x10B981 : 0x6B7280,
      transparent: true,
      opacity: 0.8
    });
    const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
    indicator.position.y = 1.5;
    avatar.add(indicator);
    indicatorRef.current = indicator;

    scene.add(avatar);

    // Éclairage
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Animation
    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      if (avatar) {
        // Animation de respiration
        const time = Date.now() * 0.001;
        avatar.scale.y = 1 + Math.sin(time * 2) * 0.02;

        // Animation des yeux
        if (isListening || isLoading || isSpeaking) {
          leftPupil.position.x = -0.08 + Math.sin(time * 3) * 0.01;
          rightPupil.position.x = 0.08 + Math.sin(time * 3) * 0.01;
        }

        // Animation de l'indicateur
        if (isListening || isLoading || isSpeaking) {
          indicator.scale.setScalar(1 + Math.sin(time * 4) * 0.3);
          indicator.material.color.setHex(
            isListening ? 0xEF4444 : isLoading ? 0x10B981 : 0x6B7280
          );
        } else {
          indicator.scale.setScalar(1);
        }

        // Rotation douce de l'avatar
        avatar.rotation.y = Math.sin(time * 0.5) * 0.1;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Gestion du redimensionnement
    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Nettoyage
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', handleResize);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Mettre à jour les animations selon l'état
  useEffect(() => {
    if (indicatorRef.current && indicatorRef.current.material instanceof THREE.MeshBasicMaterial) {
      if (isListening) {
        indicatorRef.current.material.color.setHex(0xEF4444);
      } else if (isLoading) {
        indicatorRef.current.material.color.setHex(0x10B981);
      } else if (isSpeaking) {
        indicatorRef.current.material.color.setHex(0x3B82F6);
      } else {
        indicatorRef.current.material.color.setHex(0x6B7280);
      }
    }
  }, [isListening, isLoading, isSpeaking]);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full"
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
    />
  );
} 