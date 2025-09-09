import { useCallback, useEffect } from 'react';
import { useSessionConnection } from '../session';
import { useMessageChannelBroker } from '../communication';
import { usePingPong } from '../utils';
import {
  EventListenerMap,
  MESSAGE_TYPES,
  MessageType,
  PreviewMessage,
} from '@preview-workspace/preview-lib';

interface UsePreviewConnectionProps {
  expirationTime?: number;
}

interface UsePreviewConnectionReturn {
  // Connection state
  isLoading: boolean;
  isExpired: boolean;
  isError: boolean;
  error: string | null;
  sessionId: string | null;

  // Connection management
  connect: (iframe: HTMLIFrameElement) => void;
  reconnect: () => void;

  // Error handling
  onError: (error: any) => void;

  // Message sending
  sendMessage: (message: PreviewMessage) => void;

  // Event listeners
  addEventListener: <T extends MessageType>(
    eventName: T,
    callback: EventListenerMap[T]
  ) => void;
  removeEventListener: <T extends MessageType>(eventName: T) => void;
}

export const usePreviewConnection = ({
  expirationTime = 5 * 60 * 1000,
}: UsePreviewConnectionProps): UsePreviewConnectionReturn => {
  // Message channel broker for communication with next-app
  const messageBroker = useMessageChannelBroker({
    destroyMessageName: 'on:disconnect',
  });

  // Session connection management
  const sessionConnection = useSessionConnection({
    expirationTime,
    onExpiration: () => {
      // Destroy message channel when session expires
      messageBroker.destroy();
    },
    autoConnect: true, // We'll control connection manually
  });

  // Ping-pong communication for connection monitoring
  const onPing = useCallback(() => {
    messageBroker.sendMessage({ type: MESSAGE_TYPES.PING });
  }, [messageBroker]);

  const onPingPongError = useCallback(
    (error: string) => {
      sessionConnection.setError(error);
      messageBroker.destroy();
    },
    [sessionConnection, messageBroker]
  );

  const { handlePong: onPong } = usePingPong({
    onPing,
    isEnabled: sessionConnection.isConnected,
    pingInterval: 5000, // 5 seconds
    pongInterval: 5 * 1000, // 5 seconds
    onError: onPingPongError,
  });

  // Unified error handler
  const onError = useCallback(
    (error: any) => {
      sessionConnection.setError(error);
      messageBroker.destroy();
    },
    [sessionConnection, messageBroker]
  );

  // Connection management
  const connect = useCallback(
    (iframe: HTMLIFrameElement) => {
      // Start session connection
      sessionConnection.onConnect();

      // Initialize message channel broker with iframe
      if (messageBroker.state === 'idle') {
        messageBroker.onConnect();
        messageBroker.initialize(iframe);
      }
    },
    [sessionConnection, messageBroker]
  );

  // Reconnect both services
  const reconnect = useCallback(() => {
    sessionConnection.reconnect();
    // Message broker will be reinitialized on next connect
  }, [sessionConnection]);

  // Enhanced sendMessage that automatically updates clock
  const sendMessage = useCallback(
    (message: PreviewMessage) => {
      messageBroker.sendMessage(message);

      // Update clock for all messages except connect/disconnect
      if (
        message.type !== MESSAGE_TYPES.CONNECT &&
        message.type !== MESSAGE_TYPES.DISCONNECT
      ) {
        sessionConnection.updateClock();
      }
    },
    [messageBroker, sessionConnection]
  );

  // Enhanced event listeners that automatically update clock
  const addEventListener = useCallback(
    <T extends MessageType>(eventName: T, callback: EventListenerMap[T]) => {
      // Create a wrapper that handles clock updates
      const enhancedCallback = ((data: any) => {
        // Update clock for all events except connect/disconnect and pong
        if (
          eventName !== MESSAGE_TYPES.CONNECT &&
          eventName !== MESSAGE_TYPES.DISCONNECT &&
          eventName !== MESSAGE_TYPES.PONG
        ) {
          sessionConnection.updateClock();
        }

        // Call the original callback
        (callback as any)(data);
      }) as EventListenerMap[T];

      messageBroker.addEventListener(eventName, enhancedCallback);
    },
    [messageBroker, sessionConnection]
  );

  const removeEventListener = useCallback(
    <T extends MessageType>(eventName: T) => {
      messageBroker.removeEventListener(eventName);
    },
    [messageBroker]
  );

  // Set up automatic PONG event listener
  useEffect(() => {
    const handlePong = () => {
      // Handle pong response from iframe - no clock update for pong
      onPong();
    };

    messageBroker.addEventListener(MESSAGE_TYPES.PONG, handlePong);

    return () => {
      messageBroker.removeEventListener(MESSAGE_TYPES.PONG);
    };
  }, [messageBroker, onPong]);

  return {
    // Connection state
    isLoading: sessionConnection.isLoading,
    isExpired: sessionConnection.isExpired,
    isError: sessionConnection.isError,
    error: sessionConnection.error || messageBroker.error,
    sessionId: sessionConnection.sessionId,

    // Connection management
    connect,
    reconnect,

    // Error handling
    onError,

    // Message sending
    sendMessage,

    // Event listeners
    addEventListener,
    removeEventListener,
  };
};
