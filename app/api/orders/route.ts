import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { OrderStatus, PaymentMethod, PaymentStatus, Role } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as OrderStatus | null;
    const myOnly = searchParams.get('my') === 'true';

    const where: any = {};

    // If user is a customer, or explicitly requested 'my', only return their orders
    if (myOnly || (user && user.role === Role.CUSTOMER)) {
      if (!user) {
        return NextResponse.json({ error: 'Please log in to view your orders.' }, { status: 401 });
      }
      where.userId = user.id;
    }

    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('[API /api/orders GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      notes,
      items,
      paymentMethod = 'CARD',
    } = body;

    const name = customerName?.trim() || user?.name;
    const email = customerEmail?.trim() || user?.email;
    const phone = customerPhone?.trim() || user?.phone || '';

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Customer name and email are required.' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Your cart is empty. Please add items before placing an order.' },
        { status: 400 }
      );
    }

    // Verify all items from database to prevent price tampering
    let subtotal = 0;
    const verifiedItems: {
      menuItemId: string;
      name: string;
      price: number;
      quantity: number;
      subtotal: number;
    }[] = [];

    for (const item of items) {
      if (!item.menuItemId || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: 'Invalid items in cart.' },
          { status: 400 }
        );
      }

      const dbItem = await prisma.menuItem.findUnique({
        where: { id: item.menuItemId },
      });

      if (!dbItem) {
        return NextResponse.json(
          { error: `Item no longer exists: ${item.name || 'Unknown item'}` },
          { status: 400 }
        );
      }

      if (!dbItem.isAvailable) {
        return NextResponse.json(
          { error: `Item is currently unavailable: "${dbItem.name}"` },
          { status: 400 }
        );
      }

      const itemTotal = dbItem.price * item.quantity;
      subtotal += itemTotal;

      verifiedItems.push({
        menuItemId: dbItem.id,
        name: dbItem.name,
        price: dbItem.price,
        quantity: item.quantity,
        subtotal: itemTotal,
      });
    }

    const tax = Math.round(subtotal * 0.08 * 100) / 100; // 8% tax
    const totalAmount = Math.round((subtotal + tax) * 100) / 100;

    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    // Validate payment method
    const validMethod = ['CASH', 'CARD', 'UPI'].includes(paymentMethod)
      ? (paymentMethod as PaymentMethod)
      : PaymentMethod.CARD;

    const paymentStatus =
      validMethod === PaymentMethod.CASH ? PaymentStatus.PENDING : PaymentStatus.PAID;

    const transactionRef =
      validMethod === PaymentMethod.CASH
        ? null
        : `TXN-${validMethod}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Create Order with Items and Payment in a transaction
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user ? user.id : null,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        deliveryAddress: deliveryAddress?.trim() || null,
        notes: notes?.trim() || null,
        status: OrderStatus.PENDING,
        subtotal,
        tax,
        totalAmount,
        items: {
          create: verifiedItems.map((vi) => ({
            menuItemId: vi.menuItemId,
            itemName: vi.name,
            itemPrice: vi.price,
            quantity: vi.quantity,
            subtotal: vi.subtotal,
          })),
        },
        payment: {
          create: {
            amount: totalAmount,
            method: validMethod,
            status: paymentStatus,
            transactionRef,
            paidAt: paymentStatus === PaymentStatus.PAID ? new Date() : null,
          },
        },
      },
      include: {
        items: true,
        payment: true,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('[API /api/orders POST] Error:', error);
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 });
  }
}
