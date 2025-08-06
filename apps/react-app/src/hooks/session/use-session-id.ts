import { useState, useCallback } from 'react';
import { nanoid } from 'nanoid';

interface UseSessionIdReturn {
  sessionId: string;
  generateSessionId: () => void;
}

export const useSessionId = (): UseSessionIdReturn => {
  const [sessionId, setSessionId] = useState<string>(() => nanoid());

  const generateSessionId = useCallback(() => {
    setSessionId(nanoid());
  }, []);

  return {
    sessionId,
    generateSessionId,
  };
};
