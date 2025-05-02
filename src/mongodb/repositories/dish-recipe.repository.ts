import { AbstractRepository } from './abstract.repository';
import { DishRecipeDocument } from '../documents/dish-recipe-document';
import { CreateRecipeDto } from '../../modules/recipe/recipe.dto';
import { InjectModel } from '@nestjs/mongoose';
import { dishRecipeModel } from '../../common/definitions/mongoose-model.definitions';
import { Model } from 'mongoose';
import { Language } from '../../common/types';

export class DishRecipeRepository extends AbstractRepository<DishRecipeDocument, CreateRecipeDto> {

    constructor(@InjectModel(dishRecipeModel.name) model: Model<DishRecipeDocument>) {
        super(model);
    }

    async findByDishId(dishId: string, language: Language = 'pl'): Promise<DishRecipeDocument | null> {
        return this.model.findOne({ dishId, language });
    }
}