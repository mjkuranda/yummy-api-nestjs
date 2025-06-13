import * as crypto from 'crypto';
import { DishDetailedKey, DishSearchResultKey, DishSearchResultPerProviderKey } from './dish-cache.types';
import { Providable } from '../../../common/interfaces';
import { EncodedDishIdValueObject } from '../../dish/domain/common/value-objects';

export class DishCacheKeyFactory {

    static createDishSearchResultKey(ingredients: string[]): DishSearchResultKey {
        const sorted = ingredients.map(i => i.toLowerCase().trim()).sort();
        const hash = crypto.createHash('sha256').update(sorted.join(',')).digest('hex').slice(0, 16);

        return `dish:results:ingredients:${hash}`;
    }

    static createDishSearchResultPerProviderKey(provider: Providable): DishSearchResultPerProviderKey {
        const providerName = provider.getProvider();

        return `dish:results:provider:${providerName}`;
    }

    static createDishDetailedResultKey(encodedDishId: EncodedDishIdValueObject): DishDetailedKey {
        return `dish:detailed:${encodedDishId}`;
    }
}