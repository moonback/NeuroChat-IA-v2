export interface VRSettings {
  environment: 'space' | 'forest' | 'ocean' | 'city' | 'abstract';
  avatarStyle: 'humanoid' | 'robot' | 'abstract' | 'animal';
  interfaceStyle: 'floating' | 'immersive' | 'minimal';
  voiceRecognition: boolean;
  hapticFeedback: boolean;
  autoRotation: boolean;
  lighting: 'ambient' | 'dramatic' | 'natural';
}

export const defaultVRSettings: VRSettings = {
  environment: 'space',
  avatarStyle: 'robot',
  interfaceStyle: 'floating',
  voiceRecognition: true,
  hapticFeedback: true,
  autoRotation: false,
  lighting: 'ambient'
};

export const vrEnvironments = {
  space: {
    skyColor: '#0f0f23',
    groundColor: '#1a1a2e',
    ambientLight: '#404040',
    directionalLight: '#ffffff',
    fog: true,
    fogColor: '#0f0f23',
    fogDensity: 0.01
  },
  forest: {
    skyColor: '#87CEEB',
    groundColor: '#228B22',
    ambientLight: '#90EE90',
    directionalLight: '#FFD700',
    fog: true,
    fogColor: '#90EE90',
    fogDensity: 0.005
  },
  ocean: {
    skyColor: '#1E90FF',
    groundColor: '#006994',
    ambientLight: '#87CEEB',
    directionalLight: '#FFFFFF',
    fog: true,
    fogColor: '#87CEEB',
    fogDensity: 0.008
  },
  city: {
    skyColor: '#696969',
    groundColor: '#2F4F4F',
    ambientLight: '#C0C0C0',
    directionalLight: '#FFFFFF',
    fog: true,
    fogColor: '#696969',
    fogDensity: 0.015
  },
  abstract: {
    skyColor: '#FF1493',
    groundColor: '#4B0082',
    ambientLight: '#FF69B4',
    directionalLight: '#FFFFFF',
    fog: false,
    fogColor: '#FF1493',
    fogDensity: 0
  }
};

export const avatarStyles = {
  humanoid: {
    head: { geometry: 'sphere', radius: 0.3, color: '#FFB6C1' },
    body: { geometry: 'cylinder', radius: 0.1, height: 0.8, color: '#4169E1' },
    base: { geometry: 'box', width: 0.6, height: 0.1, depth: 0.3, color: '#4169E1' }
  },
  robot: {
    head: { geometry: 'sphere', radius: 0.3, color: '#50c878', emissive: '#50c878', emissiveIntensity: 0.2 },
    body: { geometry: 'cylinder', radius: 0.1, height: 0.8, color: '#50c878' },
    base: { geometry: 'box', width: 0.6, height: 0.1, depth: 0.3, color: '#50c878' }
  },
  abstract: {
    head: { geometry: 'octahedron', radius: 0.3, color: '#FFD700', emissive: '#FFD700', emissiveIntensity: 0.3 },
    body: { geometry: 'torus', radius: 0.2, radiusTubular: 0.05, color: '#FFD700' },
    base: { geometry: 'icosahedron', radius: 0.2, color: '#FFD700' }
  },
  animal: {
    head: { geometry: 'sphere', radius: 0.25, color: '#8B4513' },
    body: { geometry: 'cylinder', radius: 0.08, height: 0.6, color: '#8B4513' },
    base: { geometry: 'box', width: 0.4, height: 0.08, depth: 0.2, color: '#8B4513' }
  }
};

export const interfaceStyles = {
  floating: {
    position: '0 1.5 -3',
    scale: '2 1.5 0.1',
    opacity: 0.9
  },
  immersive: {
    position: '0 0 -2',
    scale: '3 2 0.1',
    opacity: 0.95
  },
  minimal: {
    position: '0 1 -4',
    scale: '1.5 1 0.1',
    opacity: 0.8
  }
}; 