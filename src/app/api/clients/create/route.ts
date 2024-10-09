// src/app/api/clients/create/route.ts
// src/app/api/clients/create/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getToken } from '@/lib/auth';

export async function POST(request: Request) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  const user = getToken(token!);  // Agora user possui id e role

  if (!user) {
    return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
  }

  const { name, email, phone, sellerId } = await request.json();

  // Administradores podem criar clientes e vinculá-los a qualquer vendedor
  if (user.role === 'ADMIN') {
    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        sellerId: sellerId || null,  // Administradores podem escolher o vendedor
      },
    });
    return NextResponse.json(client, { status: 201 });
  }

  // Vendedores podem criar clientes apenas para si mesmos
  if (user.role === 'SELLER') {
    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        sellerId: user.id,  // Associa o cliente ao vendedor logado
      },
    });
    return NextResponse.json(client, { status: 201 });
  }

  return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
}

