# 🔍 Guide de Débogage - Chiffrement AES-256

## Problèmes Courants et Solutions

### 1. ❌ Échec du Test d'Auto-vérification

**Symptôme :**
```
Échec du test d'auto-vérification: Error: Le déchiffrement avec un mauvais mot de passe devrait échouer
```

**Cause :** Le test de sécurité vérifie que le déchiffrement échoue avec un mauvais mot de passe

**Solution :** ✅ **Corrigé** - Logique de test améliorée

### 2. 📱 Données Non Persistantes Après Actualisation

**Symptôme :**
- Badge 🔐 AES-256 activé
- Données sauvegardées
- Après actualisation : données perdues

**Diagnostic :**

1. **Vérifiez l'état dans la console :**
```javascript
// Dans la console du navigateur
console.log('État chiffrement:', {
  enabled: localStorage.getItem('nc_encryption_enabled'),
  hasPassword: !!localStorage.getItem('nc_master_password_encrypted'),
  hasKey: !!localStorage.getItem('nc_derivation_key')
});
```

2. **Inspectez le localStorage :**
```javascript
// Voir toutes les clés chiffrées
Object.keys(localStorage).filter(key => 
  localStorage.getItem(key)?.startsWith('NEUROCHT_PERSIST_')
);
```

**Causes Possibles :**

| Problème | Vérification | Solution |
|----------|-------------|----------|
| **Clé de dérivation manquante** | `nc_derivation_key` absent | Réactiver le chiffrement |
| **Mot de passe corrompu** | Erreur de déchiffrement | Effacer et reconfigurer |
| **Cache invalide** | État incohérent | Actualiser la page |

### 3. 🔐 Le Badge Reste 🔓 STANDARD

**Causes :**
- Le chiffrement n'est pas activé
- Erreur de récupération du mot de passe
- State React non synchronisé

**Solutions :**
1. Cliquer sur le badge pour réactiver
2. Vérifier la console pour les erreurs
3. Effacer les données corrompues

## 🛠️ Commandes de Débogage

### Console du Navigateur

```javascript
// 1. État complet du système
window.neurochatDebug = {
  encryption: {
    enabled: localStorage.getItem('nc_encryption_enabled'),
    hasPassword: !!localStorage.getItem('nc_master_password_encrypted'),
    hasDerivationKey: !!localStorage.getItem('nc_derivation_key'),
    encryptedKeys: Object.keys(localStorage).filter(k => 
      localStorage.getItem(k)?.startsWith('NEUROCHT_PERSIST_')
    )
  }
};
console.table(window.neurochatDebug.encryption);

// 2. Tester le chiffrement manuellement
const testData = "Test de chiffrement";
const testPassword = "test123";
// (Utiliser les fonctions encrypt/decrypt du service)

// 3. Nettoyer toutes les données chiffrées
['nc_encryption_enabled', 'nc_master_password_encrypted', 'nc_derivation_key']
  .forEach(key => localStorage.removeItem(key));
console.log('Données de chiffrement nettoyées');

// 4. Forcer la réinitialisation
location.reload();
```

### Vérification des Données Chiffrées

```javascript
// Voir le contenu d'une donnée chiffrée
const key = 'ws:neuro:gemini_current_discussion';
const encrypted = localStorage.getItem(key);
if (encrypted?.startsWith('NEUROCHT_PERSIST_')) {
  console.log('Données chiffrées détectées pour:', key);
  const blob = JSON.parse(encrypted.slice('NEUROCHT_PERSIST_'.length));
  console.log('Structure:', Object.keys(blob));
} else {
  console.log('Données non chiffrées pour:', key);
}
```

## 🔄 Procédure de Récupération

### Récupération Automatique

1. **Au démarrage de l'app :**
   - ✅ Vérification `nc_encryption_enabled = 'true'`
   - ✅ Récupération `nc_master_password_encrypted`
   - ✅ Utilisation `nc_derivation_key` pour déchiffrer
   - ✅ Activation du chiffrement avec le mot de passe récupéré

2. **En cas d'échec :**
   - ⚠️ Log d'erreur dans la console
   - 🧹 Nettoyage automatique des données corrompues
   - 🔓 Retour en mode standard

### Récupération Manuelle

1. **Effacer les données corrompues :**
```javascript
localStorage.removeItem('nc_encryption_enabled');
localStorage.removeItem('nc_master_password_encrypted');
localStorage.removeItem('nc_derivation_key');
```

2. **Réactiver le chiffrement :**
   - Cliquer sur 🔓 STANDARD
   - Choisir "Génération automatique"
   - Vérifier le badge 🔐 AES-256

3. **Vérifier la persistance :**
   - Actualiser la page
   - Le badge doit rester 🔐 AES-256

## 📊 Monitoring en Temps Réel

L'application inclut un monitoring automatique qui log l'état toutes les 10 secondes :

```
🔍 État du chiffrement persistant: {
  isEnabled: true,
  hasPassword: true,
  hasDerivationKey: true,
  currentState: true
}
```

**Valeurs Attendues :**
- `isEnabled: true` - Chiffrement activé
- `hasPassword: true` - Mot de passe stocké
- `hasDerivationKey: true` - Clé de récupération présente
- `currentState: true` - État React synchronisé

## 🚨 Cas d'Urgence

### Données Complètement Irrécupérables

Si toutes les tentatives échouent :

1. **Sauvegarde préventive :**
```javascript
// Exporter les données en texte brut (si encore lisibles)
const backup = {};
Object.keys(localStorage).forEach(key => {
  if (key.includes('gemini') || key.includes('discussion')) {
    backup[key] = localStorage.getItem(key);
  }
});
console.log('Sauvegarde:', JSON.stringify(backup, null, 2));
```

2. **Reset complet :**
```javascript
// ATTENTION: Supprime TOUTES les données
localStorage.clear();
sessionStorage.clear();
location.reload();
```

3. **Reconfiguration :**
   - Réactiver le chiffrement
   - Restaurer manuellement les données importantes

## 📋 Checklist de Diagnostic

- [ ] Test d'auto-vérification réussi
- [ ] Badge 🔐 AES-256 affiché
- [ ] `nc_encryption_enabled = 'true'` dans localStorage
- [ ] `nc_master_password_encrypted` présent
- [ ] `nc_derivation_key` présent
- [ ] Données avec préfixe `NEUROCHT_PERSIST_`
- [ ] Monitoring sans erreurs
- [ ] Persistance après actualisation

## 🔧 Améliorations Futures

- **Interface de diagnostic** dans l'app
- **Export/import** des configurations
- **Récupération assistée** pour les données corrompues
- **Backup automatique** avant modifications critiques

---

> **💡 Conseil**  
> En cas de doute, la méthode la plus sûre est de désactiver/réactiver le chiffrement.
> Cela regénère toutes les clés et repart sur une base saine.

**🔐 NeuroChat - Débogage Sécurisé**
