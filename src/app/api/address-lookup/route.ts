import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const postcode = new URL(req.url).searchParams.get('postcode');
  if (!postcode) return NextResponse.json({ addresses: [] });

  const apiKey = process.env.GETADDRESS_API_KEY;
  if (!apiKey) {
    // No key configured — UI falls back to manual text input
    return NextResponse.json({ addresses: [] });
  }

  try {
    const clean = postcode.replace(/\s+/g, '').toUpperCase();
    const r = await fetch(
      `https://api.getaddress.io/find/${encodeURIComponent(clean)}?api-key=${apiKey}&expand=true`,
      { headers: { Accept: 'application/json' } }
    );
    if (!r.ok) return NextResponse.json({ addresses: [] });
    const data = await r.json();

    const addresses: string[] = (data.addresses ?? []).map((a: Record<string, string>) => {
      return [a.line_1, a.line_2, a.line_3, a.town_or_city]
        .filter(Boolean)
        .join(', ');
    });

    return NextResponse.json({ addresses });
  } catch {
    return NextResponse.json({ addresses: [] });
  }
}
