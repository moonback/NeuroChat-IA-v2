import React from 'react';

interface VocalModeIndicatorProps {
  visible: boolean;
}

export const VocalModeIndicator: React.FC<VocalModeIndicatorProps> = ({ visible }) => {
  if (!visible) return null;
  return (
    <div className="fixed top-2 right-2 z-50 bg-blue-600 text-white px-4 py-2 rounded-xl shadow-lg animate-pulse">
      Mode vocal automatique activé
    </div>
  );
}; 