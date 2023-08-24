import {IsNotEmpty, Length} from 'class-validator';

export class CreateIngredientDto {
    @IsNotEmpty({ message: 'Ingredient should have a name' })
    @Length(3, 16)
    readonly name: string;

    @IsNotEmpty({ message: 'Ingredient should have any category' })
    readonly category: string; // TODO: Category type
}