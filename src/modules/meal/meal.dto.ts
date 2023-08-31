import { ArrayMinSize, IsArray, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class CreateMealDto {
    @IsNotEmpty({ message: 'Meal should have an author' })
    @Length(3, 16)
    readonly author: string;

    @IsNotEmpty({ message: 'Meal should have a description' })
    @Length(3, 16)
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