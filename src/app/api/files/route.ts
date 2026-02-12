import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Виносимо інтерфейс, щоб його можна було експортувати за потреби
export interface FileData {
  name: string;
  size: string;
  url: string;
}

export async function GET() {
  const dir = path.join(process.cwd(), 'public/files');
  
  try {
    if (!fs.existsSync(dir)) {
      return NextResponse.json({ error: 'Папка не знайдена' }, { status: 404 });
    }

    const fileNames: string[] = fs.readdirSync(dir);
    
    const files: FileData[] = fileNames.map((name) => {
      const stats = fs.statSync(path.join(dir, name));
      return {
        name,
        size: (stats.size / 1024).toFixed(2) + ' KB',
        url: `/files/${name}`,
      };
    });

    return NextResponse.json(files);
  } catch (error) {
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 });
  }
}