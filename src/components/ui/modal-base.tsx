/**
 * 🎨 ModalBase - Composant de base pour toutes les modales NeuroChat
 * 
 * Design unifié inspiré de BoltPromptModal avec :
 * - Header moderne avec icône, titre et bouton fermer
 * - Contenu scrollable avec overflow géré
 * - Footer avec badges et actions
 * - Design responsive et accessible
 */

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface ModalBaseProps {
  /** État d'ouverture du modal */
  open: boolean;
  /** Callback de fermeture */
  onClose: () => void;
  /** Icône du modal (composant Lucide) */
  icon: React.ReactNode;
  /** Titre principal du modal */
  title: string;
  /** Description/sous-titre du modal */
  description?: string;
  /** Contenu principal du modal */
  children: React.ReactNode;
  /** Badges à afficher dans le footer */
  badges?: Array<{
    icon?: React.ReactNode;
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  }>;
  /** Actions à afficher dans le footer */
  actions?: React.ReactNode;
  /** Classes CSS personnalisées pour le contenu */
  contentClassName?: string;
}

export function ModalBase({
  open,
  onClose,
  icon,
  title,
  description,
  children,
  badges = [],
  actions,
  contentClassName = ''
}: ModalBaseProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 overflow-hidden rounded-none">
        {/* Header moderne avec icône, titre et bouton fermer */}
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                {icon}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  {title}
                </DialogTitle>
                {description && (
                  <p className="text-sm text-muted-foreground">
                    {description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Contenu principal avec gestion du scroll */}
        <div className="flex-1 overflow-hidden">
          <div className={`h-full overflow-y-auto ${contentClassName}`}>
            {children}
          </div>
        </div>

        {/* Footer avec badges et actions */}
        <div className="px-6 py-4 border-t bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {badges.map((badge, index) => (
                <Badge 
                  key={index}
                  variant={badge.variant || 'secondary'} 
                  className="text-xs"
                >
                  {badge.icon && (
                    <span className="mr-1">{badge.icon}</span>
                  )}
                  {badge.text}
                </Badge>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              {actions || (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                >
                  Fermer
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ModalBase;
