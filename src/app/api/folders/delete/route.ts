import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

async function removeDir(dirPath: string) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      await removeDir(fullPath);
    } else {
      await fs.unlink(fullPath);
    }
  }

  await fs.rmdir(dirPath);
}

export async function DELETE(request: Request) {
  try {
    const { path: folderPath } = await request.json();
    
    if (!folderPath) {
      return NextResponse.json(
        { error: 'Folder path is required' },
        { status: 400 }
      );
    }

    const notesDir = path.join(process.cwd(), 'public', 'notes');
    const targetPath = path.join(notesDir, folderPath);

    // Ensure the path is within the notes directory
    const resolvedPath = path.resolve(targetPath);
    if (!resolvedPath.startsWith(path.resolve(notesDir))) {
      return NextResponse.json(
        { error: 'Invalid folder path' },
        { status: 400 }
      );
    }

    // Check if it's a directory
    const stats = await fs.stat(targetPath);
    if (!stats.isDirectory()) {
      return NextResponse.json(
        { error: 'Path is not a directory' },
        { status: 400 }
      );
    }

    // Delete the folder and its contents
    await removeDir(targetPath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json(
      { error: 'Failed to delete folder' },
      { status: 500 }
    );
  }
} 