// src/app/api/clients/create/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ message: 'Token não fornecido.' }, { status: 403 });
    }

    // Verifica o token e obtém os dados do usuário
    const user = getToken(token);
    if (!user) {
      return NextResponse.json({ message: 'Acesso negado. Token inválido ou expirado.' }, { status: 403 });
    }

    // Verifica se o usuário é ADMIN ou SELLER
    const { name, email, phone, sellerId } = await request.json();

    if (user.role === 'ADMIN') {
      const client = await prisma.client.create({
        data: {
          name,
          email,
          phone,
          sellerId: sellerId || null,
        },
      });
      return NextResponse.json(client, { status: 201 });
    }

    if (user.role === 'SELLER') {
      const client = await prisma.client.create({
        data: {
          name,
          email,
          phone,
          sellerId: user.id,  // O vendedor cria clientes para si
        },
      });
      return NextResponse.json(client, { status: 201 });
    }

    return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return NextResponse.json({ message: 'Erro interno no servidor.' }, { status: 500 });
  }
}
