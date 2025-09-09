import { useState, useEffect } from 'react';
import { useSessionExpireWatcher } from './use-session-expire-watcher';
import { useSessionReconnectWatcher } from './use-session-reconnect-watcher';
import { useSessionId } from './use-session-id';

type DisconnectReason = 'error' | 'expired';

// Discriminated union state types
type IdleState = {
  state: 'IDLE';
};

type ConnectingState = {
  state: 'CONNECTING';
};

type ConnectedState = {
  state: 'CONNECTED';
};

type DisconnectedState = {
  state: 'DISCONNECTED';
  reason: DisconnectReason;
  message?: string;
};

type ConnectionState =
  | IdleState
  | ConnectingState
  | ConnectedState
  | DisconnectedState;

interface UseSessionConnectionProps {
  onLoad?: () => void;
  onExpiration?: () => void;
  expirationTime?: number; // milliseconds, default 5 minutes
  autoConnect?: boolean; // default true
}

interface UseSessionConnectionReturn {
  state: ConnectionState;
  sessionId: string | null;
  error: string | null;
  isLoading: boolean;
  isExpired: boolean;
  isConnected: boolean;
  isIdle: boolean;
  isError: boolean;
  connect: () => void;
  reconnect: () => void;
  onConnect: () => void;
  setError: (error: string) => void;
  updateClock: () => void;
}

export const useSessionConnection = ({
  onLoad,
  onExpiration,
  expirationTime = 5 * 60 * 1000, // 5 minutes default
  autoConnect = true,
}: UseSessionConnectionProps = {}): UseSessionConnectionReturn => {
  const [connectionState, setConnectionState] = useState<ConnectionState>(
    autoConnect ? { state: 'CONNECTING' } : { state: 'IDLE' }
  );
  const { sessionId, generateSessionId } = useSessionId();

  const handleExpire = () => {
    setConnectionState({
      state: 'DISCONNECTED',
      reason: 'expired',
      message: 'Session expired',
    });

    // Call the provided onExpiration callback if it exists
    if (onExpiration) {
      onExpiration();
    }
  };

  const { updateClock, clearClock } = useSessionExpireWatcher({
    expirationTime,
    onExpire: handleExpire,
    isEnabled: connectionState.state === 'CONNECTED',
  });

  const onConnect = () => {
    setConnectionState({ state: 'CONNECTED' });

    // Call the provided onLoad callback if it exists
    if (onLoad) {
      onLoad();
    }

    // Start the session watcher clock after connection is established
    updateClock();
  };

  const connect = () => {
    if (connectionState.state === 'IDLE') {
      setConnectionState({ state: 'CONNECTING' });
    }
  };

  const reconnect = () => {
    if (connectionState.state === 'DISCONNECTED') {
      generateSessionId();
      setConnectionState({ state: 'CONNECTING' });
    }
  };

  // Auto-reconnect watcher - only enabled when disconnected due to expiration
  useSessionReconnectWatcher({
    onReconnect: reconnect,
    isEnabled:
      connectionState.state === 'DISCONNECTED' &&
      connectionState.reason === 'expired',
  });

  const setError = (errorMessage: string) => {
    setConnectionState({
      state: 'DISCONNECTED',
      reason: 'error',
      message: errorMessage,
    });
    clearClock();
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      clearClock();
    };
  }, [clearClock]);

  // Determine what sessionId to expose based on state
  const exposedSessionId = connectionState.state !== 'IDLE' ? sessionId : null;

  // Computed properties for backward compatibility
  const error =
    connectionState.state === 'DISCONNECTED'
      ? connectionState.message || null
      : null;
  const isLoading = connectionState.state === 'CONNECTING';
  const isExpired =
    connectionState.state === 'DISCONNECTED' &&
    connectionState.reason === 'expired';
  const isConnected = connectionState.state === 'CONNECTED';
  const isIdle = connectionState.state === 'IDLE';
  const isError =
    connectionState.state === 'DISCONNECTED' &&
    connectionState.reason === 'error';

  return {
    state: connectionState,
    sessionId: exposedSessionId,
    error,
    isLoading,
    isExpired,
    isConnected,
    isIdle,
    isError,
    connect,
    reconnect,
    onConnect,
    setError,
    updateClock,
  };
};
