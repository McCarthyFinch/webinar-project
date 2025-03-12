import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

type FileSystemItem = {
  name: string;
  path: string;
  isFolder: boolean;
  children?: FileSystemItem[];
};

async function renameFileIfNeeded(fullPath: string, newTitle: string) {
  const sanitizedTitle = newTitle
    .replace(/^#\s*/, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-');
  const newFileName = `${sanitizedTitle}.md`;
  const newPath = path.join(path.dirname(fullPath), newFileName);

  if (fullPath !== newPath) {
    try {
      // Check if the source file exists
      await fs.access(fullPath);
      // Check if the target path already exists
      try {
        await fs.access(newPath);
        // If target exists, don't rename
        return;
      } catch {
        // Target doesn't exist, safe to rename
        await fs.rename(fullPath, newPath);
      }
    } catch {
      // Source file doesn't exist, skip renaming
      return;
    }
  }
}

async function readDirectory(dirPath: string): Promise<FileSystemItem[]> {
  const items = await fs.readdir(dirPath, { withFileTypes: true });
  const result: FileSystemItem[] = [];
  const notesDir = path.join(process.cwd(), 'public', 'notes');
  const titleCount: Record<string, number> = {};

  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);
    // Get the path relative to the notes directory
    const relativePath = path.relative(notesDir, fullPath).replace(/\.md$/, '');

    if (item.isDirectory()) {
      const children = await readDirectory(fullPath);
      result.push({
        name: formatName(item.name),
        path: relativePath,
        isFolder: true,
        children,
      });
    } else if (item.name.endsWith('.md')) {
      const content = await fs.readFile(fullPath, 'utf-8');
      const firstLine = content.split('\n')[0].trim().replace(/^#\s*/, '');
      let title = firstLine || formatName(item.name.replace(/\.md$/, ''));

      // Ensure unique title
      if (titleCount[title]) {
        titleCount[title] += 1;
        title += ` (${titleCount[title]})`;
      } else {
        titleCount[title] = 1;
      }

      await renameFileIfNeeded(fullPath, title);

      result.push({
        name: title,
        path: relativePath,
        isFolder: false,
      });
    }
  }

  // Sort folders first, then files, both alphabetically
  return result.sort((a, b) => {
    if (a.isFolder && !b.isFolder) return -1;
    if (!a.isFolder && b.isFolder) return 1;
    return a.name.localeCompare(b.name);
  });
}

function formatName(name: string): string {
  // Convert kebab-case or snake_case to Title Case
  return name
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function GET() {
  try {
    const notesDir = path.join(process.cwd(), 'public', 'notes');
    const structure = await readDirectory(notesDir);
    
    return NextResponse.json(structure);
  } catch (error) {
    console.error('Error reading directory structure:', error);
    return NextResponse.json({ error: 'Failed to read directory structure' }, { status: 500 });
  }
} 