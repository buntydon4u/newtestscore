const mockRedis = {
    ping: async () => 'PONG',
    setex: async (_key, _ttl, _value) => 'OK',
    get: async (_key) => null,
    del: async (..._keys) => 1,
    keys: async (_pattern) => [],
    zadd: async (_key, _score, _member) => 1,
    zremrangebyscore: async (_key, _min, _max) => 1,
    zcard: async (_key) => 0,
    pexpire: async (_key, _ms) => 1,
    exists: async (_key) => 0,
};
export { mockRedis as redis };
export const connectRedis = async () => {
    console.log('⏭️  Redis is disabled');
};
export const redisHealth = async () => {
    return 'PONG';
};
//# sourceMappingURL=index.js.map