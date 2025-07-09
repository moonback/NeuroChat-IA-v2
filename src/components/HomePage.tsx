import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Brain, 
  Mic, 
  Zap, 
  Sparkles, 
  ArrowRight, 
  Users, 
  Clock, 
  Shield, 
  Globe,
  Play,
  Star,
  TrendingUp,
  Activity,
  Bot,
  User,
  Volume2,
  Settings,
  History,
  FileText,
  Lock,
  Eye,
  Heart,
  CheckCircle,
  ArrowUpRight,
  Lightbulb,
  Rocket,
  Target,
  Waves,
  Sun,
  Moon,
  HelpCircle
} from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

interface HomePageProps {
  onStartChat: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenHowItWorks: () => void;
  totalDiscussions: number;
  totalMessages: number;
}

export function HomePage({ 
  onStartChat, 
  onOpenHistory, 
  onOpenSettings, 
  onOpenHowItWorks,
  totalDiscussions, 
  totalMessages 
}: HomePageProps) {
  const { theme, toggleTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [animatedStats, setAnimatedStats] = useState({ discussions: 0, messages: 0 });
  const [activeFeature, setActiveFeature] = useState(0);

  // Mise à jour de l'heure
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Vérification du statut en ligne
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Animation des statistiques
  useEffect(() => {
    const animateStats = () => {
      const discussionStep = Math.ceil(totalDiscussions / 30);
      const messageStep = Math.ceil(totalMessages / 30);
      
      let currentDiscussions = 0;
      let currentMessages = 0;
      
      const interval = setInterval(() => {
        currentDiscussions = Math.min(currentDiscussions + discussionStep, totalDiscussions);
        currentMessages = Math.min(currentMessages + messageStep, totalMessages);
        
        setAnimatedStats({ discussions: currentDiscussions, messages: currentMessages });
        
        if (currentDiscussions >= totalDiscussions && currentMessages >= totalMessages) {
          clearInterval(interval);
        }
      }, 50);
    };
    
    animateStats();
  }, [totalDiscussions, totalMessages]);

  // Rotation automatique des fonctionnalités
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: "IA Avancée",
      description: "Powered by Google Gemini pour des réponses intelligentes et contextuelles",
      color: "from-blue-500 to-indigo-600",
      badge: "Intelligent"
    },
    {
      icon: <Mic className="w-6 h-6" />,
      title: "Reconnaissance Vocale",
      description: "Parlez naturellement et écoutez les réponses de l'IA",
      color: "from-emerald-500 to-teal-600",
      badge: "Vocal"
    },
    {
      icon: <Volume2 className="w-6 h-6" />,
      title: "Synthèse Vocale",
      description: "Écoutez les réponses avec des voix naturelles et personnalisables",
      color: "from-purple-500 to-pink-600",
      badge: "Audio"
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: "RAG Documentaire",
      description: "Interrogez vos documents personnels pour des réponses précises",
      color: "from-orange-500 to-red-600",
      badge: "Documents"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Mode Privé",
      description: "Conversations éphémères sans sauvegarde pour la confidentialité",
      color: "from-red-500 to-pink-600",
      badge: "Sécurisé"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Temps Réel",
      description: "Réponses instantanées et interface fluide et réactive",
      color: "from-yellow-500 to-orange-600",
      badge: "Rapide"
    }
  ];

  const testimonials = [
    {
      name: "Marie L.",
      role: "Développeuse",
      content: "NeuroChat a révolutionné ma façon de travailler. L'IA comprend parfaitement le contexte !",
      rating: 5
    },
    {
      name: "Thomas R.",
      role: "Designer",
      content: "Interface intuitive et réponses ultra-rapides. Je recommande vivement !",
      rating: 5
    },
    {
      name: "Sophie M.",
      role: "Étudiante",
      content: "La reconnaissance vocale est impressionnante. Parfait pour mes recherches !",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/30 relative overflow-hidden">
      {/* Animations de fond */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-emerald-400/20 to-teal-600/20 rounded-full blur-3xl animate-pulse delay-2000" />
      </div>

      {/* Header avec navigation */}
      <header className="relative z-20 px-4 sm:px-6 py-3 sm:py-4 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-transform duration-300">
              <MessageCircle className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                NeuroChat
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">L'IA conversationnelle nouvelle génération</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                NeuroChat
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              <Clock className="w-4 h-4" />
              {currentTime.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            <div className="flex items-center gap-1 sm:gap-2 bg-slate-100 dark:bg-slate-800 px-2 sm:px-3 py-1 rounded-full">
              <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-xs text-muted-foreground hidden sm:inline">
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </span>
              <span className="text-xs text-muted-foreground sm:hidden">
                {isOnline ? 'OK' : 'KO'}
              </span>
            </div>
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
        {/* HERO */}
        <section className="flex flex-col items-center justify-center text-center mb-12 sm:mb-16 min-h-[50vh] sm:min-h-[60vh] relative">
          <div className="absolute left-1/2 top-0 -translate-x-1/2 -z-10 w-[280px] h-[280px] sm:w-[340px] sm:h-[340px] bg-gradient-to-br from-blue-400/30 via-indigo-400/20 to-purple-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl mb-2 relative">
              <MessageCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-xl" />
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl ring-4 ring-blue-400/10 animate-pulse pointer-events-none" />
            </div>
            <Badge variant="secondary" className="mb-3 sm:mb-4 px-3 sm:px-5 py-1.5 sm:py-2 text-sm sm:text-base font-medium bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 shadow-md">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2 animate-spin" />
              <span className="hidden sm:inline">Nouvelle génération d'IA conversationnelle</span>
              <span className="sm:hidden">IA conversationnelle nouvelle génération</span>
            </Badge>
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-3 sm:mb-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 dark:from-blue-200 dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent leading-tight animate-fade-in px-2">
              Découvrez le futur de la
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                conversation IA
              </span>
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-6 sm:mb-8 max-w-xl sm:max-w-2xl mx-auto leading-relaxed animate-fade-in-delay px-4">
              Une expérience de chat révolutionnaire combinant reconnaissance vocale avancée, synthèse vocale naturelle et intelligence artificielle de pointe pour des conversations fluides et intelligentes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center animate-fade-in-delay-2 w-full px-4">
              <Button 
                onClick={onStartChat}
                size="lg" 
                className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-2xl hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300 group rounded-xl sm:rounded-2xl"
              >
                <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2 group-hover:scale-110 transition-transform" />
                Commencer à discuter
                <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                onClick={onOpenHowItWorks}
                variant="outline" 
                size="lg"
                className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl font-semibold border-2 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 hover:scale-105 transition-all duration-300 rounded-xl sm:rounded-2xl"
              >
                <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                Comment ça marche
              </Button>
            </div>
          </div>
        </section>

        {/* Fonctionnalités */}
        <section className="mb-12 sm:mb-16">
          <div className="text-center mb-8 sm:mb-10">
            <h3 className="text-3xl sm:text-4xl font-extrabold mb-2 sm:mb-3 bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-200 dark:to-purple-200 bg-clip-text text-transparent px-4">
              Fonctionnalités Premium
            </h3>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl sm:max-w-2xl mx-auto px-4">
              Découvrez toutes les fonctionnalités avancées qui font de NeuroChat l'application de chat IA la plus complète et intuitive.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-0">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-0 shadow-lg cursor-pointer rounded-xl sm:rounded-2xl bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-blue-950 ${index === activeFeature ? 'ring-2 ring-blue-500 shadow-blue-500/25' : ''}`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <CardHeader className="pb-3 sm:pb-4">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg sm:rounded-xl">
                      {feature.badge}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="mb-2 sm:mb-3 text-lg sm:text-xl font-bold text-blue-900 dark:text-blue-100">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base leading-relaxed text-slate-700 dark:text-slate-200">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Témoignages */}
        <section className="mb-12 sm:mb-16">
          <div className="text-center mb-8 sm:mb-10">
            <h3 className="text-3xl sm:text-4xl font-extrabold mb-2 sm:mb-3 bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-200 dark:to-purple-200 bg-clip-text text-transparent px-4">
              Ce que disent nos utilisateurs
            </h3>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl sm:max-w-2xl mx-auto px-4">
              Découvrez les retours de notre communauté d'utilisateurs satisfaits.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-4 sm:px-0">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="text-center hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border-0 shadow-lg rounded-xl sm:rounded-2xl bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-blue-950">
                <CardContent className="pt-6 sm:pt-8 pb-4 sm:pb-6">
                  <div className="flex justify-center mb-3 sm:mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-3 sm:mb-4 italic text-base sm:text-lg">"{testimonial.content}"</p>
                  <div className="font-semibold text-blue-900 dark:text-blue-100 text-base sm:text-lg">{testimonial.name}</div>
                  <div className="text-xs sm:text-sm text-muted-foreground">{testimonial.role}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="text-center mb-0">
          <Card className="bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 rounded-xl sm:rounded-2xl mx-4 sm:mx-0">
            <CardContent className="pt-12 sm:pt-16 pb-12 sm:pb-16">
              <div className="max-w-xl sm:max-w-2xl mx-auto">
                <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-6 sm:mb-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300 animate-pulse">
                  <Rocket className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white animate-bounce" />
                </div>
                <h3 className="text-3xl sm:text-4xl font-extrabold mb-4 sm:mb-6 bg-gradient-to-r from-blue-700 to-purple-700 dark:from-blue-200 dark:to-purple-200 bg-clip-text text-transparent px-4">
                  Prêt à révolutionner vos conversations ?
                </h3>
                <p className="text-muted-foreground mb-8 sm:mb-10 text-lg sm:text-xl leading-relaxed px-4">
                  Rejoignez des milliers d'utilisateurs qui ont déjà découvert la puissance de NeuroChat pour leurs conversations quotidiennes.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                  <Button 
                    onClick={onStartChat}
                    size="lg" 
                    className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-2xl hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300 group rounded-xl sm:rounded-2xl"
                  >
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 mr-2 group-hover:rotate-12 transition-transform" />
                    Commencer maintenant
                    <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Button>
                  <Button 
                    onClick={onOpenHowItWorks}
                    variant="outline" 
                    size="lg"
                    className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 text-lg sm:text-xl font-semibold border-2 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 hover:scale-105 transition-all duration-300 rounded-xl sm:rounded-2xl"
                  >
                    <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                    En savoir plus
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-16 sm:mt-24 px-4 sm:px-6 py-8 sm:py-12 border-t border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-2 sm:mb-4">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                <MessageCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                NeuroChat
              </span>
            </div>
            <p className="text-muted-foreground mb-1 sm:mb-2 text-sm sm:text-base px-4">
              © 2024 NeuroChat. Propulsé par Google Gemini. Conçu avec ❤️ pour des conversations intelligentes.
            </p>
          </div>
        </div>
      </footer>

      <style >{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
        
        .animate-fade-in-delay {
          animation: fade-in 0.8s ease-out 0.2s both;
        }
        
        .animate-fade-in-delay-2 {
          animation: fade-in 0.8s ease-out 0.4s both;
        }
      `}</style>
    </div>
  );
}