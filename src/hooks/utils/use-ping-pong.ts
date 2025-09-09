import { useCallback, useEffect, useRef } from 'react';

interface UsePingPongProps {
  onPing: () => void;
  onPong?: () => void;
  isEnabled: boolean;
  pingInterval: number;
  pongInterval: number;
  onError: (error: string) => void;
}

export const usePingPong = ({
  onPing,
  onPong,
  isEnabled,
  pingInterval,
  pongInterval,
  onError,
}: UsePingPongProps) => {
  const pingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pongTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isWaitingForPongRef = useRef(false);

  const handlePong = useCallback(() => {
    if (isWaitingForPongRef.current) {
      isWaitingForPongRef.current = false;

      // Clear the pong timeout since we received a response
      if (pongTimeoutRef.current) {
        clearTimeout(pongTimeoutRef.current);
        pongTimeoutRef.current = null;
      }

      // Call the onPong callback
      onPong?.();

      // Schedule next ping after pingInterval
      if (isEnabled) {
        pingTimeoutRef.current = setTimeout(() => {
          handlePing();
        }, pingInterval);
      }
    }
  }, [onPong, isEnabled, pingInterval]);

  const handlePing = useCallback(() => {
    if (!isEnabled || isWaitingForPongRef.current) {
      return;
    }

    // Call the onPing callback
    onPing();

    // Set flag that we're waiting for pong
    isWaitingForPongRef.current = true;

    // Set timeout for pong response
    pongTimeoutRef.current = setTimeout(() => {
      if (isWaitingForPongRef.current) {
        isWaitingForPongRef.current = false;
        onError('Pong timeout - no response received');
      }
    }, pongInterval);
  }, [onPing, onError, isEnabled, pongInterval]);

  // Start ping-pong cycle when enabled
  useEffect(() => {
    if (isEnabled) {
      // Start with first ping
      pingTimeoutRef.current = setTimeout(() => {
        handlePing();
      }, pingInterval);
    }

    return () => {
      // Cleanup timeouts on unmount or when disabled
      if (pingTimeoutRef.current) {
        clearTimeout(pingTimeoutRef.current);
        pingTimeoutRef.current = null;
      }
      if (pongTimeoutRef.current) {
        clearTimeout(pongTimeoutRef.current);
        pongTimeoutRef.current = null;
      }
      isWaitingForPongRef.current = false;
    };
  }, [isEnabled, pingInterval, handlePing]);

  // Expose handlePong for external use (e.g., message broker event listener)
  return {
    handlePong,
  };
};
