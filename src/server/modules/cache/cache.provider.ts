import { CACHE_PROVIDER } from './cache.constant';
import { createClient } from '@redis/client';
import { Provider } from '@nestjs/common';

export const CacheProvider: Provider = {
    provide: CACHE_PROVIDER,
    useFactory: async () => {
        const redisHostname = process.env.REDIS_HOSTNAME || 'localhost';
        const redisPort = process.env.REDIS_PORT || 6379;
        const options = {
            url: `redis://${redisHostname}:${redisPort}`
        };
        const client = createClient(options);
        await client.connect();

        return client;
    }
};