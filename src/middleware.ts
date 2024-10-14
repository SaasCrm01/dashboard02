// src/middleware.ts
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export async function middleware(request: Request) {
  const token = request.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Token não fornecido.' }, { status: 401 });
  }

  try {
    const { id, role } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET)).then(res => res.payload);

    if (role === 'ADMIN') {
      return NextResponse.next();
    }

    if (role === 'SELLER' && request.method === 'POST') {
      return NextResponse.next();
    }

    if (role === 'SELLER' && request.url.includes('/api/clients/')) {
      const clientId = parseInt(request.url.split('/').pop()!);
      const client = await prisma.client.findUnique({
        where: { id: clientId },
        select: { sellerId: true },
      });

      if (client?.sellerId !== id) {
        return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
      }
    }

    return NextResponse.next();
  } catch (err) {
    return NextResponse.json({ error: 'Token inválido ou expirado.' }, { status: 401 });
  }
}

export const config = {
  matcher: ['/api/clients/:path*', '/api/sellers/:path*'],
};
