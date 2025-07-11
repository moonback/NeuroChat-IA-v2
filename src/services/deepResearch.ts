import { 
  DeepResearchConfig, 
  DeepResearchResult, 
  DeepResearchSubQuestion, 
  DeepResearchPerspective,
  DeepResearchInsight
} from '../types/deepResearch';
import { sendMessageToGemini, GeminiGenerationConfig } from './geminiApi';
import { searchDocuments } from './ragSearch';

// Configuration par défaut
export const DEFAULT_DEEP_RESEARCH_CONFIG: DeepResearchConfig = {
  enabled: false,
  maxSubQuestions: 5,
  maxSources: 10,
  includeWebSearch: false,
  includePerspectives: true,
  synthesisLevel: 'detailed'
};

// Service principal pour le Deep Research
export class DeepResearchService {
  private config: DeepResearchConfig;
  private activeResearches: Map<string, DeepResearchResult> = new Map();

  constructor(config: DeepResearchConfig = DEFAULT_DEEP_RESEARCH_CONFIG) {
    this.config = config;
  }

  // Fonction utilitaire pour extraire le JSON d'une réponse markdown
  private parseJsonFromResponse(response: string): any {
    try {
      // Essayer d'abord de parser directement
      return JSON.parse(response);
    } catch (error) {
      // Si ça échoue, essayer d'extraire le JSON des backticks markdown
      const jsonMatch = response.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      
      // Dernier recours : chercher le JSON dans le texte
      const lines = response.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('{')) {
          // Essayer de trouver la fin du JSON
          let jsonStr = '';
          let braceCount = 0;
          let startFound = false;
          
          for (let j = i; j < lines.length; j++) {
            const currentLine = lines[j];
            for (const char of currentLine) {
              if (char === '{') {
                braceCount++;
                startFound = true;
              } else if (char === '}') {
                braceCount--;
              }
              
              if (startFound) {
                jsonStr += char;
              }
              
              if (startFound && braceCount === 0) {
                return JSON.parse(jsonStr);
              }
            }
            if (startFound && j < lines.length - 1) {
              jsonStr += '\n';
            }
          }
        }
      }
      
      // Si rien ne fonctionne, relancer l'erreur originale
      throw error;
    }
  }

  // Démarrer une recherche approfondie
  async startResearch(query: string, config?: Partial<DeepResearchConfig>): Promise<DeepResearchResult> {
    const researchConfig = { ...this.config, ...config };
    
    const result: DeepResearchResult = {
      id: `research_${Date.now()}`,
      originalQuery: query,
      timestamp: new Date(),
      status: 'analyzing',
      progress: 0,
      subQuestions: [],
      categories: [],
      perspectives: [],
      executiveSummary: '',
      keyFindings: [],
      insights: [],
      nextSteps: [],
      relatedTopics: [],
      duration: 0,
      sourcesUsed: [],
      confidenceScore: 0
    };

    this.activeResearches.set(result.id, result);

    try {
      // Étape 1: Analyser et décomposer la question
      await this.analyzeQuery(result, researchConfig);
      
      // Étape 2: Rechercher des informations pour chaque sous-question
      await this.researchSubQuestions(result, researchConfig);
      
      // Étape 3: Analyser différentes perspectives
      if (researchConfig.includePerspectives) {
        await this.analyzePerspectives(result, researchConfig);
      }
      
      // Étape 4: Synthétiser les résultats
      await this.synthesizeResults(result, researchConfig);
      
      result.status = 'completed';
      result.progress = 100;
      
    } catch (error) {
      result.status = 'error';
      console.error('Erreur dans la recherche approfondie:', error);
    }

    return result;
  }

  // Analyser et décomposer la question principale
  private async analyzeQuery(result: DeepResearchResult, config: DeepResearchConfig): Promise<void> {
    result.status = 'analyzing';
    result.progress = 10;

    const analysisPrompt = `
    Tu es un expert en recherche et analyse. Décompose cette question complexe en sous-questions pertinentes et catégories.

    Question principale: "${result.originalQuery}"

    Tâches:
    1. Identifie ${config.maxSubQuestions} sous-questions clés qui permettront d'explorer tous les aspects de cette question
    2. Classe ces sous-questions par priorité (high, medium, low)
    3. Identifie les principales catégories thématiques
    4. Suggère des angles d'analyse spécifiques

    Réponds au format JSON:
    {
      "subQuestions": [
        {
          "question": "Sous-question précise",
          "category": "Catégorie thématique",
          "priority": "high/medium/low",
          "rationale": "Pourquoi cette question est importante"
        }
      ],
      "categories": ["Catégorie 1", "Catégorie 2", ...],
      "analysisAngles": ["Angle 1", "Angle 2", ...],
      "complexity": "low/medium/high"
    }
    `;

    try {
      const response = await sendMessageToGemini(
        [{ text: analysisPrompt, isUser: true }],
        undefined,
        "Tu es un expert en recherche analytique. Réponds uniquement en JSON valide."
      );

      const analysis = this.parseJsonFromResponse(response);
      
      result.subQuestions = analysis.subQuestions.map((sq: any, index: number) => ({
        id: `sub_${result.id}_${index}`,
        question: sq.question,
        category: sq.category,
        priority: sq.priority,
        status: 'pending' as const,
        findings: undefined,
        sources: []
      }));

      result.categories = analysis.categories;
      result.progress = 25;
      
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      throw error;
    }
  }

  // Rechercher des informations pour chaque sous-question
  private async researchSubQuestions(result: DeepResearchResult, config: DeepResearchConfig): Promise<void> {
    result.status = 'researching';
    
    const totalSubQuestions = result.subQuestions.length;
    
    for (let i = 0; i < totalSubQuestions; i++) {
      const subQuestion = result.subQuestions[i];
      subQuestion.status = 'researching';
      
      try {
        // Recherche dans les documents RAG
        const ragResults = await searchDocuments(subQuestion.question, 3);
        
        // Construire le contexte de recherche
        const context = ragResults.map(doc => `
          Source: ${doc.titre}
          Contenu: ${doc.contenu}
        `).join('\n\n');

        // Recherche approfondie avec Gemini
        const researchPrompt = `
        Question à rechercher: "${subQuestion.question}"
        Catégorie: ${subQuestion.category}
        
        Contexte disponible:
        ${context}
        
        Tâches:
        1. Analyse approfondie de la question
        2. Synthèse des informations pertinentes
        3. Identification des points clés
        4. Évaluation de la fiabilité des sources
        5. Gaps d'information identifiés
        
        Réponds de manière structurée et factuelle.
        `;

        const findings = await sendMessageToGemini(
          [{ text: researchPrompt, isUser: true }],
          undefined,
          "Tu es un chercheur expert. Fournis une analyse détaillée et factuelle."
        );

        subQuestion.findings = findings;
        subQuestion.sources = ragResults.map(doc => doc.titre);
        subQuestion.status = 'completed';
        
        result.sourcesUsed.push(...subQuestion.sources);
        result.progress = 25 + (i + 1) * 30 / totalSubQuestions;
        
      } catch (error) {
        console.error(`Erreur recherche sous-question ${i}:`, error);
        subQuestion.status = 'completed';
        subQuestion.findings = 'Erreur lors de la recherche pour cette question.';
      }
    }
  }

  // Analyser différentes perspectives
  private async analyzePerspectives(result: DeepResearchResult, config: DeepResearchConfig): Promise<void> {
    result.progress = 60;
    
    const completedFindings = result.subQuestions
      .filter(sq => sq.findings)
      .map(sq => `${sq.question}: ${sq.findings}`)
      .join('\n\n');

    const perspectivePrompt = `
    Question principale: "${result.originalQuery}"
    
    Recherches effectuées:
    ${completedFindings}
    
    Analyse les différentes perspectives sur cette question:
    1. Identifie 3-4 perspectives distinctes
    2. Pour chaque perspective, fournis les arguments principaux
    3. Évalue la crédibilité de chaque perspective
    4. Identifie les biais potentiels
    
    Réponds au format JSON:
    {
      "perspectives": [
        {
          "title": "Nom de la perspective",
          "description": "Description courte",
          "arguments": ["Argument 1", "Argument 2", ...],
          "credibilityScore": 0.8,
          "biases": ["Biais potentiel 1", ...]
        }
      ]
    }
    `;

    try {
      const response = await sendMessageToGemini(
        [{ text: perspectivePrompt, isUser: true }],
        undefined,
        "Tu es un analyste expert en pensée critique. Réponds uniquement en JSON valide."
      );

      const analysis = this.parseJsonFromResponse(response);
      
      result.perspectives = analysis.perspectives.map((p: any, index: number) => ({
        id: `perspective_${result.id}_${index}`,
        title: p.title,
        description: p.description,
        arguments: p.arguments,
        sources: [], // À améliorer avec des sources spécifiques
        credibilityScore: p.credibilityScore
      }));

      result.progress = 75;
      
    } catch (error) {
      console.error('Erreur analyse perspectives:', error);
    }
  }

  // Synthétiser les résultats
  private async synthesizeResults(result: DeepResearchResult, config: DeepResearchConfig): Promise<void> {
    result.status = 'synthesizing';
    result.progress = 80;

    const synthesisPrompt = `
    Question principale: "${result.originalQuery}"
    
    Recherches effectuées:
    ${result.subQuestions.map(sq => `${sq.question}: ${sq.findings || 'Pas de résultat'}`).join('\n\n')}
    
    Perspectives analysées:
    ${result.perspectives.map(p => `${p.title}: ${p.description}`).join('\n\n')}
    
    Niveau de synthèse demandé: ${config.synthesisLevel}
    
    Fournis une synthèse complète:
    1. Résumé exécutif (2-3 paragraphes)
    2. 5-7 conclusions clés
    3. Insights stratégiques (tendances, opportunités, risques)
    4. Recommandations d'actions
    5. Sujets connexes à explorer
    6. Score de confiance global (0-1)
    
    Réponds au format JSON:
    {
      "executiveSummary": "Résumé exécutif complet",
      "keyFindings": ["Conclusion 1", "Conclusion 2", ...],
      "insights": [
        {
          "type": "trend/opportunity/risk/recommendation",
          "title": "Titre de l'insight",
          "description": "Description détaillée",
          "impact": "high/medium/low",
          "confidence": 0.8,
          "supportingEvidence": ["Preuve 1", "Preuve 2"]
        }
      ],
      "nextSteps": ["Action 1", "Action 2", ...],
      "relatedTopics": ["Sujet 1", "Sujet 2", ...],
      "confidenceScore": 0.8
    }
    `;

    try {
      const response = await sendMessageToGemini(
        [{ text: synthesisPrompt, isUser: true }],
        undefined,
        "Tu es un expert en synthèse stratégique. Réponds uniquement en JSON valide."
      );

      const synthesis = this.parseJsonFromResponse(response);
      
      result.executiveSummary = synthesis.executiveSummary;
      result.keyFindings = synthesis.keyFindings;
      result.insights = synthesis.insights.map((insight: any, index: number) => ({
        id: `insight_${result.id}_${index}`,
        type: insight.type,
        title: insight.title,
        description: insight.description,
        impact: insight.impact,
        confidence: insight.confidence,
        supportingEvidence: insight.supportingEvidence
      }));
      result.nextSteps = synthesis.nextSteps;
      result.relatedTopics = synthesis.relatedTopics;
      result.confidenceScore = synthesis.confidenceScore;
      
      result.progress = 100;
      
    } catch (error) {
      console.error('Erreur lors de la synthèse:', error);
      result.executiveSummary = 'Erreur lors de la génération de la synthèse.';
      result.confidenceScore = 0.3;
    }
  }

  // Arrêter une recherche
  stopResearch(resultId: string): void {
    const result = this.activeResearches.get(resultId);
    if (result) {
      result.status = 'error';
      result.progress = 0;
    }
  }

  // Mettre à jour la configuration
  updateConfig(config: Partial<DeepResearchConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Obtenir une recherche active
  getActiveResearch(resultId: string): DeepResearchResult | undefined {
    return this.activeResearches.get(resultId);
  }

  // Obtenir toutes les recherches actives
  getActiveResearches(): DeepResearchResult[] {
    return Array.from(this.activeResearches.values());
  }
}

// Instance globale du service
export const deepResearchService = new DeepResearchService();

// Fonctions utilitaires
export function isDeepResearchQuery(query: string): boolean {
  const deepResearchKeywords = [
    'analyser', 'étudier', 'explorer', 'comparer', 'évaluer',
    'recherche', 'investigation', 'analyse', 'synthèse',
    'perspectives', 'avantages', 'inconvénients', 'stratégie',
    'tendances', 'opportunités', 'risques', 'recommandations'
  ];
  
  const queryLower = query.toLowerCase();
  return deepResearchKeywords.some(keyword => queryLower.includes(keyword)) ||
         query.length > 50; // Les questions longues sont souvent complexes
}

export function formatDeepResearchResult(result: DeepResearchResult): string {
  return `
# 🔍 Recherche Approfondie: ${result.originalQuery}

## 📊 Résumé Exécutif
${result.executiveSummary}

## 🎯 Conclusions Clés
${result.keyFindings.map(finding => `• ${finding}`).join('\n')}

## 💡 Insights Stratégiques
${result.insights.map(insight => `
### ${insight.title} (${insight.type})
${insight.description}
**Impact**: ${insight.impact} | **Confiance**: ${Math.round(insight.confidence * 100)}%
`).join('\n')}

## 📋 Prochaines Étapes
${result.nextSteps.map(step => `• ${step}`).join('\n')}

## 🔗 Sujets Connexes
${result.relatedTopics.map(topic => `• ${topic}`).join('\n')}

---
*Confiance globale: ${Math.round(result.confidenceScore * 100)}% | Sources utilisées: ${result.sourcesUsed.length}*
  `;
} 