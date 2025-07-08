import { Inject, Injectable } from '@nestjs/common';
import { RecipeDataManageable } from '../../../data-manageable.interface';
import { RecipeRepository } from '../../../../recipe/domain/recipe.repository';
import { REPOSITORIES_TOKEN } from '../../../../../constants/nestjs.contant';
import { Language, RepositoryMap } from '../../../../../common/types';
import { Repository } from '../../../../../common/enums';
import { CreateRecipeDto } from '../../../../recipe/application/dtos';
import { RecipeEntity } from '../../../../recipe/domain/entities';
import { DishId } from '../../../../../common/types';

@Injectable()
export class RecipeApiService implements RecipeDataManageable {

    private readonly recipeRepository: RecipeRepository;

    constructor(
        @Inject(REPOSITORIES_TOKEN)
        private readonly repositoryMap: RepositoryMap
    ) {
        this.recipeRepository = this.repositoryMap[Repository.RECIPE_REPOSITORY];
    }

    async createRecipe(createRecipeDto: CreateRecipeDto): Promise<RecipeEntity> {
        return await this.recipeRepository.createRecipe(createRecipeDto);
    }

    async findRecipeByDishId(dishId: DishId, language?: Language): Promise<RecipeEntity> {
        return await this.recipeRepository.findRecipeByDishId(dishId, language);
    }

}