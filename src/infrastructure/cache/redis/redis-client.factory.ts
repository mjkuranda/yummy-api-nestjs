import { RedisClient } from './redis.client';
import { LoggerService } from '../../../server/modules/logger/logger.service';
import { ContextString } from '../../../server/common/types';

export class RedisClientFactory {

    static create(loggerService: LoggerService): RedisClient {
        const redisClient = new RedisClient({
            host: process.env.REDIS_HOSTNAME || 'localhost',
            port: Number(process.env.REDIS_PORT || 6379)
        });
        const client = redisClient.getClient();
        const context: ContextString = 'RedisClient/instance';

        client.on('ready', () => {
            loggerService.info(context, 'Redis connected successfully.');
        });

        client.on('error', (err) => {
            loggerService.error(context, `Redis Client Error. ${err.message}`);
        });

        return redisClient;
    }

}