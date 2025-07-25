import { DishEntity } from '../../domain/common/entities';
import { GetDishDto, GetDishesDto, GetDishDetailsDto, CreatedDishDto } from '../dtos';
import { DishDetailsVo } from '../../domain/read/vos';
import { Language } from '../../../../common/types';
import { TranslatedDishVo } from '../../domain/read/vos';

export class DishDtoMapper {

    static toCreatedDishDto(encodedDishId: string, entity: DishEntity): CreatedDishDto {
        return new CreatedDishDto(
            encodedDishId,
            entity.getTitle(),
            entity.getAuthor()
        );
    }

    static toGetDishDto(encodedDishId: string, entity: DishEntity): GetDishDto {
        return new GetDishDto(
            encodedDishId,
            entity.getTitle(),
            entity.getAuthor()
        );
    }

    static toGetDishesDto(encodedDishIds: string[], entities: DishEntity[]): GetDishesDto {
        const dishDtos = entities.map((entity, idx) => this.toGetDishDto(encodedDishIds[idx], entity));

        return new GetDishesDto(dishDtos);
    }

    static toGetDishDetailsDto(originalDish: DishDetailsVo, translatedDish: TranslatedDishVo, language: Language): GetDishDetailsDto {
        return new GetDishDetailsDto(
            originalDish.title,
            translatedDish.description,
            originalDish.readyInMinutes,
            language,
            originalDish.author,
            originalDish.provider,
            originalDish.dishType,
            originalDish.mealType,
            originalDish.imgUrl,
            translatedDish.translatedIngredients
        );
    }
}