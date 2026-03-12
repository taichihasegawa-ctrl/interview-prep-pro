import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { sql } from '@vercel/postgres';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId || session.client_reference_id || 'anonymous';
    const sessionId = session.id;
    const amount = session.amount_total;
    const email = session.customer_details?.email;

    try {
      await sql`
        INSERT INTO payments (user_id, stripe_session_id, email, amount, status, created_at)
        VALUES (${userId}, ${sessionId}, ${email}, ${amount}, 'completed', NOW())
        ON CONFLICT (stripe_session_id) DO NOTHING
      `;
      console.log(`Payment recorded: user=${userId}, session=${sessionId}`);
    } catch (error) {
      console.error('Failed to save payment:', error);
      return NextResponse.json({ error: 'DB error' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
