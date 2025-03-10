import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';
import { CloudFolder } from '@prisma/client';

// Helper function to read local note content
async function readLocalNote(localPath: string): Promise<string> {
  const notesDir = path.join(process.cwd(), 'public', 'notes');
  const fullPath = path.join(notesDir, `${localPath}.md`);
  return fs.readFile(fullPath, 'utf-8');
}

// Helper function to write local note
async function writeLocalNote(localPath: string, content: string) {
  const notesDir = path.join(process.cwd(), 'public', 'notes');
  const fullPath = path.join(notesDir, `${localPath}.md`);
  const dir = path.dirname(fullPath);
  
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(fullPath, content, 'utf-8');
}

// Helper function to ensure folder exists
async function ensureCloudFolder(folderPath: string): Promise<string | null> {
  if (!folderPath) return null;
  
  const parts = folderPath.split('/');
  let currentPath = '';
  let parentId: string | null = null;
  
  for (const part of parts) {
    currentPath = currentPath ? `${currentPath}/${part}` : part;
    
    let folder: CloudFolder;
    const existingFolder = await prisma.cloudFolder.findFirst({
      where: { path: currentPath }
    });
    
    if (existingFolder) {
      folder = existingFolder;
    } else {
      folder = await prisma.cloudFolder.create({
        data: {
          name: part,
          path: currentPath,
          parentId
        }
      });
    }
    
    parentId = folder.id;
  }
  
  return parentId;
}

// Helper function to generate a unique path
async function generateUniquePath(basePath: string): Promise<string> {
  let path = basePath;
  let counter = 1;
  
  while (true) {
    const existing = await prisma.cloudNote.findFirst({
      where: { path }
    });
    
    if (!existing) {
      return path;
    }
    
    const ext = basePath.endsWith('.md') ? '.md' : '';
    const nameWithoutExt = basePath.replace(/\.md$/, '');
    path = `${nameWithoutExt}-${counter}${ext}`;
    counter++;
  }
}

interface MoveNoteBody {
  sourcePath: string;
  targetPath: string;
  sourceType: 'local' | 'cloud';
  targetType: 'local' | 'cloud';
}

export async function POST(request: Request) {
  try {
    const { sourcePath, targetPath, sourceType, targetType } = (await request.json()) as MoveNoteBody;

    if (sourceType === 'cloud' && targetType === 'cloud') {
      // Moving between cloud folders
      const note = await prisma.cloudNote.findFirst({
        where: { path: sourcePath }
      });

      if (!note) {
        return NextResponse.json(
          { error: 'Source note not found' },
          { status: 404 }
        );
      }

      // Get or create the target folder if needed
      const targetDir = path.dirname(targetPath);
      const folderId = targetDir !== '.' ? await ensureCloudFolder(targetDir) : null;

      // Generate the new path for the note
      const noteName = path.basename(sourcePath);
      const newPath = targetDir === '.' ? noteName : `${targetDir}/${noteName}`;

      // Check if a note with this path already exists
      const existingNote = await prisma.cloudNote.findFirst({
        where: { 
          path: newPath,
          id: { not: note.id }
        }
      });

      if (existingNote) {
        return NextResponse.json(
          { error: 'A note with this name already exists in the target location' },
          { status: 409 }
        );
      }

      // Update the note with the new folder ID and path
      await prisma.cloudNote.update({
        where: { id: note.id },
        data: { 
          folderId,
          path: newPath
        }
      });

      return NextResponse.json({ success: true });
    }

    if (sourceType === 'local' && targetType === 'cloud') {
      try {
        // Moving from local to cloud
        const content = await readLocalNote(sourcePath);
        const title = content.split('\n')[0].replace(/^#\s*/, '').trim();
        
        // Get or create the target folder if needed
        const targetDir = path.dirname(targetPath);
        const folderId = targetDir !== '.' ? await ensureCloudFolder(targetDir) : null;
        
        // Construct the cloud path
        const noteName = path.basename(sourcePath);
        const baseCloudPath = targetDir === '.' ? noteName : `${targetDir}/${noteName}`;
        const cloudPath = await generateUniquePath(baseCloudPath);
        
        // Check if a note with this path already exists
        const existingNote = await prisma.cloudNote.findFirst({
          where: { path: cloudPath }
        });

        if (existingNote) {
          return NextResponse.json(
            { error: 'A note with this name already exists in the target location' },
            { status: 409 }
          );
        }
        
        // Create note in cloud
        await prisma.cloudNote.create({
          data: {
            title,
            content,
            path: cloudPath,
            folderId
          },
        });

        // Delete local file
        const notesDir = path.join(process.cwd(), 'public', 'notes');
        await fs.unlink(path.join(notesDir, `${sourcePath}.md`));

        return NextResponse.json({ success: true });
      } catch (error) {
        console.error('Detailed error moving to cloud:', error);
        throw error;
      }
    } else if (sourceType === 'cloud' && targetType === 'local') {
      // Moving from cloud to local
      const note = await prisma.cloudNote.findFirst({
        where: { path: sourcePath }
      });

      if (!note) {
        return NextResponse.json(
          { error: 'Source note not found' },
          { status: 404 }
        );
      }

      // Construct the local path
      const noteName = path.basename(sourcePath);
      const localPath = targetPath ? `${targetPath}/${noteName}` : noteName;

      try {
        // Write to local file system
        await writeLocalNote(localPath, note.content);

        // Delete from cloud
        await prisma.cloudNote.delete({
          where: { id: note.id }
        });

        return NextResponse.json({ success: true });
      } catch (error) {
        if (error instanceof Error && error.message.includes('EEXIST')) {
          return NextResponse.json(
            { error: 'A note with this name already exists in the target location' },
            { status: 409 }
          );
        }
        throw error;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error moving note:', error);
    return NextResponse.json(
      { error: 'Failed to move note' },
      { status: 500 }
    );
  }
} 