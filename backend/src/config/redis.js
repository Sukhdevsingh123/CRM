import Redis from "ioredis";

export let redis;

export const connectRedis = async () => {
    redis = new Redis({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,

        maxRetriesPerRequest: 3,
        lazyConnect: true,
    });

    redis.on("connect", () => {
        console.log("Redis Connected 🚀");
    });
    redis.on("error", (err) => {
        console.error("Redis Error:", err.message);
    });
    // Test connection redis is connected or not
    await redis.set("sukhdev", "Singh");
    const result = await redis.get("sukhdev");
    console.log("Redis Test Value:", result);
};