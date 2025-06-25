import { CACHE_PROVIDER } from './cache.constant';
import { Provider } from '@nestjs/common';
import { CacheClient } from './interfaces/cache-client.interface';
import { LoggerService } from '../logger/logger.service';
import { RedisClientFactory } from '../../../infrastructure/cache/redis/redis-client.factory';

export const CacheProvider: Provider = {
    provide: CACHE_PROVIDER,
    useFactory: async (loggerService: LoggerService): Promise<CacheClient> => RedisClientFactory.create(loggerService),
    inject: [LoggerService]
};