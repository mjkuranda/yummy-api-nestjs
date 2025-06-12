import { DishRecipeKey } from './dish-recipe-cache.types';
import { Language } from '../../../common/types';
import { EncodedDishId } from '../../dish/domain/common/encoded-dish-id.value-object';

export class DishRecipeCacheKeyFactory {

    static createDishRecipeKey(encodedDishId: EncodedDishId, language: Language): DishRecipeKey {
        return `recipe:dish:${encodedDishId.getValue()}:${language}`;
    }

}