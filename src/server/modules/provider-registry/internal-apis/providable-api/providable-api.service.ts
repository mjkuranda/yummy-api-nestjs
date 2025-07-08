import { Inject, Injectable } from '@nestjs/common';
import { Providable } from '../../../../common/interfaces';
import { Language, RepositoryMap } from '../../../../common/types';
import { MealType, Provider, Repository } from '../../../../common/enums';
import { RecipeEntity } from '../../../recipe/domain/entities';
import { DishRepository } from '../../../dish/domain/dish.repository';
import { RecipeRepository } from '../../../recipe/domain/recipe.repository';
import { EncodedDishIdVo } from '../../../dish/domain/common/vos';
import { DishDetailsVo, DishResultVo } from '../../../dish/domain/read/vos';
import { REPOSITORIES_TOKEN } from '../../../../constants/nestjs.contant';

@Injectable()
export class ProvidableApiService implements Providable {

    private readonly dishRepository: DishRepository;
    private readonly recipeRepository: RecipeRepository;

    constructor(
        @Inject(REPOSITORIES_TOKEN)
        private readonly repositoryMap: RepositoryMap
    ) {
        this.dishRepository = this.repositoryMap[Repository.DISH_REPOSITORY];
        this.recipeRepository = this.repositoryMap[Repository.RECIPE_REPOSITORY];
    }

    async getDishDetails(encodedDishId: EncodedDishIdVo): Promise<DishDetailsVo | null> {
        const dishId = encodedDishId.getDishId();
        const dish = await this.dishRepository.findByDishId(dishId);

        if (!dish) {
            return null;
        }

        return DishDetailsVo.fromEntity(dish);
    }

    async getDishRecipe(encodedDishId: EncodedDishIdVo, language?: Language): Promise<RecipeEntity | null> {
        const dishId = encodedDishId.getDishId();

        return await this.recipeRepository.findRecipeByDishId(dishId, language);
    }

    async getDishes(providedIngredients: string[], mealType?: MealType): Promise<DishResultVo[]> {
        return await this.dishRepository.findDishesByIngredientsAndType(providedIngredients, mealType);
    }

    // TODO: Specific language. Getting dish and returning its language
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getLanguage(encodedDishId: EncodedDishIdVo): Language {
        return 'pl';
    }

    getProvider(): Provider {
        return Provider.INT_DMT_USER;
    }

}