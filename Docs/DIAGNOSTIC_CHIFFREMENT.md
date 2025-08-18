# 🔍 Diagnostic du Chiffrement Automatique - NeuroChat

## 🚨 **Problème : Le chiffrement ne démarre pas automatiquement**

### **🔧 Diagnostic Immédiat**

Ouvrez la **Console du navigateur** (F12) et utilisez ces commandes :

#### **1. Diagnostic complet :**
```javascript
// Dans la console du navigateur
window.diagnoseEncryption()
```

**Résultat attendu :**
```javascript
{
  enabled: null,           // ou "false" / "true"
  hasPassword: false,      // Si un mot de passe existe
  hasDerivationKey: false, // Si une clé de dérivation existe
  hasEncryptedData: false, // Si des données chiffrées existent
  encryptedDataCount: 0    // Nombre de données chiffrées
}
```

#### **2. Activation forcée :**
```javascript
// Dans la console du navigateur
window.forceEncryption()
```

### **📊 Interprétation des Résultats**

| État `enabled` | Cause Probable | Solution |
|---------------|----------------|----------|
| `null` | ✅ **Premier démarrage normal** | Devrait s'activer automatiquement |
| `"false"` | ❌ **Désactivé manuellement** | Utiliser `window.forceEncryption()` |
| `"true"` | ✅ **Activé mais erreur** | Vérifier les autres champs |

### **🔍 Scénarios de Diagnostic**

#### **Scénario 1 : Premier Démarrage (Normal)**
```javascript
enabled: null
hasPassword: false
hasDerivationKey: false
hasEncryptedData: false
```
➡️ **Action** : Le chiffrement devrait s'activer automatiquement

#### **Scénario 2 : Désactivé Volontairement**
```javascript
enabled: "false"
hasPassword: false
hasDerivationKey: false
hasEncryptedData: false
```
➡️ **Action** : Utiliser `window.forceEncryption()` pour réactiver

#### **Scénario 3 : Configuration Cassée**
```javascript
enabled: "true"
hasPassword: true
hasDerivationKey: false  // ⚠️ Problème !
```
➡️ **Action** : Nettoyer et reconfigurer

#### **Scénario 4 : Données Orphelines**
```javascript
enabled: "false"
hasEncryptedData: true
encryptedDataCount: 3    // ⚠️ Données non accessibles !
```
➡️ **Action** : Toast de récupération automatique

## 🛠️ **Solutions de Récupération**

### **Solution 1 : Nettoyage Complet**
```javascript
// ATTENTION: Supprime TOUTES les données !
localStorage.removeItem('nc_encryption_enabled');
localStorage.removeItem('nc_master_password_encrypted');
localStorage.removeItem('nc_derivation_key');

// Supprimer toutes les données chiffrées
Object.keys(localStorage).forEach(key => {
  if (localStorage.getItem(key)?.startsWith('NEUROCHT_PERSIST_')) {
    localStorage.removeItem(key);
  }
});

// Recharger la page
location.reload();
```

### **Solution 2 : Activation Forcée (Conserve les données)**
```javascript
window.forceEncryption()
```

### **Solution 3 : Reset Sélectif**
```javascript
// Garder les données, reset la configuration
localStorage.removeItem('nc_encryption_enabled');
localStorage.removeItem('nc_master_password_encrypted');
localStorage.removeItem('nc_derivation_key');
location.reload();
```

## 🔄 **Messages de Debug dans la Console**

### **Messages Normaux (Fonctionnel) :**
```
🔍 État pré-initialisation:
🔐 Premier démarrage - Activation automatique du chiffrement AES-256
🔐 Chiffrement persistant AES-256 activé
✅ Chiffrement persistant activé avec succès
```

### **Messages d'Erreur (Dysfonctionnel) :**
```
🔍 État pré-initialisation:
enabled: "false"
ℹ️ Chiffrement persistant désactivé par l'utilisateur
🔧 Pour forcer l'activation, utilisez: window.forceEncryption()
```

## 🚀 **Procédure de Test Complète**

### **Étape 1 : Nettoyer l'État**
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### **Étape 2 : Vérifier l'Activation Automatique**
- Ouvrir la console
- Chercher les messages de démarrage
- Vérifier le badge 🔐 dans l'interface

### **Étape 3 : Tester la Persistance**
```javascript
// Après activation automatique
window.diagnoseEncryption()
// Devrait montrer enabled: "true"
```

### **Étape 4 : Tester la Récupération**
```javascript
location.reload(); // Actualiser
window.diagnoseEncryption() // Vérifier si recovered
```

## 📋 **Checklist de Dépannage**

- [ ] **Console ouverte** pour voir les logs
- [ ] **localStorage vidé** si test propre nécessaire
- [ ] **Aucune erreur JavaScript** bloquante
- [ ] **Tests de sécurité** passent (pas d'erreur crypto)
- [ ] **Badge visible** dans l'interface après activation
- [ ] **Toast de confirmation** affiché

## 🆘 **Commandes d'Urgence**

### **Reset Complet (En cas de problème grave) :**
```javascript
// 🚨 ATTENTION: SUPPRIME TOUT !
localStorage.clear();
sessionStorage.clear();
window.location.href = window.location.href.split('?')[0];
```

### **Diagnostic Détaillé :**
```javascript
console.log('=== DIAGNOSTIC COMPLET ===');
console.log('localStorage keys:', Object.keys(localStorage));
console.log('Encryption diagnosis:', window.diagnoseEncryption());
console.log('CurrentURL:', window.location.href);
console.log('UserAgent:', navigator.userAgent);
```

---

> **🎯 Objectif :** Identifier pourquoi le chiffrement automatique ne démarre pas et fournir une solution de récupération rapide.

**Si le problème persiste après ces étapes, il peut y avoir un bug dans la logique d'initialisation qui nécessite une correction de code.**
