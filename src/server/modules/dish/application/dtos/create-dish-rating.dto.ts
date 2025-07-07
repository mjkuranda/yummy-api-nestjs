import { IsNotEmpty, Max, Min } from 'class-validator';

export class CreateDishRatingDto {
    @IsNotEmpty({ message: 'Dish rating should have a posted time' })
    @Min(0)
    @Max(10)
    readonly rating: number;
}