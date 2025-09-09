import { useRef } from 'react';
import { usePreviewController } from '../hooks';
import { IHome } from '@preview-workspace/preview-lib';
import EditDialog from './components/edit-dialog';

export function App() {
  // Create ref for iframe
  const iframeRef = useRef<any>(null);

  // Initial state for the preview
  const initialState: IHome = {
    section1: {
      id: 'section1',
      key: 'section1',
      title: 'Welcome to Preview',
      order: 1,
      image: 'https://picsum.photos/800/400?random=1',
      isUpdated: false,
    },
    section2: {
      id: 'section2',
      key: 'section2',
      title: 'Features',
      order: 2,
      children: [
        {
          id: 'child1',
          name: 'Feature 1',
          order: 1,
          isUpdated: false,
          key: 'section2Child',
        },
        {
          id: 'child2',
          name: 'Feature 2',
          order: 2,
          isUpdated: false,
          key: 'section2Child',
        },
        {
          id: 'child3',
          name: 'Feature 3',
          order: 3,
          isUpdated: false,
          key: 'section2Child',
        },
      ],
      isUpdated: false,
    },
    section3: {
      id: 'section3',
      key: 'section3',
      title: 'About Us',
      subtitle: 'Learn more about our mission and values',
      order: 3,
      cta: {
        title: 'Get Started',
        link: 'https://example.com/get-started',
        isUpdated: false,
      },
      isUpdated: false,
    },
    section4: {
      id: 'section4',
      key: 'section4',
      title: 'Carousel Section',
      order: 4,
      children: [
        {
          id: 'section4-child1',
          title: 'Carousel Item 1',
          order: 1,
          isUpdated: false,
          key: 'section4Child',
        },
        {
          id: 'section4-child2',
          title: 'Carousel Item 2',
          order: 2,
          isUpdated: false,
          key: 'section4Child',
        },
        {
          id: 'section4-child3',
          title: 'Carousel Item 3',
          order: 3,
          isUpdated: false,
          key: 'section4Child',
        },
      ],
      isUpdated: false,
    },
  };

  // Use the preview controller
  const {
    sessionId,
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
    closeEditDialog,
    saveEditDialog,
    // File mapping
    // Undo/Redo
    undo,
    redo,
    // Change tracking
    hasAnyChanges,
  } = usePreviewController({
    expirationTime: 5 * 60 * 1000, // 5 minutes
    initialState,
  });

  const iframeUrl = import.meta.env.VITE_NEXT_APP_DOMAIN
    ? `${
        import.meta.env.VITE_NEXT_APP_DOMAIN
      }api/preview?sessionId=${sessionId}`
    : `http://localhost:4201/api/preview?sessionId=${sessionId}`;

  // Check if session is disconnected (either expired or error)
  const isDisconnected = isExpired || isError;

  // Handle iframe load
  const handleIframeLoad = () => {
    if (iframeRef.current) {
      connect(iframeRef.current);
    }
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Toolbar - Fixed height of 64px */}
      <div
        style={{
          height: '64px',
          background: '#f8f9fa',
          borderBottom: '1px solid #e9ecef',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          flexShrink: 0,
        }}
      >
        {/* Left side - Change indicator */}
        {!isDisconnected && hasAnyChanges && (
          <div
            style={{
              background: '#28a745',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            ⚠️ Unsaved Changes
          </div>
        )}

        {/* Right side - Undo/Redo buttons */}
        {!isDisconnected && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={undo}
              style={{
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                background: 'white',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Undo
            </button>
            <button
              onClick={redo}
              style={{
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                background: 'white',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Redo
            </button>
          </div>
        )}
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, position: 'relative' }}>
        {/* Loading state */}
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 1000,
              background: 'white',
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            Connecting to preview...
          </div>
        )}

        {/* Error state */}
        {isError && error && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              zIndex: 1001,
              background: '#fee',
              color: '#c33',
              padding: '12px 16px',
              borderRadius: '6px',
              border: '1px solid #fcc',
              maxWidth: '300px',
            }}
          >
            <strong>Preview Error:</strong> {error}
            <button
              onClick={reconnect}
              style={{
                marginLeft: '8px',
                padding: '4px 8px',
                background: '#c33',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Expired state */}
        {isExpired && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              zIndex: 1001,
              background: '#fff3cd',
              color: '#856404',
              padding: '12px 16px',
              borderRadius: '6px',
              border: '1px solid #ffeaa7',
            }}
          >
            <strong>Session Expired</strong>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              Focus the window or navigate back to reconnect automatically
            </div>
          </div>
        )}

        {/* Edit Dialog */}
        <EditDialog
          isOpen={editDialogOpen}
          onClose={closeEditDialog}
          onSave={saveEditDialog}
          item={editItem}
          itemType={editItemType}
        />

        {/* Preview iframe - only render when not disconnected */}
        {!isDisconnected && (
          <iframe
            ref={iframeRef}
            src={iframeUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              margin: 0,
              padding: 0,
              visibility: isLoading ? 'hidden' : 'visible',
            }}
            onLoad={handleIframeLoad}
            onError={(err) => {
              onError(err);
            }}
            title="Preview Content"
          />
        )}
      </div>
    </div>
  );
}

export default App;
