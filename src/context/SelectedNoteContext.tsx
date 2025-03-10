'use client';

import { createContext, useContext, ReactNode } from 'react';

type SelectedNoteContextType = {
  selectedNote: string | null;
  selectedNoteType: 'local' | null;
  setSelectedNote: (path: string | null, type: 'local' | null) => void;
};

const SelectedNoteContext = createContext<SelectedNoteContextType | undefined>(undefined);

type SelectedNoteProviderProps = {
  children: ReactNode;
  initialValue: string | null;
  initialNoteType: 'local' | null;
  onSelect: (path: string | null, type: 'local' | null) => void;
};

export function SelectedNoteProvider({ children, initialValue, initialNoteType, onSelect }: SelectedNoteProviderProps) {
  return (
    <SelectedNoteContext.Provider
      value={{
        selectedNote: initialValue,
        selectedNoteType: initialNoteType,
        setSelectedNote: onSelect,
      }}
    >
      {children}
    </SelectedNoteContext.Provider>
  );
}

export function useSelectedNote() {
  const context = useContext(SelectedNoteContext);
  if (context === undefined) {
    throw new Error('useSelectedNote must be used within a SelectedNoteProvider');
  }
  return context;
} 