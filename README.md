# 🧠 NeuroChat

Une application React moderne pour discuter avec l'IA Gemini Pro de Google, en texte, en voix **et en images**, avec une interface élégante, compacte et responsive.

---

## ✨ Fonctionnalités principales

- 🎤 **Reconnaissance vocale** (Web Speech API)
- 🗣️ **Synthèse vocale** (voix Google FR par défaut)
- 💬 **Chat en temps réel** (interface fluide, bulles, auto-scroll)
- 🖼️ **Envoi d'images** dans le chat (analyse et réponse IA sur l'image)
- 🎭 **Personnalité IA personnalisable** (formel, amical, expert, humoristique)
- 📝 **Renommage des discussions** dans l'historique
- ✅ **Sélection et suppression groupée** de discussions dans l'historique
- 🌗 **Thème clair/sombre** (toggle rapide)
- ⚡ **Actions rapides** : nouvelle discussion, historique, réglages TTS, mute/unmute
- 📱 **Design responsive** (mobile & desktop)
- 🔒 **Respect de la vie privée** (aucune donnée stockée côté serveur)

---

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- Une clé API Google Gemini ([obtenir ici](https://makersuite.google.com/app/apikey))

### Installation
```bash
npm install
```

### Configuration
1. Copier `.env.local.example` → `.env.local`
2. Renseigner votre clé API Gemini :
   ```env
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

### Lancer le projet
```bash
npm run dev
```

Ouvrez [http://localhost:5173](http://localhost:5173) dans votre navigateur.

---

## 🖥️ Aperçu de l'interface

- **Header compact** : logo, actions rapides (nouvelle discussion, historique, thème, mute, réglages TTS, personnalité IA)
- **Zone de chat** : messages IA/utilisateur, bulles animées, copier/liker, timestamps, **affichage d'images envoyées**
- **Input** : texte, voix, **envoi d'images** (icône trombone), suggestions rapides, bouton micro
- **Modals** : historique (avec renommage, sélection multiple, suppression groupée), réglages TTS (import/export, test voix, reset)

---

## 🎯 Utilisation

- Tapez un message ou utilisez le micro
- Cliquez sur l'icône trombone pour envoyer une image à l'IA
- Changez de thème à la volée
- Choisissez la personnalité de l'IA dans le menu du haut (formel, amical, expert, humoristique)
- Accédez à l'historique, renommez ou supprimez plusieurs discussions en une fois
- Réglez la synthèse vocale (voix, vitesse, tonalité, volume)
- Mute/unmute la voix d'un clic

---

## 🛠️ Stack technique

- **React 18 + TypeScript + Vite**
- **Tailwind CSS** + shadcn/ui
- **Lucide React** (icônes)
- **Google Gemini Pro** (API IA)
- **Web Speech API** (reconnaissance & synthèse vocale)

---

## 📱 Compatibilité navigateur

- **Reconnaissance vocale** : Chrome, Edge, Safari (iOS 14+)
- **Synthèse vocale** : tous navigateurs modernes
- **Interface** : responsive, mobile & desktop

---

## 🔧 Scripts disponibles

- `npm run dev` – Démarrage en mode développement
- `npm run build` – Build production
- `npm run preview` – Prévisualisation du build
- `npm run lint` – Lint du code

---

## 📂 Structure du projet

```
src/
├── components/      # UI réutilisables (Header, ChatContainer, VoiceInput...)
│   └── ui/          # Composants UI génériques (boutons, cartes, etc.)
├── hooks/           # Hooks React custom (useTheme, useSpeechSynthesis...)
├── services/        # Appels API Gemini
└── App.tsx          # Composant principal
```

---

## 🔒 Vie privée & sécurité

- La clé API reste locale (jamais envoyée ailleurs que vers l'API Google)
- Reconnaissance vocale traitée localement
- Aucune donnée de conversation stockée côté serveur
- Filtres de sécurité activés sur l'API Gemini

---

## 🚨 Dépannage

- **Erreur "API key not found"** : vérifiez `.env.local` et relancez le serveur
- **Reconnaissance vocale KO** : testez sur Chrome/Edge, vérifiez les permissions micro
- **Pas de son** : vérifiez le volume, testez le bouton "Tester la voix" dans les réglages TTS

---

## 🙏 Remerciements

- Google Gemini Pro
- shadcn/ui
- Lucide
- Tailwind CSS

---

## 📄 Licence

MIT