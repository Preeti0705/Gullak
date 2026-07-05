const { getCache, setCache } = require('../config/redisClient');

/**
 * Cache Middleware Factory
 * Creates Express middleware that caches API responses per-user with configurable TTL.
 * 
 * Cache key format: cache:<userId>:<routePath>:<queryHash>
 * 
 * Usage: router.get('/dashboard', protect, cacheMiddleware(300), getDashboard);
 * 
 * @param {number} ttlSeconds - Time to live in seconds (default: 300)
 * @returns {Function} Express middleware
 */
const cacheMiddleware = (ttlSeconds = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') return next();

    const userId = req.user?._id?.toString();
    if (!userId) return next();

    // Build cache key from user ID, route, and query params
    const queryString = JSON.stringify(req.query || {});
    const cacheKey = `cache:${userId}:${req.originalUrl}:${queryString}`;

    try {
      const cachedData = await getCache(cacheKey);
      if (cachedData) {
        // Add header to indicate cache hit
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Key', cacheKey);
        return res.json(cachedData);
      }

      // Cache miss — intercept res.json to cache the response
      res.set('X-Cache', 'MISS');
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          setCache(cacheKey, body, ttlSeconds).catch(() => {});
        }
        return originalJson(body);
      };

      next();
    } catch (error) {
      // On any cache error, skip caching and continue
      next();
    }
  };
};

module.exports = { cacheMiddleware };
