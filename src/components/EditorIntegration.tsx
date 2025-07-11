import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Bot, 
  User, 
  MessageSquare, 
  Sparkles, 
  FileText, 
  Lightbulb,
  CheckCircle,
  RefreshCw,
  Copy,
  Trash2,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  type: 'message' | 'suggestion' | 'improvement' | 'comment';
  documentId?: string;
  lineNumber?: number;
}

interface EditorIntegrationProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  selectedText?: string;
  activeDocument?: {
    id: string;
    title: string;
    content: string;
    language: string;
  };
  onApplyImprovement?: (text: string) => void;
  onAddComment?: (comment: string, line: number) => void;
  onReceiveResponse?: (response: string) => void;
  onRegisterResponseHandler?: (handler: (response: string) => void) => void;
}

export const EditorIntegration: React.FC<EditorIntegrationProps> = ({
  onSendMessage,
  isLoading = false,
  selectedText = '',
  activeDocument,
  onApplyImprovement,
  onAddComment,
  onReceiveResponse,
  onRegisterResponseHandler,
}) => {
  const [messages, setMessages] = useState<EditorMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Générer des suggestions de prompts basées sur le contexte
  useEffect(() => {
    if (activeDocument) {
      const prompts = generateContextualPrompts(activeDocument, selectedText);
      setSuggestedPrompts(prompts);
    }
  }, [activeDocument, selectedText]);

  // Faire défiler automatiquement vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Recevoir les réponses de Gemini
  useEffect(() => {
    if (onRegisterResponseHandler) {
      // Cette fonction sera appelée quand une réponse de Gemini arrive
      const handleResponse = (response: string) => {
        const assistantMessage: EditorMessage = {
          id: Date.now().toString(),
          content: response,
          role: 'assistant',
          timestamp: new Date(),
          type: 'message',
          documentId: activeDocument?.id,
        };
        setMessages(prev => [...prev, assistantMessage]);
      };
      
      // Utiliser un timeout pour éviter les setState pendant le rendu
      const timer = setTimeout(() => {
        onRegisterResponseHandler(handleResponse);
      }, 0);
      
      return () => clearTimeout(timer);
    }
  }, [onRegisterResponseHandler, activeDocument?.id]);

  const generateContextualPrompts = (document: any, selection: string) => {
    const prompts = [];
    
    if (selection) {
      prompts.push(`Améliore ce code : "${selection.substring(0, 50)}..."`);
      prompts.push(`Explique ce code : "${selection.substring(0, 50)}..."`);
      prompts.push(`Trouve les erreurs dans : "${selection.substring(0, 50)}..."`);
    }
    
    if (document.language === 'javascript' || document.language === 'typescript') {
      prompts.push('Optimise ce code JavaScript/TypeScript');
      prompts.push('Ajoute des commentaires JSDoc');
      prompts.push('Convertit en TypeScript moderne');
    } else if (document.language === 'python') {
      prompts.push('Optimise ce code Python');
      prompts.push('Ajoute des docstrings');
      prompts.push('Applique les bonnes pratiques PEP 8');
    } else if (document.language === 'markdown') {
      prompts.push('Améliore la structure de ce document');
      prompts.push('Corrige l\'orthographe et la grammaire');
      prompts.push('Ajoute des exemples pratiques');
    }
    
    prompts.push('Résume le contenu du document');
    prompts.push('Identifie les améliorations possibles');
    prompts.push('Génère une documentation');
    
    return prompts.slice(0, 6); // Limite à 6 suggestions
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage: EditorMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user',
      timestamp: new Date(),
      type: 'message',
      documentId: activeDocument?.id,
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Préparer le message avec le contexte du document
    let contextualMessage = inputMessage;
    
    if (activeDocument) {
      contextualMessage = `[Document: "${activeDocument.title}"]
[Langage: ${activeDocument.language}]
[Contenu du document:]
${activeDocument.content}

[Question de l'utilisateur:]
${inputMessage}`;
    }
    
    // Inclure le texte sélectionné si disponible
    if (selectedText) {
      if (activeDocument) {
        contextualMessage = `[Document: "${activeDocument.title}"]
[Langage: ${activeDocument.language}]
[Texte sélectionné:]
${selectedText}

[Question:]
${inputMessage}`;
      } else {
        contextualMessage = `[Texte sélectionné:]
${selectedText}

[Question:]
${inputMessage}`;
      }
    }
    
    onSendMessage(contextualMessage);
    setInputMessage('');
  };

  const handlePromptClick = (prompt: string) => {
    setInputMessage(prompt);
    
    // Préparer le message avec le contexte du document
    let contextualMessage = prompt;
    
    if (activeDocument) {
      contextualMessage = `[Document: "${activeDocument.title}"]
[Langage: ${activeDocument.language}]
[Contenu du document:]
${activeDocument.content}

[Demande:]
${prompt}`;
    }
    
    // Inclure le texte sélectionné si disponible
    if (selectedText) {
      if (activeDocument) {
        contextualMessage = `[Document: "${activeDocument.title}"]
[Langage: ${activeDocument.language}]
[Texte sélectionné:]
${selectedText}

[Demande:]
${prompt}`;
      } else {
        contextualMessage = `[Texte sélectionné:]
${selectedText}

[Demande:]
${prompt}`;
      }
    }
    
    const newMessage: EditorMessage = {
      id: Date.now().toString(),
      content: prompt,
      role: 'user',
      timestamp: new Date(),
      type: 'message',
      documentId: activeDocument?.id,
    };

    setMessages(prev => [...prev, newMessage]);
    onSendMessage(contextualMessage);
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatMessage = (content: string | null) => {
    if (!content) return '';
    
    // Formatage simple pour les blocs de code
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const inlineCodeRegex = /`([^`]+)`/g;
    
    return content
      .replace(codeBlockRegex, '<pre class="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg overflow-x-auto"><code>$2</code></pre>')
      .replace(inlineCodeRegex, '<code class="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">$1</code>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">
              Assistant IA
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Colaborez avec Gemini sur votre code
            </p>
          </div>
          {activeDocument && (
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs">
                <FileText className="w-3 h-3 mr-1" />
                {activeDocument.title}
              </Badge>
            </div>
          )}
        </div>
        {activeDocument && (
          <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Document actuel inclus automatiquement dans le contexte
          </div>
        )}
        {selectedText && (
          <div className="mt-2 text-xs text-orange-600 dark:text-orange-400 flex items-center gap-1">
            <Eye className="w-3 h-3" />
            Texte sélectionné ({selectedText.length} caractères) sera priorisé
          </div>
        )}
      </div>

      {/* Suggestions rapides */}
      {suggestedPrompts.length > 0 && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Suggestions
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {suggestedPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handlePromptClick(prompt)}
                className="justify-start h-auto p-2 text-xs text-left bg-white/80 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-900/50"
              >
                <Sparkles className="w-3 h-3 mr-2 text-blue-500" />
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 dark:text-slate-400 py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm mb-2">Commencez une conversation avec l'IA</p>
              <p className="text-xs">Posez des questions sur votre code ou demandez des améliorations</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3 max-w-full",
                  message.role === 'user' ? "justify-end" : "justify-start"
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className={cn(
                  "rounded-2xl px-4 py-3 max-w-[80%] shadow-sm",
                  message.role === 'user' 
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white" 
                    : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                )}>
                  <div className="flex items-center gap-2 mb-1">
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <div className="flex items-center gap-1">
                        <Bot className="w-4 h-4" />
                        <Badge variant="secondary" className="text-xs">
                          {message.type === 'suggestion' ? 'Suggestion' :
                           message.type === 'improvement' ? 'Amélioration' :
                           message.type === 'comment' ? 'Commentaire' : 'Réponse'}
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <div 
                    className="text-sm leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                  />
                  
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(message.content)}
                        className="h-6 px-2 text-xs"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copier
                      </Button>
                      
                      {onApplyImprovement && message.type === 'improvement' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onApplyImprovement(message.content)}
                          className="h-6 px-2 text-xs"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Appliquer
                        </Button>
                      )}
                      
                      {onAddComment && message.type === 'comment' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAddComment(message.content, message.lineNumber || 0)}
                          className="h-6 px-2 text-xs"
                        >
                          <MessageSquare className="w-3 h-3 mr-1" />
                          Ajouter
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-4 h-4 text-white animate-spin" />
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="animate-pulse flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Gemini réfléchit...
                  </span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="flex gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Demandez des améliorations, posez des questions..."
            className="flex-1 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {selectedText && (
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
              <FileText className="w-3 h-3" />
              <span>Texte sélectionné ({selectedText.length} caractères)</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 