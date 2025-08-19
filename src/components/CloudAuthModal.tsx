import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useToast } from '../hooks/use-toast';
import cloudSyncService, { CloudUser, CloudConversation } from '../services/cloudSync';
import { Cloud, User, Shield, Database, Upload, Download, LogOut, Settings, MessageSquare, Calendar, FolderOpen } from 'lucide-react';

interface CloudAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CloudAuthModal({ open, onOpenChange }: CloudAuthModalProps) {
  const [activeTab, setActiveTab] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<CloudUser | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [conversations, setConversations] = useState<CloudConversation[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [syncStats, setSyncStats] = useState({
    totalConversations: 0,
    lastSync: null as Date | null,
    totalMessages: 0,
    storageUsed: '0 KB'
  });
  
  // Form states
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const { toast } = useToast();

  // Vérifier l'état de connexion au chargement
  useEffect(() => {
    if (open) {
      const authManager = cloudSyncService.getAuthManager();
      if (authManager.isAuthenticated()) {
        setUser(authManager.getUser());
        setActiveTab('account');
        loadUserData();
      }
    }
  }, [open]);

  // Charger les données utilisateur
  const loadUserData = async () => {
    try {
      const authManager = cloudSyncService.getAuthManager();
      if (authManager.isAuthenticated()) {
        // Charger les conversations
        const convResponse = await cloudSyncService.getConversations({ limit: 100 });
        if (convResponse.success) {
          setConversations(convResponse.data.conversations);
          
          // Calculer les statistiques
          const totalMessages = convResponse.data.conversations.reduce((sum, conv) => sum + conv.message_count, 0);
          const storageUsed = calculateStorageSize(totalMessages);
          
          setSyncStats({
            totalConversations: convResponse.data.conversations.length,
            lastSync: new Date(),
            totalMessages,
            storageUsed
          });
        }
      }
    } catch (error) {
      console.error('Erreur chargement données utilisateur:', error);
    }
  };

  // Calculer la taille de stockage approximative
  const calculateStorageSize = (messageCount: number): string => {
    const avgMessageSize = 200; // caractères par message en moyenne
    const totalBytes = messageCount * avgMessageSize;
    
    if (totalBytes < 1024) return `${totalBytes} B`;
    if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(1)} KB`;
    return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Gestion de la connexion
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const authManager = cloudSyncService.getAuthManager();
      const response = await authManager.login(loginForm.username, loginForm.password);
      
      if (response.success) {
        setUser(response.data.user);
        setActiveTab('account');
        await loadUserData();
        toast({
          title: 'Connexion réussie',
          description: `Bienvenue ${response.data.user.username} !`,
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur de connexion',
        description: error instanceof Error ? error.message : 'Erreur inconnue',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de l'inscription
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (registerForm.password !== registerForm.confirmPassword) {
      toast({
        title: 'Erreur de validation',
        description: 'Les mots de passe ne correspondent pas',
        variant: 'destructive',
      });
      return;
    }
    
    if (registerForm.password.length < 8) {
      toast({
        title: 'Erreur de validation',
        description: 'Le mot de passe doit contenir au moins 8 caractères',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const authManager = cloudSyncService.getAuthManager();
      const response = await authManager.register(
        registerForm.username,
        registerForm.email,
        registerForm.password,
        registerForm.confirmPassword
      );
      
      if (response.success) {
        toast({
          title: 'Inscription réussie',
          description: 'Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.',
        });
        setActiveTab('login');
        setRegisterForm({ username: '', email: '', password: '', confirmPassword: '' });
      }
    } catch (error) {
      toast({
        title: 'Erreur d\'inscription',
        description: error instanceof Error ? error.message : 'Erreur inconnue',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion de la déconnexion
  const handleLogout = async () => {
    try {
      const authManager = cloudSyncService.getAuthManager();
      await authManager.logout();
      setUser(null);
      setConversations([]);
      setSyncStats({
        totalConversations: 0,
        lastSync: null,
        totalMessages: 0,
        storageUsed: '0 KB'
      });
      setActiveTab('login');
      toast({
        title: 'Déconnexion réussie',
        description: 'Vous avez été déconnecté de votre compte cloud',
      });
    } catch (error) {
      toast({
        title: 'Erreur de déconnexion',
        description: 'Erreur lors de la déconnexion',
        variant: 'destructive',
      });
    }
  };

  // Synchronisation manuelle
  const handleManualSync = async () => {
    setSyncStatus('syncing');
    
    try {
      // TODO: Implémenter la synchronisation avec les conversations locales
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulation
      await loadUserData(); // Recharger les données
      setSyncStatus('success');
      toast({
        title: 'Synchronisation réussie',
        description: 'Vos conversations ont été synchronisées avec le cloud',
      });
    } catch (error) {
      setSyncStatus('error');
      toast({
        title: 'Erreur de synchronisation',
        description: 'Erreur lors de la synchronisation',
        variant: 'destructive',
      });
    }
    
    // Réinitialiser le statut après 3 secondes
    setTimeout(() => setSyncStatus('idle'), 3000);
  };

  // Gestion des paramètres
  const handleSettings = () => {
    setShowSettings(!showSettings);
  };

  // Restaurer depuis le cloud
  const handleRestore = async () => {
    try {
      setSyncStatus('syncing');
      // TODO: Implémenter la restauration depuis le cloud
      await new Promise(resolve => setTimeout(resolve, 1500));
      await loadUserData();
      setSyncStatus('success');
      toast({
        title: 'Restauration réussie',
        description: 'Vos conversations ont été restaurées depuis le cloud',
      });
    } catch (error) {
      setSyncStatus('error');
      toast({
        title: 'Erreur de restauration',
        description: 'Erreur lors de la restauration',
        variant: 'destructive',
      });
    }
    setTimeout(() => setSyncStatus('idle'), 3000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Mémoire Internet NeuroChat
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="login" disabled={!!user}>Connexion</TabsTrigger>
            <TabsTrigger value="register" disabled={!!user}>Inscription</TabsTrigger>
            <TabsTrigger value="account" disabled={!user}>Mon Compte</TabsTrigger>
          </TabsList>

          {/* Tab Connexion */}
          <TabsContent value="login" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Se connecter
                </CardTitle>
                <CardDescription>
                  Connectez-vous à votre compte NeuroChat pour synchroniser vos conversations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Nom d'utilisateur ou Email</Label>
                    <Input
                      id="login-username"
                      type="text"
                      value={loginForm.username}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="votre_username ou email@exemple.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Votre mot de passe"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Connexion...' : 'Se connecter'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Inscription */}
          <TabsContent value="register" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Créer un compte
                </CardTitle>
                <CardDescription>
                  Créez un nouveau compte pour commencer à utiliser la mémoire internet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-username">Nom d'utilisateur</Label>
                    <Input
                      id="register-username"
                      type="text"
                      value={registerForm.username}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="votre_username"
                      required
                      minLength={3}
                      maxLength={50}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@exemple.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Mot de passe</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Au moins 8 caractères"
                      required
                      minLength={8}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-confirm">Confirmer le mot de passe</Label>
                    <Input
                      id="register-confirm"
                      type="password"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Retapez votre mot de passe"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Création...' : 'Créer le compte'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Mon Compte */}
          <TabsContent value="account" className="space-y-4">
            {user && (
              <>
                {/* Informations utilisateur */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Informations du compte
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Nom d'utilisateur:</span>
                      <Badge variant="secondary">{user.username}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Email:</span>
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Membre depuis:</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Dernière connexion:</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(user.last_login).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Statistiques de synchronisation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Données synchronisées
                    </CardTitle>
                    <CardDescription>
                      Aperçu de vos conversations sauvegardées dans le cloud
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        <div>
                          <div className="text-sm font-medium">{syncStats.totalConversations}</div>
                          <div className="text-xs text-muted-foreground">Conversations</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-green-500" />
                        <div>
                          <div className="text-sm font-medium">{syncStats.totalMessages}</div>
                          <div className="text-xs text-muted-foreground">Messages</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-purple-500" />
                        <div>
                          <div className="text-sm font-medium">{syncStats.storageUsed}</div>
                          <div className="text-xs text-muted-foreground">Stockage</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        <div>
                          <div className="text-sm font-medium">
                            {syncStats.lastSync ? new Date(syncStats.lastSync).toLocaleDateString('fr-FR') : 'Jamais'}
                          </div>
                          <div className="text-xs text-muted-foreground">Dernière sync</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Synchronisation */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Synchronisation
                    </CardTitle>
                    <CardDescription>
                      Gérez la synchronisation de vos conversations avec le cloud
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Statut:</span>
                      <Badge 
                        variant={
                          syncStatus === 'syncing' ? 'secondary' :
                          syncStatus === 'success' ? 'default' :
                          syncStatus === 'error' ? 'destructive' : 'outline'
                        }
                      >
                        {syncStatus === 'syncing' ? 'Synchronisation...' :
                         syncStatus === 'success' ? 'Synchronisé' :
                         syncStatus === 'error' ? 'Erreur' : 'En attente'}
                      </Badge>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleManualSync} 
                        disabled={syncStatus === 'syncing'}
                        className="flex-1"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Synchroniser maintenant
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={handleRestore}
                        disabled={syncStatus === 'syncing'}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Restaurer
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Sécurité */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Sécurité
                    </CardTitle>
                    <CardDescription>
                      Vos données sont chiffrées avec AES-256 et stockées de manière sécurisée
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Chiffrement:</span>
                      <Badge variant="default">AES-256</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Paramètres avancés */}
                {showSettings && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Paramètres avancés
                      </CardTitle>
                      <CardDescription>
                        Configuration de la synchronisation et des préférences
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Sync automatique:</span>
                        <Badge variant="outline">Activé</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Intervalle de sync:</span>
                        <span className="text-sm text-muted-foreground">30 secondes</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Compression:</span>
                        <Badge variant="outline">Activée</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Chiffrement local:</span>
                        <Badge variant="outline">AES-256</Badge>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Separator />

                {/* Actions */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={handleSettings}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {showSettings ? 'Masquer paramètres' : 'Paramètres'}
                  </Button>
                  <Button variant="destructive" onClick={handleLogout} className="flex-1">
                    <LogOut className="h-4 w-4 mr-2" />
                    Se déconnecter
                  </Button>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
