import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const rows = await sql`SELECT config FROM site_config WHERE id = 1`;
    return NextResponse.json(rows[0]?.config ?? {});
  } catch (err) {
    console.error('[site-config GET]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const key = new URL(req.url).searchParams.get('key');
  if (key !== process.env.ADMIN_KEY) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const updates = await req.json();
    const rows = await sql`SELECT config FROM site_config WHERE id = 1`;
    const current = (rows[0]?.config ?? {}) as Record<string, unknown>;
    const merged = deepMerge(current, updates);
    await sql`
      INSERT INTO site_config (id, config) VALUES (1, ${JSON.stringify(merged)})
      ON CONFLICT (id) DO UPDATE SET config = EXCLUDED.config
    `;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[site-config POST]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge((target[key] as Record<string, unknown>) || {}, source[key] as Record<string, unknown>);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
