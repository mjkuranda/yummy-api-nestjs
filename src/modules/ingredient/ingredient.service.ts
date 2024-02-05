import { Injectable } from '@nestjs/common';
import { IngredientDocument } from '../../mongodb/documents/ingredient.document';
import { CreateIngredientDto } from './ingredient.dto';
import { LoggerService } from '../logger/logger.service';
import { RedisService } from '../redis/redis.service';
import { IngredientRepository } from '../../mongodb/repositories/ingredient.repository';

@Injectable()
export class IngredientService {

    constructor(
        private readonly ingredientRepository: IngredientRepository,
        private readonly redisService: RedisService,
        private readonly loggerService: LoggerService
    ) {}

    async findAll(): Promise<IngredientDocument[]> {
        const cachedIngredients = await this.redisService.get<IngredientDocument>('ingredients') as IngredientDocument[];
        const context = 'IngredientService/findAll';

        if (cachedIngredients) {
            this.loggerService.info(context, `Fetched ${cachedIngredients.length} ingredients from cache.`);

            return cachedIngredients;
        }

        const ingredients = (await this.ingredientRepository.findAll({})) as IngredientDocument[];
        const message = `Found ${ingredients.length} ingredients.`;

        await this.redisService.set<IngredientDocument>(ingredients, 'ingredients');
        this.loggerService.info(context, 'Cached found ingredients.');

        this.loggerService.info(context, message);

        return ingredients;
    }

    async create(createIngredientDto: CreateIngredientDto): Promise<IngredientDocument> {
        const createdIngredient = await this.ingredientRepository.create(createIngredientDto) as IngredientDocument;
        const message = `New ingredient "${createIngredientDto.name}" has been added.`;

        this.loggerService.info('IngredientService/create', message);

        return createdIngredient;
    }
}