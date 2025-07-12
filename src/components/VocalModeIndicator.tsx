import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Clock, GripVertical, Minimize2, Maximize2, X } from 'lucide-react';

interface VocalModeIndicatorProps {
  visible: boolean;
  listening?: boolean;
  transcript?: string;
  muted?: boolean;
  timeoutActive?: boolean;
  isAISpeaking?: boolean;
}

export const VocalModeIndicator: React.FC<VocalModeIndicatorProps> = ({ 
  visible, 
  listening = false, 
  transcript = '', 
  muted = false,
  timeoutActive = false,
  isAISpeaking = false 
}) => {
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const elementRef = useRef<HTMLDivElement>(null);

  // Charger la position sauvegardée au montage
  useEffect(() => {
    const savedPosition = localStorage.getItem('vocalIndicatorPosition');
    const savedMinimized = localStorage.getItem('vocalIndicatorMinimized');
    
    if (savedPosition) {
      try {
        const pos = JSON.parse(savedPosition);
        setPosition(pos);
      } catch (e) {
        console.error('Erreur lors du chargement de la position:', e);
      }
    }
    
    if (savedMinimized) {
      setIsMinimized(savedMinimized === 'true');
    }
  }, []);

  // Sauvegarder la position et l'état minimisé
  useEffect(() => {
    localStorage.setItem('vocalIndicatorPosition', JSON.stringify(position));
  }, [position]);

  useEffect(() => {
    localStorage.setItem('vocalIndicatorMinimized', isMinimized.toString());
  }, [isMinimized]);

  // Gérer le début du glisser-déposer
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!elementRef.current) return;
    
    const rect = elementRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
    
    e.preventDefault();
  };

  // Gérer le déplacement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Limiter aux bords de l'écran
      const maxX = window.innerWidth - (isMinimized ? 60 : 300);
      const maxY = window.innerHeight - (isMinimized ? 60 : 200);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset, isMinimized]);

  if (!visible) return null;

  return (
    <div
      ref={elementRef}
      className={`fixed z-50 select-none transition-all duration-300 ${
        isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab'
      } ${isMinimized ? 'w-16 h-16' : 'max-w-sm'}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className={`bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 text-white rounded-xl shadow-2xl border border-white/20 backdrop-blur-xl transition-all duration-300 ${
        isMinimized ? 'p-3' : 'px-4 py-3'
      }`}>
        
        {/* Version minimisée */}
        {isMinimized ? (
          <div className="flex items-center justify-center relative">
            <div className="relative">
              {isAISpeaking ? (
                <MicOff className="w-6 h-6 text-red-300" />
              ) : listening ? (
                <Mic className="w-6 h-6 text-white animate-pulse" />
              ) : (
                <MicOff className="w-6 h-6 text-white/70" />
              )}
              
              {listening && !isAISpeaking && (
                <div className="absolute -inset-1 bg-white/30 rounded-full animate-ping" />
              )}
              
              {isAISpeaking && (
                <div className="absolute -inset-1 bg-red-400/30 rounded-full animate-pulse" />
              )}
            </div>
            
            {/* Bouton pour agrandir */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(false);
              }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              title="Agrandir"
            >
              <Maximize2 className="w-2 h-2" />
            </button>
          </div>
        ) : (
          /* Version complète */
          <div className="flex flex-col gap-2">
            {/* Header avec contrôles */}
            <div className="flex items-center gap-2">
              {/* Poignée de déplacement */}
              <div 
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/10 rounded transition-colors"
                onMouseDown={handleMouseDown}
                title="Glisser pour déplacer"
              >
                <GripVertical className="w-4 h-4 text-white/70" />
              </div>
              
              <div className="relative">
                {isAISpeaking ? (
                  <MicOff className="w-5 h-5 text-red-300" />
                ) : listening ? (
                  <Mic className="w-5 h-5 text-white animate-pulse" />
                ) : (
                  <MicOff className="w-5 h-5 text-white/70" />
                )}
                
                {listening && !isAISpeaking && (
                  <div className="absolute -inset-1 bg-white/30 rounded-full animate-ping" />
                )}
                
                {isAISpeaking && (
                  <div className="absolute -inset-1 bg-red-400/30 rounded-full animate-pulse" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">
                  Mode Vocal Auto
                </div>
                <div className="text-xs text-white/80 truncate">
                  {isAISpeaking ? '🤖 IA répond' : listening ? '🎤 Écoute' : '⏸️ Pause'}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                {muted ? (
                  <VolumeX className="w-4 h-4 text-red-300" />
                ) : (
                  <Volume2 className="w-4 h-4 text-green-300" />
                )}
                
                {timeoutActive && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-orange-300" />
                    <span className="text-xs text-orange-200">3s</span>
                  </div>
                )}
                
                {/* Bouton minimiser */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMinimized(true);
                  }}
                  className="w-6 h-6 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors ml-1"
                  title="Réduire"
                >
                  <Minimize2 className="w-3 h-3" />
                </button>
              </div>
            </div>
            
            {/* Transcript en cours */}
            {transcript && (
              <div className="bg-white/20 rounded-lg p-2 border border-white/20">
                <div className="text-xs text-white/90 font-medium mb-1">
                  Transcription :
                </div>
                <div className="text-sm text-white font-medium line-clamp-2">
                  "{transcript}"
                </div>
              </div>
            )}
            
            {/* Instructions compactes */}
            <div className="text-xs text-white/70">
              {isAISpeaking ? (
                "L'IA répond... Écoute reprendra après"
              ) : listening ? (
                timeoutActive ? (
                  "Analyse dans 3s..."
                ) : (
                  "Parlez naturellement"
                )
              ) : (
                "En attente..."
              )}
            </div>
            
            {/* Indicateur visuel de niveau sonore */}
            {listening && !isAISpeaking && (
              <div className="flex gap-1 h-1">
                {[...Array(6)].map((_, i) => (
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
        )}
      </div>
    </div>
  );
}; 