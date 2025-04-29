import { AbstractRepository } from './abstract.repository';
import { RecipeDocument } from '../documents/recipe.document';
import { CreateRecipeDto } from '../../modules/recipe/recipe.dto';
import { InjectModel } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { Model } from 'mongoose';
import { DishDocument } from '../documents/dish.document';
import { DishRepository } from './dish.repository';

export class RecipeRepository extends AbstractRepository<RecipeDocument, CreateRecipeDto> {

    constructor(@InjectModel(models.RECIPE_MODEL) model: Model<RecipeDocument>,
                private readonly dishRepository: DishRepository) {
        super(model);
    }

    async findByDishId(dishId: string): Promise<DishDocument> {
        return this.dishRepository.findById(dishId);
    }
}