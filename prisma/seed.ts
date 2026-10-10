import { PrismaClient, Prisma, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const agencyPassword = await bcrypt.hash('agency123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@travelhub.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      emailVerified: true,
    },
  });

  const agency = await prisma.agency.create({
    data: {
      name: 'Wanderlust Adventures',
      email: 'agency@wanderlust.com',
      ownerId: admin.id,
      commissionPercentage: 15,
      isVerified: true,
      bankDetails: {
        bankName: 'Example Bank',
        accountNumber: '123456789',
        accountHolder: 'Wanderlust Adventures',
        routingNumber: '021000021',
      },
    },
  });

  const agencyUser = await prisma.user.create({
    data: {
      email: 'owner@wanderlust.com',
      passwordHash: agencyPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: UserRole.AGENCY,
      emailVerified: true,
    },
  });

  await prisma.agency.update({
    where: { id: agency.id },
    data: { ownerId: agencyUser.id },
  });

  await prisma.teamMember.create({
    data: {
      userId: agencyUser.id,
      agencyId: agency.id,
      role: 'owner',
      permissions: ['experiences:manage', 'bookings:manage', 'invoices:manage', 'team:manage', 'settings:manage'],
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      passwordHash: customerPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CUSTOMER,
      emailVerified: true,
    },
  });

  const experience1 = await prisma.experience.create({
    data: {
      title: 'Alpine Mountain Retreat',
      slug: 'alpine-mountain-retreat',
      description: 'Experience the breathtaking alpine landscapes with guided treks through pristine wilderness, cozy mountain lodges, and panoramic views that will take your breath away.',
      destination: 'Swiss Alps',
      category: 'Adventure',
      coverImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=800&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1200&h=800&fit=crop',
      ],
      basePrice: 1299,
      minGroupSize: 2,
      maxGroupSize: 12,
      difficultyLevel: 'MODERATE' as any,
      agencyId: agency.id,
      status: 'ACTIVE',
      averageRating: 4.8,
    },
  });

  const experience2 = await prisma.experience.create({
    data: {
      title: 'Mediterranean Coastal Escape',
      slug: 'mediterranean-coastal-escape',
      description: 'Unwind on the pristine shores of the Mediterranean with curated coastal retreats, private boat tours, and farm-to-table dining experiences.',
      destination: 'Amalfi Coast',
      category: 'Relaxation',
      coverImage: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&h=800&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&h=800&fit=crop',
      ],
      basePrice: 899,
      minGroupSize: 2,
      maxGroupSize: 16,
      difficultyLevel: 'EASY' as any,
      agencyId: agency.id,
      status: 'ACTIVE',
      averageRating: 4.6,
    },
  });

  const experience3 = await prisma.experience.create({
    data: {
      title: 'Safari Wilderness Expedition',
      slug: 'safari-wilderness-expedition',
      description: 'Embark on an unforgettable safari expedition through savannas and reserves, witnessing majestic wildlife in their natural habitat with expert guides.',
      destination: 'Serengeti, Tanzania',
      category: 'Wildlife',
      coverImage: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&h=800&fit=crop',
      images: [
        'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1200&h=800&fit=crop',
        'https://images.unsplash.com/photo-1549366021-9f761d450615?w=1200&h=800&fit=crop',
      ],
      basePrice: 2499,
      minGroupSize: 4,
      maxGroupSize: 10,
      difficultyLevel: 'HARD' as any,
      agencyId: agency.id,
      status: 'ACTIVE',
      averageRating: 4.9,
    },
  });

  const booking = await prisma.booking.create({
    data: {
      userId: customer.id,
      bookingNumber: 'BX-2024-0001',
      experienceId: experience1.id,
      agencyId: agency.id,
      selectedDate: new Date('2026-10-15T09:00:00.000Z'),
      numberOfParticipants: 4,
      subtotal: 5196,
      discount: 0,
      taxes: 415.68,
      total: 5611.68,
      participantName: 'John Doe',
      participantEmail: customer.email,
      status: 'CONFIRMED',
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      amount: booking.total,
      currency: 'USD',
      status: 'COMPLETED',
      method: 'STRIPE',
      stripePaymentIntentId: 'pi_seed_123',
    },
  });

  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2024-0001',
      bookingId: booking.id,
      agencyId: agency.id,
      subtotal: booking.subtotal,
      taxAmount: booking.taxes,
      total: booking.total,
      status: 'PAID',
    },
  });

  await prisma.review.create({
    data: {
      experienceId: experience1.id,
      rating: 5,
      title: 'Unforgettable Adventure',
      content: 'The alpine retreat exceeded all expectations. The guides were knowledgeable, the scenery was breathtaking, and the accommodations were top-notch.',
      isVerified: true,
      status: 'APPROVED',
    },
  });

  await prisma.review.create({
    data: {
      experienceId: experience2.id,
      rating: 4,
      title: 'Relaxing Getaway',
      content: 'A perfect blend of relaxation and adventure. The coastal walks were beautiful and the food was exceptional.',
      isVerified: true,
      status: 'APPROVED',
    },
  });

  console.log('Seeded database with admin, agency, customer, experiences, booking, payment, invoice, and reviews.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
