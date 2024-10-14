// src/app/api/sellers/[id]/add-client/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getToken } from '@/lib/auth'; // Importa a função de autenticação

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const token = req.headers.get('authorization')?.split(' ')[1] || ''; // Garante que token seja uma string
  const user = getToken(token);

  if (!user || user.role !== 'SELLER') {
    return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
  }

  const { clientId } = await req.json();
  if (!clientId) {
    return NextResponse.json({ message: 'ID do cliente não fornecido.' }, { status: 400 });
  }

  try {
    const client = await prisma.client.findUnique({
      where: { id: parseInt(clientId) },
    });

    if (!client || client.sellerId !== user.id) {
      return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
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
