# 🧠 NeuroChat IA v2

> Assistant de chat IA moderne avec voix, images, mémoire et RAG local

<div align="center">

![NeuroChat Platform](./public/neurochat-screenshot.png)
*Interface moderne de NeuroChat avec mode vocal automatique*

</div>

**NeuroChat** combine conversation texte, reconnaissance/synthèse vocale, support d'images et recherche augmentée (RAG) locale dans une interface élégante et responsive.

## ✨ Fonctionnalités

### 🗣️ Voix
- Mode vocal automatique (mains libres) avec bip de reprise
- Reconnaissance vocale (Web Speech API, fr-FR)
- Synthèse vocale personnalisable (vitesse, tonalité, volume, voix)
- Indicateur vocal flottant: déplaçable, minimisable, transcription en temps réel

### 💬 Chat
- Interface fluide (animations, scroll virtuel)
- Images: envoi et analyse via Gemini
- Sélection multiple et suppression groupée
- Vue « Infos »: stats messages, contexte RAG, date de début

### 🧠 Mémoire utilisateur
- Extraction de faits (profil, préférences, objectifs…) + fallback LLM
- Gestion dans la modale « Mémoire » (ajout/édition/désactivation/export/import)
- Recherche sémantique via embeddings locaux
- Commandes: `/memoir ... tags: a,b importance: 4`, `/supp ...`, `/memlist [query]`

### 📚 RAG (Recherche augmentée)
- Import: TXT, MD, PDF, DOCX, CSV, HTML
- Embeddings locaux (MiniLM) et similarité cosinus
- Activation/désactivation à la volée

### 🛡️ Mode privé
- Discussion non persistée (pas de sauvegarde locale)
- Alerte à la fermeture si messages présents
- Indicateur visuel discret

### 👶 Mode Enfant (nouveau)
- Activation/désactivation via le header, protégé par PIN (4+ chiffres)
- Choix/Changement de PIN depuis le menu mobile (option "Changer le PIN (mode enfant)")
- Contenu adapté: ton bienveillant, explications simples, mini‑jeux/quiz
- Blocages de sécurité: mémoire désactivée, RAG désactivé, réglages et providers masqués
- UI dédiée: bannière enfant et page d’accueil spécifique
- Historique: badge "Mode enfant" par conversation et titres auto pertinents

### ⚙️ Réglages
- Hyperparamètres Gemini (temperature, topK, topP, maxOutputTokens)
- TTS: test, export/import, reset, suppression
- Thème clair/sombre

### 🗂️ Historique
- Sauvegarde locale (hors mode privé)
- Recherche, tri, renommage, suppression (simple et multiple)

---

## 🚀 Installation

### Prérequis
- **Node.js** 18+ ou supérieur
- **Clé API Google Gemini** ([Obtenir gratuitement](https://makersuite.google.com/app/apikey))

### Installation en 3 étapes

1. **Cloner et installer les dépendances**
   ```bash
   git clone https://github.com/votre-username/neurochat.git
   cd neurochat
   npm install
   ```

2. **Configurer l'API Gemini**
   ```bash
   # Créer le fichier de configuration
   echo "VITE_GEMINI_API_KEY=votre_clé_api_gemini" > .env.local
   ```

3. **Lancer l'application**
   ```bash
   npm run dev
   ```

🎉 **C'est prêt !** Ouvrez [http://localhost:5173](http://localhost:5173)

---

## 📖 Guide d'utilisation

<!-- Section personnalité retirée -->

### 🎤 **Mode vocal automatique**
1. Activez le mode vocal dans le header
2. Parlez naturellement - l'IA écoute en continu
3. L'indicateur flottant montre l'état (écoute/analyse/réponse)
4. Déplacez l'indicateur où vous voulez sur l'écran
5. Réduisez/agrandissez l'indicateur selon vos besoins

### 📱 **Envoi d'images**
- Cliquez sur l'icône image 📷 dans la zone de saisie
- Formats supportés : JPG, PNG, WebP

### 🔒 **Mode privé**
- Activez le bouclier dans le header
- Vos messages ne sont pas sauvegardés
- Tout est effacé à la fermeture
- Banner de notification pour rappel

### 👶 **Mode Enfant**
1. Cliquez sur l’icône bébé pour activer
2. À la première activation, définissez un PIN (≥ 4 chiffres)
3. Pour désactiver, ressaisissez le PIN
4. Option "Changer le PIN (mode enfant)" disponible dans le menu mobile
5. En mode enfant: Mémoire/RAG/Réglages sont masqués et non accessibles

### 📚 **Utiliser le RAG**
1. Activez le mode RAG (icône cerveau)
2. Ajoutez vos documents via « Documents RAG » (TXT/MD/PDF/DOCX/CSV/HTML)
3. Posez vos questions — les passages pertinents sont injectés dans le contexte

### ℹ️ **Informations de conversation**
- Cliquez sur l'icône ℹ️ dans l'en-tête du chat
- Consultez les statistiques détaillées
- Voyez le nombre de messages, contexte RAG, etc.
- Vérifiez la date de début de conversation

---

## 🛠️ Stack technique

| Catégorie | Technologies |
|-----------|-------------|
| **Frontend** | React 18, TypeScript, Vite |
| **UI/UX** | Tailwind CSS, Radix UI, Lucide React |
| **IA** | Google Gemini Pro API, OpenAI (optionnel) |
| **Audio** | Web Speech API (reconnaissance & synthèse) |
| **ML Local** | @xenova/transformers (embeddings) |
| **Données** | LocalStorage |

### Dépendances principales
```json
{
  "react": "^18.3.1",
  "@xenova/transformers": "^2.17.2",
  "lucide-react": "^0.446.0",
  "sonner": "^1.5.0",
  "tailwindcss": "^3.4.13"
}
```

---

## 📂 Architecture du projet

```
src/
├── components/           # Composants React
│   ├── ui/              # Composants UI génériques (Radix)
│   ├── ChatContainer.tsx        # Zone de conversation
│   ├── VoiceInput.tsx          # Saisie vocale/texte
│   ├── VocalModeIndicator.tsx  # Indicateur vocal flottant
│   ├── Header.tsx              # Navigation et actions
│   ├── HistoryModal.tsx        # Gestion historique
│   ├── RagDocsModal.tsx        # Gestion documents RAG
│   ├── MemoryModal.tsx         # Gestion mémoire utilisateur
│   ├── TTSSettingsModal.tsx    # Réglages synthèse vocale
│   ├── PrivateModeBanner.tsx   # Bannière mode privé
│   ├── ChildModeBanner.tsx     # Bannière mode enfant
│   ├── ChildModePinDialog.tsx  # Modale PIN (activer/désactiver)
│   └── ChildModeChangePinDialog.tsx # Modale changement de PIN
├── config/              # Configuration
│   └── (personnalités retirées)
├── hooks/               # Hooks React personnalisés
│   ├── useMemory.ts     # Gestion mémoire utilisateur
│   ├── useSpeechSynthesis.ts # Synthèse vocale
│   ├── useSpeechRecognition.ts # Reconnaissance vocale
│   └── useTheme.ts      # Gestion thème
├── services/            # Services API et utilitaires
│   ├── geminiApi.ts     # API Google Gemini
│   ├── openaiApi.ts     # API OpenAI (optionnelle)
│   ├── geminiSystemPrompt.ts # Prompts système
│   └── ragSearch.ts     # Recherche documentaire
└── lib/                 # Utilitaires
    └── utils.ts         # Fonctions helpers
```

---

## 📱 Compatibilité

### Reconnaissance vocale
- ✅ **Chrome** (toutes versions) - Recommandé
- ✅ **Edge** (toutes versions)
- ✅ **Safari** (iOS 14+, macOS 12+)
- ❌ **Firefox** (limitation du navigateur)

### Synthèse vocale
- ✅ **Tous les navigateurs modernes**
- ✅ **Support mobile complet**
- ✅ **Voix système disponibles**

### Fonctionnalités avancées
- ✅ Embeddings locaux (transformers.js)
- ✅ File API pour l’import de documents
- ✅ LocalStorage pour la persistance (hors mode privé)

---

## 🔒 Sécurité et confidentialité

### 🛡️ **Mesures de sécurité**
- Clé API locale (variable `VITE_GEMINI_API_KEY`)
- Filtres de sécurité activés sur l’API Gemini (safetySettings)
- Mode privé: zéro persistance de la discussion

### 🔐 **Confidentialité**
- Stockage local (historique, mémoire, docs RAG) sur votre appareil
- Pas de serveur applicatif tiers: appels directs à l’API Google
- Suppression simple depuis l’interface
- Transparence: code source ouvert et auditable

---

## 🚨 Dépannage

### **❌ "API key not found"**
```bash
# Vérifiez votre fichier .env.local
cat .env.local
# Doit contenir : VITE_GEMINI_API_KEY=votre_clé

# Relancez le serveur
npm run dev
```

### **❌ Reconnaissance vocale ne fonctionne pas**
- ✅ Utilisez Chrome ou Edge (recommandé)
- ✅ Vérifiez les permissions microphone
- ✅ Testez sur HTTPS en production
- ✅ Vérifiez que le micro n'est pas utilisé ailleurs

### **❌ Synthèse vocale muette**
- ✅ Vérifiez le volume système et navigateur
- ✅ Testez avec le bouton "Test" dans les réglages TTS
- ✅ Changez de voix dans les paramètres
- ✅ Réinitialisez les paramètres TTS si nécessaire

### **❌ Personnalités ne se chargent pas**
- ✅ Vérifiez la console pour les erreurs
- ✅ Rechargez la page
- ✅ Videz le cache navigateur si nécessaire

### **❌ RAG ne trouve pas de documents**
- ✅ Vérifiez que les documents sont bien importés
- ✅ Utilisez des mots-clés précis
- ✅ Essayez avec des documents plus courts
- ✅ Réactivez le mode RAG si nécessaire

### **❌ L'indicateur vocal ne répond pas**
- ✅ Vérifiez que le mode vocal auto est activé
- ✅ Testez sans mode privé activé
- ✅ Repositionnez l'indicateur si nécessaire
- ✅ Rechargez la page pour réinitialiser

---

## 🔧 Scripts de développement

```bash
# Développement avec hot-reload
npm run dev

# Build optimisé pour production
npm run build

# Prévisualisation du build
npm run preview

# Analyse du code (ESLint)
npm run lint

# Vérification TypeScript
npx tsc --noEmit
```

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

### 1. **Préparer l'environnement**
```bash
git clone https://github.com/votre-username/neurochat.git
cd neurochat
npm install
```

### 2. **Créer une branche**
```bash
git checkout -b feature/ma-nouvelle-fonctionnalite
```

### 3. **Développer et tester**
```bash
npm run dev
# Développez votre fonctionnalité
npm run lint
```

### 4. **Proposer vos changements**
```bash
git add .
git commit -m "feat: ajouter ma nouvelle fonctionnalité"
git push origin feature/ma-nouvelle-fonctionnalite
```

### 5. **Créer une Pull Request**
- Décrivez clairement vos changements
- Ajoutez des captures d'écran si pertinent
- Mentionnez les issues liées

---

## 📈 Roadmap (idées)

- Personnalités personnalisées
- PWA et offline étendu
- Export avancé des conversations (PDF/Markdown)
- Raccourcis clavier
- Partage de conversations

---

## 📸 Captures d'écran

> À compléter avec vos captures: interface principale, mode vocal, mémoire, RAG, mode privé

---

## 🙏 Remerciements

Un grand merci aux projets open source qui rendent NeuroChat possible :

- **[Google Gemini Pro](https://ai.google.dev/)** - L'intelligence artificielle qui alimente les conversations
- **[Radix UI](https://radix-ui.com/)** - Composants accessibles et primitives UI
- **[Lucide React](https://lucide.dev/)** - Icônes modernes et cohérentes
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utilitaire
- **[Vite](https://vitejs.dev/)** - Outil de build ultra-rapide
- **[Xenova/transformers](https://huggingface.co/docs/transformers.js/)** - ML dans le navigateur
- **[React](https://reactjs.org/)** - Bibliothèque UI moderne

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 📞 Support

- Ouvrez une issue sur le dépôt GitHub du projet

---

<div align="center">

**NeuroChat** - L'avenir de la conversation avec l'IA 🚀

![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/react-18.3.1-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.5.3-blue.svg)

</div>
