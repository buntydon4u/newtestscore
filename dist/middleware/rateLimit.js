import { cache } from '../config/redis.js';
const defaultConfig = {
    windowMs: 60000,
    maxRequests: 100,
    message: 'Too many requests, please try again later.',
};
export function createRateLimiter(config = {}) {
    const finalConfig = { ...defaultConfig, ...config };
    return async (req, res, next) => {
        try {
            const key = `ratelimit:${req.ip}`;
            const current = await cache.get(key);
            if (current && current.count >= finalConfig.maxRequests) {
                res.status(429).json({
                    error: finalConfig.message,
                    retryAfter: Math.ceil(current.resetAt - Date.now() / 1000),
                });
                return;
            }
            const newData = {
                count: (current?.count || 0) + 1,
                resetAt: current?.resetAt || Date.now() + finalConfig.windowMs,
            };
            await cache.set(key, newData, Math.ceil(finalConfig.windowMs / 1000));
            res.setHeader('X-RateLimit-Limit', finalConfig.maxRequests);
            res.setHeader('X-RateLimit-Remaining', Math.max(0, finalConfig.maxRequests - newData.count));
            res.setHeader('X-RateLimit-Reset', newData.resetAt);
            next();
        }
        catch (error) {
            console.error('Rate limiting error:', error);
            next();
        }
    };
}
export const apiLimiter = createRateLimiter({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10000'), // Disabled for development
});
export const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
    message: 'Too many login attempts, please try again after 15 minutes.',
});
export const signupLimiter = createRateLimiter({
    windowMs: 60 * 60 * 1000,
    maxRequests: 3,
    message: 'Too many signup attempts from this IP, please try again after 1 hour.',
});
export const rateLimit = apiLimiter;
//# sourceMappingURL=rateLimit.js.map