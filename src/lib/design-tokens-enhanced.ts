/**
 * 🎨 Design Tokens Améliorés pour NeuroChat-IA-v2
 * 
 * Système de design avancé avec effets modernes et sophistiqués
 * pour une expérience utilisateur premium
 */

// =====================
// COULEURS ET GRADIENTS AVANCÉS
// =====================

export const colorsEnhanced = {
  // Gradients premium avec plus de nuances
  premium: {
    aurora: 'from-purple-400 via-pink-500 to-red-500',
    ocean: 'from-blue-400 via-cyan-500 to-teal-500',
    sunset: 'from-orange-400 via-red-500 to-pink-500',
    forest: 'from-green-400 via-emerald-500 to-teal-500',
    galaxy: 'from-indigo-400 via-purple-500 to-pink-500',
    fire: 'from-yellow-400 via-orange-500 to-red-500',
  },
  
  // Gradients de sécurité améliorés avec plus de profondeur
  securityEnhanced: {
    normal: 'from-slate-50/80 via-white/95 to-blue-50/60 dark:from-slate-900/80 dark:via-slate-900/95 dark:to-slate-800/60',
    private: 'from-red-50/50 via-purple-50/60 to-blue-50/50 dark:from-red-950/40 dark:via-purple-950/50 dark:to-blue-950/40',
    child: 'from-pink-50/60 via-yellow-50/70 to-orange-50/60 dark:from-pink-950/40 dark:via-yellow-950/50 dark:to-orange-950/40',
  },
  
  // Couleurs avec effets de brillance
  shimmer: {
    gold: 'from-yellow-300 via-yellow-400 to-yellow-500',
    silver: 'from-gray-300 via-gray-400 to-gray-500',
    bronze: 'from-orange-300 via-orange-400 to-orange-500',
    platinum: 'from-slate-300 via-slate-400 to-slate-500',
  },
  
  // Couleurs néon pour les accents
  neon: {
    blue: 'text-cyan-400 shadow-cyan-400/50',
    purple: 'text-purple-400 shadow-purple-400/50',
    pink: 'text-pink-400 shadow-pink-400/50',
    green: 'text-emerald-400 shadow-emerald-400/50',
  }
} as const;

// =====================
// EFFETS VISUELS AVANCÉS
// =====================

export const effects = {
  // Effets de glassmorphism améliorés
  glass: {
    light: 'bg-white/20 backdrop-blur-xl border border-white/30 shadow-xl',
    medium: 'bg-white/30 backdrop-blur-2xl border border-white/40 shadow-2xl',
    heavy: 'bg-white/40 backdrop-blur-3xl border border-white/50 shadow-2xl',
    dark: 'bg-slate-900/20 backdrop-blur-xl border border-slate-700/30 shadow-xl',
  },
  
  // Effets de glow (lueur)
  glow: {
    blue: 'shadow-blue-500/25 hover:shadow-blue-500/40',
    purple: 'shadow-purple-500/25 hover:shadow-purple-500/40',
    emerald: 'shadow-emerald-500/25 hover:shadow-emerald-500/40',
    red: 'shadow-red-500/25 hover:shadow-red-500/40',
    pink: 'shadow-pink-500/25 hover:shadow-pink-500/40',
    gold: 'shadow-yellow-500/25 hover:shadow-yellow-500/40',
  },
  
  // Effets de shimmer (scintillement)
  shimmer: {
    base: 'relative overflow-hidden',
    animation: 'before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:animate-shimmer',
  },
  
  // Effets de morphing
  morph: {
    button: 'hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-out',
    card: 'hover:scale-[1.02] hover:shadow-2xl hover:rotate-1 transition-all duration-500 ease-out',
    icon: 'hover:scale-110 hover:rotate-12 transition-all duration-300 ease-out',
  },
  
  // Effets de particules
  particles: {
    floating: 'animate-float',
    spinning: 'animate-spin-slow',
    pulsing: 'animate-pulse-slow',
    bouncing: 'animate-bounce-slow',
  }
} as const;

// =====================
// ANIMATIONS AVANCÉES
// =====================

export const animationsEnhanced = {
  // Animations de micro-interactions sophistiquées
  micro: {
    buttonPress: 'active:scale-95 active:shadow-inner transition-all duration-150 ease-out',
    buttonHover: 'hover:scale-105 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out',
    cardHover: 'hover:scale-[1.02] hover:shadow-2xl hover:rotate-1 transition-all duration-500 ease-out',
    iconSpin: 'hover:rotate-180 transition-transform duration-500 ease-out',
    iconBounce: 'hover:animate-bounce transition-all duration-300 ease-out',
  },
  
  // Animations de page
  page: {
    slideIn: 'animate-in slide-in-from-bottom-4 fade-in-0 duration-500',
    slideOut: 'animate-out slide-out-to-bottom-4 fade-out-0 duration-300',
    fadeIn: 'animate-in fade-in-0 duration-700',
    fadeOut: 'animate-out fade-out-0 duration-300',
  },
  
  // Animations de chargement
  loading: {
    spinner: 'animate-spin',
    dots: 'animate-pulse',
    wave: 'animate-wave',
    shimmer: 'animate-shimmer',
  },
  
  // Animations de notification
  notification: {
    slideIn: 'animate-in slide-in-from-right-4 fade-in-0 duration-300',
    slideOut: 'animate-out slide-out-to-right-4 fade-out-0 duration-200',
  }
} as const;

// =====================
// COMPOSANTS AMÉLIORÉS
// =====================

export const componentsEnhanced = {
  // Boutons avec effets avancés
  button: {
    base: 'relative inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 overflow-hidden',
    
    variants: {
      primary: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/25',
      secondary: 'bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-700 dark:hover:to-slate-600 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-md hover:shadow-lg',
      ghost: 'hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-800 dark:hover:to-slate-700 text-slate-700 dark:text-slate-300',
      danger: 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-700 hover:via-rose-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl hover:shadow-red-500/25',
      success: 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-xl hover:shadow-emerald-500/25',
      premium: 'bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/25',
    },
    
    sizes: {
      sm: 'h-8 px-3 text-sm rounded-lg',
      md: 'h-10 px-4 text-sm rounded-xl',
      lg: 'h-12 px-6 text-base rounded-xl',
      xl: 'h-14 px-8 text-lg rounded-2xl',
      icon: 'h-10 w-10 rounded-xl',
    },
    
    effects: {
      shimmer: 'before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:animate-shimmer',
      glow: 'hover:shadow-2xl hover:shadow-blue-500/25',
      morph: 'hover:scale-105 hover:shadow-xl hover:-translate-y-1',
    }
  },
  
  // Cartes avec effets avancés
  card: {
    base: 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 shadow-xl transition-all duration-300',
    interactive: 'hover:scale-[1.02] hover:shadow-2xl hover:rotate-1 cursor-pointer',
    glass: 'bg-white/10 dark:bg-slate-800/20 backdrop-blur-2xl border border-white/20 dark:border-slate-700/20',
    premium: 'bg-gradient-to-br from-white/95 via-slate-50/95 to-blue-50/95 dark:from-slate-900/95 dark:via-slate-800/95 dark:to-slate-700/95 backdrop-blur-2xl border border-white/60 dark:border-slate-800/60 shadow-2xl',
    neon: 'bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/10',
  },
  
  // Modales avec effets avancés
  modal: {
    overlay: 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in-0 duration-300',
    content: 'fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/60 dark:border-slate-800/60 shadow-2xl rounded-2xl animate-in zoom-in-95 fade-in-0 duration-300',
    header: 'flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-0',
    footer: 'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-0',
  },
  
  // Inputs avec effets avancés
  input: {
    base: 'flex h-10 w-full rounded-xl border border-input bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-3 py-2 text-sm shadow-sm transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
    error: 'border-red-500 focus-visible:ring-red-500 shadow-red-500/10',
    success: 'border-emerald-500 focus-visible:ring-emerald-500 shadow-emerald-500/10',
    premium: 'bg-gradient-to-r from-white/80 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-700/80 backdrop-blur-sm border border-white/60 dark:border-slate-700/60 shadow-lg',
  }
} as const;

// =====================
// UTILITAIRES AVANCÉS
// =====================

export const utilsEnhanced = {
  // Classes de sécurité améliorées par mode
  getSecurityClasses: (mode: 'normal' | 'private' | 'child') => {
    const baseClasses = 'transition-all duration-700 backdrop-blur-2xl';
    const gradientClasses = colorsEnhanced.securityEnhanced[mode];
    return `${baseClasses} bg-gradient-to-br ${gradientClasses}`;
  },
  
  // Classes de bouton avec effets
  getButtonClasses: (
    variant: keyof typeof componentsEnhanced.button.variants, 
    size: keyof typeof componentsEnhanced.button.sizes = 'md',
    effect?: keyof typeof componentsEnhanced.button.effects
  ) => {
    const baseClasses = `${componentsEnhanced.button.base} ${componentsEnhanced.button.variants[variant]} ${componentsEnhanced.button.sizes[size]}`;
    const effectClasses = effect ? componentsEnhanced.button.effects[effect] : '';
    return `${baseClasses} ${effectClasses}`;
  },
  
  // Classes de carte avec effets
  getCardClasses: (type: keyof typeof componentsEnhanced.card = 'base', interactive = false) => {
    const baseClasses = componentsEnhanced.card[type];
    const interactiveClasses = interactive ? componentsEnhanced.card.interactive : '';
    return `${baseClasses} ${interactiveClasses}`;
  },
  
  // Classes d'animation avec effets
  getAnimationClasses: (type: keyof typeof animationsEnhanced.micro) => {
    return `${animationsEnhanced.micro[type]} ${animationsEnhanced.micro.buttonHover}`;
  },
  
  // Classes de glow dynamique
  getGlowClasses: (color: keyof typeof effects.glow) => {
    return `shadow-lg ${effects.glow[color]}`;
  }
} as const;

// =====================
// EXPORT PAR DÉFAUT
// =====================

export default {
  colorsEnhanced,
  effects,
  animationsEnhanced,
  componentsEnhanced,
  utilsEnhanced,
} as const;
