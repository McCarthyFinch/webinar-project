'use client';

import { useCallback, useState, useEffect } from 'react';
import { SelectedNoteProvider } from '@/context/SelectedNoteContext';
import { useRouter, usePathname } from 'next/navigation';

export type NotesProviderProps = {
  children: React.ReactNode;
};

export default function NotesProvider({ children }: NotesProviderProps) {
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [selectedNoteType, setSelectedNoteType] = useState<'local' | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If we are on a note page, get the note path from the URL
    if (pathname?.startsWith('/note/')) {
      const path = decodeURIComponent(pathname.replace('/note/', ''));
      setSelectedNote(path);
      setSelectedNoteType('local');
    }
  }, [pathname]);

  const handleSelectNote = useCallback((path: string | null, type: 'local' | null) => {
    setSelectedNote(path);
    setSelectedNoteType(type);

    if (path && type) {
      router.push(`/note/${encodeURIComponent(path)}`);
    } else {
      router.push('/');
    }
  }, [router]);

  return (
    <SelectedNoteProvider
      initialValue={selectedNote}
      initialNoteType={selectedNoteType}
      onSelect={handleSelectNote}
    >
      {children}
    </SelectedNoteProvider>
  );
} 