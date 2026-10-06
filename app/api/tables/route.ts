import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role, TableStatus } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as TableStatus | null;
    const minGuests = searchParams.get('guests');

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (minGuests) {
      const g = parseInt(minGuests, 10);
      if (!isNaN(g)) {
        where.capacity = { gte: g };
      }
    }

    const tables = await prisma.table.findMany({
      where,
      orderBy: { tableNumber: 'asc' },
    });

    return NextResponse.json(tables);
  } catch (error) {
    console.error('[API /api/tables GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth([Role.ADMIN]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { tableNumber, capacity, location, status } = body;

    if (!tableNumber || !capacity || !location) {
      return NextResponse.json(
        { error: 'Table number, capacity, and location are required' },
        { status: 400 }
      );
    }

    const capNum = parseInt(capacity, 10);
    if (isNaN(capNum) || capNum <= 0) {
      return NextResponse.json(
        { error: 'Capacity must be a positive number' },
        { status: 400 }
      );
    }

    const existing = await prisma.table.findUnique({
      where: { tableNumber: tableNumber.trim() },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'A table with this number already exists' },
        { status: 400 }
      );
    }

    const table = await prisma.table.create({
      data: {
        tableNumber: tableNumber.trim().toUpperCase(),
        capacity: capNum,
        location: location.trim(),
        status: (status as TableStatus) || TableStatus.AVAILABLE,
      },
    });

    return NextResponse.json(table, { status: 201 });
  } catch (error) {
    console.error('[API /api/tables POST] Error:', error);
    return NextResponse.json({ error: 'Failed to create table' }, { status: 500 });
  }
}
