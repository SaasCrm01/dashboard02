// src/app/api/sellers/[id]/add-client/route.ts

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { clientId } = await req.json(); 

  if (!clientId) {
    return NextResponse.json({ message: 'ID do cliente não fornecido.' }, { status: 400 });
  }

  try {
    const client = await prisma.client.findUnique({
      where: { id: parseInt(clientId) },
    });

    if (!client) {
      return NextResponse.json({ message: 'Cliente não encontrado.' }, { status: 404 });
    }

    const updatedClient = await prisma.client.update({
      where: { id: parseInt(clientId) },
      data: {
        sellerId: parseInt(params.id), 
      },
    });

    return NextResponse.json(updatedClient, { status: 200 });
  } catch (error) {
    console.error('Erro ao associar cliente ao vendedor:', error);
    return NextResponse.json({ message: 'Erro ao associar cliente ao vendedor' }, { status: 500 });
  }
}
