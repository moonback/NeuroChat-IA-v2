import React, { useEffect, useMemo, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json as jsonLang } from '@codemirror/lang-json';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Copy, Send, Trash2, Download, Code2 } from 'lucide-react';

type LanguageKey = 'javascript' | 'typescript' | 'python' | 'html' | 'css' | 'json';

interface CodeEditorPanelProps {
  className?: string;
  onSend?: (code: string, language: LanguageKey) => void;
}

const languageOptions: { key: LanguageKey; label: string }[] = [
  { key: 'javascript', label: 'JavaScript' },
  { key: 'typescript', label: 'TypeScript' },
  { key: 'python', label: 'Python' },
  { key: 'html', label: 'HTML' },
  { key: 'css', label: 'CSS' },
  { key: 'json', label: 'JSON' },
];

export const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({ className, onSend }) => {
  const [language, setLanguage] = useState<LanguageKey>('javascript');
  const [code, setCode] = useState<string>('');

  const extensions = useMemo(() => {
    switch (language) {
      case 'javascript':
        return [javascript({ jsx: true })];
      case 'typescript':
        return [javascript({ jsx: true, typescript: true })];
      case 'python':
        return [python()];
      case 'html':
        return [html()];
      case 'css':
        return [css()];
      case 'json':
        return [jsonLang()];
      default:
        return [];
    }
  }, [language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {}
  };

  const handleClear = () => setCode('');

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ext = language === 'typescript' ? 'ts' : language === 'javascript' ? 'js' : language;
    a.href = url;
    a.download = `snippet.${ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleSend = () => {
    if (!code.trim()) return;
    onSend?.(code, language);
  };

  // Réception d’instructions pour insérer du code depuis l’extérieur (LLM)
  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as CustomEvent<{ code: string; language?: string; replace?: boolean }>;
      const incoming = (ev.detail?.code || '').toString();
      if (!incoming) return;
      const langRaw = (ev.detail?.language || '').toLowerCase();
      const toKey = (s: string): LanguageKey | null => {
        switch (s) {
          case 'ts':
          case 'typescript':
            return 'typescript';
          case 'js':
          case 'jsx':
          case 'javascript':
            return 'javascript';
          case 'py':
          case 'python':
            return 'python';
          case 'html':
            return 'html';
          case 'css':
            return 'css';
          case 'json':
            return 'json';
          default:
            return null;
        }
      };
      const mapped = toKey(langRaw);
      if (mapped) setLanguage(mapped);
      setCode(prev => (ev.detail?.replace ? incoming : (prev ? prev + '\n\n' + incoming : incoming)));
    };
    document.addEventListener('code-editor:insert' as any, handler as any);
    return () => document.removeEventListener('code-editor:insert' as any, handler as any);
  }, []);

  return (
    <div className={cn(
      'w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl overflow-hidden',
      className
    )}>
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
            <Code2 className="w-4 h-4" />
          </div>
          <div className="text-sm font-semibold">Éditeur de code</div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as LanguageKey)}
            className="h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm px-2"
            aria-label="Langage"
          >
            {languageOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="px-2 sm:px-3 pt-2 pb-3">
        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
          <CodeMirror
            value={code}
            height="260px"
            theme={undefined}
            extensions={extensions}
            onChange={(val) => setCode(val)}
          />
        </div>
        <div className="flex items-center justify-end gap-2 mt-3">
          <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8">
            <Copy className="w-4 h-4 mr-2" /> Copier
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDownload} className="h-8">
            <Download className="w-4 h-4 mr-2" /> Télécharger
          </Button>
          <Button variant="ghost" size="sm" onClick={handleClear} className="h-8">
            <Trash2 className="w-4 h-4 mr-2" /> Effacer
          </Button>
          <Button size="sm" onClick={handleSend} className="h-8">
            <Send className="w-4 h-4 mr-2" /> Envoyer au chat
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CodeEditorPanel;


