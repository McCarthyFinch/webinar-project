'use client';

import NoteViewer from '@/components/NoteViewer/NoteViewer';
import { useSelectedNote } from '@/context/SelectedNoteContext';
import styles from './page.module.css';

export default function Home() {
  const { selectedNote, selectedNoteType } = useSelectedNote();

  return (
    <div className={styles.container}>
      <NoteViewer 
        notePath={selectedNote} 
        noteType={selectedNoteType}
      />
    </div>
  );
}
