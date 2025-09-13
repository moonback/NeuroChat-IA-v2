import { useEffect, useRef, useState, useCallback } from 'react';

export interface WorkspaceItem {
  id: string;
  name: string;
}

export function useWorkspace() {
  const wsKey = useCallback((ws: string, base: string): string => `ws:${ws}:${base}`, []);

  const [workspaceId, setWorkspaceId] = useState<string>(() => {
    try { return localStorage.getItem('nc_active_workspace') || 'default'; } catch { return 'default'; }
  });

  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>(() => {
    try {
      const raw = localStorage.getItem('nc_workspaces');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Ignore parsing errors
    }
    return [{ id: 'default', name: 'Par défaut' }];
  });

  useEffect(() => {
    try { localStorage.setItem('nc_workspaces', JSON.stringify(workspaces)); } catch {
      // Ignore storage errors
    }
  }, [workspaces]);

  useEffect(() => {
    try { localStorage.setItem('nc_active_workspace', workspaceId); } catch {
      // Ignore storage errors
    }
  }, [workspaceId]);

  // Effet utilitaire pour vider des clés par espace si supprimé
  const clearWorkspaceLocalKeys = (id: string) => {
    try {
      const keysToClear = [
        'gemini_current_discussion',
        'gemini_discussions',
        'gemini_presets',
        'rag_user_docs',
        'rag_doc_stats',
        'rag_doc_favorites',
        'neurochat_user_memory_v1',
      ];
      for (const base of keysToClear) {
        localStorage.removeItem(wsKey(id, base));
      }
    } catch {
      // Ignore parsing errors
    }
  };

  const createWorkspace = () => {
    const name = window.prompt('Nom du nouvel espace');
    if (!name || !name.trim()) return;
    const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 24) || `ws-${Date.now()}`;
    if (workspaces.some(w => w.id === id)) return;
    const next = [...workspaces, { id, name: name.trim() }];
    setWorkspaces(next);
    setWorkspaceId(id);
  };

  const renameWorkspace = (id: string, name: string) => {
    setWorkspaces(ws => ws.map(w => w.id === id ? { ...w, name } : w));
  };

  const deleteWorkspace = (id: string) => {
    clearWorkspaceLocalKeys(id);
    setWorkspaces(ws => ws.filter(w => w.id !== id));
    if (workspaceId === id) {
      setWorkspaceId('default');
    }
  };

  return {
    workspaceId,
    setWorkspaceId,
    workspaces,
    setWorkspaces,
    createWorkspace,
    renameWorkspace,
    deleteWorkspace,
    wsKey,
  };
}

export function useWorkspaceOpeningModal(workspaceId: string, workspaces: WorkspaceItem[]) {
  const firstWorkspaceLoadRef = useRef(true);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    if (firstWorkspaceLoadRef.current) {
      firstWorkspaceLoadRef.current = false;
      return;
    }
    const current = workspaces.find(w => w.id === workspaceId);
    const n = current?.name || workspaceId;
    setName(n);
    setOpen(true);
    const t = setTimeout(() => setOpen(false), 2000);
    return () => clearTimeout(t);
  }, [workspaceId, workspaces]);

  return { open, setOpen, name };
}


