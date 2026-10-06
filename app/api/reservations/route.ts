import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ReservationStatus, Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    const status = searchParams.get('status') as ReservationStatus | null;
    const myOnly = searchParams.get('my') === 'true';

    const where: any = {};

    // If user is a customer, or explicitly requested 'my', only return their reservations
    if (myOnly || (user && user.role === Role.CUSTOMER)) {
      if (!user) {
        return NextResponse.json({ error: 'Please log in to view your reservations.' }, { status: 401 });
      }
      where.userId = user.id;
    }

    if (status) {
      where.status = status;
    }

    if (dateStr) {
      const targetDate = new Date(dateStr);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      where.reservationDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const reservations = await prisma.reservation.findMany({
      where,
      include: {
        table: true,
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
      orderBy: [
        { reservationDate: 'desc' },
        { reservationTime: 'desc' },
      ],
    });

    return NextResponse.json(reservations);
  } catch (error) {
    console.error('[API /api/reservations GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const {
      tableId,
      reservationDate,
      reservationTime,
      guestsCount,
      customerName,
      customerEmail,
      customerPhone,
      specialRequests,
    } = body;

    // Validation
    const name = customerName?.trim() || user?.name;
    const email = customerEmail?.trim() || user?.email;
    const phone = customerPhone?.trim() || user?.phone || '';

    if (!tableId || !reservationDate || !reservationTime || !guestsCount || !name || !email) {
      return NextResponse.json(
        { error: 'Table, date, time, guest count, name, and email are required.' },
        { status: 400 }
      );
    }

    const guests = parseInt(guestsCount, 10);
    if (isNaN(guests) || guests <= 0) {
      return NextResponse.json({ error: 'Invalid number of guests.' }, { status: 400 });
    }

    // Verify table exists and has enough capacity
    const table = await prisma.table.findUnique({
      where: { id: tableId },
    });
    if (!table) {
      return NextResponse.json({ error: 'Selected table does not exist.' }, { status: 404 });
    }

    if (table.capacity < guests) {
      return NextResponse.json(
        { error: `Selected table has capacity for ${table.capacity} guests. Please select a larger table.` },
        { status: 400 }
      );
    }

    // Parse date
    const dateObj = new Date(reservationDate);
    const startOfDay = new Date(dateObj);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateObj);
    endOfDay.setHours(23, 59, 59, 999);

    // Double-booking check:
    // Check if there is already an active (PENDING or CONFIRMED) reservation for the same table at the same time
    const existingConflict = await prisma.reservation.findFirst({
      where: {
        tableId,
        reservationDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        reservationTime,
        status: {
          in: [ReservationStatus.PENDING, ReservationStatus.CONFIRMED],
        },
      },
    });

    if (existingConflict) {
      return NextResponse.json(
        { error: `Table ${table.tableNumber} is already reserved for ${reservationTime} on this date. Please choose another time or table.` },
        { status: 409 }
      );
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const reservationNumber = `RES-${randomSuffix}`;

    const reservation = await prisma.reservation.create({
      data: {
        reservationNumber,
        userId: user ? user.id : null,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        tableId,
        reservationDate: new Date(reservationDate),
        reservationTime,
        guestsCount: guests,
        specialRequests: specialRequests?.trim() || null,
        status: ReservationStatus.CONFIRMED,
      },
      include: {
        table: true,
      },
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error('[API /api/reservations POST] Error:', error);
    return NextResponse.json({ error: 'Failed to create reservation' }, { status: 500 });
  }
}
