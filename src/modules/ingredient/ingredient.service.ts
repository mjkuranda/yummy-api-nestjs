import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { Model } from 'mongoose';
import { IngredientDocument } from './ingredient.interface';
import { CreateIngredientDto } from './ingredient.dto';
import { QueryResult } from '../../common/interfaces';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class IngredientService {

    constructor(
        @InjectModel(models.INGREDIENT_MODEL)
        private ingredientModel: Model<IngredientDocument>,
        private readonly jwtService: JwtService,
        private readonly userService: UserService
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
        if (!jwtCookie) {
            const message = 'You are not authorized to create a new ingredient. Please, log in first.';
            console.error('IngredientService/create:', message);

            return {
                message,
                statusCode: 403
            }
        }

        const userName = this.jwtService.decode(jwtCookie) as string;
        const user = await this.userService.getUser(userName);

        if (!user) {
            const message = 'This user does not exist. You cannot add a new meal.';
            console.error('IngredientService/create:', message);

            return {
                message,
                statusCode: 400
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