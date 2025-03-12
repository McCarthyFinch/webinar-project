import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { sourcePath, targetPath } = await request.json();
    
    if (!sourcePath) {
      return NextResponse.json(
        { error: 'Source path is required' },
        { status: 400 }
      );
    }

    const notesDir = path.join(process.cwd(), 'public', 'notes');
    const sourceFilePath = path.join(notesDir, `${sourcePath}.md`);
    
    // Check if source file exists
    try {
      await fs.access(sourceFilePath);
    } catch {
      return NextResponse.json(
        { error: 'Source file does not exist' },
        { status: 404 }
      );
    }
    
    // Get the filename from the source path
    const fileName = path.basename(sourcePath);
    
    // If targetPath is empty, move to root level
    const targetFilePath = targetPath 
      ? path.join(notesDir, targetPath, `${fileName}.md`)
      : path.join(notesDir, `${fileName}.md`);

    // Ensure the paths are within the notes directory
    const resolvedSource = path.resolve(sourceFilePath);
    const resolvedTarget = path.resolve(targetFilePath);
    if (!resolvedSource.startsWith(path.resolve(notesDir)) ||
        !resolvedTarget.startsWith(path.resolve(notesDir))) {
      return NextResponse.json(
        { error: 'Invalid path' },
        { status: 400 }
      );
    }

    // Check if target directory exists, if not create it
    const targetDir = path.dirname(targetFilePath);
    try {
      await fs.access(targetDir);
    } catch {
      await fs.mkdir(targetDir, { recursive: true });
    }

    // Check if target file already exists
    try {
      await fs.access(targetFilePath);
      return NextResponse.json(
        { error: 'A file with this name already exists in the target directory' },
        { status: 409 }
      );
    } catch {
      // File doesn't exist, we can proceed
    }

    // Move the file
    await fs.rename(sourceFilePath, targetFilePath);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error moving note:', error);
    return NextResponse.json(
      { error: 'Failed to move note' },
      { status: 500 }
    );
  }
} 