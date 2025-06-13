import { GetRecipeDto } from './dtos';
import { RecipeEntity } from '../domain/entities';
import { EncodedDishIdValueObject } from '../../dish/domain/common/value-objects';

export class RecipeDtoMapper {

    static toGetRecipeDto(encodedDishIdVo: EncodedDishIdValueObject, entity: RecipeEntity): GetRecipeDto {
        return new GetRecipeDto(
            encodedDishIdVo.getValue(),
            entity.language,
            entity.sections
        );
    }
}