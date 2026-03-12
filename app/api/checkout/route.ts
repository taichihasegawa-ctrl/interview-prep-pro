import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { returnUrl, userId } = await req.json();
    const baseUrl = returnUrl || process.env.NEXT_PUBLIC_BASE_URL;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1T1OXqCtIsrodTJnvn4yzPY7',
          quantity: 1,
        },
      ],
      mode: 'payment',
      // session_idをsuccess URLに含めてサーバーサイド検証に使う
      success_url: `${baseUrl}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}?payment=cancelled`,
      metadata: {
        userId: userId || 'anonymous',
      },
      client_reference_id: userId || undefined,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: '決済の初期化に失敗しました' },
      { status: 500 }
    );
  }
}
