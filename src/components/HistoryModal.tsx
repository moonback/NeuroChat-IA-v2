import React from 'react';
import { History, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Discussion } from '@/hooks/useDiscussions';

interface HistoryModalProps {
  open: boolean;
  onClose: () => void;
  history: Discussion[];
  onLoad: (discussion: Discussion) => void;
  onDelete: (idx: number) => void;
  onRename: (idx: number, newTitle: string) => void;
}

export function HistoryModal({ open, onClose, history, onLoad, onDelete, onRename }: HistoryModalProps) {
  const [editingIdx, setEditingIdx] = React.useState<number | null>(null);
  const [editingValue, setEditingValue] = React.useState('');

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-500 hover:text-red-500"><X className="w-5 h-5" /></button>
        <h2 className="text-xl font-bold mb-4">Discussions récentes</h2>
        {history.length === 0 ? (
          <div className="text-muted-foreground text-center">Aucune discussion sauvegardée.</div>
        ) : (
          <ul className="space-y-4">
            {history.map((discussion, idx) => (
              <li key={idx} className="border rounded-lg p-3 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition group flex items-center gap-2">
                <div className="flex-1 min-w-0" onClick={() => onLoad(discussion)} style={{ cursor: 'pointer' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <History className="w-4 h-4 text-blue-500" />
                    {editingIdx === idx ? (
                      <input
                        type="text"
                        value={editingValue}
                        onChange={e => setEditingValue(e.target.value)}
                        onBlur={() => { onRename(idx, editingValue); setEditingIdx(null); setEditingValue(''); }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') { onRename(idx, editingValue); setEditingIdx(null); setEditingValue(''); }
                          else if (e.key === 'Escape') { setEditingIdx(null); setEditingValue(''); }
                        }}
                        autoFocus
                        className="text-base font-semibold bg-transparent border-b border-blue-400 focus:outline-none px-1 w-40"
                      />
                    ) : (
                      <span className="font-semibold truncate" title={discussion.title}>{discussion.title || `Discussion ${idx + 1}`}</span>
                    )}
                    <span className="ml-auto text-xs text-muted-foreground">{discussion.messages[0]?.timestamp ? new Date(discussion.messages[0].timestamp).toLocaleString() : ''}</span>
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2">{discussion.messages.map(m => m.text).join(' ').slice(0, 80)}...</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                  title="Renommer"
                  onClick={() => { setEditingIdx(idx); setEditingValue(discussion.title); }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3zm0 0v3h3" /></svg>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-1"
                  title="Supprimer"
                  onClick={() => onDelete(idx)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 