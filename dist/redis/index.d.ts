declare const mockRedis: {
    ping: () => Promise<string>;
    setex: (_key: string, _ttl: number, _value: string) => Promise<string>;
    get: (_key: string) => Promise<null>;
    del: (..._keys: any[]) => Promise<number>;
    keys: (_pattern: string) => Promise<never[]>;
    zadd: (_key: string, _score: number, _member: string) => Promise<number>;
    zremrangebyscore: (_key: string, _min: number, _max: number) => Promise<number>;
    zcard: (_key: string) => Promise<number>;
    pexpire: (_key: string, _ms: number) => Promise<number>;
    exists: (_key: string) => Promise<number>;
};
export { mockRedis as redis };
export declare const connectRedis: () => Promise<void>;
export declare const redisHealth: () => Promise<string>;
//# sourceMappingURL=index.d.ts.map