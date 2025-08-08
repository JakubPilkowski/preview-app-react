import { useCallback, useEffect } from 'react';
import { usePreviewState } from '../state';
import { useEditDialog } from '../state';
import { usePreviewConnection } from './use-preview-connection';
import { IHome, IState, MESSAGE_TYPES } from '@preview-workspace/preview-lib';

interface UsePreviewControllerProps {
  expirationTime?: number;
  initialState: IHome;
}

interface UsePreviewControllerReturn {
  state: IState;
  sessionId: string | null;
  connect: (iframe: HTMLIFrameElement) => void;
  reconnect: () => void;
  onError: (error: any) => void;
  isLoading: boolean;
  isExpired: boolean;
  isError: boolean;
  error: string | null;
  // Edit dialog state
  editDialogOpen: boolean;
  editItem: any;
  editItemType:
    | 'section1'
    | 'section2'
    | 'section3'
    | 'section4'
    | 'section2-child'
    | 'section4-child'
    | null;
  openEditDialog: (id: string) => void;
  closeEditDialog: () => void;
  saveEditDialog: (data: any, file?: File) => void;
  // File mapping
  imageFiles: Map<string, File>;
  addImageFile: (id: string, file: File) => void;
  removeImageFile: (id: string) => void;
  getImageFile: (id: string) => File | undefined;
  // Undo/Redo
  undo: () => void;
  redo: () => void;
  // Change tracking
  hasAnyChanges: boolean;
}

export const usePreviewController = ({
  expirationTime = 5 * 60 * 1000,
  initialState,
}: UsePreviewControllerProps): UsePreviewControllerReturn => {
  // State management
  const {
    currentState,
    hasAnyChanges,
    imageFiles,
    setCurrentState,
    setHasAnyChanges,
    addImageFile,
    removeImageFile,
    getImageFile,
  } = usePreviewState({ initialState });

  // Edit dialog management
  const {
    editDialogOpen,
    editItem,
    editItemType,
    openEditDialog,
    closeEditDialog,
  } = useEditDialog({ currentState });

  // Connection management (encapsulates messageBroker, usePingPong, sessionConnection)
  const {
    isLoading,
    isExpired,
    isError,
    error,
    sessionId,
    connect,
    reconnect,
    onError,
    sendMessage,
    addEventListener,
    removeEventListener,
  } = usePreviewConnection({ expirationTime });

  // Undo/Redo functions
  const undo = useCallback(() => {
    sendMessage({
      type: MESSAGE_TYPES.UNDO,
    });
  }, [sendMessage]);

  const redo = useCallback(() => {
    sendMessage({
      type: MESSAGE_TYPES.REDO,
    });
  }, [sendMessage]);

  // Save edit dialog - orchestrates sendMessage, addImageFile, and closeEditDialog
  const saveEditDialog = useCallback(
    (data: any, file?: File) => {
      if (!editItemType || !editItem) return;

      // Send command to next-app instead of updating state directly
      sendMessage({
        type: MESSAGE_TYPES.OBJECT_EDIT,
        data: {
          id: editItem.id,
          itemType: editItemType,
          properties: data,
        },
      });

      // Handle file mapping for section1
      if (file && editItemType === 'section1') {
        addImageFile(editItem.id, file);
      }

      closeEditDialog();
    },
    [editItemType, editItem, sendMessage, addImageFile, closeEditDialog]
  );

  // Event listeners management - this can change without affecting connection
  useEffect(() => {
    const handleStateChange = (data: {
      state: IState;
      hasAnyChanges?: boolean;
    }) => {
      setCurrentState(data.state);
      setHasAnyChanges(data.hasAnyChanges ?? false);
    };

    const handleConnect = () => {
      sendMessage({
        type: MESSAGE_TYPES.STATE_CHANGE,
        data: {
          state: currentState,
          hasAnyChanges,
        },
      });
    };

    const handleDisconnect = () => {
      // Close connection when disconnect is received
      onError('Disconnected by iframe');
    };

    const handleItemClick = (data: { id: string }) => {
      // Handle item click from iframe - open edit dialog
      openEditDialog(data.id);
    };

    addEventListener(MESSAGE_TYPES.STATE_CHANGE, handleStateChange);
    addEventListener(MESSAGE_TYPES.DISCONNECT, handleDisconnect);
    addEventListener(MESSAGE_TYPES.ITEM_CLICK, handleItemClick);
    addEventListener(MESSAGE_TYPES.CONNECT, handleConnect);

    return () => {
      removeEventListener(MESSAGE_TYPES.STATE_CHANGE);
      removeEventListener(MESSAGE_TYPES.DISCONNECT);
      removeEventListener(MESSAGE_TYPES.ITEM_CLICK);
      removeEventListener(MESSAGE_TYPES.CONNECT);
    };
  }, [
    addEventListener,
    removeEventListener,
    sendMessage,
    onError,
    openEditDialog,
    currentState,
    hasAnyChanges,
    setCurrentState,
    setHasAnyChanges,
  ]);

  return {
    sessionId,
    state: currentState,
    connect,
    reconnect,
    onError,
    isLoading,
    isExpired,
    isError,
    error,
    // Edit dialog state
    editDialogOpen,
    editItem,
    editItemType,
    openEditDialog,
    closeEditDialog,
    saveEditDialog,
    // File mapping
    imageFiles,
    addImageFile,
    removeImageFile,
    getImageFile,
    // Undo/Redo
    undo,
    redo,
    // Change tracking
    hasAnyChanges,
  };
};
