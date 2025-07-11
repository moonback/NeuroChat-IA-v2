import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  X, 
  Save, 
  FileText, 
  Code, 
  MessageSquare, 
  Plus, 
  Trash2, 
  Edit3, 
  Download, 
  Upload,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EditorIntegration } from '@/components/EditorIntegration';

interface CollaborativeEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (message: string) => void;
  lastResponse?: string;
  onRegisterResponseHandler?: (handler: ((response: string) => void) | null) => void;
}

interface EditorComment {
  id: string;
  line: number;
  text: string;
  author: 'user' | 'gemini';
  timestamp: Date;
  resolved: boolean;
}

interface EditorDocument {
  id: string;
  title: string;
  content: string;
  language: string;
  lastModified: Date;
  comments: EditorComment[];
  version: number;
  isCollapsed?: boolean;
}

const SUPPORTED_LANGUAGES = [
  { value: 'text', label: 'Texte brut' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'html', label: 'HTML' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'json', label: 'JSON' },
  { value: 'css', label: 'CSS' },
  { value: 'jsx', label: 'React JSX' },
  { value: 'tsx', label: 'React TSX' },
];

export const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  isOpen,
  onClose,
  onSendMessage,
  lastResponse,
  onRegisterResponseHandler,
}) => {
  const [documents, setDocuments] = useState<EditorDocument[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [selectedLines, setSelectedLines] = useState<number[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isCommentMode, setIsCommentMode] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState({ line: 0, column: 0 });
  const [lastGeminiResponse, setLastGeminiResponse] = useState<string>('');
  const [responseHandlerRef, setResponseHandlerRef] = useState<((response: string) => void) | null>(null);

  const activeDocument = documents.find(doc => doc.id === activeDocumentId);

  // Créer un nouveau document
  const createDocument = (title: string = 'Nouveau document', language: string = 'text') => {
    const newDoc: EditorDocument = {
      id: Date.now().toString(),
      title,
      content: '',
      language,
      lastModified: new Date(),
      comments: [],
      version: 1,
    };
    setDocuments(prev => [...prev, newDoc]);
    setActiveDocumentId(newDoc.id);
  };

  // Mettre à jour le contenu du document actif
  const updateDocumentContent = (content: string) => {
    if (!activeDocument) return;
    
    setDocuments(prev => prev.map(doc => 
      doc.id === activeDocumentId 
        ? { ...doc, content, lastModified: new Date(), version: doc.version + 1 }
        : doc
    ));
  };

  // Supprimer un document
  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    if (activeDocumentId === id) {
      setActiveDocumentId(documents.length > 1 ? documents[0].id : null);
    }
  };

  // Ajouter un commentaire
  const addComment = (line: number, text: string, author: 'user' | 'gemini' = 'user') => {
    if (!activeDocument) return;
    
    const newComment: EditorComment = {
      id: Date.now().toString(),
      line,
      text,
      author,
      timestamp: new Date(),
      resolved: false,
    };

    setDocuments(prev => prev.map(doc => 
      doc.id === activeDocumentId 
        ? { ...doc, comments: [...doc.comments, newComment] }
        : doc
    ));
  };

  // Calculer la position du curseur et mettre à jour le texte sélectionné
  const updateCursorPosition = (textarea: HTMLTextAreaElement) => {
    const text = textarea.value;
    const cursorPos = textarea.selectionStart;
    const lines = text.substring(0, cursorPos).split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    setCursorPosition({ line, column });
    
    // Mettre à jour le texte sélectionné
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = text.substring(start, end);
    setSelectedText(selected);
  };

  // Fonction pour recevoir les réponses de Gemini
  const handleReceiveResponse = (response: string) => {
    setLastGeminiResponse(response);
    // Transmettre la réponse au chat de l'éditeur
    if (responseHandlerRef) {
      responseHandlerRef(response);
    }
  };

  // Demander à Gemini d'améliorer le contenu
  const requestGeminiImprovement = (selectedText?: string) => {
    if (!activeDocument) return;
    
    const textToImprove = selectedText || activeDocument.content;
    const prompt = `Améliore ce ${activeDocument.language} :\n\n${textToImprove}`;
    onSendMessage(prompt);
  };

  // Exporter le document
  const exportDocument = () => {
    if (!activeDocument) return;
    
    const blob = new Blob([activeDocument.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDocument.title}.${activeDocument.language}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Importer un document
  const importDocument = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const extension = file.name.split('.').pop()?.toLowerCase();
      const language = SUPPORTED_LANGUAGES.find(lang => 
        lang.value === extension || (extension === 'js' && lang.value === 'javascript')
      )?.value || 'text';
      
      createDocument(file.name, language);
      updateDocumentContent(content);
    };
    reader.readAsText(file);
  };

  // Initialiser avec un document par défaut
  useEffect(() => {
    if (documents.length === 0) {
      createDocument('Document de travail', 'markdown');
    }
  }, []);

  // Gestion de la touche Échap pour fermer l'éditeur
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Transmettre le gestionnaire de réponse à l'App
  useEffect(() => {
    if (onRegisterResponseHandler) {
      const timer = setTimeout(() => {
        if (responseHandlerRef) {
          onRegisterResponseHandler(responseHandlerRef);
        }
      }, 0);
      
      return () => {
        clearTimeout(timer);
        onRegisterResponseHandler(null);
      };
    }
  }, [onRegisterResponseHandler, responseHandlerRef]);

  if (!isOpen) return null;

  return (
    <div className={cn(
      "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4",
      isFullscreen && "p-0"
    )}>
      {/* Bouton de fermeture flottant */}
      {!isFullscreen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-6 right-6 z-60 h-10 w-10 bg-white/90 dark:bg-slate-800/90 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-lg rounded-full transition-all duration-200 hover:scale-110"
          title="Fermer l'éditeur (Échap)"
        >
          <X className="h-5 w-5" />
        </Button>
      )}
      
      <div className={cn(
        "bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-800/50 overflow-hidden",
        "transition-all duration-300",
        isFullscreen ? "w-full h-full rounded-none" : "w-full max-w-7xl h-[90vh]"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Code className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                Éditeur collaboratif
              </h2>
            </div>
            {activeDocument && (
              <Badge variant="secondary" className="text-xs">
                {activeDocument.language}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8 hover:bg-slate-100 dark:hover:bg-slate-700"
              title={isFullscreen ? "Réduire" : "Plein écran"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Fermer l'éditeur"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Contenu principal en 2 colonnes */}
        <div className="flex" style={{ height: isFullscreen ? 'calc(100vh - 80px)' : 'calc(90vh - 80px)' }}>
          {/* Colonne gauche : Discussion avec Gemini */}
          <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col">
            <EditorIntegration
              onSendMessage={onSendMessage}
              selectedText={selectedText}
              activeDocument={activeDocument}
              onReceiveResponse={handleReceiveResponse}
              onRegisterResponseHandler={setResponseHandlerRef}
              onApplyImprovement={(text) => {
                if (activeDocument) {
                  updateDocumentContent(text);
                }
              }}
              onAddComment={(comment, line) => {
                if (activeDocument) {
                  addComment(line, comment, 'gemini');
                }
              }}
            />
          </div>

          {/* Colonne droite : Éditeur */}
          <div className="flex-1 flex flex-col">
            {/* Barre d'outils de l'éditeur */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                  {/* Gestion des documents */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => createDocument()}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nouveau
                    </Button>
                    
                    <input
                      type="file"
                      accept=".txt,.md,.html,.js,.jsx,.ts,.tsx,.py,.json,.css"
                      onChange={importDocument}
                      className="hidden"
                      id="file-import"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('file-import')?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Importer
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportDocument}
                      disabled={!activeDocument}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exporter
                    </Button>
                  </div>

                  {/* Sélection du language */}
                  {activeDocument && (
                    <Select
                      value={activeDocument.language}
                      onValueChange={(value) => {
                        setDocuments(prev => prev.map(doc => 
                          doc.id === activeDocumentId 
                            ? { ...doc, language: value }
                            : doc
                        ));
                      }}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_LANGUAGES.map(lang => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowComments(!showComments)}
                    className="h-8 w-8"
                  >
                    {showComments ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Sauvegarde locale
                      localStorage.setItem('collaborative-editor-docs', JSON.stringify(documents));
                    }}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </Button>
                </div>
              </div>

              {/* Onglets des documents */}
              {documents.length > 1 && (
                <div className="flex items-center gap-2 mt-4 overflow-x-auto">
                  {documents.map(doc => (
                    <div
                      key={doc.id}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors",
                        "hover:bg-slate-100 dark:hover:bg-slate-800",
                        activeDocumentId === doc.id 
                          ? "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700" 
                          : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      )}
                      onClick={() => setActiveDocumentId(doc.id)}
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-medium truncate max-w-32">
                        {doc.title}
                      </span>
                      {documents.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteDocument(doc.id);
                          }}
                          className="h-5 w-5 hover:bg-red-100 dark:hover:bg-red-900"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Zone d'édition */}
            {activeDocument && (
              <div className="flex-1 flex">
                {/* Éditeur de texte */}
                <div className="flex-1 flex flex-col">
                  {/* Titre du document */}
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <Input
                      value={activeDocument.title}
                      onChange={(e) => {
                        setDocuments(prev => prev.map(doc => 
                          doc.id === activeDocumentId 
                            ? { ...doc, title: e.target.value }
                            : doc
                        ));
                      }}
                      className="font-semibold text-lg border-none p-0 focus-visible:ring-0"
                      placeholder="Titre du document"
                    />
                  </div>

                  {/* Éditeur principal */}
                  <div className="flex-1 relative">
                    <Textarea
                      ref={editorRef}
                      value={activeDocument.content}
                      onChange={(e) => {
                        updateDocumentContent(e.target.value);
                        updateCursorPosition(e.target);
                      }}
                      onSelect={(e) => updateCursorPosition(e.target as HTMLTextAreaElement)}
                      placeholder="Commencez à taper votre contenu ici..."
                      className="w-full h-full resize-none border-none focus-visible:ring-0 font-mono text-sm p-4"
                      style={{ minHeight: '400px' }}
                    />
                    
                    {/* Informations de statut */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-md shadow-sm border border-slate-200 dark:border-slate-700">
                      <span>Ligne {cursorPosition.line}, Colonne {cursorPosition.column}</span>
                      <span>Version {activeDocument.version}</span>
                      <span>{activeDocument.content.length} caractères</span>
                    </div>
                  </div>
                </div>

                {/* Panneau des commentaires */}
                {showComments && (
                  <div className="w-80 border-l border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200">
                        Commentaires
                      </h4>
                    </div>
                    
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {activeDocument.comments.map(comment => (
                          <div
                            key={comment.id}
                            className={cn(
                              "p-3 rounded-lg border",
                              comment.author === 'gemini' 
                                ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                            )}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant={comment.author === 'gemini' ? 'default' : 'secondary'}>
                                {comment.author === 'gemini' ? 'Gemini' : 'Vous'}
                              </Badge>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                Ligne {comment.line}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                              {comment.text}
                            </p>
                          </div>
                        ))}
                        
                        {activeDocument.comments.length === 0 && (
                          <div className="text-center text-slate-500 dark:text-slate-400 text-sm py-8">
                            Aucun commentaire pour le moment
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 