import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Helper function to validate and get the file path
async function getValidatedPath(params: { path: string[] }) {
  const notesDir = path.join(process.cwd(), 'public', 'notes');
  
  // Clean and normalize the path segments
  const cleanSegments = params.path
    .map(segment => decodeURIComponent(segment))
    .filter(Boolean)
    .map(segment => segment.trim())
    .filter(segment => !segment.includes('/') && !segment.includes('\\'));

  // Create the file path
  const filePath = path.join(notesDir, ...cleanSegments) + '.md';

  // Double-check that we're still within the notes directory
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(path.resolve(notesDir))) {
    throw new Error('Access denied - path traversal attempt');
  }

  return { filePath, notesDir };
}

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const { filePath } = await getValidatedPath(params);

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      return new NextResponse(content, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Cache-Control': 'public, max-age=0, must-revalidate'
        }
      });
    } catch {
      return new NextResponse('Note not found', { status: 404 });
    }
  } catch (error) {
    console.error('Error reading note:', error);
    return new NextResponse('Error reading note', { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const { filePath, notesDir } = await getValidatedPath(params);
    const content = await request.text();

    // Ensure the base notes directory exists
    try {
      await fs.access(notesDir);
    } catch {
      await fs.mkdir(notesDir, { recursive: true });
    }

    // Ensure the category directory exists
    const categoryDir = path.dirname(filePath);
    try {
      await fs.access(categoryDir);
    } catch {
      await fs.mkdir(categoryDir, { recursive: true });
    }

    // Write the file
    await fs.writeFile(filePath, content, 'utf-8');

    return new NextResponse('Note updated successfully', { status: 200 });
  } catch (error) {
    console.error('Error updating note:', error);
    return new NextResponse(`Error updating note: ${error instanceof Error ? error.message : 'Unknown error'}`, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const { filePath } = await getValidatedPath(params);

    try {
      await fs.unlink(filePath);
      return new NextResponse('Note deleted successfully', { status: 200 });
    } catch (error) {
      console.error('Error deleting file:', error);
      return new NextResponse('Note not found', { status: 404 });
    }
  } catch (error) {
    console.error('Error deleting note:', error);
    return new NextResponse('Error deleting note', { status: 500 });
  }
} 