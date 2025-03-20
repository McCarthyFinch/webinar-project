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
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;

  const refreshStructure = useCallback(async (force = false) => {
    // If already refreshing, don't start another refresh
    if (isRefreshingRef.current && !force) {
      return;
    }

    // Check if cache is still valid and not forced
    const now = Date.now();
    if (!force && now - cacheTimeRef.current < CACHE_DURATION) {
      return;
    }

    isRefreshingRef.current = true;

    try {
      setError(null);
      const data = await getDirectoryStructure();
      
      if (data.length > 0 || retryCountRef.current >= MAX_RETRIES) {
        // If we got data or reached max retries, update the state
        setStructure(data);
        cacheTimeRef.current = now;
        retryCountRef.current = 0;
      } else if (retryCountRef.current < MAX_RETRIES) {
        // If no data and under max retries, retry after a delay
        retryCountRef.current++;
        setTimeout(() => refreshStructure(true), 800); // Retry after 800ms
      }
    } catch (err) {
      setError('Failed to load notes structure');
      console.error('Error loading structure:', err);
      
      // Retry after a delay if we haven't reached max retries
      if (retryCountRef.current < MAX_RETRIES) {
        retryCountRef.current++;
        setTimeout(() => refreshStructure(true), 800); // Retry after 800ms
      }
    } finally {
      if (retryCountRef.current >= MAX_RETRIES || !force) {
        isRefreshingRef.current = false;
      }
    }
  }, []);

  // Initial load with a slight delay to ensure session is established
  useEffect(() => {
    const timer = setTimeout(() => {
      refreshStructure();
    }, 300); // 300ms delay on initial load
    
    return () => clearTimeout(timer);
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