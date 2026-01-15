
const inMemoryCache = new Map<string, { value: any; expiresAt?: number }>();

export async function set(key: string, value: any, ttl?: number): Promise<void> {
  inMemoryCache.set(key, {
    value,
    expiresAt: ttl ? Date.now() + ttl * 1000 : undefined,
  });
}

export async function get(key: string): Promise<any> {
  const cached = inMemoryCache.get(key);
  if (!cached) return null;
  if (cached.expiresAt && cached.expiresAt < Date.now()) {
    inMemoryCache.delete(key);
    return null;
  }
  return cached.value;
}

export async function del(key: string): Promise<void> {
  inMemoryCache.delete(key);
}

export async function clear(): Promise<void> {
  inMemoryCache.clear();
}

export async function disconnect(): Promise<void> {
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
