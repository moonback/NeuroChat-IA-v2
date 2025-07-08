# 🧠 NeuroChat

> Une application React moderne et intuitive pour converser avec l'IA Gemini Pro de Google

**NeuroChat** révolutionne votre façon d'interagir avec l'intelligence artificielle en combinant chat textuel, reconnaissance vocale et analyse d'images dans une interface élégante et responsive. Que vous préfériez taper, parler ou montrer, NeuroChat s'adapte à votre style de communication.

## 🎯 Pourquoi NeuroChat ?

- **🎪 Multimodal** : Texte, voix, images - communiquez comme vous le souhaitez
- **🎭 Personnalisable** : Choisissez la personnalité de votre IA (formel, amical, expert, humoristique)
- **🚀 Moderne** : Interface fluide avec animations et design responsive
- **🔒 Sécurisé** : Vos données restent privées, aucun stockage serveur
- **📱 Universel** : Fonctionne parfaitement sur mobile et desktop

---

## ✨ Fonctionnalités

### 🗣️ Communication vocale
- **Reconnaissance vocale** avancée (Web Speech API)
- **Synthèse vocale** personnalisable (voix, vitesse, tonalité)
- **Contrôles audio** intuitifs (mute/unmute rapide)

### 💬 Chat intelligent
- **Interface conversationnelle** fluide avec bulles animées
- **Auto-scroll** et timestamps pour une navigation facile
- **Actions rapides** : copier, liker, nouvelle discussion

### 🖼️ Analyse d'images
- **Envoi d'images** par glisser-déposer ou sélection
- **Analyse IA** complète de vos images
- **Affichage intégré** dans l'historique des conversations

### 🎭 Personnalité IA
- **4 modes** : Formel, Amical, Expert, Humoristique
- **Adaptation automatique** du style de réponse
- **Changement à la volée** selon vos besoins

### 📚 Gestion avancée
- **Historique complet** avec recherche et tri
- **Renommage** des conversations
- **Suppression groupée** avec sélection multiple
- **RAG (Recherche Augmentée)** pour interroger vos documents PDF/textes

### 🎨 Expérience utilisateur
- **Thème clair/sombre** avec basculement instantané
- **Design responsive** optimisé pour tous les écrans
- **Suggestions rapides** pour démarrer la conversation

---

## 🚀 Installation

### Prérequis
- **Node.js** 18 ou supérieur
- **Clé API Google Gemini** ([Obtenir gratuitement](https://makersuite.google.com/app/apikey))

### Configuration en 3 étapes

1. **Cloner et installer**
   ```bash
   git clone https://github.com/votre-username/neurochat.git
   cd neurochat
   npm install
   ```

2. **Configurer l'API**
   ```bash
   cp .env.local.example .env.local
   ```
   Éditez `.env.local` :
   ```env
   VITE_GEMINI_API_KEY=votre_clé_api_gemini
   ```

3. **Lancer l'application**
   ```bash
   npm run dev
   ```

🎉 **C'est prêt !** Ouvrez [http://localhost:5173](http://localhost:5173)

---

## 📖 Guide d'utilisation

### 💬 Première conversation
1. Tapez votre message ou cliquez sur le **micro** pour parler
2. Sélectionnez la **personnalité IA** dans le menu du haut
3. Envoyez une **image** en cliquant sur l'icône trombone 📎

### 🎛️ Personnalisation
- **Thème** : Basculez entre clair/sombre d'un clic
- **Voix** : Ajustez vitesse, tonalité et volume dans les réglages TTS
- **Personnalité** : Changez le style de réponse de l'IA instantanément

### 📚 Gestion des conversations
- **Historique** : Accédez à toutes vos discussions passées
- **Renommage** : Donnez des noms personnalisés à vos conversations
- **Suppression** : Sélectionnez et supprimez plusieurs discussions en une fois

---

## 🛠️ Stack technique

| Catégorie | Technologies |
|-----------|-------------|
| **Frontend** | React 18, TypeScript, Vite |
| **UI/UX** | Tailwind CSS, shadcn/ui, Lucide React |
| **IA** | Google Gemini Pro API |
| **Audio** | Web Speech API (reconnaissance & synthèse) |

---

## 📱 Compatibilité

### Reconnaissance vocale
- ✅ Chrome (toutes versions)
- ✅ Edge (toutes versions)
- ✅ Safari (iOS 14+, macOS 12+)
- ❌ Firefox (limitation du navigateur)

### Synthèse vocale
- ✅ Tous les navigateurs modernes
- ✅ Support mobile complet

---

## 🔧 Scripts de développement

```bash
# Développement
npm run dev          # Serveur de développement avec hot-reload

# Production
npm run build        # Build optimisé pour production
npm run preview      # Prévisualisation du build

# Qualité
npm run lint         # Analyse du code
npm run type-check   # Vérification TypeScript
```

---

## 📂 Architecture

```
src/
├── components/           # Composants React réutilisables
│   ├── ui/              # Composants UI génériques (Button, Card...)
│   ├── Header.tsx       # Barre de navigation et actions
│   ├── ChatContainer.tsx # Zone de conversation principale
│   ├── VoiceInput.tsx   # Gestion de l'entrée vocale
│   └── ImageUpload.tsx  # Composant d'envoi d'images
├── hooks/               # Hooks React personnalisés
│   ├── useTheme.ts      # Gestion du thème clair/sombre
│   ├── useSpeechSynthesis.ts # Synthèse vocale
│   └── useLocalStorage.ts    # Persistance locale
├── services/            # Services externes
│   ├── gemini.ts        # API Google Gemini
│   └── storage.ts       # Gestion du stockage local
├── types/               # Définitions TypeScript
└── utils/               # Fonctions utilitaires
```

---

## 🔒 Sécurité et confidentialité

### 🛡️ Mesures de sécurité
- **Clé API locale** : Jamais transmise ailleurs que vers l'API Google
- **Filtres de sécurité** activés sur l'API Gemini
- **Validation des entrées** côté client
- **Pas de tracking** ou d'analytics intrusifs

### 🔐 Confidentialité
- **Stockage local uniquement** : Vos conversations restent sur votre appareil
- **Pas de serveur tiers** : Communication directe avec l'API Google
- **Suppression facile** : Effacez vos données quand vous voulez

---

## 🚨 Résolution de problèmes

### Problèmes courants

**❌ "API key not found"**
```bash
# Vérifiez votre fichier .env.local
cat .env.local
# Relancez le serveur de développement
npm run dev
```

**❌ Reconnaissance vocale ne fonctionne pas**
- Utilisez Chrome ou Edge
- Vérifiez les permissions microphone
- Testez sur HTTPS en production

**❌ Pas de synthèse vocale**
- Vérifiez le volume système
- Testez avec le bouton "Tester la voix" dans les réglages
- Réinitialisez les paramètres TTS si nécessaire

**❌ Images non supportées**
- Formats supportés : JPG, PNG, GIF, WebP
- Taille maximale : 10MB
- Vérifiez votre connexion internet

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez notre [guide de contribution](CONTRIBUTING.md) pour commencer.

### Étapes pour contribuer
1. **Fork** le projet
2. **Créez** une branche pour votre fonctionnalité
3. **Commitez** vos changements
4. **Poussez** vers la branche
5. **Ouvrez** une Pull Request

---

## 📈 Roadmap

- [ ] **Support de plus de langues** (reconnaissance vocale)
- [ ] **Plugins** pour étendre les fonctionnalités
- [ ] **Thèmes personnalisés** avec éditeur intégré
- [ ] **Export** des conversations (PDF, Markdown)
- [ ] **Mode hors ligne** avec IA locale
- [ ] **Collaboration** temps réel

---

## 🙏 Remerciements

Un grand merci aux projets open source qui rendent NeuroChat possible :

- **[Google Gemini Pro](https://ai.google.dev/)** - L'intelligence artificielle qui alimente les conversations
- **[shadcn/ui](https://ui.shadcn.com/)** - Composants UI élégants et accessibles
- **[Lucide](https://lucide.dev/)** - Icônes modernes et cohérentes
- **[Tailwind CSS](https://tailwindcss.com/)** - Framework CSS utilitaire
- **[Vite](https://vitejs.dev/)** - Outil de build ultra-rapide

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

## 🌟 Vous aimez NeuroChat ?

- ⭐ **Star** le projet sur GitHub
- 🐛 **Signalez** les bugs dans les issues
- 💡 **Partagez** vos idées d'amélioration
- 📢 **Parlez-en** autour de vous

---

<div align="center">
  <p>Développé avec ❤️ par [Votre nom]</p>
  <p>
    <a href="https://github.com/votre-username/neurochat">GitHub</a> •
    <a href="https://neurochat-demo.vercel.app">Démo live</a> •
    <a href="mailto:contact@neurochat.dev">Contact</a>
  </p>
</div>
