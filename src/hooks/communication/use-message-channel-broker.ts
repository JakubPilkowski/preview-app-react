import { useEffect, useRef, useCallback, useState } from 'react';
import {
  PreviewMessage,
  MESSAGE_TYPES,
  EventListenerMap,
  MessageType,
} from '@preview-workspace/preview-lib';

interface MessageChannelBrokerOptions {
  destroyMessageName: string;
}

// Connection state enum
type ConnectionState = 'idle' | 'connecting' | 'connected';

interface MessageChannelBrokerReturn {
  sendMessage: (message: PreviewMessage) => void;
  addEventListener: <T extends MessageType>(
    eventName: T,
    callback: EventListenerMap[T]
  ) => void;
  removeEventListener: <T extends MessageType>(eventName: T) => void;
  onConnect: () => void;
  initialize: (iframe: HTMLIFrameElement) => void;
  error: string | null;
  destroy: () => void;
  state: ConnectionState;
}

export const useMessageChannelBroker = (
  options: MessageChannelBrokerOptions
): MessageChannelBrokerReturn => {
  const messageChannelRef = useRef<MessageChannel | null>(null);
  const port1Ref = useRef<MessagePort | null>(null);
  const port2Ref = useRef<MessagePort | null>(null);
  const eventListenersRef = useRef<
    Map<MessageType, Set<EventListenerMap[MessageType]>>
  >(new Map());
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<ConnectionState>('idle');
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const addEventListener = useCallback(
    <T extends MessageType>(eventName: T, callback: EventListenerMap[T]) => {
      if (!eventListenersRef.current.has(eventName)) {
        eventListenersRef.current.set(eventName, new Set());
      }
      eventListenersRef.current
        .get(eventName)!
        .add(callback as EventListenerMap[MessageType]);
    },
    []
  );

  const removeEventListener = useCallback(
    <T extends MessageType>(eventName: T) => {
      eventListenersRef.current.delete(eventName);
    },
    []
  );

  const sendMessage = useCallback((message: PreviewMessage) => {
    if (port1Ref.current) {
      port1Ref.current.postMessage(message);
    }
  }, []);

  const sendDestroyMessage = useCallback(() => {
    if (port1Ref.current) {
      port1Ref.current.postMessage({
        type: options.destroyMessageName as MessageType,
      });
    }
  }, [options.destroyMessageName]);

  const onConnect = useCallback(() => {
    // Only connect if we're in idle state
    if (state !== 'idle') {
      return;
    }

    try {
      setError(null); // Clear any previous errors
      setState('connecting');

      // Create MessageChannel
      const messageChannel = new MessageChannel();
      messageChannelRef.current = messageChannel;
      port1Ref.current = messageChannel.port1;
      port2Ref.current = messageChannel.port2;

      // Set up message handling on port1 (we keep this port)
      port1Ref.current.onmessage = (event) => {
        const { type, data } = event.data;
        const listeners = eventListenersRef.current.get(type);
        if (listeners) {
          listeners.forEach((callback) => callback(data));
        }
      };

      // Start the message channel
      port1Ref.current.start();

      setState('connected');
    } catch (err) {
      const errorMessage = `Failed to initialize MessageChannel: ${err}`;
      setError(errorMessage);
      setState('idle');
      console.error(errorMessage);
    }
  }, [state]);

  const initialize = useCallback((iframe: HTMLIFrameElement) => {
    iframeRef.current = iframe;

    // Listen for ready signal from Next.js app
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === MESSAGE_TYPES.NEXT_JS_READY) {
        // Remove the listener since we only need it once
        window.removeEventListener('message', handleMessage);

        // Now send the MessageChannel port
        if (port2Ref.current && iframe.contentWindow) {
          iframe.contentWindow.postMessage(
            { type: MESSAGE_TYPES.INIT_MESSAGE_CHANNEL },
            import.meta.env.VITE_NEXT_APP_DOMAIN || 'http://localhost:4201',
            [port2Ref.current]
          );
        }
      }
    };

    window.addEventListener('message', handleMessage);
  }, []);

  const destroy = useCallback(() => {
    try {
      // Send destroy message before closing
      sendDestroyMessage();

      // Close the message channel
      if (port1Ref.current) {
        port1Ref.current.close();
        port1Ref.current = null;
      }
      if (port2Ref.current) {
        port2Ref.current.close();
        port2Ref.current = null;
      }
      messageChannelRef.current = null;

      // Clear all event listeners
      eventListenersRef.current.clear();

      // Clear error state and reset connection state
      setError(null);
      setState('idle');
    } catch (err) {
      console.error('Error destroying MessageChannel:', err);
    }
  }, [sendDestroyMessage]);

  // Store callbacks in refs to avoid dependency issues
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      destroy();
    };
  }, [destroy]);

  return {
    sendMessage,
    addEventListener,
    removeEventListener,
    onConnect,
    initialize,
    error,
    destroy,
    state,
  };
};
