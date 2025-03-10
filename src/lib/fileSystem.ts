type FileSystemItem = {
  name: string;
  path: string;
  isFolder: boolean;
  children?: FileSystemItem[];
};

export async function getDirectoryStructure(path: string = ''): Promise<FileSystemItem[]> {
  try {
    // Use window.location.origin to get the base URL in the browser
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const timestamp = Date.now(); // Add timestamp for cache busting
    const response = await fetch(`${baseUrl}/api/files${path ? `/${path}` : ''}?t=${timestamp}`, {
      cache: 'no-store', // Ensure no caching at fetch level
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch directory structure');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching directory structure:', error);
    return [];
  }
} 