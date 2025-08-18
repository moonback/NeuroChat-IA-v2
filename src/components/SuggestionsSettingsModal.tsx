import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, User, MessageSquare } from 'lucide-react';

interface SuggestionsSettingsModalProps {
  open: boolean;
  onClose: () => void;
  preferences: {
    detailLevel: 'basic' | 'detailed' | 'expert';
    interactionStyle: 'formal' | 'casual' | 'concise';
  };
  onUpdatePreferences: (preferences: { detailLevel: 'basic' | 'detailed' | 'expert'; interactionStyle: 'formal' | 'casual' | 'concise' }) => void;
}

export function SuggestionsSettingsModal({ 
  open, 
  onClose, 
  preferences, 
  onUpdatePreferences 
}: SuggestionsSettingsModalProps) {
  
  const handleDetailLevelChange = (value: 'basic' | 'detailed' | 'expert') => {
    onUpdatePreferences({ ...preferences, detailLevel: value });
  };

  const handleInteractionStyleChange = (value: 'formal' | 'casual' | 'concise') => {
    onUpdatePreferences({ ...preferences, interactionStyle: value });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            Préférences des suggestions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Niveau de détail */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Niveau de détail
              </CardTitle>
              <CardDescription>
                Contrôle la complexité des suggestions proposées
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="detail-level">Niveau préféré</Label>
                <Select value={preferences.detailLevel} onValueChange={handleDetailLevelChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Basique</span>
                        <span className="text-xs text-muted-foreground">Questions simples et directes</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="detailed">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Détaillé</span>
                        <span className="text-xs text-muted-foreground">Questions approfondies et exemples</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="expert">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Expert</span>
                        <span className="text-xs text-muted-foreground">Questions techniques avancées</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Style d'interaction */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Style d'interaction
              </CardTitle>
              <CardDescription>
                Définit le ton et le style des suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="interaction-style">Style préféré</Label>
                <Select value={preferences.interactionStyle} onValueChange={handleInteractionStyleChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="formal">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Formel</span>
                        <span className="text-xs text-muted-foreground">Ton professionnel et structuré</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="casual">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Décontracté</span>
                        <span className="text-xs text-muted-foreground">Ton amical et conversationnel</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="concise">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Concis</span>
                        <span className="text-xs text-muted-foreground">Suggestions courtes et efficaces</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Aperçu */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Aperçu des suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {preferences.detailLevel === 'basic' && preferences.interactionStyle === 'formal' && (
                  <>
                    <div className="p-2 bg-white dark:bg-gray-800 rounded border">• Pourriez-vous préciser ce point ?</div>
                    <div className="p-2 bg-white dark:bg-gray-800 rounded border">• Quelle est la prochaine étape ?</div>
                  </>
                )}
                {preferences.detailLevel === 'detailed' && preferences.interactionStyle === 'casual' && (
                  <>
                    <div className="p-2 bg-white dark:bg-gray-800 rounded border">• Peux-tu donner un exemple concret ?</div>
                    <div className="p-2 bg-white dark:bg-gray-800 rounded border">• Comment ça marche dans la pratique ?</div>
                  </>
                )}
                {preferences.detailLevel === 'expert' && preferences.interactionStyle === 'concise' && (
                  <>
                    <div className="p-2 bg-white dark:bg-gray-800 rounded border">• Optimisations possibles ?</div>
                    <div className="p-2 bg-white dark:bg-gray-800 rounded border">• Cas limites ?</div>
                  </>
                )}
                {/* Autres combinaisons */}
                {!(
                  (preferences.detailLevel === 'basic' && preferences.interactionStyle === 'formal') ||
                  (preferences.detailLevel === 'detailed' && preferences.interactionStyle === 'casual') ||
                  (preferences.detailLevel === 'expert' && preferences.interactionStyle === 'concise')
                ) && (
                  <>
                    <div className="p-2 bg-white dark:bg-gray-800 rounded border">• Suggestion exemple 1</div>
                    <div className="p-2 bg-white dark:bg-gray-800 rounded border">• Suggestion exemple 2</div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
