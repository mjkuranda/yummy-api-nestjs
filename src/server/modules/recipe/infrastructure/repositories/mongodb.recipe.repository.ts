import { RecipeRepository } from '../../domain/recipe.repository';
import { DishId } from '../../../dish/dish.types';
import { Language } from '../../../../common/types';
import { RecipeEntity } from '../../domain/entities';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { DishRecipeDocument } from '../../../../../infrastructure/databases/mongodb/documents';
import { dishRecipeModel } from '../../../../common/definitions/mongoose-model.definitions';
import { InvalidMongooseIdTypeError, InvalidMongooseObjectIdError } from '../../../../common/errors';
import { Injectable } from '@nestjs/common';
import { CreateRecipeDto } from '../../application/dtos';

@Injectable()
export class MongodbRecipeRepository implements RecipeRepository {

    constructor(
        @InjectModel(dishRecipeModel.name)
        private readonly model: Model<DishRecipeDocument>
    ) {}

    async createRecipe(createRecipeDto: CreateRecipeDto): Promise<RecipeEntity> {
        const { language, dishId, sections } = createRecipeDto;

        await this.model.create();

        return new RecipeEntity(language, dishId, sections);
    }

    async findRecipeByDishId(dishId: DishId, language: Language = 'pl'): Promise<RecipeEntity | never> {
        if (typeof dishId !== 'string') {
            throw new InvalidMongooseIdTypeError(dishId);
        }

        if (!isValidObjectId(dishId)) {
            throw new InvalidMongooseObjectIdError(dishId);
        }

        const document = await this.model.findOne({ dishId, language });

        return new RecipeEntity(
            document.language,
            document.dishId,
            document.sections
        );
    }

}