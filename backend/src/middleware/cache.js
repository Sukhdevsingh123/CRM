import { redis } from "../config/redis.js";

export const cacheDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const cacheKey = `dashboard:${userId}:${today}`;

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("Cache hit for dashboard:", cacheKey);
      return res.status(200).json({
        success: true,
        data: JSON.parse(cachedData),
        cached: true,
      });
    }
    console.log("Cache miss for dashboard:", cacheKey);
    
    const originalJson = res.json;

    res.json = function (data) {
      if (data.success && data.data) {
        redis.setex(cacheKey, 60, JSON.stringify(data.data))
          .catch(error => console.error("Cache set error:", error));
      }
      return originalJson.call(this, data);
    };

    next();
  } catch (error) {
    console.error("Cache middleware error:", error);
    next();
  }
};

export const createCache = (options = {}) => {
  const {
    ttl = 300,
    keyGenerator = (req) => {
      const userId = req.user?._id?.toString() || 'anonymous';
      const path = req.route?.path || req.path;
      const query = JSON.stringify(req.query);
      return `cache:${path}:${userId}:${query}`;
    },
  } = options;

  return async (req, res, next) => {
    try {
      const cacheKey = keyGenerator(req);

      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log("Cache hit:", cacheKey);
        return res.status(200).json({
          success: true,
          data: JSON.parse(cachedData),
          cached: true,
        });
      }
      console.log("Cache miss:", cacheKey);
      
      const originalJson = res.json;
      res.json = function (data) {
        if (data.success && data.data) {
          redis.setex(cacheKey, ttl, JSON.stringify(data.data))
            .catch(error => console.error("Cache set error:", error));
        }
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      next();
    }
  };
};

export const invalidateCache = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`Invalidated ${keys.length} cache keys matching pattern: ${pattern}`);
    }
  } catch (error) {
    console.error("Cache invalidation error:", error);
  }
};
export const invalidateUserCache = async (userId, patterns = []) => {
  try {
    for (const pattern of patterns) {
      const fullPattern = pattern.replace('{userId}', userId);
      await invalidateCache(fullPattern);
    }
  } catch (error) {
    console.error("User cache invalidation error:", error);
  }
};
