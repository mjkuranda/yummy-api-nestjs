import { DishIngredient } from '../../../../ingredient/ingredient.types';
import { Language } from '../../../../../common/types';
import { DishType, MealType, Provider } from '../../../../../common/enums';
import { DishEntity } from '../../common/entities';

export class DishDetailsVo {

    constructor(
        public readonly title: string,
        public readonly description: string,
        public readonly ingredients: DishIngredient[],
        public readonly readyInMinutes: number,
        public readonly author: string,
        public readonly language: Language,
        public readonly provider: Provider,
        public readonly dishType: DishType,
        public readonly mealType: MealType,
        public readonly softAdded: boolean,
        public readonly softDeleted: boolean,
        public readonly imgUrl?: string,
        public readonly properties?: {
            vegetarian?: boolean;
            vegan?: boolean;
            glutenFree?: boolean;
            dairyFree?: boolean;
            veryHealthy?: boolean;
        }
    ) {}

    static fromEntity(entity: DishEntity): DishDetailsVo {
        return new DishDetailsVo(
            entity.getTitle(),
            entity.getDescription(),
            entity.getIngredients(),
            entity.getReadyInMinutes(),
            entity.getAuthor(),
            entity.getLanguage(),
            entity.getProvider(),
            entity.getDishType(),
            entity.getMealType(),
            entity.isSoftAdded(),
            entity.isSoftDeleted(),
            entity.getImageUrl(),
            entity.getProperties()
        );
    }
}