/**
 * Email notification module using SendGrid.
 * Handles all transactional email communications.
 */
import sgMail from '@sendgrid/mail';
import { UserRole, BookingStatus } from '@/types';

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@travelhub.com';
const FROM_NAME = 'Travel Experiences Hub';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  attachments?: { filename: string; content: Buffer | string; contentType?: string }[];
}

/**
 * Send a transactional email
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured');
    return;
  }

  const recipients = Array.isArray(options.to) ? options.to : [options.to];

  for (const to of recipients) {
    const msg: any = {
      to,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error(`Failed to send email to ${to}`);
    }
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
  firstName: string
): Promise<void> {
  const verificationUrl = `${APP_URL}/auth/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Verify Your Email - Travel Experiences Hub',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Travel Experiences Hub!</h2>
        <p>Hello ${firstName},</p>
        <p>Thank you for signing up. Please verify your email by clicking below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Verify Email</a>
        </div>
        <p>This link expires in 24 hours.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;"><p style="font-size: 12px; color: #666;">Travel Experiences Hub</p>
      </div>
    `,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  firstName: string
): Promise<void> {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`;

  await sendEmail({
    to: email,
    subject: 'Reset Your Password - Travel Experiences Hub',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hello ${firstName}, click below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">Reset Password</a>
        </div>
        <p>This link expires in 1 hour.</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;"><p style="font-size: 12px; color: #666;">Travel Experiences Hub</p>
      </div>
    `,
  });
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmationEmail(
  email: string,
  firstName: string,
  booking: {
    bookingNumber: string;
    experienceTitle: string;
    selectedDate: Date;
    numberOfParticipants: number;
    total: number;
    participantName: string;
    agencyName: string;
  }
): Promise<void> {
  await sendEmail({
    to: email,
    subject: `Booking Confirmed #${booking.bookingNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Booking Confirmed! 🎉</h2>
        <p>Hello ${firstName},</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Booking #:</strong> ${booking.bookingNumber}</p>
          <p><strong>Experience:</strong> ${booking.experienceTitle}</p>
          <p><strong>Date:</strong> ${booking.selectedDate.toLocaleDateString()}</p>
          <p><strong>Participants:</strong> ${booking.numberOfParticipants}</p>
          <p><strong>Total:</strong> $${booking.total.toFixed(2)}</p>
          <p><strong>Agency:</strong> ${booking.agencyName}</p>
        </div>
        <p>We'll send a reminder before your experience!</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;"><p style="font-size: 12px; color: #666;">Travel Experiences Hub</p>
      </div>
    `,
  });
}

/**
 * Send payment receipt email with invoice PDF
 */
export async function sendPaymentReceiptEmail(
  email: string,
  firstName: string,
  booking: {
    bookingNumber: string;
    experienceTitle: string;
    selectedDate: Date;
    numberOfParticipants: number;
    total: number;
    participantName: string;
    agencyName: string;
  },
  invoicePdf: Buffer
): Promise<void> {
  await sendEmail({
    to: email,
    subject: `Payment Receipt #${booking.bookingNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payment Receipt 📄</h2>
        <p>Hello ${firstName}, your payment was successful. Invoice attached.</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Receipt #:</strong> ${booking.bookingNumber}</p>
          <p><strong>Total Paid:</strong> $${booking.total.toFixed(2)}</p>
          <p><strong>Status:</strong> Paid</p>
        </div>
        <hr style="border: 1px solid #eee; margin: 20px 0;"><p style="font-size: 12px; color: #666;">Travel Experiences Hub</p>
      </div>
    `,
    attachments: [
      {
        filename: `invoice-${booking.bookingNumber}.pdf`,
        content: invoicePdf,
        contentType: 'application/pdf',
      },
    ],
  });
}

/**
 * Send booking status update email
 */
export async function sendBookingStatusUpdateEmail(
  email: string,
  firstName: string,
  booking: {
    bookingNumber: string;
    experienceTitle: string;
    selectedDate: Date;
    status: BookingStatus;
    agencyName: string;
  }
): Promise<void> {
  let statusMessage = '';
  switch (booking.status) {
    case 'CONFIRMED':
      statusMessage = 'Your booking has been confirmed!';
      break;
    case 'CANCELLED':
      statusMessage = 'Your booking has been cancelled.';
      break;
    case 'COMPLETED':
      statusMessage = 'Your booking has been completed. Hope you had an amazing experience!';
      break;
    case 'PENDING':
      statusMessage = 'Your booking is pending payment confirmation.';
      break;
  }

  await sendEmail({
    to: email,
    subject: `Booking Update #${booking.bookingNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Booking Status Update</h2>
        <p>Hello ${firstName},</p>
        <p>${statusMessage}</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Booking #:</strong> ${booking.bookingNumber}</p>
          <p><strong>Status:</strong> ${booking.status}</p>
          <p><strong>Agency:</strong> ${booking.agencyName}</p>
        </div>
        <hr style="border: 1px solid #eee; margin: 20px 0;"><p style="font-size: 12px; color: #666;">Travel Experiences Hub</p>
      </div>
    `,
  });
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  email: string,
  firstName: string,
  role: UserRole
): Promise<void> {
  let gettingStarted = '';
  if (role === 'AGENCY') {
    gettingStarted = `
      <h3>Getting Started as an Agency:</h3>
      <ul>
        <li>Create and manage your travel experiences</li>
        <li>Track bookings and payments in real-time</li>
        <li>Generate invoices automatically</li>
        <li>Manage your team and permissions</li>
      </ul>`;
  } else if (role === 'CUSTOMER') {
    gettingStarted = `
      <h3>Getting Started as a Customer:</h3>
      <ul>
        <li>Browse and book unique travel experiences</li>
        <li>Save your favorite experiences</li>
        <li>Leave reviews for experiences you enjoyed</li>
        <li>Manage your booking history</li>
      </ul>`;
  }

  await sendEmail({
    to: email,
    subject: 'Welcome to Travel Experiences Hub!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome! 👋</h2>
        <p>Hello ${firstName},</p>
        <p>Thank you for joining our platform! Your account role: <strong>${role}</strong></p>
        ${gettingStarted}
        <p><a href="${APP_URL}" style="color: #3b82f6; text-decoration: none;">Browse Experiences</a></p>
        <hr style="border: 1px solid #eee; margin: 20px 0;"><p style="font-size: 12px; color: #666;">Travel Experiences Hub</p>
      </div>
    `,
  });
}

/**
 * Send weekly digest email to agencies
 */
export async function sendWeeklyDigestEmail(
  email: string,
  agencyName: string,
  stats: {
    newBookings: number;
    newRevenue: number;
    pendingBookings: number;
    topExperiences: { title: string; bookings: number }[];
  }
): Promise<void> {
  await sendEmail({
    to: email,
    subject: `Weekly Digest - ${agencyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Weekly Digest for ${agencyName}</h2>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0;">
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
            <h4 style="margin: 0 0 5px 0; color: #666;">New Bookings</h4>
            <p style="font-size: 24px; font-weight: 600; margin: 0; color: #3b82f6;">${stats.newBookings}</p>
          </div>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
            <h4 style="margin: 0 0 5px 0; color: #666;">New Revenue</h4>
            <p style="font-size: 24px; font-weight: 600; margin: 0; color: #10b981;">$${stats.newRevenue.toFixed(2)}</p>
          </div>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
            <h4 style="margin: 0 0 5px 0; color: #666;">Pending</h4>
            <p style="font-size: 24px; font-weight: 600; margin: 0; color: #f59e0b;">${stats.pendingBookings}</p>
          </div>
        </div>
        <hr style="border: 1px solid #eee; margin: 20px 0;"><p style="font-size: 12px; color: #666;">Travel Experiences Hub</p>
      </div>
    `,
  });
}

/**
 * Send agency notification for new booking
 */
export async function sendAgencyBookingNotification(
  email: string,
  agencyName: string,
  booking: {
    bookingNumber: string;
    experienceTitle: string;
    selectedDate: Date;
    numberOfParticipants: number;
    total: number;
    customerName: string;
    customerEmail: string;
  }
): Promise<void> {
  await sendEmail({
    to: email,
    subject: `New Booking #${booking.bookingNumber} - ${agencyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Booking Alert! 📧</h2>
        <p>Hello ${agencyName},</p>
        <p>You have a new booking on your experience.</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Booking #:</strong> ${booking.bookingNumber}</p>
          <p><strong>Experience:</strong> ${booking.experienceTitle}</p>
          <p><strong>Date:</strong> ${booking.selectedDate.toLocaleDateString()}</p>
          <p><strong>Participants:</strong> ${booking.numberOfParticipants}</p>
          <p><strong>Total:</strong> $${booking.total.toFixed(2)}</p>
          <p><strong>Customer:</strong> ${booking.customerName} (${booking.customerEmail})</p>
        </div>
        <hr style="border: 1px solid #eee; margin: 20px 0;"><p style="font-size: 12px; color: #666;">Travel Experiences Hub</p>
      </div>
    `,
  });
}
