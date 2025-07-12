import React, { useState } from 'react';
import { X, Sparkles, ChevronDown, Filter, Plus, Edit2, Trash2, Copy, Download, Upload, Settings } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { 
  getAllPersonalities, 
  personalityCategories, 
  getPersonalityById, 
  getPersonalitiesByCategory,
  isCustomPersonality,
  type Personality 
} from '@/config/personalities';
import { useCustomPersonalities, type CustomPersonality } from '@/hooks/useCustomPersonalities';
import { CustomPersonalityModal } from './CustomPersonalityModal';

interface PersonalitySelectorProps {
  open: boolean;
  onClose: () => void;
  selectedPersonality: string;
  onPersonalityChange: (personalityId: string) => void;
  showAsTrigger?: boolean;
  className?: string;
}

interface PersonalityTriggerProps {
  selectedPersonality: string;
  onClick: () => void;
  className?: string;
}

// Composant déclencheur compact pour l'affichage dans le header
export const PersonalityTrigger: React.FC<PersonalityTriggerProps> = ({ 
  selectedPersonality, 
  onClick, 
  className = '' 
}) => {
  const { customPersonalities } = useCustomPersonalities();
  const currentPersonality = getPersonalityById(selectedPersonality, customPersonalities);
  
  if (!currentPersonality) return null;
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`h-9 px-3 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${className}`}
    >
      <currentPersonality.icon className="w-4 h-4 mr-2" />
      <span>{currentPersonality.label}</span>
      {currentPersonality.isCustom && (
        <Badge variant="secondary" className="ml-2 text-xs">
          Custom
        </Badge>
      )}
      <ChevronDown className="w-3 h-3 ml-2" />
    </Button>
  );
};

// Composant principal du sélecteur
export const PersonalitySelector: React.FC<PersonalitySelectorProps> = ({ 
  open, 
  onClose, 
  selectedPersonality, 
  onPersonalityChange 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDetails, setShowDetails] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [editingPersonality, setEditingPersonality] = useState<CustomPersonality | null>(null);
  const [deletingPersonality, setDeletingPersonality] = useState<string | null>(null);
  const [showManageModal, setShowManageModal] = useState(false);

  const { 
    customPersonalities, 
    addCustomPersonality, 
    updateCustomPersonality, 
    deleteCustomPersonality,
    duplicateCustomPersonality,
    exportCustomPersonalities,
    importCustomPersonalities,
    resetCustomPersonalities,
    loading 
  } = useCustomPersonalities();

  const allPersonalities = getAllPersonalities(customPersonalities);
  const currentPersonality = getPersonalityById(selectedPersonality, customPersonalities);
  
  const filteredPersonalities = selectedCategory === 'all' 
    ? allPersonalities 
    : getPersonalitiesByCategory(selectedCategory, customPersonalities);
  
  const handlePersonalitySelect = (personalityId: string) => {
    onPersonalityChange(personalityId);
    onClose();
  };

  const handleCreatePersonality = () => {
    setEditingPersonality(null);
    setShowCustomModal(true);
  };

  const handleEditPersonality = (personality: Personality) => {
    if (personality.isCustom) {
      const customPersonality = customPersonalities.find(p => p.id === personality.id);
      if (customPersonality) {
        setEditingPersonality(customPersonality);
        setShowCustomModal(true);
      }
    }
  };

  const handleDeletePersonality = (personalityId: string) => {
    setDeletingPersonality(personalityId);
  };

  const confirmDelete = () => {
    if (deletingPersonality) {
      deleteCustomPersonality(deletingPersonality);
      
      // Si on supprime la personnalité actuellement sélectionnée, basculer vers la personnalité par défaut
      if (selectedPersonality === deletingPersonality) {
        onPersonalityChange('formel');
      }
      
      toast({
        title: "Personnalité supprimée",
        description: "La personnalité personnalisée a été supprimée avec succès.",
      });
    }
    setDeletingPersonality(null);
  };

  const handleDuplicatePersonality = (personalityId: string) => {
    const duplicated = duplicateCustomPersonality(personalityId);
    if (duplicated) {
      toast({
        title: "Personnalité dupliquée",
        description: `"${duplicated.label}" a été créée avec succès.`,
      });
    }
  };

  const handleSavePersonality = (personalityData: Omit<CustomPersonality, 'id' | 'isCustom' | 'createdAt' | 'updatedAt'>) => {
    const newPersonality = addCustomPersonality(personalityData);
    toast({
      title: "Personnalité créée",
      description: `"${newPersonality.label}" a été créée avec succès.`,
    });
    setShowCustomModal(false);
  };

  const handleUpdatePersonality = (id: string, updates: Partial<Omit<CustomPersonality, 'id' | 'isCustom' | 'createdAt'>>) => {
    updateCustomPersonality(id, updates);
    toast({
      title: "Personnalité mise à jour",
      description: "Les modifications ont été sauvegardées avec succès.",
    });
    setShowCustomModal(false);
  };

  const handleExport = () => {
    exportCustomPersonalities();
    toast({
      title: "Export réussi",
      description: "Vos personnalités personnalisées ont été exportées.",
    });
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const success = await importCustomPersonalities(file);
      if (success) {
        toast({
          title: "Import réussi",
          description: "Les personnalités personnalisées ont été importées.",
        });
      } else {
        toast({
          title: "Erreur d'import",
          description: "Impossible d'importer le fichier. Vérifiez le format.",
          variant: "destructive",
        });
      }
    }
    // Réinitialiser l'input
    event.target.value = '';
  };

  const handleReset = () => {
    resetCustomPersonalities();
    toast({
      title: "Réinitialisation effectuée",
      description: "Toutes les personnalités personnalisées ont été supprimées.",
    });
    setShowManageModal(false);
  };

  const customPersonalitiesCount = customPersonalities.length;

  return (
    <>
      <Drawer open={open} onOpenChange={onClose}>
        <DrawerContent className="w-[98vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] xl:w-[60vw] max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 rounded-3xl shadow-2xl border-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl ring-1 ring-white/20 dark:ring-slate-700/20 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5 duration-300">
          <DrawerHeader className="text-center pb-6 relative">
            <DrawerTitle className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Choisir une personnalité
            </DrawerTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              Sélectionnez le style de communication qui vous convient le mieux
            </p>
            
            {/* Bouton de fermeture */}
            <button 
              onClick={onClose} 
              className="absolute top-0 right-0 text-slate-400 hover:text-red-500 rounded-full p-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-red-400" 
              title="Fermer" 
              aria-label="Fermer"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            </button>
            
            {/* Boutons de gestion des personnalités personnalisées */}
            <div className="flex justify-center gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreatePersonality}
                className="text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Créer
              </Button>
              {customPersonalitiesCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowManageModal(true)}
                  className="text-xs"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Gérer ({customPersonalitiesCount})
                </Button>
              )}
            </div>
            
            {/* Filtre par catégorie */}
            <div className="flex flex-wrap gap-2 justify-center">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
                className="text-xs"
              >
                <Filter className="w-3 h-3 mr-1" />
                Toutes
              </Button>
              {Object.entries(personalityCategories).map(([key, category]) => (
                <Button
                  key={key}
                  variant={selectedCategory === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(key)}
                  className="text-xs"
                >
                  {category.label}
                </Button>
              ))}
            </div>
            
            {/* Toggle pour afficher les détails */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="mt-2 text-xs"
            >
              {showDetails ? 'Masquer les détails' : 'Afficher les détails'}
            </Button>
          </DrawerHeader>
          
          {/* Grille des personnalités */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 px-2 pb-4">
            {filteredPersonalities.map((personality, index) => (
              <PersonalityCard
                key={personality.id}
                personality={personality}
                isSelected={selectedPersonality === personality.id}
                onClick={() => handlePersonalitySelect(personality.id)}
                onEdit={() => handleEditPersonality(personality)}
                onDelete={() => handleDeletePersonality(personality.id)}
                onDuplicate={() => handleDuplicatePersonality(personality.id)}
                showDetails={showDetails}
                animationDelay={index * 50}
              />
            ))}
          </div>
          
          {/* Aperçu de la personnalité sélectionnée */}
          {currentPersonality && (
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <currentPersonality.icon className="w-5 h-5" />
                {currentPersonality.label}
                <Badge variant="secondary" className="ml-2">
                  {personalityCategories[currentPersonality.category]?.label}
                </Badge>
                {currentPersonality.isCustom && (
                  <Badge variant="outline" className="ml-2">
                    Personnalisé
                  </Badge>
                )}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                {currentPersonality.detailedDescription}
              </p>
              <div className="flex flex-wrap gap-1">
                {currentPersonality.traits.map((trait, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {trait}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <DrawerFooter className="pt-6">
            <Button onClick={onClose} className="w-full">
              Fermer
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Modal de création/édition */}
      <CustomPersonalityModal
        open={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onSave={handleSavePersonality}
        onUpdate={handleUpdatePersonality}
        editingPersonality={editingPersonality}
        title={editingPersonality ? "Modifier la personnalité" : "Créer une personnalité personnalisée"}
      />

      {/* Modal de gestion */}
      <Drawer open={showManageModal} onOpenChange={setShowManageModal}>
        <DrawerContent className="max-w-md mx-auto">
          <DrawerHeader>
            <DrawerTitle>Gérer les personnalités personnalisées</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {customPersonalitiesCount} personnalité{customPersonalitiesCount > 1 ? 's' : ''} personnalisée{customPersonalitiesCount > 1 ? 's' : ''}
            </div>
            
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="w-full justify-start"
                disabled={customPersonalitiesCount === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter les personnalités
              </Button>
              
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => document.getElementById('import-personalities')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Importer des personnalités
                </Button>
                <input
                  id="import-personalities"
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </div>
              
              <Button
                variant="destructive"
                size="sm"
                onClick={handleReset}
                className="w-full justify-start"
                disabled={customPersonalitiesCount === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer toutes les personnalités
              </Button>
            </div>
          </div>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setShowManageModal(false)}>
              Fermer
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={!!deletingPersonality} onOpenChange={() => setDeletingPersonality(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la personnalité</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cette personnalité personnalisée ? Cette action ne peut pas être annulée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// Composant pour afficher une carte de personnalité
interface PersonalityCardProps {
  personality: Personality;
  isSelected: boolean;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  showDetails: boolean;
  animationDelay: number;
}

const PersonalityCard: React.FC<PersonalityCardProps> = ({ 
  personality, 
  isSelected, 
  onClick, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  showDetails, 
  animationDelay 
}) => {
  return (
    <div className="relative">
      <button
        className={`group relative flex flex-col gap-3 w-full p-4 rounded-2xl font-medium text-left transition-all duration-300 ${
          personality.bg
        } border-2 ${
          isSelected 
            ? 'border-blue-500 ring-2 ring-blue-400/20 scale-[1.02]' 
            : 'border-transparent hover:border-blue-300 dark:hover:border-blue-700'
        } hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400/50 animate-in slide-in-from-left duration-200`}
        onClick={onClick}
        type="button"
        aria-label={`Sélectionner la personnalité ${personality.label}`}
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        {/* En-tête de la carte */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/80 dark:bg-slate-800/80 shadow-sm group-hover:shadow-md transition-shadow duration-200">
            <personality.icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {personality.label}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {personality.description}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isSelected && (
              <Sparkles className="w-4 h-4 text-blue-500 animate-pulse" />
            )}
            {personality.isCustom && (
              <Badge variant="secondary" className="text-xs">
                Custom
              </Badge>
            )}
          </div>
        </div>
        
        {/* Détails étendus */}
        {showDetails && (
          <div className="pt-2 border-t border-white/20 dark:border-slate-700/20">
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
              {personality.detailedDescription}
            </p>
            <div className="flex flex-wrap gap-1">
              {personality.traits.slice(0, 3).map((trait, index) => (
                <Badge key={index} variant="outline" className="text-xs py-0 px-1">
                  {trait}
                </Badge>
              ))}
              {personality.traits.length > 3 && (
                <Badge variant="outline" className="text-xs py-0 px-1">
                  +{personality.traits.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
      </button>
      
      {/* Actions pour les personnalités personnalisées */}
      {personality.isCustom && (
        <div className="absolute -top-2 -right-2 flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="h-6 w-6 p-0 bg-white dark:bg-slate-800 shadow-sm"
            title="Modifier"
          >
            <Edit2 className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className="h-6 w-6 p-0 bg-white dark:bg-slate-800 shadow-sm"
            title="Dupliquer"
          >
            <Copy className="w-3 h-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="h-6 w-6 p-0 bg-white dark:bg-slate-800 shadow-sm text-red-500 hover:text-red-600 dark:hover:text-red-400"
            title="Supprimer"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PersonalitySelector; 