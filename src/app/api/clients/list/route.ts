// src/app/api/sellers/list/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sellers = await prisma.user.findMany({
      where: { role: 'SELLER' },
      select: {
        id: true,
        name: true,
      },
    });

    return NextResponse.json(sellers);
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao buscar vendedores.' }, { status: 500 });
  }
}
