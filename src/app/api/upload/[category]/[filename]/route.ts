import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import path from 'path';

const ALLOWED_CATEGORIES = ['salas', 'escritorios'];

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ category: string; filename: string }> },
) {
  const { category, filename } = await params;

  if (!ALLOWED_CATEGORIES.includes(category)) {
    return NextResponse.json(
      { code: 'NOT_FOUND', message: 'Recurso não encontrado' },
      { status: 404 },
    );
  }

  // Prevent path traversal
  const safeName = path.basename(filename);
  const filePath = path.join(process.cwd(), 'uploads', category, safeName);

  try {
    await stat(filePath);
  } catch {
    return NextResponse.json(
      { code: 'NOT_FOUND', message: 'Arquivo não encontrado' },
      { status: 404 },
    );
  }

  const ext = safeName.split('.').pop()?.toLowerCase() ?? '';
  const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';

  const buffer = await readFile(filePath);

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
