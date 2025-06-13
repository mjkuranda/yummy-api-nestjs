import { DishResultValueObject } from '../../domain/read/value-objects';
import { DishResultDto, GetDishResultsDto } from '../dtos';

export class DishResultsDtoMapper {

    static toGetDishResultsDto(dishResultsVos: DishResultValueObject[]): GetDishResultsDto {
        const results: DishResultDto[] = dishResultsVos.map(result =>
            new DishResultDto(
                result.title,
                result.language,
                result.provider,
                result.relevance,
                result.missingIngredientCount,
                result.imgUrl
            )
        );

        return new GetDishResultsDto(results);
    }
}