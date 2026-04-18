import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    await sql`SELECT 1`;
    return NextResponse.json({ db: 'ok', env: { DATABASE_URL: !!process.env.DATABASE_URL, ADMIN_KEY: !!process.env.ADMIN_KEY } });
  } catch (err) {
    return NextResponse.json({ db: 'error', error: String(err), env: { DATABASE_URL: !!process.env.DATABASE_URL, ADMIN_KEY: !!process.env.ADMIN_KEY } }, { status: 500 });
  }
}
