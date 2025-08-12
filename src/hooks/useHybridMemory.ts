import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { summarizeMessages } from '@/services/summarizer';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  imageUrl?: string;
  // Messages spéciaux (ex: RAG) ne doivent pas être pris en compte dans la mémoire
  // On détecte via un cast côté appelant si besoin
}

export type HybridMemoryStatus = 'idle' | 'running' | 'ready' | 'error';

export interface HybridMemoryState {
  status: HybridMemoryStatus;
  summary: string; // Résumé agrégé de la mémoire longue
  facts: string[]; // Faits clés extraits cumulés
  summarizedUntilIndex: number; // Index maximum (dans la liste filtrée) déjà résumé
  error?: string;
}

export interface UseHybridMemoryOptions {
  shortWindowSize?: number; // par défaut 10
  summarizeThreshold?: number; // déclenche après > 16
}

export function useHybridMemory(
  messages: ChatMessage[],
  options: UseHybridMemoryOptions = {}
) {
  const shortWindowSize = options.shortWindowSize ?? 10;
  const summarizeThreshold = options.summarizeThreshold ?? 16;

  const [state, setState] = useState<HybridMemoryState>({
    status: 'idle',
    summary: '',
    facts: [],
    summarizedUntilIndex: -1,
  });

  const isSummarizingRef = useRef(false);

  // On exclut les messages non textuels spéciaux (ex: messages RAG qui n'ont pas de .text string)
  const plainMessages = useMemo(
    () => messages.filter((m: any) => typeof m.text === 'string'),
    [messages]
  );

  const totalCount = plainMessages.length;

  // Fenêtre courte: les N derniers messages
  const shortTermMessages = useMemo(() => {
    const start = Math.max(0, totalCount - shortWindowSize);
    return plainMessages.slice(start);
  }, [plainMessages, totalCount, shortWindowSize]);

  // Déclenche la summarisation en tâche de fond si nécessaire
  const requestSummarizationIfNeeded = useCallback(async (force = false) => {
    if (isSummarizingRef.current) return;
    // On résume tout ce qui est avant la fenêtre courte
    const cutoff = Math.max(0, totalCount - shortWindowSize);
    if (!force) {
      if (totalCount <= summarizeThreshold || cutoff <= 0) return;
      if (cutoff - 1 <= state.summarizedUntilIndex) return; // rien de nouveau à résumer
    }

    const toSummarize = force ? plainMessages : plainMessages.slice(0, cutoff);
    if (toSummarize.length === 0) return;

    try {
      isSummarizingRef.current = true;
      setState((s) => ({ ...s, status: 'running', error: undefined }));
      const result = await summarizeMessages(
        toSummarize.map((m) => ({ text: m.text, isUser: m.isUser })),
        force ? '' : state.summary,
        force ? [] : state.facts
      );
      setState((s) => ({
        status: 'ready',
        summary: force ? (result.summary || '') : (result.summary || s.summary),
        facts: force
          ? (result.facts || [])
          : (result.facts && result.facts.length > 0 ? Array.from(new Set([...(s.facts || []), ...result.facts])) : s.facts),
        summarizedUntilIndex: force ? totalCount - 1 : cutoff - 1,
        error: undefined,
      }));
    } catch (err: any) {
      setState((s) => ({ ...s, status: 'error', error: err?.message || 'Erreur de summarisation' }));
      // Fallback gracieux: on ne bloque rien
    } finally {
      isSummarizingRef.current = false;
    }
  }, [plainMessages, shortWindowSize, summarizeThreshold, totalCount, state.summary, state.facts, state.summarizedUntilIndex]);

  useEffect(() => {
    // Tente une summarisation à chaque changement de messages
    requestSummarizationIfNeeded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalCount]);

  // Contexte mémoire longue formaté pour le prompt système
  const longTermContextText = useMemo(() => {
    if (!state.summary && (!state.facts || state.facts.length === 0)) return '';
    let text = 'MEMOIRE LONGUE (résumé+faits)\n';
    if (state.summary) {
      text += `Résumé: ${state.summary}\n`;
    }
    if (state.facts && state.facts.length > 0) {
      text += 'Faits clés:\n';
      for (const f of state.facts) text += `- ${f}\n`;
    }
    return text + '\n';
  }, [state.summary, state.facts]);

  return {
    // Données
    status: state.status,
    error: state.error,
    summary: state.summary,
    facts: state.facts,
    summarizedUntilIndex: state.summarizedUntilIndex,
    // Fenêtre courte à envoyer au modèle
    shortTermMessages,
    // Contexte mémoire longue à injecter dans le prompt
    longTermContextText,
    // Métriques UI
    totalCount,
    shortCount: shortTermMessages.length,
    optimized: totalCount > summarizeThreshold && (state.summary.length > 0 || state.facts.length > 0),
    // Actions
    requestSummarizationIfNeeded,
    forceSummarizeNow: async () => {
      // Re-synthétise toute la conversation et remplace entièrement résumé+faits
      if (isSummarizingRef.current) return;
      try {
        isSummarizingRef.current = true;
        setState((s) => ({ ...s, status: 'running', error: undefined }));
        const result = await summarizeMessages(
          plainMessages.map((m) => ({ text: m.text, isUser: m.isUser })),
          '',
          []
        );
        setState({
          status: 'ready',
          summary: result.summary || '',
          facts: result.facts || [],
          summarizedUntilIndex: totalCount - 1,
          error: undefined,
        });
      } catch (err: any) {
        setState((s) => ({ ...s, status: 'error', error: err?.message || 'Erreur de summarisation' }));
      } finally {
        isSummarizingRef.current = false;
      }
    },
    setSummary: (summary: string) => setState((s) => ({ ...s, summary })),
    setFacts: (facts: string[]) => setState((s) => ({ ...s, facts })),
  };
}


