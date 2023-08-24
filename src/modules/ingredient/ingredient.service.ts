import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {models} from '../../constants/models.constant';
import {Model} from 'mongoose';
import {IngredientDocument} from './ingredient.interface';
import {CreateIngredientDto} from './ingredient.dto';

@Injectable()
export class IngredientService {
    constructor(
        @InjectModel(models.INGREDIENT_MODEL)
        private ingredientModel: Model<IngredientDocument>,
    ) {}

    async findAll(): Promise<CreateIngredientDto[]> {
        const ingredients = (await this.ingredientModel.find()) as IngredientDocument[];

        console.info(`IngredientService/findAll: Found ${ingredients.length} meals.`);

        return ingredients;
    }

    async create(createIngredientDto: CreateIngredientDto) {

    }
}