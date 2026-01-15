export declare const cacheGet: (_key: string) => Promise<any | null>;
export declare const cacheSet: (_key: string, _data: any, _ttl: number) => Promise<void>;
export declare const cacheDelete: (_key: string) => Promise<void>;
export declare const cacheDeletePattern: (_pattern: string) => Promise<void>;
export declare const cacheWrap: <T>(_key: string, _ttl: number, fetchFunction: () => Promise<T>) => Promise<T>;
export declare const hashFilters: (obj: any) => string;
export declare const cacheMasterData: <T>(_key: string, fetchFunction: () => Promise<T>) => Promise<T>;
export declare const cacheExam: <T>(_key: string, fetchFunction: () => Promise<T>) => Promise<T>;
export declare const cacheDashboard: <T>(_key: string, fetchFunction: () => Promise<T>) => Promise<T>;
export declare const cacheList: <T>(_entity: string, _filters: any, fetchFunction: () => Promise<T>) => Promise<T>;
//# sourceMappingURL=cacheWrap.d.ts.map