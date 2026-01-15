const tokenBlacklistStore = new Map<string, number>();

export const blacklistToken = async (tokenHash: string, ttl: number): Promise<void> => {
  const expiresAt = Date.now() + ttl * 1000;
  tokenBlacklistStore.set(tokenHash, expiresAt);
};

export const isTokenBlacklisted = async (tokenHash: string): Promise<boolean> => {
  const expiresAt = tokenBlacklistStore.get(tokenHash);
  if (!expiresAt) return false;
  if (expiresAt < Date.now()) {
    tokenBlacklistStore.delete(tokenHash);
    return false;
  }
  return true;
};