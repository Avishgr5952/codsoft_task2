import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    const categories = await prisma.category.findMany({
      where: all ? undefined : { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { menuItems: true },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('[API /api/categories GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth([Role.ADMIN]);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await request.json();
    const { name, description, image, isActive, sortOrder } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const existing = await prisma.category.findUnique({
      where: { name: name.trim() },
    });
    if (existing) {
      return NextResponse.json({ error: 'A category with this name already exists' }, { status: 400 });
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null,
        image: image || null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : 0,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error('[API /api/categories POST] Error:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
