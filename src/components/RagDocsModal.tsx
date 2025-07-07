import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RagDocsModalProps {
  open: boolean;
  onClose: () => void;
}

// Clé localStorage pour les docs utilisateur
const LS_KEY = 'rag_user_docs';

// Type d'un document RAG
interface RagDoc {
  id: string;
  titre: string;
  contenu: string;
  origine: 'dossier' | 'utilisateur';
}

export function RagDocsModal({ open, onClose }: RagDocsModalProps) {
  const [docs, setDocs] = useState<RagDoc[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les docs du dossier (via import.meta.glob)
  useEffect(() => {
    async function loadDocs() {
      // @ts-ignore
      const modules = import.meta.glob('../data/rag_docs/*.{txt,md}', { as: 'raw', eager: true });
      const dossierDocs: RagDoc[] = Object.entries(modules).map(([path, contenu], idx) => {
        const titre = path.split('/').pop()?.replace(/\.[^/.]+$/, '') || `Document ${idx + 1}`;
        return {
          id: 'dossier-' + idx,
          titre,
          contenu: contenu as string,
          origine: 'dossier',
        };
      });
      // Docs utilisateur
      const userRaw = localStorage.getItem(LS_KEY);
      let userDocs: RagDoc[] = [];
      if (userRaw) {
        try {
          userDocs = JSON.parse(userRaw);
        } catch {}
      }
      setDocs([...dossierDocs, ...userDocs]);
    }
    if (open) loadDocs();
  }, [open]);

  // Ajouter un document utilisateur
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      alert('Seuls les fichiers .txt et .md sont acceptés.');
      return;
    }
    const text = await file.text();
    const titre = file.name.replace(/\.[^/.]+$/, '');
    const newDoc: RagDoc = {
      id: 'user-' + Date.now(),
      titre,
      contenu: text,
      origine: 'utilisateur',
    };
    // Sauvegarder dans le localStorage
    const userRaw = localStorage.getItem(LS_KEY);
    let userDocs: RagDoc[] = [];
    if (userRaw) {
      try { userDocs = JSON.parse(userRaw); } catch {}
    }
    userDocs.push(newDoc);
    localStorage.setItem(LS_KEY, JSON.stringify(userDocs));
    setDocs(docs => [...docs, newDoc]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Supprimer un document utilisateur
  const handleDelete = (id: string) => {
    if (!window.confirm('Supprimer ce document ?')) return;
    const userRaw = localStorage.getItem(LS_KEY);
    let userDocs: RagDoc[] = [];
    if (userRaw) {
      try { userDocs = JSON.parse(userRaw); } catch {}
    }
    userDocs = userDocs.filter(doc => doc.id !== id);
    localStorage.setItem(LS_KEY, JSON.stringify(userDocs));
    setDocs(docs => docs.filter(doc => doc.id !== id));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-500 hover:text-red-500"><X className="w-5 h-5" /></button>
        <h2 className="text-xl font-bold mb-4">Gestion des documents RAG</h2>
        <div className="mb-4 flex items-center gap-2">
          <input
            type="file"
            accept=".txt,.md"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" /> Ajouter un document
          </Button>
          <span className="text-xs text-muted-foreground">(txt, md)</span>
        </div>
        {docs.length === 0 ? (
          <div className="text-muted-foreground text-center">Aucun document disponible.</div>
        ) : (
          <ul className="space-y-3">
            {docs.map(doc => {
              return (
                <li key={doc.id} className="border rounded-lg p-3 bg-slate-50 dark:bg-slate-800 flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-blue-900 dark:text-blue-100 text-sm truncate">{doc.titre}</div>
                    <div className="text-xs text-muted-foreground truncate">{doc.contenu.slice(0, 80)}...</div>
                    <div className="text-[10px] text-slate-400 mt-1">Origine : {doc.origine === 'dossier' ? 'Dossier rag_docs' : "Ajouté par l'utilisateur"}</div>
                  </div>
                  {doc.origine === 'utilisateur' ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2"
                      title="Supprimer"
                      onClick={() => handleDelete(doc.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
        <Button onClick={onClose} className="mt-6 w-full">Fermer</Button>
      </div>
    </div>
  );
} 