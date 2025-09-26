import { useMemo, useState, useEffect } from 'react';
import { History, X, Search, MessageCircle, Users, Trash2, CheckSquare, Square, Grid3X3, List, ChevronLeft, ChevronRight, MoreHorizontal, Baby } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Discussion } from '@/hooks/useDiscussions';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';

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
    <div className="flex flex-col items-center justify-center py-12 opacity-80 select-none">
      <svg width="90" height="90" viewBox="0 0 90 90" fill="none" className="mb-4">
        <rect x="10" y="20" width="70" height="50" rx="10" fill="#e0e7ef" />
        <rect x="20" y="30" width="50" height="8" rx="4" fill="#b6c3e0" />
        <rect x="20" y="45" width="35" height="6" rx="3" fill="#cfd8ea" />
        <rect x="20" y="57" width="25" height="6" rx="3" fill="#cfd8ea" />
        <circle cx="70" cy="60" r="6" fill="#b6c3e0" />
      </svg>
      <div className="text-muted-foreground text-lg font-semibold mb-1">Aucune discussion sauvegardée</div>
      <div className="text-xs text-slate-400">Vos conversations récentes apparaîtront ici.</div>
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
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="max-w-12xl px-2 sm:px-6 py-2 sm:py-6 rounded-3xl shadow-2xl border-0 bg-gradient-to-br from-slate-50 via-slate-50 to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 backdrop-blur-xl ring-1 ring-white/20 dark:ring-slate-700/20 max-h-[95vh] overflow-y-auto">
        <DrawerHeader className="pb-2">
          <div className="flex items-center gap-2">
            <History className="w-7 h-7 text-blue-500 mr-2" />
            <DrawerTitle className="text-lg font-bold bg-gradient-to-r from-slate-600 via-slate-600 to-slate-600 dark:from-slate-300 dark:via-slate-300 dark:to-slate-300 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
              Discussions récentes ({filtered.length})
            </DrawerTitle>
            <button onClick={onClose} className="ml-auto text-slate-500 hover:text-red-500 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-red-400" title="Fermer" aria-label="Fermer">
              <X className="w-6 h-6" />
            </button>
          </div>
        </DrawerHeader>
        
        {/* Barre de recherche, tri et contrôles */}
        <div className="flex flex-col gap-2 px-7 py-4 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="flex items-center w-full sm:w-1/2 relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher une discussion..."
                className="w-full pl-8 pr-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Rechercher"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={sort}
                onChange={e => setSort(e.target.value as 'date-desc' | 'date-asc' | 'alpha')}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Trier"
              >
                <option value="date-desc">Plus récentes</option>
                <option value="date-asc">Plus anciennes</option>
                <option value="alpha">Alphabétique</option>
              </select>
              
              {/* Toggle vue compact/détaillé */}
              <div className="flex items-center gap-1 bg-blue-50 dark:bg-indigo-950 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('compact')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'compact' ? 'bg-blue-500 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  title="Vue compacte"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('detailed')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'detailed' ? 'bg-blue-500 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                  title="Vue détaillée"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Boutons sélection multiple */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              className="flex items-center gap-1 px-3 py-1 rounded-lg border text-xs font-semibold bg-blue-50 dark:bg-indigo-950 hover:bg-blue-100 dark:hover:bg-indigo-900 transition"
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
                  className="flex items-center gap-1 px-3 py-1 rounded-lg border text-xs font-semibold bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800 text-red-700 dark:text-red-300 transition disabled:opacity-50"
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
            <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
              <span>Page {currentPage} sur {totalPages}</span>
              <span>•</span>
              <span>{filtered.length} discussion{filtered.length > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Liste ou grille des discussions */}
        <div className="px-7 py-6">
          {filtered.length === 0 ? (
            <EmptyIllustration />
          ) : (
            <>
              <div className={viewMode === 'compact' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-4'}>
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
                      className={`group border rounded-xl p-4 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 hover:shadow-lg transition-all duration-200 cursor-pointer animate-fadeIn ${
                        viewMode === 'compact' ? 'hover:scale-[1.02]' : 'hover:shadow-xl'
                      }`}
                      onClick={() => {
                        if (editingIdx !== actualIdx) onLoad(discussion);
                      }}
                    >
                      {/* Header avec sélection */}
                      <div className="flex items-start gap-3 mb-3">
                        <input
                          type="checkbox"
                          checked={selected.includes(realIdx)}
                          onChange={() => toggleSelect(realIdx)}
                          className="mt-1 accent-blue-500"
                          onClick={e => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          {editingIdx === actualIdx ? (
                            <input
                              type="text"
                              value={editingValue}
                              onChange={e => setEditingValue(e.target.value)}
                              autoFocus
                              className="w-full text-sm font-semibold bg-transparent border-b border-blue-400 focus:outline-none"
                              onClick={e => e.stopPropagation()}
                            />
                          ) : (
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate text-sm sm:text-base">
                              {discussion.title || `Discussion ${realIdx + 1}`}
                            </h3>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {date ? formatDate(date) : ''}
                          </span>
                          {discussion.childMode && (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
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
                                    className="h-6 w-6 p-0 text-green-500"
                                  >
                                    ✓
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => { e.stopPropagation(); setEditingIdx(null); }}
                                    className="h-6 w-6 p-0 text-red-500"
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
                                    className="h-6 w-6 p-0 text-blue-500"
                                  >
                                    ✎
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => { e.stopPropagation(); onDelete(realIdx); }}
                                    className="h-6 w-6 p-0 text-red-500"
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
                        <div className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                          {discussion.messages.map(m => m.text).join(' ').slice(0, 150)}...
                        </div>
                      )}
                      
                      {/* Stats */}
                      <div className="flex items-center justify_between">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="flex items_center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {nbMessages}
                          </span>
                          {viewMode === 'detailed' && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {nbQuestions}Q/{nbReponses}R
                            </span>
                          )}
                        </div>
                        
                        {/* Actions compactes */}
                        {viewMode === 'compact' && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingIdx(actualIdx); setEditingValue(discussion.title || ''); }}
                              className="p-1 rounded hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-500"
                              title="Renommer"
                            >
                              <MoreHorizontal className="w-3 h-3" />
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
                <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
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
                          className="w-8 h-8 p-0"
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
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
        
        <DrawerFooter className="flex flex-row gap-2 justify-end pt-3">
          <Button onClick={onClose} className="w-full text-base py-3">Fermer</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
} 