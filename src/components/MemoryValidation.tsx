import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, XCircle, Edit3, AlertTriangle } from 'lucide-react';

interface PendingMemoryFact {
  id: string;
  content: string;
  category: string;
  confidence: number;
  source: string;
  timestamp: Date;
}

interface MemoryValidationProps {
  pendingFacts: PendingMemoryFact[];
  onValidate: (factId: string, validated: boolean, editedContent?: string, editedCategory?: string) => void;
  onValidateAll: (validated: boolean) => void;
  visible: boolean;
}

export const MemoryValidation: React.FC<MemoryValidationProps> = ({
  pendingFacts,
  onValidate,
  onValidateAll,
  visible
}) => {
  const [editingFact, setEditingFact] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const categories = [
    'identité', 'localisation', 'profession', 'préférences', 'dates', 
    'relations', 'habitudes', 'santé', 'loisirs', 'voyages', 'personnalité'
  ];

  const categoryEmojis = {
    identité: "👤", localisation: "📍", profession: "💼", préférences: "❤️",
    dates: "📅", relations: "👥", habitudes: "🔄", santé: "🏥",
    loisirs: "🎯", voyages: "✈️", personnalité: "🧠"
  };

  const handleStartEdit = (fact: PendingMemoryFact) => {
    setEditingFact(fact.id);
    setEditContent(fact.content);
    setEditCategory(fact.category);
  };

  const handleSaveEdit = (factId: string) => {
    onValidate(factId, true, editContent, editCategory);
    setEditingFact(null);
  };

  const handleCancelEdit = () => {
    setEditingFact(null);
    setEditContent('');
    setEditCategory('');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'regex': return '🔍';
      case 'contextual': return '🧠';
      case 'semantic': return '🎯';
      default: return '💭';
    }
  };

  if (!visible || pendingFacts.length === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Validation des informations détectées
          </CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Vérifiez et validez les informations avant de les ajouter à votre mémoire
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Actions groupées */}
          <div className="flex gap-2 pb-4 border-b border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => onValidateAll(true)}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Tout valider
            </Button>
            <Button
              variant="outline"
              onClick={() => onValidateAll(false)}
              className="flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Tout refuser
            </Button>
          </div>

          {/* Liste des faits en attente */}
          {pendingFacts.map((fact) => (
            <div
              key={fact.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">
                  {categoryEmojis[fact.category as keyof typeof categoryEmojis] || "💭"}
                </span>
                
                <div className="flex-1 min-w-0">
                  {editingFact === fact.id ? (
                    // Mode édition
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor={`content-${fact.id}`} className="text-sm font-medium">
                          Contenu
                        </Label>
                        <Input
                          id={`content-${fact.id}`}
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="mt-1"
                          placeholder="Contenu de l'information"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`category-${fact.id}`} className="text-sm font-medium">
                          Catégorie
                        </Label>
                        <Select value={editCategory} onValueChange={setEditCategory}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Sélectionner une catégorie" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>
                                {categoryEmojis[category as keyof typeof categoryEmojis]} {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(fact.id)}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Sauvegarder
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Mode affichage
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white mb-2">
                        {fact.content}
                      </p>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          {fact.category}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getConfidenceColor(fact.confidence)}`}
                        >
                          {Math.round(fact.confidence * 100)}%
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getSourceIcon(fact.source)} {fact.source}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => onValidate(fact.id, true)}
                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Valider
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStartEdit(fact)}
                          className="flex items-center gap-1"
                        >
                          <Edit3 className="w-3 h-3" />
                          Modifier
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onValidate(fact.id, false)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700"
                        >
                          <XCircle className="w-3 h-3" />
                          Rejeter
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Informations sur la validation */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              💡 Conseils de validation
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Vérifiez l'exactitude des informations détectées</li>
              <li>• Modifiez le contenu si nécessaire</li>
              <li>• Ajustez la catégorie si elle ne correspond pas</li>
              <li>• Rejetez les informations non pertinentes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 