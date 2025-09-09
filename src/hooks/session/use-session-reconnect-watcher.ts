import { useEffect, useRef, useCallback } from 'react';

interface UseSessionReconnectWatcherProps {
  onReconnect: () => void;
  isEnabled: boolean;
}

interface UseSessionReconnectWatcherReturn {
  // This hook doesn't return anything, it just handles reconnection
}

export const useSessionReconnectWatcher = ({
  onReconnect,
  isEnabled,
}: UseSessionReconnectWatcherProps): UseSessionReconnectWatcherReturn => {
  const isEnabledRef = useRef(isEnabled);

  // Update ref when isEnabled changes
  useEffect(() => {
    isEnabledRef.current = isEnabled;
  }, [isEnabled]);

  const handlePageShow = useCallback(() => {
    if (isEnabledRef.current) {
      onReconnect();
    }
  }, [onReconnect]);

  const handleFocus = useCallback(() => {
    if (isEnabledRef.current) {
      onReconnect();
    }
  }, [onReconnect]);

  const handleVisibilityChange = useCallback(() => {
    if (isEnabledRef.current && !document.hidden) {
      onReconnect();
    }
  }, [onReconnect]);

  // Set up event listeners
  useEffect(() => {
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handlePageShow, handleFocus, handleVisibilityChange]);

  return {};
};
