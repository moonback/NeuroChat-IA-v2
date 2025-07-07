import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2, UploadCloud, Eye, Pencil, Check, X as XIcon, FileText, FileSpreadsheet, FileCode2, FileType2, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import mammoth from 'mammoth';
import Papa from 'papaparse';

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
  extension?: string;
}

function getExtension(filename: string) {
  return filename.split('.').pop()?.toLowerCase() || '';
}

function getIcon(ext: string) {
  switch (ext) {
    case 'txt':
    case 'md':
      return <FileText className="w-4 h-4 text-blue-500" />;
    case 'pdf':
      return <FileType2 className="w-4 h-4 text-red-500" />;
    case 'docx':
      return <FileType2 className="w-4 h-4 text-indigo-500" />;
    case 'csv':
      return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
    case 'html':
      return <FileCode2 className="w-4 h-4 text-orange-500" />;
    default:
      return <File className="w-4 h-4 text-slate-400" />;
  }
}

export function RagDocsModal({ open, onClose }: RagDocsModalProps) {
  const [docs, setDocs] = useState<RagDoc[]>([]);
  const [search, setSearch] = useState('');
  const [previewDoc, setPreviewDoc] = useState<RagDoc | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les docs du dossier (via import.meta.glob)
  useEffect(() => {
    async function loadDocs() {
      // @ts-ignore
      const modules = import.meta.glob('../data/rag_docs/*.{txt,md}', { as: 'raw', eager: true });
      const dossierDocs: RagDoc[] = Object.entries(modules).map(([path, contenu], idx) => {
        const titre = path.split('/').pop()?.replace(/\.[^/.]+$/, '') || `Document ${idx + 1}`;
        const extension = getExtension(path);
        return {
          id: 'dossier-' + idx,
          titre,
          contenu: contenu as string,
          origine: 'dossier',
          extension,
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

  // Extraction de texte selon le type de fichier
  async function extractTextFromFile(file: File): Promise<string> {
    const ext = getExtension(file.name);
    if (ext === 'txt' || ext === 'md') {
      return await file.text();
    }
    if (ext === 'pdf') {
      try {
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
        const arrayBuffer = await file.arrayBuffer();
        // @ts-ignore
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          // Regrouper les items par ligne (y)
          let lastY = null;
          let line = '';
          for (const item of content.items as any[]) {
            if (lastY !== null && Math.abs(item.transform[5] - lastY) > 2) {
              text += line.trim() + '\n';
              line = '';
            }
            line += item.str + ' ';
            lastY = item.transform[5];
          }
          text += line.trim() + '\n';
        }
        // Post-traitement : filtrer les lignes inutiles (encore plus strict)
        let lines = text.split('\n')
          .map(l => l.trim())
          .filter(l =>
            l.length > 4 && // Ignore les lignes très courtes
            !/^[A-Z]{1,3}\d{0,3}$/.test(l) && // Codes type A10, B2, etc.
            !/^(\d{1,3}\s*)+$/.test(l) && // Lignes qui ne sont que des chiffres séparés par des espaces
            !/^([A-Z]{1,3}\s*)+$/.test(l) && // Lignes qui ne sont que des lettres majuscules séparées par des espaces
            !/^([A-Z]{1,3}\d{0,3}\s*)+$/.test(l) && // Lignes qui ne sont que des codes séparés par des espaces
            !/^PUSH$/i.test(l) && // PUSH seul
            /[a-zA-Zà-ÿ]{3,}/.test(l) // Doit contenir au moins un mot de 3 lettres ou plus
          );
        // Suppression des caractères spéciaux inutiles
        lines = lines.map(l =>
          l
            .replace(/[•·●◆■□▪▶►–—\-]{2,}/g, ' ') // séquences de puces/tirets
            .replace(/\s{2,}/g, ' ') // espaces multiples
            .replace(/[^\x20-\x7Eà-ÿÀ-ŸœŒçÇ€$£¥%°.,;:!?()\[\]{}<>\/@#'"\-\n]/g, '') // caractères non imprimables sauf ponctuation de base
            .replace(/\.{3,}/g, '.') // séquences de points
            .trim()
        );
        // Suppression de motifs supplémentaires (numéros de page, symboles, valeurs seules)
        const isTitle = (l: string) => /^[A-ZÀ-Ÿ0-9\s\-]{6,}$/.test(l) && l.length < 60;
        lines = lines.filter(l =>
          !/^Page\s*\d+([\/\-]\d+)?$/i.test(l) && // Page 3, Page 3/12, Page 3-12
          !/^[-–—\s]*\d+[-–—\s]*$/.test(l) && // - 4 -, -- 12 --
          !/^[.,;:!?()\[\]{}<>\/@#'"\-\s]+$/.test(l) && // lignes de ponctuation/symboles
          !/^\d+(\s*(L|kg|cm|mm|g|ml|cl|m|W|V|A|°C|°F|%)?)$/.test(l) // valeurs numériques seules ou avec unité
        );
        // Mise en forme des titres (saut de ligne avant/après)
        lines = lines.map(l => isTitle(l) ? `\n${l}\n` : l);
        // Fusion des lignes courtes avec la suivante (sauf titres)
        let fused: string[] = [];
        for (let i = 0; i < lines.length; i++) {
          let current = lines[i];
          while (
            current.length < 40 &&
            i + 1 < lines.length &&
            !isTitle(current)
          ) {
            current += ' ' + lines[i + 1];
            i++;
          }
          fused.push(current.trim());
        }
        // Normalisation des sauts de ligne
        return fused.join('\n').replace(/\n{3,}/g, '\n\n');
      } catch (e) {
        throw new Error('Erreur lors de l\'extraction du PDF.');
      }
    }
    if (ext === 'docx') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
      } catch (e) {
        throw new Error('Erreur lors de l\'extraction du DOCX.');
      }
    }
    if (ext === 'csv') {
      try {
        const text = await file.text();
        const parsed = Papa.parse(text);
        return parsed.data.map((row: any) => row.join(' ')).join('\n');
      } catch (e) {
        throw new Error('Erreur lors de l\'extraction du CSV.');
      }
    }
    if (ext === 'html') {
      try {
        const text = await file.text();
        const doc = new DOMParser().parseFromString(text, 'text/html');
        return doc.body.innerText || '';
      } catch (e) {
        throw new Error('Erreur lors de l\'extraction du HTML.');
      }
    }
    throw new Error('Type de fichier non supporté.');
  }

  // Ajouter un document utilisateur
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = getExtension(file.name);
    if (!['txt','md','pdf','docx','csv','html'].includes(ext)) {
      toast.error('Type de fichier non supporté.');
      return;
    }
    let text = '';
    try {
      text = await extractTextFromFile(file);
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'extraction du texte.');
      return;
    }
    if (!text.trim()) {
      toast.error('Aucun texte extrait du fichier.');
      return;
    }
    const titre = file.name.replace(/\.[^/.]+$/, '');
    const newDoc: RagDoc = {
      id: 'user-' + Date.now(),
      titre,
      contenu: text,
      origine: 'utilisateur',
      extension: ext,
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
    toast.success('Document ajouté !');
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
    toast.success('Document supprimé.');
  };

  // Renommage
  const handleStartEdit = (doc: RagDoc) => {
    setEditingId(doc.id);
    setEditingValue(doc.titre);
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingValue(e.target.value);
  };
  const handleEditSave = (doc: RagDoc) => {
    const trimmed = editingValue.trim();
    if (!trimmed) return;
    const userRaw = localStorage.getItem(LS_KEY);
    let userDocs: RagDoc[] = [];
    if (userRaw) {
      try { userDocs = JSON.parse(userRaw); } catch {}
    }
    userDocs = userDocs.map(d => d.id === doc.id ? { ...d, titre: trimmed } : d);
    localStorage.setItem(LS_KEY, JSON.stringify(userDocs));
    setDocs(docs => docs.map(d => d.id === doc.id ? { ...d, titre: trimmed } : d));
    setEditingId(null);
    setEditingValue('');
    toast.success('Titre modifié.');
  };
  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, doc: RagDoc) => {
    if (e.key === 'Enter') handleEditSave(doc);
    else if (e.key === 'Escape') { setEditingId(null); setEditingValue(''); }
  };

  // Filtrage
  const filteredDocs = docs.filter(doc =>
    doc.titre.toLowerCase().includes(search.toLowerCase()) ||
    doc.contenu.toLowerCase().includes(search.toLowerCase())
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-500 hover:text-red-500"><X className="w-5 h-5" /></button>
        <h2 className="text-xl font-bold mb-4">Gestion des documents RAG</h2>
        <div className="mb-4 flex items-center gap-2">
          <input
            type="file"
            accept=".txt,.md,.pdf,.docx,.csv,.html"
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
          <span className="text-xs text-muted-foreground">(txt, md, pdf, docx, csv, html)</span>
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un document..."
          className="w-full mb-3 px-3 py-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {filteredDocs.length === 0 ? (
          <div className="text-muted-foreground text-center">Aucun document trouvé.</div>
        ) : (
          <ul className="space-y-3">
            {filteredDocs.map(doc => {
              return (
                <li key={doc.id} className="border rounded-lg p-3 bg-slate-50 dark:bg-slate-800 flex items-center gap-2">
                  <div className="flex-1 min-w-0 flex gap-2 items-center">
                    {getIcon(doc.extension || '')}
                    {editingId === doc.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editingValue}
                          onChange={handleEditChange}
                          onBlur={() => handleEditSave(doc)}
                          onKeyDown={e => handleEditKeyDown(e, doc)}
                          autoFocus
                          className="text-sm font-semibold bg-transparent border-b border-blue-400 focus:outline-none px-1 w-32"
                        />
                        <Button size="icon" variant="ghost" onClick={() => handleEditSave(doc)}><Check className="w-4 h-4 text-green-500" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => { setEditingId(null); setEditingValue(''); }}><XIcon className="w-4 h-4 text-red-500" /></Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-blue-900 dark:text-blue-100 text-sm truncate">{doc.titre}</span>
                        {doc.origine === 'utilisateur' && (
                          <Button size="icon" variant="ghost" onClick={() => handleStartEdit(doc)} title="Renommer"><Pencil className="w-4 h-4 text-blue-400" /></Button>
                        )}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground truncate">{doc.contenu.slice(0, 80)}...</div>
                    <div className="text-[10px] text-slate-400 ml-1">.{doc.extension}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-1"
                    title="Aperçu"
                    onClick={() => setPreviewDoc(doc)}
                  >
                    <Eye className="w-4 h-4 text-indigo-500" />
                  </Button>
                  {doc.origine === 'utilisateur' ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-1"
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
      {/* Modale d'aperçu */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto relative">
            <button onClick={() => setPreviewDoc(null)} className="absolute top-3 right-3 text-slate-500 hover:text-red-500"><X className="w-5 h-5" /></button>
            <h3 className="text-lg font-bold mb-2">{previewDoc.titre}</h3>
            <pre className="whitespace-pre-wrap text-xs bg-slate-100 dark:bg-slate-800 rounded p-3 max-h-[60vh] overflow-y-auto">{previewDoc.contenu}</pre>
            <Button onClick={() => setPreviewDoc(null)} className="mt-4 w-full">Fermer l'aperçu</Button>
          </div>
        </div>
      )}
    </div>
  );
} 