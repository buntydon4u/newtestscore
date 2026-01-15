declare const mockRedis: {
    ping: () => Promise<string>;
    setex: () => Promise<string>;
    get: () => Promise<null>;
    del: () => Promise<number>;
    zadd: () => Promise<number>;
    zremrangebyscore: () => Promise<number>;
    zcard: () => Promise<number>;
    pexpire: () => Promise<string>;
};
export default mockRedis;
//# sourceMappingURL=redisClient.d.ts.map