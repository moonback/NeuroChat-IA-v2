import React, { useState } from 'react';
import { X, Code2, Info } from 'lucide-react';

interface CodeModeBannerProps {
  visible: boolean;
  onClose?: () => void;
  message?: string;
  showCloseButton?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export const CodeModeBanner: React.FC<CodeModeBannerProps> = ({
  visible,
  onClose,
  message = "Mode code activé : rendu monospace et mise en forme des blocs de code.",
  showCloseButton = true,
  autoHide = false,
  autoHideDelay = 5000,
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
      <div
        className="
          relative mt-1 mb-2 px-4 py-3 rounded-xl shadow-lg text-white font-medium
          flex items-center gap-3 border backdrop-blur-sm max-w-4xl mx-4
          transition-all duration-300 ease-in-out hover:shadow-xl
          bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500
          border-blue-200 dark:border-blue-700
        "
      >
        <div className="flex-shrink-0">
          <Code2 className="w-5 h-5 text-white" />
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

export default CodeModeBanner;


