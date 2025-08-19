import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Palette, 
  Music, 
  FlaskConical, 
  Puzzle, 
  Gamepad2,
  Sparkles,
  Heart,
  Star,
  Zap,
  Play
} from 'lucide-react';
import { getChildActivity, ChildActivity } from '../services/childContentService';

interface ChildActivitySuggestionsProps {
  visible: boolean;
  ageRange?: '3-6' | '7-10' | '11-14';
  onActivitySelected?: (activity: ChildActivity) => void;
  className?: string;
}

const ACTIVITY_ICONS = {
  devinette: Puzzle,
  quiz: Gamepad2,
  histoire: BookOpen,
  dessin: Palette,
  musique: Music,
  science: FlaskConical
};

const ACTIVITY_COLORS = {
  devinette: 'from-blue-500 to-cyan-500',
  quiz: 'from-green-500 to-emerald-500',
  histoire: 'from-purple-500 to-violet-500',
  dessin: 'from-pink-500 to-rose-500',
  musique: 'from-yellow-500 to-orange-500',
  science: 'from-indigo-500 to-blue-600'
};

export const ChildActivitySuggestions: React.FC<ChildActivitySuggestionsProps> = ({
  visible,
  ageRange = '7-10',
  onActivitySelected,
  className = ''
}) => {
  const [suggestions, setSuggestions] = useState<ChildActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<ChildActivity | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Générer des suggestions d'activités
  useEffect(() => {
    if (!visible) return;
    
    const generateSuggestions = () => {
      const newSuggestions: ChildActivity[] = [];
      
      // Générer 3 activités différentes
      for (let i = 0; i < 3; i++) {
        const activity = getChildActivity();
        if (activity && !newSuggestions.some(s => s.id === activity.id)) {
          newSuggestions.push(activity);
        }
      }
      
      setSuggestions(newSuggestions);
    };
    
    generateSuggestions();
    
    // Régénérer les suggestions toutes les 5 minutes
    const interval = setInterval(generateSuggestions, 300000);
    
    return () => clearInterval(interval);
  }, [visible, ageRange]);

  const handleActivityClick = (activity: ChildActivity) => {
    setSelectedActivity(activity);
    setShowDetails(true);
    onActivitySelected?.(activity);
  };

  const handleStartActivity = () => {
    if (selectedActivity) {
      // Ici on pourrait lancer l'activité ou naviguer vers une page dédiée
      console.log('Démarrage de l\'activité:', selectedActivity.title);
      setShowDetails(false);
    }
  };

  if (!visible) return null;

  return (
    <div className={`${className}`}>
      {/* Titre de la section */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          🎮 Activités Ludiques
        </h2>
        <p className="text-white/80">
          Découvre de nouvelles activités amusantes et éducatives !
        </p>
      </div>

      {/* Grille des suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {suggestions.map((activity) => {
          const Icon = ACTIVITY_ICONS[activity.type];
          const colors = ACTIVITY_COLORS[activity.type];
          
          return (
            <div
              key={activity.id}
              onClick={() => handleActivityClick(activity)}
              className={`
                bg-gradient-to-br ${colors} p-4 rounded-xl cursor-pointer
                transform transition-all duration-200 hover:scale-105 hover:shadow-xl
                border-2 border-white/20 hover:border-white/40
              `}
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-3">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-white font-bold text-lg mb-2">
                  {activity.title}
                </h3>
                
                <p className="text-white/90 text-sm mb-3">
                  {activity.description}
                </p>
                
                <div className="flex items-center justify-center gap-4 text-white/80 text-xs">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-4 h-4" />
                    {activity.duration} min
                  </span>
                  
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {activity.type}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bouton pour plus d'activités */}
      <div className="text-center">
        <button
          onClick={() => {
            const newSuggestions = suggestions.map(() => getChildActivity()).filter(Boolean) as ChildActivity[];
            setSuggestions(newSuggestions);
          }}
          className="
            bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full
            font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-200
            border-2 border-white/20 hover:border-white/40
          "
        >
          <Zap className="w-5 h-5 inline mr-2" />
          Autres activités
        </button>
      </div>

      {/* Modal de détails de l'activité */}
      {showDetails && selectedActivity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="text-center mb-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mb-3">
                {React.createElement(ACTIVITY_ICONS[selectedActivity.type], { 
                  className: 'w-10 h-10 text-white' 
                })}
              </div>
              
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                {selectedActivity.title}
              </h3>
              
              <p className="text-gray-600 mb-4">
                {selectedActivity.description}
              </p>
            </div>

            {/* Informations de l'activité */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Durée :</span>
                <span className="text-gray-900 font-bold">{selectedActivity.duration} minutes</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700 font-medium">Type :</span>
                <span className="text-gray-900 font-bold capitalize">{selectedActivity.type}</span>
              </div>
              
              {selectedActivity.materials && selectedActivity.materials.length > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium block mb-2">Matériaux nécessaires :</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedActivity.materials.map((material, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {material}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-3">Instructions :</h4>
              <ol className="space-y-2">
                {selectedActivity.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDetails(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fermer
              </button>
              
              <button
                onClick={handleStartActivity}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all duration-200"
              >
                <Heart className="w-4 h-4 inline mr-2" />
                Commencer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant d'activité rapide
export const QuickActivityCard: React.FC<{
  activity: ChildActivity;
  onStart?: () => void;
  className?: string;
}> = ({ activity, onStart, className = '' }) => {
  const Icon = ACTIVITY_ICONS[activity.type];
  const colors = ACTIVITY_COLORS[activity.type];
  
  return (
    <div className={`bg-gradient-to-br ${colors} p-4 rounded-xl ${className}`}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <div className="flex-1">
          <h4 className="text-white font-semibold text-sm mb-1">
            {activity.title}
          </h4>
          <p className="text-white/80 text-xs">
            {activity.duration} min • {activity.type}
          </p>
        </div>
        
        {onStart && (
          <button
            onClick={onStart}
            className="flex-shrink-0 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Play className="w-4 h-4 text-white" />
          </button>
        )}
      </div>
    </div>
  );
};

// Composant de suivi des activités
export const ActivityTracker: React.FC<{
  completedActivities: string[];
  totalActivities: number;
  className?: string;
}> = ({ completedActivities, totalActivities, className = '' }) => {
  const progress = (completedActivities.length / totalActivities) * 100;
  
  return (
    <div className={`bg-white/10 backdrop-blur-sm rounded-lg p-4 ${className}`}>
      <h3 className="text-white font-bold text-lg mb-3 text-center">
        📊 Progression des Activités
      </h3>
      
      <div className="mb-3">
        <div className="flex justify-between text-white/80 text-sm mb-1">
          <span>Activités terminées</span>
          <span>{completedActivities.length} / {totalActivities}</span>
        </div>
        
        <div className="w-full bg-white/20 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-green-500 to-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      <div className="text-center">
        <span className="text-white/90 text-sm">
          {progress >= 100 ? (
            <span className="text-yellow-400 font-bold">
              🎉 Toutes les activités terminées ! 🎉
            </span>
          ) : (
            `${Math.ceil(totalActivities - completedActivities.length)} activités restantes`
          )}
        </span>
      </div>
    </div>
  );
};

export default ChildActivitySuggestions;
