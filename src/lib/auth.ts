// src/lib/auth.ts
import jwt, { JwtPayload } from 'jsonwebtoken';

// Interface personalizada que extende JwtPayload para incluir id e role
interface CustomJwtPayload extends JwtPayload {
  id: number;
  role: 'ADMIN' | 'SELLER' | 'USER';
}

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export function getToken(token: string): CustomJwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as CustomJwtPayload;

    // Verifica se o token é do tipo JwtPayload e tem id e role
    if (decoded && decoded.id && decoded.role) {
      return decoded;
    }
    return null;
  } catch (err) {
    throw new Error('Token inválido ou expirado.');
  }
}
