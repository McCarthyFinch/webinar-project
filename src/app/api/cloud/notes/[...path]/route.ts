import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { CloudNoteWhereUnique } from '@/types/prisma';

// Helper function to validate and clean path
function cleanPath(pathSegments: string[]): string {
  return pathSegments
    .map(segment => decodeURIComponent(segment))
    .filter(Boolean)
    .map(segment => segment.trim())
    .filter(segment => !segment.includes('/') && !segment.includes('\\'))
    .join('/');
}

// GET - Fetch a note
export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = cleanPath(params.path);
    const where: CloudNoteWhereUnique = { path };
    const note = await prisma.cloudNote.findUnique({
      where,
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json(
      { error: 'Failed to fetch note' },
      { status: 500 }
    );
  }
}

// PUT - Create or update a note
export async function PUT(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = cleanPath(params.path);
    const content = await request.text();
    
    // Extract title from the first line of content
    const title = content.split('\n')[0].replace(/^#\s*/, '').trim();

    const where: CloudNoteWhereUnique = { path };
    const note = await prisma.cloudNote.upsert({
      where,
      update: {
        title,
        content,
        updatedAt: new Date(),
      },
      create: {
        path,
        title,
        content,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error saving note:', error);
    return NextResponse.json(
      { error: 'Failed to save note' },
      { status: 500 }
    );
  }
}

// DELETE - Remove a note
export async function DELETE(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    const path = cleanPath(params.path);
    const where: CloudNoteWhereUnique = { path };
    
    await prisma.cloudNote.delete({
      where,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { error: 'Failed to delete note' },
      { status: 500 }
    );
  }
} 