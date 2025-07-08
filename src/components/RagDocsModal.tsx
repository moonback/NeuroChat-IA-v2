import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2, UploadCloud, Eye, Pencil, Check, X as XIcon, FileText, FileSpreadsheet, FileCode2, FileType2, File, FilePlus2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
// @ts-ignore
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import mammoth from 'mammoth';
import Papa from 'papaparse';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';

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
  // Sélection multiple pour suppression
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // Ajout de l'état pour le modal
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  // Ajout de l'état pour le drag & drop
  const [isDragging, setIsDragging] = useState(false);

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
    const files = e.target.files;
    if (!files || files.length === 0) return;
    let userRaw = localStorage.getItem(LS_KEY);
    let userDocs: RagDoc[] = [];
    if (userRaw) {
      try { userDocs = JSON.parse(userRaw); } catch {}
    }
    let addedCount = 0;
    for (const file of Array.from(files)) {
      const ext = getExtension(file.name);
      if (!['txt','md','pdf','docx','csv','html'].includes(ext)) {
        toast.error(`Type de fichier non supporté : ${file.name}`);
        continue;
      }
      let text = '';
      try {
        text = await extractTextFromFile(file);
      } catch (err: any) {
        toast.error(`${file.name} : ${err.message || 'Erreur lors de l\'extraction du texte.'}`);
        continue;
      }
      if (!text.trim()) {
        toast.error(`${file.name} : Aucun texte extrait du fichier.`);
        continue;
      }
      const titre = file.name.replace(/\.[^/.]+$/, '');
      const newDoc: RagDoc = {
        id: 'user-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
        titre,
        contenu: text,
        origine: 'utilisateur',
        extension: ext,
      };
      userDocs.push(newDoc);
      addedCount++;
    }
    localStorage.setItem(LS_KEY, JSON.stringify(userDocs));
    setDocs(docs => [...docs, ...userDocs.filter(d => !docs.some(doc => doc.id === d.id))]);
    if (addedCount > 0) toast.success(`${addedCount} document(s) ajouté(s) !`);
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto relative transition-all duration-300">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-red-500"><X className="w-6 h-6" /></button>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <UploadCloud className="w-6 h-6 text-blue-500" />
          Gestion des documents RAG
        </h2>
        <div
          onDrop={e => {
            e.preventDefault();
            setIsDragging(false);
            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
              // On crée un event factice pour réutiliser handleFileChange
              const dt = new DataTransfer();
              files.forEach(f => dt.items.add(f));
              if (fileInputRef.current) {
                fileInputRef.current.files = dt.files;
                // On déclenche manuellement le changement
                const event = { target: { files: dt.files } } as React.ChangeEvent<HTMLInputElement>;
                handleFileChange(event);
              }
            }
          }}
          onDragOver={e => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={e => {
            e.preventDefault();
            setIsDragging(false);
          }}
          className={`w-full p-6 mb-3 rounded-xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-2
            ${isDragging ? 'border-blue-500 bg-gradient-to-br from-blue-100 via-blue-50 to-indigo-100 dark:from-blue-900 dark:via-blue-950 dark:to-indigo-900 shadow-xl scale-[1.02]' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800'}
          `}
        >
          <UploadCloud className={`w-10 h-10 mb-2 ${isDragging ? 'text-blue-500 animate-bounce' : 'text-blue-400'}`} />
          <span className="font-semibold text-base">
            {isDragging ? "Déposez vos fichiers ici..." : "Glissez-déposez vos fichiers ici ou cliquez sur 'Ajouter un document'"}
          </span>
          <span className="text-xs text-muted-foreground">(txt, md, pdf, docx, csv, html)</span>
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher un document..."
          className="w-full mb-4 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="mb-4 flex justify-between items-center">
          <span className="text-sm text-slate-500">
            {filteredDocs.length} document{filteredDocs.length !== 1 ? "s" : ""} affiché{filteredDocs.length !== 1 ? "s" : ""}
          </span>
          <span className="text-xs text-slate-400">
            {docs.length} au total
          </span>
        </div>
        {/* Boutons de sélection et suppression groupée */}
        <div className="mb-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedIds(docs.filter(d => d.origine === 'utilisateur').map(d => d.id))}
            disabled={docs.filter(d => d.origine === 'utilisateur').length === 0}
          >
            Tout sélectionner
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setOpenDeleteModal(true)}
            disabled={selectedIds.length === 0}
          >
            Tout supprimer
          </Button>
        </div>
        <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supprimer les documents sélectionnés ?</DialogTitle>
            </DialogHeader>
            <div className="py-2 text-sm">
              Cette action est <span className="text-red-600 font-semibold">irréversible</span>.<br />
              Voulez-vous vraiment supprimer {selectedIds.length} document{selectedIds.length > 1 ? 's' : ''} ?
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDeleteModal(false)}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  const userRaw = localStorage.getItem(LS_KEY);
                  let userDocs: RagDoc[] = [];
                  if (userRaw) {
                    try { userDocs = JSON.parse(userRaw); } catch {}
                  }
                  userDocs = userDocs.filter(doc => !selectedIds.includes(doc.id));
                  localStorage.setItem(LS_KEY, JSON.stringify(userDocs));
                  setDocs(docs => docs.filter(doc => !selectedIds.includes(doc.id)));
                  setSelectedIds([]);
                  setOpenDeleteModal(false);
                  toast.success('Documents supprimés.');
                }}
              >
                Confirmer la suppression
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {filteredDocs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 opacity-80 select-none animate-fadeIn">
            <svg width="90" height="90" viewBox="0 0 90 90" fill="none" className="mb-4">
              <rect x="10" y="20" width="70" height="50" rx="10" fill="#e0e7ef" />
              <rect x="20" y="30" width="50" height="8" rx="4" fill="#b6c3e0" />
              <rect x="20" y="45" width="35" height="6" rx="3" fill="#cfd8ea" />
              <rect x="20" y="57" width="25" height="6" rx="3" fill="#cfd8ea" />
              <circle cx="70" cy="60" r="6" fill="#b6c3e0" />
              <FilePlus2 x={30} y={65} className="w-8 h-8 text-blue-400 opacity-60" />
            </svg>
            <div className="text-muted-foreground text-lg font-semibold mb-1">Aucun document trouvé</div>
            <div className="text-xs text-slate-400">Ajoutez vos documents pour commencer.</div>
          </div>
        ) : (
          <ul className="space-y-4">
            {filteredDocs.map(doc => {
              return (
                <li key={doc.id}
                  className={`border rounded-xl p-4 bg-slate-50 dark:bg-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-3 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-200 border-transparent hover:border-blue-400/60 relative group animate-fadeIn`}
                >
                  {/* Badge type */}
                  <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-bold
                    ${doc.extension === 'pdf' ? 'bg-red-100 text-red-600' :
                      doc.extension === 'docx' ? 'bg-indigo-100 text-indigo-600' :
                      doc.extension === 'csv' ? 'bg-green-100 text-green-600' :
                      doc.extension === 'md' ? 'bg-blue-100 text-blue-600' :
                      doc.extension === 'txt' ? 'bg-slate-200 text-slate-600' :
                      doc.extension === 'html' ? 'bg-orange-100 text-orange-600' :
                      'bg-slate-200 text-slate-600'}
                  `}>
                    {doc.extension?.toUpperCase()}
                  </span>
                  {doc.origine === 'utilisateur' && (
                    <input
                      type="checkbox"
                      className="mr-2 mt-1"
                      checked={selectedIds.includes(doc.id)}
                      onChange={e => {
                        if (e.target.checked) setSelectedIds(ids => [...ids, doc.id]);
                        else setSelectedIds(ids => ids.filter(id => id !== doc.id));
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <div className="flex-shrink-0">{getIcon(doc.extension || '')}</div>
                    <div className="flex flex-col gap-1 w-full">
                      {editingId === doc.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingValue}
                            onChange={handleEditChange}
                            onBlur={() => handleEditSave(doc)}
                            onKeyDown={e => handleEditKeyDown(e, doc)}
                            autoFocus
                            className="text-base font-semibold bg-transparent border-b border-blue-400 focus:outline-none px-1 w-40"
                          />
                          <Button size="icon" variant="ghost" onClick={() => handleEditSave(doc)} title="Valider"><Check className="w-5 h-5 text-green-500" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => { setEditingId(null); setEditingValue(''); }} title="Annuler"><XIcon className="w-5 h-5 text-red-500" /></Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-blue-900 dark:text-blue-100 text-base truncate max-w-[200px]">{doc.titre}</span>
                          {doc.origine === 'utilisateur' && (
                            <Button size="icon" variant="ghost" onClick={() => handleStartEdit(doc)} title="Renommer"><Pencil className="w-4 h-4 text-blue-400" /></Button>
                          )}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground truncate max-w-[350px]">{doc.contenu.slice(0, 120)}{doc.contenu.length > 120 ? "…" : ""}</div>
                      <div className="text-[11px] text-slate-400">.{doc.extension}</div>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-2 sm:mt-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-1"
                      title="Aperçu"
                      onClick={() => setPreviewDoc(doc)}
                    >
                      <Eye className="w-5 h-5 text-indigo-500" />
                    </Button>
                    {doc.origine === 'utilisateur' ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-1"
                        title="Supprimer"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <Button onClick={onClose} className="mt-8 w-full text-base py-3">Fermer</Button>
      </div>
      {/* Modale d'aperçu */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[95vh] overflow-y-auto relative">
            <button onClick={() => setPreviewDoc(null)} className="absolute top-4 right-4 text-slate-500 hover:text-red-500"><X className="w-6 h-6" /></button>
            <h3 className="text-xl font-bold mb-4">{previewDoc.titre}</h3>
            <pre className="whitespace-pre-wrap text-sm bg-slate-100 dark:bg-slate-800 rounded p-4 max-h-[70vh] overflow-y-auto">{previewDoc.contenu}</pre>
            <Button onClick={() => setPreviewDoc(null)} className="mt-6 w-full text-base py-3">Fermer l'aperçu</Button>
          </div>
        </div>
      )}
    </div>
  );
} 