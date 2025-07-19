import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Headphones, Monitor, Smartphone, Zap, X } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  imageUrl?: string;
}

interface VRDemoSceneProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  selectedPersonality: string;
  onExitVR: () => void;
}

export const VRDemoScene: React.FC<VRDemoSceneProps> = ({
  messages,
  onSendMessage,
  isLoading,
  selectedPersonality,
  onExitVR
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSendMessage = () => {
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    // Simulation de reconnaissance vocale
    if (!isListening) {
      setTimeout(() => {
        const demoText = "Bonjour, comment allez-vous ?";
        setInputText(demoText);
        setIsListening(false);
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 z-50 flex items-center justify-center p-4">
      {/* Bouton de sortie */}
      <Button
        onClick={onExitVR}
        variant="destructive"
        size="sm"
        className="absolute top-4 right-4 z-10"
      >
        <X className="w-4 h-4 mr-2" />
        Quitter VR
      </Button>

      <div className="w-full max-w-4xl h-full flex flex-col">
        {/* En-tête VR */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Headphones className="w-6 h-6 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Mode Réalité Virtuelle</h1>
            <Badge variant="secondary" className="ml-2">
              <Zap className="w-3 h-3 mr-1" />
              Immersif
            </Badge>
          </div>
          <p className="text-purple-200">Plongez dans une expérience immersive avec votre assistant IA</p>
        </div>

        {/* Interface de chat VR */}
        <Card className="flex-1 bg-black/50 backdrop-blur-xl border-purple-500/30">
          <CardHeader className="border-b border-purple-500/30">
            <CardTitle className="text-white flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Chat Immersif
            </CardTitle>
            <CardDescription className="text-purple-200">
              Personnalité: {selectedPersonality}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Zone de messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.slice(-10).map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.5s ease-out forwards'
                  }}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      message.isUser
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 text-white'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-700 text-white px-4 py-2 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm">IA réfléchit...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Interface de saisie */}
            <div className="p-4 border-t border-purple-500/30">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Tapez votre message..."
                  className="flex-1 bg-slate-800 text-white border border-purple-500/50 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                
                <Button
                  onClick={handleVoiceInput}
                  variant={isListening ? "destructive" : "secondary"}
                  size="sm"
                  className="px-4"
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  {isListening ? 'Stop' : 'Mic'}
                </Button>
                
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="px-4 bg-purple-600 hover:bg-purple-700"
                >
                  Envoyer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Indicateurs VR */}
        <div className="flex justify-center gap-4 mt-4">
          <div className="flex items-center gap-2 text-purple-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm">VR Actif</span>
          </div>
          <div className="flex items-center gap-2 text-purple-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm">Audio</span>
          </div>
          <div className="flex items-center gap-2 text-purple-200">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <span className="text-sm">IA Connectée</span>
          </div>
        </div>
      </div>

      {/* Particules décoratives */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}; 