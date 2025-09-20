# 🎨 Génération d'Images IA avec Hugging Face

## Vue d'ensemble

NeuroChat-IA-v2 intègre maintenant la génération d'images via l'API Hugging Face, permettant de créer des images de haute qualité directement depuis le chat.

## 🚀 Fonctionnalités

### Modèles Supportés
- **Stable Diffusion XL** - Modèle haute qualité pour images détaillées
- **Stable Diffusion 1.5** - Modèle rapide et efficace
- **Stable Diffusion 1.4** - Version classique très stable
- **Stable Diffusion 2.1** - Version améliorée avec meilleurs résultats

### Types de Génération
- **Réaliste** - Images photoréalistes
- **Portrait** - Portraits et visages
- **Paysage** - Scènes naturelles et urbaines
- **Artistique** - Créations artistiques et stylisées

### Paramètres Avancés
- **Dimensions** : 256x256 à 1024x1024 pixels
- **Qualité** : 10-50 étapes d'inférence
- **Cohérence** : Guidance scale 1-20
- **Prompt négatif** : Exclusion d'éléments indésirables
- **Seed** : Reproducibilité des résultats

## 🔧 Configuration

### 1. Clé API Hugging Face

Obtenez votre clé API gratuite sur [Hugging Face](https://huggingface.co/settings/tokens) :

```bash
# Ajoutez dans votre fichier .env
VITE_HUGGINGFACE_API_KEY=your_huggingface_api_key_here
```

### 2. Installation des Dépendances

Aucune dépendance supplémentaire requise - utilise l'API REST native.

## 📱 Utilisation

### Interface Utilisateur

1. **Bouton de génération** : Cliquez sur l'icône 🎨 dans la barre d'outils
2. **Modal de génération** : Interface complète avec tous les paramètres
3. **Aperçu en temps réel** : Visualisation des images générées
4. **Actions rapides** : Utiliser, télécharger, copier le prompt

### Intégration Chat

Les images générées sont automatiquement ajoutées à la conversation avec :
- Message utilisateur avec l'image
- Réponse IA commentant l'image
- Métadonnées de génération (modèle, temps, paramètres)

## 🎯 Exemples de Prompts

### Portraits
```
"Portrait d'une femme souriante, photorealistic, studio lighting, high quality"
```

### Paysages
```
"Sunset over mountains, golden hour, cinematic lighting, 4K"
```

### Artistique
```
"Abstract painting, vibrant colors, digital art, modern style"
```

### Réaliste
```
"Modern kitchen interior, natural lighting, architectural photography"
```

## ⚡ Performance

### Temps de Génération
- **SD 1.5** : ~8 secondes
- **SD 2.1** : ~12 secondes  
- **SD XL** : ~15 secondes

### Optimisations
- Génération asynchrone avec polling
- Cache des images générées
- Gestion des erreurs et fallbacks
- Génération multiple en parallèle (max 4)

## 🔒 Sécurité

### Protection des Données
- Aucune donnée stockée côté serveur
- Images générées en local uniquement
- Clés API sécurisées via variables d'environnement

### Limitations
- Quota API Hugging Face (gratuit)
- Validation des prompts (max 500 caractères)
- Limitation des dimensions (max 1024x1024)

## 🛠️ Développement

### Structure du Code

```
src/
├── services/
│   └── huggingFaceApi.ts          # Service API Hugging Face
├── components/
│   ├── ImageGenerationModal.tsx   # Modal de génération
│   ├── MessageBubble.tsx          # Affichage des images
│   └── Header.tsx                 # Bouton d'accès
└── App.tsx                        # Intégration principale
```

### API Service

```typescript
// Génération d'une image
const result = await generateImage({
  prompt: "A beautiful landscape",
  config: {
    model: "stabilityai/stable-diffusion-xl-base-1.0",
    width: 512,
    height: 512,
    numInferenceSteps: 20,
    guidanceScale: 7.5
  }
});
```

### Types TypeScript

```typescript
interface ImageGenerationResponse {
  imageUrl: string;
  model: string;
  prompt: string;
  generationTime: number;
  metadata?: {
    seed?: number;
    steps?: number;
    guidance?: number;
  };
}
```

## 🐛 Dépannage

### Erreurs Courantes

1. **Clé API manquante**
   ```
   Error: Clé API Hugging Face manquante
   ```
   Solution : Ajouter `VITE_HUGGINGFACE_API_KEY` dans `.env`

2. **Quota dépassé**
   ```
   Error: Quota API Hugging Face dépassé
   ```
   Solution : Attendre le reset du quota ou passer à un plan payant

3. **Modèle non disponible**
   ```
   Error: Modèle non disponible
   ```
   Solution : Choisir un autre modèle dans la liste

### Logs de Debug

Activez les logs dans la console pour diagnostiquer :
```typescript
console.log('🎨 Génération d\'image en cours...', { model, prompt });
console.log('✅ Image générée avec succès', { generationTime, size });
```

## 📈 Évolutions Futures

### Fonctionnalités Prévues
- [ ] Génération par lots
- [ ] Modèles personnalisés
- [ ] Upscaling d'images
- [ ] Génération conditionnelle
- [ ] Intégration avec d'autres APIs (DALL-E, Midjourney)

### Améliorations Techniques
- [ ] Cache intelligent des images
- [ ] Compression optimisée
- [ ] Génération en arrière-plan
- [ ] Historique des générations

## 📚 Ressources

- [Documentation Hugging Face API](https://huggingface.co/docs/api-inference)
- [Guide Stable Diffusion](https://stability.ai/blog/stable-diffusion-announcement)
- [Prompts Engineering](https://prompthero.com/stable-diffusion-prompts)
- [Modèles disponibles](https://huggingface.co/models?pipeline_tag=text-to-image)

---

*Cette fonctionnalité enrichit NeuroChat-IA-v2 avec des capacités créatives avancées, permettant aux utilisateurs de générer des images de qualité professionnelle directement depuis leur interface de chat.*
