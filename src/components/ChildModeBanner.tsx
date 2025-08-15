import React, { useState } from 'react';
import { X, Smile, Shield, Info } from 'lucide-react';

interface ChildModeBannerProps {
  visible: boolean;
  onClose?: () => void;
  message?: string;
  variant?: 'friendly' | 'info' | 'secure';
  showCloseButton?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export const ChildModeBanner: React.FC<ChildModeBannerProps> = ({
  visible,
  onClose,
  message = "Mode enfant activé : contenu adapté, ton bienveillant et activités ludiques.",
  variant = 'friendly',
  showCloseButton = true,
  autoHide = false,
  autoHideDelay = 5000
}) => {
  const [isClosing, setIsClosing] = useState(false);

  React.useEffect(() => {
    if (autoHide && visible) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoHideDelay);
      return () => clearTimeout(timer);
    }
  }, [visible, autoHide, autoHideDelay]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose?.();
      setIsClosing(false);
    }, 300);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'info':
        return 'bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-500 border-blue-200 dark:border-blue-700';
      case 'secure':
        return 'bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 border-green-200 dark:border-green-700';
      case 'friendly':
      default:
        return 'bg-gradient-to-r from-pink-500 via-rose-500 to-orange-400 border-pink-200 dark:border-pink-700';
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'info':
        return <Info className="w-5 h-5 text-white" />;
      case 'secure':
        return <Shield className="w-5 h-5 text-white" />;
      case 'friendly':
      default:
        return <Smile className="w-5 h-5 text-white" />;
    }
  };

  if (!visible) return null;

  return (
    <div 
      className={`
        w-full flex justify-center transition-all duration-300 ease-in-out
        ${isClosing ? 'animate-slideUp opacity-0' : 'animate-slideDown opacity-100'}
      `}
      role="banner"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className={`
        relative mt-1 mb-2 px-4 py-3 rounded-xl shadow-lg text-white font-medium 
        flex items-center gap-3 border backdrop-blur-sm max-w-4xl mx-4
        transition-all duration-300 ease-in-out hover:shadow-xl
        ${getVariantStyles()}
     `}>
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 text-sm leading-relaxed">
          {message}
        </div>
        {showCloseButton && onClose && (
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-white/20 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Fermer le banner"
            title="Fermer"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        )}
        {autoHide && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/30 rounded-b-xl overflow-hidden">
            <div 
              className="h-full bg-white/60 animate-shrink"
              style={{ animationDuration: `${autoHideDelay}ms` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChildModeBanner;


