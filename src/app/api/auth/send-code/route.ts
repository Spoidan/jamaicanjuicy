import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import sql from '@/lib/db';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
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

    await transporter.sendMail({
      from: `"Jamaican Juicy" <${process.env.SMTP_FROM}>`,
      to: email,
      subject: 'Your verification code',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px">
          <h2 style="color:#e85d04">Jamaican Juicy</h2>
          <p>Your verification code is:</p>
          <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1a1a1a;margin:24px 0">${code}</div>
          <p style="color:#666;font-size:14px">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[send-code POST]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
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
  } catch (err) {
    console.error('[send-code PUT]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
