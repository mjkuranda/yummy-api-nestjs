import { GetRecipeDto } from './dtos';
import { RecipeEntity } from '../domain/entities';
import { EncodedDishIdVo } from '../../dish/domain/common/vos';

export class RecipeDtoMapper {

    static toGetRecipeDto(encodedDishIdVo: EncodedDishIdVo, entity: RecipeEntity): GetRecipeDto {
        return new GetRecipeDto(
            encodedDishIdVo.getValue(),
            entity.language,
            entity.sections
        );
    }
}