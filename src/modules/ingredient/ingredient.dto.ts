import {IsMongoId, IsNotEmpty, Length} from 'class-validator';
import mongoose from 'mongoose';

export class IngredientDto {
    @IsMongoId()
    readonly _id: mongoose.Types.ObjectId;

    @IsNotEmpty({ message: 'Ingredient should have a name' })
    @Length(3, 16)
    readonly name: string;

    @IsNotEmpty({ message: 'Ingredient should have any category' })
    readonly category: string;
}

export class CreateIngredientDto {
    @IsNotEmpty({ message: 'Ingredient should have a name' })
    @Length(3, 16)
    readonly name: string;

    @IsNotEmpty({ message: 'Ingredient should have any category' })
    readonly category: string; // TODO: Category type
}