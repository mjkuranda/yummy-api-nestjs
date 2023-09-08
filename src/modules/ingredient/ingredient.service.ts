import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { Model } from 'mongoose';
import { IngredientDocument } from './ingredient.interface';
import { CreateIngredientDto } from './ingredient.dto';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class IngredientService {

    constructor(
        @InjectModel(models.INGREDIENT_MODEL)
        private ingredientModel: Model<IngredientDocument>,
        private loggerService: LoggerService
    ) {}

    async findAll(): Promise<IngredientDocument[]> {
        const ingredients = (await this.ingredientModel.find()) as IngredientDocument[];
        const message = `Found ${ingredients.length} meals.`;

        this.loggerService.info('IngredientService/findAll:', message);

        return ingredients;
    }

    async create(createIngredientDto: CreateIngredientDto): Promise<IngredientDocument> {
        const createdIngredient = await this.ingredientModel.create(createIngredientDto) as IngredientDocument;
        const message = `New ingredient "${createIngredientDto.name}" has been added.`;

        this.loggerService.info('IngredientService/create:', message);

        return createdIngredient;
    }
}