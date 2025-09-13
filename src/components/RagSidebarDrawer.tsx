import { useEffect, useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Search, Upload, FileText, FileSpreadsheet, FileCode2, FileType2, File, Folder, User, Eye } from 'lucide-react';

type RagDoc = {
  id: string;
  titre: string;
  contenu: string;
  extension?: string;
  origine?: 'dossier' | 'utilisateur' | string;
};

function wsKey(ws: string, base: string) { return `ws:${ws}:${base}`; }

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

function OriginBadge({ origine }: { origine?: string }) {
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
      {origine || 'doc'}
    </span>
  );
}

export function RagSidebarDrawer({ open, onClose, usedDocs, onOpenRagDocs, workspaceId = 'default' }: { open: boolean; onClose: () => void; usedDocs?: RagDoc[]; onOpenRagDocs?: () => void; workspaceId?: string; }) {
  const [docs, setDocs] = useState<RagDoc[]>([]);
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState<RagDoc | null>(null);

  useEffect(() => {
    if (!open) return;
    async function loadDocs() {
      // @ts-expect-error - import.meta.glob is a Vite-specific feature
      const modules = import.meta.glob('../data/rag_docs/*.{txt,md}', { as: 'raw', eager: true });
      const dossierDocs: RagDoc[] = Object.entries(modules).map(([path, contenu], idx) => {
        const titre = path.split('/').pop()?.replace(/\.[^/.]+$/, '') || `Document ${idx + 1}`;
        const extension = getExtension(path);
        return { id: 'dossier-' + idx, titre, contenu: contenu as string, extension, origine: 'dossier' };
      });
      let userDocs: RagDoc[] = [];
      const raw = localStorage.getItem(wsKey(workspaceId, 'rag_user_docs'));
      if (raw) {
        try { userDocs = (JSON.parse(raw) as RagDoc[]); } catch {
          // Ignore parsing errors
        }
      }
      setDocs([...dossierDocs, ...userDocs]);
    }
    loadDocs();
  }, [open, workspaceId]);

  const matches = (d: RagDoc) => d.titre.toLowerCase().includes(search.toLowerCase()) || d.contenu.toLowerCase().includes(search.toLowerCase());
  const filteredUsed = (usedDocs || []).filter(matches);
  const filteredAll = docs.filter(matches);

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent className="max-w-full mx-auto p-0 bg-white dark:bg-slate-950 rounded-t-2xl border-t shadow-xl">
        <DrawerHeader className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
          <DrawerTitle className="text-base font-semibold">Documents RAG</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-4">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-8 pr-2 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button size="sm" onClick={onOpenRagDocs}>
              <Upload className="w-4 h-4 mr-2" /> Gérer
            </Button>
          </div>

          {/* Utilisés dans la conversation */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Utilisés dans la conversation</div>
            {filteredUsed.length === 0 ? (
              <div className="text-xs text-slate-500">Aucun document utilisé.</div>
            ) : (
              <div className="space-y-2">
                {filteredUsed.map(doc => (
                  <button key={`used-${doc.id}`} className="w-full text-left p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700" onClick={() => setPreview(doc)}>
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">{getIcon(doc.extension || '')}</div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{doc.titre}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-2">{doc.contenu.slice(0,120)}{doc.contenu.length>120?'…':''}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <OriginBadge origine={doc.origine} />
                      <Eye className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tous les documents */}
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Tous les documents</div>
            {filteredAll.length === 0 ? (
              <div className="text-xs text-slate-500">Aucun document. Utilisez « Gérer » pour importer.</div>
            ) : (
              <div className="space-y-2">
                {filteredAll.map(doc => (
                  <button key={doc.id} className="w-full text-left p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700" onClick={() => setPreview(doc)}>
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">{getIcon(doc.extension || '')}</div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{doc.titre}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-2">{doc.contenu.slice(0,120)}{doc.contenu.length>120?'…':''}</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <OriginBadge origine={doc.origine} />
                      <Eye className="w-4 h-4 text-slate-400" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Aperçu */}
        {preview && (
          <div className="px-4 pb-4">
            <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Aperçu</div>
            <div className="h-48 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-white dark:bg-slate-900">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed">{preview.contenu}</pre>
            </div>
          </div>
        )}

        <DrawerFooter className="p-4 pt-0">
          <Button variant="outline" onClick={onClose} className="w-full">Fermer</Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

export default RagSidebarDrawer;


