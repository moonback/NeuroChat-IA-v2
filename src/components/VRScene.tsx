import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, MessageCircle, X, Volume2, VolumeX } from 'lucide-react';

// Types pour A-Frame
declare global {
  interface Window {
    AFRAME?: any;
  }
  
  namespace JSX {
    interface IntrinsicElements {
      'a-scene': Record<string, unknown>;
      'a-assets': Record<string, unknown>;
      'a-mixin': Record<string, unknown>;
      'a-sky': Record<string, unknown>;
      'a-plane': Record<string, unknown>;
      'a-entity': Record<string, unknown>;
      'a-cylinder': Record<string, unknown>;
      'a-sphere': Record<string, unknown>;
      'a-text': Record<string, unknown>;
      'a-camera': Record<string, unknown>;
      'a-triangle': Record<string, unknown>;
    }
  }
}

interface VRSceneProps {
  messages: Array<{
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
  }>;
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onExitVR: () => void;
}

export function VRScene({
  messages,
  onSendMessage,
  isLoading,
  isListening,
  onStartListening,
  onStopListening,
  isMuted,
  onToggleMute,
  onExitVR
}: VRSceneProps) {
  const [isVRSupported, setIsVRSupported] = useState(false);
  const [isVRActive, setIsVRActive] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isAFrameReady, setIsAFrameReady] = useState(false);
  const vrSceneRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);

  useEffect(() => {
    // Vérifier le support VR
    const checkVRSupport = async () => {
      if ('xr' in navigator && navigator.xr) {
        try {
          const supported = await navigator.xr.isSessionSupported('immersive-vr');
          setIsVRSupported(supported);
        } catch (error) {
          console.warn('Erreur lors de la vérification du support VR:', error);
          setIsVRSupported(false);
        }
      } else {
        // Fallback pour les navigateurs sans support WebXR
        setIsVRSupported(true);
      }
    };
    checkVRSupport();
  }, []);

  useEffect(() => {
    // Initialiser A-Frame
    const initAFrame = () => {
      if (typeof window !== 'undefined' && window.AFRAME) {
        const scene = document.querySelector('a-scene');
        if (scene) {
          sceneRef.current = scene;
          
          // Attendre que A-Frame soit complètement chargé
          scene.addEventListener('loaded', () => {
            console.log('Scène VR chargée');
            setIsAFrameReady(true);
          });

          // Gérer les événements VR
          scene.addEventListener('enter-vr', () => {
            console.log('Entrée en mode VR');
            setIsVRActive(true);
          });

          scene.addEventListener('exit-vr', () => {
            console.log('Sortie du mode VR');
            setIsVRActive(false);
          });

          // Événements supplémentaires pour une meilleure détection
          scene.addEventListener('vr-mode-set', () => {
            console.log('Mode VR activé');
            setIsVRActive(true);
          });

          scene.addEventListener('vr-mode-exit', () => {
            console.log('Mode VR désactivé');
            setIsVRActive(false);
          });

          // Vérifier si on est déjà en VR
          if ((scene as any).is && (scene as any).is('vr-mode')) {
            setIsVRActive(true);
          }
        }
      }
    };

    // Attendre que A-Frame soit disponible
    const checkAFrame = () => {
      if (typeof window !== 'undefined' && window.AFRAME) {
        initAFrame();
      } else {
        setTimeout(checkAFrame, 100);
      }
    };

    checkAFrame();
  }, []);

  const handleVREnter = async () => {
    console.log('Tentative d\'entrée en VR...');
    
    if (!isAFrameReady || !sceneRef.current) {
      console.warn('A-Frame n\'est pas encore prêt');
      return;
    }

    try {
      const scene = sceneRef.current;
      
      // Méthode 1: Utiliser l'API WebXR directement
      if ('xr' in navigator && navigator.xr) {
        const isSupported = await navigator.xr.isSessionSupported('immersive-vr');
        if (isSupported) {
          try {
            const session = await navigator.xr.requestSession('immersive-vr', {
              optionalFeatures: ['local-floor', 'bounded-floor']
            });
            console.log('Session VR créée via WebXR');
            return;
          } catch (sessionError) {
            console.warn('Erreur lors de la création de session VR:', sessionError);
          }
        }
      }
      
      // Méthode 2: Utiliser l'API A-Frame pour entrer en VR
      if (scene && (scene as any).enterVR) {
        try {
          (scene as any).enterVR();
          console.log('Entrée en VR via A-Frame');
          return;
        } catch (aframeError) {
          console.warn('Erreur lors de l\'entrée en VR via A-Frame:', aframeError);
        }
      }
      
      // Méthode 3: Simuler le mode VR (fallback)
      console.log('Utilisation du mode VR simulé');
      setIsVRActive(true);
      
    } catch (error) {
      console.error('Erreur lors de l\'entrée en VR:', error);
      // En cas d'erreur, on peut quand même simuler le mode VR
      setIsVRActive(true);
    }
  };

  const handleSendVRMessage = () => {
    if (currentMessage.trim()) {
      onSendMessage(currentMessage);
      setCurrentMessage('');
    }
  };

  const handleMicToggle = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Interface VR */}
      <div ref={vrSceneRef} className="w-full h-full">
        {/* Scène A-Frame */}
        <a-scene
          vr-mode-ui="enabled: true"
          embedded
          arjs="sourceType: webcam; debugUIEnabled: false;"
          renderer="logarithmicDepthBuffer: true;"
          antialias="true"
          color="0.1 0.1 0.1"
        >
          {/* Environnement */}
          <a-assets>
            <a-mixin id="avatar-material" material="color: #4F46E5; metalness: 0.8; roughness: 0.2" />
            <a-mixin id="text-material" material="color: white; shader: flat" />
          </a-assets>

          {/* Ciel */}
          <a-sky color="#1E293B"></a-sky>

          {/* Sol */}
          <a-plane
            position="0 -2 0"
            rotation="-90 0 0"
            width="20"
            height="20"
            color="#334155"
            shadow
          ></a-plane>

          {/* Avatar du chatbot */}
          <a-entity position="0 0 -3" id="chatbot-avatar">
            {/* Corps principal */}
            <a-cylinder
              position="0 0.5 0"
              radius="0.3"
              height="1"
              mixin="avatar-material"
              shadow
            ></a-cylinder>

            {/* Tête */}
            <a-sphere
              position="0 1.3 0"
              radius="0.25"
              mixin="avatar-material"
              shadow
            ></a-sphere>

            {/* Yeux */}
            <a-sphere
              position="-0.08 1.35 0.2"
              radius="0.03"
              color="#FFFFFF"
            ></a-sphere>
            <a-sphere
              position="0.08 1.35 0.2"
              radius="0.03"
              color="#FFFFFF"
            ></a-sphere>

            {/* Pupilles */}
            <a-sphere
              position="-0.08 1.35 0.22"
              radius="0.015"
              color="#000000"
            ></a-sphere>
            <a-sphere
              position="0.08 1.35 0.22"
              radius="0.015"
              color="#000000"
            ></a-sphere>

            {/* Indicateur de parole */}
            {isLoading && (
              <a-sphere
                position="0 1.5 0"
                radius="0.05"
                color="#10B981"
                animation="property: scale; to: 1.2 1.2 1.2; dur: 1000; loop: true; dir: alternate"
              ></a-sphere>
            )}

            {/* Indicateur d'écoute */}
            {isListening && (
              <a-sphere
                position="0 1.5 0"
                radius="0.05"
                color="#EF4444"
                animation="property: scale; to: 1.5 1.5 1.5; dur: 500; loop: true; dir: alternate"
              ></a-sphere>
            )}
          </a-entity>

          {/* Zone de chat */}
          <a-entity position="0 2 -3" id="chat-zone">
            {/* Fond de la zone de chat */}
            <a-plane
              position="0 0 -0.1"
              width="4"
              height="3"
              color="#1E293B"
              opacity="0.7"
              side="double"
            ></a-plane>
            
            {/* Bordure de la zone de chat */}
            <a-plane
              position="0 0 -0.09"
              width="4"
              height="3"
              color="#334155"
              opacity="0.3"
              side="double"
            ></a-plane>
            
            {/* Titre de la zone de chat */}
            <a-text
              position="0 1.2 0.001"
              value="💬 Conversation"
              width="3"
              align="center"
              color="#FFFFFF"
              font="kelsonsans"
              baseline="center"
            ></a-text>
            
                        {/* Messages en bulles */}
            {messages.slice(-5).map((message, index) => (
              <a-entity
                key={message.id}
                position={`${message.isUser ? 1.2 : -1.2} ${0.5 - index * 0.4} 0`}
              >
                {/* Bulle de chat */}
                <a-entity position={`${message.isUser ? 0.3 : -0.3} 0 0`}>
                {/* Fond de la bulle */}
                <a-plane
                  position="0 0 0"
                  width="1.4"
                  height="0.5"
                  color={message.isUser ? "#10B981" : "#4F46E5"}
                  opacity="0.9"
                  side="double"
                ></a-plane>
                
                {/* Bordure de la bulle */}
                <a-plane
                  position="0 0 -0.001"
                  width="1.4"
                  height="0.5"
                  color={message.isUser ? "#059669" : "#3730A3"}
                  opacity="0.3"
                  side="double"
                ></a-plane>
                
                {/* Texte du message */}
                <a-text
                  position="0 0 0.001"
                  value={message.text.substring(0, 30) + (message.text.length > 30 ? '...' : '')}
                  width="1.2"
                  align="center"
                  color="white"
                  font="kelsonsans"
                  wrapCount="15"
                  baseline="center"
                ></a-text>
                
                {/* Indicateur de direction (flèche) */}
                <a-triangle
                  position={`${message.isUser ? -0.7 : 0.7} 0 0`}
                  vertex-a="0 0.08 0"
                  vertex-b="0 -0.08 0"
                  vertex-c={`${message.isUser ? -0.08 : 0.08} 0 0`}
                  color={message.isUser ? "#10B981" : "#4F46E5"}
                ></a-triangle>
              </a-entity>
              
              {/* Avatar ou icône */}
              <a-sphere
                position={`${message.isUser ? 0.9 : -0.9} 0 0`}
                radius="0.12"
                color={message.isUser ? "#10B981" : "#4F46E5"}
                opacity="0.8"
              ></a-sphere>
              
              {/* Icône dans l'avatar */}
              <a-text
                position={`${message.isUser ? 0.9 : -0.9} 0 0.001`}
                value={message.isUser ? "👤" : "🤖"}
                width="0.25"
                align="center"
                color="white"
                font="kelsonsans"
              ></a-text>
            </a-entity>
          ))}
          </a-entity>

          {/* Contrôles VR */}
          <a-entity position="0 -1.5 -2">
            {/* Bouton micro */}
            <a-cylinder
              position="-0.5 0 0"
              radius="0.1"
              height="0.1"
              color={isListening ? "#EF4444" : "#6B7280"}
              class="clickable"
              onClick={handleMicToggle}
            ></a-cylinder>
            <a-text
              position="-0.5 0.2 0"
              value="MIC"
              width="0.5"
              align="center"
              color="white"
            ></a-text>

            {/* Bouton mute */}
            <a-cylinder
              position="0 0 0"
              radius="0.1"
              height="0.1"
              color={isMuted ? "#EF4444" : "#6B7280"}
              class="clickable"
              onClick={onToggleMute}
            ></a-cylinder>
            <a-text
              position="0 0.2 0"
              value="MUTE"
              width="0.5"
              align="center"
              color="white"
            ></a-text>

            {/* Bouton sortie */}
            <a-cylinder
              position="0.5 0 0"
              radius="0.1"
              height="0.1"
              color="#EF4444"
              class="clickable"
              onClick={onExitVR}
            ></a-cylinder>
            <a-text
              position="0.5 0.2 0"
              value="EXIT"
              width="0.5"
              align="center"
              color="white"
            ></a-text>
          </a-entity>

          {/* Caméra */}
          <a-entity position="0 1.6 0">
            <a-camera
              look-controls="enabled: true"
              wasd-controls="enabled: true"
              cursor="rayOrigin: mouse"
            ></a-camera>
          </a-entity>
        </a-scene>
      </div>

      {/* Interface de contrôle overlay */}
      {!isVRActive && (
        <div className="absolute top-4 left-4 z-10">
          <Card className="p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Mode VR NeuroChat
                </h3>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleVREnter}
                  disabled={!isVRSupported || !isAFrameReady}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {!isAFrameReady ? 'Chargement...' : isVRSupported ? 'Entrer en VR' : 'VR non supporté'}
                </Button>
                <Button
                  onClick={onExitVR}
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Quitter
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleMicToggle}
                  variant={isListening ? "destructive" : "outline"}
                  size="sm"
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4 mr-2" />
                  ) : (
                    <Mic className="w-4 h-4 mr-2" />
                  )}
                  {isListening ? 'Arrêter' : 'Écouter'}
                </Button>

                <Button
                  onClick={onToggleMute}
                  variant={isMuted ? "destructive" : "outline"}
                  size="sm"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 mr-2" />
                  ) : (
                    <Volume2 className="w-4 h-4 mr-2" />
                  )}
                  {isMuted ? 'Démuter' : 'Muter'}
                </Button>
              </div>

              {/* Saisie de message */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendVRMessage()}
                  placeholder="Tapez votre message..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  onClick={handleSendVRMessage}
                  disabled={!currentMessage.trim() || isLoading}
                  size="sm"
                >
                  Envoyer
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Indicateur de statut VR */}
      {isVRActive && (
        <div className="absolute top-4 right-4 z-10">
          <Card className="p-3 bg-green-600/90 backdrop-blur-xl border border-green-500/20">
            <div className="flex items-center gap-2 text-white">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Mode VR actif</span>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
} 