import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const destination = searchParams.get('destination') || '';
    const status = searchParams.get('status') || 'ACTIVE';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    const where: any = {
      status: status === 'all' ? undefined : status,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { destination: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (destination) {
      where.destination = { contains: destination, mode: 'insensitive' };
    }

    const [experiences, total] = await Promise.all([
      prisma.experience.findMany({
        where,
        include: {
          agency: {
            select: { name: true, id: true },
          },
          _count: { select: { bookings: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.experience.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: experiences,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get experiences error:', error);
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

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: { agency: true },
    });

    if (!user?.agency) {
      return NextResponse.json(
        { error: 'No agency found for this user' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const data: any = {};

    formData.forEach((value, key) => {
      data[key] = value;
    });

    // Convert numeric fields
    data.basePrice = parseFloat(data.basePrice);
    data.minGroupSize = parseInt(data.minGroupSize);
    data.maxGroupSize = parseInt(data.maxGroupSize);

    // Parse images array
    if (typeof data.images === 'string') {
      data.images = JSON.parse(data.images);
    }

    const experience = await prisma.experience.create({
      data: {
        ...data,
        agencyId: user.agency.id,
      },
    });

    return NextResponse.json({ success: true, data: experience });
  } catch (error) {
    console.error('Create experience error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}