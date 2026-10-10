import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { calculateBookingPrice, generateBookingNumber } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const experienceId = searchParams.get('experienceId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: any = {};

    // Filter based on role
    if (session.role === 'CUSTOMER') {
      where.participantEmail = session.email;
    } else if (session.role === 'AGENCY') {
      // Find the agency for this user
      const agency = await prisma.agency.findUnique({
        where: { ownerId: session.id },
      });
      if (agency) {
        where.agencyId = agency.id;
      }
    }
    // ADMIN can see all bookings

    if (experienceId) {
      where.experienceId = experienceId;
    }
    if (status) {
      where.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          experience: {
            select: { id: true, title: true, coverImage: true, destination: true },
          },
          agency: {
            select: { id: true, name: true },
          },
          payment: true,
          invoice: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.booking.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      experienceId,
      selectedDate,
      numberOfParticipants,
      participantName,
      participantEmail,
      specialRequests,
    } = body;

    // Get experience
    const experience = await prisma.experience.findUnique({
      where: { id: experienceId },
      include: { agency: true },
    });

    if (!experience) {
      return NextResponse.json(
        { error: 'Experience not found' },
        { status: 404 }
      );
    }

    // Validate group size
    if (numberOfParticipants < experience.minGroupSize) {
      return NextResponse.json(
        { error: `Minimum group size is ${experience.minGroupSize}` },
        { status: 400 }
      );
    }
    if (numberOfParticipants > experience.maxGroupSize) {
      return NextResponse.json(
        { error: `Maximum group size is ${experience.maxGroupSize}` },
        { status: 400 }
      );
    }

    // Calculate pricing
    const calculation = calculateBookingPrice(
      experience.basePrice,
      numberOfParticipants,
      0, // discountPercent
      0.1, // taxRate
      0.15 // commissionRate
    );

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bookingNumber: generateBookingNumber(),
        experienceId,
        agencyId: experience.agencyId,
        userId: session.id,
        selectedDate: new Date(selectedDate),
        numberOfParticipants,
        subtotal: calculation.subtotal,
        discount: calculation.discount,
        taxes: calculation.taxes,
        total: calculation.total,
        participantName,
        participantEmail: participantEmail || session.email,
        specialRequests,
        status: 'PENDING',
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: calculation.total,
        currency: 'USD',
        status: 'PENDING',
        method: 'STRIPE',
      },
    });

    // Create invoice record
    await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${booking.bookingNumber}`,
        bookingId: booking.id,
        agencyId: experience.agencyId,
        subtotal: calculation.subtotal,
        taxAmount: calculation.taxes,
        total: calculation.total,
        status: 'DRAFT',
      },
    });

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}