import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import sql from '@/lib/db';

function verifyPassword(password: string, salt: string, hash: string): boolean {
  try {
    const test = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(test, 'hex'), Buffer.from(hash, 'hex'));
  } catch { return false; }
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });

    const rows = await sql`SELECT * FROM users WHERE lower(email) = ${email.toLowerCase()}`;
    if (rows.length === 0) return NextResponse.json({ error: 'No account found with this email. Please register.' }, { status: 401 });

    const user = rows[0] as Record<string, unknown>;
    if (!verifyPassword(password, user.salt as string, user.password_hash as string)) {
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id, name: user.name, email: user.email, phone: user.phone,
        addresses: user.addresses, selectedAddressId: user.selected_address_id,
      },
    });
  } catch (err) {
    console.error('[auth/login POST]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
