import { GetDishRatingDto } from '../dtos';
import { DishRatingVo } from '../../domain/read/vos';

export class DishRatingDtoMapper {

    static toGetDishRatingDto(dishRatingVo: DishRatingVo): GetDishRatingDto {
        return new GetDishRatingDto(
            dishRatingVo.averageRating,
            dishRatingVo.ratingNumber
        );
    }
}