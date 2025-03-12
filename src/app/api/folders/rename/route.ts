import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { path: folderPath, newName } = await request.json();
    
    if (!folderPath || !newName) {
      return NextResponse.json(
        { error: 'Folder path and new name are required' },
        { status: 400 }
      );
    }

    const notesDir = path.join(process.cwd(), 'public', 'notes');
    const oldPath = path.join(notesDir, folderPath);
    const newPath = path.join(path.dirname(oldPath), newName);

    // Ensure both paths are within the notes directory
    const resolvedOldPath = path.resolve(oldPath);
    const resolvedNewPath = path.resolve(newPath);
    if (!resolvedOldPath.startsWith(path.resolve(notesDir)) ||
        !resolvedNewPath.startsWith(path.resolve(notesDir))) {
      return NextResponse.json(
        { error: 'Invalid folder path' },
        { status: 400 }
      );
    }

    // Rename the folder
    await fs.rename(oldPath, newPath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error renaming folder:', error);
    return NextResponse.json(
      { error: 'Failed to rename folder' },
      { status: 500 }
    );
  }
} 