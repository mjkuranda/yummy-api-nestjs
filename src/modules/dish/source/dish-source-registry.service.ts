import { Inject, Injectable } from '@nestjs/common';
import { DISH_PROVIDERS } from '../../../constants/nestjs.contant';
import { DishProvider as DishProviderEnum } from '../../../common/enums';
import { DishProviderMap } from '../../../common/types';
import { DishProvidable } from '../../../common/interfaces';
import { DishRepository } from '../../../mongodb/repositories/dish.repository';
import { isDishRepository } from '../../../common/guards';

@Injectable()
export class DishSourceRegistryService {
    constructor(
        @Inject(DISH_PROVIDERS)
        private readonly dishProvidersMap: DishProviderMap,
    ) {}

    getDishRepositoryProvider(): DishRepository | null {
        const dishRepository = this.dishProvidersMap.int_dmt_user;

        return isDishRepository(dishRepository) ? dishRepository : null;
    }

    getProvider(key: DishProviderEnum): DishProvidable | never {
        const provider = this.dishProvidersMap[key];

        if (!provider) {
            throw new Error(`Dish provider "${key}" is not registered`);
        }

        return provider;
    }

    getAllProviders(): DishProvidable[] {
        return Object.values(this.dishProvidersMap);
    }

    getExternalProviders(): DishProvidable[] {
        const providers = Object.values(this.dishProvidersMap);

        return providers.filter(provider => provider.getProvider().startsWith('ext'));
    }

    getSelectedProviders(keys: DishProviderEnum[]): DishProvidable[] {
        return keys
            .map(key => this.dishProvidersMap[key])
            .filter((p): p is DishProvidable => Boolean(p));
    }

    hasProvider(key: DishProviderEnum): boolean {
        return Boolean(this.dishProvidersMap[key]);
    }
}
