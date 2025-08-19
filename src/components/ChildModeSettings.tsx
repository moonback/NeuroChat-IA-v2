import React, { useState } from 'react';
import { 
  Settings, 
  Shield, 
  Heart, 
  Brain, 
  Lock, 
  Eye, 
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';


interface ChildModeSettingsProps {
  open: boolean;
  onClose: () => void;
  currentAgeRange: '3-6' | '7-10' | '11-14';
  onAgeRangeChange: (ageRange: '3-6' | '7-10' | '11-14') => void;
  securityLevel: 'basic' | 'enhanced' | 'strict';
  onSecurityLevelChange: (level: 'basic' | 'enhanced' | 'strict') => void;
  enableRewards: boolean;
  onRewardsToggle: (enabled: boolean) => void;
  enableActivities: boolean;
  onActivitiesToggle: (enabled: boolean) => void;
  enableFiltering: boolean;
  onFilteringToggle: (enabled: boolean) => void;
}

interface SecurityFeature {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
  required: boolean;
  impact: 'low' | 'medium' | 'high';
}

export const ChildModeSettings: React.FC<ChildModeSettingsProps> = ({
  open,
  onClose,
  currentAgeRange,
  onAgeRangeChange,
  securityLevel,
  onSecurityLevelChange,
  enableRewards,
  onRewardsToggle,
  enableActivities,
  onActivitiesToggle,
  enableFiltering,
  onFilteringToggle
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'content' | 'rewards'>('general');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['general']));


  // Fonctionnalités de sécurité par niveau
  const securityFeatures: SecurityFeature[] = [
    {
      id: 'content-filtering',
      title: 'Filtrage de contenu',
      description: 'Filtre automatiquement le contenu inapproprié ou violent',
      icon: Shield,
      enabled: enableFiltering,
      required: true,
      impact: 'high'
    },
    {
      id: 'language-moderation',
      title: 'Modération du langage',
      description: 'Adapte le vocabulaire et la complexité selon l\'âge',
      icon: Brain,
      enabled: true,
      required: true,
      impact: 'medium'
    },
    {
      id: 'personal-info-protection',
      title: 'Protection des informations personnelles',
      description: 'Détecte et masque les données personnelles',
      icon: Lock,
      enabled: securityLevel !== 'basic',
      required: false,
      impact: 'high'
    },
    {
      id: 'external-link-blocking',
      title: 'Blocage des liens externes',
      description: 'Empêche l\'accès à des sites web externes',
      icon: Eye,
      enabled: securityLevel === 'strict',
      required: false,
      impact: 'medium'
    },
    {
      id: 'complex-content-detection',
      title: 'Détection de contenu complexe',
      description: 'Identifie et simplifie le contenu trop complexe',
      icon: AlertTriangle,
      enabled: securityLevel !== 'basic',
      required: false,
      impact: 'low'
    }
  ];

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getSecurityLevelDescription = (level: string) => {
    switch (level) {
      case 'basic':
        return 'Protection standard avec filtrage de base du contenu';
      case 'enhanced':
        return 'Protection renforcée avec modération avancée et détection de contenu complexe';
      case 'strict':
        return 'Protection maximale avec blocage des liens externes et filtrage strict';
      default:
        return '';
    }
  };

  const getAgeRangeDescription = (ageRange: string) => {
    switch (ageRange) {
      case '3-6':
        return 'Tout-petits : vocabulaire simple, activités créatives, sécurité maximale';
      case '7-10':
        return 'Enfants : apprentissage interactif, jeux éducatifs, protection adaptée';
      case '11-14':
        return 'Pré-adolescents : contenu enrichi, activités complexes, sécurité modérée';
      default:
        return '';
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Configuration Mode Enfant
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Personnalise l\'expérience et la sécurité
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Navigation des onglets */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'general', label: 'Général', icon: Settings },
            { id: 'security', label: 'Sécurité', icon: Shield },
            { id: 'content', label: 'Contenu', icon: Brain },
            { id: 'rewards', label: 'Récompenses', icon: Heart }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 px-6 py-3 font-medium transition-colors
                  ${activeTab === tab.id
                    ? 'text-pink-600 border-b-2 border-pink-600 bg-pink-50 dark:bg-pink-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Contenu des onglets */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Onglet Général */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Sélection de l'âge */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Tranche d'âge
                  </h3>
                  <button
                    onClick={() => toggleSection('age')}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    {expandedSections.has('age') ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
                
                {expandedSections.has('age') && (
                  <div className="space-y-3">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {getAgeRangeDescription(currentAgeRange)}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-3">
                      {(['3-6', '7-10', '11-14'] as const).map((ageRange) => (
                        <button
                          key={ageRange}
                          onClick={() => onAgeRangeChange(ageRange)}
                          className={`
                            p-3 rounded-lg border-2 transition-all duration-200 text-center
                            ${currentAgeRange === ageRange
                              ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }
                          `}
                        >
                          <div className="font-semibold">{ageRange}</div>
                          <div className="text-xs opacity-75">
                            {ageRange === '3-6' && 'Tout-petits'}
                            {ageRange === '7-10' && 'Enfants'}
                            {ageRange === '11-14' && 'Pré-ados'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Niveau de sécurité */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Niveau de sécurité
                  </h3>
                  <button
                    onClick={() => toggleSection('security')}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    {expandedSections.has('security') ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
                
                {expandedSections.has('security') && (
                  <div className="space-y-3">
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {getSecurityLevelDescription(securityLevel)}
                    </p>
                    
                    <div className="grid grid-cols-3 gap-3">
                      {(['basic', 'enhanced', 'strict'] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => onSecurityLevelChange(level)}
                          className={`
                            p-3 rounded-lg border-2 transition-all duration-200 text-center
                            ${securityLevel === level
                              ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-300'
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                            }
                          `}
                        >
                          <div className="font-semibold capitalize">{level}</div>
                          <div className="text-xs opacity-75">
                            {level === 'basic' && 'Standard'}
                            {level === 'enhanced' && 'Renforcé'}
                            {level === 'strict' && 'Maximal'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Onglet Sécurité */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Protection automatique
                    </h4>
                    <p className="text-blue-800 dark:text-blue-200 text-sm">
                      Le mode enfant active automatiquement plusieurs niveaux de protection pour garantir la sécurité de votre enfant.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {securityFeatures.map((feature) => (
                  <div
                    key={feature.id}
                    className={`
                      p-4 rounded-lg border transition-all duration-200
                      ${feature.enabled
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                        ${feature.enabled
                          ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                        }
                      `}>
                        <feature.icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {feature.title}
                          </h4>
                          
                          {feature.enabled ? (
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                          )}
                          
                          {feature.required && (
                            <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs rounded-full">
                              Requis
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                          {feature.description}
                        </p>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Impact :
                          </span>
                          <span className={`
                            px-2 py-1 text-xs rounded-full font-medium
                            ${feature.impact === 'high' && 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}
                            ${feature.impact === 'medium' && 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'}
                            ${feature.impact === 'low' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'}
                          `}>
                            {feature.impact === 'high' && 'Élevé'}
                            {feature.impact === 'medium' && 'Moyen'}
                            {feature.impact === 'low' && 'Faible'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Statistiques de filtrage */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Statistiques de sécurité
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Filtres actifs :</span>
                    <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                      15
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Catégories :</span>
                    <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                      5
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Contenu */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Filtrage de contenu
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                      Activer le filtrage automatique
                    </span>
                    <button
                      onClick={() => onFilteringToggle(!enableFiltering)}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${enableFiltering ? 'bg-pink-600' : 'bg-gray-300 dark:bg-gray-600'}
                      `}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${enableFiltering ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                    Filtre automatiquement le contenu inapproprié
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Activités ludiques
                  </h4>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                      Proposer des activités
                    </span>
                    <button
                      onClick={() => onActivitiesToggle(!enableActivities)}
                      className={`
                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                        ${enableActivities ? 'bg-pink-600' : 'bg-gray-300 dark:bg-gray-600'}
                      `}
                    >
                      <span
                        className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${enableActivities ? 'translate-x-6' : 'translate-x-1'}
                        `}
                      />
                    </button>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                    Suggère des activités éducatives et amusantes
                  </p>
                </div>
              </div>

              {/* Statistiques de contenu */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Contenu disponible
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                      12
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">Templates</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      8
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">Activités</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      3
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">Niveaux</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      6
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">Catégories</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Onglet Récompenses */}
          {activeTab === 'rewards' && (
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Système de récompenses
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    Activer les récompenses
                  </span>
                  <button
                    onClick={() => onRewardsToggle(!enableRewards)}
                    className={`
                      relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                      ${enableRewards ? 'bg-pink-600' : 'bg-gray-300 dark:bg-gray-600'}
                    `}
                  >
                    <span
                      className={`
                        inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                        ${enableRewards ? 'translate-x-6' : 'translate-x-1'}
                      `}
                    />
                  </button>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                  Encourage l\'interaction avec des récompenses et des points
                </p>
              </div>

              {enableRewards && (
                <div className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg p-6 text-white">
                  <h4 className="font-semibold text-lg mb-3">
                    🎉 Système de récompenses actif !
                  </h4>
                  <p className="text-pink-100 mb-4">
                    Votre enfant gagne des points et des récompenses en interagissant avec l\'assistant.
                    Cela encourage l\'apprentissage et maintient l\'engagement.
                  </p>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">🌟</div>
                      <div className="text-sm">Récompenses</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">🏆</div>
                      <div className="text-sm">Points</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">🎮</div>
                      <div className="text-sm">Activités</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Configuration sauvegardée automatiquement
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Fermer
            </button>
            
            <button
              onClick={() => {
                // Réinitialiser aux valeurs par défaut
                onAgeRangeChange('7-10');
                onSecurityLevelChange('enhanced');
                onRewardsToggle(true);
                onActivitiesToggle(true);
                onFilteringToggle(true);
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildModeSettings;
