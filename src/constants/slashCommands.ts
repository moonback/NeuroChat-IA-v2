import type { SlashCommand } from '@/types/voiceInput';

/**
 * Commandes slash supportées par le composant VoiceInput
 */
export const SLASH_COMMANDS: SlashCommand[] = [
  { 
    cmd: '/memoir', 
    label: 'Ajouter à la mémoire', 
    icon: '💾' 
  },
  { 
    cmd: '/supp', 
    label: 'Supprimer de la mémoire', 
    icon: '🗑️' 
  },
  { 
    cmd: '/memlist', 
    label: 'Lister 5 éléments', 
    icon: '📋' 
  },
];
