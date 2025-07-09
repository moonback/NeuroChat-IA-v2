import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  ArrowLeft,
  ArrowRight,
  Play,
  Mic,
  Brain,
  Volume2,
  FileText,
  Shield,
  Zap,
  CheckCircle,
  Users,
  Clock,
  Settings,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lightbulb,
  Target,
  Rocket
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface HowItWorksPageProps {
  onGoBack: () => void;
  onStartChat: () => void;
}

export function HowItWorksPage({ onGoBack, onStartChat }: HowItWorksPageProps) {
  const { theme, toggleTheme } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <Mic className="w-8 h-8" />,
      title: "1. Parlez ou écrivez",
      description: "Commencez votre conversation en parlant dans le micro ou en tapant votre message. L'interface s'adapte automatiquement à votre préférence.",
      details: [
        "Reconnaissance vocale en temps réel",
        "Interface texte intuitive",
        "Support multilingue",
        "Correction automatique"
      ],
      color: "from-blue-500 to-indigo-600",
      badge: "Entrée"
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "2. L'IA analyse",
      description: "Notre IA Gemini analyse votre message, comprend le contexte et prépare une réponse intelligente et pertinente.",
      details: [
        "Analyse contextuelle avancée",
        "Compréhension du langage naturel",
        "Gestion de la conversation",
        "Personnalisation des réponses"
      ],
      color: "from-emerald-500 to-teal-600",
      badge: "IA"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "3. Recherche documentaire (optionnel)",
      description: "Si activé, l'IA recherche dans vos documents personnels pour fournir des réponses plus précises et contextuelles.",
      details: [
        "Recherche dans vos documents",
        "Réponses basées sur vos données",
        "Sécurité et confidentialité",
        "Support de multiples formats"
      ],
      color: "from-purple-500 to-pink-600",
      badge: "RAG"
    },
    {
      icon: <Volume2 className="w-8 h-8" />,
      title: "4. Synthèse vocale",
      description: "L'IA génère une réponse textuelle qui est ensuite convertie en parole naturelle pour une expérience immersive.",
      details: [
        "Voix naturelles et expressives",
        "Paramètres personnalisables",
        "Vitesse et tonalité ajustables",
        "Support de multiples langues"
      ],
      color: "from-orange-500 to-red-600",
      badge: "Audio"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "5. Sécurité et confidentialité",
      description: "Vos conversations sont protégées. En mode privé, rien n'est sauvegardé et tout est effacé à la fermeture.",
      details: [
        "Chiffrement des données",
        "Mode privé éphémère",
        "Aucune trace sur les serveurs",
        "Contrôle total de vos données"
      ],
      color: "from-red-500 to-pink-600",
      badge: "Sécurisé"
    }
  ];

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Temps réel",
      description: "Réponses instantanées et interface fluide",
      color: "from-yellow-500 to-orange-600"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Personnalisation",
      description: "Adaptez l'IA à votre style de communication",
      color: "from-blue-500 to-indigo-600"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Historique",
      description: "Conservez vos conversations importantes",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Configuration",
      description: "Paramètres avancés pour un contrôle total",
      color: "from-purple-500 to-pink-600"
    }
  ];

  const nextStep = () => {
    setCurrentStep((prev) => (prev + 1) % steps.length);
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev - 1 + steps.length) % steps.length);
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/30 relative overflow-hidden">
      {/* Animations de fond */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-emerald-400/20 to-teal-600/20 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Header */}
      <header className="relative z-20 px-4 sm:px-6 py-3 sm:py-4 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={onGoBack}
              className="flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Retour</span>
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Comment ça marche
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Découvrez le fonctionnement de NeuroChat</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />
              ) : (
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="relative z-10 px-4 sm:px-6 py-8 sm:py-12 max-w-7xl mx-auto">
        {/* Introduction */}
        <section className="text-center mb-12 sm:mb-16">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 dark:from-blue-200 dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent">
              Comment NeuroChat fonctionne
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Découvrez le processus en 5 étapes qui transforme vos idées en conversations intelligentes avec l'IA
            </p>
            <div className="flex justify-center">
              <Button 
                onClick={onStartChat}
                size="lg" 
                className="px-8 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-2xl hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300 group rounded-xl sm:rounded-2xl"
              >
                <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2 group-hover:scale-110 transition-transform" />
                Essayer maintenant
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </section>

        {/* Étapes interactives */}
        <section className="mb-12 sm:mb-16">
          {/* Navigation des étapes */}
          <div className="flex justify-center mb-8 sm:mb-12">
            <div className="flex items-center gap-2 sm:gap-4 bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-lg">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToStep(index)}
                  className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${
                    index === currentStep 
                      ? 'bg-blue-600 scale-125' 
                      : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                  }`}
                  title={`Étape ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Contenu de l'étape actuelle */}
          <div className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-2xl rounded-2xl bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-blue-950 overflow-hidden">
              <CardHeader className="text-center pb-6 sm:pb-8">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${steps[currentStep].color} flex items-center justify-center text-white shadow-2xl animate-pulse`}>
                    {steps[currentStep].icon}
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3 mb-3 sm:mb-4">
                  <Badge variant="secondary" className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-xl">
                    {steps[currentStep].badge}
                  </Badge>
                  <h3 className="text-2xl sm:text-3xl font-bold text-blue-900 dark:text-blue-100">
                    {steps[currentStep].title}
                  </h3>
                </div>
                <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  {steps[currentStep].description}
                </p>
              </CardHeader>
              <CardContent className="pb-8 sm:pb-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
                  {steps[currentStep].details.map((detail, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-white dark:bg-slate-700 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm sm:text-base text-slate-700 dark:text-slate-200">
                        {detail}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Navigation entre étapes */}
            <div className="flex justify-center items-center gap-4 sm:gap-6 mt-8 sm:mt-12">
              <Button
                variant="outline"
                size="lg"
                onClick={prevStep}
                className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:scale-105 transition-all duration-300"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                Précédent
              </Button>
              <div className="text-sm sm:text-base text-muted-foreground px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                {currentStep + 1} / {steps.length}
              </div>
              <Button
                variant="outline"
                size="lg"
                onClick={nextStep}
                className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:scale-105 transition-all duration-300"
              >
                Suivant
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Fonctionnalités clés */}
        <section className="mb-12 sm:mb-16">
          <div className="text-center mb-8 sm:mb-10">
            <h3 className="text-2xl sm:text-3xl font-extrabold mb-3 sm:mb-4 bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
              Fonctionnalités clés
            </h3>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez les technologies qui rendent NeuroChat si puissant et intuitif
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-0 shadow-lg rounded-xl sm:rounded-2xl bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-blue-950">
                <CardContent className="pt-6 sm:pt-8 pb-4 sm:pb-6">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-2 text-base sm:text-lg">
                    {feature.title}
                  </h4>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-xl sm:rounded-2xl">
            <CardContent className="pt-12 sm:pt-16 pb-12 sm:pb-16">
              <div className="max-w-2xl mx-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-6 sm:mb-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300 animate-pulse">
                  <Rocket className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white animate-bounce" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-6 bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                  Prêt à essayer ?
                </h3>
                <p className="text-muted-foreground mb-8 sm:mb-10 text-lg sm:text-xl leading-relaxed">
                  Maintenant que vous comprenez comment ça marche, lancez-vous dans votre première conversation avec NeuroChat !
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Button 
                    onClick={onStartChat}
                    size="lg" 
                    className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-2xl hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300 group rounded-xl sm:rounded-2xl"
                  >
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 mr-2 group-hover:rotate-12 transition-transform" />
                    Commencer maintenant
                    <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button 
                    onClick={onGoBack}
                    variant="outline" 
                    size="lg"
                    className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl font-semibold border-2 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 hover:scale-105 transition-all duration-300 rounded-xl sm:rounded-2xl"
                  >
                    <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                    Retour à l'accueil
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
} 