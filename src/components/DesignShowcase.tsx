import { useState } from 'react';
import { 
  UnifiedButtonEnhanced, 
  UnifiedCardEnhanced, 
  UnifiedModalEnhanced,
  UnifiedModalContent,
  UnifiedModalHeader,
  UnifiedModalTitle,
  UnifiedModalDescription,
  UnifiedModalFooter,
  UnifiedInputEnhanced,
  UnifiedBadgeEnhanced,
  UnifiedContainerEnhanced
} from '@/components/ui/unified-enhanced';
import { 
  Star, 
  Heart, 
  Zap, 
  Sparkles, 
  Moon, 
  Sun,
  Search,
  Settings,
  User,
  Bell,
  Shield,
  Lock
} from 'lucide-react';

export function DesignShowcase() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <UnifiedContainerEnhanced 
      mode="normal" 
      variant="premium" 
      glow={true}
      className="min-h-screen p-8"
    >
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header avec titre et bouton de thème */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            🎨 Design Showcase - NeuroChat-IA-v2
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Découvrez tous les effets visuels avancés de notre système de design unifié
          </p>
          
          <UnifiedButtonEnhanced
            variant="premium"
            shimmer={true}
            onClick={toggleTheme}
            className="mx-auto"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-4 w-4 mr-2" />
                Mode Clair
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 mr-2" />
                Mode Sombre
              </>
            )}
          </UnifiedButtonEnhanced>
        </div>

        {/* Section Boutons */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-center">🔘 Boutons avec Effets</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Bouton Shimmer */}
            <UnifiedCardEnhanced variant="glass" shimmer={true} className="p-6">
              <h3 className="font-semibold mb-4">Effet Shimmer</h3>
              <UnifiedButtonEnhanced variant="primary" shimmer={true} className="w-full">
                <Sparkles className="h-4 w-4 mr-2" />
                Bouton Shimmer
              </UnifiedButtonEnhanced>
            </UnifiedCardEnhanced>

            {/* Bouton Glow */}
            <UnifiedCardEnhanced variant="glass" glow={true} className="p-6">
              <h3 className="font-semibold mb-4">Effet Glow</h3>
              <UnifiedButtonEnhanced variant="premium" glow={true} className="w-full">
                <Zap className="h-4 w-4 mr-2" />
                Bouton Glow
              </UnifiedButtonEnhanced>
            </UnifiedCardEnhanced>

            {/* Bouton Morph */}
            <UnifiedCardEnhanced variant="glass" morph={true} className="p-6">
              <h3 className="font-semibold mb-4">Effet Morph</h3>
              <UnifiedButtonEnhanced variant="danger" morph={true} className="w-full">
                <Heart className="h-4 w-4 mr-2" />
                Bouton Morph
              </UnifiedButtonEnhanced>
            </UnifiedCardEnhanced>

            {/* Bouton Glass */}
            <UnifiedCardEnhanced variant="glass" className="p-6">
              <h3 className="font-semibold mb-4">Effet Glass</h3>
              <UnifiedButtonEnhanced variant="ghost" glass={true} className="w-full">
                <Star className="h-4 w-4 mr-2" />
                Bouton Glass
              </UnifiedButtonEnhanced>
            </UnifiedCardEnhanced>

            {/* Bouton Neon */}
            <UnifiedCardEnhanced variant="neon" className="p-6">
              <h3 className="font-semibold mb-4">Effet Neon</h3>
              <UnifiedButtonEnhanced variant="premium" neon={true} className="w-full">
                <Sparkles className="h-4 w-4 mr-2" />
                Bouton Neon
              </UnifiedButtonEnhanced>
            </UnifiedCardEnhanced>

            {/* Bouton Premium */}
            <UnifiedCardEnhanced variant="premium" className="p-6">
              <h3 className="font-semibold mb-4">Bouton Premium</h3>
              <UnifiedButtonEnhanced 
                variant="premium" 
                shimmer={true}
                glow={true}
                className="w-full"
              >
                <Star className="h-4 w-4 mr-2" />
                Premium Combo
              </UnifiedButtonEnhanced>
            </UnifiedCardEnhanced>
          </div>
        </section>

        {/* Section Cartes */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-center">🃏 Cartes avec Effets</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Carte Shimmer */}
            <UnifiedCardEnhanced variant="premium" shimmer={true} className="p-6">
              <div className="text-center space-y-4">
                <Sparkles className="h-8 w-8 mx-auto text-blue-500" />
                <h3 className="font-semibold">Shimmer</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Effet de brillance qui traverse la carte
                </p>
              </div>
            </UnifiedCardEnhanced>

            {/* Carte Glow */}
            <UnifiedCardEnhanced variant="glass" glow={true} className="p-6">
              <div className="text-center space-y-4">
                <Zap className="h-8 w-8 mx-auto text-purple-500" />
                <h3 className="font-semibold">Glow</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Lueur colorée au hover
                </p>
              </div>
            </UnifiedCardEnhanced>

            {/* Carte Morph */}
            <UnifiedCardEnhanced variant="interactive" morph={true} className="p-6">
              <div className="text-center space-y-4">
                <Heart className="h-8 w-8 mx-auto text-red-500" />
                <h3 className="font-semibold">Morph</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Transformation douce au hover
                </p>
              </div>
            </UnifiedCardEnhanced>

            {/* Carte Floating */}
            <UnifiedCardEnhanced variant="neon" floating={true} className="p-6">
              <div className="text-center space-y-4">
                <Moon className="h-8 w-8 mx-auto text-cyan-500" />
                <h3 className="font-semibold">Floating</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Animation de flottement continue
                </p>
              </div>
            </UnifiedCardEnhanced>
          </div>
        </section>

        {/* Section Badges */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-center">🏷️ Badges avec Effets</h2>
          
          <div className="flex flex-wrap justify-center gap-4">
            <UnifiedBadgeEnhanced variant="default" shimmer={true}>
              <Sparkles className="h-3 w-3 mr-1" />
              Shimmer
            </UnifiedBadgeEnhanced>
            
            <UnifiedBadgeEnhanced variant="premium" glow={true}>
              <Zap className="h-3 w-3 mr-1" />
              Glow
            </UnifiedBadgeEnhanced>
            
            <UnifiedBadgeEnhanced variant="premium" morph={true}>
              <Heart className="h-3 w-3 mr-1" />
              Morph
            </UnifiedBadgeEnhanced>
            
            <UnifiedBadgeEnhanced variant="neon" floating={true}>
              <Star className="h-3 w-3 mr-1" />
              Floating
            </UnifiedBadgeEnhanced>
            
            <UnifiedBadgeEnhanced variant="destructive" shimmer={true}>
              <Shield className="h-3 w-3 mr-1" />
              Security
            </UnifiedBadgeEnhanced>
            
            <UnifiedBadgeEnhanced variant="outline" glow={true}>
              <Lock className="h-3 w-3 mr-1" />
              Private
            </UnifiedBadgeEnhanced>
          </div>
        </section>

        {/* Section Inputs */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-center">📝 Inputs avec Effets</h2>
          
          <div className="max-w-md mx-auto space-y-4">
            <UnifiedInputEnhanced
              variant="premium"
              shimmer={true}
              placeholder="Input avec effet Shimmer"
              icon={<Search className="w-4 h-4" />}
            />
            
            <UnifiedInputEnhanced
              variant="base"
              glow={true}
              placeholder="Input avec effet Glow"
              icon={<User className="w-4 h-4" />}
            />
            
            <UnifiedInputEnhanced
              variant="premium"
              glass={true}
              placeholder="Input avec effet Glass"
              icon={<Settings className="w-4 h-4" />}
            />
          </div>
        </section>

        {/* Section Modal */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-center">🪟 Modal avec Effets</h2>
          
          <div className="text-center">
            <UnifiedButtonEnhanced
              variant="premium"
              shimmer={true}
              glow={true}
              onClick={() => setIsModalOpen(true)}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Ouvrir Modal Premium
            </UnifiedButtonEnhanced>
          </div>

          <UnifiedModalEnhanced open={isModalOpen} onOpenChange={setIsModalOpen}>
            <UnifiedModalContent shimmer={true} glow={true} glass={true}>
              <UnifiedModalHeader>
                <UnifiedModalTitle glow={true}>
                  <Sparkles className="h-5 w-5 mr-2 inline" />
                  Modal avec Effets Avancés
                </UnifiedModalTitle>
                <UnifiedModalDescription>
                  Cette modal démontre tous les effets visuels disponibles : Shimmer, Glow et Glass
                </UnifiedModalDescription>
              </UnifiedModalHeader>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <UnifiedCardEnhanced variant="glass" shimmer={true} className="p-4">
                    <h4 className="font-semibold mb-2">Effet Shimmer</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Brillance qui traverse le composant
                    </p>
                  </UnifiedCardEnhanced>
                  
                  <UnifiedCardEnhanced variant="premium" glow={true} className="p-4">
                    <h4 className="font-semibold mb-2">Effet Glow</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Lueur colorée au hover
                    </p>
                  </UnifiedCardEnhanced>
                </div>
                
                <div className="space-y-4">
                  <UnifiedInputEnhanced
                    variant="premium"
                    shimmer={true}
                    placeholder="Input avec effet Shimmer"
                    icon={<Bell className="w-4 h-4" />}
                  />
                  
                  <div className="flex justify-center space-x-2">
                    <UnifiedBadgeEnhanced variant="premium" shimmer={true}>
                      Premium
                    </UnifiedBadgeEnhanced>
                    <UnifiedBadgeEnhanced variant="neon" glow={true}>
                      Neon
                    </UnifiedBadgeEnhanced>
                    <UnifiedBadgeEnhanced variant="premium" morph={true}>
                      Success
                    </UnifiedBadgeEnhanced>
                  </div>
                </div>
              </div>
              
              <UnifiedModalFooter>
                <UnifiedButtonEnhanced 
                  variant="secondary" 
                  onClick={() => setIsModalOpen(false)}
                >
                  Fermer
                </UnifiedButtonEnhanced>
                <UnifiedButtonEnhanced 
                  variant="premium" 
                  shimmer={true}
                  glow={true}
                  onClick={() => setIsModalOpen(false)}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Magnifique !
                </UnifiedButtonEnhanced>
              </UnifiedModalFooter>
            </UnifiedModalContent>
          </UnifiedModalEnhanced>
        </section>

        {/* Footer */}
        <footer className="text-center space-y-4 pt-8 border-t border-white/20 dark:border-slate-800/20">
          <p className="text-slate-600 dark:text-slate-300">
            🎨 Design System Amélioré pour NeuroChat-IA-v2
          </p>
          <div className="flex justify-center space-x-2">
            <UnifiedBadgeEnhanced variant="premium" shimmer={true}>
              Premium
            </UnifiedBadgeEnhanced>
            <UnifiedBadgeEnhanced variant="neon" glow={true}>
              Modern
            </UnifiedBadgeEnhanced>
            <UnifiedBadgeEnhanced variant="premium" morph={true}>
              Accessible
            </UnifiedBadgeEnhanced>
          </div>
        </footer>
      </div>
    </UnifiedContainerEnhanced>
  );
}
