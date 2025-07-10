import React from 'react';

interface PrivateModeBannerProps {
  visible: boolean;
}

export const PrivateModeBanner: React.FC<PrivateModeBannerProps> = ({ visible }) => {
  if (!visible) return null;
  return (
    <div className="w-full flex justify-center animate-slideDown">
      <div className="mt-1 mb-2 px-5 py-2 rounded-xl shadow-lg bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 text-white font-semibold flex items-center gap-2 border border-red-200 dark:border-red-700">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><rect x="5" y="11" width="14" height="9" rx="2" className="fill-white/20" /><path d="M12 17v-2" className="stroke-white" /><path d="M7 11V7a5 5 0 0110 0v4" className="stroke-white" /></svg>
        Mode privé activé : aucun message n'est sauvegardé, tout sera effacé à la fermeture.
      </div>
    </div>
  );
}; 