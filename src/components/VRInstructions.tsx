import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, HelpCircle, MousePointer, Hand, Keyboard } from 'lucide-react';

interface VRInstructionsProps {
  visible: boolean;
  onClose: () => void;
}

export const VRInstructions: React.FC<VRInstructionsProps> = ({
  visible,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const instructions = [
    {
      title: "Mouvement",
      description: "Utilisez WASD pour vous déplacer et la souris pour regarder autour de vous",
      icon: <MousePointer className="w-6 h-6" />,
      keys: ["W", "A", "S", "D", "Souris"]
    },
    {
      title: "Gestes VR",
      description: "Utilisez les touches 1-6 pour simuler les gestes VR",
      icon: <Hand className="w-6 h-6" />,
      keys: ["1: Pointer", "2: Saisir", "3: Pouce en l'air", "4: Pouce en bas", "5: Salut", "6: Applaudir"]
    },
    {
      title: "Interaction",
      description: "Cliquez sur les éléments pour interagir avec eux",
      icon: <MousePointer className="w-6 h-6" />,
      keys: ["Clic gauche"]
    },
    {
      title: "Avatar IA",
      description: "L'avatar de l'IA réagit à vos actions et peut être cliqué",
      icon: <HelpCircle className="w-6 h-6" />,
      keys: ["Cliquer sur l'avatar"]
    }
  ];

  useEffect(() => {
    if (visible) {
      setCurrentStep(0);
    }
  }, [visible]);

  const handleNext = () => {
    if (currentStep < instructions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!visible) return null;

  const currentInstruction = instructions[currentStep];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl border-2 border-blue-500/30">
        <CardHeader className="relative">
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
          >
            <X className="w-4 h-4" />
          </Button>
          <CardTitle className="flex items-center gap-2">
            {currentInstruction.icon}
            {currentInstruction.title}
            <Badge variant="secondary" className="ml-auto">
              {currentStep + 1}/{instructions.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            {currentInstruction.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {currentInstruction.keys.map((key, index) => (
              <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <Keyboard className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-mono bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
                  {key}
                </span>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between pt-4">
            <Button
              onClick={handlePrevious}
              variant="outline"
              disabled={currentStep === 0}
            >
              Précédent
            </Button>
            <Button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {currentStep === instructions.length - 1 ? "Terminer" : "Suivant"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 