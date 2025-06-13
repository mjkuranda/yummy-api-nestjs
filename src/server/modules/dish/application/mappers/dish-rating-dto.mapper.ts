import { GetDishRatingDto } from '../dtos';
import { DishRatingValueObject } from '../../domain/read/value-objects';

export class DishRatingDtoMapper {

    static toGetDishRatingDto(dishRatingVo: DishRatingValueObject): GetDishRatingDto {
        return new GetDishRatingDto(
            dishRatingVo.averageRating,
            dishRatingVo.ratingNumber
        );
    }
}