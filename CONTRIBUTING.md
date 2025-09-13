# 🤝 Guide de contribution

Merci de vouloir contribuer à NeuroChat IA v2 ! Ce guide explique comment proposer des améliorations ou corriger des bugs de façon professionnelle.

---

## Pré-requis
- Node.js 18+
- npm (ou pnpm/yarn)
- Clé API Gemini (voir README)

---

## Installation
```bash
git clone https://github.com/moonback/NeuroChat-IA-v2.git
cd NeuroChat-IA-v2
npm install
```

---

## Workflow de contribution

1. **Créer une branche dédiée**
   ```bash
   git checkout -b feature/ma-nouvelle-fonctionnalite
   ```
2. **Développer et tester localement**
   ```bash
   npm run dev
   npm run lint
   ```
3. **Commiter avec un message clair**
   ```bash
   git add .
   git commit -m "feat: ajouter ma nouvelle fonctionnalité"
   ```
4. **Pousser la branche et ouvrir une Pull Request**
   ```bash
   git push origin feature/ma-nouvelle-fonctionnalite
   ```
5. **Décrire clairement vos changements**
   - Ajoutez des captures d’écran si utile
   - Mentionnez les issues liées

---

## Bonnes pratiques
- Respecter la structure du projet et la séparation des responsabilités
- Utiliser TypeScript et les hooks pour la logique métier
- Tester sur plusieurs navigateurs
- Vérifier la sécurité (aucune donnée sensible en clair)
- Documenter les nouvelles fonctions/services/hooks
- Lancer `npm run lint` avant toute PR

---

## Code de conduite
- Respect, bienveillance et collaboration
- Pas de contenu offensant ou discriminatoire
- Les discussions techniques se font via issues ou PR

---

## Licence
Projet sous licence MIT