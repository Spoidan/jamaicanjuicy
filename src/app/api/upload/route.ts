import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const key = new URL(req.url).searchParams.get('key');
  if (key !== process.env.ADMIN_KEY) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Storage not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' }, { status: 500 });
  }

  const filename = `product-${Date.now()}.jpg`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const res = await fetch(`${supabaseUrl}/storage/v1/object/product-images/${filename}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'image/jpeg',
    },
    body: buffer,
  });

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: `Storage error: ${err}` }, { status: 500 });
  }

  const url = `${supabaseUrl}/storage/v1/object/public/product-images/${filename}`;
  return NextResponse.json({ url });
}
