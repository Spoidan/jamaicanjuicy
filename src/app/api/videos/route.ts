import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { TikTokVideo } from '@/types';

const VIDEOS_FILE = path.join(process.cwd(), 'src', 'data', 'tiktok-videos.json');

function readVideos(): TikTokVideo[] {
  try {
    return JSON.parse(fs.readFileSync(VIDEOS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

export async function GET() {
  return NextResponse.json(readVideos());
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const adminKey = searchParams.get('key');

  if (adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const newVideos: TikTokVideo[] = await req.json();
  fs.writeFileSync(VIDEOS_FILE, JSON.stringify(newVideos, null, 2));
  return NextResponse.json({ success: true, count: newVideos.length });
}

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const adminKey = searchParams.get('key');

  if (adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id, featured } = await req.json();
  const videos = readVideos();
  const updated = videos.map((v) => (v.id === id ? { ...v, featured } : v));

  fs.writeFileSync(VIDEOS_FILE, JSON.stringify(updated, null, 2));
  return NextResponse.json({ success: true });
}
