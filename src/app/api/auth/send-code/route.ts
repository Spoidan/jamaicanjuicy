import { NextRequest, NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

  await sql`
    INSERT INTO verification_codes (email, code, expires_at)
    VALUES (${email.toLowerCase()}, ${code}, ${expiresAt})
    ON CONFLICT (email) DO UPDATE SET code = EXCLUDED.code, expires_at = EXCLUDED.expires_at
  `;

  // TODO: wire up email provider (Resend / SendGrid / Nodemailer) in production
  if (process.env.NODE_ENV === 'development') {
    console.log(`\n🧃 [DEV] Verification code for ${email}: ${code}\n`);
  }

  return NextResponse.json({
    success: true,
    ...(process.env.NODE_ENV === 'development' && { devCode: code }),
  });
}

export async function PUT(req: NextRequest) {
  const { email, code } = await req.json();
  const rows = await sql`
    SELECT code, expires_at FROM verification_codes WHERE email = ${email?.toLowerCase()}
  `;

  if (rows.length === 0) return NextResponse.json({ error: 'No code sent to this email' }, { status: 400 });
  const { code: stored, expires_at } = rows[0] as { code: string; expires_at: Date };

  if (new Date() > new Date(expires_at)) {
    await sql`DELETE FROM verification_codes WHERE email = ${email.toLowerCase()}`;
    return NextResponse.json({ error: 'Code expired' }, { status: 400 });
  }
  if (stored !== code) return NextResponse.json({ error: 'Incorrect code' }, { status: 400 });

  await sql`DELETE FROM verification_codes WHERE email = ${email.toLowerCase()}`;
  return NextResponse.json({ success: true, verified: true });
}
