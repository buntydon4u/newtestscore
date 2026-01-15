import crypto from 'crypto';

export const cacheGet = async (_key: string): Promise<any | null> => {
  return null;
};

export const cacheSet = async (_key: string, _data: any, _ttl: number): Promise<void> => {
};

export const cacheDelete = async (_key: string): Promise<void> => {
};

export const cacheDeletePattern = async (_pattern: string): Promise<void> => {
};

export const cacheWrap = async <T>(_key: string, _ttl: number, fetchFunction: () => Promise<T>): Promise<T> => {
  return fetchFunction();
};

export const hashFilters = (obj: any): string => {
  return crypto.createHash('md5').update(JSON.stringify(obj)).digest('hex');
};

export const cacheMasterData = async <T>(_key: string, fetchFunction: () => Promise<T>): Promise<T> => {
  return fetchFunction();
};

export const cacheExam = async <T>(_key: string, fetchFunction: () => Promise<T>): Promise<T> => {
  return fetchFunction();
};

export const cacheDashboard = async <T>(_key: string, fetchFunction: () => Promise<T>): Promise<T> => {
  return fetchFunction();
};

export const cacheList = async <T>(_entity: string, _filters: any, fetchFunction: () => Promise<T>): Promise<T> => {
  return fetchFunction();
};