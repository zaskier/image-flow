import { redisStore } from 'cache-manager-redis-yet';

export const getRedisConfig = async () => ({
  store: await redisStore({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`,
    ttl: 60000, // 60 seconds default
  }),
});
