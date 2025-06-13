import { Injectable } from '@nestjs/common';
import { Providable } from '../common/interfaces';
import { Language } from '../common/types';
import { MealType, Provider } from '../common/enums';
import { RecipeEntity } from '../modules/recipe/domain/entities';
import { DishRepository } from '../modules/dish/domain/dish.repository';
import { RecipeRepository } from '../modules/recipe/domain/recipe.repository';
import { EncodedDishIdValueObject } from '../modules/dish/domain/common/value-objects';
import { DishDetailsValueObject, DishResultValueObject } from '../modules/dish/domain/read/value-objects';

@Injectable()
export class DishMatcherApiService implements Providable {

    constructor(
        private readonly dishRepository: DishRepository,
        private readonly recipeRepository: RecipeRepository
    ) {}

    async getDishDetails(encodedDishId: EncodedDishIdValueObject): Promise<DishDetailsValueObject | null> {
        const dishId = encodedDishId.getDishId();
        const dish = await this.dishRepository.findById(dishId);

        if (!dish) {
            return null;
        }

        return DishDetailsValueObject.fromEntity(dish);
    }

    async getDishRecipe(encodedDishId: EncodedDishIdValueObject, language?: Language): Promise<RecipeEntity | null> {
        const dishId = encodedDishId.getDishId();

        return await this.recipeRepository.findByDishId(dishId, language);
    }

    async getDishes(providedIngredients: string[], mealType?: MealType): Promise<DishResultValueObject[]> {
        return await this.dishRepository.findByIngredientsAndType(providedIngredients, mealType);
    }

    // TODO: Specific language. Getting dish and returning its language
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getLanguage(encodedDishId: EncodedDishIdValueObject): Language {
        return 'pl';
    }

    getProvider(): Provider {
        return Provider.INT_DMT_USER;
    }

}