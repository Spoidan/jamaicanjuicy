import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { SiteContent } from '@/types';

const CONTENT_FILE = path.join(process.cwd(), 'src', 'data', 'content-override.json');
const DEFAULT_CONTENT = path.join(process.cwd(), 'src', 'data', 'content.ts');

function readContent(): Partial<SiteContent> {
  try {
    if (fs.existsSync(CONTENT_FILE)) {
      return JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'));
    }
  } catch {}
  return {};
}

export async function GET() {
  return NextResponse.json(readContent());
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const adminKey = searchParams.get('key');

  if (adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const updates = await req.json();
  const current = readContent();
  const merged = { ...current, ...updates };

  fs.writeFileSync(CONTENT_FILE, JSON.stringify(merged, null, 2));
  return NextResponse.json({ success: true });
}
