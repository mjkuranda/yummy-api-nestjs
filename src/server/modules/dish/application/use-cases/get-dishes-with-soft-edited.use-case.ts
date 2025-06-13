import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { DishReadService } from '../../domain/read/dish-read.service';
import { Injectable } from '@nestjs/common';
import { ContextString } from '../../../../common/types';
import { GetDishesDto } from '../dtos';
import { DishDtoMapper } from '../mappers';

@Injectable()
export class GetDishesWithSoftEditedUseCase extends AbstractUseCase<[], GetDishesDto> {

    constructor(private readonly dishReadService: DishReadService) {
        super();
    }

    protected async run(): Promise<GetDishesDto> {
        const dishes = await this.dishReadService.getDishesWithSoftEdited();

        return DishDtoMapper.toGetDishesDto(dishes);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected handleError(error: unknown, context: ContextString): never {
        throw error;
    }

    protected get context(): ContextString {
        return 'GetDishesWithSoftEditedUseCase/run';
    }
}