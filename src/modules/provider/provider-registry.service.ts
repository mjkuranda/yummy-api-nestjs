import { Inject, Injectable } from '@nestjs/common';
import { DishRepository } from '../../mongodb/repositories/dish.repository';
import { Provider } from '../../common/enums';
import { Providable } from '../../common/interfaces';
import { ProviderMap, RepositoryMap } from '../../common/types';
import { PROVIDERS, REPOSITORIES } from '../../constants/nestjs.contant';
import { DishRecipeRepository } from '../../mongodb/repositories/dish-recipe.repository';
import { ProviderNotRegisteredError } from '../../errors/domain';

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

    getRecipeRepository(): DishRecipeRepository | null {
        return this.repositoryMap.recipe_repository;
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