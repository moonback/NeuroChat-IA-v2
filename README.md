# 🧠 NeuroChat

> Application de chat IA moderne et intuitive avec personnalités multiples, reconnaissance vocale et analyse sémantique

**NeuroChat** révolutionne votre façon d'interagir avec l'intelligence artificielle en combinant chat textuel, reconnaissance vocale, analyse d'images et personnalités IA dans une interface élégante et responsive. Choisissez parmi 12 personnalités différentes et communiquez naturellement avec l'IA !

## ✨ Fonctionnalités principales

### 🎭 **Système de personnalités IA (NOUVEAU !)**
- **12 personnalités uniques** réparties en 4 catégories :
  - **Professionnel** : Formel, Expert, Consultant
  - **Social** : Amical, Motivateur, Coach, Décontracté
  - **Créatif** : Humoristique, Créatif, Artiste, Gamer
  - **Expert** : Professeur
- **Interface de sélection moderne** avec filtres par catégorie
- **Aperçu détaillé** avec traits de personnalité et descriptions
- **Changement en temps réel** du style de communication

### 🗣️ **Communication vocale avancée**
- **Mode vocal automatique** : conversation continue mains-libres
- **Reconnaissance vocale** en français (Web Speech API)
- **Synthèse vocale** personnalisable (vitesse, tonalité, volume)
- **Indicateur vocal flottant** avec transcription en temps réel
- **Contrôles audio intuitifs** (mute/unmute rapide)

### 💬 **Chat intelligent et intuitif**
- **Interface conversationnelle** fluide avec animations
- **Support d'images** : analyse IA complète de vos images
- **Mémoire utilisateur** : l'IA se souvient de vos préférences
- **Auto-détection d'informations** personnelles pour personnalisation
- **Sélection multiple** de messages avec suppression groupée

### 📚 **RAG (Recherche Augmentée)**
- **Gestion de documents** : PDF, TXT, MD, DOCX, CSV
- **Recherche sémantique** avec analyse d'embeddings
- **Glisser-déposer** pour l'ajout de documents
- **Activation/désactivation** dynamique du mode RAG

### 🛡️ **Mode privé et sécurité**
- **Mode éphémère** : aucune sauvegarde locale
- **Chiffrement** des données sensibles
- **Auto-suppression** à la fermeture
- **Indicateurs visuels** du mode sécurisé

### ⚙️ **Configuration avancée**
- **Hyperparamètres Gemini** : température, topK, topP, tokens
- **Réglages TTS complets** : export/import des paramètres
- **Thème clair/sombre** avec basculement instantané
- **Interface responsive** optimisée mobile/desktop

### 📊 **Gestion des données**
- **Historique complet** avec recherche et tri
- **Renommage** des conversations
- **Export/import** des réglages
- **Stockage local sécurisé**

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

### 🎭 **Choisir une personnalité**
1. Cliquez sur le bouton de personnalité dans le header
2. Parcourez les 4 catégories ou utilisez "Toutes"
3. Activez "Afficher les détails" pour voir les traits
4. Sélectionnez votre personnalité préférée

### 🎤 **Mode vocal automatique**
1. Activez le mode vocal dans le header
2. Parlez naturellement - l'IA écoute en continu
3. L'indicateur flottant montre l'état (écoute/analyse/réponse)
4. Déplacez l'indicateur où vous voulez sur l'écran

### 📱 **Envoi d'images**
- Cliquez sur l'icône trombone 📎 dans la zone de saisie
- Glissez-déposez une image directement
- Formats supportés : JPG, PNG, GIF, WebP

### 🔒 **Mode privé**
- Activez le bouclier dans le header
- Vos messages ne sont pas sauvegardés
- Tout est effacé à la fermeture

### 📚 **Utiliser le RAG**
1. Activez le mode RAG (icône cerveau)
2. Ajoutez vos documents via "Documents RAG"
3. Posez des questions sur vos documents
4. L'IA utilise automatiquement le contexte

---

## 🛠️ Stack technique

| Catégorie | Technologies |
|-----------|-------------|
| **Frontend** | React 18, TypeScript, Vite |
| **UI/UX** | Tailwind CSS, Radix UI, Lucide React |
| **IA** | Google Gemini Pro API |
| **Audio** | Web Speech API (reconnaissance & synthèse) |
| **ML Local** | @xenova/transformers (embeddings) |
| **Données** | LocalStorage, IndexedDB |

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
│   ├── PersonalitySelector.tsx  # Sélecteur de personnalités
│   ├── ChatContainer.tsx        # Zone de conversation
│   ├── VoiceInput.tsx          # Saisie vocale/texte
│   ├── VocalModeIndicator.tsx  # Indicateur vocal flottant
│   ├── Header.tsx              # Navigation et actions
│   ├── HistoryModal.tsx        # Gestion historique
│   ├── RagDocsModal.tsx        # Gestion documents RAG
│   ├── MemoryModal.tsx         # Gestion mémoire utilisateur
│   └── TTSSettingsModal.tsx    # Réglages synthèse vocale
├── config/              # Configuration
│   └── personalities.ts # Définition des personnalités
├── hooks/               # Hooks React personnalisés
│   ├── useMemory.ts     # Gestion mémoire utilisateur
│   ├── useSpeechSynthesis.ts # Synthèse vocale
│   ├── useSpeechRecognition.ts # Reconnaissance vocale
│   └── useTheme.ts      # Gestion thème
├── services/            # Services API et utilitaires
│   ├── geminiApi.ts     # API Google Gemini
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
- ✅ **Web Workers** pour les embeddings
- ✅ **File API** pour les documents
- ✅ **LocalStorage** pour la persistance

---

## 🔒 Sécurité et confidentialité

### 🛡️ **Mesures de sécurité**
- **Clé API locale** : stockée uniquement dans votre navigateur
- **Chiffrement** des données sensibles en localStorage
- **Validation** des entrées utilisateur
- **Filtres de sécurité** activés sur l'API Gemini
- **Mode privé** : zéro persistance des données

### 🔐 **Confidentialité**
- **Stockage local uniquement** : vos données restent sur votre appareil
- **Pas de serveur tiers** : communication directe avec Google
- **Suppression facile** : effacez tout depuis l'interface
- **Transparence** : code source ouvert et auditable

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

## 📈 Roadmap

### 🎯 **Prochaines fonctionnalités**
- [ ] **Personnalités personnalisées** : créez vos propres personnalités
- [ ] **Plugins** : système extensible pour nouvelles fonctionnalités
- [ ] **Collaboration** : partage de conversations en temps réel
- [ ] **Export avancé** : PDF, Markdown, Word
- [ ] **Traduction automatique** : support multilingue
- [ ] **IA locale** : support de modèles locaux (Llama, etc.)

### 🔧 **Améliorations techniques**
- [ ] **PWA** : installation comme application native
- [ ] **Sync cloud** : sauvegarde optionnelle chiffrée
- [ ] **Performance** : optimisations WebAssembly
- [ ] **Tests** : couverture complète E2E
- [ ] **Docker** : containerisation pour déploiement

### 🎨 **UX/UI**
- [ ] **Thèmes personnalisés** : éditeur visuel
- [ ] **Animations avancées** : transitions fluides
- [ ] **Accessibilité** : support complet WCAG 2.1
- [ ] **Raccourcis clavier** : navigation rapide

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

- 🐛 **Bugs** : [Ouvrir une issue](https://github.com/votre-username/neurochat/issues)
- 💡 **Suggestions** : [Discussions](https://github.com/votre-username/neurochat/discussions)
- 📧 **Contact** : votre.email@example.com

---

<div align="center">

**NeuroChat** - L'avenir de la conversation avec l'IA 🚀

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/react-18.3.1-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.5.3-blue.svg)

</div>
