import { Injectable } from '@nestjs/common';
import { Providable } from '../common/interfaces';
import { DishRepository } from '../mongodb/repositories/dish.repository';
import { DishRecipeRepository } from '../mongodb/repositories/dish-recipe.repository';
import { Language } from '../common/types';
import { DishDetailsWithMetadata } from '../modules/dish/domain/read/dish-read.types';
import { MealType, Provider } from '../common/enums';
import { RatedDish } from '../modules/dish/dish.types';
import { proceedDishDocumentToDishDetails } from '../modules/dish/dish.utils';
import { EncodedDishId } from '../modules/dish/domain/common/encoded-dish-id.value-object';
import { Recipe } from '../modules/recipe/domain/entities';

@Injectable()
export class DishMatcherApiService implements Providable {

    constructor(
        private readonly dishRepository: DishRepository,
        private readonly dishRecipeRepository: DishRecipeRepository
    ) {}

    async getDishDetails(encodedDishId: EncodedDishId): Promise<DishDetailsWithMetadata | null> {
        const dishId = encodedDishId.getDishId();
        const dishDocument = await this.dishRepository.findById(dishId);

        if (!dishDocument) {
            return null;
        }

        const dishDetails = proceedDishDocumentToDishDetails(dishDocument);

        return {
            dishDetails,
            metadata: {
                softAdded: dishDocument.softAdded,
                softDeleted: dishDocument.softDeleted
            }
        };
    }

    async getDishRecipe(encodedDishId: EncodedDishId, language?: Language): Promise<Recipe | null> {
        const dishId = encodedDishId.getDishId();

        return await this.dishRecipeRepository.findByDishId(dishId, language);
    }

    async getDishes(providedIngredients: string[], mealType?: MealType): Promise<RatedDish[]> {
        return await this.dishRepository.getDishes(providedIngredients, mealType);
    }

    // TODO: Specific language. Getting dish and returning its language
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getLanguage(encodedDishId: EncodedDishId): Language {
        return 'pl';
    }

    getProvider(): Provider {
        return Provider.INT_DMT_USER;
    }

}