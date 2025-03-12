'use client';

import { useEffect, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CodeBlock from '@/components/CodeBlock/CodeBlock';
import { PencilSimple, FloppyDisk, X, Trash } from '@phosphor-icons/react';
import { useFileSystem } from '@/context/FileSystemContext';
import { useSelectedNote } from '@/context/SelectedNoteContext';
import { useModal } from '@/context/ModalContext';
import styles from './NoteViewer.module.css';

type NoteViewerProps = {
  notePath: string | null;
  noteType: 'local' | null;
};

interface CodeProps extends React.HTMLProps<HTMLElement> {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const CodeComponent = ({ inline, className, children, ...props }: CodeProps) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';

  if (inline) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  const code = String(children || '').replace(/\n$/, '');

  return language ? (
    <CodeBlock code={code} language={language} />
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  );
};

export default function NoteViewer({ notePath, noteType }: NoteViewerProps) {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { refreshStructure } = useFileSystem();
  const { setSelectedNote } = useSelectedNote();
  const { showModal } = useModal();

  const handleError = useCallback((message: string) => {
    showModal({
      title: 'Error',
      message,
      type: 'error',
      confirmLabel: 'OK'
    });
  }, [showModal]);

  useEffect(() => {
    async function fetchNote() {
      if (!notePath) {
        setContent('Select a note to view its content.');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const endpoint = `/api/notes/${notePath}`;
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`Failed to load note: ${response.statusText}`);
        }

        const text = await response.text();
        setContent(text);
        setEditContent(text);
      } catch (error) {
        console.error('Error loading note:', error);
        setError('Error loading note content. Please try again.');
        setContent('');
      } finally {
        setLoading(false);
      }
    }

    fetchNote();
  }, [notePath, noteType]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(content);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditContent(content);
    setError(null);
  };

  const handleSave = async () => {
    if (!notePath) return;

    setIsSaving(true);
    setError(null);
    try {
      // Save to local API
      const dirPath = notePath.split('/').slice(0, -1).join('/');
      const newTitle = editContent.split('\n')[0].replace(/^#\s*/, '');
      const sanitizedTitle = newTitle.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
      const newPath = dirPath ? `${dirPath}/${sanitizedTitle}` : sanitizedTitle;

      const response = await fetch(`/api/notes/${newPath}`, {
        method: 'PUT',
        body: editContent
      });

      if (!response.ok) {
        throw new Error(`Failed to save note: ${response.statusText}`);
      }

      // Delete the old file if the path changed
      if (newPath !== notePath) {
        await fetch(`/api/notes/${notePath}`, {
          method: 'DELETE'
        });
        setSelectedNote(newPath, 'local');
      }

      // Refresh local structure after saving local note
      await refreshStructure();

      setContent(editContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving note:', error);
      setError('Error saving note. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!notePath) return;

    showModal({
      title: 'Delete Note',
      message: 'Are you sure you want to delete this note? This action cannot be undone.',
      type: 'warning',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
      onConfirm: async () => {
        setIsDeleting(true);
        setError(null);
        try {
          const endpoint = `/api/notes/${notePath}`;
          const response = await fetch(endpoint, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error(`Failed to delete note: ${response.statusText}`);
          }

          await refreshStructure();
          setSelectedNote(null, null);
        } catch (error) {
          console.error('Error deleting note:', error);
          handleError('Error deleting note. Please try again.');
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return (
      <div className={styles.error}>
        {error}
        {isEditing && (
          <button onClick={handleCancel} className={`${styles.button} ${styles.secondary}`}>
            Cancel Edit
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.noteViewer}>
      {isEditing ? (
        <>
          <div className={styles.editHeader}>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`${styles.button} ${styles.primary}`}
            >
              <FloppyDisk size={18} weight="bold" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className={`${styles.button} ${styles.secondary}`}
            >
              <X size={18} />
              Cancel
            </button>
          </div>
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className={styles.editor}
            disabled={isSaving}
          />
        </>
      ) : (
        <>
          <div className={styles.viewHeader}>
            <button onClick={handleEdit} className={`${styles.button} ${styles.primary}`}>
              <PencilSimple size={18} />
              Edit
            </button>
            {notePath && (
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className={`${styles.button} ${styles.danger}`}
              >
                <Trash size={18} />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>
          <div className={styles.content}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code: CodeComponent
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </>
      )}
    </div>
  );
}
