import React, { useMemo, useState } from 'react';
import { History, X, Search, ChevronDown, ChevronUp, Tag, MessageCircle, Users, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Discussion } from '@/hooks/useDiscussions';

// Interface sans le champ category
export interface DiscussionWithCategory extends Discussion {}

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
  history: DiscussionWithCategory[];
  onLoad: (discussion: DiscussionWithCategory) => void;
  onDelete: (idx: number) => void;
  onRename: (idx: number, newTitle: string) => void;
}

// Formatage contextuel de la date
function formatDate(date: Date): string {
  const now = new Date();
  const d = new Date(date);
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 60 * 60 * 24 && now.getDate() === d.getDate()) return "Aujourd'hui";
  if (diff < 60 * 60 * 48 && now.getDate() - d.getDate() === 1) return 'Hier';
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

export function HistoryModal({ open, onClose, history, onLoad, onDelete, onRename }: HistoryModalProps) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'date-desc' | 'date-asc' | 'alpha'>('date-desc');

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-0 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-fadeIn">
        {/* Header premium */}
        <div className="rounded-t-2xl px-7 py-6 bg-gradient-to-r from-blue-100 via-indigo-100 to-purple-100 dark:from-blue-900 dark:via-slate-900 dark:to-purple-950 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <History className="w-7 h-7 text-blue-500 mr-2" />
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-300 dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent drop-shadow-sm tracking-tight mb-1">Discussions récentes</h2>
            <div className="text-xs text-muted-foreground font-medium">{filtered.length} résultat{filtered.length !== 1 ? 's' : ''} / {history.length} au total</div>
          </div>
          <button onClick={onClose} className="ml-auto text-slate-500 hover:text-red-500 rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-red-400" title="Fermer" aria-label="Fermer">
            <X className="w-6 h-6" />
          </button>
        </div>
        {/* Barre de recherche et tri */}
        <div className="flex flex-col sm:flex-row items-center gap-2 px-7 py-4 bg-white dark:bg-slate-900 sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center w-full sm:w-1/2 relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une discussion..."
              className="w-full pl-8 pr-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Rechercher"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={sort}
              onChange={e => setSort(e.target.value as any)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm px-2 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Trier"
            >
              <option value="date-desc">Plus récentes</option>
              <option value="date-asc">Plus anciennes</option>
              <option value="alpha">Alphabétique</option>
            </select>
          </div>
        </div>
        {/* Liste ou état vide */}
        <div className="px-7 py-6">
          {filtered.length === 0 ? (
            <EmptyIllustration />
          ) : (
            <ul className="space-y-5">
              {filtered.map((discussion, idx) => {
                const nbMessages = discussion.messages.length;
                const nbQuestions = discussion.messages.filter(m => m.isUser).length;
                const nbReponses = nbMessages - nbQuestions;
                const date = discussion.messages[0]?.timestamp ? new Date(discussion.messages[0].timestamp) : null;
                return (
                  <li
                    key={idx}
                    className="group border rounded-2xl p-5 bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950 hover:shadow-xl transition-all duration-200 flex items-center gap-4 focus-within:ring-2 focus-within:ring-blue-400 animate-fadeIn"
                    tabIndex={0}
                    aria-label={`Charger la discussion ${discussion.title || `Discussion ${idx + 1}`}`}
                  >
                    <div className="flex flex-col items-center gap-2 mr-2">
                      <History className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => {
                        if (editingIdx !== idx) onLoad(discussion);
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {editingIdx === idx ? (
                          <>
                            <input
                              type="text"
                              value={editingValue}
                              onChange={e => setEditingValue(e.target.value)}
                              autoFocus
                              className="text-base font-semibold bg-transparent border-b border-blue-400 focus:outline-none px-1 w-40 mr-2"
                              aria-label="Renommer la discussion"
                              onClick={e => e.stopPropagation()}
                            />
                          </>
                        ) : (
                          <span className="font-semibold truncate text-lg" title={discussion.title}>{discussion.title || `Discussion ${idx + 1}`}</span>
                        )}
                        <span className="ml-auto text-xs text-muted-foreground flex items-center gap-1"><CalendarDays className="w-3 h-3 mr-0.5" />{date ? formatDate(date) : ''}</span>
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2 mb-1">{discussion.messages.map(m => m.text).join(' ').slice(0, 100)}...</div>
                      <div className="flex gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{nbMessages} messages</span>
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{nbQuestions} questions / {nbReponses} réponses</span>
                      </div>
                    </div>
                    {/* Actions */}
                    {editingIdx === idx ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2"
                          title="Valider"
                          onClick={() => { onRename(idx, editingValue); setEditingIdx(null); setEditingValue(''); }}
                          aria-label="Valider"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-1"
                          title="Annuler"
                          onClick={() => { setEditingIdx(null); setEditingValue(''); }}
                          aria-label="Annuler"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-2"
                        title="Renommer"
                        onClick={() => { setEditingIdx(idx); setEditingValue(discussion.title); }}
                        aria-label="Renommer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3zm0 0v3h3" /></svg>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-1"
                      title="Supprimer"
                      onClick={() => onDelete(idx)}
                      aria-label="Supprimer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 