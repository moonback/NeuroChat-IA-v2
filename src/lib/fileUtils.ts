/**
 * Formate la taille d'un fichier en Ko ou Mo
 * @param bytes - Taille en octets
 * @returns Taille formatée avec unité
 */
export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  }
  return `${(bytes / 1024).toFixed(1)} Ko`;
}

/**
 * Extrait l'extension d'un fichier à partir de son type MIME ou nom
 * @param file - Fichier à analyser
 * @returns Extension en majuscules
 */
export function getFileExtension(file: File): string {
  const mime = file.type || '';
  const name = file.name.toLowerCase();
  
  if (mime.startsWith('image/')) {
    return mime.split('/')[1]?.toUpperCase() || 'IMAGE';
  }
  
  if (mime === 'application/pdf' || name.endsWith('.pdf')) {
    return 'PDF';
  }
  
  if (
    mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx') ||
    mime === 'application/msword' ||
    name.endsWith('.doc')
  ) {
    return 'DOC';
  }
  
  return mime.split('/')[1]?.toUpperCase() || name.split('.').pop()?.toUpperCase() || 'FICHIER';
}

/**
 * Génère les métadonnées d'un fichier (taille, extension, pages/mots)
 * @param file - Fichier à analyser
 * @param fileInfo - Informations supplémentaires sur le fichier
 * @returns Métadonnées formatées
 */
export function getFileMetadata(
  file: File, 
  fileInfo: { kind: 'image' | 'pdf' | 'docx' | 'other'; pages?: number; words?: number }
): string {
  const size = formatFileSize(file.size);
  const ext = getFileExtension(file);
  
  let metadata = `${size} • ${ext}`;
  
  if (fileInfo.kind === 'pdf' && fileInfo.pages) {
    metadata += ` • ${fileInfo.pages} page${fileInfo.pages > 1 ? 's' : ''}`;
  } else if (fileInfo.kind === 'docx' && fileInfo.words) {
    metadata += ` • ${fileInfo.words} mots`;
  }
  
  return metadata;
}
