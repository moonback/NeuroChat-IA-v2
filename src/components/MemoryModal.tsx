import React, { useEffect, useMemo, useState } from 'react';
import { X, Plus, Trash2, Upload, Download, Brain, ToggleLeft, ToggleRight, Edit3, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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

  useEffect(() => {
    if (open) {
      setItems(loadMemory());
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((m) =>
      m.content.toLowerCase().includes(q) ||
      (m.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }, [items, query]);

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
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Mémoire utilisateur
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input placeholder="Rechercher (texte ou tag)…" value={query} onChange={(e) => setQuery(e.target.value)} />
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
            <div className="text-sm text-slate-600 dark:text-slate-400">{filtered.length} élément(s)</div>
            {items.length > 0 && (
              <Button variant="destructive" onClick={() => { clearAllMemory(); refresh(); }}>
                <Trash2 className="w-4 h-4 mr-2" /> Tout effacer
              </Button>
            )}
          </div>

          <div className="max-h-[50vh] overflow-auto space-y-2">
            {filtered.map((m) => (
              <div key={m.id} className="p-3 border rounded-xl flex items-start gap-3 bg-white/70 dark:bg-slate-900/50">
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
                      <div className="text-xs text-slate-500">Tags: {(m.tags || []).join(', ') || '—'} • Importance: {m.importance}</div>
                      <div className="text-xs text-slate-400">Ajouté: {new Date(m.createdAt).toLocaleString('fr-FR')}</div>
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
            {filtered.length === 0 && (
              <div className="text-sm text-slate-500 text-center py-10">Aucun élément de mémoire</div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4 mr-2" /> Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemoryModal;

function splitTags(text: string): string[] {
  return Array.from(new Set(text.split(',').map((t) => t.trim()).filter(Boolean))).slice(0, 8);
}


