import { AbstractRepository } from './abstract.repository';
import { RecipeDocument } from '../documents/recipe.document';
import { CreateRecipeDto } from '../../modules/recipe/recipe.dto';
import { InjectModel } from '@nestjs/mongoose';
import { dishRecipeModel } from '../../common/definitions/mongoose-model.definitions';
import { Model } from 'mongoose';
import { Language } from '../../common/types';

export class DishRecipeRepository extends AbstractRepository<RecipeDocument, CreateRecipeDto> {

    constructor(@InjectModel(dishRecipeModel.name) model: Model<RecipeDocument>) {
        super(model);
    }

    async findByDishId(dishId: string, language: Language = 'pl'): Promise<RecipeDocument | null> {
        return this.model.findOne({ dishId, language });
    }
}