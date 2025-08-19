import { useState, useCallback } from 'react';
import type { HeaderProps } from '@/types/header';

export function useHeaderState(props: HeaderProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showVocalSettings, setShowVocalSettings] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Handlers optimisés avec feedback
  const handleVolumeToggle = useCallback(() => {
    props.muted ? props.onUnmute() : props.onMute();
  }, [props.muted, props.onMute, props.onUnmute]);

  const handleModeVocalToggle = useCallback(() => {
    props.setModeVocalAuto(!props.modeVocalAuto);
    // Feedback haptic
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, [props.modeVocalAuto, props.setModeVocalAuto]);

  const handlePrivateModeToggle = useCallback(() => {
    props.setModePrive(!props.modePrive);
  }, [props.modePrive, props.setModePrive]);

  const handleRagToggle = useCallback(() => {
    props.setRagEnabled(!props.ragEnabled);
    // Feedback visuel avec micro-délai
    setTimeout(() => {
      if ('vibrate' in navigator) navigator.vibrate(30);
    }, 100);
  }, [props.ragEnabled, props.setRagEnabled]);

  const handleWebToggle = useCallback(() => {
    if (props.setWebEnabled) {
      props.setWebEnabled(!props.webEnabled);
      if ('vibrate' in navigator) navigator.vibrate(30);
    }
  }, [props.webEnabled, props.setWebEnabled]);

  const handleChildModeToggle = useCallback(() => {
    props.onToggleModeEnfant?.();
  }, [props.onToggleModeEnfant]);

  const closeMobileMenu = useCallback(() => {
    setShowMobileMenu(false);
  }, []);

  const handleMenuAction = useCallback((action: () => void) => {
    return () => {
      action();
      closeMobileMenu();
    };
  }, [closeMobileMenu]);

  return {
    // État
    showMobileMenu,
    setShowMobileMenu,
    showVocalSettings,
    setShowVocalSettings,
    showHelpModal,
    setShowHelpModal,
    
    // Handlers
    handleVolumeToggle,
    handleModeVocalToggle,
    handlePrivateModeToggle,
    handleRagToggle,
    handleWebToggle,
    handleChildModeToggle,
    closeMobileMenu,
    handleMenuAction,
  };
}
