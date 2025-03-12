import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface CreateNoteBody {
  title: string;
  content: string;
  path: string;
  folderId?: string;
}

// POST - Create a new cloud note
export async function POST(request: Request) {
  try {
    const { title, content, path, folderId } = (await request.json()) as CreateNoteBody;

    const note = await prisma.cloudNote.create({
      data: {
        title,
        content,
        path,
        folderId,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error creating note:', error);
    return NextResponse.json(
      { error: 'Failed to create note' },
      { status: 500 }
    );
  }
} 