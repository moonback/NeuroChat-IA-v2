import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { VRScene } from './VRScene';
import { VRAnimations } from './VRAnimations';
import { 
  Monitor, 
  Info,
  Headphones,
  Mic,
  Volume2
} from 'lucide-react';

interface VRModeToggleProps {
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
  isSpeaking: boolean;
}

export function VRModeToggle({
  messages,
  onSendMessage,
  isLoading,
  isListening,
  onStartListening,
  onStopListening,
  isMuted,
  onToggleMute,
  isSpeaking
}: VRModeToggleProps) {
  const [isVRMode, setIsVRMode] = useState(false);
  const [showVRInfo, setShowVRInfo] = useState(false);

  const handleToggleVR = () => {
    setIsVRMode(!isVRMode);
  };

  const handleExitVR = () => {
    setIsVRMode(false);
  };

  if (isVRMode) {
    return (
      <VRScene
        messages={messages}
        onSendMessage={onSendMessage}
        isLoading={isLoading}
        isListening={isListening}
        onStartListening={onStartListening}
        onStopListening={onStopListening}
        isMuted={isMuted}
        onToggleMute={onToggleMute}
        onExitVR={handleExitVR}
      />
    );
  }

  return (
    <>
      {/* Bouton VR dans l'interface principale */}
      <div className="fixed bottom-20 right-4 z-40">
        <div className="flex flex-col gap-2">
          {/* Bouton principal VR */}
          <Button
            onClick={handleToggleVR}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-2xl hover:shadow-purple-500/25 transition-all duration-300"
            title="Mode VR"
          >
            <Monitor className="w-6 h-6" />
          </Button>

          {/* Bouton d'information VR */}
          <Button
            onClick={() => setShowVRInfo(!showVRInfo)}
            variant="outline"
            size="sm"
            className="w-8 h-8 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/20"
            title="Info VR"
          >
            <Info className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Modal d'information VR */}
      {showVRInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="max-w-md mx-4 p-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/20 shadow-2xl">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Monitor className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Mode VR NeuroChat
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Expérience immersive en réalité virtuelle
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <Headphones className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      Avatar 3D Interactif
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Chattez avec un avatar 3D animé en temps réel
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <Mic className="w-5 h-5 text-green-600" />
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      Reconnaissance Vocale
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Parlez naturellement avec l'avatar en VR
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                  <Volume2 className="w-5 h-5 text-purple-600" />
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      Synthèse Vocale
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      L'avatar répond avec une voix naturelle
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">
                  Prérequis
                </h4>
                <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  <li>• Navigateur compatible WebXR (Chrome, Edge)</li>
                  <li>• Casque VR (Oculus, HTC Vive, etc.)</li>
                  <li>• Microphone pour la reconnaissance vocale</li>
                  <li>• Haut-parleurs ou casque audio</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleToggleVR}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  Essayer le Mode VR
                </Button>
                <Button
                  onClick={() => setShowVRInfo(false)}
                  variant="outline"
                >
                  Fermer
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Aperçu avatar 3D en arrière-plan */}
      <div className="fixed bottom-4 left-4 z-30">
        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-purple-600/20 to-blue-600/20 backdrop-blur-xl border border-white/20 overflow-hidden">
          <VRAnimations
            isListening={isListening}
            isLoading={isLoading}
            isSpeaking={isSpeaking}
          />
        </div>
      </div>
    </>
  );
} 