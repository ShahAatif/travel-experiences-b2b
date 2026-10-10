import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { handleStripeWebhook, verifyStripeSignature } from '@/lib/stripe';
import { handleRazorpayWebhook } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = request.headers.get('x-razorpay-signature') || '';

    // Determine which gateway this is from
    const userAgent = request.headers.get('user-agent') || '';

    if (sig || userAgent.includes('razorpay')) {
      // Razorpay webhook
      const headers = {
        'x-razorpay-signature': sig,
      };

      await handleRazorpayWebhook(JSON.parse(body), headers);
      return NextResponse.json({ received: true });
    }

    // Stripe webhook
    const stripeSig = request.headers.get('stripe-signature') || '';
    const event = verifyStripeSignature(body, stripeSig);
    await handleStripeWebhook(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    );
  }
}