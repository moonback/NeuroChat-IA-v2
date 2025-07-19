import React from 'react';
import { Headset, Monitor } from 'lucide-react';

interface VRModeToggleProps {
  isVRMode: boolean;
  onToggleVRMode: () => void;
  className?: string;
}

export const VRModeToggle: React.FC<VRModeToggleProps> = ({
  isVRMode,
  onToggleVRMode,
  className = ''
}) => {
  return (
    <button
      onClick={onToggleVRMode}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105 ${
        isVRMode
          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
          : 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800'
      } ${className}`}
      title={isVRMode ? 'Sortir du mode VR' : 'Entrer en mode VR'}
    >
      {isVRMode ? (
        <>
          <Monitor className="w-5 h-5" />
          <span className="font-semibold">Mode Écran</span>
        </>
      ) : (
        <>
          <Headset className="w-5 h-5" />
          <span className="font-semibold">Mode VR</span>
        </>
      )}
    </button>
  );
}; 