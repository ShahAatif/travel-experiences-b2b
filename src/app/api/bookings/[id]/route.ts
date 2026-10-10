import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        experience: true,
        agency: true,
        payment: true,
        invoice: true,
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (session.role === 'CUSTOMER') {
      const user = await prisma.user.findUnique({
        where: { id: session.id },
      });
      if (booking.participantEmail !== user?.email) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (session.role === 'AGENCY') {
      const agency = await prisma.agency.findUnique({
        where: { ownerId: session.id },
      });
      if (booking.agencyId !== agency?.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error('Get booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { experience: { select: { agencyId: true } } },
    });

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check authorization
    if (session.role === 'CUSTOMER') {
      const user = await prisma.user.findUnique({
        where: { id: session.id },
      });
      if (booking.participantEmail !== user?.email) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else if (session.role === 'AGENCY') {
      const agency = await prisma.agency.findUnique({
        where: { ownerId: session.id },
      });
      if (booking.agencyId !== agency?.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}