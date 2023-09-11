import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { Model } from 'mongoose';
import { IngredientDocument } from './ingredient.interface';
import { CreateIngredientDto } from './ingredient.dto';
import { LoggerService } from '../logger/logger.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class IngredientService {

    constructor(
        @InjectModel(models.INGREDIENT_MODEL) private ingredientModel: Model<IngredientDocument>,
        private readonly redisService: RedisService,
        private readonly loggerService: LoggerService
    ) {}

    async findAll(): Promise<IngredientDocument[]> {
        const cachedIngredients = await this.redisService.get<IngredientDocument>('ingredients');
        const context = 'IngredientService/findAll';

        if (cachedIngredients) {
            this.loggerService.info(context, `Fetched ${cachedIngredients.length} ingredients from cache.`);

            return cachedIngredients;
        }

        const ingredients = (await this.ingredientModel.find()) as IngredientDocument[];
        const message = `Found ${ingredients.length} ingredients.`;

        await this.redisService.set<IngredientDocument>(ingredients, 'ingredients');
        this.loggerService.info(context, 'Cached found ingredients.');

        this.loggerService.info(context, message);

        return ingredients;
    }

    async create(createIngredientDto: CreateIngredientDto): Promise<IngredientDocument> {
        const createdIngredient = await this.ingredientModel.create(createIngredientDto) as IngredientDocument;
        const message = `New ingredient "${createIngredientDto.name}" has been added.`;

        this.loggerService.info('IngredientService/create', message);

        return createdIngredient;
    }
}