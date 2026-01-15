import jwt from 'jsonwebtoken';
export function generateAccessToken(payload) {
    const expiresIn = process.env.JWT_ACCESS_EXPIRY || '15m';
    return jwt.sign(payload, process.env.JWT_ACCESS_SECRET || 'default-access-secret', { expiresIn });
}
export function generateRefreshToken(payload) {
    const expiresIn = process.env.JWT_REFRESH_EXPIRY || '7d';
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'default-refresh-secret', { expiresIn });
}
export function verifyAccessToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'default-access-secret');
    }
    catch (error) {
        return null;
    }
}
export function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'default-refresh-secret');
    }
    catch (error) {
        return null;
    }
}
export function decodeToken(token) {
    try {
        return jwt.decode(token);
    }
    catch (error) {
        return null;
    }
}
//# sourceMappingURL=jwt.js.map