/**
 * 🔐 Modal de Configuration du Chiffrement AES-256
 * 
 * Interface pour activer/configurer le chiffrement persistant
 * - Génération ou saisie de mot de passe
 * - Explication des fonctionnalités de sécurité
 * - Validation de force du mot de passe
 */

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Lock, Eye, EyeOff, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EncryptionSetupModalProps {
  /** État d'ouverture du modal */
  open: boolean;
  /** Callback de fermeture */
  onClose: () => void;
  /** Callback de configuration avec mot de passe optionnel */
  onSetup: (userPassword?: string) => void;
}

/**
 * Évalue la force d'un mot de passe
 */
function evaluatePasswordStrength(password: string): {
  score: number;
  level: 'weak' | 'medium' | 'strong' | 'very-strong';
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;
  
  // Longueur
  if (password.length >= 8) score += 1;
  else feedback.push('Au moins 8 caractères');
  
  if (password.length >= 12) score += 1;
  else if (password.length >= 8) feedback.push('12+ caractères recommandés');
  
  // Complexité
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Lettres minuscules');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Lettres majuscules');
  
  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Chiffres');
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push('Caractères spéciaux');
  
  // Patterns communs
  if (!/(.)\1{2,}/.test(password)) score += 1;
  else feedback.push('Éviter les répétitions');
  
  const level = score >= 6 ? 'very-strong' : score >= 4 ? 'strong' : score >= 2 ? 'medium' : 'weak';
  
  return { score, level, feedback };
}

/**
 * Composant principal du modal
 */
export const EncryptionSetupModal: React.FC<EncryptionSetupModalProps> = ({
  open,
  onClose,
  onSetup
}) => {
  const [useCustomPassword, setUseCustomPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const passwordStrength = password ? evaluatePasswordStrength(password) : null;
  const passwordsMatch = password === confirmPassword;
  const canProceed = useCustomPassword 
    ? password && passwordsMatch && passwordStrength?.level !== 'weak'
    : true;
  
  const handleSetup = async () => {
    setIsLoading(true);
    try {
      if (useCustomPassword) {
        await onSetup(password);
      } else {
        await onSetup();
      }
      // Reset form
      setPassword('');
      setConfirmPassword('');
      setUseCustomPassword(false);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getStrengthColor = (level: string) => {
    switch (level) {
      case 'very-strong': return 'text-green-600 bg-green-50 border-green-200';
      case 'strong': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-red-600 bg-red-50 border-red-200';
    }
  };
  
  const getStrengthLabel = (level: string) => {
    switch (level) {
      case 'very-strong': return 'Très Fort';
      case 'strong': return 'Fort';
      case 'medium': return 'Moyen';
      default: return 'Faible';
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-none max-h-none p-0 overflow-hidden rounded-none">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  Activer le Chiffrement AES-256
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  Protégez vos conversations avec un chiffrement de niveau gouvernemental
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <div className="h-full p-6 overflow-y-auto">
            {/* Fonctionnalités de sécurité */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 rounded-xl border border-green-200/50 dark:border-green-800/50">
              <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Protection Incluse
              </h4>
              <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Chiffrement AES-256-GCM (niveau militaire)
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Dérivation PBKDF2 avec 600,000 itérations
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Authentification AEAD intégrée
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  Stockage persistant sécurisé
                </div>
              </div>
            </div>
            
            {/* Option de mot de passe */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="custom-password" className="text-sm font-medium">
                  Utiliser mon propre mot de passe
                </Label>
                <Switch
                  id="custom-password"
                  checked={useCustomPassword}
                  onCheckedChange={setUseCustomPassword}
                />
              </div>
            
            {!useCustomPassword && (
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>
                  Un mot de passe sécurisé sera généré automatiquement et sauvegardé dans votre navigateur.
                  Vous pourrez le voir après activation.
                </AlertDescription>
              </Alert>
            )}
            
            {useCustomPassword && (
              <div className="space-y-4">
                {/* Saisie du mot de passe */}
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe de chiffrement</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Entrez un mot de passe fort..."
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </div>
                
                {/* Confirmation du mot de passe */}
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirmez votre mot de passe..."
                  />
                  {confirmPassword && !passwordsMatch && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Les mots de passe ne correspondent pas
                    </p>
                  )}
                </div>
                
                {/* Indicateur de force */}
                {password && passwordStrength && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Force du mot de passe:</span>
                      <Badge className={cn("text-xs", getStrengthColor(passwordStrength.level))}>
                        {getStrengthLabel(passwordStrength.level)}
                      </Badge>
                    </div>
                    
                    {/* Barre de progression */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          passwordStrength.level === 'very-strong' ? 'bg-green-500' :
                          passwordStrength.level === 'strong' ? 'bg-blue-500' :
                          passwordStrength.level === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                        )}
                        style={{ width: `${(passwordStrength.score / 7) * 100}%` }}
                      />
                    </div>
                    
                    {/* Conseils d'amélioration */}
                    {passwordStrength.feedback.length > 0 && (
                      <div className="text-xs text-gray-600">
                        <p className="font-medium mb-1">Améliorations suggérées:</p>
                        <ul className="list-disc list-inside space-y-1">
                          {passwordStrength.feedback.slice(0, 3).map((tip, index) => (
                            <li key={index}>{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Avertissement important */}
          <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              <strong>Important:</strong> Si vous perdez votre mot de passe de chiffrement, 
              vos données ne pourront pas être récupérées. Assurez-vous de le mémoriser ou de le sauvegarder en lieu sûr.
            </AlertDescription>
          </Alert>
          
          {/* Boutons d'action */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              onClick={handleSetup}
              disabled={!canProceed || isLoading}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Activation...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Activer le Chiffrement
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Footer avec actions rapides */}
        <div className="px-6 py-4 border-t bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Chiffrement AES-256
              </Badge>
              <Badge variant="outline" className="text-xs">
                Sécurité gouvernementale
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button 
                onClick={handleSetup}
                disabled={!canProceed || isLoading}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Activation...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Activer le Chiffrement
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      </DialogContent>
    </Dialog>
  );
};

export default EncryptionSetupModal;
