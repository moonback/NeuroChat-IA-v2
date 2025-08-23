# 🎙️ Configuration ElevenLabs TTS - NeuroChat-IA-v2

## Vue d'ensemble

Ce guide vous explique comment configurer ElevenLabs TTS pour remplacer le TTS natif du navigateur dans NeuroChat-IA-v2. ElevenLabs offre une qualité vocale exceptionnelle avec des voix naturelles et des paramètres avancés.

## 🚀 Avantages d'ElevenLabs

- **Qualité professionnelle** : Voix naturelles et expressives
- **Support multilingue** : Français, anglais et plus de 20 langues
- **Paramètres avancés** : Stabilité, similarité, style, speaker boost
- **Voix personnalisées** : Possibilité de créer vos propres voix
- **Performance optimisée** : Latence réduite et cache intelligent

## 📋 Prérequis

1. **Compte ElevenLabs** : Créez un compte sur [elevenlabs.io](https://elevenlabs.io/)
2. **Clé API** : Obtenez votre clé API depuis votre profil
3. **Crédits** : ElevenLabs offre des crédits gratuits mensuels

## ⚙️ Configuration

### 1. Créer un compte ElevenLabs

1. Allez sur [elevenlabs.io](https://elevenlabs.io/)
2. Cliquez sur "Sign Up" et créez votre compte
3. Vérifiez votre email

### 2. Obtenir votre clé API

1. Connectez-vous à votre compte ElevenLabs
2. Allez dans votre profil (icône utilisateur en haut à droite)
3. Cliquez sur "API Key"
4. Copiez votre clé API

### 3. Configurer l'environnement

Créez un fichier `.env` à la racine de votre projet avec :

```bash
# ElevenLabs TTS API
VITE_ELEVENLABS_API_KEY=votre_cle_api_ici
```

### 4. Redémarrer l'application

Après avoir ajouté la clé API, redémarrez votre application :

```bash
npm run dev
```

## 🎯 Utilisation

### Interface des paramètres

L'interface ElevenLabs TTS est accessible via :
- **Header** → Bouton TTS (icône microphone)
- **Paramètres** → Onglet TTS

### Onglets disponibles

#### 1. **Voix** 🎤
- Sélection de la voix principale
- Choix du modèle de synthèse
- Voix populaires par langue (FR/EN)

#### 2. **Paramètres** ⚙️
- **Stabilité** : Contrôle la cohérence de la voix
- **Similarité** : Fidélité à la voix originale
- **Style** : Expressivité et émotion
- **Speaker Boost** : Amélioration de la clarté

#### 3. **Avancé** 🔧
- Format de sortie audio
- Actions de maintenance
- Rafraîchissement des données

## 🎵 Voix recommandées

### Voix françaises
- **Antoine** : Voix masculine claire et professionnelle
- **Marie** : Voix féminine chaleureuse et expressive
- **Pierre** : Voix masculine jeune et dynamique

### Voix anglaises
- **Rachel** : Voix féminine claire et professionnelle
- **Domi** : Voix féminine jeune et énergique
- **Bella** : Voix féminine douce et mélodique

## 🔧 Paramètres optimaux

### Pour le français
```json
{
  "stability": 0.6,
  "similarity_boost": 0.8,
  "style": 0.1,
  "use_speaker_boost": true
}
```

### Pour l'anglais
```json
{
  "stability": 0.5,
  "similarity_boost": 0.75,
  "style": 0.0,
  "use_speaker_boost": true
}
```

## 💰 Coûts et limites

### Plan gratuit
- **10,000 caractères/mois** : Suffisant pour des tests
- **Voix de base** : Qualité correcte
- **Support communautaire**

### Plans payants
- **Starter** : $22/mois - 30,000 caractères
- **Creator** : $99/mois - 250,000 caractères
- **Independent Publisher** : $330/mois - 1,000,000 caractères

## 🚨 Dépannage

### Erreur "API Key invalide"
1. Vérifiez que votre clé API est correcte
2. Assurez-vous que votre compte est actif
3. Vérifiez vos crédits disponibles

### Fallback vers TTS natif
Si ElevenLabs n'est pas disponible, l'application utilise automatiquement le TTS natif du navigateur.

### Problèmes de performance
1. Vérifiez votre connexion internet
2. Utilisez des formats audio moins gourmands
3. Activez le cache des voix

## 🔄 Migration depuis l'ancien TTS

### Données sauvegardées
- Tous vos réglages sont automatiquement migrés
- Les préférences de voix sont conservées
- L'historique des conversations reste intact

### Nouveaux paramètres
- **Stabilité** : Remplace la vitesse de lecture
- **Similarité** : Nouveau paramètre de qualité
- **Style** : Contrôle l'expressivité
- **Speaker Boost** : Amélioration de la clarté

## 📱 Support mobile

ElevenLabs TTS fonctionne parfaitement sur mobile avec :
- Interface responsive adaptée
- Optimisation des performances
- Gestion de la batterie
- Support des écouteurs

## 🌐 Support multilingue

### Langues supportées
- **Français** : Voix natives et optimisées
- **Anglais** : Large sélection de voix
- **Espagnol** : Voix latines authentiques
- **Allemand** : Voix germaniques précises
- **Italien** : Voix méditerranéennes chaleureuses

### Détection automatique
L'application détecte automatiquement la langue du texte et optimise les paramètres en conséquence.

## 🔒 Sécurité

- **Clé API** : Stockée localement uniquement
- **Chiffrement** : Toutes les communications sont chiffrées
- **Confidentialité** : Aucune donnée n'est partagée avec ElevenLabs
- **Contrôle** : Vous gardez le contrôle total de vos données

## 📞 Support

### Documentation officielle
- [ElevenLabs Docs](https://docs.elevenlabs.io/)
- [API Reference](https://docs.elevenlabs.io/api-reference)
- [Voice Library](https://elevenlabs.io/voice-library)

### Communauté
- [Discord ElevenLabs](https://discord.gg/elevenlabs)
- [Reddit r/ElevenLabs](https://reddit.com/r/ElevenLabs)
- [GitHub Issues](https://github.com/elevenlabs/elevenlabs-python/issues)

---

**🎙️ Profitez de la qualité vocale professionnelle d'ElevenLabs dans NeuroChat-IA-v2 !**
