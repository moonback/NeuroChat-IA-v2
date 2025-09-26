/**
 * 🎨 Exemple d'utilisation de ModalBase
 * 
 * Ce fichier montre comment utiliser le composant ModalBase
 * pour créer des modales avec un design unifié
 */

import { ModalBase } from '@/components/ui/modal-base';
import { Settings, Volume2, Mic } from 'lucide-react';

// Exemple d'utilisation simple
export function ExampleModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <ModalBase
      open={open}
      onClose={onClose}
      icon={<Settings className="w-5 h-5 text-white" />}
      title="Exemple de Modal"
      description="Ceci est un exemple d'utilisation du composant ModalBase"
      badges={[
        { icon: <Volume2 className="w-3 h-3" />, text: "Audio", variant: "secondary" },
        { icon: <Mic className="w-3 h-3" />, text: "Vocal", variant: "outline" }
      ]}
    >
      <div className="p-6">
        <p>Contenu de la modal ici...</p>
      </div>
    </ModalBase>
  );
}

// Exemple d'utilisation avec actions personnalisées
export function ExampleModalWithActions({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <ModalBase
      open={open}
      onClose={onClose}
      icon={<Settings className="w-5 h-5 text-white" />}
      title="Modal avec Actions"
      description="Exemple avec des actions personnalisées dans le footer"
      badges={[
        { text: "Configuration", variant: "default" },
        { text: "Avancée", variant: "outline" }
      ]}
      actions={
        <>
          <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
            Sauvegarder
          </button>
          <button className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600">
            Annuler
          </button>
        </>
      }
    >
      <div className="p-6">
        <p>Contenu avec actions personnalisées...</p>
      </div>
    </ModalBase>
  );
}
