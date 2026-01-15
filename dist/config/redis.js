const inMemoryCache = new Map();
export async function set(key, value, ttl) {
    inMemoryCache.set(key, {
        value,
        expiresAt: ttl ? Date.now() + ttl * 1000 : undefined,
    });
}
export async function get(key) {
    const cached = inMemoryCache.get(key);
    if (!cached)
        return null;
    if (cached.expiresAt && cached.expiresAt < Date.now()) {
        inMemoryCache.delete(key);
        return null;
    }
    return cached.value;
}
export async function del(key) {
    inMemoryCache.delete(key);
}
export async function clear() {
    inMemoryCache.clear();
}
export async function disconnect() {
    // No-op for in-memory cache
}
export async function connectRedis() {
    console.warn('⚠️ Using in-memory cache fallback');
}
export const cache = {
    set,
    get,
    del,
    clear,
    disconnect,
};
//# sourceMappingURL=redis.js.map