import {
    ArrayMinSize,
    IsArray, IsIn,
    IsNotEmpty,
    IsOptional,
    Length,
    Max,
    Min,
    ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserDto } from '../user/user.dto';
import { DishProvider, DishRecipeSections } from './dish.types';
import { Language } from '../../common/types';
import { DishIngredientWithoutImage } from '../ingredient/ingredient.types';
import { MealType, DishType } from '../../common/enums';

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
    readonly provider: DishProvider;

    @IsNotEmpty({ message: 'Dish should have a time preparation defined' })
    @Min(1, { message: 'Preparation time must last at least 1 minute' })
    readonly readyInMinutes: number;

    @IsNotEmpty({ message: 'Dish should have a title' })
    @Length(3, 64)
    readonly title: string;

    @IsNotEmpty({ message: 'Dish should have a dish type' })
    @IsIn(Object.values(DishType), { message: `The following dish types are allowed: ${Object.values(DishType).join(', ')}` })
    @Length(3, 16)
    readonly type: DishType;

    @IsNotEmpty({ message: 'Dish should have a meal type' })
    @IsIn(Object.values(MealType), { message: `The following meal types are allowed: ${Object.values(MealType).join(', ')}` })
    @Length(3, 16)
    readonly mealType: MealType;
}

export class CreateDishWithAuthorDto<Ingredient> extends CreateDishDto<Ingredient> {
    @IsNotEmpty({ message: 'Dish should have an author' })
    @Length(3, 32)
    readonly author: string;
}

export class DishEditDto<Ingredient> {
    readonly title?: string;
    readonly description?: string;
    readonly type?: DishType;
    readonly mealType?: MealType;
    readonly ingredients?: Ingredient[];
    readonly readyInMinutes?: number;
    readonly recipeSections?: DishRecipeSections;
    readonly imageUrl?: string;
}

export class EditDishBodyDto {
    @Type(() => DishEditDto)
    @ValidateNested({ each: true })
    readonly data: DishEditDto<DishIngredientWithoutImage>;

    @Type(() => UserDto)
    @ValidateNested({ each: true })
    readonly authenticatedUser: UserDto;
}

export class CreateDishCommentBody {
    @IsNotEmpty({ message: 'Dish comment should have a reference to dish' })
    readonly dishId: string;

    @IsNotEmpty({ message: 'Dish comment should have a posted time' })
    @Length(4, 64)
    readonly text: string;
}

export class CreateDishCommentDto extends CreateDishCommentBody {
    @IsNotEmpty({ message: 'Dish comment should have an author of the comment' })
    readonly user: string;

    @IsNotEmpty({ message: 'Dish comment should have a posted date' })
    readonly posted: number;
}

export class CreateDishRatingBody {
    @IsNotEmpty({ message: 'Dish rating should have a reference to dish' })
    readonly dishId: string;

    @IsNotEmpty({ message: 'Dish rating should have a posted time' })
    @Min(0)
    @Max(10)
    readonly rating: number;
}

export class CreateDishRatingDto extends CreateDishRatingBody {
    @IsNotEmpty({ message: 'Dish rating should have an author of the comment' })
    readonly user: string;

    @IsNotEmpty({ message: 'Dish rating should have a posted date' })
    readonly posted: number;
}