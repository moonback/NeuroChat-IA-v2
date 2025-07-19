import React, { useState } from 'react';
import { VRSceneConfig, VRUISettings, VRAudioConfig } from './types';

interface VRSettingsProps {
  open: boolean;
  sceneConfig: VRSceneConfig;
  uiSettings: VRUISettings;
  audioConfig: VRAudioConfig;
  onSceneConfigChange: (config: VRSceneConfig) => void;
  onUISettingsChange: (settings: VRUISettings) => void;
  onAudioConfigChange: (config: VRAudioConfig) => void;
  onClose: () => void;
}

export const VRSettings: React.FC<VRSettingsProps> = ({
  open,
  sceneConfig,
  uiSettings,
  audioConfig,
  onSceneConfigChange,
  onUISettingsChange,
  onAudioConfigChange,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'scene' | 'ui' | 'audio'>('scene');

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Paramètres VR</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Onglets */}
        <div className="flex mb-4 border-b">
          <button
            onClick={() => setActiveTab('scene')}
            className={`px-4 py-2 ${activeTab === 'scene' ? 'border-b-2 border-blue-500' : ''}`}
          >
            Scène
          </button>
          <button
            onClick={() => setActiveTab('ui')}
            className={`px-4 py-2 ${activeTab === 'ui' ? 'border-b-2 border-blue-500' : ''}`}
          >
            Interface
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`px-4 py-2 ${activeTab === 'audio' ? 'border-b-2 border-blue-500' : ''}`}
          >
            Audio
          </button>
        </div>

        {/* Contenu des onglets */}
        {activeTab === 'scene' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Couleur de fond</label>
              <input
                type="color"
                value={sceneConfig.backgroundColor}
                onChange={(e) => onSceneConfigChange({
                  ...sceneConfig,
                  backgroundColor: e.target.value
                })}
                className="w-full h-10 rounded border"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Intensité lumière ambiante</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={sceneConfig.ambientLight.intensity}
                onChange={(e) => onSceneConfigChange({
                  ...sceneConfig,
                  ambientLight: {
                    ...sceneConfig.ambientLight,
                    intensity: parseFloat(e.target.value)
                  }
                })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Intensité lumière directionnelle</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={sceneConfig.directionalLight.intensity}
                onChange={(e) => onSceneConfigChange({
                  ...sceneConfig,
                  directionalLight: {
                    ...sceneConfig.directionalLight,
                    intensity: parseFloat(e.target.value)
                  }
                })}
                className="w-full"
              />
            </div>
          </div>
        )}

        {activeTab === 'ui' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Distance des messages</label>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={uiSettings.messageDistance}
                onChange={(e) => onUISettingsChange({
                  ...uiSettings,
                  messageDistance: parseFloat(e.target.value)
                })}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{uiSettings.messageDistance}m</span>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Échelle des messages</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={uiSettings.messageScale}
                onChange={(e) => onUISettingsChange({
                  ...uiSettings,
                  messageScale: parseFloat(e.target.value)
                })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Échelle de l'avatar</label>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={uiSettings.avatarScale}
                onChange={(e) => onUISettingsChange({
                  ...uiSettings,
                  avatarScale: parseFloat(e.target.value)
                })}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Distance du panneau</label>
              <input
                type="range"
                min="1"
                max="5"
                step="0.1"
                value={uiSettings.panelDistance}
                onChange={(e) => onUISettingsChange({
                  ...uiSettings,
                  panelDistance: parseFloat(e.target.value)
                })}
                className="w-full"
              />
              <span className="text-xs text-gray-500">{uiSettings.panelDistance}m</span>
            </div>
          </div>
        )}

        {activeTab === 'audio' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Audio activé</label>
              <input
                type="checkbox"
                checked={audioConfig.enabled}
                onChange={(e) => onAudioConfigChange({
                  ...audioConfig,
                  enabled: e.target.checked
                })}
                className="rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Volume</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={audioConfig.volume}
                onChange={(e) => onAudioConfigChange({
                  ...audioConfig,
                  volume: parseFloat(e.target.value)
                })}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Audio spatialisé</label>
              <input
                type="checkbox"
                checked={audioConfig.spatialAudio}
                onChange={(e) => onAudioConfigChange({
                  ...audioConfig,
                  spatialAudio: e.target.checked
                })}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Sons de feedback</label>
              <input
                type="checkbox"
                checked={audioConfig.feedbackSounds}
                onChange={(e) => onAudioConfigChange({
                  ...audioConfig,
                  feedbackSounds: e.target.checked
                })}
                className="rounded"
              />
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Annuler
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Appliquer
          </button>
        </div>
      </div>
    </div>
  );
}; 