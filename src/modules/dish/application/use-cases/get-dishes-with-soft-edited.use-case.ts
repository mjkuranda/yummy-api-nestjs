import { AbstractUseCase } from '../../../../common/classes/abstract.use-case';
import { DishDocument } from '../../../../mongodb/documents/dish.document';
import { DishReadService } from '../../read/dish-read.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetDishesWithSoftEditedUseCase extends AbstractUseCase<undefined, DishDocument[]> {

    constructor(private readonly dishReadService: DishReadService) {
        super();
    }

    async execute(): Promise<DishDocument[]> {
        return await this.dishReadService.getDishesWithSoftEdited();
    }
}