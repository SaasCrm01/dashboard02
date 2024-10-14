// src/app/api/sellers/list/route.ts

import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getToken } from '@/lib/auth'; // Importar função de autenticação

export async function GET(request: Request) {
  const token = request.headers.get('authorization')?.split(' ')[1] || ''; // Garante que token seja uma string
  const user = getToken(token);

  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 }); // Apenas ADMIN pode listar todos os vendedores
  }

  try {
    const sellers = await prisma.user.findMany({
      where: { role: 'SELLER' }, // Retorna apenas usuários com o papel de vendedor
    });
    return NextResponse.json(sellers, { status: 200 });
  } catch (error) {
    console.error('Erro ao listar vendedores:', error);
    return NextResponse.json({ message: 'Erro ao listar vendedores' }, { status: 500 });
  }
}
