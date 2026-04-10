import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const ALLOWED_CATEGORIES = ['salas', 'escritorios'];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ category: string }> },
) {
  const { category } = await params;

  if (!ALLOWED_CATEGORIES.includes(category)) {
    return NextResponse.json(
      { code: 'INVALID_CATEGORY', message: 'Categoria de upload inválida' },
      { status: 400 },
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { code: 'MISSING_FILE', message: 'Nenhum arquivo enviado' },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { code: 'INVALID_TYPE', message: 'Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.' },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { code: 'FILE_TOO_LARGE', message: 'Arquivo excede o limite de 5 MB' },
        { status: 400 },
      );
    }

    const uploadDir = path.join(process.cwd(), 'uploads', category);
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name.split('.').pop() ?? 'jpg';
    const uniqueName = `${crypto.randomUUID()}.${ext}`;
    const filePath = path.join(uploadDir, uniqueName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const url = `/api/upload/${category}/${uniqueName}`;

    return NextResponse.json({ url });
  } catch {
    return NextResponse.json(
      { code: 'UPLOAD_ERROR', message: 'Falha ao salvar arquivo' },
      { status: 500 },
    );
  }
}
