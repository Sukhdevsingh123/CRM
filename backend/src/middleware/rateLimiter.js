import { redis } from "../config/redis.js";

export const aiRateLimiter = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const key = `ai_rate_limit:${userId}`;
    const currentHour = new Date().getHours();
    const hourlyKey = `${key}:${currentHour}`;

    const currentCount = await redis.get(hourlyKey);
    const count = parseInt(currentCount) || 0;

    if (count >= 5) {
      const ttl = await redis.ttl(hourlyKey);
      return res.status(429).json({success: false,message: "AI generation limit exceeded. Maximum 5 requests per hour. Please try again later.",retryAfter: ttl,});
    }

    await redis.incr(hourlyKey);
    
    if (count === 0) {
      await redis.expire(hourlyKey, 3600); 
    }

    next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    next();
  }
};

export const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, 
    maxRequests = 100,
    keyPrefix = "rate_limit",
  } = options;

  return async (req, res, next) => {
    try {
      const userId = req.user?._id?.toString() || req.ip;
      const key = `${keyPrefix}:${userId}`;
      
      const currentCount = await redis.get(key);
      const count = parseInt(currentCount) || 0;

      if (count >= maxRequests) {
        const ttl = await redis.ttl(key);
        return res.status(429).json({
          success: false,
          message: "Too many requests. Please try again later.",
          retryAfter: ttl,
        });
      }

      await redis.incr(key);
      if (count === 0) {
        await redis.expire(key, Math.ceil(windowMs / 1000));
      }
      next();
    } catch (error) {
      console.error("Rate limiter error:", error);
      next();
    }
  };
};
