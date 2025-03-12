'use client';

import { createContext, useContext, ReactNode, useState, useCallback, useEffect, useRef } from 'react';
import { getDirectoryStructure } from '@/lib/fileSystem';

type FileSystemItem = {
  name: string;
  path: string;
  isFolder: boolean;
  children?: FileSystemItem[];
};

type FileSystemContextType = {
  structure: FileSystemItem[];
  error: string | null;
  refreshStructure: () => Promise<void>;
};

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

type FileSystemProviderProps = {
  children: ReactNode;
};

export function FileSystemProvider({ children }: FileSystemProviderProps) {
  const [structure, setStructure] = useState<FileSystemItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const isRefreshingRef = useRef(false);
  const cacheTimeRef = useRef<number>(0);
  const CACHE_DURATION = 1000; // 1 second cache

  const refreshStructure = useCallback(async () => {
    // If already refreshing, don't start another refresh
    if (isRefreshingRef.current) {
      return;
    }

    // Check if cache is still valid
    const now = Date.now();
    if (now - cacheTimeRef.current < CACHE_DURATION) {
      return;
    }

    isRefreshingRef.current = true;

    try {
      setError(null);
      const data = await getDirectoryStructure();
      setStructure(data);
      cacheTimeRef.current = now;
    } catch (err) {
      setError('Failed to load notes structure');
      console.error('Error loading structure:', err);
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshStructure();
  }, [refreshStructure]);

  return (
    <FileSystemContext.Provider
      value={{
        structure,
        error,
        refreshStructure
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
}

export function useFileSystem() {
  const context = useContext(FileSystemContext);
  if (context === undefined) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
} 