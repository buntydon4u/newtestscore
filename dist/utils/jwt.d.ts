import { JwtPayload } from 'jsonwebtoken';
export interface TokenPayload extends JwtPayload {
    userId: string;
    email: string;
    role: string;
}
export declare function generateAccessToken(payload: TokenPayload): string;
export declare function generateRefreshToken(payload: TokenPayload): string;
export declare function verifyAccessToken(token: string): TokenPayload | null;
export declare function verifyRefreshToken(token: string): TokenPayload | null;
export declare function decodeToken(token: string): TokenPayload | null;
//# sourceMappingURL=jwt.d.ts.map