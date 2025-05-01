import { AbstractRepository } from './abstract.repository';
import { RecipeDocument } from '../documents/recipe.document';
import { CreateRecipeDto } from '../../modules/recipe/recipe.dto';
import { InjectModel } from '@nestjs/mongoose';
import { models } from '../../constants/models.constant';
import { Model } from 'mongoose';
import { Language } from '../../common/types';

export class RecipeRepository extends AbstractRepository<RecipeDocument, CreateRecipeDto> {

    constructor(@InjectModel(models.RECIPE_MODEL) model: Model<RecipeDocument>) {
        super(model);
    }

    async findByDishId(dishId: string, language: Language = 'pl'): Promise<RecipeDocument | null> {
        return this.model.findOne({ dishId, language });
    }
}