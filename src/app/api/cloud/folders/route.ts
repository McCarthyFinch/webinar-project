import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET - List all folders and their structure
export async function GET() {
  try {
    // Fetch all folders with their notes
    const folders = await prisma.cloudFolder.findMany({
      include: {
        notes: {
          select: {
            id: true,
            title: true,
            path: true,
            updatedAt: true,
          },
        },
        children: true,
      },
    });

    // Fetch root-level notes (notes without a folder)
    const rootNotes = await prisma.cloudNote.findMany({
      where: {
        folderId: null
      },
      select: {
        id: true,
        title: true,
        path: true,
        updatedAt: true,
      },
    });

    // Return both folders and root notes
    return NextResponse.json({
      folders,
      rootNotes
    });
  } catch (error) {
    console.error('Error fetching folders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch folders' },
      { status: 500 }
    );
  }
}

interface CreateFolderBody {
  name: string;
  path: string;
  parentId?: string;
}

// POST - Create a new folder
export async function POST(request: Request) {
  try {
    const { name, path, parentId } = (await request.json()) as CreateFolderBody;

    const folder = await prisma.cloudFolder.create({
      data: {
        name,
        path,
        parentId,
      },
      include: {
        notes: true,
        children: true,
      },
    });

    return NextResponse.json(folder);
  } catch (error) {
    console.error('Error creating folder:', error);
    return NextResponse.json(
      { error: 'Failed to create folder' },
      { status: 500 }
    );
  }
}

interface DeleteFolderBody {
  path: string;
}

// DELETE - Remove a folder and its contents
export async function DELETE(request: Request) {
  try {
    const { path } = (await request.json()) as DeleteFolderBody;

    // First, find the folder by path
    const folder = await prisma.cloudFolder.findFirst({
      where: { path },
    });

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 });
    }

    // Delete all notes in the folder
    await prisma.cloudNote.deleteMany({
      where: {
        path: {
          startsWith: path,
        },
      },
    });

    // Then delete the folder by id
    await prisma.cloudFolder.delete({
      where: { id: folder.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting folder:', error);
    return NextResponse.json(
      { error: 'Failed to delete folder' },
      { status: 500 }
    );
  }
} 