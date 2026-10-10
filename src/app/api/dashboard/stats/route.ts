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

    const [
      totalBookings,
      totalRevenue,
      pendingBookings,
      confirmedBookings,
      cancelledBookings,
      completedBookings,
      recentBookings,
      revenueTrend,
      topExperiences,
    ] = await Promise.all([
      // Total bookings count
      prisma.booking.count(),

      // Total revenue
      prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),

      // Pending bookings
      prisma.booking.count({ where: { status: 'PENDING' } }),

      // Confirmed bookings
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),

      // Cancelled bookings
      prisma.booking.count({ where: { status: 'CANCELLED' } }),

      // Completed bookings
      prisma.booking.count({ where: { status: 'COMPLETED' } }),

      // Recent bookings
      prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          experience: { select: { title: true } },
          agency: { select: { name: true } },
        },
      }),

      // Revenue trend (last 6 months)
      prisma.$queryRaw`
        SELECT
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*) as bookings,
          COALESCE(SUM("total"), 0) as revenue
        FROM "bookings"
        WHERE "status" = 'COMPLETED'
          AND "createdAt" >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month ASC
      `,

      // Top experiences
      prisma.experience.findMany({
        orderBy: { averageRating: 'desc' },
        take: 5,
        include: {
          _count: { select: { bookings: true } },
        },
      }),
    ]);

    // Calculate agency-specific stats if agency user
    const agency = await prisma.agency.findUnique({
      where: { ownerId: session.id },
    });

    let agencyTotalRevenue = totalRevenue._sum.amount || 0;
    let agencyTotalBookings = totalBookings;

    if (agency) {
      const agencyStats = await prisma.$queryRaw`
        SELECT
          COUNT(*) as totalBookings,
          COALESCE(SUM("total"), 0) as totalRevenue
        FROM "bookings"
        WHERE "agencyId" = ${agency.id}
      ` as { totalBookings: bigint; totalRevenue: bigint }[];
      agencyTotalBookings = Number(agencyStats[0].totalBookings);
      agencyTotalRevenue = Number(agencyStats[0].totalRevenue);
    }

    return NextResponse.json({
      success: true,
      data: {
        totalBookings: agencyTotalBookings,
        totalRevenue: agencyTotalRevenue,
        pendingApprovals: pendingBookings,
        completedBookings: confirmedBookings + cancelledBookings,
        cancelledBookings: cancelledBookings,
        averageRating: 4.5, // Could be calculated from reviews
        recentBookings,
        revenueTrend,
        topExperiences,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}