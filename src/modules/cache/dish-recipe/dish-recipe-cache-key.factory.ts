import { DishRecipeKey } from './dish-recipe-cache.types';
import { EncodedDishId, Language } from '../../../common/types';

export class DishRecipeCacheKeyFactory {

    static createDishRecipeKey(encodedDishId: EncodedDishId, language: Language): DishRecipeKey {
        return `recipe:dish:${encodedDishId}:${language}`;
    }

}