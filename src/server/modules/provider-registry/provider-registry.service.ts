import { Injectable } from '@nestjs/common';
import { Provider } from '../../common/enums';
import { Providable } from '../../common/interfaces';
import { ProviderMap } from '../../common/types';
import { SpoonacularApiService } from '../../../integrations/spoonacular-api/spoonacular-api.service';
import { ProvidableApiService } from './internal-apis/providable-api/providable-api.service';
import { DishDataManageable, RecipeDataManageable, UserDataManageable } from './data-manageable.interface';
import { DishApiService, RecipeApiService, UserApiService } from './internal-apis/manageable-api/services';
import { ProviderNotRegisteredError } from '../user/domain/errors';

@Injectable()
export class ProviderRegistryService {

    private readonly providersMap: ProviderMap;

    constructor(
        private readonly dishApiService: DishApiService,
        private readonly recipeApiService: RecipeApiService,
        private readonly userApiService: UserApiService,
        private readonly coreApiService: ProvidableApiService,
        private readonly spoonacularApiService: SpoonacularApiService,
    ) {
        this.providersMap = {
            [Provider.INT_DMT_USER]: this.coreApiService,
            [Provider.EXT_API_SPOONACULAR]: this.spoonacularApiService
        };
    }

    getDishApiService(): DishDataManageable {
        return this.dishApiService;
    }

    getRecipeApiService(): RecipeDataManageable {
        return this.recipeApiService;
    }

    getUserApiService(): UserDataManageable {
        return this.userApiService;
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