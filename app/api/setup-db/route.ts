import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        stripe_session_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255),
        amount INTEGER,
        status VARCHAR(50) DEFAULT 'completed',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_payments_session_id ON payments(stripe_session_id)
    `;

    return NextResponse.json({ success: true, message: 'payments table created' });
  } catch (error) {
    console.error('Setup DB error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
