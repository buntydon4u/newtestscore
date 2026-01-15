export declare function set(key: string, value: any, ttl?: number): Promise<void>;
export declare function get(key: string): Promise<any>;
export declare function del(key: string): Promise<void>;
export declare function clear(): Promise<void>;
export declare function disconnect(): Promise<void>;
export declare function connectRedis(): Promise<void>;
export declare const cache: {
    set: typeof set;
    get: typeof get;
    del: typeof del;
    clear: typeof clear;
    disconnect: typeof disconnect;
};
//# sourceMappingURL=redis.d.ts.map