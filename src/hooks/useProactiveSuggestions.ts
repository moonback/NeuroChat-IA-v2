import { useEffect, useState } from "react";
import { useMemory } from "./MemoryContext";

export function useProactiveSuggestions(messages: any[]) {
  const { memory } = useMemory();
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const newSuggestions: string[] = [];

    // Suggestion si aucun message (nouvelle conversation)
    if (messages.length === 0) {
      newSuggestions.push("Peux-tu me raconter une blague ?");
      newSuggestions.push("Quel temps fait-il aujourd'hui ?");
      newSuggestions.push("Peux-tu m'aider à organiser ma journée ?");
      newSuggestions.push("Raconte-moi une histoire intéressante");
    }

    // Sujet inachevé : si le dernier message contient "à suivre" ou une question sans réponse
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.text.match(/à suivre|continuer|reprendre/i)) {
        newSuggestions.push("Peux-tu continuer l'explication ?");
      }
      // Suggestion si la dernière question de l'utilisateur n'a pas eu de réponse IA
      if (
        lastMsg.isUser &&
        messages.filter((m: any) => !m.isUser).length === 0 &&
        lastMsg.text.match(/[?？]$/)
      ) {
        newSuggestions.push("Peux-tu répondre à ma question ?");
      }
    }

    // Préférences mémorisées : exemple avec "photographie"
    const interest = memory.find(fact => fact.content.match(/photo|photographie|musique|voyage/i));
    if (interest) {
      if (interest.content.includes("photo") || interest.content.includes("photographie")) {
        newSuggestions.push("Peux-tu me donner des conseils de photographie ?");
      } else if (interest.content.includes("musique")) {
        newSuggestions.push("Peux-tu me recommander de la musique ?");
      } else if (interest.content.includes("voyage")) {
        newSuggestions.push("Peux-tu me suggérer des destinations de voyage ?");
      }
    }

    // Rappel horaire (exemple simple)
    const now = new Date();
    if (now.getHours() === 14) {
      newSuggestions.push("Peux-tu me rappeler mes rendez-vous ?");
    }

    // Suggestion basée sur l'heure de la journée
    const hour = now.getHours();
    if (hour >= 9 && hour <= 12) {
      newSuggestions.push("Peux-tu m'aider à planifier ma matinée ?");
    } else if (hour >= 12 && hour <= 14) {
      newSuggestions.push("Peux-tu me suggérer des idées de déjeuner ?");
    } else if (hour >= 18 && hour <= 21) {
      newSuggestions.push("Peux-tu me résumer ma journée ?");
    }

    // Suggestions générales basées sur le contexte
    if (messages.length > 2) {
      newSuggestions.push("Peux-tu m'expliquer plus en détail ?");
      newSuggestions.push("As-tu d'autres conseils à me donner ?");
    }

    setSuggestions(newSuggestions);
  }, [memory, messages]);

  return suggestions;
} 