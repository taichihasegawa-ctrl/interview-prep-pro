import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { returnUrl } = await req.json();
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: 'price_1T1OXqCtIsrodTJnvn4yzPY7',
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${returnUrl || process.env.NEXT_PUBLIC_BASE_URL}?payment=success`,
      cancel_url: `${returnUrl || process.env.NEXT_PUBLIC_BASE_URL}?payment=cancelled`,
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
