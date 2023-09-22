import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional, Length, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UserDto } from '../user/user.dto';

export class CreateMealDto {
    @IsNotEmpty({ message: 'Meal should have an author' })
    @Length(3, 16)
    readonly author: string;

    @IsNotEmpty({ message: 'Meal should have a description' })
    @Length(3, 256)
    readonly description: string;

    @IsOptional()
    @Length(3, 16)
    readonly imageUrl: string;

    @IsArray()
    @ArrayMinSize(1)
    readonly ingredients: string[];

    @IsNotEmpty({ message: 'Meal should have a posted time' })
    readonly posted: number;

    @IsNotEmpty({ message: 'Meal should have a title' })
    @Length(3, 16)
    readonly title: string;

    @IsNotEmpty({ message: 'Meal should have a type' })
    @Length(3, 16)
    readonly type: string;
}

export class CreateMealBodyDto {
    @Type(() => CreateMealDto)
    @ValidateNested({ each: true })
    readonly data: CreateMealDto;

    @Type(() => UserDto)
    @ValidateNested({ each: true })
    readonly authenticatedUser: UserDto;
}

export class MealEditDto {
    readonly description?: string;
    readonly imageUrl?: string;
    readonly ingredients?: string[];
}

export class EditMealBodyDto {
    @Type(() => MealEditDto)
    @ValidateNested({ each: true })
    readonly data: MealEditDto;

    @Type(() => UserDto)
    @ValidateNested({ each: true })
    readonly authenticatedUser: UserDto;
}