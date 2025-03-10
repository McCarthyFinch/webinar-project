import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    
    if (!name) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }

    const notesDir = path.join(process.cwd(), 'public', 'notes');
    const folderPath = path.join(notesDir, name);

    // Ensure the path is within the notes directory
    const resolvedPath = path.resolve(folderPath);
    if (!resolvedPath.startsWith(path.resolve(notesDir))) {
      return NextResponse.json(
        { error: 'Invalid folder path' },
        { status: 400 }
      );
    }

    // Create the folder
    await fs.mkdir(folderPath, { recursive: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    );
  }
} 