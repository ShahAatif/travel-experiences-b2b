import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { id: session.id },
    });

    const where: any = {};
    if (user?.role === 'AGENCY') {
      const agency = await prisma.agency.findUnique({
        where: { ownerId: session.id },
      });
      if (agency) {
        where.agencyId = agency.id;
      }
    } else if (user?.role === 'CUSTOMER') {
      const bookings = await prisma.booking.findMany({
        where: { participantEmail: user.email },
        select: { id: true },
      });
      where.bookingId = { in: bookings.map((b: { id: string }) => b.id) };
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        booking: {
          include: {
            experience: { select: { title: true } },
          },
        },
        agency: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: invoices });
  } catch (error) {
    console.error('Get invoices error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
