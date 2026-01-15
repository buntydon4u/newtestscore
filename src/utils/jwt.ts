import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

export interface TokenPayload extends JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  const expiresIn = process.env.JWT_ACCESS_EXPIRY || '15m';
  return jwt.sign(
    payload,
    process.env.JWT_ACCESS_SECRET || 'default-access-secret',
    { expiresIn } as SignOptions
  );
}

export function generateRefreshToken(payload: TokenPayload): string {
  const expiresIn = process.env.JWT_REFRESH_EXPIRY || '7d';
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || 'default-refresh-secret',
    { expiresIn } as SignOptions
  );
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'default-access-secret') as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'default-refresh-secret') as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload | null;
  } catch (error) {
    return null;
  }
}
