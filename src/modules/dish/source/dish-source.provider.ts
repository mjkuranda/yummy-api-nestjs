import { Provider } from '@nestjs/common';
import { DishProvider } from '../../../common/enums';
import { DishProviderMap } from '../../../common/types';
import { DISH_PROVIDERS } from '../../../constants/nestjs.contant';
import { DishRepository } from '../../../mongodb/repositories/dish.repository';
import { SpoonacularApiService } from '../../api/spoonacular/spoonacular.api.service';

export const dishProviders: Provider[] = [
    DishRepository,
    SpoonacularApiService,
    {
        provide: DISH_PROVIDERS,
        useFactory: (
            dishRepository: DishRepository,
            spoonacularApiService: SpoonacularApiService
        ): DishProviderMap => ({
            [DishProvider.INT_DMT_USER]: dishRepository,
            [DishProvider.EXT_API_SPOONACULAR]: spoonacularApiService
        }),
        inject: [
            DishRepository,
            SpoonacularApiService
        ]
    }
];