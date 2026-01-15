const mockRedis = {
  ping: async () => 'PONG',
  setex: async (_key: string, _ttl: number, _value: string) => 'OK',
  get: async (_key: string) => null,
  del: async (..._keys: any[]) => 1,
  keys: async (_pattern: string) => [],
  zadd: async (_key: string, _score: number, _member: string) => 1,
  zremrangebyscore: async (_key: string, _min: number, _max: number) => 1,
  zcard: async (_key: string) => 0,
  pexpire: async (_key: string, _ms: number) => 1,
  exists: async (_key: string) => 0,
};

export { mockRedis as redis };

export const connectRedis = async (): Promise<void> => {
  console.log('⏭️  Redis is disabled');
};

export const redisHealth = async (): Promise<string> => {
  return 'PONG';
};