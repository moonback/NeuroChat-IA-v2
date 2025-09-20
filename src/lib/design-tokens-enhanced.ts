/**
 * 🎨 Design Tokens Améliorés pour NeuroChat-IA-v2
 * 
 * Système de design premium avec effets visuels avancés
 * et micro-interactions sophistiquées
 */

// =====================
// COULEURS ET GRADIENTS AMÉLIORÉS
// =====================

export const colorsEnhanced = {
  // Gradients premium avec plus de profondeur
  primary: {
    50: 'from-blue-50 via-indigo-50 to-purple-50',
    100: 'from-blue-100 via-indigo-100 to-purple-100',
    500: 'from-blue-500 via-indigo-500 to-purple-500',
    600: 'from-blue-600 via-indigo-600 to-purple-600',
    700: 'from-blue-700 via-indigo-700 to-purple-700',
    900: 'from-blue-900 via-indigo-900 to-purple-900',
  },
  
  // Gradients de sécurité améliorés
  security: {
    normal: 'from-slate-50/80 via-white/95 to-blue-50/60 dark:from-slate-900/80 dark:via-slate-900/95 dark:to-slate-800/60',
    private: 'from-red-50/60 via-purple-50/70 to-blue-50/60 dark:from-red-950/40 dark:via-purple-950/50 dark:to-blue-950/40',
    child: 'from-pink-50/70 via-yellow-50/80 to-orange-50/70 dark:from-pink-950/40 dark:via-yellow-950/50 dark:to-orange-950/40',
  },
  
  // Couleurs d'état avec plus de nuances
  status: {
    success: 'from-emerald-400 via-teal-500 to-cyan-500',
    warning: 'from-amber-400 via-orange-500 to-red-500',
    error: 'from-red-400 via-rose-500 to-pink-500',
    info: 'from-blue-400 via-cyan-500 to-teal-500',
    neutral: 'from-slate-400 via-gray-500 to-zinc-500',
  },
  
  // Couleurs d'accent premium
  accent: {
    violet: 'from-violet-400 via-purple-500 to-fuchsia-500',
    emerald: 'from-emerald-400 via-teal-500 to-cyan-500',
    rose: 'from-rose-400 via-pink-500 to-fuchsia-500',
    amber: 'from-amber-400 via-yellow-500 to-orange-500',
    indigo: 'from-indigo-400 via-blue-500 to-cyan-500',
  },
  
  // Couleurs de mode spéciales
  modes: {
    premium: 'from-gradient-to-br from-yellow-400 via-orange-500 to-red-500',
    neon: 'from-cyan-400 via-blue-500 to-purple-500',
    glass: 'from-white/20 via-white/10 to-transparent',
    dark: 'from-slate-800 via-gray-900 to-black',
  }
} as const;

// =====================
// OMBRES ET EFFETS AMÉLIORÉS
// =====================

export const shadowsEnhanced = {
  // Ombres de base améliorées
  none: 'shadow-none',
  sm: 'shadow-sm shadow-black/5',
  md: 'shadow-md shadow-black/10',
  lg: 'shadow-lg shadow-black/15',
  xl: 'shadow-xl shadow-black/20',
  '2xl': 'shadow-2xl shadow-black/25',
  '3xl': 'shadow-[0_35px_60px_-12px_rgba(0,0,0,0.25)]',
  
  // Ombres colorées avec plus d'intensité
  colored: {
    blue: 'shadow-blue-500/30 shadow-lg',
    purple: 'shadow-purple-500/30 shadow-lg',
    emerald: 'shadow-emerald-500/30 shadow-lg',
    red: 'shadow-red-500/30 shadow-lg',
    pink: 'shadow-pink-500/30 shadow-lg',
    amber: 'shadow-amber-500/30 shadow-lg',
    indigo: 'shadow-indigo-500/30 shadow-lg',
  },
  
  // Effets de hover premium
  hover: {
    lift: 'hover:shadow-2xl hover:-translate-y-2 hover:shadow-black/20',
    glow: 'hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105',
    float: 'hover:shadow-3xl hover:-translate-y-3 hover:shadow-purple-500/30',
    neon: 'hover:shadow-2xl hover:shadow-cyan-500/50 hover:brightness-110',
  },
  
  // Effets spéciaux
  special: {
    glass: 'shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-4xl',
    depth: 'shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)]',
    floating: 'shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)]',
  }
} as const;

// =====================
// ANIMATIONS AMÉLIORÉES
// =====================

export const animationsEnhanced = {
  // Durées avec plus de variété
  duration: {
    instant: 'duration-100',
    fast: 'duration-200',
    normal: 'duration-300',
    slow: 'duration-500',
    slower: 'duration-700',
    slowest: 'duration-1000',
  },
  
  // Courbes d'animation avancées
  easing: {
    smooth: 'ease-out',
    bounce: 'ease-in-out',
    spring: 'cubic-bezier(0.4, 0, 0.2, 1)',
    elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smoothIn: 'ease-in',
    smoothOut: 'ease-out',
  },
  
  // Animations communes améliorées
  common: {
    fadeIn: 'animate-in fade-in-0 duration-300',
    slideUp: 'animate-in slide-in-from-bottom-4 duration-500',
    slideDown: 'animate-in slide-in-from-top-4 duration-500',
    slideLeft: 'animate-in slide-in-from-right-4 duration-500',
    slideRight: 'animate-in slide-in-from-left-4 duration-500',
    zoomIn: 'animate-in zoom-in-95 duration-300',
    scale: 'hover:scale-105 active:scale-95 transition-transform duration-200',
    rotate: 'hover:rotate-3 transition-transform duration-300',
    tilt: 'hover:rotate-1 hover:scale-105 transition-all duration-300',
  },
  
  // Animations de micro-interactions premium
  micro: {
    button: 'transition-all duration-200 hover:scale-[1.05] active:scale-[0.95] hover:shadow-lg',
    card: 'transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:-translate-y-1',
    icon: 'transition-all duration-200 hover:scale-110 hover:rotate-12',
    link: 'transition-all duration-200 hover:scale-105 hover:brightness-110',
    glow: 'transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30',
  },
  
  // Animations spéciales
  special: {
    shimmer: 'animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
    spin: 'animate-spin',
    ping: 'animate-ping',
    wiggle: 'animate-wiggle',
    float: 'animate-float',
  }
} as const;

// =====================
// COMPOSANTS AMÉLIORÉS
// =====================

export const componentsEnhanced = {
  // Styles de boutons premium
  button: {
    base: 'inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group',
    variants: {
      primary: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/30',
      secondary: 'bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-700 dark:hover:to-slate-600 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md',
      ghost: 'hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-800 dark:hover:to-slate-700 text-slate-700 dark:text-slate-300 hover:shadow-sm',
      danger: 'bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 hover:from-red-600 hover:via-rose-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl hover:shadow-red-500/30',
      success: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl hover:shadow-emerald-500/30',
      premium: 'bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl hover:shadow-amber-500/40',
      neon: 'bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 hover:from-cyan-500 hover:via-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl hover:shadow-cyan-500/50 hover:brightness-110',
      glass: 'bg-white/10 dark:bg-slate-800/20 backdrop-blur-2xl border border-white/20 dark:border-slate-700/20 hover:bg-white/20 dark:hover:bg-slate-800/30 text-slate-700 dark:text-slate-300 shadow-lg hover:shadow-xl',
    },
    sizes: {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
      xl: 'h-14 px-8 text-lg',
      icon: 'h-10 w-10',
    },
    effects: {
      shimmer: 'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] hover:before:translate-x-[100%] before:transition-transform before:duration-700',
      glow: 'hover:shadow-2xl hover:shadow-blue-500/30 transition-shadow duration-300',
      morph: 'hover:scale-105 hover:rotate-1 transition-all duration-300',
    }
  },
  
  // Styles de cartes premium
  card: {
    base: 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/60 dark:border-slate-800/60 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden',
    interactive: 'hover:scale-[1.02] hover:shadow-2xl hover:-translate-y-1 cursor-pointer group',
    glass: 'bg-white/10 dark:bg-slate-800/20 backdrop-blur-4xl border border-white/20 dark:border-slate-700/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]',
    premium: 'bg-gradient-to-br from-white/95 via-blue-50/50 to-purple-50/50 dark:from-slate-900/95 dark:via-blue-950/30 dark:to-purple-950/30 shadow-2xl hover:shadow-3xl',
    neon: 'bg-gradient-to-br from-cyan-50/80 via-blue-50/60 to-purple-50/80 dark:from-cyan-950/40 dark:via-blue-950/30 dark:to-purple-950/40 shadow-2xl hover:shadow-cyan-500/20',
  },
  
  // Styles de modales premium
  modal: {
    overlay: 'fixed inset-0 z-50 bg-black/60 backdrop-blur-md transition-opacity duration-300',
    content: 'fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/60 dark:border-slate-800/60 shadow-2xl transition-all duration-300',
    header: 'flex flex-col space-y-1.5 text-center sm:text-left',
    footer: 'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
  },
  
  // Styles d'inputs premium
  input: {
    base: 'flex h-10 w-full rounded-lg border border-input bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm px-3 py-2 text-sm shadow-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
    error: 'border-red-500 focus-visible:ring-red-500 shadow-red-500/20',
    success: 'border-emerald-500 focus-visible:ring-emerald-500 shadow-emerald-500/20',
  }
} as const;

// =====================
// UTILITAIRES AMÉLIORÉS
// =====================

export const utilsEnhanced = {
  // Classes de sécurité par mode améliorées
  getSecurityClasses: (mode: 'normal' | 'private' | 'child') => {
    const baseClasses = 'transition-all duration-700 backdrop-blur-2xl relative overflow-hidden';
    const gradientClasses = colorsEnhanced.security[mode];
    return `${baseClasses} bg-gradient-to-br ${gradientClasses}`;
  },
  
  // Classes de bouton unifiées améliorées
  getButtonClasses: (variant: keyof typeof componentsEnhanced.button.variants, size: keyof typeof componentsEnhanced.button.sizes = 'md', effects?: string[]) => {
    const baseClasses = `${componentsEnhanced.button.base} ${componentsEnhanced.button.variants[variant]} ${componentsEnhanced.button.sizes[size]}`;
    const effectClasses = effects ? effects.map(effect => componentsEnhanced.button.effects[effect as keyof typeof componentsEnhanced.button.effects]).join(' ') : '';
    return `${baseClasses} ${effectClasses}`;
  },
  
  // Classes de carte unifiées améliorées
  getCardClasses: (type: 'base' | 'interactive' | 'glass' | 'premium' | 'neon' = 'base') => {
    return `${componentsEnhanced.card.base} ${componentsEnhanced.card[type]}`;
  },
  
  // Classes d'animation unifiées améliorées
  getAnimationClasses: (type: keyof typeof animationsEnhanced.common, duration: keyof typeof animationsEnhanced.duration = 'normal') => {
    return `${animationsEnhanced.common[type]} ${animationsEnhanced.duration[duration]}`;
  },
  
  // Classes d'ombre améliorées
  getShadowClasses: (type: keyof typeof shadowsEnhanced.colored) => {
    return `${shadowsEnhanced.colored[type]} transition-shadow duration-300`;
  },
  
  // Classes de gradient améliorées
  getGradientClasses: (type: keyof typeof colorsEnhanced.accent) => {
    return `bg-gradient-to-r ${colorsEnhanced.accent[type]}`;
  }
} as const;

// =====================
// EXPORT PAR DÉFAUT
// =====================

export default {
  colorsEnhanced,
  shadowsEnhanced,
  animationsEnhanced,
  componentsEnhanced,
  utilsEnhanced,
} as const;