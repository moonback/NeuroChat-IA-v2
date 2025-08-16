import React, { useEffect, useMemo, useState } from 'react';
import { X, Plus, Trash2, Upload, Download, Brain, ToggleLeft, ToggleRight, Edit3, Save, Star, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { MemoryItem, loadMemory, addMemory, updateMemory, deleteMemory, toggleMemoryDisabled, clearAllMemory, exportMemory, importMemory } from '@/services/memory';

interface MemoryModalProps {
  open: boolean;
  onClose: () => void;
}

export const MemoryModal: React.FC<MemoryModalProps> = ({ open, onClose }) => {
  const [items, setItems] = useState<MemoryItem[]>([]);
  const [query, setQuery] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [newImportance, setNewImportance] = useState(3);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState<'created' | 'updated' | 'importance' | 'content'>('updated');

  useEffect(() => {
    if (open) {
      setItems(loadMemory());
    }
  }, [open]);

  const filtered = useMemo(() => {
    let result = items;
    
    // Filtrage par recherche
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((m) =>
        m.content.toLowerCase().includes(q) ||
        (m.tags || []).some((t) => t.toLowerCase().includes(q))
      );
    }
    
    // Tri
    result.sort((a, b) => {
      switch (sortBy) {
        case 'created':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'updated':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'importance':
          return (b.importance || 0) - (a.importance || 0);
        case 'content':
          return a.content.localeCompare(b.content);
        default:
          return 0;
      }
    });
    
    return result;
  }, [items, query, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage);

  // Réinitialiser la page lors du changement de filtre
  useEffect(() => {
    setCurrentPage(1);
  }, [query, sortBy]);

  function refresh() {
    setItems(loadMemory());
  }

  function handleAdd() {
    if (!newContent.trim()) return;
    addMemory({ content: newContent.trim(), tags: splitTags(newTags), importance: newImportance, source: 'user' });
    setNewContent('');
    setNewTags('');
    setNewImportance(3);
    refresh();
  }

  function handleDelete(id: string) {
    deleteMemory(id);
    refresh();
  }

  function handleToggle(id: string, disabled: boolean) {
    toggleMemoryDisabled(id, !disabled);
    refresh();
  }

  function handleStartEdit(item: MemoryItem) {
    setEditingId(item.id);
    setEditingContent(item.content);
  }

  function handleSaveEdit() {
    if (!editingId) return;
    updateMemory(editingId, { content: editingContent.trim() });
    setEditingId(null);
    setEditingContent('');
    refresh();
  }

  function handleExport() {
    const data = exportMemory();
    const blob = new Blob([data], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neurochat-memoire-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importMemory(String(reader.result || ''));
        refresh();
      } catch {}
    };
    reader.readAsText(file);
  }

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="max-w-12xl px-2 sm:px-6 py-2 sm:py-6 rounded-3xl shadow-2xl border-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-white dark:from-slate-950 dark:via-indigo-950 dark:to-slate-950 backdrop-blur-xl ring-1 ring-white/20 dark:ring-slate-700/20 max-h-[95vh] overflow-y-auto">
        <DrawerHeader className="px-6 py-4 pb-2">
          <div className="flex items-center gap-2">
            <Brain className="w-7 h-7 text-blue-500 mr-2" />
            <DrawerTitle className="text-lg font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-300 dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent drop-shadow-sm tracking-tight">
              Mémoire utilisateur
            </DrawerTitle>
            <button onClick={onClose} className="ml-auto text-slate-500 hover:text-red-500 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-red-400" title="Fermer" aria-label="Fermer">
              <X className="w-6 h-6" />
            </button>
          </div>
        </DrawerHeader>

        <div className="flex-1 overflow-auto p-6 space-y-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input 
                placeholder="Rechercher (texte ou tag)…" 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                className="flex-1"
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleExport} title="Exporter">
                  <Download className="w-4 h-4 mr-2" /> Exporter
                </Button>
                <label className="inline-flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer text-sm">
                  <Upload className="w-4 h-4" /> Importer
                  <input type="file" accept="application/json" className="hidden" onChange={(e) => handleImport(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 items-center">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-slate-500" />
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Trier par..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="updated">Modifié</SelectItem>
                    <SelectItem value="created">Créé</SelectItem>
                    <SelectItem value="importance">Importance</SelectItem>
                    <SelectItem value="content">Contenu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filtered.length)} sur {filtered.length}
                </span>
                <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="p-3 border rounded-xl bg-slate-50 dark:bg-slate-900/40">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <Textarea
                className="sm:col-span-3"
                placeholder="Ajouter un fait important (ex: Je vis à Lyon; J’aime le tennis…)"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
              />
              <Input className="sm:col-span-1" placeholder="Tags (séparés par ,)" value={newTags} onChange={(e) => setNewTags(e.target.value)} />
              <div className="sm:col-span-1 flex items-center gap-2">
                <Input type="number" min={1} max={5} value={newImportance} onChange={(e) => setNewImportance(Number(e.target.value) || 3)} />
                <Button onClick={handleAdd}>
                  <Plus className="w-4 h-4 mr-1" /> Ajouter
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {filtered.length} élément(s) total
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Page {currentPage} sur {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
            {items.length > 0 && (
              <Button variant="destructive" onClick={() => { clearAllMemory(); refresh(); }}>
                <Trash2 className="w-4 h-4 mr-2" /> Tout effacer
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {paginatedItems.map((m) => (
              <div
                key={m.id}
                className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex items-start gap-3 bg-white/80 dark:bg-slate-900/60 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mt-1">
                  {m.disabled ? <ToggleLeft className="w-5 h-5 text-slate-400" /> : <ToggleRight className="w-5 h-5 text-emerald-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  {editingId === m.id ? (
                    <div className="space-y-2">
                      <Textarea value={editingContent} onChange={(e) => setEditingContent(e.target.value)} />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit}><Save className="w-4 h-4 mr-1" /> Enregistrer</Button>
                        <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setEditingContent(''); }}>Annuler</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="text-sm font-medium">{m.content}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star
                              key={idx}
                              className={`w-4 h-4 ${idx < (m.importance || 0) ? 'text-yellow-500 fill-yellow-400' : 'text-slate-300'}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-slate-400">•</span>
                        <div className="flex flex-wrap gap-1">
                          {(m.tags || []).length > 0 ? (
                            (m.tags || []).map((t) => (
                              <Badge key={t} variant="secondary" className="text-[10px] py-0.5 px-1.5">{t}</Badge>
                            ))
                          ) : (
                            <span className="text-xs text-slate-500">—</span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">•</span>
                        <div className="text-xs text-slate-400">Ajouté: {new Date(m.createdAt).toLocaleString('fr-FR')}</div>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {editingId !== m.id && (
                    <Button size="sm" variant="outline" onClick={() => handleStartEdit(m)} title="Modifier"><Edit3 className="w-4 h-4" /></Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => handleToggle(m.id, !!m.disabled)} title={m.disabled ? 'Activer' : 'Désactiver'}>
                    {m.disabled ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDelete(m.id)} title="Supprimer"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
            {paginatedItems.length === 0 && (
              <div className="text-sm text-slate-500 text-center py-10">
                {filtered.length === 0 ? 'Aucun élément de mémoire' : 'Aucun résultat sur cette page'}
              </div>
            )}
          </div>
        </div>

        <DrawerFooter className="flex flex-row gap-2 justify-end pt-3">
          <Button onClick={onClose} className="w-full text-base py-3">Fermer</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default MemoryModal;

function splitTags(text: string): string[] {
  return Array.from(new Set(text.split(',').map((t) => t.trim()).filter(Boolean))).slice(0, 8);
}


