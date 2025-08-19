import React, { useMemo, useCallback } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useHeaderState } from '@/hooks/useHeaderState';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { usePrivateModeFeedback } from '@/hooks/usePrivateModeFeedback';
import { Logo } from './header/Logo';
import { WorkspaceSelector } from './header/WorkspaceSelector';
import { SelectionActions, MobileActions, DesktopActions } from './header/ActionComponents';
import { MobileStatusIndicator } from './header/MobileIndicators';
import { MobileMenuSheet } from './header/MobileMenu';
import { ConnectionStatus, PrivateModeBanner } from './header/StatusIndicators';
import type { HeaderProps } from '@/types/header';

/**
 * Composant Header refactorisé et modulaire
 * Gère l'interface principale de navigation et de contrôle
 */
export const Header: React.FC<HeaderProps> = React.memo((props) => {
  const { theme, toggleTheme } = useTheme();
  const { workspaces, workspaceId, setWorkspaceId, createWorkspace, renameWorkspace, deleteWorkspace } = useWorkspace();
  
  // Hooks personnalisés pour la gestion de l'état
  const {
    showMobileMenu,
    setShowMobileMenu,
    setShowVocalSettings,
    setShowHelpModal,
    handleVolumeToggle,
    handleModeVocalToggle,
    handlePrivateModeToggle,
    handleChildModeToggle,
    handleRagToggle,
    handleWebToggle
  } = useHeaderState(props);

  // Hook pour le statut de connexion
  const connectionStatus = useConnectionStatus();

  // Hook pour le feedback du mode privé
  const { audioRef, showPrivateIndicator } = usePrivateModeFeedback(props.modePrive);

  // État local pour la sélection de messages
  const [selectMode, setSelectMode] = React.useState(false);
  const [selectedCount, setSelectedCount] = React.useState(0);
  const [totalCount] = React.useState(0);

  // Handlers pour la sélection de messages
  const handleToggleSelectMode = useCallback(() => {
    setSelectMode(!selectMode);
    if (selectMode) {
      setSelectedCount(0);
    }
  }, [selectMode]);

  const handleSelectAll = useCallback(() => {
    setSelectedCount(totalCount);
  }, [totalCount]);

  const handleDeselectAll = useCallback(() => {
    setSelectedCount(0);
  }, []);

  const handleRequestDelete = useCallback(() => {
    if (selectedCount > 0) {
      const ok = window.confirm(`Supprimer ${selectedCount} message${selectedCount > 1 ? 's' : ''} ?\nCette action est irréversible.`);
      if (ok) {
        // Logique de suppression à implémenter
        setSelectedCount(0);
        setSelectMode(false);
      }
    }
  }, [selectedCount]);

  // Handler pour fermer le menu mobile
  const closeMobileMenu = useCallback(() => {
    setShowMobileMenu(false);
  }, []);

  // Handler pour les actions du menu avec fermeture automatique
  const handleMenuAction = useCallback((action: () => void) => () => {
    action();
    closeMobileMenu();
  }, [closeMobileMenu]);

  // Composants d'actions de sélection
  const selectionActions = useMemo(() => (
    <SelectionActions
      hasActiveConversation={props.hasActiveConversation}
      selectMode={selectMode}
      selectedCount={selectedCount}
      totalCount={totalCount}
      onToggleSelectMode={handleToggleSelectMode}
      onSelectAll={handleSelectAll}
      onDeselectAll={handleDeselectAll}
      onRequestDelete={handleRequestDelete}
    />
  ), [props.hasActiveConversation, selectMode, selectedCount, totalCount, handleToggleSelectMode, handleSelectAll, handleDeselectAll, handleRequestDelete]);

  return (
    <>
      {/* Audio pour le feedback du mode privé */}
      <audio ref={audioRef} src="/bip.wav" preload="auto" />
      
      {/* Header principal */}
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="max-w-12xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Section gauche : Logo et sélecteur d'espace */}
            <div className="flex items-center gap-4 sm:gap-6 min-w-0 flex-1">
              <Logo
                onNewDiscussion={props.onNewDiscussion}
                isOnline={connectionStatus.isOnline}
                quality={connectionStatus.connectionQuality}
              />
              
              <WorkspaceSelector
                modeEnfant={props.modeEnfant}
                workspaces={workspaces}
                workspaceId={workspaceId}
                onChangeWorkspace={setWorkspaceId}
                onCreateWorkspace={createWorkspace}
                onRenameWorkspace={renameWorkspace}
                onDeleteWorkspace={deleteWorkspace}
              />
            </div>

            {/* Section droite : Actions et contrôles */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Actions de sélection */}
              {selectionActions}

              {/* Actions desktop */}
              <DesktopActions
                modeEnfant={props.modeEnfant}
                onNewDiscussion={props.onNewDiscussion}
                onOpenHistory={props.onOpenHistory}
                onOpenMemory={props.onOpenMemory}
                selectionActions={selectionActions}
                muted={props.muted}
                handleVolumeToggle={handleVolumeToggle}
                handleModeVocalToggle={handleModeVocalToggle}
                modePrive={props.modePrive}
                handlePrivateModeToggle={handlePrivateModeToggle}
                handleChildModeToggle={handleChildModeToggle}
                ragEnabled={props.ragEnabled}
                handleRagToggle={handleRagToggle}
                webEnabled={props.webEnabled}
                handleWebToggle={handleWebToggle}
                webSearching={props.webSearching}
                setShowMobileMenu={setShowMobileMenu}
              />

              {/* Actions mobile */}
              <MobileActions
                modeEnfant={props.modeEnfant}
                muted={props.muted}
                onNewDiscussion={props.onNewDiscussion}
                handleVolumeToggle={handleVolumeToggle}
                setShowMobileMenu={setShowMobileMenu}
              />
            </div>
          </div>

          {/* Indicateur de statut de connexion */}
          <div className="flex items-center justify-between pb-2">
            <ConnectionStatus isOnline={connectionStatus.isOnline} quality={connectionStatus.connectionQuality} />
          </div>
        </div>

        {/* Indicateur de mode privé */}
        <PrivateModeBanner show={showPrivateIndicator} />
      </header>

      {/* Indicateurs de statut mobile */}
      <MobileStatusIndicator
        modePrive={props.modePrive}
        modeEnfant={props.modeEnfant}
        ragEnabled={props.ragEnabled}
        webEnabled={props.webEnabled}
      />

      {/* Menu mobile */}
      <MobileMenuSheet
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        closeMobileMenu={closeMobileMenu}
        handleMenuAction={handleMenuAction}
        modeEnfant={props.modeEnfant}
        hasActiveConversation={props.hasActiveConversation}
        selectMode={selectMode}
        selectedCount={selectedCount}
        onToggleSelectMode={handleToggleSelectMode}
        onRequestDelete={handleRequestDelete}
        modePrive={props.modePrive}
        handlePrivateModeToggle={handlePrivateModeToggle}
        handleChildModeToggle={handleChildModeToggle}
        ragEnabled={props.ragEnabled}
        handleRagToggle={handleRagToggle}
        webEnabled={props.webEnabled}
        handleWebToggle={handleWebToggle}
        onOpenTTSSettings={props.onOpenTTSSettings}
        onOpenGeminiSettings={props.onOpenGeminiSettings}
        onOpenRagDocs={props.onOpenRagDocs}
        autoVoiceConfig={undefined} // À implémenter selon les besoins
        onUpdateAutoVoiceConfig={undefined} // À implémenter selon les besoins
        onOpenChildPinSettings={undefined} // À implémenter selon les besoins
        toggleTheme={toggleTheme}
        theme={theme}
        setShowHelpModal={setShowHelpModal}
        onChangeProvider={props.onChangeProvider}
        provider={props.provider}
        setShowVocalSettings={setShowVocalSettings}
      />
    </>
  );
});

Header.displayName = 'Header';