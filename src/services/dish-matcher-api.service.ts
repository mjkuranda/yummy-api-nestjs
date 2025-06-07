import { Injectable } from '@nestjs/common';
import { Providable } from '../common/interfaces';
import { DishRepository } from '../mongodb/repositories/dish.repository';
import { DishRecipeRepository } from '../mongodb/repositories/dish-recipe.repository';
import { EncodedDishId, Language } from '../common/types';
import { DishDetailsWithMetadata } from '../modules/dish/read/dish-read.types';
import { DishRecipe } from '../modules/recipe/application/recipe-application.types';
import { MealType, Provider } from '../common/enums';
import { RatedDish } from '../modules/dish/dish.types';
import { DishIdObfuscator } from '../common/helpers/dish-id-obfuscator.helper';
import { proceedDishDocumentToDishDetails } from '../modules/dish/dish.utils';

@Injectable()
export class DishMatcherApiService implements Providable {

    constructor(
        private readonly dishRepository: DishRepository,
        private readonly dishRecipeRepository: DishRecipeRepository
    ) {}

    async getDishDetails(encodedDishId: EncodedDishId): Promise<DishDetailsWithMetadata | null> {
        const { dishId } = DishIdObfuscator.decode(encodedDishId);

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

    async getDishRecipe(encodedDishId: EncodedDishId, language?: Language): Promise<DishRecipe | null> {
        const { dishId } = DishIdObfuscator.decode(encodedDishId);

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