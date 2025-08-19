/**
 * 🧠 Modal de Gestion de la Mémoire Globale
 * 
 * Permet à l'utilisateur de visualiser, gérer et interagir avec la mémoire globale
 * qui contient toutes les informations extraites des conversations précédentes.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

import { 
  Brain, 
  Search, 
  Download, 
  Upload, 
  Trash2, 
  Plus, 
  Edit3, 
  Tag,
  Calendar,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  globalMemoryService, 
  type MemoryItem, 
  type ConversationSummary 
} from '@/services/globalMemory';

interface GlobalMemoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalMemoryModal({ open, onOpenChange }: GlobalMemoryModalProps) {
  const [activeTab, setActiveTab] = useState('memories');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [filteredMemories, setFilteredMemories] = useState<MemoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingMemory, setEditingMemory] = useState<MemoryItem | null>(null);
  const [editForm, setEditForm] = useState({ content: '', importance: 3, tags: '' });

  // Charger les données au montage et à l'ouverture
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  // Filtrer les souvenirs selon la recherche et la catégorie
  useEffect(() => {
    let filtered = memories;
    
    // Filtre par catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(m => m.category === selectedCategory);
    }
    
    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.content.toLowerCase().includes(query) ||
        m.tags.some(tag => tag.toLowerCase().includes(query)) ||
        m.category.toLowerCase().includes(query)
      );
    }
    
    setFilteredMemories(filtered);
  }, [memories, searchQuery, selectedCategory]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      await globalMemoryService.initialize();
      
      // Charger les souvenirs et conversations
      const stats = globalMemoryService.getMemoryStats();
      console.log('🧠 Statistiques mémoire:', stats);
      
      // Récupérer tous les souvenirs et conversations
      const allMemories = globalMemoryService.getAllMemories();
      const allConversations = globalMemoryService.getAllConversations();
      
      console.log('🧠 Souvenirs chargés:', allMemories.length);
      console.log('🧠 Conversations chargées:', allConversations.length);
      
      setMemories(allMemories);
      setConversations(allConversations);
      
    } catch (error) {
      console.error('Erreur chargement données mémoire:', error);
      toast.error('Erreur lors du chargement de la mémoire');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleExportMemory = useCallback(() => {
    try {
      const data = globalMemoryService.exportMemory();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `neurochat-memoire-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Mémoire exportée avec succès');
    } catch (error) {
      console.error('Erreur export:', error);
      toast.error('Erreur lors de l\'export');
    }
  }, []);

  const handleImportMemory = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await globalMemoryService.importMemory(text);
      toast.success('Mémoire importée avec succès');
      loadData(); // Recharger les données
    } catch (error) {
      console.error('Erreur import:', error);
      toast.error('Erreur lors de l\'import');
    }
    
    // Réinitialiser l'input
    event.target.value = '';
  }, [loadData]);

  const handleClearMemory = useCallback(async () => {
    if (confirm('Êtes-vous sûr de vouloir effacer toute la mémoire ? Cette action est irréversible.')) {
      try {
        await globalMemoryService.clearMemory();
        toast.success('Mémoire effacée');
        loadData();
      } catch (error) {
        console.error('Erreur effacement:', error);
        toast.error('Erreur lors de l\'effacement');
      }
    }
  }, [loadData]);

  const handleCreateTestMemories = useCallback(async () => {
    try {
      await globalMemoryService.createTestMemories();
      toast.success('Souvenirs de test créés');
      loadData();
    } catch (error) {
      console.error('Erreur création souvenirs de test:', error);
      toast.error('Erreur lors de la création des souvenirs de test');
    }
  }, [loadData]);

  const handleEditMemory = useCallback((memory: MemoryItem) => {
    setEditingMemory(memory);
    setEditForm({
      content: memory.content,
      importance: memory.importance,
      tags: memory.tags.join(', ')
    });
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (!editingMemory) return;

    try {
      const updatedMemory: MemoryItem = {
        ...editingMemory,
        content: editForm.content,
        importance: editForm.importance,
        tags: editForm.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
      };

      // Mettre à jour la mémoire
      await globalMemoryService.updateMemory(updatedMemory);
      
      setEditingMemory(null);
      setEditForm({ content: '', importance: 3, tags: '' });
      toast.success('Mémoire mise à jour');
      loadData();
    } catch (error) {
      console.error('Erreur mise à jour:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  }, [editingMemory, editForm, loadData]);

  const handleDeleteMemory = useCallback(async (memoryId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce souvenir ?')) {
      try {
        await globalMemoryService.deleteMemory(memoryId);
        toast.success('Souvenir supprimé');
        loadData();
      } catch (error) {
        console.error('Erreur suppression:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  }, [loadData]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      personnalite: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      preferences: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      connaissances: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      evenements: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      projets: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      relations: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      autres: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    };
    return colors[category] || colors.autres;
  };

  const getImportanceIcon = (importance: number) => {
    const icons = ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'];
    return icons[importance - 1] || '⭐';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-blue-600" />
            Mémoire Globale du Chat
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="memories">Souvenirs</TabsTrigger>
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
          </TabsList>

          {/* Onglet Souvenirs */}
          <TabsContent value="memories" className="space-y-4">
            {/* Barre d'outils */}
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex flex-wrap gap-2 items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher dans la mémoire..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="personnalite">Personnalité</SelectItem>
                    <SelectItem value="preferences">Préférences</SelectItem>
                    <SelectItem value="connaissances">Connaissances</SelectItem>
                    <SelectItem value="evenements">Événements</SelectItem>
                    <SelectItem value="projets">Projets</SelectItem>
                    <SelectItem value="relations">Relations</SelectItem>
                    <SelectItem value="autres">Autres</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCreateTestMemories}>
                  <Plus className="h-4 w-4 mr-2" />
                  Test
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportMemory}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <label>
                    <Upload className="h-4 w-4 mr-2" />
                    Importer
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportMemory}
                      className="hidden"
                    />
                  </label>
                </Button>
                <Button variant="destructive" size="sm" onClick={handleClearMemory}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Effacer
                </Button>
              </div>
            </div>

            {/* Liste des souvenirs */}
            <ScrollArea className="h-96">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Chargement de la mémoire...</p>
                </div>
              ) : filteredMemories.length === 0 ? (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchQuery || selectedCategory !== 'all' 
                      ? 'Aucun souvenir trouvé avec ces critères'
                      : 'Aucun souvenir enregistré pour le moment'
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMemories.map((memory) => (
                    <Card key={memory.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getCategoryColor(memory.category)}>
                                {memory.category}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {getImportanceIcon(memory.importance)}
                              </span>
                              <span className="text-xs text-gray-400">
                                {memory.accessCount} accès
                              </span>
                            </div>
                            
                            <p className="text-sm mb-2">{memory.content}</p>
                            
                            {memory.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {memory.tags.map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    <Tag className="h-3 w-3 mr-1" />
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {memory.timestamp.toLocaleDateString('fr-FR')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {memory.lastAccessed.toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex gap-1 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditMemory(memory)}
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteMemory(memory.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Onglet Conversations */}
          <TabsContent value="conversations" className="space-y-4">
            <ScrollArea className="h-96">
              {conversations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">Aucune conversation résumée pour le moment</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {conversations.map((conv) => (
                    <Card key={conv.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{conv.title}</CardTitle>
                        <p className="text-sm text-gray-600">{conv.summary}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1 mb-3">
                          {conv.keyTopics.map((topic, index) => (
                            <Badge key={index} variant="outline">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">
                          {conv.messages.length} messages • {conv.timestamp.toLocaleDateString('fr-FR')}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Onglet Statistiques */}
          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Souvenirs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">
                    {memories.length}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Conversations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">
                    {conversations.length}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Récemment Ajoutés</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-orange-600">
                    {memories.filter(m => {
                      const oneWeekAgo = new Date();
                      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                      return m.timestamp > oneWeekAgo;
                    }).length}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Modal d'édition */}
        {editingMemory && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardHeader>
                <CardTitle>Modifier le souvenir</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Contenu</label>
                  <Textarea
                    value={editForm.content}
                    onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Contenu du souvenir..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Importance</label>
                  <Select
                    value={editForm.importance.toString()}
                    onValueChange={(value) => setEditForm(prev => ({ ...prev, importance: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Faible</SelectItem>
                      <SelectItem value="2">2 - Basse</SelectItem>
                      <SelectItem value="3">3 - Moyenne</SelectItem>
                      <SelectItem value="4">4 - Haute</SelectItem>
                      <SelectItem value="5">5 - Critique</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Tags (séparés par des virgules)</label>
                  <Input
                    value={editForm.tags}
                    onChange={(e) => setEditForm(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="tag1, tag2, tag3..."
                  />
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setEditingMemory(null)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSaveEdit}>
                    Sauvegarder
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
