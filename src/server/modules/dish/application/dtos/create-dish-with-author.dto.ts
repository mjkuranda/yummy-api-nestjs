import { CreateDishDto } from './create-dish.dto';
import { IsNotEmpty, Length } from 'class-validator';

export class CreateDishWithAuthorDto<Ingredient> extends CreateDishDto<Ingredient> {
    @IsNotEmpty({ message: 'Dish should have an author' })
    @Length(3, 32)
    readonly author: string;
}