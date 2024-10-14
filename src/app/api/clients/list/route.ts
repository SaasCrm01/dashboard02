// src/app/api/clients/list/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getToken } from '@/lib/auth'; // Importar a função de autenticação

export async function GET(request: Request) {
  const token = request.headers.get('authorization')?.split(' ')[1] || ''; // Garante que token seja uma string
  const user = getToken(token);

  if (!user) {
    return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
  }

  try {
    // Se o usuário for ADMIN, pode ver todos os clientes
    if (user.role === 'ADMIN') {
      const clients = await prisma.client.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      });
      return NextResponse.json(clients, { status: 200 });
    }

    // Se o usuário for SELLER, vê apenas seus próprios clientes
    if (user.role === 'SELLER') {
      const clients = await prisma.client.findMany({
        where: { sellerId: user.id }, // Apenas clientes do vendedor logado
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      });
      return NextResponse.json(clients, { status: 200 });
    }

    return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return NextResponse.json({ message: 'Erro ao buscar clientes.' }, { status: 500 });
  }
}
