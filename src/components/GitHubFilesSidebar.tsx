import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Github, 
  FileText, 
  X, 
  Eye, 
  Code,
  ExternalLink,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { GitHubFile } from '@/services/githubService';

interface GitHubFilesSidebarProps {
  files: GitHubFile[];
  onRemoveFile: (filePath: string) => void;
  onClearAll: () => void;
  modePrive?: boolean;
  modeEnfant?: boolean;
}

export function GitHubFilesSidebar({ 
  files, 
  onRemoveFile, 
  onClearAll, 
  modePrive = false, 
  modeEnfant = false 
}: GitHubFilesSidebarProps) {
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());

  const toggleFileExpansion = (filePath: string) => {
    setExpandedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filePath)) {
        newSet.delete(filePath);
      } else {
        newSet.add(filePath);
      }
      return newSet;
    });
  };

  const handleRemoveFile = (filePath: string) => {
    onRemoveFile(filePath);
    toast.success('Fichier retiré du contexte');
  };

  const handleClearAll = () => {
    onClearAll();
    toast.success('Tous les fichiers GitHub ont été retirés');
  };

  if (files.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      "w-80 h-full flex flex-col relative overflow-hidden",
      modePrive 
        ? "bg-gradient-to-br from-red-50/95 via-purple-50/95 to-blue-50/95 dark:from-red-950/90 dark:via-purple-950/90 dark:to-blue-950/90"
        : modeEnfant
        ? "bg-gradient-to-br from-pink-50/95 via-yellow-50/95 to-orange-50/95 dark:from-pink-950/90 dark:via-yellow-950/90 dark:to-orange-950/90"
        : "bg-gradient-to-br from-slate-50/95 via-white/95 to-blue-50/95 dark:from-slate-900/95 dark:via-slate-900/95 dark:to-slate-800/95",
      "backdrop-blur-2xl border-l border-slate-200/60 dark:border-slate-800/60 shadow-2xl shadow-black/10 dark:shadow-white/5"
    )}>
      {/* Effet de shimmer animé */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer opacity-30" />
      
      {/* Particules flottantes pour les modes spéciaux */}
      {modePrive && (
        <div className="absolute top-10 left-8 w-2 h-2 bg-red-400/60 rounded-full animate-pulse" />
      )}
      {modeEnfant && (
        <>
          <div className="absolute top-16 left-12 w-1.5 h-1.5 bg-pink-400/60 rounded-full animate-bounce" />
          <div className="absolute top-24 right-16 w-2 h-2 bg-yellow-400/60 rounded-full animate-pulse delay-300" />
        </>
      )}
      
      <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-300",
              modePrive 
                ? "bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 shadow-red-500/30"
                : modeEnfant
                ? "bg-gradient-to-r from-pink-500 via-yellow-500 to-orange-500 shadow-pink-500/30"
                : "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-blue-500/30"
            )}>
              <Github className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3">
                <span className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 dark:from-slate-200 dark:via-slate-300 dark:to-slate-200 bg-clip-text text-transparent">
                  Fichiers GitHub
                </span>
                <Badge variant="secondary" className="text-xs font-semibold px-2 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 border-blue-200 dark:border-blue-700">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {files.length}
                </Badge>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                <Zap className="w-3 h-3 inline mr-1" />
                Fichiers sélectionnés pour l'analyse IA
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://github.com', '_blank')}
              className="gap-2 hover:scale-105 transition-transform duration-200 border-slate-300/50 dark:border-slate-600/50 backdrop-blur-sm"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 hover:scale-105 transition-all duration-200 border-red-200/50 dark:border-red-700/50 backdrop-blur-sm"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10">
        {files.map((file) => {
          const isExpanded = expandedFiles.has(file.path);
          const hasContent = file.content && file.content.length > 0;
          
          return (
            <div
              key={file.path}
              className={cn(
                "group p-5 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] relative overflow-hidden",
                modePrive 
                  ? "bg-gradient-to-br from-red-50/60 via-purple-50/60 to-blue-50/60 dark:from-red-950/30 dark:via-purple-950/30 dark:to-blue-950/30 border-red-200/60 dark:border-red-800/60 hover:shadow-red-500/20"
                  : modeEnfant
                  ? "bg-gradient-to-br from-pink-50/60 via-yellow-50/60 to-orange-50/60 dark:from-pink-950/30 dark:via-yellow-950/30 dark:to-orange-950/30 border-pink-200/60 dark:border-pink-800/60 hover:shadow-pink-500/20"
                  : "bg-gradient-to-br from-slate-50/60 via-white/60 to-blue-50/60 dark:from-slate-800/60 dark:via-slate-700/60 dark:to-slate-600/60 border-slate-200/60 dark:border-slate-700/60 hover:shadow-blue-500/20"
              )}
            >
              {/* Effet de shimmer sur hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 opacity-0 group-hover:opacity-100" />
              
              <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-300",
                    modePrive 
                      ? "bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 shadow-red-500/30"
                      : modeEnfant
                      ? "bg-gradient-to-r from-pink-500 via-yellow-500 to-orange-500 shadow-pink-500/30"
                      : "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-blue-500/30"
                  )}>
                    <FileText className="w-5 h-5 text-white drop-shadow-sm" />
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate text-lg">
                        {file.name}
                      </h4>
                      {file.language && (
                        <Badge variant="outline" className="text-xs font-semibold px-2 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900 dark:to-teal-900 border-emerald-200 dark:border-emerald-700">
                          <Code className="w-3 h-3 mr-1" />
                          {file.language}
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate mb-3 font-mono">
                      {file.path}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                      {file.size && (
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-400 rounded-full" />
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      )}
                      {hasContent && (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                          <Eye className="w-4 h-4" />
                          Contenu chargé
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-shrink-0">
                  {hasContent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFileExpansion(file.path)}
                      className="gap-2 hover:scale-105 transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      {isExpanded ? 'Réduire' : 'Voir'}
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(file.url, '_blank')}
                    className="gap-2 hover:scale-105 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(file.path)}
                    className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 hover:scale-105 transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {isExpanded && hasContent && (
                <div className="mt-5 relative z-10">
                  <Separator className="mb-4 bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-600" />
                  <div className="relative">
                    <div className="absolute top-3 right-3 z-20">
                      <Badge variant="secondary" className="text-xs font-semibold px-2 py-1 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border-slate-300 dark:border-slate-600">
                        <Code className="w-3 h-3 mr-1" />
                        {file.language || 'text'}
                      </Badge>
                    </div>
                    <pre className={cn(
                      "text-sm p-5 rounded-xl overflow-x-auto max-h-80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 border border-slate-700 shadow-2xl",
                      "scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800 font-mono leading-relaxed"
                    )}>
                      <code>{file.content?.substring(0, 2000)}{file.content && file.content.length > 2000 ? '\n\n... (contenu tronqué)' : ''}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        
        <div className={cn(
          "p-4 rounded-2xl text-center border backdrop-blur-sm",
          modePrive 
            ? "bg-gradient-to-r from-red-100/60 to-purple-100/60 dark:from-red-900/30 dark:to-purple-900/30 border-red-200/60 dark:border-red-800/60"
            : modeEnfant
            ? "bg-gradient-to-r from-pink-100/60 to-yellow-100/60 dark:from-pink-900/30 dark:to-yellow-900/30 border-pink-200/60 dark:border-pink-800/60"
            : "bg-gradient-to-r from-slate-100/60 to-blue-100/60 dark:from-slate-800/60 dark:to-blue-800/60 border-slate-200/60 dark:border-slate-700/60"
        )}>
          <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
            <Sparkles className="w-4 h-4 inline mr-2 text-blue-500" />
            Ces fichiers sont automatiquement inclus dans le contexte de Gemini pour l'analyse
          </p>
        </div>
      </div>
    </div>
  );
}
