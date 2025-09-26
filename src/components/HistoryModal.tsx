import { useMemo, useState, useEffect } from 'react';
import { History, X, Search, MessageCircle, Users, Trash2, CheckSquare, Square, Grid3X3, List, ChevronLeft, ChevronRight, MoreHorizontal, Baby } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Discussion } from '@/hooks/useDiscussions';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

// Interface sans le champ category
export interface DiscussionWithCategory extends Discussion {
  category?: string;
}

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
  history: DiscussionWithCategory[];
  onLoad: (discussion: DiscussionWithCategory) => void;
  onDelete: (idx: number) => void;
  onRename: (idx: number, newTitle: string) => void;
  onDeleteMultiple?: (indices: number[]) => void;
}

// Formatage contextuel de la date
function formatDate(date: Date): string {
  const now = new Date();
  const d = new Date(date);
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60 * 60 * 24 && now.getDate() === d.getDate()) return "Aujourd'hui";
  if (diff < 60 * 60 * 48 && now.getDate() - d.getDate() === 1) return 'Hier';
  if (diff < 60 * 60 * 24 * 7) return `Il y a ${Math.floor(diff / (60 * 60 * 24))} j`;
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// Illustration SVG pour l'état vide
function EmptyIllustration() {
  return (
    <div className="flex flex-col items-center justify-center py-16 opacity-80 select-none">
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/30 dark:to-indigo-800/30 rounded-2xl flex items-center justify-center">
          <History className="w-12 h-12 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
          <MessageCircle className="w-4 h-4 text-white" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <div className="text-muted-foreground text-xl font-bold">Aucune discussion sauvegardée</div>
        <div className="text-sm text-slate-400 max-w-md">
          Vos conversations récentes apparaîtront ici. Commencez une nouvelle discussion pour voir l'historique.
        </div>
      </div>
      <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <span>En attente de conversations...</span>
      </div>
    </div>
  );
}

export function HistoryModal({ open, onClose, history, onLoad, onDelete, onRename, onDeleteMultiple }: HistoryModalProps) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'date-desc' | 'date-asc' | 'alpha'>('date-desc');
  const [selected, setSelected] = useState<number[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [viewMode, setViewMode] = useState<'compact' | 'detailed'>('compact');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'compact' ? 12 : 6;

  // Recherche + tri
  const filtered = useMemo(() => {
    let arr = history;
    if (search.trim()) {
      const s = search.toLowerCase();
      arr = arr.filter(d =>
        (d.title || '').toLowerCase().includes(s) ||
        d.messages.some(m => m.text.toLowerCase().includes(s))
      );
    }
    if (sort === 'date-desc') {
      arr = [...arr].sort((a, b) => {
        const da = a.messages[0]?.timestamp ? new Date(a.messages[0].timestamp).getTime() : 0;
        const db = b.messages[0]?.timestamp ? new Date(b.messages[0].timestamp).getTime() : 0;
        return db - da;
      });
    } else if (sort === 'date-asc') {
      arr = [...arr].sort((a, b) => {
        const da = a.messages[0]?.timestamp ? new Date(a.messages[0].timestamp).getTime() : 0;
        const db = b.messages[0]?.timestamp ? new Date(b.messages[0].timestamp).getTime() : 0;
        return da - db;
      });
    } else if (sort === 'alpha') {
      arr = [...arr].sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }
    return arr;
  }, [history, search, sort]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedItems = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, sort, viewMode]);

  // Gestion sélection multiple
  const toggleSelect = (idx: number) => {
    setSelected(sel => sel.includes(idx) ? sel.filter(i => i !== idx) : [...sel, idx]);
  };
  const selectAll = () => {
    if (selected.length === filtered.length) {
      setSelected([]);
    } else {
      setSelected(filtered.map(discussion => history.findIndex(d => d === discussion)));
    }
  };
  const handleDeleteSelected = () => {
    if (selected.length === 0) return;
    if (onDeleteMultiple) {
      onDeleteMultiple(selected);
    } else {
      [...selected].sort((a, b) => b - a).forEach(idx => onDelete(idx));
    }
    setSelected([]);
    setShowConfirm(false);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 overflow-hidden rounded-none">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <History className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  Discussions récentes ({filtered.length})
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Gérez vos conversations sauvegardées
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            {/* Barre de recherche et contrôles */}
            <div className="p-6 border-b bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex items-center w-full sm:w-1/2 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher une discussion..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    aria-label="Rechercher"
                  />
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select
                    value={sort}
                    onChange={e => setSort(e.target.value as 'date-desc' | 'date-asc' | 'alpha')}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    aria-label="Trier"
                  >
                    <option value="date-desc">Plus récentes</option>
                    <option value="date-asc">Plus anciennes</option>
                    <option value="alpha">Alphabétique</option>
                  </select>
                  
                  {/* Toggle vue compact/détaillé */}
                  <div className="flex items-center gap-1 bg-blue-50 dark:bg-indigo-950 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('compact')}
                      className={`p-2 rounded-lg transition-all ${viewMode === 'compact' ? 'bg-blue-500 text-white shadow-sm' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                      title="Vue compacte"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('detailed')}
                      className={`p-2 rounded-lg transition-all ${viewMode === 'detailed' ? 'bg-blue-500 text-white shadow-sm' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                      title="Vue détaillée"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Boutons sélection multiple */}
              <div className="flex items-center gap-3 pt-4">
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold bg-blue-50 dark:bg-indigo-950 hover:bg-blue-100 dark:hover:bg-indigo-900 transition"
                  onClick={selectAll}
                  type="button"
                  title={selected.length === filtered.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                >
                  {selected.length === filtered.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  {selected.length === filtered.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                </button>
                <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                  <AlertDialogTrigger asChild>
                    <button
                      className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-semibold bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 transition disabled:opacity-50"
                      type="button"
                      disabled={selected.length === 0}
                      title="Supprimer la sélection"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer ({selected.length})
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer {selected.length} discussion{selected.length > 1 ? 's' : ''} ?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Cette action est irréversible. Les discussions sélectionnées seront définitivement supprimées.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteSelected}>Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                {/* Pagination info */}
                <div className="ml-auto flex items-center gap-2 text-sm text-slate-500">
                  <span>Page {currentPage} sur {totalPages}</span>
                  <span>•</span>
                  <span>{filtered.length} discussion{filtered.length > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            {/* Zone principale des discussions */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {filtered.length === 0 ? (
                  <EmptyIllustration />
                ) : (
                  <>
                    <div className={viewMode === 'compact' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                      {paginatedItems.map((discussion, idx) => {
                        const nbMessages = discussion.messages.length;
                        const nbQuestions = discussion.messages.filter(m => m.isUser).length;
                        const nbReponses = nbMessages - nbQuestions;
                        const date = discussion.messages[0]?.timestamp ? new Date(discussion.messages[0].timestamp) : null;
                        const realIdx = history.findIndex(d => d === discussion);
                        const actualIdx = (currentPage - 1) * itemsPerPage + idx;
                        
                        return (
                          <div
                            key={realIdx}
                            className={`group border rounded-2xl p-5 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-950 dark:to-indigo-950 hover:shadow-xl transition-all duration-300 cursor-pointer ${
                              viewMode === 'compact' ? 'hover:scale-[1.02] hover:shadow-2xl' : 'hover:shadow-2xl'
                            } ${selected.includes(realIdx) ? 'ring-2 ring-blue-500 bg-blue-100 dark:bg-blue-900/20' : ''}`}
                            onClick={() => {
                              if (editingIdx !== actualIdx) onLoad(discussion);
                            }}
                          >
                            {/* Header avec sélection */}
                            <div className="flex items-start gap-3 mb-4">
                              <input
                                type="checkbox"
                                checked={selected.includes(realIdx)}
                                onChange={() => toggleSelect(realIdx)}
                                className="mt-1 accent-blue-500 w-4 h-4"
                                onClick={e => e.stopPropagation()}
                              />
                              <div className="flex-1 min-w-0">
                                {editingIdx === actualIdx ? (
                                  <input
                                    type="text"
                                    value={editingValue}
                                    onChange={e => setEditingValue(e.target.value)}
                                    autoFocus
                                    className="w-full text-base font-semibold bg-transparent border-b-2 border-blue-400 focus:outline-none"
                                    onClick={e => e.stopPropagation()}
                                  />
                                ) : (
                                  <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate text-base sm:text-lg">
                                    {discussion.title || `Discussion ${realIdx + 1}`}
                                  </h3>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                  {date ? formatDate(date) : ''}
                                </span>
                                {discussion.childMode && (
                                  <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                                    <Baby className="w-3 h-3" /> Mode enfant
                                  </span>
                                )}
                                {viewMode === 'detailed' && (
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {editingIdx === actualIdx ? (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => { e.stopPropagation(); onRename(realIdx, editingValue); setEditingIdx(null); }}
                                          className="h-7 w-7 p-0 text-green-500 hover:bg-green-100"
                                        >
                                          ✓
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => { e.stopPropagation(); setEditingIdx(null); }}
                                          className="h-7 w-7 p-0 text-red-500 hover:bg-red-100"
                                        >
                                          ✕
                                        </Button>
                                      </>
                                    ) : (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => { e.stopPropagation(); setEditingIdx(actualIdx); setEditingValue(discussion.title || ''); }}
                                          className="h-7 w-7 p-0 text-blue-500 hover:bg-blue-100"
                                        >
                                          ✎
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => { e.stopPropagation(); onDelete(realIdx); }}
                                          className="h-7 w-7 p-0 text-red-500 hover:bg-red-100"
                                        >
                                          🗑
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Aperçu du contenu */}
                            {viewMode === 'detailed' && (
                              <div className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                                {discussion.messages.map(m => m.text).join(' ').slice(0, 200)}...
                              </div>
                            )}
                            
                            {/* Stats */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-slate-500">
                                <span className="flex items-center gap-2 font-medium">
                                  <MessageCircle className="w-4 h-4" />
                                  {nbMessages} messages
                                </span>
                                {viewMode === 'detailed' && (
                                  <span className="flex items-center gap-2 font-medium">
                                    <Users className="w-4 h-4" />
                                    {nbQuestions}Q/{nbReponses}R
                                  </span>
                                )}
                              </div>
                              
                              {/* Actions compactes */}
                              {viewMode === 'compact' && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setEditingIdx(actualIdx); setEditingValue(discussion.title || ''); }}
                                    className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-500"
                                    title="Renommer"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-3 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="flex items-center gap-2"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Précédent
                        </Button>
                        
                        <div className="flex items-center gap-2">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = i + 1;
                            return (
                              <Button
                                key={page}
                                variant={currentPage === page ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className="w-10 h-10 p-0"
                              >
                                {page}
                              </Button>
                            );
                          })}
                          {totalPages > 5 && (
                            <>
                              <span className="text-slate-400">...</span>
                              <Button
                                variant={currentPage === totalPages ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setCurrentPage(totalPages)}
                                className="w-10 h-10 p-0"
                              >
                                {totalPages}
                              </Button>
                            </>
                          )}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="flex items-center gap-2"
                        >
                          Suivant
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer avec actions rapides */}
        <div className="px-6 py-4 border-t bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                <History className="w-3 h-3 mr-1" />
                Historique
              </Badge>
              <Badge variant="outline" className="text-xs">
                Conversations sauvegardées
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                Fermer
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 