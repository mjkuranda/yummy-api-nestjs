import { DishRecipeKey } from './dish-recipe-cache.types';
import { Language } from '../../../../common/types';
import { EncodedDishIdVo } from '../../../dish/domain/common/vos';

export class DishRecipeCacheKeyFactory {

    static createDishRecipeKey(encodedDishId: EncodedDishIdVo, language: Language): DishRecipeKey {
        return `recipe:dish:${encodedDishId.getValue()}:${language}`;
    }

}