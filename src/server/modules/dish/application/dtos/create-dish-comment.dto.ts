import { IsNotEmpty, Length } from 'class-validator';

export class CreateDishCommentDto {
    @IsNotEmpty({ message: 'Dish comment should have a posted time' })
    @Length(4, 64)
    readonly text: string;
}