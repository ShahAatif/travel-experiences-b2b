/**
 * Razorpay payment integration module.
 * Handles Razorpay order creation, verification, and webhooks.
 */
import crypto from 'crypto';
import { db } from '@/lib/db';

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';

/**
 * Get the Razorpay key for client-side usage
 */
export function getRazorpayKey(): string {
  return RAZORPAY_KEY_ID;
}

/**
 * Verify Razorpay payment signature
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  try {
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return generatedSignature === signature;
  } catch (error) {
    console.error('Razorpay signature verification error:', error);
    return false;
  }
}

/**
 * Create a Razorpay order for a booking
 */
export async function createRazorpayOrder(
  bookingId: string,
  amount: number,
  currency: string = 'INR',
  customer?: { name: string; email: string }
): Promise<{ orderId: string; amount: number; currency: string; key: string }> {
  // Razorpay expects amount in paise (integer)
  const razorpayAmount = Math.round(amount * 100);
  const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  await db.payment.create({
    data: {
      bookingId,
      amount,
      currency,
      status: 'PENDING',
      method: 'RAZORPAY',
      razorpayOrderId: orderId,
    },
  });

  return {
    orderId,
    amount: razorpayAmount,
    currency,
    key: RAZORPAY_KEY_ID,
  };
}

/**
 * Handle Razorpay webhook events
 */
export async function handleRazorpayWebhook(body: any, headers: any): Promise<boolean> {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = headers['x-razorpay-signature'];

    if (!signature || !secret) {
      return false;
    }

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(body))
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid Razorpay webhook signature');
      return false;
    }

    if (body.event === 'payment.captured') {
      const entity = body.payload.payment.entity;
      await handleRazorpayPaymentCaptured(entity);
    } else if (body.event === 'payment.failed') {
      const entity = body.payload.payment.entity;
      await handleRazorpayPaymentFailed(entity);
    }

    return true;
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return false;
  }
}

/**
 * Handle successful Razorpay payment
 */
async function handleRazorpayPaymentCaptured(entity: any): Promise<void> {
  const orderId = entity.order_id;

  await db.payment.updateMany({
    where: { razorpayOrderId: orderId, method: 'RAZORPAY' },
    data: {
      status: 'COMPLETED',
      razorpayPaymentId: entity.id,
      razorpaySignature: entity.signature_id || undefined,
    },
  });

  const payment = await db.payment.findFirst({
    where: { razorpayOrderId: orderId },
  });

  if (payment) {
    await db.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'CONFIRMED' },
    });
  }
}

/**
 * Handle failed Razorpay payment
 */
async function handleRazorpayPaymentFailed(entity: any): Promise<void> {
  const orderId = entity.order_id;

  await db.payment.updateMany({
    where: { razorpayOrderId: orderId, method: 'RAZORPAY' },
    data: { status: 'FAILED' },
  });

  const payment = await db.payment.findFirst({
    where: { razorpayOrderId: orderId },
  });

  if (payment) {
    await db.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'PENDING' },
    });
  }
}
