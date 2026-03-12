import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const sessionId = searchParams.get('sessionId');

  // 方法1: Clerk user_idで確認（ログイン済みユーザー）
  if (userId) {
    try {
      const { rows } = await sql`
        SELECT id FROM payments
        WHERE user_id = ${userId} AND status = 'completed'
        LIMIT 1
      `;
      return NextResponse.json({ isPaid: rows.length > 0 });
    } catch (error) {
      console.error('Check payment error:', error);
      return NextResponse.json({ isPaid: false });
    }
  }

  // 方法2: Stripe session_idで確認（リダイレクト直後）
  if (sessionId) {
    try {
      // まずDBを確認
      const { rows } = await sql`
        SELECT id FROM payments
        WHERE stripe_session_id = ${sessionId} AND status = 'completed'
        LIMIT 1
      `;
      if (rows.length > 0) {
        return NextResponse.json({ isPaid: true });
      }

      // DBになければStripe APIで直接確認（Webhookが遅延している場合）
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === 'paid') {
        // DBにも保存
        const email = session.customer_details?.email;
        const sUserId = session.metadata?.userId || session.client_reference_id || 'anonymous';
        await sql`
          INSERT INTO payments (user_id, stripe_session_id, email, amount, status, created_at)
          VALUES (${sUserId}, ${sessionId}, ${email}, ${session.amount_total}, 'completed', NOW())
          ON CONFLICT (stripe_session_id) DO NOTHING
        `;
        return NextResponse.json({ isPaid: true });
      }
    } catch (error) {
      console.error('Check session error:', error);
    }
  }

  return NextResponse.json({ isPaid: false });
}
