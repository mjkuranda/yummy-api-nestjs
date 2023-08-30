import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { Model } from 'mongoose';
import { IngredientDocument } from './ingredient.interface';
import { CreateIngredientDto } from './ingredient.dto';
import { QueryResult } from '../../common/interfaces';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class IngredientService {

    constructor(
        @InjectModel(models.INGREDIENT_MODEL)
        private ingredientModel: Model<IngredientDocument>,
        private readonly authService: AuthService
    ) {}

    async findAll(): Promise<QueryResult<IngredientDocument>> {
        const ingredients = (await this.ingredientModel.find()) as IngredientDocument[];
        const message = `Found ${ingredients.length} meals.`;

        console.info('IngredientService/findAll:', message);

        return {
            data: ingredients,
            message,
            statusCode: 200
        };
    }

    async create(createIngredientDto: CreateIngredientDto, jwtCookie: string): Promise<QueryResult<IngredientDocument>> {
        const authorizationResult = this.authService.decode(jwtCookie);

        if (!authorizationResult.isAuthenticated) {
            const { message, statusCode } = authorizationResult;
            console.error('IngredientService/create:', message);

            return {
                message,
                statusCode
            }
        }

        const createdIngredient = new this.ingredientModel(createIngredientDto);
        const data = await createdIngredient.save() as IngredientDocument;
        const message = `New ingredient "${createIngredientDto.name}" has been added.`;

        console.info('IngredientService/create:', message);

        return {
            data,
            message,
            statusCode: 201
        };
    }
}