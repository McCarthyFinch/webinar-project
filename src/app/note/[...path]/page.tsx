'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import NoteViewer from '@/components/NoteViewer/NoteViewer';
import { useSelectedNote } from '@/context/SelectedNoteContext';
import styles from './page.module.css';

export default function NotePage() {
  const params = useParams();
  const { setSelectedNote } = useSelectedNote();
  const path = Array.isArray(params.path) ? params.path.join('/') : params.path as string;
  
  useEffect(() => {
    // Update the selected note context when the route changes
    setSelectedNote(path, 'local');
  }, [path, setSelectedNote]);

  return (
    <div className={styles.container}>
      <NoteViewer 
        notePath={path} 
        noteType="local"
      />
    </div>
  );
} 