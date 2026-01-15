import { Request, Response, NextFunction } from 'express';
import { cacheGet, cacheSet, hashFilters } from '../redis/cacheWrap.js';

export const cacheMiddleware = (entityName: string, ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Parse filters from query
    const filters = { ...req.query };
    const filterHash = hashFilters(filters);
    const key = `cache:list:${entityName}:${filterHash}`;

    // Check cache
    const cached = await cacheGet(key);
    if (cached !== null) {
      res.json(cached);
      return;
    }

    // Cache miss, wrap res.json to cache the result
    const originalJson = res.json.bind(res);
    res.json = (data: any) => {
      // Cache the data
      cacheSet(key, data, ttl);
      // Call original
      return originalJson(data);
    };

    next();
  };
};