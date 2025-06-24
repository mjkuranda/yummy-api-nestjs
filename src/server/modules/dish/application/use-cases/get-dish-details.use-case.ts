import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { ContextString, Language } from '../../../../common/types';
import { DishReadService } from '../../domain/read/dish-read.service';
import { TranslationService } from '../../../translation/translation.service';
import { LoggerService } from '../../../logger/logger.service';
import { DishNotFoundError, InvalidDishIdError } from '../../domain/errors';
import { NotFoundException, BadRequestException } from '../../../../exceptions';
import { Injectable } from '@nestjs/common';
import { EncodedDishIdValueObject } from '../../domain/common/value-objects';
import { GetDishDetailsDto } from '../dtos';
import { DishDtoMapper } from '../mappers';

@Injectable()
export class GetDishDetailsUseCase extends AbstractUseCase<[EncodedDishIdValueObject, Language], GetDishDetailsDto> {

    constructor(
        private readonly dishReadService: DishReadService,
        private readonly translationService: TranslationService,
        private readonly loggerService: LoggerService
    ) {
        super();
    }

    protected async run(encodedDishId: EncodedDishIdValueObject, language: Language): Promise<GetDishDetailsDto> {
        const { dishDetailsVo, fromCache } = await this.dishReadService.getDishDetails(encodedDishId);
        // TODO: Translation should be done within the service
        const translated = await this.translationService.translateDish(dishDetailsVo, language);

        this.loggerService.info(this.context, `Dish with "${encodedDishId}" ID loaded from ${fromCache ? 'cache' : 'provider and cached'}.`);

        return DishDtoMapper.toGetDishDetailsDto(dishDetailsVo, translated, language);
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
