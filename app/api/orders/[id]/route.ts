import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { OrderStatus, PaymentStatus, Role } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        payment: true,
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('[API /api/orders/[id] GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
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
    const { status, paymentStatus } = body;

    const existing = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: { payment: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Authorization check
    if (user.role === Role.CUSTOMER) {
      // Customer can only cancel their own pending order
      if (existing.userId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (status !== OrderStatus.CANCELLED) {
        return NextResponse.json(
          { error: 'Customers can only cancel their pending orders.' },
          { status: 403 }
        );
      }
      if (existing.status !== OrderStatus.PENDING) {
        return NextResponse.json(
          { error: 'Cannot cancel an order that has already been confirmed or started.' },
          { status: 400 }
        );
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: existing.id },
      data: {
        ...(status && { status: status as OrderStatus }),
      },
      include: {
        items: {
          include: { menuItem: true },
        },
        payment: true,
      },
    });

    // If payment status is also updated or if marking completed with cash
    if (paymentStatus && existing.payment) {
      await prisma.payment.update({
        where: { id: existing.payment.id },
        data: {
          status: paymentStatus as PaymentStatus,
          paidAt: paymentStatus === PaymentStatus.PAID ? new Date() : existing.payment.paidAt,
        },
      });
    } else if (
      status === OrderStatus.COMPLETED &&
      existing.payment &&
      existing.payment.status === PaymentStatus.PENDING
    ) {
      // Mark as paid on order completion
      await prisma.payment.update({
        where: { id: existing.payment.id },
        data: {
          status: PaymentStatus.PAID,
          paidAt: new Date(),
        },
      });
    }

    // Refetch refreshed
    const finalOrder = await prisma.order.findUnique({
      where: { id: existing.id },
      include: {
        items: {
          include: { menuItem: true },
        },
        payment: true,
      },
    });

    return NextResponse.json(finalOrder);
  } catch (error) {
    console.error('[API /api/orders/[id] PUT] Error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}
