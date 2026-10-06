import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role, PaymentStatus, PaymentMethod } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await requireAuth([Role.ADMIN]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as PaymentStatus | null;
    const method = searchParams.get('method') as PaymentMethod | null;

    const where: any = {};
    if (status) where.status = status;
    if (method) where.method = method;

    const payments = await prisma.payment.findMany({
      where,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            customerName: true,
            customerEmail: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('[API /api/payments GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth([Role.ADMIN]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { orderId, amount, method, status, transactionRef } = body;

    if (!orderId || amount === undefined || !method) {
      return NextResponse.json({ error: 'orderId, amount, and method are required' }, { status: 400 });
    }

    const payment = await prisma.payment.upsert({
      where: { orderId },
      update: {
        amount: parseFloat(amount),
        method: method as PaymentMethod,
        status: status as PaymentStatus || PaymentStatus.PAID,
        transactionRef: transactionRef || undefined,
        paidAt: status === PaymentStatus.PAID ? new Date() : undefined,
      },
      create: {
        orderId,
        amount: parseFloat(amount),
        method: method as PaymentMethod,
        status: status as PaymentStatus || PaymentStatus.PAID,
        transactionRef: transactionRef || undefined,
        paidAt: status === PaymentStatus.PAID ? new Date() : undefined,
      },
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error('[API /api/payments POST] Error:', error);
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }
}
