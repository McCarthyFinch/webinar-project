'use client';

import { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { 
  FolderSimple,
  File,
  Code,
  Brain,
  Robot,
  Database,
  Terminal,
  Globe,
  CaretDown,
  CaretRight,
  DotsThree,
  ArrowsOutLineVertical,
  ArrowsInLineVertical,
  FilePlus,
  FolderPlus
} from '@phosphor-icons/react';
import styles from './Sidebar.module.css';
import { useFileSystem } from '@/context/FileSystemContext';
import React from 'react';
import { useSelectedNote } from '@/context/SelectedNoteContext';
import { useModal } from '@/context/ModalContext';

type FileSystemItem = {
  name: string;
  path: string;
  isFolder: boolean;
  children?: FileSystemItem[];
};

// Helper function to get the appropriate icon for a path
function getItemIcon(filePath: string, isFolder: boolean) {
  if (isFolder) {
    if (filePath.includes('ai-fundamentals')) return Brain;
    if (filePath.includes('machine-learning')) return Robot;
    if (filePath.includes('algorithms')) return Database;
    if (filePath.includes('programming-basics')) return Terminal;
    if (filePath.includes('web-development')) return Globe;
    return FolderSimple;
  }
  return filePath.includes('code') ? Code : File;
}

type TreeItemProps = {
  item: FileSystemItem;
  level: number;
  onSelectNote: (path: string, type: 'local') => void;
  selectedPath: string | null;
  sidebarRef: React.RefObject<HTMLDivElement>;
  onError: (message: string) => void;
};

type FolderActionsProps = {
  onRename: () => void;
  onDelete: () => void;
  onCreateNote: (path: string) => void;
  onCreateSubfolder: () => void;
  path: string;
  hasChildren?: boolean;
  onExpandAll?: () => void;
  onCollapseAll?: () => void;
};

const FolderActions = ({
  onRename,
  onDelete,
  onCreateNote,
  onCreateSubfolder,
  path,
  hasChildren,
  onExpandAll,
  onCollapseAll
}: FolderActionsProps) => {
  const [showMoreActions, setShowMoreActions] = useState(false);
  
  return (
    <div className={styles.folderActions} onClick={(e) => e.stopPropagation()}>
      <div 
        className={styles.folderActionIcon} 
        onClick={(e) => {
          e.stopPropagation();
          onCreateNote(path);
        }}
        title="Create Note"
      >
        <FilePlus size={18} />
      </div>
      <div 
        className={styles.folderActionIcon}
        onClick={(e) => {
          e.stopPropagation();
          onCreateSubfolder();
        }}
        title="Create Subfolder"
      >
        <FolderPlus size={18} />
      </div>
      {hasChildren && onExpandAll && (
        <div 
          className={`${styles.folderActionIcon} ${styles.expandCollapseIcon}`}
          onClick={(e) => {
            e.stopPropagation();
            onExpandAll();
          }}
          title="Expand All Subfolders"
        >
          <ArrowsOutLineVertical size={18} />
        </div>
      )}
      {hasChildren && onCollapseAll && (
        <div 
          className={`${styles.folderActionIcon} ${styles.expandCollapseIcon}`}
          onClick={(e) => {
            e.stopPropagation();
            onCollapseAll();
          }}
          title="Collapse All Subfolders"
        >
          <ArrowsInLineVertical size={18} />
        </div>
      )}
      <div 
        className={styles.folderActionIcon}
        onClick={(e) => {
          e.stopPropagation();
          setShowMoreActions(!showMoreActions);
        }}
        title="More Actions"
        style={{ position: 'relative' }}
      >
        <DotsThree size={18} />
        {showMoreActions && (
          <div className={styles.moreActionsMenu}>
            <div 
              className={styles.moreAction}
              onClick={(e) => {
                e.stopPropagation();
                onRename();
                setShowMoreActions(false);
              }}
            >
              Rename
            </div>
            <div 
              className={styles.moreAction}
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
                setShowMoreActions(false);
              }}
            >
              Delete
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Add this at the top level
const DragContext = React.createContext<{
  draggedOverPath: string | null;
  setDraggedOverPath: (path: string | null) => void;
}>({
  draggedOverPath: null,
  setDraggedOverPath: () => {},
});

// Define a type for the React element with controls
interface ElementWithControls extends HTMLElement {
  __reactControls?: {
    registerChild: (path: string, controls: { setIsOpen: (isOpen: boolean) => void }) => void;
    unregisterChild: (path: string) => void;
  };
  __reactCloudControls?: {
    registerChild: (path: string, controls: { setIsOpen: (isOpen: boolean) => void }) => void;
    unregisterChild: (path: string) => void;
  };
}

const TreeItem = ({ item, level, onSelectNote, selectedPath, sidebarRef, onError }: TreeItemProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isCreatingSubfolder, setIsCreatingSubfolder] = useState(false);
  const [newName, setNewName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const paddingLeft = `${level * 12}px`;
  const Icon = getItemIcon(item.path, item.isFolder);
  const { refreshStructure } = useFileSystem();
  const { draggedOverPath, setDraggedOverPath } = useContext(DragContext);
  const { setSelectedNote } = useSelectedNote();
  const { showModal } = useModal();
  const childrenRefs = useRef<{ [key: string]: { setIsOpen: (isOpen: boolean) => void } }>({});

  // Register this component with parent when mounted
  useEffect(() => {
    if (item.isFolder) {
      // Get parent folder element by path
      const parentPath = item.path.split('/').slice(0, -1).join('/');
      const parentElement = parentPath ? 
        document.querySelector(`[data-path="${parentPath}"]`) : 
        document.querySelector(`[data-path="root"]`);
      
      if (parentElement) {
        const parentControls = (parentElement as ElementWithControls).__reactControls;
        if (parentControls && parentControls.registerChild) {
          parentControls.registerChild(item.path, { setIsOpen });
          
          // Cleanup on unmount
          return () => {
            if (parentControls.unregisterChild) {
              parentControls.unregisterChild(item.path);
            }
          };
        }
      }
    }
  }, [item.path, item.isFolder]);

  // Function to register child components
  const registerChild = useCallback((path: string, controls: { setIsOpen: (isOpen: boolean) => void }) => {
    childrenRefs.current[path] = controls;
  }, []);

  // Function to unregister child components
  const unregisterChild = useCallback((path: string) => {
    delete childrenRefs.current[path];
  }, []);

  // Function to recursively expand all subfolders
  const expandAllSubfolders = useCallback(() => {
    // First ensure this folder is open
    setIsOpen(true);
    
    // Then recursively expand all children
    Object.values(childrenRefs.current).forEach(child => {
      child.setIsOpen(true);
    });
  }, []);

  // Function to recursively collapse all subfolders
  const collapseAllSubfolders = useCallback(() => {
    // First ensure this folder is open (parent stays open)
    setIsOpen(true);
    
    // Then recursively collapse all children
    Object.values(childrenRefs.current).forEach(child => {
      child.setIsOpen(false);
    });
  }, []);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', item.path);
    e.dataTransfer.setData('application/json', JSON.stringify({
      path: item.path,
      type: item.isFolder ? 'folder' : 'file'
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!item.isFolder) return;

    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    setDraggedOverPath(item.path);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const relatedTarget = e.relatedTarget as HTMLElement;
    // Only clear if we're not entering a child element
    if (!e.currentTarget.contains(relatedTarget)) {
      setDraggedOverPath(null);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDraggedOverPath(null);

    if (!item.isFolder) return;

    const sourcePath = e.dataTransfer.getData('text/plain');
    const sourceData = JSON.parse(e.dataTransfer.getData('application/json'));
    
    if (!sourcePath || sourcePath === item.path) return;

    // Prevent dropping a folder into its own subdirectory
    if (sourceData.type === 'folder' && item.path.startsWith(sourcePath)) {
      onError("Cannot move a folder into its own subdirectory");
      return;
    }

    // Save current sidebar width
    const currentWidth = sidebarRef.current?.getBoundingClientRect().width;

    try {
      const endpoint = sourceData.type === 'folder' ? '/api/folders/move' : '/api/notes/move';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourcePath: sourcePath,
          targetPath: item.path,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to move ${sourceData.type}`);
      }

      await refreshStructure();

      // Restore sidebar width after structure refresh
      if (currentWidth && sidebarRef.current) {
        sidebarRef.current.style.setProperty('--sidebar-width', `${currentWidth}px`);
        localStorage.setItem('sidebarWidth', currentWidth.toString());
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : `Error moving ${sourceData.type}`;
      onError(message);
      console.error(`Error moving ${sourceData.type}:`, error);
    }
  };

  const handleRename = async () => {
    if (item.isFolder) {
      try {
        const response = await fetch('/api/folders/rename', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path: item.path,
            newName,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to rename folder');
        }

        await refreshStructure();
        setIsRenaming(false);
      } catch (error) {
        console.error('Error renaming folder:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (item.isFolder) {
      showModal({
        title: 'Delete Folder',
        message: 'Are you sure you want to delete this folder? This action cannot be undone.',
        type: 'warning',
        confirmLabel: 'Delete',
        cancelLabel: 'Cancel',
        onConfirm: async () => {
          try {
            const response = await fetch('/api/folders/delete', {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                path: item.path,
              }),
            });

            if (!response.ok) {
              throw new Error('Failed to delete folder');
            }

            await refreshStructure();
          } catch (error) {
            console.error('Error deleting folder:', error);
            onError('Failed to delete folder');
          }
        }
      });
    }
  };

  const handleCreateSubfolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const response = await fetch('/api/folders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${item.path}/${newFolderName}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create folder');
      }

      await refreshStructure();
      setIsCreatingSubfolder(false);
      setNewFolderName('');
      setIsOpen(true); // Open the parent folder to show the new subfolder
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleCreateNote = async (folderPath: string) => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const defaultTitle = `New Note ${timestamp}`;
      const fileName = defaultTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const path = folderPath ? `${folderPath}/${fileName}` : fileName;
      const content = `# ${defaultTitle}\n\nStart writing your note here...\n\nLast Updated: ${timestamp}`;

      const response = await fetch(`/api/notes/${path}`, {
        method: 'PUT',
        body: content,
      });

      if (!response.ok) {
        throw new Error('Failed to create note');
      }

      await refreshStructure();
      setSelectedNote(path, 'local');
    } catch (error) {
      console.error('Error creating note:', error);
      onError('Failed to create note');
    }
  };

  if (!item.isFolder) {
    const isSelected = item.path === selectedPath;
    return (
      <div
        className={`${styles.file} ${isSelected ? styles.selected : ''}`}
        style={{ paddingLeft }}
        onClick={() => onSelectNote(item.path, 'local')}
        draggable
        onDragStart={handleDragStart}
      >
        <Icon className={styles.icon} weight={isSelected ? "fill" : "regular"} />
        <span>{item.name}</span>
      </div>
    );
  }

  const hasChildren = item.children && item.children.length > 0;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={`${styles.folder} ${draggedOverPath === item.path ? styles.dragOver : ''}`}
        style={{ paddingLeft }}
        draggable
        onDragStart={handleDragStart}
        data-path={item.path}
        ref={(el) => {
          if (el) {
            (el as ElementWithControls).__reactControls = {
              registerChild,
              unregisterChild
            };
          }
        }}
      >
        <div 
          className={styles.folderContent}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          {isOpen ? (
            <CaretDown size={16} className={styles.arrow} weight="bold" />
          ) : (
            <CaretRight size={16} className={styles.arrow} weight="bold" />
          )}
          <Icon className={styles.icon} weight="fill" />
          {isRenaming ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onBlur={handleRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') setIsRenaming(false);
              }}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              className={styles.renameInput}
            />
          ) : (
            item.name
          )}
        </div>
        <FolderActions
          onRename={() => setIsRenaming(true)}
          onDelete={handleDelete}
          onCreateNote={handleCreateNote}
          onCreateSubfolder={() => setIsCreatingSubfolder(true)}
          path={item.path}
          hasChildren={hasChildren}
          onExpandAll={expandAllSubfolders}
          onCollapseAll={collapseAllSubfolders}
        />
      </div>
      {isCreatingSubfolder && (
        <div className={styles.createFolder} style={{ paddingLeft: `${(level + 1) * 12}px` }}>
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onBlur={() => {
              if (newFolderName.trim()) {
                handleCreateSubfolder();
              } else {
                setIsCreatingSubfolder(false);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateSubfolder();
              if (e.key === 'Escape') {
                setIsCreatingSubfolder(false);
                setNewFolderName('');
              }
            }}
            placeholder="Folder name..."
            autoFocus
            className={styles.createFolderInput}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      {isOpen && item.children && (
        <div className={styles.children}>
          {item.children.map((child) => (
            <TreeItem
              key={child.path}
              item={child}
              level={level + 1}
              onSelectNote={onSelectNote}
              selectedPath={selectedPath}
              sidebarRef={sidebarRef}
              onError={onError}
            />
          ))}
        </div>
      )}
    </div>
  );
};

type SidebarProps = {
  onSelectNote: (path: string | null, type: 'local' | null) => void;
  selectedPath: string | null;
};

/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
export default function Sidebar({ onSelectNote, selectedPath }: SidebarProps) {
  const { structure, error, refreshStructure: originalRefreshStructure } = useFileSystem();
  const [draggedOverPath, setDraggedOverPath] = useState<string | null>(null);
  const [isRootOpen, setIsRootOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { setSelectedNote } = useSelectedNote();
  const rootChildrenRefs = useRef<{ [key: string]: { setIsOpen: (isOpen: boolean) => void } }>({});

  // Function to register child components for root
  const registerRootChild = useCallback((path: string, controls: { setIsOpen: (isOpen: boolean) => void }) => {
    rootChildrenRefs.current[path] = controls;
  }, []);

  // Function to unregister child components for root
  const unregisterRootChild = useCallback((path: string) => {
    delete rootChildrenRefs.current[path];
  }, []);

  // Function to recursively expand all subfolders from root
  const expandAllRootSubfolders = useCallback(() => {
    // First ensure root folder is open
    setIsRootOpen(true);
    
    // Then recursively expand all children
    Object.values(rootChildrenRefs.current).forEach(child => {
      child.setIsOpen(true);
    });
  }, []);

  // Function to recursively collapse all subfolders from root
  const collapseAllRootSubfolders = useCallback(() => {
    // First ensure root folder is open (parent stays open)
    setIsRootOpen(true);
    
    // Then recursively collapse all children
    Object.values(rootChildrenRefs.current).forEach(child => {
      child.setIsOpen(false);
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    document.body.style.cursor = 'col-resize';
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !sidebarRef.current) return;
    const newWidth = Math.max(250, Math.min(600, e.clientX));
    sidebarRef.current.style.setProperty('--sidebar-width', `${newWidth}px`);
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    // Save width to localStorage
    if (sidebarRef.current) {
      const width = sidebarRef.current.getBoundingClientRect().width;
      localStorage.setItem('sidebarWidth', width.toString());
    }
  }, [handleMouseMove]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleError = useCallback((message: string) => {
    console.error('Error:', message);
  }, []);

  // Load saved width on mount and after refreshes
  useEffect(() => {
    const savedWidth = localStorage.getItem('sidebarWidth');
    console.log('Loading saved width:', savedWidth);
    if (savedWidth && sidebarRef.current) {
      requestAnimationFrame(() => {
        if (sidebarRef.current) {
          sidebarRef.current.style.setProperty('--sidebar-width', `${savedWidth}px`);
        }
      });
    }
  }, [structure]); // Re-run when structure changes

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>): Promise<void> => {
    e.preventDefault();
    e.stopPropagation();
    
    setDraggedOverPath(null);

    const sourcePath = e.dataTransfer.getData('text/plain');
    const sourceData = JSON.parse(e.dataTransfer.getData('application/json'));
    
    if (!sourcePath) return;

    // Save current sidebar width
    const currentWidth = sidebarRef.current?.getBoundingClientRect().width;

    try {
      const endpoint = sourceData.type === 'folder' ? '/api/folders/move' : '/api/notes/move';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourcePath: sourcePath,
          targetPath: '', // Empty string for root
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to move ${sourceData.type}`);
      }

      await originalRefreshStructure();

      // Restore sidebar width after structure refresh
      if (currentWidth && sidebarRef.current) {
        sidebarRef.current.style.setProperty('--sidebar-width', `${currentWidth}px`);
        localStorage.setItem('sidebarWidth', currentWidth.toString());
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : `Error moving ${sourceData.type}`;
      handleError(message);
      console.error(`Error moving ${sourceData.type}:`, error);
    }
  };

  const handleCreateNote = async (folderPath: string) => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const defaultTitle = `New Note ${timestamp}`;
      const fileName = defaultTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      const path = folderPath ? `${folderPath}/${fileName}` : fileName;
      const content = `# ${defaultTitle}\n\nStart writing your note here...\n\nLast Updated: ${timestamp}`;

      const response = await fetch(`/api/notes/${path}`, {
        method: 'PUT',
        body: content,
      });

      if (!response.ok) {
        throw new Error('Failed to create note');
      }

      await originalRefreshStructure();
      onSelectNote(path, 'local');
    } catch (error) {
      console.error('Error creating note:', error);
      handleError('Failed to create note');
    }
  };

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <DragContext.Provider value={{ draggedOverPath, setDraggedOverPath }}>
      <div className={styles.sidebar} ref={sidebarRef}>
        <div 
          className={`${styles.resizeHandle} ${isDragging ? styles.dragging : ''}`}
          onMouseDown={handleMouseDown}
        />
        <div className={styles.fileStructure}>
          <div
            className={`${styles.rootFolderItem} ${draggedOverPath === 'root' ? styles.dragOver : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            data-path="root"
            ref={(el) => {
              if (el) {
                (el as ElementWithControls).__reactControls = {
                  registerChild: registerRootChild,
                  unregisterChild: unregisterRootChild
                };
              }
            }}
          >
            <div 
              className={styles.folderContent}
              onClick={() => setIsRootOpen(!isRootOpen)}
            >
              {isRootOpen ? (
                <CaretDown size={16} className={styles.arrow} weight="bold" />
              ) : (
                <CaretRight size={16} className={styles.arrow} weight="bold" />
              )}
              <FolderSimple className={styles.icon} weight="fill" />
              <span>Local Notes</span>
            </div>
            <FolderActions
              onRename={() => {}} // Root folder can't be renamed
              onDelete={() => {}} // Root folder can't be deleted
              onCreateNote={() => handleCreateNote('')}
              onCreateSubfolder={() => setIsRootOpen(false)}
              path=""
              hasChildren={structure.length > 0}
              onExpandAll={expandAllRootSubfolders}
              onCollapseAll={collapseAllRootSubfolders}
            />
          </div>
          {isRootOpen && (
            <div className={styles.rootContent}>
              {structure.map((item) => (
                <TreeItem
                  key={item.path}
                  item={item}
                  level={1}
                  onSelectNote={onSelectNote}
                  selectedPath={selectedPath}
                  sidebarRef={sidebarRef}
                  onError={handleError}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </DragContext.Provider>
  );
}
/* eslint-enable @typescript-eslint/no-unused-vars */
/* eslint-enable @typescript-eslint/no-explicit-any */ 