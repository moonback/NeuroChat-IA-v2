import React from 'react';
import { Mic, MicOff, Volume2, VolumeX, Clock } from 'lucide-react';

interface VocalModeIndicatorProps {
  visible: boolean;
  listening?: boolean;
  transcript?: string;
  muted?: boolean;
  timeoutActive?: boolean;
}

export const VocalModeIndicator: React.FC<VocalModeIndicatorProps> = ({ 
  visible, 
  listening = false, 
  transcript = '', 
  muted = false,
  timeoutActive = false 
}) => {
  if (!visible) return null;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-white/30 backdrop-blur-xl animate-in zoom-in-50 fade-in-0 duration-300">
        <div className="flex flex-col items-center gap-3 min-w-80">
          {/* Header avec statut */}
          <div className="flex items-center gap-3">
            <div className="relative">
              {listening ? (
                <Mic className="w-6 h-6 text-white animate-pulse" />
              ) : (
                <MicOff className="w-6 h-6 text-white/70" />
              )}
              
              {listening && (
                <div className="absolute -inset-2 bg-white/30 rounded-full animate-ping" />
              )}
            </div>
            
            <div className="flex flex-col">
              <span className="font-bold text-lg">
                Mode Vocal Automatique
              </span>
              <span className="text-sm text-white/80">
                {listening ? '🎤 Écoute active' : '⏸️ En pause'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {muted ? (
                <VolumeX className="w-5 h-5 text-red-300" />
              ) : (
                <Volume2 className="w-5 h-5 text-green-300" />
              )}
              
              {timeoutActive && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-orange-300" />
                  <span className="text-xs text-orange-200">3s</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Transcript en cours */}
          {transcript && (
            <div className="w-full bg-white/20 rounded-xl p-3 border border-white/30">
              <div className="text-sm text-white/90 font-medium mb-1">
                Transcription en cours :
              </div>
              <div className="text-white font-medium text-center">
                "{transcript}"
              </div>
            </div>
          )}
          
          {/* Instructions */}
          <div className="text-xs text-white/70 text-center">
            {listening ? (
              timeoutActive ? (
                "✨ Analyse dans 3 secondes... Continuez à parler pour prolonger"
              ) : (
                "💬 Parlez naturellement. 3 secondes de silence = envoi automatique"
              )
            ) : (
              "🔄 En attente de réactivation automatique..."
            )}
          </div>
          
          {/* Indicateur visuel de niveau sonore */}
          {listening && (
            <div className="flex gap-1 h-2">
              {[...Array(8)].map((_, i) => (
                <div 
                  key={i}
                  className="w-1 bg-white/60 rounded-full animate-pulse" 
                  style={{ 
                    height: `${Math.random() * 100 + 20}%`,
                    animationDelay: `${i * 100}ms` 
                  }} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 