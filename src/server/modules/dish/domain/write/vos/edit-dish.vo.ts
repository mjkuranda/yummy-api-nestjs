import { EditDishDto } from '../../../application/dtos';
import { DishIngredient } from '../../../../ingredient/ingredient.types';
import { DishType, MealType } from '../../../../../common/enums';
import { DishRecipeSection } from '../../../dish.types';

export class EditDishVo {

    private constructor(
        public readonly title?: string,
        public readonly description?: string,
        public readonly mealType?: MealType,
        public readonly dishType?: DishType,
        public readonly ingredients?: DishIngredient[],
        public readonly readyInMinutes?: number,
        public readonly recipeSections?: DishRecipeSection[],
        public readonly imageUrl?: string
    ) {}

    static fromEditDishDto(editDishDto: EditDishDto<DishIngredient>): EditDishVo {
        return new EditDishVo(
            editDishDto.title,
            editDishDto.description,
            editDishDto.mealType,
            editDishDto.dishType,
            editDishDto.ingredients,
            editDishDto.readyInMinutes,
            editDishDto.recipeSections,
            editDishDto.imageUrl
        );
    }
}