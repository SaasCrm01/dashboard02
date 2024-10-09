// src/app/api/clients/update/[id]/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getToken } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const token = request.headers.get('authorization')?.split(' ')[1];
  const user = getToken(token!);  // O token pode ser nulo, então vamos verificar

  // Verificação adicional para garantir que o token não é nulo
  if (!user) {
    return NextResponse.json({ message: 'Token inválido ou não fornecido.' }, { status: 401 });
  }

  const id = parseInt(params.id);
  const { name, email, phone } = await request.json();

  // Verifica se o vendedor está associado ao cliente
  const client = await prisma.client.findUnique({
    where: { id },
    select: { sellerId: true },
  });

  if (!client || (user.role === 'SELLER' && client.sellerId !== user.id)) {
    return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
  }

  const updatedClient = await prisma.client.update({
    where: { id },
    data: { name, email, phone },
  });

  return NextResponse.json(updatedClient, { status: 200 });
}
