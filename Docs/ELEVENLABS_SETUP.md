# 🎙️ Configuration ElevenLabs TTS - Guide Complet

## 📋 Vue d'ensemble

Ce guide vous explique comment configurer et utiliser la synthèse vocale ElevenLabs dans NeuroChat-IA-v2. ElevenLabs offre une qualité vocale exceptionnelle avec des voix naturelles et des paramètres avancés.

## 🔑 Configuration de la clé API

### Méthode 1 : Interface utilisateur (Recommandée)

1. **Ouvrez les paramètres TTS** :
   - Cliquez sur l'icône TTS dans l'en-tête de l'application
   - Ou utilisez le raccourci clavier configuré

2. **Configurez votre clé API** :
   - Dans la section "Configuration API ElevenLabs"
   - Entrez votre clé API dans le champ de saisie
   - Utilisez l'icône œil pour afficher/masquer la clé
   - Cliquez sur "Sauvegarder la clé API"

3. **Redémarrage automatique** :
   - L'application se recharge automatiquement après la sauvegarde
   - Votre clé API est maintenant active

### Méthode 2 : Variables d'environnement

1. **Créez/modifiez le fichier `.env`** :
   ```bash
   VITE_ELEVENLABS_API_KEY=votre_cle_api_ici
   ```

2. **Redémarrez l'application** :
   ```bash
   npm run dev
   ```

## 🌐 Obtention de votre clé API

### Étapes détaillées :

1. **Créez un compte** sur [elevenlabs.io](https://elevenlabs.io/)
2. **Connectez-vous** à votre compte
3. **Accédez à votre profil** :
   - Cliquez sur votre avatar en haut à droite
   - Sélectionnez "Profile Settings"
4. **Générez une clé API** :
   - Allez dans l'onglet "API Key"
   - Cliquez sur "Generate New Key"
   - Copiez la clé générée
5. **Collez la clé** dans l'interface NeuroChat

## ⚙️ Paramètres avancés

### Onglet Voix
- **Sélection de voix** : Choisissez parmi des centaines de voix disponibles
- **Modèles de synthèse** : Différents niveaux de qualité et de latence
- **Voix populaires** : Accès rapide aux voix françaises et anglaises

### Onglet Paramètres
- **Stabilité** (0.0 - 1.0) : Contrôle la cohérence de la voix
- **Similarité** (0.0 - 1.0) : Fidélité à la voix originale
- **Style** (0.0 - 1.0) : Expressivité et émotion
- **Speaker Boost** : Améliore la clarté et la définition

### Onglet Avancé
- **Format de sortie** : Qualité audio et taille des fichiers
- **Maintenance** : Rafraîchissement des données et cache

## 🎯 Fonctionnalités principales

### ✅ Ce qui fonctionne :
- **Synthèse vocale professionnelle** avec ElevenLabs
- **Fallback automatique** vers le TTS natif si nécessaire
- **Cache intelligent** des voix et modèles
- **Optimisation automatique** selon la langue détectée
- **Interface moderne** et intuitive

### 🔄 Fallback automatique :
Si ElevenLabs n'est pas disponible (clé invalide, erreur réseau, etc.), l'application utilise automatiquement le TTS natif du navigateur.

## 🚨 Résolution des problèmes

### Erreur 401 (Unauthorized)
- **Cause** : Clé API invalide ou expirée
- **Solution** : Vérifiez votre clé dans l'interface ou régénérez-la sur ElevenLabs

### Pas de voix disponibles
- **Cause** : Clé API non configurée ou erreur de connexion
- **Solution** : Vérifiez votre connexion internet et votre clé API

### Qualité audio médiocre
- **Cause** : Paramètres de qualité trop bas
- **Solution** : Ajustez la stabilité, similarité et style dans l'onglet Paramètres

### Latence élevée
- **Cause** : Modèle de synthèse trop lourd
- **Solution** : Choisissez un modèle plus rapide dans l'onglet Voix

## 📱 Utilisation mobile

L'interface est entièrement responsive et fonctionne parfaitement sur mobile :
- **Drawer adaptatif** pour les petits écrans
- **Navigation tactile** optimisée
- **Paramètres accessibles** sur tous les appareils

## 🔒 Sécurité

- **Clé API masquée** par défaut dans l'interface
- **Stockage local** sécurisé dans le navigateur
- **Validation automatique** de la clé API
- **Aucune transmission** de la clé vers des serveurs tiers

## 💡 Conseils d'utilisation

### Pour une qualité optimale :
1. **Utilisez des modèles récents** (eleven_multilingual_v2)
2. **Ajustez la stabilité** selon vos besoins (0.5-0.7 recommandé)
3. **Activez Speaker Boost** pour une meilleure clarté
4. **Testez régulièrement** avec le bouton "Tester la voix"

### Pour les performances :
1. **Choisissez des formats audio** adaptés à votre usage
2. **Utilisez le cache** pour éviter les rechargements
3. **Rafraîchissez les données** périodiquement

## 📞 Support

Si vous rencontrez des problèmes :
1. **Vérifiez la console** du navigateur pour les erreurs
2. **Testez votre clé API** sur le site ElevenLabs
3. **Consultez la documentation** ElevenLabs officielle
4. **Contactez le support** ElevenLabs si nécessaire

---

*Ce guide est maintenu à jour avec les nouvelles fonctionnalités. Dernière mise à jour : Décembre 2024*
