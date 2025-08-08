import { useState, useCallback } from 'react';
import {
  IHome,
  IState,
  convertHomeToState,
} from '@preview-workspace/preview-lib';

interface UsePreviewStateProps {
  initialState: IHome;
}

interface UsePreviewStateReturn {
  currentState: IState;
  hasAnyChanges: boolean;
  imageFiles: Map<string, File>;
  setCurrentState: (state: IState) => void;
  setHasAnyChanges: (hasChanges: boolean) => void;
  addImageFile: (id: string, file: File) => void;
  removeImageFile: (id: string) => void;
  getImageFile: (id: string) => File | undefined;
}

export const usePreviewState = ({
  initialState,
}: UsePreviewStateProps): UsePreviewStateReturn => {
  const [currentState, setCurrentState] = useState<IState>(
    convertHomeToState(initialState)
  );
  const [hasAnyChanges, setHasAnyChanges] = useState(false);
  const [imageFiles, setImageFiles] = useState<Map<string, File>>(new Map());

  // File mapping functions
  const addImageFile = useCallback((id: string, file: File) => {
    setImageFiles((prev) => new Map(prev).set(id, file));
  }, []);

  const removeImageFile = useCallback((id: string) => {
    setImageFiles((prev) => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }, []);

  const getImageFile = useCallback(
    (id: string) => {
      return imageFiles.get(id);
    },
    [imageFiles]
  );

  return {
    currentState,
    hasAnyChanges,
    imageFiles,
    setCurrentState,
    setHasAnyChanges,
    addImageFile,
    removeImageFile,
    getImageFile,
  };
};
