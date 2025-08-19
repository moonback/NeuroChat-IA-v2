import React from 'react';
import { X, ImageIcon, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getFileMetadata } from '@/lib/fileUtils';
import type { FileInfo } from '@/types/voiceInput';

interface FilePreviewProps {
  file: File;
  fileInfo: FileInfo;
  extractedText: string;
  onRemove: () => void;
  className?: string;
}

export const FilePreview: React.FC<FilePreviewProps> = React.memo(({
  file,
  fileInfo,
  extractedText,
  onRemove,
  className,
}) => {
  const getFileIcon = () => {
    if (fileInfo.kind === 'image') {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt="Aperçu"
          className="w-10 h-10 rounded-lg object-cover border border-white/80 dark:border-slate-700/80 shadow"
        />
      );
    }
    
    return (
      <div className="w-10 h-10 rounded-lg border border-white/80 dark:border-slate-700/80 bg-white/70 dark:bg-slate-800/70 flex items-center justify-center shadow">
        <FileText className="w-5 h-5 text-blue-600 dark:text-blue-300" />
      </div>
    );
  };

  const getFileTypeIcon = () => {
    if (fileInfo.kind === 'image') {
      return <ImageIcon className="w-3 h-3 text-white" />;
    }
    return <FileText className="w-3 h-3 text-white" />;
  };

  return (
    <div className={cn(
      "mb-3 animate-in slide-in-from-bottom-2 fade-in-0 duration-200",
      className
    )}>
      <div className="relative inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/50 dark:border-blue-800/50 shadow-lg backdrop-blur-sm">
        <div className="relative">
          {getFileIcon()}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
            {getFileTypeIcon()}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div 
            className="text-sm font-medium text-blue-900 dark:text-blue-100 truncate" 
            title={file.name}
          >
            {file.name}
          </div>
          <div className="text-xs text-blue-700/80 dark:text-blue-300/80">
            {getFileMetadata(file, fileInfo)}
          </div>
          {extractedText && fileInfo.kind !== 'image' && (
            <div className="mt-1 text-xs text-blue-900/80 dark:text-blue-100/80 line-clamp-2">
              {extractedText}
            </div>
          )}
        </div>
        
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={onRemove}
          className="h-7 w-7 p-0 rounded-md hover:bg-red-100 dark:hover:bg-red-950/50 text-red-600 dark:text-red-400"
          title="Retirer le fichier"
          aria-label="Retirer le fichier"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

FilePreview.displayName = 'FilePreview';
