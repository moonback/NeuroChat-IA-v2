# 📚 API interne & hooks

Ce document détaille les principaux services, hooks et utilitaires qui font office d’API interne dans NeuroChat IA v2.

---

## Services principaux

| Fichier                | Rôle / Description                                                                 |
|------------------------|----------------------------------------------------------------------------------|
| geminiApi.ts           | Appels à l’API Google Gemini Pro (multimodal, texte, image)                       |
| openaiApi.ts           | Appels à l’API OpenAI (optionnel)                                                 |
| mistralApi.ts          | Appels à l’API Mistral (optionnel)                                                |
| llm.ts                 | Abstraction multi-provider (Gemini, OpenAI, Mistral)                              |
| embeddings.ts          | Embeddings locaux (MiniLM via transformers.js)                                    |
| ragSearch.ts           | Recherche sémantique sur documents importés                                       |
| webSearch.ts           | Recherche web (Tavily/DuckDuckGo)                                                 |
| encryption.ts          | Chiffrement AES-256-GCM                                                           |
| keyManager.ts          | Gestion des clés cryptographiques (rotation, audit, dérivation)                    |
| secureStorage.ts       | Stockage sécurisé (localStorage/sessionStorage, auto-destruction, whitelist)       |
| persistentEncryption.ts| Chiffrement persistant                                                            |

---

## Hooks personnalisés

| Hook                    | Rôle / Usage principal                                  |
|-------------------------|--------------------------------------------------------|
| useSpeechRecognition    | Reconnaissance vocale (Web Speech API)                 |
| useSpeechSynthesis      | Synthèse vocale configurable                           |
| useDiscussions          | Gestion des discussions/messages                       |
| useTheme                | Gestion du thème (clair/sombre)                       |
| useWorkspace            | Gestion des espaces de travail                         |
| use-toast               | Notifications toast                                   |

---

## Utilitaires

| Fichier      | Rôle / Description                       |
|--------------|------------------------------------------|
| utils.ts     | Fonctions utilitaires diverses           |

---

## Exemples d’utilisation

```typescript
// Exemple : Ajouter un message sécurisé
import { SecureStorageAPI } from '@/services/secureStorage';
await SecureStorageAPI.setItem('ws:123:gemini_discussions', JSON.stringify(messages));

// Exemple : Générer une clé cryptographique
import { SecureKeyRegistry } from '@/services/keyManager';
const registry = new SecureKeyRegistry();
const keyId = registry.createKey('session', 'discussion');
const keyValue = registry.accessKey(keyId, 'discussion');
```

---

## Bonnes pratiques

- Toujours utiliser les services pour accéder aux données sensibles
- Ne jamais stocker de clé API ou de données utilisateur en clair
- Utiliser les hooks pour la logique métier et l’état UI
- Séparer la logique métier (services) de la présentation (composants)