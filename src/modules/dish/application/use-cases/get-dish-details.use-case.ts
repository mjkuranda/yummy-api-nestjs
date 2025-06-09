import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString, Language } from '../../../../common/types';
import { DetailedDishWithTranslations } from '../../dish.types';
import { DishReadService } from '../../domain/read/dish-read.service';
import { TranslationService } from '../../../translation/translation.service';
import { LoggerService } from '../../../logger/logger.service';
import { DishNotFoundError, InvalidDishIdError } from '../../../../errors/domain';
import { NotFoundException, BadRequestException } from '../../../../exceptions';
import { Injectable } from '@nestjs/common';
import { EncodedDishId } from '../../encoded-dish-id.value-object';

@Injectable()
export class GetDishDetailsUseCase extends AbstractUseCase<[EncodedDishId, Language], DetailedDishWithTranslations> {

    constructor(
        private readonly dishReadService: DishReadService,
        private readonly translationService: TranslationService,
        private readonly loggerService: LoggerService
    ) {
        super();
    }

    protected async run(encodedDishId: EncodedDishId, language: Language): Promise<DetailedDishWithTranslations> {
        const { dish, fromCache } = await this.dishReadService.getDishDetails(encodedDishId);
        // TODO: Translation should be done within the service
        const translated = await this.translationService.translateDish(dish, language);

        this.loggerService.info(this.context, `Dish with "${encodedDishId}" ID loaded from ${fromCache ? 'cache' : 'provider and cached'}.`);

        // TODO: Consider entities
        return {
            ...dish,
            ...translated,
            language: {
                original: dish.language,
                translated: language
            },
            ingredients: {
                original: dish.ingredients,
                translated: translated.ingredients
            }
        };
    }

    protected handleError(error: unknown, context: ContextString): never {
        if (error instanceof DishNotFoundError) {
            throw new NotFoundException(context, error.message);
        }

        if (error instanceof InvalidDishIdError) {
            throw new BadRequestException(context, error.message);
        }

        throw new BadRequestException(context, 'Unknown error occurred');
    }

    protected get context(): ContextString {
        return 'GetDishDetailsUseCase/run';
    }
}
