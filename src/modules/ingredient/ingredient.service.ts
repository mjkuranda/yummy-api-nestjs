import { Injectable } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class IngredientService {

    constructor(
        private readonly redisService: RedisService,
        private readonly loggerService: LoggerService
    ) {}
}