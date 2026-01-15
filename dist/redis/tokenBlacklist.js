const tokenBlacklistStore = new Map();
export const blacklistToken = async (tokenHash, ttl) => {
    const expiresAt = Date.now() + ttl * 1000;
    tokenBlacklistStore.set(tokenHash, expiresAt);
};
export const isTokenBlacklisted = async (tokenHash) => {
    const expiresAt = tokenBlacklistStore.get(tokenHash);
    if (!expiresAt)
        return false;
    if (expiresAt < Date.now()) {
        tokenBlacklistStore.delete(tokenHash);
        return false;
    }
    return true;
};
//# sourceMappingURL=tokenBlacklist.js.map