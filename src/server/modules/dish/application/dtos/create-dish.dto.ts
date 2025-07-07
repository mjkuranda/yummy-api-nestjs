import { ArrayMinSize, IsArray, IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { Language } from '../../../../common/types';
import { DishType, MealType, Provider } from '../../../../common/enums';

export class CreateDishDto<Ingredient> {
    @IsNotEmpty({ message: 'Dish should have a description' })
    @Length(3, 1024)
    readonly description: string;

    @IsOptional()
    @Length(3, 256)
    readonly imageUrl: string;

    @IsArray()
    @ArrayMinSize(1)
    readonly ingredients: Ingredient[];

    @IsNotEmpty({ message: 'Dish should have a language in which was defined' })
    readonly language: Language;

    @IsOptional()
    @IsNotEmpty({ message: 'Dish should have a posted time' })
    readonly posted: number;

    @IsNotEmpty({ message: 'Dish should have a provider name' })
    readonly provider: Provider;

    @IsNotEmpty({ message: 'Dish should have a time preparation defined' })
    @Min(1, { message: 'Preparation time must last at least 1 minute' })
    readonly readyInMinutes: number;

    @IsNotEmpty({ message: 'Dish should have a title' })
    @Length(3, 64)
    readonly title: string;

    @IsNotEmpty({ message: 'Dish should have a dish type' })
    @IsIn(Object.values(DishType), { message: `Dish type should be defined as a one of allowed types: ${Object.values(DishType).join(', ')}` })
    @Length(3, 16)
    readonly type: DishType;

    @IsNotEmpty({ message: 'Dish should have a meal type' })
    @IsIn(Object.values(MealType), { message: `Meal type should be defined as a one of allowed types: ${Object.values(MealType).join(', ')}` })
    @Length(3, 16)
    readonly mealType: MealType;

    get ingredientCount(): number {
        return this.ingredients.length;
    }
}