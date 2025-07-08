import { CreateDishDto } from '../../../application/dtos';
import { DishIngredientWithoutImage } from '../../../../ingredient/ingredient.types';
import { Language } from '../../../../../common/types';
import { DishType, MealType } from '../../../../../common/enums';

export class CreateDishVo {

    private constructor(
        public readonly description: string,
        public readonly imageUrl: string,
        public readonly ingredients: DishIngredientWithoutImage[],
        public readonly language: Language,
        public readonly readyInMinutes: number,
        public readonly title: string,
        public readonly dishType: DishType,
        public readonly mealType: MealType
    ) {}

    static fromCreateDishDto(dto: CreateDishDto<DishIngredientWithoutImage>): CreateDishVo {
        return new CreateDishVo(
            dto.description,
            dto.imageUrl,
            dto.ingredients,
            dto.language,
            dto.readyInMinutes,
            dto.title,
            dto.dishType,
            dto.mealType
        );
    }
}