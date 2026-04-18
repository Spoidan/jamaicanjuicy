import { NextRequest, NextResponse } from 'next/server';
import sql, { parseJson } from '@/lib/db';

async function getUser(email: string) {
  const rows = await sql`SELECT addresses, selected_address_id FROM users WHERE lower(email) = ${email.toLowerCase()}`;
  if (!rows[0]) return undefined;
  return {
    addresses: parseJson<Record<string, unknown>[]>(rows[0].addresses) ?? [],
    selected_address_id: rows[0].selected_address_id as string | null,
  };
}

export async function GET(req: NextRequest) {
  try {
    const email = new URL(req.url).searchParams.get('email');
    if (!email) return NextResponse.json({ addresses: [], selectedAddressId: null });
    const user = await getUser(email);
    if (!user) return NextResponse.json({ addresses: [], selectedAddressId: null });
    return NextResponse.json({ addresses: user.addresses, selectedAddressId: user.selected_address_id });
  } catch (err) {
    console.error('[addresses GET]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, label, address, postcode } = await req.json();
    if (!email || !address || !postcode) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const user = await getUser(email);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const addrs = user.addresses;
    const newAddr = { id: `addr_${Date.now()}`, label: label || 'Address', address, postcode };
    addrs.push(newAddr);
    const selId = user.selected_address_id ?? newAddr.id;

    await sql`UPDATE users SET addresses = ${JSON.stringify(addrs)}, selected_address_id = ${selId} WHERE lower(email) = ${email.toLowerCase()}`;
    return NextResponse.json({ success: true, address: newAddr, selectedAddressId: selId });
  } catch (err) {
    console.error('[addresses POST]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { email, id } = await req.json();
    if (!email || !id) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    await sql`UPDATE users SET selected_address_id = ${id} WHERE lower(email) = ${email.toLowerCase()}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[addresses PATCH]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { email, id } = await req.json();
    if (!email || !id) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const user = await getUser(email);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const addrs = user.addresses.filter((a) => a.id !== id);
    const selId = user.selected_address_id === id ? ((addrs[0]?.id as string) ?? null) : user.selected_address_id;

    await sql`UPDATE users SET addresses = ${JSON.stringify(addrs)}, selected_address_id = ${selId ?? null} WHERE lower(email) = ${email.toLowerCase()}`;
    return NextResponse.json({ success: true, selectedAddressId: selId });
  } catch (err) {
    console.error('[addresses DELETE]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
