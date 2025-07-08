import { TranslatedIngredient } from '../../../../translation/translation.types';

export class TranslatedDishVo {

    constructor(
        public readonly description: string,
        public readonly translatedIngredients: TranslatedIngredient[]
    ) {}

}