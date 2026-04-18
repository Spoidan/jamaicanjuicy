import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import sql from '@/lib/db';

export async function POST(req: NextRequest) {
  const { name, email, phone, address, postcode, password } = await req.json();
  if (!name || !email || !phone || !address || !postcode || !password) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
  }

  const existing = await sql`SELECT id FROM users WHERE lower(email) = ${email.toLowerCase()}`;
  if (existing.length > 0) {
    return NextResponse.json({ error: 'An account with this email already exists. Please sign in.' }, { status: 409 });
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = crypto.scryptSync(password, salt, 64).toString('hex');
  const id = `user_${Date.now()}`;
  const firstAddrId = `addr_${Date.now()}`;
  const addresses = [{ id: firstAddrId, label: 'Home', address, postcode }];

  await sql`
    INSERT INTO users (id, name, email, phone, addresses, selected_address_id, password_hash, salt)
    VALUES (${id}, ${name}, ${email}, ${phone}, ${JSON.stringify(addresses)}, ${firstAddrId}, ${passwordHash}, ${salt})
  `;

  return NextResponse.json({
    success: true,
    user: { id, name, email, phone, addresses, selectedAddressId: firstAddrId },
  });
}
