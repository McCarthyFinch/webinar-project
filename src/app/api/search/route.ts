import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

type SearchResult = {
  path: string;
  title: string;
  preview: string;
};

async function searchNotes(query: string): Promise<SearchResult[]> {
  const notesDir = path.join(process.cwd(), 'public', 'notes');
  const results: SearchResult[] = [];

  async function searchDirectory(dirPath: string) {
    const items = await fs.readdir(dirPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);
      
      if (item.isDirectory()) {
        await searchDirectory(fullPath);
      } else if (item.name.endsWith('.md')) {
        const content = await fs.readFile(fullPath, 'utf-8');
        const relativePath = path.relative(notesDir, fullPath).replace(/\.md$/, '');
        
        // Search in content and filename
        const searchContent = `${item.name} ${content}`.toLowerCase();
        if (searchContent.includes(query.toLowerCase())) {
          // Get the first few lines for preview
          const preview = content
            .split('\n')
            .slice(0, 3)
            .join('\n')
            .slice(0, 200);

          results.push({
            path: relativePath,
            title: item.name.replace(/\.md$/, ''),
            preview
          });
        }
      }
    }
  }

  await searchDirectory(notesDir);
  return results;
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ results: [] as SearchResult[] });
    }

    const results = await searchNotes(query);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error searching notes:', error);
    return NextResponse.json({ error: 'Failed to search notes' }, { status: 500 });
  }
} 