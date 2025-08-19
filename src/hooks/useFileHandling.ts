import { useCallback } from 'react';
import type { FileProcessingResult } from '@/types/voiceInput';

export function useFileHandling() {
  const processFile = useCallback(async (file: File): Promise<FileProcessingResult> => {
    const mime = file.type || '';
    const name = file.name.toLowerCase();
    
    // Traitement des images
    if (mime.startsWith('image/')) {
      return {
        fileInfo: { kind: 'image' },
        extractedText: '',
      };
    }

    // Traitement des PDF
    if (mime === 'application/pdf' || name.endsWith('.pdf')) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfModule: any = await import('pdfjs-dist');
        const pdfjsLib = pdfModule?.default ?? pdfModule;
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
        
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pages = pdf.numPages;
        
        // Extraction légère: première page texte (optionnel, court)
        let extractedText = '';
        try {
          const page = await pdf.getPage(1);
          const content = await page.getTextContent();
          extractedText = content.items.map((it: any) => (it?.str || '')).join(' ').trim();
        } catch {
          // Ignore les erreurs d'extraction de texte
        }

        return {
          fileInfo: { kind: 'pdf', pages },
          extractedText,
        };
      } catch {
        return {
          fileInfo: { kind: 'pdf' },
          extractedText: '',
        };
      }
    }

    // Traitement des documents Word
    if (
      mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      name.endsWith('.docx') ||
      mime === 'application/msword' ||
      name.endsWith('.doc')
    ) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const mammothModule: any = await import('mammoth');
        const mammoth = mammothModule?.default ?? mammothModule;
        
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = (result?.value || '').trim();
        const words = text ? text.split(/\s+/).filter(Boolean).length : 0;

        return {
          fileInfo: { kind: 'docx', words },
          extractedText: text,
        };
      } catch {
        return {
          fileInfo: { kind: 'docx' },
          extractedText: '',
        };
      }
    }

    // Fichiers non supportés
    return {
      fileInfo: { kind: 'other' },
      extractedText: '',
    };
  }, []);

  return {
    processFile,
  };
}
