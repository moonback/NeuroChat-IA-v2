import React, { useState, useEffect } from 'react';

interface VRDetectionProps {
  onVRSupported: (supported: boolean) => void;
}

export const VRDetection: React.FC<VRDetectionProps> = ({ onVRSupported }) => {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkVRSupport = async () => {
      try {
        // Vérifier si WebXR est disponible
        if ('xr' in navigator && navigator.xr) {
          try {
            const supported = await navigator.xr!.isSessionSupported('immersive-vr');
            onVRSupported(supported);
          } catch (xrError) {
            console.log('WebXR session non supportée:', xrError);
            onVRSupported(false);
          }
        } else {
          console.log('WebXR API non disponible');
          onVRSupported(false);
        }
      } catch (error) {
        console.log('Erreur lors de la vérification WebXR:', error);
        onVRSupported(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkVRSupport();
  }, [onVRSupported]);

  if (isChecking) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Vérification de la compatibilité VR...</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}; 