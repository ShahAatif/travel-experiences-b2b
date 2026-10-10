import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { createStripePaymentIntent, createStripeCheckoutSession } from '@/lib/stripe';
import { verifyRazorpaySignature, createRazorpayOrder } from '@/lib/razorpay';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { method, amount, currency, bookingId, customerName, customerEmail } = body;

    // Validate required fields
    if (!method || !amount || !currency || !bookingId) {
      return NextResponse.json(
        { error: 'Missing required payment fields' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { experience: { include: { agency: true } } },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify amount matches the booking total
    if (Number(amount) !== Number(booking.total)) {
      return NextResponse.json(
        { error: 'Payment amount does not match booking total' },
        { status: 400 }
      );
    }

    // Verify authorization
    const userAgency = await prisma.agency.findUnique({
      where: { ownerId: session.id },
    });

    if (session.role === 'CUSTOMER' && booking.participantEmail !== session.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (session.role === 'AGENCY') {
      if (!userAgency || booking.agencyId !== userAgency.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    if (method === 'STRIPE') {
      // Create Stripe payment
      const clientSecret = await createStripePaymentIntent(bookingId, amount, currency);

      return NextResponse.json({
        success: true,
        clientSecret,
        amount,
        currency,
        method: 'STRIPE',
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
      });
    }

    if (method === 'RAZORPAY') {
      // Create Razorpay order
      const orderResult = await createRazorpayOrder(
        bookingId,
        amount,
        currency,
        { name: customerName, email: customerEmail }
      );

      return NextResponse.json({
        success: true,
        ...orderResult,
      });
    }

    return NextResponse.json(
      { error: 'Unsupported payment method' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Create payment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}