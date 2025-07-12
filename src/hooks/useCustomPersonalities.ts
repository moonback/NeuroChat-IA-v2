import { useState, useEffect, useCallback } from 'react';
import { User, Brain, Heart, Zap, Coffee, Sparkles, BookOpen, Users, Target, Lightbulb, Music, Gamepad2 } from 'lucide-react';

export interface CustomPersonality {
  id: string;
  label: string;
  iconName: string; // Nom de l'icône (sera mappé vers l'icône React)
  color: string;
  bg: string;
  description: string;
  detailedDescription: string;
  systemPromptAddition: string;
  category: 'professionnel' | 'social' | 'creatif' | 'expert';
  traits: string[];
  isCustom: true; // Marqueur pour identifier les personnalités personnalisées
  createdAt: string;
  updatedAt: string;
}

// Mapping des noms d'icônes vers les composants React
const iconMap = {
  User,
  Brain,
  Heart,
  Zap,
  Coffee,
  Sparkles,
  BookOpen,
  Users,
  Target,
  Lightbulb,
  Music,
  Gamepad2,
};

export const availableIcons = Object.keys(iconMap);

export const getIconComponent = (iconName: string) => {
  return iconMap[iconName as keyof typeof iconMap] || User;
};

const STORAGE_KEY = 'custom-personalities';

export function useCustomPersonalities() {
  const [customPersonalities, setCustomPersonalities] = useState<CustomPersonality[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les personnalités depuis localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCustomPersonalities(parsed);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des personnalités personnalisées:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sauvegarder dans localStorage
  const saveToStorage = useCallback((personalities: CustomPersonality[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(personalities));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des personnalités personnalisées:', error);
    }
  }, []);

  // Ajouter une personnalité personnalisée
  const addCustomPersonality = useCallback((personalityData: Omit<CustomPersonality, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>) => {
    const newPersonality: CustomPersonality = {
      ...personalityData,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCustomPersonalities(prev => {
      const updated = [...prev, newPersonality];
      saveToStorage(updated);
      return updated;
    });

    return newPersonality;
  }, [saveToStorage]);

  // Modifier une personnalité personnalisée
  const updateCustomPersonality = useCallback((id: string, updates: Partial<Omit<CustomPersonality, 'id' | 'isCustom' | 'createdAt'>>) => {
    setCustomPersonalities(prev => {
      const updated = prev.map(p => 
        p.id === id 
          ? { ...p, ...updates, updatedAt: new Date().toISOString() }
          : p
      );
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Supprimer une personnalité personnalisée
  const deleteCustomPersonality = useCallback((id: string) => {
    setCustomPersonalities(prev => {
      const updated = prev.filter(p => p.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Obtenir une personnalité personnalisée par ID
  const getCustomPersonalityById = useCallback((id: string) => {
    return customPersonalities.find(p => p.id === id);
  }, [customPersonalities]);

  // Dupliquer une personnalité personnalisée
  const duplicateCustomPersonality = useCallback((id: string) => {
    const original = customPersonalities.find(p => p.id === id);
    if (!original) return null;

    const duplicated = {
      ...original,
      label: `${original.label} (Copie)`,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setCustomPersonalities(prev => {
      const updated = [...prev, duplicated];
      saveToStorage(updated);
      return updated;
    });

    return duplicated;
  }, [customPersonalities, saveToStorage]);

  // Exporter les personnalités personnalisées
  const exportCustomPersonalities = useCallback(() => {
    const dataStr = JSON.stringify(customPersonalities, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `personnalites-personnalisees-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [customPersonalities]);

  // Importer les personnalités personnalisées
  const importCustomPersonalities = useCallback(async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      
      // Validation basique des données
      if (!Array.isArray(imported)) {
        throw new Error('Format de fichier invalide');
      }

      const validPersonalities = imported.filter(p => 
        p.label && p.description && p.systemPromptAddition && p.category
      );

      if (validPersonalities.length === 0) {
        throw new Error('Aucune personnalité valide trouvée');
      }

      // Ajouter un suffixe pour éviter les conflits d'ID
      const processedPersonalities = validPersonalities.map(p => ({
        ...p,
        id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        isCustom: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      setCustomPersonalities(prev => {
        const updated = [...prev, ...processedPersonalities];
        saveToStorage(updated);
        return updated;
      });

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'importation:', error);
      return false;
    }
  }, [saveToStorage]);

  // Réinitialiser toutes les personnalités personnalisées
  const resetCustomPersonalities = useCallback(() => {
    setCustomPersonalities([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    customPersonalities,
    loading,
    addCustomPersonality,
    updateCustomPersonality,
    deleteCustomPersonality,
    getCustomPersonalityById,
    duplicateCustomPersonality,
    exportCustomPersonalities,
    importCustomPersonalities,
    resetCustomPersonalities,
  };
} 