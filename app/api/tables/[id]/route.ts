import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role, TableStatus } from '@prisma/client';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth([Role.ADMIN, Role.KITCHEN]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = params;
    const body = await request.json();
    const { tableNumber, capacity, location, status } = body;

    const existing = await prisma.table.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    if (tableNumber && tableNumber.trim().toUpperCase() !== existing.tableNumber) {
      const duplicate = await prisma.table.findUnique({
        where: { tableNumber: tableNumber.trim().toUpperCase() },
      });
      if (duplicate && duplicate.id !== id) {
        return NextResponse.json(
          { error: 'Another table with this number already exists' },
          { status: 400 }
        );
      }
    }

    let parsedCap: number | undefined = undefined;
    if (capacity !== undefined) {
      parsedCap = parseInt(capacity, 10);
      if (isNaN(parsedCap) || parsedCap <= 0) {
        return NextResponse.json({ error: 'Capacity must be a positive number' }, { status: 400 });
      }
    }

    const updated = await prisma.table.update({
      where: { id },
      data: {
        ...(tableNumber !== undefined && { tableNumber: tableNumber.trim().toUpperCase() }),
        ...(parsedCap !== undefined && { capacity: parsedCap }),
        ...(location !== undefined && { location: location.trim() }),
        ...(status !== undefined && { status: status as TableStatus }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[API /api/tables/[id] PUT] Error:', error);
    return NextResponse.json({ error: 'Failed to update table' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await requireAuth([Role.ADMIN]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { id } = params;
    const existing = await prisma.table.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    await prisma.table.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Table deleted successfully' });
  } catch (error) {
    console.error('[API /api/tables/[id] DELETE] Error:', error);
    return NextResponse.json({ error: 'Failed to delete table' }, { status: 500 });
  }
}
