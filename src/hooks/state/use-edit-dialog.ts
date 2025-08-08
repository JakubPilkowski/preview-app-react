import { useState, useCallback } from 'react';
import {
  Section1,
  Section2,
  Section3,
  Section4,
  ISection2Child,
  ISection4Child,
  IState,
} from '@preview-workspace/preview-lib';

interface UseEditDialogProps {
  currentState: IState;
}

interface UseEditDialogReturn {
  editDialogOpen: boolean;
  editItem:
    | Section1
    | Section2
    | Section3
    | Section4
    | ISection2Child
    | ISection4Child
    | null;
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
}

export const useEditDialog = ({
  currentState,
}: UseEditDialogProps): UseEditDialogReturn => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<
    | Section1
    | Section2
    | Section3
    | Section4
    | ISection2Child
    | ISection4Child
    | null
  >(null);
  const [editItemType, setEditItemType] = useState<
    | 'section1'
    | 'section2'
    | 'section3'
    | 'section4'
    | 'section2-child'
    | 'section4-child'
    | null
  >(null);

  const openEditDialog = useCallback(
    (id: string) => {
      if (!currentState) return;

      // Find item by ID in the state array
      const section1 = currentState.find(
        (s) => s.key === 'section1'
      ) as Section1;
      const section2 = currentState.find(
        (s) => s.key === 'section2'
      ) as Section2;
      const section3 = currentState.find(
        (s) => s.key === 'section3'
      ) as Section3;
      const section4 = currentState.find(
        (s) => s.key === 'section4'
      ) as Section4;

      if (section1 && id === section1.id) {
        setEditItem(section1);
        setEditItemType('section1');
      } else if (section2 && id === section2.id) {
        setEditItem(section2);
        setEditItemType('section2');
      } else if (section3 && id === section3.id) {
        setEditItem(section3);
        setEditItemType('section3');
      } else if (section4 && id === section4.id) {
        setEditItem(section4);
        setEditItemType('section4');
      } else if (section2) {
        // Check if it's a section2 child
        const child = section2.children.find((c) => c.id === id);
        if (child) {
          setEditItem(child);
          setEditItemType('section2-child');
        }
      } else if (section4) {
        // Check if it's a section4 child
        const child = section4.children.find((c) => c.id === id);
        if (child) {
          setEditItem(child);
          setEditItemType('section4-child');
        }
      }
      setEditDialogOpen(true);
    },
    [currentState]
  );

  const closeEditDialog = useCallback(() => {
    setEditDialogOpen(false);
    setEditItem(null);
    setEditItemType(null);
  }, []);

  return {
    editDialogOpen,
    editItem,
    editItemType,
    openEditDialog,
    closeEditDialog,
  };
};
