import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

async function getUser(email: string) {
  const rows = await sql`SELECT addresses, selected_address_id FROM users WHERE lower(email) = ${email.toLowerCase()}`;
  return rows[0] as { addresses: unknown[]; selected_address_id: string | null } | undefined;
}

export async function GET(req: NextRequest) {
  const email = new URL(req.url).searchParams.get('email');
  if (!email) return NextResponse.json({ addresses: [], selectedAddressId: null });
  const user = await getUser(email);
  if (!user) return NextResponse.json({ addresses: [], selectedAddressId: null });
  return NextResponse.json({ addresses: user.addresses ?? [], selectedAddressId: user.selected_address_id });
}

export async function POST(req: NextRequest) {
  const { email, label, address, postcode } = await req.json();
  if (!email || !address || !postcode) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const user = await getUser(email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const addrs = (user.addresses ?? []) as Record<string, unknown>[];
  const newAddr = { id: `addr_${Date.now()}`, label: label || 'Address', address, postcode };
  addrs.push(newAddr);
  const selId = user.selected_address_id ?? newAddr.id;

  await sql`
    UPDATE users SET addresses = ${JSON.stringify(addrs)}, selected_address_id = ${selId}
    WHERE lower(email) = ${email.toLowerCase()}
  `;
  return NextResponse.json({ success: true, address: newAddr, selectedAddressId: selId });
}

export async function PATCH(req: NextRequest) {
  const { email, id } = await req.json();
  if (!email || !id) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  await sql`UPDATE users SET selected_address_id = ${id} WHERE lower(email) = ${email.toLowerCase()}`;
  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const { email, id } = await req.json();
  if (!email || !id) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const user = await getUser(email);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const addrs = (user.addresses as Record<string, unknown>[]).filter((a) => a.id !== id);
  const selId = user.selected_address_id === id ? ((addrs[0]?.id as string) ?? null) : user.selected_address_id;

  await sql`
    UPDATE users SET addresses = ${JSON.stringify(addrs)}, selected_address_id = ${selId ?? null}
    WHERE lower(email) = ${email.toLowerCase()}
  `;
  return NextResponse.json({ success: true, selectedAddressId: selId });
}
