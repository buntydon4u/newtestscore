import { cacheGet, cacheSet, hashFilters } from '../redis/cacheWrap.js';
export const cacheMiddleware = (entityName, ttl = 300) => {
    return async (req, res, next) => {
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
        res.json = (data) => {
            // Cache the data
            cacheSet(key, data, ttl);
            // Call original
            return originalJson(data);
        };
        next();
    };
};
//# sourceMappingURL=cacheMiddleware.js.map