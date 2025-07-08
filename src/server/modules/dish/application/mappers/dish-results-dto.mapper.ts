import { DishResultVo } from '../../domain/read/vos';
import { DishResultDto, GetDishResultsDto } from '../dtos';

export class DishResultsDtoMapper {

    static toGetDishResultsDto(dishResultsVos: DishResultVo[]): GetDishResultsDto {
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