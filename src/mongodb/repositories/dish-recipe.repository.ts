import { AbstractRepository } from './abstract.repository';
import { DishRecipeDocument } from '../documents/dish-recipe-document';
import { CreateRecipeDto } from '../../modules/recipe/recipe.dto';
import { InjectModel } from '@nestjs/mongoose';
import { dishRecipeModel } from '../../common/definitions/mongoose-model.definitions';
import { isValidObjectId, Model } from 'mongoose';
import { Language } from '../../common/types';
import { InvalidMongooseIdTypeError, InvalidMongooseObjectIdError } from '../../errors/infrastructure';
import { Recipe } from '../../modules/recipe/domain/entities';
import { DishId } from '../../modules/dish/dish.types';

export class DishRecipeRepository extends AbstractRepository<DishRecipeDocument, CreateRecipeDto> {

    constructor(@InjectModel(dishRecipeModel.name) model: Model<DishRecipeDocument>) {
        super(model);
    }

    async findByDishId(dishId: DishId, language: Language = 'pl'): Promise<Recipe | never> {
        if (typeof dishId !== 'string') {
            throw new InvalidMongooseIdTypeError(dishId);
        }

        if (!isValidObjectId(dishId)) {
            throw new InvalidMongooseObjectIdError(dishId);
        }

        const document = await this.model.findOne({ dishId, language });

        return new Recipe(
            document.language,
            document.dishId,
            document.sections
        );
    }
}