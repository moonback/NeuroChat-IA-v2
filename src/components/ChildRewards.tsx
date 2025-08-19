import React, { useState, useEffect } from 'react';
import { Star, Trophy, Heart, Sparkles, Gift, Award, Zap, Rainbow } from 'lucide-react';

interface ChildReward {
  id: string;
  type: 'star' | 'trophy' | 'heart' | 'sparkle' | 'gift' | 'award' | 'zap' | 'rainbow';
  message: string;
  points: number;
  animation: 'bounce' | 'spin' | 'pulse' | 'wiggle' | 'float';
}

interface ChildRewardsProps {
  visible: boolean;
  onRewardEarned?: (reward: ChildReward) => void;
  currentPoints?: number;
  ageRange?: '3-6' | '7-10' | '11-14';
  className?: string;
}

const REWARD_ICONS = {
  star: Star,
  trophy: Trophy,
  heart: Heart,
  sparkle: Sparkles,
  gift: Gift,
  award: Award,
  zap: Zap,
  rainbow: Rainbow
};

const REWARD_ANIMATIONS = {
  bounce: 'animate-bounce',
  spin: 'animate-spin',
  pulse: 'animate-pulse',
  wiggle: 'animate-wiggle',
  float: 'animate-float'
};

export const ChildRewards: React.FC<ChildRewardsProps> = ({
  visible,
  onRewardEarned,
  currentPoints = 0,
  ageRange = '7-10',
  className = ''
}) => {
  const [rewards, setRewards] = useState<ChildReward[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [totalPoints, setTotalPoints] = useState(currentPoints);

  // Générer des récompenses aléatoires
  const generateReward = (): ChildReward => {
    const types: ChildReward['type'][] = ['star', 'trophy', 'heart', 'sparkle', 'gift', 'award', 'zap', 'rainbow'];
    const animations: ChildReward['animation'][] = ['bounce', 'spin', 'pulse', 'wiggle', 'float'];
    
    const messages = {
      '3-6': [
        'Bravo ! Tu es un champion ! 🌟',
        'Excellent travail ! 👏',
        'Tu es vraiment doué ! ⭐',
        'Continue comme ça ! 🎉',
        'Tu me surprends ! 🚀'
      ],
      '7-10': [
        'Félicitations ! Tu progresses bien ! 🎯',
        'Impressionnant ! Continue tes efforts ! 💪',
        'Tu es sur la bonne voie ! 🌟',
        'Super travail ! Tu as raison d\'être fier ! 🏆',
        'Excellent ! Tu apprends vite ! 🚀'
      ],
      '11-14': [
        'Excellent travail ! Tu montres une vraie compréhension ! 🎓',
        'Impressionnant ! Tu as une approche mature ! 🌟',
        'Tu progresses vraiment bien ! Continue ! 💪',
        'Félicitations ! Tu as raison d\'être satisfait ! 🎯',
        'Super ! Tu développes de vraies compétences ! 🚀'
      ]
    };

    const ageMessages = messages[ageRange] || messages['7-10'];
    const randomMessage = ageMessages[Math.floor(Math.random() * ageMessages.length)];
    const randomType = types[Math.floor(Math.random() * types.length)];
    const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
    const points = Math.floor(Math.random() * 10) + 5; // 5-15 points

    return {
      id: `reward-${Date.now()}-${Math.random()}`,
      type: randomType,
      message: randomMessage,
      points,
      animation: randomAnimation
    };
  };

  // Ajouter une récompense
  const addReward = () => {
    const newReward = generateReward();
    setRewards(prev => [...prev, newReward]);
    setTotalPoints(prev => prev + newReward.points);
    setShowConfetti(true);
    
    // Notifier le composant parent
    onRewardEarned?.(newReward);
    
    // Cacher la récompense après 3 secondes
    setTimeout(() => {
      setRewards(prev => prev.filter(r => r.id !== newReward.id));
    }, 3000);
    
    // Arrêter le confetti après 2 secondes
    setTimeout(() => setShowConfetti(false), 2000);
  };

  // Ajouter automatiquement des récompenses pour encourager l'interaction
  useEffect(() => {
    if (!visible) return;
    
    const interval = setInterval(() => {
      // 30% de chance d'ajouter une récompense toutes les 30 secondes
      if (Math.random() < 0.3) {
        addReward();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [visible]);

  if (!visible) return null;

  return (
    <div className={`relative ${className}`}>
      {/* Affichage des points */}
      <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg font-bold text-lg">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          <span>{totalPoints} pts</span>
        </div>
      </div>

      {/* Récompenses flottantes */}
      {rewards.map((reward) => (
        <div
          key={reward.id}
          className={`fixed z-50 ${REWARD_ANIMATIONS[reward.animation]} transition-all duration-1000`}
          style={{
            left: `${Math.random() * 80 + 10}%`,
            top: `${Math.random() * 60 + 20}%`
          }}
        >
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-2 rounded-full shadow-lg text-center min-w-[120px]">
            <div className="flex flex-col items-center gap-1">
              {React.createElement(REWARD_ICONS[reward.type], { 
                className: 'w-6 h-6 text-white' 
              })}
              <span className="text-xs font-medium">{reward.message}</span>
              <span className="text-xs opacity-90">+{reward.points} pts</span>
            </div>
          </div>
        </div>
      ))}

      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${Math.random() * 3 + 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Bouton pour ajouter manuellement une récompense (pour les tests) */}
      {process.env.NODE_ENV === 'development' && (
        <button
          onClick={addReward}
          className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-green-500 to-blue-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
          title="Ajouter une récompense (dev)"
        >
          <Gift className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

// Composant de progression des récompenses
export const ChildProgressBar: React.FC<{
  currentPoints: number;
  targetPoints: number;
  level: number;
  className?: string;
}> = ({ currentPoints, targetPoints, level, className = '' }) => {
  const progress = Math.min((currentPoints / targetPoints) * 100, 100);
  const nextLevel = level + 1;
  
  return (
    <div className={`bg-white/10 backdrop-blur-sm rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-white font-medium">Niveau {level}</span>
        <span className="text-white/80 text-sm">{currentPoints} / {targetPoints} pts</span>
      </div>
      
      <div className="w-full bg-white/20 rounded-full h-3 mb-2">
        <div 
          className="bg-gradient-to-r from-pink-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="text-center">
        <span className="text-white/90 text-sm">
          {progress >= 100 ? (
            <span className="text-yellow-400 font-bold">
              🎉 Niveau {nextLevel} débloqué ! 🎉
            </span>
          ) : (
            `${Math.ceil(targetPoints - currentPoints)} points pour le niveau ${nextLevel}`
          )}
        </span>
      </div>
    </div>
  );
};

// Composant de statistiques des récompenses
export const ChildRewardStats: React.FC<{
  totalPoints: number;
  totalRewards: number;
  currentStreak: number;
  bestStreak: number;
  className?: string;
}> = ({ totalPoints, totalRewards, currentStreak, bestStreak, className = '' }) => {
  return (
    <div className={`bg-white/10 backdrop-blur-sm rounded-lg p-4 ${className}`}>
      <h3 className="text-white font-bold text-lg mb-3 text-center">🏆 Mes Statistiques</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{totalPoints}</div>
          <div className="text-white/80 text-sm">Points totaux</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-pink-400">{totalRewards}</div>
          <div className="text-white/80 text-sm">Récompenses</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{currentStreak}</div>
          <div className="text-white/80 text-sm">Série actuelle</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">{bestStreak}</div>
          <div className="text-white/80 text-sm">Meilleure série</div>
        </div>
      </div>
      
      {currentStreak > 0 && (
        <div className="mt-3 text-center">
          <span className="text-green-400 font-medium">
            🔥 Série de {currentStreak} jours ! Continue comme ça !
          </span>
        </div>
      )}
    </div>
  );
};

export default ChildRewards;
