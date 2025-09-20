/**
 * 🎨 Design Tokens Unifiés pour NeuroChat-IA-v2
 * 
 * Système de design cohérent avec tokens réutilisables
 * pour une expérience utilisateur harmonieuse
 */

// =====================
// COULEURS ET GRADIENTS
// =====================

export const colors = {
  // Couleurs de base
  primary: {
    50: 'from-blue-50 to-indigo-50',
    100: 'from-blue-100 to-indigo-100',
    500: 'from-blue-500 to-indigo-500',
    600: 'from-blue-600 to-indigo-600',
    700: 'from-blue-700 to-indigo-700',
  },
  
  // Gradients de sécurité
  security: {
    normal: 'from-slate-50/70 via-white/90 to-blue-50/50 dark:from-slate-900/70 dark:via-slate-900/90 dark:to-slate-800/50',
    private: 'from-red-50/40 via-purple-50/50 to-blue-50/40 dark:from-red-950/30 dark:via-purple-950/40 dark:to-blue-950/30',
    child: 'from-pink-50/50 via-yellow-50/60 to-orange-50/50 dark:from-pink-950/30 dark:via-yellow-950/40 dark:to-orange-950/30',
  },
  
  // Couleurs d'état
  status: {
    success: 'from-emerald-500 to-teal-500',
    warning: 'from-amber-500 to-orange-500',
    error: 'from-red-500 to-rose-500',
    info: 'from-blue-500 to-cyan-500',
  },
  
  // Couleurs d'accent
  accent: {
    violet: 'from-violet-500 to-purple-500',
    emerald: 'from-emerald-500 to-teal-500',
    rose: 'from-rose-500 to-pink-500',
    amber: 'from-amber-500 to-yellow-500',
  }
} as const;

// =====================
// ESPACEMENT ET TAILLES
// =====================

export const spacing = {
  // Espacement cohérent
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
  
  // Padding des composants
  component: {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  },
  
  // Marges
  margin: {
    sm: 'm-2',
    md: 'm-4',
    lg: 'm-6',
    xl: 'm-8',
  }
} as const;

// =====================
// BORDER RADIUS
// =====================

export const borderRadius = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  full: 'rounded-full',
  
  // Border radius spécifiques
  button: 'rounded-lg',
  card: 'rounded-2xl',
  modal: 'rounded-2xl',
  input: 'rounded-lg',
} as const;

// =====================
// OMBRES ET EFFETS
// =====================

export const shadows = {
  none: 'shadow-none',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  '2xl': 'shadow-2xl',
  
  // Ombres colorées
  colored: {
    blue: 'shadow-blue-500/20',
    purple: 'shadow-purple-500/20',
    emerald: 'shadow-emerald-500/20',
    red: 'shadow-red-500/20',
    pink: 'shadow-pink-500/20',
  },
  
  // Effets de hover
  hover: {
    lift: 'hover:shadow-xl hover:-translate-y-1',
    glow: 'hover:shadow-2xl hover:shadow-blue-500/25',
  }
} as const;

// =====================
// ANIMATIONS ET TRANSITIONS
// =====================

export const animations = {
  // Durées standardisées
  duration: {
    fast: 'duration-200',
    normal: 'duration-300',
    slow: 'duration-500',
    slower: 'duration-700',
  },
  
  // Courbes d'animation
  easing: {
    smooth: 'ease-out',
    bounce: 'ease-in-out',
    spring: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  // Animations communes
  common: {
    fadeIn: 'animate-in fade-in-0',
    slideUp: 'animate-in slide-in-from-bottom-2',
    slideDown: 'animate-in slide-in-from-top-2',
    slideLeft: 'animate-in slide-in-from-right-2',
    slideRight: 'animate-in slide-in-from-left-2',
    zoomIn: 'animate-in zoom-in-95',
    scale: 'hover:scale-105 active:scale-95',
  },
  
  // Animations de micro-interactions
  micro: {
    button: 'transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
    card: 'transition-all duration-300 hover:shadow-xl hover:scale-[1.02]',
    icon: 'transition-transform duration-200 hover:scale-110',
  }
} as const;

// =====================
// TYPOGRAPHIE
// =====================

export const typography = {
  // Tailles de police
  size: {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl',
    '4xl': 'text-4xl',
    '5xl': 'text-5xl',
  },
  
  // Poids de police
  weight: {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    black: 'font-black',
  },
  
  // Hauteurs de ligne
  leading: {
    tight: 'leading-tight',
    normal: 'leading-normal',
    relaxed: 'leading-relaxed',
    loose: 'leading-loose',
  }
} as const;

// =====================
// COMPOSANTS PRÉDÉFINIS
// =====================

export const components = {
  // Styles de boutons unifiés
  button: {
    base: 'inline-flex items-center justify-center whitespace-nowrap font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
    variants: {
      primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl',
      secondary: 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
      ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300',
      danger: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl',
      success: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl',
    },
    sizes: {
      sm: 'h-8 px-3 text-sm',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
      xl: 'h-14 px-8 text-lg',
      icon: 'h-10 w-10',
    }
  },
  
  // Styles de cartes unifiés
  card: {
    base: 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/60 dark:border-slate-800/60 shadow-xl hover:shadow-2xl transition-all duration-300',
    interactive: 'hover:scale-[1.02] hover:shadow-2xl cursor-pointer',
    glass: 'bg-white/10 dark:bg-slate-800/20 backdrop-blur-2xl border border-white/20 dark:border-slate-700/20',
  },
  
  // Styles de modales unifiés
  modal: {
    overlay: 'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
    content: 'fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-white/60 dark:border-slate-800/60 shadow-2xl',
    header: 'flex flex-col space-y-1.5 text-center sm:text-left',
    footer: 'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
  },
  
  // Styles d'inputs unifiés
  input: {
    base: 'flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
    error: 'border-red-500 focus-visible:ring-red-500',
  }
} as const;

// =====================
// UTILITAIRES
// =====================

export const utils = {
  // Classes de sécurité par mode
  getSecurityClasses: (mode: 'normal' | 'private' | 'child') => {
    const baseClasses = 'transition-all duration-700 backdrop-blur-2xl';
    const gradientClasses = colors.security[mode];
    return `${baseClasses} bg-gradient-to-br ${gradientClasses}`;
  },
  
  // Classes de bouton unifiées
  getButtonClasses: (variant: keyof typeof components.button.variants, size: keyof typeof components.button.sizes = 'md') => {
    return `${components.button.base} ${components.button.variants[variant]} ${components.button.sizes[size]} ${borderRadius.button}`;
  },
  
  // Classes de carte unifiées
  getCardClasses: (interactive = false) => {
    const baseClasses = `${components.card.base} ${borderRadius.card}`;
    return interactive ? `${baseClasses} ${components.card.interactive}` : baseClasses;
  },
  
  // Classes d'animation unifiées
  getAnimationClasses: (type: keyof typeof animations.common) => {
    return `${animations.common[type]} ${animations.duration.normal} ${animations.easing.smooth}`;
  }
} as const;

// =====================
// EXPORT PAR DÉFAUT
// =====================

export default {
  colors,
  spacing,
  borderRadius,
  shadows,
  animations,
  typography,
  components,
  utils,
} as const;
