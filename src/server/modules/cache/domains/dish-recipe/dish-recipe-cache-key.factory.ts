import { DishRecipeKey } from './dish-recipe-cache.types';
import { Language } from '../../../../common/types';
import { EncodedDishIdValueObject } from '../../../dish/domain/common/value-objects';

export class DishRecipeCacheKeyFactory {

    static createDishRecipeKey(encodedDishId: EncodedDishIdValueObject, language: Language): DishRecipeKey {
        return `recipe:dish:${encodedDishId.getValue()}:${language}`;
    }

}