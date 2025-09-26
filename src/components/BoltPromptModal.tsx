/**
 * 🚀 BoltPromptModal - Modal pour le Générateur de Prompts bolt.new
 * 
 * Modal intégrée dans l'interface principale de NeuroChat
 * - Accès rapide depuis le header
 * - Interface responsive et accessible
 * - Intégration avec le système de thème
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, X, ExternalLink } from 'lucide-react';
import { BoltPromptGenerator } from '@/components/BoltPromptGenerator';

interface BoltPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BoltPromptModal({ open, onOpenChange }: BoltPromptModalProps) {

  const handleOpenBoltNew = () => {
    window.open('https://bolt.new', '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl h-[95vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  Générateur de Prompts bolt.new
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Créez des prompts système optimisés pour développer vos idées
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenBoltNew}
                className="hidden sm:flex"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Ouvrir bolt.new
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <BoltPromptGenerator className="h-full" />
        </div>

        {/* Footer avec actions rapides */}
        <div className="px-6 py-4 border-t bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                <Sparkles className="w-3 h-3 mr-1" />
                Optimisé pour bolt.new
              </Badge>
              <Badge variant="outline" className="text-xs">
                Templates prédéfinis
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenBoltNew}
                className="sm:hidden"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                bolt.new
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
