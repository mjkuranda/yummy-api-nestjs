import { TranslatedIngredient } from '../../../../translation/translation.types';

export class TranslatedDishValueObject {

    constructor(
        public readonly description: string,
        public readonly translatedIngredients: TranslatedIngredient[]
    ) {}

}