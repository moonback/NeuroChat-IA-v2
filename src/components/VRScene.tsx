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
      'a-scene': any;
      'a-assets': any;
      'a-mixin': any;
      'a-sky': any;
      'a-plane': any;
      'a-entity': any;
      'a-cylinder': any;
      'a-sphere': any;
      'a-text': any;
      'a-camera': any;
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
  const vrSceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Vérifier le support VR
    const checkVRSupport = async () => {
      if ('xr' in navigator && navigator.xr) {
        const supported = await navigator.xr.isSessionSupported('immersive-vr');
        setIsVRSupported(supported);
      }
    };
    checkVRSupport();
  }, []);

  useEffect(() => {
    // Initialiser A-Frame
    if (typeof window !== 'undefined' && window.AFRAME) {
      const scene = document.querySelector('a-scene');
      if (scene) {
        scene.addEventListener('loaded', () => {
          console.log('Scène VR chargée');
        });
      }
    }
  }, []);

  const handleVREnter = () => {
    setIsVRActive(true);
    // Activer le mode VR
    if (vrSceneRef.current && 'xr' in navigator && navigator.xr) {
      const scene = vrSceneRef.current.querySelector('a-scene');
      if (scene) {
        navigator.xr.requestSession('immersive-vr').then((session) => {
          session.addEventListener('end', () => {
            setIsVRActive(false);
          });
        });
      }
    }
  };

  const handleSendVRMessage = () => {
    if (currentMessage.trim()) {
      onSendMessage(currentMessage);
      setCurrentMessage('');
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

          {/* Messages flottants */}
          {messages.slice(-3).map((message, index) => (
            <a-entity
              key={message.id}
              position={`${message.isUser ? 1 : -1} ${1.5 + index * 0.3} -2`}
            >
              <a-text
                value={message.text.substring(0, 50) + (message.text.length > 50 ? '...' : '')}
                width="2"
                align="center"
                color={message.isUser ? "#10B981" : "#FFFFFF"}
                mixin="text-material"
              ></a-text>
            </a-entity>
          ))}

          {/* Contrôles VR */}
          <a-entity position="0 -1.5 -2">
            {/* Bouton micro */}
            <a-cylinder
              position="-0.5 0 0"
              radius="0.1"
              height="0.1"
              color={isListening ? "#EF4444" : "#6B7280"}
              class="clickable"
              onClick={() => isListening ? onStopListening() : onStartListening()}
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
                  disabled={!isVRSupported}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isVRSupported ? 'Entrer en VR' : 'VR non supporté'}
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
                  onClick={isListening ? onStopListening : onStartListening}
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