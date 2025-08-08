import { useRef, useCallback } from 'react';

interface UseTTLOptions {
  expirationTime: number; // milliseconds
  isEnabled?: boolean; // default true
}

interface UseTTLReturn {
  updateClock: () => void;
  clearClock: () => void;
}

export const useTTL = (
  onExpire: () => void,
  options: UseTTLOptions
): UseTTLReturn => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isEnabled = true } = options;

  const clearClock = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const updateClock = useCallback(() => {
    // Clear any existing timeout
    clearClock();

    // Only set new timeout if enabled
    if (isEnabled) {
      timeoutRef.current = setTimeout(() => {
        onExpire();
        timeoutRef.current = null;
      }, options.expirationTime);
    }
  }, [onExpire, options.expirationTime, clearClock, isEnabled]);

  return {
    updateClock,
    clearClock,
  };
};
