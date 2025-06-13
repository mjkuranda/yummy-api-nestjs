import { EncodedDishIdValueObject } from '../../common/value-objects';
import { Language } from '../../../../../common/types';
import { DishType, MealType, Provider } from '../../../../../common/enums';
import { DishEntity } from '../../common/entities';

export class DishResultValueObject {

    private constructor(
        public readonly encodedDishId: EncodedDishIdValueObject,
        public readonly title: string,
        public readonly ingredients: string[],
        public readonly language: Language,
        public readonly provider: Provider,
        public readonly dishType: DishType,
        public readonly mealType: MealType,
        public readonly relevance: number,
        public readonly missingIngredientCount: number,
        public readonly imgUrl?: string
    ) {}

    static fromDishEntity(entity: DishEntity, relevance: number, missingIngredientCount: number): DishResultValueObject {
        const ingredients = entity
            .getIngredients()
            .map(ingredient => ingredient.name);

        return new DishResultValueObject(
            entity.getEncodedDishId(),
            entity.getTitle(),
            ingredients,
            entity.getLanguage(),
            entity.getProvider(),
            entity.getDishType(),
            entity.getMealType(),
            relevance,
            missingIngredientCount,
            entity.getImageUrl()
        );
    }
}