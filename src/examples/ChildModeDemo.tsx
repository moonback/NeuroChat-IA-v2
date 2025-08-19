import React, { useState } from 'react';
import { 
  ChildModeBanner, 
  ChildRewards, 
  ChildActivitySuggestions,
  ChildModeSettings,
  ChildProgressBar,
  ChildRewardStats,
  ActivityTracker,
  QuickActivityCard
} from '../components/childMode';
import { useChildMode } from '../hooks/useChildMode';
import { getChildActivity } from '../services/childContentService';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Settings, 
  Shield, 
  Heart, 
  Brain, 
  Play, 
  Star,
  Trophy,
  Zap
} from 'lucide-react';

/**
 * Composant de démonstration du mode enfant
 * Montre toutes les fonctionnalités disponibles
 */
export const ChildModeDemo: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [demoMode, setDemoMode] = useState<'basic' | 'enhanced' | 'strict'>('enhanced');
  const [demoAgeRange, setDemoAgeRange] = useState<'3-6' | '7-10' | '11-14'>('7-10');
  
  const {
    config,
    stats,
    filterUserContent,
    addReward,
    completeActivity,
    getSystemPrompt,
    getConversationStarters,
    getEncouragement
  } = useChildMode();

  // Simuler des activités
  const demoActivities = [
    getChildActivity('devinette'),
    getChildActivity('histoire'),
    getChildActivity('science')
  ].filter(Boolean);

  // Simuler du contenu à filtrer
  const demoContent = [
    "Raconte-moi une histoire de violence",
    "Mon email est test@example.com",
    "Voici un lien: https://example.com",
    "C'est un concept très complexe et sophistiqué"
  ];

  const [filterResults, setFilterResults] = useState<Array<{
    original: string;
    result: any;
  }>>([]);

  const testFiltering = () => {
    const results = demoContent.map(content => ({
      original: content,
      result: filterUserContent(content)
    }));
    setFilterResults(results);
  };

  const simulateReward = () => {
    addReward('demo', 'Démonstration réussie !', 15);
  };

  const simulateActivity = () => {
    if (demoActivities[0]) {
      completeActivity(demoActivities[0].id);
    }
  };

  const getSystemPromptDemo = () => {
    return getSystemPrompt();
  };

  const getStartersDemo = () => {
    return getConversationStarters(demoAgeRange, 'joyeux');
  };

  const getEncouragementDemo = () => {
    return getEncouragement('Test de démonstration !', demoAgeRange);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 dark:from-gray-900 dark:to-gray-800 p-6">
      {/* Header de démonstration */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🧒 Démonstration du Mode Enfant
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Découvrez toutes les fonctionnalités de sécurité et d'adaptation
          </p>
        </div>

        {/* Contrôles de démonstration */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Niveau de sécurité
              </label>
              <select
                value={demoMode}
                onChange={(e) => setDemoMode(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="basic">Basic</option>
                <option value="enhanced">Enhanced</option>
                <option value="strict">Strict</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tranche d'âge
              </label>
              <select
                value={demoAgeRange}
                onChange={(e) => setDemoAgeRange(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="3-6">3-6 ans</option>
                <option value="7-10">7-10 ans</option>
                <option value="11-14">11-14 ans</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => setShowSettings(true)}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configuration
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Grille des fonctionnalités */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Système de récompenses */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Système de Récompenses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ChildRewards
              visible={true}
              currentPoints={stats.totalPoints}
              ageRange={demoAgeRange}
              onRewardEarned={(reward) => console.log('Récompense gagnée:', reward)}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <ChildProgressBar
                currentPoints={stats.totalPoints}
                targetPoints={100}
                level={Math.floor(stats.totalPoints / 100) + 1}
              />
              
              <ChildRewardStats
                totalPoints={stats.totalPoints}
                totalRewards={stats.totalRewards}
                currentStreak={stats.currentStreak}
                bestStreak={stats.bestStreak}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={simulateReward} variant="outline" size="sm">
                <Star className="w-4 h-4 mr-2" />
                Simuler Récompense
              </Button>
              
              <Button onClick={simulateActivity} variant="outline" size="sm">
                <Play className="w-4 h-4 mr-2" />
                Terminer Activité
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activités ludiques */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-blue-500" />
              Activités Ludiques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChildActivitySuggestions
              visible={true}
              ageRange={demoAgeRange}
              onActivitySelected={(activity) => console.log('Activité sélectionnée:', activity)}
            />
            
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Activités Rapides</h4>
              <div className="space-y-2">
                {demoActivities.map((activity) => (
                  <QuickActivityCard
                    key={activity.id}
                    activity={activity}
                    onStart={() => completeActivity(activity.id)}
                  />
                ))}
              </div>
            </div>

            <ActivityTracker
              completedActivities={stats.completedActivities}
              totalActivities={demoActivities.length}
              className="mt-4"
            />
          </CardContent>
        </Card>

        {/* Test de filtrage */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              Test de Filtrage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={testFiltering} className="mb-4">
              <Zap className="w-4 h-4 mr-2" />
              Tester le Filtrage
            </Button>

            <div className="space-y-3">
              {filterResults.map((item, index) => (
                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Original :
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.original}
                    </p>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Filtré :
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.result.filteredContent}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    <Badge variant={item.result.isSafe ? 'default' : 'destructive'}>
                      {item.result.isSafe ? 'Sûr' : 'Risqué'}
                    </Badge>
                    <Badge variant="outline">
                      {item.result.riskLevel}
                    </Badge>
                    {item.result.warnings.map((warning: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {warning}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Prompts et contenu */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              Prompts et Contenu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Prompt Système</h4>
              <Button 
                onClick={getSystemPromptDemo} 
                variant="outline" 
                size="sm"
                className="mb-2"
              >
                Générer Prompt
              </Button>
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-xs max-h-32 overflow-y-auto">
                {getSystemPrompt()}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Suggestions de Conversation</h4>
              <Button 
                onClick={getStartersDemo} 
                variant="outline" 
                size="sm"
                className="mb-2"
              >
                Générer Suggestions
              </Button>
              <div className="space-y-2">
                {getConversationStarters(demoAgeRange, 'joyeux').map((starter, index) => (
                  <div key={index} className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                    {starter}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Encouragements</h4>
              <Button 
                onClick={getEncouragementDemo} 
                variant="outline" 
                size="sm"
                className="mb-2"
              >
                Générer Encouragement
              </Button>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-sm">
                {getEncouragement('Test de démonstration !', demoAgeRange)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bannière du mode enfant */}
      <div className="max-w-6xl mx-auto mt-8">
        <ChildModeBanner
          visible={true}
          variant="friendly"
          message={`Mode enfant actif - Niveau ${demoMode} - Âge ${demoAgeRange}`}
          showCloseButton={false}
        />
      </div>

      {/* Modal de configuration */}
      <ChildModeSettings
        open={showSettings}
        onClose={() => setShowSettings(false)}
        currentAgeRange={demoAgeRange}
        onAgeRangeChange={setDemoAgeRange}
        securityLevel={demoMode}
        onSecurityLevelChange={setDemoMode}
        enableRewards={true}
        onRewardsToggle={() => {}}
        enableActivities={true}
        onActivitiesToggle={() => {}}
        enableFiltering={true}
        onFilteringToggle={() => {}}
      />
    </div>
  );
};

export default ChildModeDemo;
