import { AbstractRepository } from './abstract.repository';
import { MealDocument } from '../documents/meal.document';
import { InjectModel } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { Model } from 'mongoose';
import { CreateMealWithAuthorDto } from '../../modules/meal/meal.dto';
import { IngredientData } from '../../modules/ingredient/ingredient.types';

export class MealRepository extends AbstractRepository<MealDocument, CreateMealWithAuthorDto<IngredientData> | { softAdded: boolean }> {

    constructor(@InjectModel(models.MEAL_MODEL) model: Model<MealDocument>) {
        super(model);
    }
}