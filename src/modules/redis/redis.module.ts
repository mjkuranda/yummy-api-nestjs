import { Module } from '@nestjs/common';
import { createClient } from '@redis/client';
import { REDIS_CLIENT } from './redis.provider';

@Module({
    providers: [
        {
            provide: REDIS_CLIENT,
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
        }
    ],
    exports: [REDIS_CLIENT],
})
export class RedisModule {}