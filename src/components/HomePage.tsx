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
  Waves
} from 'lucide-react';

interface HomePageProps {
  onStartChat: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  totalDiscussions: number;
  totalMessages: number;
}

export function HomePage({ 
  onStartChat, 
  onOpenHistory, 
  onOpenSettings, 
  totalDiscussions, 
  totalMessages 
}: HomePageProps) {
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

  const stats = [
    {
      label: "Discussions",
      value: animatedStats.discussions,
      icon: <MessageCircle className="w-5 h-5" />,
      color: "from-blue-500 to-indigo-600",
      change: "+12%"
    },
    {
      label: "Messages",
      value: animatedStats.messages,
      icon: <Bot className="w-5 h-5" />,
      color: "from-emerald-500 to-teal-600",
      change: "+8%"
    },
    {
      label: "Statut",
      value: isOnline ? "En ligne" : "Hors ligne",
      icon: <Activity className="w-5 h-5" />,
      color: isOnline ? "from-green-500 to-emerald-600" : "from-red-500 to-pink-600",
      change: isOnline ? "Stable" : "Reconnexion..."
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
      <header className="relative z-20 px-6 py-4 backdrop-blur-sm bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 transition-transform duration-300">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                NeuroChat
              </h1>
              <p className="text-sm text-muted-foreground">L'IA conversationnelle nouvelle génération</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              <Clock className="w-4 h-4" />
              {currentTime.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="text-xs text-muted-foreground">
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="relative z-10 px-6 py-12 max-w-7xl mx-auto">
        {/* Section héro */}
        <section className="text-center mb-20">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Nouvelle génération d'IA conversationnelle
            </Badge>
            
            <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-100 dark:via-slate-200 dark:to-slate-100 bg-clip-text text-transparent leading-tight animate-fade-in">
              Découvrez le futur de la
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                conversation IA
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in-delay">
              Une expérience de chat révolutionnaire combinant reconnaissance vocale avancée, 
              synthèse vocale naturelle et intelligence artificielle de pointe pour des conversations 
              fluides et intelligentes.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay-2">
              <Button 
                onClick={onStartChat}
                size="lg" 
                className="px-10 py-5 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-2xl hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300 group"
              >
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Commencer à discuter
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button 
                onClick={onOpenHistory}
                variant="outline" 
                size="lg"
                className="px-10 py-5 text-lg font-semibold border-2 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 hover:scale-105 transition-all duration-300"
              >
                <History className="w-5 h-5 mr-2" />
                Voir l'historique
              </Button>
            </div>
          </div>
        </section>

        {/* Statistiques améliorées */}
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-all duration-500 hover:scale-105 border-0 shadow-lg bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 group">
                <CardContent className="pt-8 pb-6">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                  <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </div>
                  <p className="text-muted-foreground mb-2">{stat.label}</p>
                  <Badge variant="secondary" className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                    {stat.change}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Fonctionnalités avec animation */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Fonctionnalités Premium
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez toutes les fonctionnalités avancées qui font de NeuroChat 
              l'application de chat IA la plus complète et intuitive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`group hover:shadow-2xl transition-all duration-500 hover:scale-105 border-0 shadow-lg cursor-pointer ${
                  index === activeFeature ? 'ring-2 ring-blue-500 shadow-blue-500/25' : ''
                }`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <Badge variant="secondary" className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                      {feature.badge}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="mb-3 text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Témoignages */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              Ce que disent nos utilisateurs
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez les retours de notre communauté d'utilisateurs satisfaits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-all duration-300 hover:scale-105 border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Section CTA améliorée */}
        <section className="text-center">
          <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950 border-0 shadow-2xl hover:shadow-3xl transition-all duration-500">
            <CardContent className="pt-16 pb-16">
              <div className="max-w-2xl mx-auto">
                <div className="w-20 h-20 mx-auto mb-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300">
                  <Rocket className="w-10 h-10 text-white" />
                </div>
                
                <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  Prêt à révolutionner vos conversations ?
                </h3>
                
                <p className="text-muted-foreground mb-10 text-xl leading-relaxed">
                  Rejoignez des milliers d'utilisateurs qui ont déjà découvert 
                  la puissance de NeuroChat pour leurs conversations quotidiennes.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={onStartChat}
                    size="lg" 
                    className="px-10 py-5 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-2xl hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300 group"
                  >
                    <Target className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    Commencer maintenant
                    <ArrowUpRight className="w-5 h-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </Button>
                  
                  <Button 
                    onClick={onOpenSettings}
                    variant="outline" 
                    size="lg"
                    className="px-10 py-5 text-lg font-semibold border-2 hover:bg-gradient-to-r hover:from-slate-100 hover:to-slate-50 dark:hover:from-slate-800 dark:hover:to-slate-700 hover:scale-105 transition-all duration-300"
                  >
                    <Settings className="w-5 h-5 mr-2" />
                    Configurer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer amélioré */}
      <footer className="relative z-10 mt-24 px-6 py-12 border-t border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                NeuroChat
              </span>
            </div>
            <p className="text-muted-foreground mb-6">
              © 2024 NeuroChat. Propulsé par Google Gemini. 
              Conçu avec ❤️ pour des conversations intelligentes.
            </p>
            <div className="flex justify-center gap-4">
              <Badge variant="outline" className="hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                <Globe className="w-3 h-3 mr-1" />
                Français
              </Badge>
              <Badge variant="outline" className="hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors">
                <Shield className="w-3 h-3 mr-1" />
                Sécurisé
              </Badge>
              <Badge variant="outline" className="hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors">
                <Heart className="w-3 h-3 mr-1" />
                Open Source
              </Badge>
            </div>
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