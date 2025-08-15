import React, { useEffect, useState } from 'react';
import { FileText, FileSpreadsheet, FileCode2, FileType2, File, Search, Upload, Folder, User, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type RagDoc = {
  id: string;
  titre: string;
  contenu: string;
  origine: 'dossier' | 'utilisateur';
  extension?: string;
};

const LS_KEY = 'rag_user_docs';

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

function getOriginBadge(origine: string) {
  const base = 'px-2 py-0.5 rounded-full text-[10px] font-medium border flex items-center gap-1';
  if (origine === 'dossier') {
    return (
      <span className={`${base} bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800`}>
        <Folder className="w-3 h-3" /> dossier
      </span>
    );
  }
  if (origine === 'utilisateur') {
    return (
      <span className={`${base} bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800`}>
        <User className="w-3 h-3" /> utilisateur
      </span>
    );
  }
  return (
    <span className={`${base} bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-950 dark:text-slate-300 dark:border-slate-800`}>
      {origine}
    </span>
  );
}

export function RagSidebar({ onOpenRagDocs, usedDocs }: { onOpenRagDocs?: () => void; usedDocs?: Array<{ id: string; titre: string; contenu: string; extension?: string; origine?: string }> }) {
  const [docs, setDocs] = useState<RagDoc[]>([]);
  const [search, setSearch] = useState('');
  const [previewDoc, setPreviewDoc] = useState<RagDoc | null>(null);
  const [expanded, setExpanded] = useState(false);

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
      const userRaw = localStorage.getItem(LS_KEY);
      let userDocs: RagDoc[] = [];
      if (userRaw) {
        try { userDocs = (JSON.parse(userRaw) as any[]).filter(d => d?.origine !== 'github'); } catch {}
      }
      setDocs([...dossierDocs, ...userDocs]);
    }
    loadDocs();
  }, []);

  const filtered = docs.filter(d =>
    d.titre.toLowerCase().includes(search.toLowerCase()) ||
    d.contenu.toLowerCase().includes(search.toLowerCase())
  );
  const used = (usedDocs || []).filter(d =>
    d.titre.toLowerCase().includes(search.toLowerCase()) ||
    d.contenu.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside
      className="absolute top-0 right-0 bottom-0 w-80 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-l border-slate-200 dark:border-slate-800 shadow-xl hidden lg:flex flex-col z-40 transition-transform duration-300"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      style={{ transform: expanded ? 'translateX(0)' : 'translateX(calc(100% - 18px))' }}
      aria-label="Barre latérale des documents RAG"
    >
      <div className="p-3 border-b border-slate-200/60 dark:border-slate-800/60 bg-gradient-to-r from-blue-50/60 to-indigo-50/60 dark:from-slate-950/40 dark:to-indigo-950/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="text-sm font-semibold">Documents RAG</div>
          <span className="ml-auto text-xs text-slate-500">{filtered.length}/{docs.length}</span>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="w-full pl-8 pr-2 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="mt-2">
          <Button size="sm" className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700" onClick={onOpenRagDocs}>
            <Upload className="w-4 h-4 mr-2" /> Gérer les documents
          </Button>
        </div>
      </div>

      {/* Poignée visible lorsque repliée */}
      {!expanded && (
        <div className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-full select-none">
          <div className="w-[18px] h-24 rounded-l-lg bg-blue-500/80 text-white flex items-center justify-center text-[10px] font-semibold rotate-180 [writing-mode:vertical-rl] cursor-pointer">
            Docs
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* Utilisés dans la conversation */}
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase px-2 mb-2">Utilisés dans la conversation</div>
          {used.length === 0 ? (
            <div className="text-xs text-slate-500 px-2">Aucun document utilisé.</div>
          ) : (
            used.map(doc => (
              <button
                key={`used-${doc.id}`}
                className="w-full text-left p-3 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow group"
                onClick={() => setPreviewDoc(doc as any)}
                title="Aperçu"
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">{getIcon((doc.extension || ''))}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{doc.titre}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{doc.contenu.slice(0, 120)}{doc.contenu.length > 120 ? '…' : ''}</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">{getOriginBadge(doc.origine || '')}</div>
                  <Eye className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                </div>
              </button>
            ))
          )}
        </div>

        {/* Tous les documents */}
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase px-2 mb-2">Tous les documents</div>
          {filtered.length === 0 ? (
            <div className="text-xs text-slate-500 px-2">Aucun document. Utilisez “Gérer les documents”.</div>
          ) : (
            filtered.map(doc => (
              <button
                key={doc.id}
                className="w-full text-left p-3 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow group"
                onClick={() => setPreviewDoc(doc)}
                title="Aperçu"
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">{getIcon(doc.extension || '')}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{doc.titre}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{doc.contenu.slice(0, 120)}{doc.contenu.length > 120 ? '…' : ''}</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">{getOriginBadge(doc.origine)}</div>
                  <Eye className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {previewDoc && (
        <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="truncate">{previewDoc.titre}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto p-4">
              <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-mono">
                {previewDoc.contenu}
              </pre>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </aside>
  );
}

export default RagSidebar;


