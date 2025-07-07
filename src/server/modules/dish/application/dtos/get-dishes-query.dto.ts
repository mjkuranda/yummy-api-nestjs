import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsArray, IsEnum, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { DishType, MealType } from '../../../../common/enums';

export class GetDishesQueryDto {
    @Transform(({ value }) => value && value.length > 0 ? value.split(',') : [])
    @IsArray()
    @ArrayMinSize(3, {
        message: 'Minimal amount of ingredients is 3'
    })
    @ArrayMaxSize(15, {
        message: 'Maximal amount of ingredients is 15'
    })
    @IsString({ each: true })
    readonly ings: string[];

    @IsOptional()
    @IsEnum(DishType, {
        message: ({ value }) =>
            `"${value}" is not a valid dishType. Allowed values: ${Object.values(DishType).join(', ')}`,
    })
    readonly dishType?: DishType;

    @IsOptional()
    @IsEnum(MealType, {
        message: ({ value }) =>
            `"${value}" is not a valid mealType. Allowed values: ${Object.values(MealType).join(', ')}`,
    })
    readonly mealType?: MealType;
}