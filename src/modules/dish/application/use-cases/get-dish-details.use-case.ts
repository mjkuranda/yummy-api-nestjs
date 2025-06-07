import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString, Language } from '../../../../common/types';
import { DetailedDishWithTranslations } from '../../dish.types';
import { DishReadService } from '../../read/dish-read.service';
import { TranslationService } from '../../../translation/translation.service';
import { LoggerService } from '../../../logger/logger.service';
import { DishNotFoundError, InvalidDishIdError } from '../../../../errors/domain';
import { NotFoundException } from '../../../../exceptions/not-found.exception';
import { BadRequestException } from '../../../../exceptions/bad-request.exception';
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

    async execute(encodedDishId: EncodedDishId, language: Language): Promise<DetailedDishWithTranslations> {
        const context: ContextString = 'GetDishDetailsUseCase/execute';

        try {
            const { dish, fromCache } = await this.dishReadService.getDishDetails(encodedDishId);
            const translated = await this.translationService.translateDish(dish, language);

            this.loggerService.info(context, `Dish with "${encodedDishId}" ID loaded from ${fromCache ? 'cache' : 'provider and cached'}.`);

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
        } catch (error) {
            if (error instanceof DishNotFoundError) {
                throw new NotFoundException(context, `Dish "${encodedDishId}" not found`);
            }

            if (error instanceof InvalidDishIdError) {
                throw new BadRequestException(context, `Invalid dish ID "${encodedDishId}"`);
            }
        }
    }
}
