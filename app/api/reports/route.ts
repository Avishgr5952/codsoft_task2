import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role, OrderStatus, PaymentStatus } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await requireAuth([Role.ADMIN]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    const dateFilter: any = {};
    if (startDateStr) {
      dateFilter.gte = new Date(startDateStr);
    }
    if (endDateStr) {
      const end = new Date(endDateStr);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end;
    }

    const orderWhere: any = {};
    if (startDateStr || endDateStr) {
      orderWhere.createdAt = dateFilter;
    }

    // 1. Order stats
    const totalOrders = await prisma.order.count({ where: orderWhere });
    const completedOrders = await prisma.order.count({
      where: { ...orderWhere, status: OrderStatus.COMPLETED },
    });
    const cancelledOrders = await prisma.order.count({
      where: { ...orderWhere, status: OrderStatus.CANCELLED },
    });
    const pendingOrders = await prisma.order.count({
      where: { ...orderWhere, status: OrderStatus.PENDING },
    });
    const preparingOrders = await prisma.order.count({
      where: { ...orderWhere, status: OrderStatus.PREPARING },
    });
    const readyOrders = await prisma.order.count({
      where: { ...orderWhere, status: OrderStatus.READY },
    });

    // 2. Revenue calculation
    const paidOrders = await prisma.order.findMany({
      where: {
        ...orderWhere,
        OR: [
          { status: OrderStatus.COMPLETED },
          { payment: { status: PaymentStatus.PAID } },
        ],
      },
      select: { totalAmount: true, createdAt: true },
    });

    const totalRevenue = paidOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);

    // 3. Customers and Tables
    const totalCustomers = await prisma.user.count({ where: { role: Role.CUSTOMER } });
    const totalReservations = await prisma.reservation.count();
    const availableTables = await prisma.table.count({ where: { status: 'AVAILABLE' } });

    // 4. Popular Menu Items
    const orderItems = await prisma.orderItem.groupBy({
      by: ['itemName'],
      _sum: {
        quantity: true,
        subtotal: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 8,
    });

    const popularItems = orderItems.map((item) => ({
      name: item.itemName,
      totalQuantity: item._sum.quantity || 0,
      totalSales: item._sum.subtotal || 0,
    }));

    // 5. Recent 7-day breakdown
    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { items: true, payment: true },
    });

    return NextResponse.json({
      summary: {
        totalOrders,
        completedOrders,
        cancelledOrders,
        pendingOrders,
        preparingOrders,
        readyOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalCustomers,
        totalReservations,
        availableTables,
      },
      popularItems,
      recentOrders,
    });
  } catch (error) {
    console.error('[API /api/reports GET] Error:', error);
    return NextResponse.json({ error: 'Failed to generate reports' }, { status: 500 });
  }
}
