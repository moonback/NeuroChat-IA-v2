import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2, UploadCloud, Eye, Pencil, FileText, FileSpreadsheet, FileCode2, FileType2, File, FilePlus2, LayoutGrid, List as ListIcon, Search, SortAsc, SortDesc, CheckCircle2, Circle, Upload, Folder, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RagDocsModalProps {
  open: boolean;
  onClose: () => void;
  workspaceId?: string;
}

// Clé localStorage pour les docs utilisateur (scopée par workspace)
function wsKey(ws: string, base: string) { return `ws:${ws}:${base}`; }

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

function getOriginIcon(origine: string) {
  switch (origine) {
    case 'dossier':
      return <Folder className="w-3 h-3" />;
    case 'utilisateur':
      return <User className="w-3 h-3" />;
    default:
      return <File className="w-3 h-3" />;
  }
}

function getOriginColor(origine: string) {
  switch (origine) {
    case 'dossier':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800';
    case 'utilisateur':
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800';
  }
}

export function RagDocsModal({ open, onClose, workspaceId = 'default' }: RagDocsModalProps) {
  const [docs, setDocs] = useState<RagDoc[]>([]);
  const [search, setSearch] = useState('');
  const [previewDoc, setPreviewDoc] = useState<RagDoc | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openImportModal, setOpenImportModal] = useState(false);
  // Sélection multiple pour suppression
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // Ajout de l'état pour le modal
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  // UI: filtres / tri / vue
  const [filterOrigin, setFilterOrigin] = useState<'all' | 'dossier' | 'utilisateur'>('all');
  const [sortKey, setSortKey] = useState<'titre' | 'extension' | 'origine'>('titre');
  const [sortAsc, setSortAsc] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [dragOver, setDragOver] = useState(false);

  // Charger les docs du dossier (via import.meta.glob)
  useEffect(() => {
    async function loadDocs() {
      // @ts-expect-error - import.meta.glob is a Vite-specific feature
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
      // Docs utilisateur (en filtrant d'anciens docs GitHub éventuels)
      const userRaw = localStorage.getItem(wsKey(workspaceId, 'rag_user_docs'));
      let userDocs: RagDoc[] = [];
      if (userRaw) {
        try {
          userDocs = (JSON.parse(userRaw) as RagDoc[]).filter(d => d?.origine !== 'github');
        } catch {
          // Ignore parsing errors
        }
      }
      setDocs([...dossierDocs, ...userDocs]);
    }
    if (open) loadDocs();
  }, [open, workspaceId]);

  // Extraction de texte selon le type de fichier
  async function extractTextFromFile(file: File): Promise<string> {
    const ext = getExtension(file.name);
    if (ext === 'txt' || ext === 'md') {
      return await file.text();
    }
    if (ext === 'pdf') {
      try {
        const pdfModule: { default?: unknown; GlobalWorkerOptions?: { workerSrc: string } } = await import('pdfjs-dist');
        const pdfjsLib = pdfModule?.default ?? pdfModule;
        // @ts-expect-error - pdfjsLib is dynamically imported
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
        const arrayBuffer = await file.arrayBuffer();
        // @ts-expect-error - pdfjsLib is dynamically imported
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          // Regrouper les items par ligne (y)
          let lastY = null;
          let line = '';
          for (const item of content.items as Array<{ str: string; transform: number[] }>) {
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
            .replace(/[•·●◆■□▪▶►–—-]{2,}/g, ' ') // séquences de puces/tirets
            .replace(/\s{2,}/g, ' ') // espaces multiples
            .replace(/[^\x20-\x7Eà-ÿÀ-ŸœŒçÇ€$£¥%°.,;:!?()\[\]{}<>\/@#'"\-\n]/g, '') // caractères non imprimables sauf ponctuation de base
            .replace(/\.{3,}/g, '.') // séquences de points
            .trim()
        );
        // Suppression de motifs supplémentaires (numéros de page, symboles, valeurs seules)
        const isTitle = (l: string) => /^[A-ZÀ-Ÿ0-9\s-]{6,}$/.test(l) && l.length < 60;
        lines = lines.filter(l =>
          !/^Page\s*\d+([/-]\d+)?$/i.test(l) && // Page 3, Page 3/12, Page 3-12
          !/^[-–—\s]*\d+[-–—\s]*$/.test(l) && // - 4 -, -- 12 --
          !/^[.,;:!?()[\]{}<>/@#'"-\s]+$/.test(l) && // lignes de ponctuation/symboles
          !/^\d+(\s*(L|kg|cm|mm|g|ml|cl|m|W|V|A|°C|°F|%)?)$/.test(l) // valeurs numériques seules ou avec unité
        );
        // Mise en forme des titres (saut de ligne avant/après)
        lines = lines.map(l => isTitle(l) ? `\n${l}\n` : l);
        // Fusion des lignes courtes avec la suivante (sauf titres)
        const fused: string[] = [];
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
      } catch {
        throw new Error('Erreur lors de l\'extraction du PDF.');
      }
    }
    if (ext === 'docx') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const mammothModule: { default?: { extractRawText: (options: { arrayBuffer: ArrayBuffer }) => Promise<{ value: string }> } } = await import('mammoth');
        const mammoth = mammothModule?.default ?? mammothModule;
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value;
      } catch {
        throw new Error('Erreur lors de l\'extraction du DOCX.');
      }
    }
    if (ext === 'csv') {
      try {
        const text = await file.text();
        const papaModule: { default?: { parse: (text: string) => { data: string[][] } } } = await import('papaparse');
        const Papa = papaModule?.default ?? papaModule;
        const parsed = Papa.parse(text);
        return parsed.data.map((row: string[]) => row.join(' ')).join('\n');
      } catch {
        throw new Error('Erreur lors de l\'extraction du CSV.');
      }
    }
    if (ext === 'html') {
      try {
        const text = await file.text();
        const doc = new DOMParser().parseFromString(text, 'text/html');
        return doc.body.innerText || '';
      } catch {
        throw new Error('Erreur lors de l\'extraction du HTML.');
      }
    }
    throw new Error('Type de fichier non supporté.');
  }

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  };

  // Traitement des fichiers (commun pour upload et drag&drop)
  const processFiles = async (files: File[]) => {
    const userRaw = localStorage.getItem(wsKey(workspaceId, 'rag_user_docs'));
    let userDocs: RagDoc[] = [];
    if (userRaw) {
      try { userDocs = JSON.parse(userRaw); } catch {
        // Ignore parsing errors
      }
    }
    let addedCount = 0;
    for (const file of files) {
      const ext = getExtension(file.name);
      if (!['txt','md','pdf','docx','csv','html'].includes(ext)) {
        toast.error(`Type de fichier non supporté : ${file.name}`);
        continue;
      }
      let text = '';
      try {
        text = await extractTextFromFile(file);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'extraction du texte.';
        toast.error(`${file.name} : ${errorMessage}`);
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
    localStorage.setItem(wsKey(workspaceId, 'rag_user_docs'), JSON.stringify(userDocs));
    setDocs(docs => [...docs, ...userDocs.filter(d => !docs.some(doc => doc.id === d.id))]);
    if (addedCount > 0) toast.success(`${addedCount} document(s) ajouté(s) !`);
  };

  // Ajouter un document utilisateur
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await processFiles(Array.from(files));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Supprimer un document utilisateur
  const handleDelete = (id: string) => {
    if (!window.confirm('Supprimer ce document ?')) return;
    const userRaw = localStorage.getItem(wsKey(workspaceId, 'rag_user_docs'));
    let userDocs: RagDoc[] = [];
    if (userRaw) {
      try { userDocs = JSON.parse(userRaw); } catch {
        // Ignore parsing errors
      }
    }
    userDocs = userDocs.filter(doc => doc.id !== id);
    localStorage.setItem(wsKey(workspaceId, 'rag_user_docs'), JSON.stringify(userDocs));
    setDocs(docs => docs.filter(doc => doc.id !== id));
    toast.success('Document supprimé.');
  };

  // Renommage
  const handleStartEdit = (doc: RagDoc) => {
    setEditingId(doc.id);
    setEditingValue(doc.titre);
  };
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => { setEditingValue(e.target.value); };
  const handleEditSave = (doc: RagDoc) => {
    const trimmed = editingValue.trim();
    if (!trimmed) return;
    const userRaw = localStorage.getItem(wsKey(workspaceId, 'rag_user_docs'));
    let userDocs: RagDoc[] = [];
    if (userRaw) {
      try { userDocs = JSON.parse(userRaw); } catch {
        // Ignore parsing errors
      }
    }
    userDocs = userDocs.map(d => d.id === doc.id ? { ...d, titre: trimmed } : d);
    localStorage.setItem(wsKey(workspaceId, 'rag_user_docs'), JSON.stringify(userDocs));
    setDocs(docs => docs.map(d => d.id === doc.id ? { ...d, titre: trimmed } : d));
    setEditingId(null);
    setEditingValue('');
    toast.success('Titre modifié.');
  };
  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, doc: RagDoc) => { 
    if (e.key === 'Enter') handleEditSave(doc); 
    else if (e.key === 'Escape') { setEditingId(null); setEditingValue(''); } 
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  // Filtrage + tri
  const filteredDocs = docs
    .filter(doc =>
      (filterOrigin === 'all' || doc.origine === filterOrigin) &&
      (
        doc.titre.toLowerCase().includes(search.toLowerCase()) ||
        doc.contenu.toLowerCase().includes(search.toLowerCase())
      )
    )
    .sort((a, b) => {
      const dir = sortAsc ? 1 : -1;
      if (sortKey === 'titre') return a.titre.localeCompare(b.titre) * dir;
      if (sortKey === 'extension') return (a.extension || '').localeCompare(b.extension || '') * dir;
      return a.origine.localeCompare(b.origine) * dir;
    });

  // Statistiques
  const stats = {
    total: docs.length,
    dossier: docs.filter(d => d.origine === 'dossier').length,
    utilisateur: docs.filter(d => d.origine === 'utilisateur').length,
  };

  if (!open) return null;

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="max-w-[100vw] px-2 sm:px-6 py-2 sm:py-6 rounded-3xl shadow-2xl border-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950 backdrop-blur-xl ring-1 ring-white/20 dark:ring-slate-700/20 max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <DrawerHeader className="pb-4 border-b border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <UploadCloud className="w-6 h-6 text-white" />
              </div>
              <div>
                <DrawerTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-300 dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent">
                  Documents RAG
                </DrawerTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Gérez vos documents pour la recherche augmentée
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="flex flex-wrap gap-2 mt-4">
            <div className="px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
              <Folder className="w-3 h-3 inline mr-1" />
              {stats.dossier} dossier
            </div>
            <div className="px-3 py-1 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium">
              <User className="w-3 h-3 inline mr-1" />
              {stats.utilisateur} utilisateur
            </div>
            
            <div className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
              Total: {stats.total}
            </div>
          </div>
        </DrawerHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Import Section (ouverture via modal) */}
          <div className="grid grid-cols-1 gap-6">
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Upload className="w-5 h-5 text-blue-500" />
                  Import de fichiers
                </CardTitle>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Cliquez pour ouvrir une fenêtre dédiée à l’import de fichiers.
                </p>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">TXT</span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">MD</span>
                  <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">PDF</span>
                  <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded">DOCX</span>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">CSV</span>
                  <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded">HTML</span>
                </div>
                <Button
                  onClick={() => setOpenImportModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  size="lg"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Ouvrir l’import
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Toolbar */}
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-4 shadow-sm">
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher dans les documents..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Filters & Controls */}
              <div className="flex flex-wrap gap-2 items-center">
                <select
                  value={filterOrigin}
                  onChange={e => setFilterOrigin(e.target.value as 'tous' | 'dossier' | 'utilisateur')}
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Toutes origines</option>
                  <option value="dossier">📁 Dossier</option>
                  <option value="utilisateur">👤 Utilisateur</option>
                  
                </select>

                <select
                  value={sortKey}
                  onChange={e => setSortKey(e.target.value as 'titre' | 'origine' | 'taille')}
                  className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="titre">Titre</option>
                  <option value="extension">Extension</option>
                  <option value="origine">Origine</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortAsc(v => !v)}
                  className="px-3"
                >
                  {sortAsc ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>

                <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />

                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <ListIcon className="w-4 h-4" />
                </Button>

                <div className="h-6 w-px bg-slate-300 dark:bg-slate-600" />

                {selectedIds.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {selectedIds.length} sélectionné(s)
                    </span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setOpenDeleteModal(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                )}

                <span className="text-xs text-slate-500 hidden lg:block">
                  {filteredDocs.length} / {docs.length} documents
                </span>
              </div>
            </div>
          </div>

          {/* Documents List */}
          {filteredDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 opacity-60">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                  <FilePlus2 className="w-12 h-12 text-blue-500 dark:text-blue-400" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Search className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {search || filterOrigin !== 'all' ? 'Aucun résultat' : 'Aucun document'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
                {search || filterOrigin !== 'all' 
                  ? 'Essayez de modifier vos critères de recherche ou filtres'
                  : 'Commencez par importer vos premiers documents'
                }
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {filteredDocs.map(doc => (
                <div key={doc.id} className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                  {/* Selection Checkbox */}
                  {doc.origine !== 'dossier' && (
                    <div className="absolute top-3 left-3 z-10">
                      <button
                        onClick={() => toggleSelection(doc.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {selectedIds.includes(doc.id) ? (
                          <CheckCircle2 className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-400 hover:text-blue-600" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Document Type & Origin Badges */}
                  <div className="absolute top-3 right-3 flex gap-1">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${getOriginColor(doc.origine)} flex items-center gap-1`}>
                      {getOriginIcon(doc.origine)}
                      {doc.origine}
                    </span>
                    {doc.extension && (
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {doc.extension.toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="p-4 pt-12">
                    {/* File Icon & Title */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 mt-1">
                        {getIcon(doc.extension || '')}
                      </div>
                      <div className="min-w-0 flex-1">
                        {editingId === doc.id ? (
                          <input
                            type="text"
                            value={editingValue}
                            onChange={handleEditChange}
                            onKeyDown={e => handleEditKeyDown(e, doc)}
                            onBlur={() => handleEditSave(doc)}
                            className="w-full px-2 py-1 rounded border border-blue-300 dark:border-blue-600 bg-white dark:bg-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                        ) : (
                          <h4 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 text-sm">
                            {doc.titre}
                          </h4>
                        )}
                      </div>
                    </div>

                    {/* Content Preview */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                      {doc.contenu.slice(0, 150)}{doc.contenu.length > 150 ? '...' : ''}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-1 justify-end">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setPreviewDoc(doc)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {doc.origine !== 'dossier' && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleStartEdit(doc)}
                            className="text-slate-600 hover:text-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDelete(doc.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredDocs.map(doc => (
                  <div key={doc.id} className="group p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      {/* Selection & Icon */}
                      <div className="flex items-center gap-3">
                        {doc.origine !== 'dossier' && (
                          <button
                            onClick={() => toggleSelection(doc.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            {selectedIds.includes(doc.id) ? (
                              <CheckCircle2 className="w-5 h-5 text-blue-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-400 hover:text-blue-600" />
                            )}
                          </button>
                        )}
                        <div className="flex-shrink-0">
                          {getIcon(doc.extension || '')}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {editingId === doc.id ? (
                            <input
                              type="text"
                              value={editingValue}
                              onChange={handleEditChange}
                              onKeyDown={e => handleEditKeyDown(e, doc)}
                              onBlur={() => handleEditSave(doc)}
                              className="flex-1 px-2 py-1 rounded border border-blue-300 dark:border-blue-600 bg-white dark:bg-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                              autoFocus
                            />
                          ) : (
                            <h4 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                              {doc.titre}
                            </h4>
                          )}
                          <div className="flex gap-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getOriginColor(doc.origine)} flex items-center gap-1`}>
                              {getOriginIcon(doc.origine)}
                              {doc.origine}
                            </span>
                            {doc.extension && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {doc.extension.toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                          {doc.contenu.slice(0, 120)}{doc.contenu.length > 120 ? '...' : ''}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setPreviewDoc(doc)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {doc.origine !== 'dossier' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleStartEdit(doc)}
                              className="text-slate-600 hover:text-slate-700"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(doc.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <DrawerFooter className="border-t border-slate-200/50 dark:border-slate-700/50 pt-4">
          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Fermer
            </Button>
            {selectedIds.length > 0 && (
              <Button 
                onClick={() => {
                  setSelectedIds([]);
                  toast.success('Sélection effacée');
                }}
                variant="ghost"
                className="px-6"
              >
                Déselectionner tout
              </Button>
            )}
          </div>
        </DrawerFooter>

        {/* Delete Confirmation Modal */}
        <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="w-5 h-5" />
                Supprimer les documents
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                Cette action est <span className="font-semibold text-red-600">irréversible</span>.
              </p>
              <p className="text-sm">
                Voulez-vous vraiment supprimer <span className="font-semibold">{selectedIds.length}</span> document{selectedIds.length > 1 ? 's' : ''} ?
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDeleteModal(false)}>
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  const userRaw = localStorage.getItem(wsKey(workspaceId, 'rag_user_docs'));
                  let userDocs: RagDoc[] = [];
                  if (userRaw) {
                    try { userDocs = JSON.parse(userRaw); } catch {
        // Ignore parsing errors
      }
                  }
                  userDocs = userDocs.filter(doc => !selectedIds.includes(doc.id));
                  localStorage.setItem(wsKey(workspaceId, 'rag_user_docs'), JSON.stringify(userDocs));
                  setDocs(docs => docs.filter(doc => !selectedIds.includes(doc.id)));
                  setSelectedIds([]);
                  setOpenDeleteModal(false);
                  toast.success('Documents supprimés.');
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer définitivement
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Modal */}
        <Dialog open={openImportModal} onOpenChange={setOpenImportModal}>
          <DialogContent className="sm:max-w-lg" onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-500" />
                Importer des fichiers
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Glissez-déposez vos fichiers ici ou utilisez le bouton pour parcourir.
              </p>
              <div
                className="relative border-2 border-dashed rounded-xl p-6 text-center transition-colors"
                style={{
                  borderColor: dragOver ? '#3b82f6' : undefined,
                  backgroundColor: dragOver ? 'rgba(59, 130, 246, 0.05)' : undefined,
                }}
              >
                <Upload className="w-10 h-10 text-blue-500 mx-auto mb-3" />
                <div className="flex flex-col items-center gap-2">
                  <Button onClick={() => fileInputRef.current?.click()}>
                    Choisir des fichiers
                  </Button>
                  <input
                    type="file"
                    multiple
                    accept=".txt,.md,.pdf,.docx,.csv,.html"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  <div className="flex flex-wrap gap-2 text-xs mt-2">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">TXT</span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">MD</span>
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded">PDF</span>
                    <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded">DOCX</span>
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">CSV</span>
                    <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded">HTML</span>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenImportModal(false)}>
                Fermer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Modal */}
        {previewDoc && (
          <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
              <DialogHeader className="border-b border-slate-200 dark:border-slate-700 pb-4">
                <DialogTitle className="flex items-center gap-3">
                  {getIcon(previewDoc.extension || '')}
                  <span className="flex-1 truncate">{previewDoc.titre}</span>
                  <div className="flex gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getOriginColor(previewDoc.origine)} flex items-center gap-1`}>
                      {getOriginIcon(previewDoc.origine)}
                      {previewDoc.origine}
                    </span>
                    {previewDoc.extension && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {previewDoc.extension.toUpperCase()}
                      </span>
                    )}
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto p-6">
                <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
                  {previewDoc.contenu}
                </pre>
              </div>
              <DialogFooter className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <Button onClick={() => setPreviewDoc(null)} className="w-full">
                  Fermer l'aperçu
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </DrawerContent>
    </Drawer>
  );
}