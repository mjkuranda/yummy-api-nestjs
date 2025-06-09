import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { DishDocument } from '../../../../mongodb/documents/dish.document';
import { DishReadService } from '../../domain/read/dish-read.service';
import { Injectable } from '@nestjs/common';
import { ContextString } from '../../../../common/types';

@Injectable()
export class GetDishesWithSoftEditedUseCase extends AbstractUseCase<undefined, DishDocument[]> {

    constructor(private readonly dishReadService: DishReadService) {
        super();
    }

    protected async run(): Promise<DishDocument[]> {
        return await this.dishReadService.getDishesWithSoftEdited();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected handleError(error: unknown, context: ContextString): never {
        throw error;
    }

    protected get context(): ContextString {
        return 'GetDishesWithSoftEditedUseCase/run';
    }
}