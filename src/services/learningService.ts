// Service d'apprentissage automatique pour améliorer la détection
export interface LearningData {
  text: string;
  category: string;
  wasRelevant: boolean;
  confidence: number;
  timestamp: Date;
}

export class LearningService {
  private static STORAGE_KEY = 'memory_learning_data';
  private learningHistory: LearningData[] = [];

  constructor() {
    this.loadLearningData();
  }

  /**
   * Enregistre un retour utilisateur pour améliorer la détection
   */
  recordFeedback(text: string, category: string, wasRelevant: boolean, confidence: number): void {
    const data: LearningData = {
      text,
      category,
      wasRelevant,
      confidence,
      timestamp: new Date()
    };

    this.learningHistory.push(data);
    this.saveLearningData();
    
    // Ajustement des patterns basé sur les retours
    this.adjustPatterns(data);
  }

  /**
   * Charge les données d'apprentissage depuis le localStorage
   */
  private loadLearningData(): void {
    const data = localStorage.getItem(LearningService.STORAGE_KEY);
    if (data) {
      try {
        this.learningHistory = JSON.parse(data);
      } catch (error) {
        console.error('Erreur chargement données apprentissage:', error);
      }
    }
  }

  /**
   * Sauvegarde les données d'apprentissage
   */
  private saveLearningData(): void {
    localStorage.setItem(LearningService.STORAGE_KEY, JSON.stringify(this.learningHistory));
  }

  /**
   * Ajuste les patterns en fonction des retours
   */
  private adjustPatterns(data: LearningData): void {
    // Logique d'ajustement des patterns
    // Augmente ou diminue la confiance selon les retours
    console.log('Ajustement pattern:', data);
  }

  /**
   * Analyse les tendances d'apprentissage
   */
  getInsights(): {
    totalFeedbacks: number;
    accuracyRate: number;
    topCategories: string[];
    recentTrends: string[];
  } {
    const total = this.learningHistory.length;
    const relevant = this.learningHistory.filter(d => d.wasRelevant).length;
    const accuracy = total > 0 ? (relevant / total) * 100 : 0;

    // Catégories les plus fréquentes
    const categoryCounts = this.learningHistory.reduce((acc, data) => {
      acc[data.category] = (acc[data.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topCategories = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    // Tendances récentes (7 derniers jours)
    const recentData = this.learningHistory.filter(d => 
      new Date().getTime() - d.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000
    );

    return {
      totalFeedbacks: total,
      accuracyRate: Math.round(accuracy),
      topCategories,
      recentTrends: recentData.map(d => d.category)
    };
  }

  /**
   * Prédit la pertinence d'un texte basé sur l'historique
   */
  predictRelevance(text: string, category: string): number {
    const similarTexts = this.learningHistory.filter(d => 
      d.category === category && 
      this.calculateSimilarity(text, d.text) > 0.5
    );

    if (similarTexts.length === 0) return 0.5; // Neutre si pas de données

    const relevantCount = similarTexts.filter(d => d.wasRelevant).length;
    return relevantCount / similarTexts.length;
  }

  /**
   * Calcule la similarité entre deux textes
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return intersection.length / union.length;
  }

  /**
   * Nettoie les anciennes données (garde seulement les 1000 dernières)
   */
  cleanOldData(): void {
    if (this.learningHistory.length > 1000) {
      this.learningHistory = this.learningHistory
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 1000);
      this.saveLearningData();
    }
  }
}

export const learningService = new LearningService(); 