import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ReservationStatus, Role } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: {
        table: true,
        user: true,
      },
    });

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error('[API /api/reservations/[id] GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch reservation' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status, specialRequests, guestsCount, reservationDate, reservationTime } = body;

    const existing = await prisma.reservation.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    // Customers can only cancel their own reservations
    if (user.role === Role.CUSTOMER && existing.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (user.role === Role.CUSTOMER && status && status !== ReservationStatus.CANCELLED) {
      return NextResponse.json({ error: 'Customers can only cancel reservations' }, { status: 403 });
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        ...(status && { status: status as ReservationStatus }),
        ...(specialRequests !== undefined && { specialRequests }),
        ...(guestsCount && { guestsCount: parseInt(guestsCount, 10) }),
        ...(reservationDate && { reservationDate: new Date(reservationDate) }),
        ...(reservationTime && { reservationTime }),
      },
      include: {
        table: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[API /api/reservations/[id] PUT] Error:', error);
    return NextResponse.json({ error: 'Failed to update reservation' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const existing = await prisma.reservation.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }

    if (user.role === Role.CUSTOMER && existing.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.reservation.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Reservation deleted' });
  } catch (error) {
    console.error('[API /api/reservations/[id] DELETE] Error:', error);
    return NextResponse.json({ error: 'Failed to delete reservation' }, { status: 500 });
  }
}
