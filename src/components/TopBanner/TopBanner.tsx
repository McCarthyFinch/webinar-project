import { 
  MagnifyingGlass, 
  Gear, 
  User,
  X,
  Note,
  SignOut,
  UserCircle,
  Users
} from '@phosphor-icons/react';
import { useState, useEffect, useRef, FormEvent } from 'react';
import { useSelectedNote } from '@/context/SelectedNoteContext';
import { useFileSystem } from '@/context/FileSystemContext';
import styles from './TopBanner.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type SearchResult = {
  path: string;
  title: string;
  preview: string;
};

type FileSystemItem = {
  name: string;
  path: string;
  isFolder: boolean;
  children?: FileSystemItem[];
};

type UserInfo = {
  id: number;
  email: string;
  username: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
};

const findMaxNumberInDir = (items: FileSystemItem[], regex: RegExp): number => {
  let maxNumber = 0;
  for (const item of items) {
    if (!item.isFolder) {
      const match = item.path.split('/').pop()?.match(regex);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) maxNumber = num;
      }
    } else if (item.children) {
      const childMax = findMaxNumberInDir(item.children, regex);
      if (childMax > maxNumber) maxNumber = childMax;
    }
  }
  return maxNumber;
};

export default function TopBanner() {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState('programming-basics');
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const { setSelectedNote } = useSelectedNote();
  const { refreshStructure } = useFileSystem();
  const router = useRouter();

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      
      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      // Debounce search
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
          if (!response.ok) throw new Error('Search failed');
          const data = await response.json();
          setResults(data.results);
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setResults([]);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    // Close user menu when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setCurrentUser(null);
      }
    }

    checkAuthStatus();
  }, []);

  const handleResultClick = (path: string) => {
    setSelectedNote(path, 'local');
    setSearchQuery('');
    setResults([]);
  };

  const handleCreateNote = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsCreatingNote(true);

    try {
      if (!newNoteTitle.trim()) {
        throw new Error('Note title is required');
      }

      // Convert title to kebab-case for the filename
      const fileName = newNoteTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Get existing files in the category to determine next number
      const response = await fetch('/api/files');
      if (!response.ok) {
        throw new Error('Failed to check existing files');
      }
      const data = await response.json();
      
      // Find the highest number for files with the same base name
      const regex = new RegExp(`^${fileName}-(\\d+)$`);
      const maxNumber = findMaxNumberInDir(data, regex);

      // Create the unique path with the next number
      const uniquePath = `${newNoteCategory}/${fileName}-${maxNumber + 1}`;
      const content = `# ${newNoteTitle}\n\nStart writing your note here...\n\nLast Updated: ${new Date().toISOString().split('T')[0]}`;

      const saveResponse = await fetch(`/api/notes/${uniquePath}`, {
        method: 'PUT',
        body: content,
      });

      if (!saveResponse.ok) {
        const errorText = await saveResponse.text();
        throw new Error(errorText || 'Failed to create note');
      }

      // First refresh the file system
      await refreshStructure();

      // Then close the modal and reset form
      setIsNewNoteModalOpen(false);
      setNewNoteTitle('');
      setNewNoteCategory('programming-basics');

      // Finally, select the new note
      setSelectedNote(uniquePath, 'local');
    } catch (error) {
      console.error('Error creating note:', error);
      setError(error instanceof Error ? error.message : 'Failed to create note. Please try again.');
    } finally {
      setIsCreatingNote(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      // Close the user menu and redirect to login page
      setIsUserMenuOpen(false);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Helper function to get user's initials
  const getUserInitials = (username: string): string => {
    if (!username) return '';
    // Get first letter of each word in the username (for names like "John Doe")
    return username
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2); // Limit to 2 characters
  };

  return (
    <>
      <div className={styles.banner}>
        <div className={styles.left}>
          <Link href="/" className={styles.logo}>
            <Note size={24} weight="fill" />
            <span>CoolNotes</span>
          </Link>
        </div>
        
        <div className={styles.search}>
          <MagnifyingGlass 
            size={20} 
            className={`${styles.searchIcon} ${isSearching ? styles.searching : ''}`}
          />
          <input 
            type="text" 
            placeholder="Search notes..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className={styles.clearSearch} 
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
          {results.length > 0 && (
            <div className={styles.searchResults}>
              {results.map((result) => (
                <button
                  key={result.path}
                  className={styles.searchResult}
                  onClick={() => handleResultClick(result.path)}
                >
                  <div className={styles.resultTitle}>{result.title}</div>
                  <div className={styles.resultPreview}>{result.preview}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className={styles.right}>
          <button className={styles.iconButton} title="Settings">
            <Gear size={20} />
          </button>
          <div className={styles.userMenuContainer} ref={userMenuRef}>
            <button 
              className={`${styles.iconButton} ${isUserMenuOpen ? styles.active : ''}`} 
              title={currentUser ? currentUser.username : 'Profile'}
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <User size={20} />
            </button>
            {isUserMenuOpen && (
              <div className={styles.userMenu}>
                {currentUser ? (
                  <>
                    <div className={styles.userMenuHeader}>
                      <div className={styles.userAvatar}>
                        {getUserInitials(currentUser.username)}
                      </div>
                      <div className={styles.userInfo}>
                        <div className={styles.userName}>{currentUser.username}</div>
                        <div className={styles.userEmail}>
                          {currentUser.email}
                        </div>
                      </div>
                    </div>
                    <div className={styles.userMenuItem}>
                      <UserCircle size={18} weight="regular" />
                      <span>Profile</span>
                    </div>
                    {currentUser.isAdmin && (
                      <Link 
                        href="/admin/users" 
                        className={styles.userMenuItem}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Users size={18} weight="regular" />
                        <span>Manage Users</span>
                      </Link>
                    )}
                    <div className={styles.userMenuItem} onClick={handleLogout}>
                      <SignOut size={18} weight="regular" />
                      <span>Logout</span>
                    </div>
                  </>
                ) : (
                  <>
                    <Link href="/login" className={styles.userMenuItem}>
                      <SignOut size={18} weight="regular" />
                      <span>Sign in</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isNewNoteModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Create New Note</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setIsNewNoteModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateNote}>
              <div className={styles.formGroup}>
                <label htmlFor="noteTitle">Title</label>
                <input
                  id="noteTitle"
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Enter note title"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="noteCategory">Category</label>
                <select
                  id="noteCategory"
                  value={newNoteCategory}
                  onChange={(e) => setNewNoteCategory(e.target.value)}
                  required
                >
                  <option value="programming-basics">Programming Basics</option>
                  <option value="algorithms">Algorithms</option>
                  <option value="web-development">Web Development</option>
                  <option value="ai-fundamentals">AI Fundamentals</option>
                  <option value="machine-learning">Machine Learning</option>
                </select>
              </div>
              {error && <div className={styles.error}>{error}</div>}
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={`${styles.button} ${styles.secondary}`}
                  onClick={() => setIsNewNoteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${styles.button} ${styles.primary}`}
                  disabled={isCreatingNote}
                >
                  {isCreatingNote ? 'Creating...' : 'Create Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
} 