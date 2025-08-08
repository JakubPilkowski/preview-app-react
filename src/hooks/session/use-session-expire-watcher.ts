import { useEffect, useRef, useCallback } from 'react';
import { useTTL } from '../utils';

interface UseSessionExpireWatcherProps {
  expirationTime: number; // milliseconds
  onExpire: () => void;
  isEnabled: boolean;
}

interface UseSessionExpireWatcherReturn {
  updateClock: () => void;
  clearClock: () => void;
}

export const useSessionExpireWatcher = ({
  expirationTime,
  onExpire,
  isEnabled,
}: UseSessionExpireWatcherProps): UseSessionExpireWatcherReturn => {
  const { updateClock, clearClock } = useTTL(onExpire, {
    expirationTime,
    isEnabled,
  });

  const isEnabledRef = useRef(isEnabled);

  // Update ref when isEnabled changes
  useEffect(() => {
    isEnabledRef.current = isEnabled;
  }, [isEnabled]);

  const handlePageHide = useCallback(() => {
    if (isEnabledRef.current) {
      onExpire();
    }
  }, [onExpire]);

  const handleBeforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      if (isEnabledRef.current) {
        onExpire();
        // Optionally show a confirmation dialog
        event.preventDefault();
        event.returnValue = '';
      }
    },
    [onExpire]
  );

  // Set up event listeners
  useEffect(() => {
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handlePageHide, handleBeforeUnload]);

  return {
    updateClock,
    clearClock,
  };
};
