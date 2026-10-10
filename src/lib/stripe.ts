/**
 * Stripe payment integration module.
 * Handles Stripe checkout sessions, payment intents, and webhooks.
 */
import Stripe from 'stripe';
import { db } from '@/lib/db';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export const stripeClient = stripe;

/**
 * Get the publishable key for client-side usage
 */
export function getStripePublishableKey(): string {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
}

/**
 * Create a Stripe Payment Intent for a booking
 */
export async function createStripePaymentIntent(
  bookingId: string,
  amount: number,
  currency: string = 'USD'
): Promise<string> {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: currency.toLowerCase(),
    metadata: {
      bookingId,
      platform: 'TravelExperiencesB2B',
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return paymentIntent.client_secret || '';
}

/**
 * Create a Stripe Checkout Session for a booking
 */
export async function createStripeCheckoutSession(
  bookingId: string,
  amount: number,
  currency: string,
  customerData: { name: string; email: string },
  successUrl: string,
  cancelUrl: string,
  agencyId?: string
): Promise<{ sessionId: string; url: string | null }> {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: customerData.email,
    line_items: [
      {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: 'Travel Experience Booking',
            description: `Booking #${bookingId}`,
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId,
      agencyId: agencyId || '',
    },
    success_url: successUrl,
    cancel_url: cancelUrl,
  });

  return { sessionId: session.id, url: session.url };
}

/**
 * Verify Stripe webhook signature
 */
export function verifyStripeSignature(body: string | Buffer, signature: string): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET not configured');
  }

  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}

/**
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const bookingId = paymentIntent.metadata.bookingId;

      if (bookingId) {
        await db.payment.updateMany({
          where: { bookingId, method: 'STRIPE' },
          data: { status: 'COMPLETED', stripePaymentIntentId: paymentIntent.id },
        });

        await db.booking.update({
          where: { id: bookingId },
          data: { status: 'CONFIRMED' },
        });
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const bookingId = paymentIntent.metadata.bookingId;

      if (bookingId) {
        await db.payment.updateMany({
          where: { bookingId, method: 'STRIPE' },
          data: { status: 'FAILED' },
        });

        await db.booking.update({
          where: { id: bookingId },
          data: { status: 'PENDING' },
        });
      }
      break;
    }

    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;

      if (bookingId) {
        await db.payment.updateMany({
          where: { bookingId, method: 'STRIPE' },
          data: {
            status: 'COMPLETED',
            stripePaymentIntentId: session.payment_intent as string,
          },
        });

        await db.booking.update({
          where: { id: bookingId },
          data: { status: 'CONFIRMED' },
        });
      }
      break;
    }

    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }
}

/**
 * Refund a Stripe payment
 */
export async function refundStripePayment(paymentIntentId: string, amount?: number) {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    ...(amount ? { amount: Math.round(amount * 100) } : {}),
  });
}
