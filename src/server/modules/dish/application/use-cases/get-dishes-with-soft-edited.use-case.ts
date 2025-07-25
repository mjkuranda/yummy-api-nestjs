import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { DishReadService } from '../../domain/read/services';
import { Injectable } from '@nestjs/common';
import { ContextString } from '../../../../common/types';
import { GetDishesDto } from '../dtos';
import { DishDtoMapper } from '../mappers';
import { DishTokenService } from '../../domain/common/services';

@Injectable()
export class GetDishesWithSoftEditedUseCase extends AbstractUseCase<[], GetDishesDto> {

    constructor(
        private readonly dishTokenService: DishTokenService,
        private readonly dishReadService: DishReadService
    ) {
        super();
    }

    protected async run(): Promise<GetDishesDto> {
        const dishes = await this.dishReadService.getDishesWithSoftEdited();
        const encodedDishIds = dishes.map(dish => this.dishTokenService.encode(dish.getProvider(), dish.getDishId()));

        return DishDtoMapper.toGetDishesDto(encodedDishIds, dishes);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected handleError(error: unknown, context: ContextString): never {
        throw error;
    }

    protected get context(): ContextString {
        return 'GetDishesWithSoftEditedUseCase/run';
    }
}