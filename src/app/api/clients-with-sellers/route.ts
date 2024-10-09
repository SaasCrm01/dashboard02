// src/app/api/clients-with-sellers/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const clients = await prisma.client.findMany({
      include: {
        seller: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(clients);
  } catch (error) {
    return NextResponse.json({ message: 'Erro ao buscar clientes.' }, { status: 500 });
  }
}
