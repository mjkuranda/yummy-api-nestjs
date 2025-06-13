import { Language } from '../../../../common/types';
import { DishType, MealType, Provider } from '../../../../common/enums';
import { TranslatedIngredient } from '../../../translation/translation.types';

export class GetDishDetailsDto {

    constructor(
        public readonly title: string,
        public readonly description: string,
        public readonly readyInMinutes: number,
        public readonly language: Language,
        public readonly author: string,
        public readonly provider: Provider,
        public readonly type: DishType,
        public readonly mealType: MealType,
        public readonly imgUrl: string,
        public readonly ingredients: TranslatedIngredient[]
    ) {}
}