import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

async function copyDir(src: string, dest: string) {
  // Create the destination directory
  await fs.mkdir(dest, { recursive: true });

  // Read source directory contents
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy subdirectories
      await copyDir(srcPath, destPath);
    } else {
      // Copy files
      await fs.copyFile(srcPath, destPath);
    }
  }
}

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
    const sourceDir = path.join(notesDir, sourcePath);
    const targetDir = targetPath 
      ? path.join(notesDir, targetPath, path.basename(sourcePath))
      : path.join(notesDir, path.basename(sourcePath));

    // Check if source directory exists
    try {
      const sourceStats = await fs.stat(sourceDir);
      if (!sourceStats.isDirectory()) {
        return NextResponse.json(
          { error: 'Source path is not a directory' },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: 'Source directory does not exist' },
        { status: 404 }
      );
    }

    // Ensure both paths are within the notes directory
    const resolvedSource = path.resolve(sourceDir);
    const resolvedTarget = path.resolve(targetDir);
    if (!resolvedSource.startsWith(path.resolve(notesDir)) ||
        !resolvedTarget.startsWith(path.resolve(notesDir))) {
      return NextResponse.json(
        { error: 'Invalid folder path' },
        { status: 400 }
      );
    }

    // Check if target directory already exists
    try {
      await fs.access(targetDir);
      return NextResponse.json(
        { error: 'A folder with this name already exists in the target location' },
        { status: 409 }
      );
    } catch {
      // Directory doesn't exist, we can proceed
    }

    // Check if target parent exists, if not create it
    const targetParent = path.dirname(targetDir);
    try {
      await fs.access(targetParent);
    } catch {
      await fs.mkdir(targetParent, { recursive: true });
    }

    // First copy the entire directory structure
    await copyDir(sourceDir, targetDir);
    
    // Then remove the source directory
    await removeDir(sourceDir);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error moving folder:', error);
    return NextResponse.json(
      { error: 'Failed to move folder' },
      { status: 500 }
    );
  }
} 