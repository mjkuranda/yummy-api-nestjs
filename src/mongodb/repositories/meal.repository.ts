import { AbstractRepository } from './abstract.repository';
import { MealDocument } from '../documents/meal.document';
import { InjectModel } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { Model } from 'mongoose';
import { CreateMealWithAuthorDto } from '../../modules/meal/meal.dto';
import { MealIngredient } from '../../modules/ingredient/ingredient.types';
import { RatedMeal } from '../../modules/meal/meal.types';
import { calculateRelevance } from '../../common/helpers';

export class MealRepository extends AbstractRepository<MealDocument, CreateMealWithAuthorDto<MealIngredient> | { softAdded: boolean }> {

    constructor(@InjectModel(models.MEAL_MODEL) model: Model<MealDocument>) {
        super(model);
    }

    async getMeals(providedIngredients: string[]): Promise<RatedMeal[]> {
        const meals = await this.findAll({ 'ingredients.name': { $in: providedIngredients }});

        return meals.map(meal => {
            const { id, title, imageUrl, type, ingredients, provider } = meal;
            const mealIngredients = ingredients.map(ingredient => ingredient.name);
            const relevance = calculateRelevance(providedIngredients, mealIngredients);

            return { id, title, imgUrl: imageUrl, type, ingredients: mealIngredients, provider, relevance };
        });
    }
}