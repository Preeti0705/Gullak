const Redis = require('ioredis');

/**
 * Redis Client Configuration
 * Provides caching layer for dashboard data, AI responses, and session data.
 * Gracefully degrades if Redis is unavailable — the app works without it.
 */

let redisClient = null;
let isRedisConnected = false;
let cacheStats = { hits: 0, misses: 0, errors: 0 };

const initRedis = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

  if (process.env.ENABLE_CACHE === 'false') {
    console.log('⏭️  Redis caching disabled via ENABLE_CACHE=false');
    return null;
  }

  try {
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 5) {
          console.warn('⚠️  Redis: Max reconnect attempts reached. Running without cache.');
          return null; // Stop retrying
        }
        const delay = Math.min(times * 200, 2000);
        return delay;
      },
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    redisClient.on('connect', () => {
      isRedisConnected = true;
      console.log('✅ Redis connected');
    });

    redisClient.on('error', (err) => {
      if (isRedisConnected) {
        console.warn(`⚠️  Redis error: ${err.message}`);
      }
      isRedisConnected = false;
    });

    redisClient.on('close', () => {
      isRedisConnected = false;
    });

    // Attempt connection (non-blocking)
    redisClient.connect().catch((err) => {
      console.warn(`⚠️  Redis connection failed: ${err.message}. Running without cache.`);
      isRedisConnected = false;
    });

    return redisClient;
  } catch (error) {
    console.warn(`⚠️  Redis init failed: ${error.message}. Running without cache.`);
    return null;
  }
};

/**
 * Get cached value by key
 * @param {string} key - Cache key
 * @returns {Object|null} Parsed JSON value or null
 */
const getCache = async (key) => {
  if (!isRedisConnected || !redisClient) {
    cacheStats.misses++;
    return null;
  }
  try {
    const data = await redisClient.get(key);
    if (data) {
      cacheStats.hits++;
      return JSON.parse(data);
    }
    cacheStats.misses++;
    return null;
  } catch (error) {
    cacheStats.errors++;
    return null;
  }
};

/**
 * Set cache value with TTL
 * @param {string} key - Cache key
 * @param {*} value - Value to cache (will be JSON.stringified)
 * @param {number} ttl - Time to live in seconds (default: 300 = 5 min)
 */
const setCache = async (key, value, ttl = 300) => {
  if (!isRedisConnected || !redisClient) return;
  try {
    await redisClient.setex(key, ttl, JSON.stringify(value));
  } catch (error) {
    cacheStats.errors++;
  }
};

/**
 * Invalidate cache keys matching a pattern
 * @param {string} pattern - Redis key pattern (e.g., "cache:userId:*")
 */
const invalidateCache = async (pattern) => {
  if (!isRedisConnected || !redisClient) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
    }
  } catch (error) {
    cacheStats.errors++;
  }
};

/**
 * Delete a specific cache key
 * @param {string} key - Cache key to delete
 */
const deleteCache = async (key) => {
  if (!isRedisConnected || !redisClient) return;
  try {
    await redisClient.del(key);
  } catch (error) {
    cacheStats.errors++;
  }
};

const getCacheStats = () => ({
  ...cacheStats,
  connected: isRedisConnected,
  hitRate: cacheStats.hits + cacheStats.misses > 0
    ? ((cacheStats.hits / (cacheStats.hits + cacheStats.misses)) * 100).toFixed(1) + '%'
    : 'N/A'
});

const getRedisStatus = () => isRedisConnected;

module.exports = {
  initRedis,
  getCache,
  setCache,
  invalidateCache,
  deleteCache,
  getCacheStats,
  getRedisStatus,
};
