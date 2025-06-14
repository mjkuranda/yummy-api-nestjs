import { Inject, Injectable } from '@nestjs/common';
import { Provider } from '../../common/enums';
import { Providable } from '../../common/interfaces';
import { ProviderMap, RepositoryMap } from '../../common/types';
import { PROVIDERS, REPOSITORIES } from '../../constants/nestjs.contant';
import { ProviderNotRegisteredError } from '../../errors/domain';
import { DishRepository } from '../dish/domain/dish.repository';
import { RecipeRepository } from '../recipe/domain/recipe.repository';
import {
    DishCommentRepository,
    DishRatingRepository,
    UserSearchQueryRepository
} from '../dish/domain/common/repositories';
import { UserActionRepository, UserRepository } from '../user/domain/repositories';

@Injectable()
export class ProviderRegistryService {
    constructor(
        @Inject(PROVIDERS)
        private readonly providersMap: ProviderMap,
        @Inject(REPOSITORIES)
        private readonly repositoryMap: RepositoryMap
    ) {}

    getDishRepository(): DishRepository | null {
        return this.repositoryMap.dish_repository;
    }

    getDishCommentRepository(): DishCommentRepository | null {
        return this.repositoryMap.dish_comment_repository;
    }

    getDishRatingRepository(): DishRatingRepository | null {
        return this.repositoryMap.dish_rating_repository;
    }

    getRecipeRepository(): RecipeRepository | null {
        return this.repositoryMap.recipe_repository;
    }

    getUserRepository(): UserRepository | null {
        return this.repositoryMap.user_repository;
    }

    getUserActionRepository(): UserActionRepository | null {
        return this.repositoryMap.user_action_repository;
    }

    getUserSearchQueryRepository(): UserSearchQueryRepository | null {
        return this.repositoryMap.user_search_query_repository;
    }

    getProvider(provider: Provider): Providable | never {
        const providable = this.providersMap[provider];

        if (!providable) {
            throw new ProviderNotRegisteredError(provider);
        }

        return providable;
    }

    getAllProviders(): Providable[] {
        return Object.values(this.providersMap);
    }

    getExternalProviders(): Providable[] {
        const providers = Object.values(this.providersMap);

        return providers.filter(provider => provider.getProvider().startsWith('ext'));
    }

    getSelectedProviders(providers: Provider[]): Providable[] {
        return providers
            .map(key => this.providersMap[key])
            .filter((p): p is Providable => Boolean(p));
    }

    hasProvider(provider: Provider): boolean {
        return Boolean(this.providersMap[provider]);
    }
}